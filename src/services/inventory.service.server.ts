import { and, asc, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import { db } from "@/db/index.server";
import { products } from "@/db/schema/products";
import { stockMovements } from "@/db/schema/stock-movements";
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

export async function getInventory(userId: string) {
  const rows = await db
    .select(productFields)
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(asc(products.name), asc(products.id));
  return rows.map((row) => ({
    ...row,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getProduct(userId: string, id: string) {
  const [product] = await db
    .select(productFields)
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
    .limit(1);
  if (!product) return null;
  const movements = await db
    .select({
      id: stockMovements.id,
      direction: stockMovements.direction,
      quantity: stockMovements.quantity,
      note: stockMovements.note,
      stockBefore: stockMovements.stockBefore,
      stockAfter: stockMovements.stockAfter,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .where(
      and(eq(stockMovements.productId, id), eq(stockMovements.userId, userId)),
    )
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
    .limit(20);
  return {
    product: { ...product, updatedAt: product.updatedAt.toISOString() },
    movements: movements.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function getStockSummary(userId: string) {
  const [summary] = await db
    .select({
      productCount: sql`count(*)`.mapWith(Number),
      totalStock: sql`coalesce(sum(${products.stock}::bigint), 0)`.mapWith(
        Number,
      ),
      lowCount:
        sql`count(*) filter (where ${products.stock} > 0 and ${products.stock} < ${products.minStock})`.mapWith(
          Number,
        ),
      emptyCount: sql`count(*) filter (where ${products.stock} = 0)`.mapWith(
        Number,
      ),
      categoryCount: sql`count(distinct ${products.category})`.mapWith(Number),
    })
    .from(products)
    .where(eq(products.userId, userId));
  return summary;
}

export async function listProducts(
  userId: string,
  { limit, offset, q, category, status }: ListProductsInput,
) {
  const rows = await db
    .select(productFields)
    .from(products)
    .where(
      and(
        eq(products.userId, userId),
        q
          ? or(
              sql`position(lower(${q}) in lower(${products.name})) > 0`,
              sql`position(lower(${q}) in lower(${products.sku})) > 0`,
            )
          : undefined,
        category !== "all" ? eq(products.category, category) : undefined,
        status === "empty"
          ? eq(products.stock, 0)
          : status === "low"
            ? and(gt(products.stock, 0), lt(products.stock, products.minStock))
            : undefined,
      ),
    )
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
