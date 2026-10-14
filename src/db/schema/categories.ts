import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("categories_id_user_unique").on(table.id, table.userId),
    uniqueIndex("categories_user_name_unique").on(
      table.userId,
      sql`lower(${table.name})`,
    ),
    check(
      "categories_name_valid",
      sql`length(trim(${table.name})) > 0 AND lower(trim(${table.name})) NOT IN ('all', 'tanpa kategori')`,
    ),
  ],
);
