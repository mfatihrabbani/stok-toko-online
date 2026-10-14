import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/index.server";
import { categories } from "@/db/schema/categories";
import { products } from "@/db/schema/products";
import { InventoryError } from "@/lib/inventory-error";
const fields = { id: categories.id, name: categories.name };
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
const lock = (tx: Transaction, userId: string) =>
  tx.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${"categories:" + userId}, 0))`,
  );
function duplicate(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    (("code" in error && error.code === "23505") ||
      ("cause" in error && duplicate(error.cause))),
  );
}
export function listCategories(userId: string) {
  return db
    .select(fields)
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name), asc(categories.id));
}
export async function createCategory(userId: string, name: string) {
  try {
    return await db.transaction(async (tx) => {
      await lock(tx, userId);
      const [row] = await tx
        .insert(categories)
        .values({ userId, name })
        .returning(fields);
      return row;
    });
  } catch (error) {
    if (duplicate(error))
      throw new InventoryError(
        "CATEGORY_EXISTS",
        "Kategori dengan nama ini sudah ada.",
      );
    throw error;
  }
}
export async function renameCategory(userId: string, id: string, name: string) {
  try {
    return await db.transaction(async (tx) => {
      await lock(tx, userId);
      const [row] = await tx
        .update(categories)
        .set({ name })
        .where(and(eq(categories.id, id), eq(categories.userId, userId)))
        .returning(fields);
      if (!row)
        throw new InventoryError("NOT_FOUND", "Kategori tidak ditemukan.");
      await tx
        .update(products)
        .set({ category: name })
        .where(and(eq(products.categoryId, id), eq(products.userId, userId)));
      return row;
    });
  } catch (error) {
    if (duplicate(error))
      throw new InventoryError(
        "CATEGORY_EXISTS",
        "Kategori dengan nama ini sudah ada.",
      );
    throw error;
  }
}
export async function deleteCategory(userId: string, id: string) {
  return db.transaction(async (tx) => {
    await lock(tx, userId);
    const [row] = await tx
      .select(fields)
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    if (!row)
      throw new InventoryError("NOT_FOUND", "Kategori tidak ditemukan.");
    await tx
      .update(products)
      .set({ category: "Tanpa kategori", categoryId: null })
      .where(and(eq(products.categoryId, id), eq(products.userId, userId)));
    await tx
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  });
}
