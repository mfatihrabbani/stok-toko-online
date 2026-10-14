import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    sku: varchar("sku", { length: 80 }).default("").notNull(),
    category: varchar("category", { length: 80 })
      .default("Tanpa kategori")
      .notNull(),
    stock: integer("stock").default(0).notNull(),
    minStock: integer("min_stock").default(0).notNull(),
    unit: varchar("unit", { length: 30 }).default("unit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check("products_stock_nonnegative", sql`${table.stock} >= 0`),
    check("products_min_stock_nonnegative", sql`${table.minStock} >= 0`),
    check("products_name_nonempty", sql`length(trim(${table.name})) > 0`),
    index("products_user_name_idx").on(table.userId, table.name, table.id),
    unique("products_id_user_unique").on(table.id, table.userId),
    uniqueIndex("products_user_sku_unique")
      .on(table.userId, sql`lower(${table.sku})`)
      .where(sql`${table.sku} <> ''`),
  ],
);
