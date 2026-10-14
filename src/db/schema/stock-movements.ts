import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { user } from "./user";

export const movementDirection = pgEnum("movement_direction", ["in", "out"]);
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),
    productName: varchar("product_name", { length: 160 }).notNull(),
    productSku: varchar("product_sku", { length: 80 }).default("").notNull(),
    direction: movementDirection("direction").notNull(),
    quantity: integer("quantity").notNull(),
    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),
    note: varchar("note", { length: 300 }).default("").notNull(),
    requestId: uuid("request_id").defaultRandom().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId, table.userId],
      foreignColumns: [products.id, products.userId],
      name: "movements_owned_product_fk",
    }).onDelete("restrict"),
    check("movements_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "movements_stock_nonnegative",
      sql`${table.stockBefore} >= 0 AND ${table.stockAfter} >= 0`,
    ),
    check(
      "movements_balance_valid",
      sql`(${table.direction} = 'in' AND ${table.stockAfter}::bigint = ${table.stockBefore}::bigint + ${table.quantity}::bigint) OR (${table.direction} = 'out' AND ${table.stockAfter}::bigint = ${table.stockBefore}::bigint - ${table.quantity}::bigint)`,
    ),
    unique("movements_user_request_unique").on(table.userId, table.requestId),
    index("movements_user_created_idx").on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index("movements_product_created_idx").on(
      table.productId,
      table.userId,
      table.createdAt.desc(),
    ),
  ],
);
