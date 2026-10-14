import { asc, eq } from "drizzle-orm";
import { db } from "@/db/index.server";
import { products } from "@/db/schema/products";
import type { ListProductsInput } from "@/validators/inventory";

export const productFields = {
  id: products.id,
  name: products.name,
  sku: products.sku,
  category: products.category,
  stock: products.stock,
  minStock: products.minStock,
  unit: products.unit,
  updatedAt: products.updatedAt,
};

export async function listProducts(
  userId: string,
  { limit, offset }: ListProductsInput,
) {
  const rows = await db
    .select(productFields)
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(asc(products.name), asc(products.id))
    .limit(limit + 1)
    .offset(offset);
  return {
    data: rows
      .slice(0, limit)
      .map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() })),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}
