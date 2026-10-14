import { and, asc, desc, eq, gt, gte, lt, or, sql, isNull } from "drizzle-orm";
import { db } from "@/db/index.server";
import { products } from "@/db/schema/products";
import { categories } from "@/db/schema/categories";
import { stockMovements } from "@/db/schema/stock-movements";
import type { ListProductsInput } from "@/validators/inventory";
import type {
  IncomingStockInput,
  CreateProductInput,
} from "@/validators/inventory";
import { InventoryError } from "@/lib/inventory-error";

export const productFields = {
  id: products.id,
  name: products.name,
  sku: products.sku,
  category: products.category,
  stock: products.stock,
  minStock: products.minStock,
  lowStock: sql<boolean>`${products.stock} < ${products.minStock}`,
  restockHandled: sql<boolean>`${products.restockHandledAt} IS NOT NULL`,
  unit: products.unit,
  updatedAt: products.updatedAt,
};
export async function listLowStock(
  userId: string,
  input: import("zod").infer<
    typeof import("@/validators/inventory").lowStockQuerySchema
  >,
) {
  const rows = await db
    .select({
      ...productFields,
      shortfall: sql<number>`${products.minStock} - ${products.stock}`,
    })
    .from(products)
    .where(
      and(
        activeOwner(userId),
        lt(products.stock, products.minStock),
        input.status === "active"
          ? isNull(products.restockHandledAt)
          : input.status === "handled"
            ? sql`${products.restockHandledAt} IS NOT NULL`
            : undefined,
      ),
    )
    .orderBy(
      asc(sql`${products.stock}::numeric / nullif(${products.minStock}, 0)`),
      desc(sql`${products.minStock} - ${products.stock}`),
      asc(products.name),
      asc(products.id),
    )
    .limit(input.limit + 1)
    .offset(input.offset);
  return {
    data: rows
      .slice(0, input.limit)
      .map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() })),
    meta: { ...input, hasMore: rows.length > input.limit },
  };
}
export const movementFields = {
  id: stockMovements.id,
  productId: stockMovements.productId,
  productName: stockMovements.productName,
  productSku: stockMovements.productSku,
  direction: stockMovements.direction,
  quantity: stockMovements.quantity,
  note: stockMovements.note,
  stockBefore: stockMovements.stockBefore,
  stockAfter: stockMovements.stockAfter,
  createdAt: stockMovements.createdAt,
};
export async function getMovement(userId: string, id: string) {
  const [row] = await db
    .select(movementFields)
    .from(stockMovements)
    .where(and(eq(stockMovements.id, id), eq(stockMovements.userId, userId)))
    .limit(1);
  return row ? { ...row, createdAt: row.createdAt.toISOString() } : null;
}
export async function listMovements(
  userId: string,
  input: import("@/validators/inventory").ListMovementsInput,
) {
  const rows = await db
    .select(movementFields)
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.userId, userId),
        input.from
          ? gte(
              stockMovements.createdAt,
              new Date(`${input.from}T00:00:00+07:00`),
            )
          : undefined,
        input.to
          ? lt(
              stockMovements.createdAt,
              new Date(Date.parse(`${input.to}T00:00:00+07:00`) + 86_400_000),
            )
          : undefined,
        input.q
          ? sql`position(lower(${input.q}) in lower(concat_ws(' ', ${stockMovements.productName}, ${stockMovements.productSku}, ${stockMovements.note}))) > 0`
          : undefined,
        input.direction
          ? eq(stockMovements.direction, input.direction)
          : undefined,
        input.productId
          ? eq(stockMovements.productId, input.productId)
          : undefined,
      ),
    )
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
    .limit(input.limit + 1)
    .offset(input.offset);
  return {
    data: rows
      .slice(0, input.limit)
      .map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    meta: {
      limit: input.limit,
      offset: input.offset,
      hasMore: rows.length > input.limit,
    },
  };
}

function databaseCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  return "cause" in error ? databaseCode(error.cause) : undefined;
}

function activeOwner(userId: string) {
  return and(eq(products.userId, userId), isNull(products.archivedAt));
}
export async function handleLowStock(userId: string, id: string) {
  const [row] = await db
    .update(products)
    .set({
      restockHandledAt: sql`coalesce(${products.restockHandledAt}, now())`,
    })
    .where(
      and(
        eq(products.id, id),
        activeOwner(userId),
        lt(products.stock, products.minStock),
      ),
    )
    .returning(productFields);
  if (!row) {
    const [owned] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), activeOwner(userId)));
    if (!owned)
      throw new InventoryError("NOT_FOUND", "Produk tidak ditemukan.");
    throw new InventoryError(
      "INVALID_STOCK",
      "Stok produk sudah aman. Peringatan tidak perlu ditandai.",
    );
  }
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}
type InventoryTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function resolveCategory(
  tx: InventoryTransaction,
  userId: string,
  name: string,
) {
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${"categories:" + userId}, 0))`,
  );
  if (name.toLocaleLowerCase("id-ID") === "tanpa kategori")
    return { category: "Tanpa kategori", categoryId: null };
  if (name.toLowerCase() === "all")
    throw new InventoryError("INVALID_STOCK", "Gunakan nama kategori lain.");
  await tx.insert(categories).values({ userId, name }).onConflictDoNothing();
  const [category] = await tx
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        sql`lower(${categories.name}) = lower(${name})`,
      ),
    );
  return { category: category.name, categoryId: category.id };
}

export async function createProduct(userId: string, input: CreateProductInput) {
  try {
    return await db.transaction(async (tx) => {
      if (input.id) {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${"product:" + userId + ":" + input.id}, 0))`,
        );
        const [previous] = await tx
          .select(productFields)
          .from(products)
          .where(and(eq(products.id, input.id), activeOwner(userId)));
        if (previous) {
          if (previous.name !== input.name || previous.sku !== input.sku)
            throw new InventoryError(
              "REQUEST_CONFLICT",
              "Produk sudah dibuat dengan identitas berbeda.",
            );
          return { ...previous, updatedAt: previous.updatedAt.toISOString() };
        }
      }
      const category = await resolveCategory(tx, userId, input.category);
      const [row] = await tx
        .insert(products)
        .values({ ...input, ...category, userId })
        .returning(productFields);
      if (input.stock > 0)
        await tx.insert(stockMovements).values({
          userId,
          productId: row.id,
          productName: row.name,
          productSku: row.sku,
          direction: "in",
          quantity: input.stock,
          stockBefore: 0,
          stockAfter: input.stock,
          note: "Stok awal produk",
          requestId: row.id,
        });
      return { ...row, updatedAt: row.updatedAt.toISOString() };
    });
  } catch (error) {
    if (databaseCode(error) === "23505")
      throw new InventoryError(
        "SKU_EXISTS",
        "SKU sudah dipakai produk lain di toko Anda.",
      );
    throw error;
  }
}

export async function updateProduct(
  userId: string,
  id: string,
  input: import("@/validators/inventory").UpdateProductInput,
) {
  try {
    return await db.transaction(async (tx) => {
      const category =
        input.category === undefined
          ? {}
          : await resolveCategory(tx, userId, input.category);
      const [row] = await tx
        .update(products)
        .set({
          ...input,
          ...category,
          restockHandledAt: sql`CASE WHEN ${products.stock} >= ${input.minStock ?? products.minStock} THEN NULL ELSE ${products.restockHandledAt} END`,
        })
        .where(and(eq(products.id, id), activeOwner(userId)))
        .returning(productFields);
      if (!row)
        throw new InventoryError("NOT_FOUND", "Produk tidak ditemukan.");
      return { ...row, updatedAt: row.updatedAt.toISOString() };
    });
  } catch (error) {
    if (databaseCode(error) === "23505")
      throw new InventoryError(
        "SKU_EXISTS",
        "SKU sudah dipakai produk lain di toko Anda.",
      );
    throw error;
  }
}
export async function archiveProduct(userId: string, id: string) {
  const [row] = await db
    .update(products)
    .set({ archivedAt: new Date() })
    .where(and(eq(products.id, id), activeOwner(userId)))
    .returning({ id: products.id });
  return Boolean(row);
}

async function recordMovement(
  userId: string,
  input: IncomingStockInput,
  direction: "in" | "out",
) {
  if (
    !Number.isSafeInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 2147483647
  )
    throw new InventoryError(
      "INVALID_STOCK",
      "Jumlah harus bilangan bulat positif.",
    );
  if (direction === "out" && !input.productId)
    throw new InventoryError("NOT_FOUND", "Pilih produk yang sudah terdaftar.");
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${userId + ":" + input.requestId}, 0))`,
      );
      const [previous] = await tx
        .select()
        .from(stockMovements)
        .where(
          and(
            eq(stockMovements.userId, userId),
            eq(stockMovements.requestId, input.requestId),
          ),
        )
        .limit(1);
      if (previous) {
        const sameProduct = input.productId
          ? previous.productId === input.productId
          : previous.productName === input.newProduct?.name &&
            previous.productSku === input.newProduct?.sku;
        if (
          !sameProduct ||
          previous.direction !== direction ||
          previous.quantity !== input.quantity ||
          previous.note !== input.note
        )
          throw new InventoryError(
            "REQUEST_CONFLICT",
            "Identitas catatan telah dipakai. Tinjau ulang isian sebelum menyimpan.",
          );
        const [product] = await tx
          .select(productFields)
          .from(products)
          .where(and(eq(products.id, previous.productId), activeOwner(userId)));
        if (!product)
          throw new InventoryError("NOT_FOUND", "Produk tidak ditemukan.");
        return {
          product: { ...product, updatedAt: product.updatedAt.toISOString() },
          receipt: {
            id: previous.id,
            stockBefore: previous.stockBefore,
            stockAfter: previous.stockAfter,
            quantity: previous.quantity,
          },
        };
      }
      const [product] = input.newProduct
        ? await tx
            .insert(products)
            .values({
              ...input.newProduct,
              ...(await resolveCategory(tx, userId, input.newProduct.category)),
              userId,
            })
            .returning(productFields)
        : await tx
            .select(productFields)
            .from(products)
            .where(and(eq(products.id, input.productId!), activeOwner(userId)))
            .for("update");
      if (!product)
        throw new InventoryError("NOT_FOUND", "Produk tidak ditemukan.");
      const after =
        product.stock + input.quantity * (direction === "out" ? -1 : 1);
      if (after < 0)
        throw new InventoryError(
          "INVALID_STOCK",
          `Stok tidak cukup. Tersedia ${product.stock} ${product.unit}.`,
        );
      if (!Number.isSafeInteger(after) || after > 2147483647)
        throw new InventoryError(
          "INVALID_STOCK",
          "Jumlah masuk terlalu besar untuk stok produk ini.",
        );
      const [updated] = await tx
        .update(products)
        .set({
          stock: after,
          ...(after >= product.minStock ? { restockHandledAt: null } : {}),
        })
        .where(and(eq(products.id, product.id), activeOwner(userId)))
        .returning(productFields);
      const [movement] = await tx
        .insert(stockMovements)
        .values({
          userId,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          direction,
          quantity: input.quantity,
          stockBefore: product.stock,
          stockAfter: after,
          note: input.note,
          requestId: input.requestId,
        })
        .returning({ id: stockMovements.id });
      return {
        product: { ...updated, updatedAt: updated.updatedAt.toISOString() },
        receipt: {
          id: movement.id,
          stockBefore: product.stock,
          stockAfter: after,
          quantity: input.quantity,
        },
      };
    });
  } catch (error) {
    if (databaseCode(error) === "23505")
      throw new InventoryError(
        "SKU_EXISTS",
        "SKU sudah dipakai produk lain di toko Anda.",
      );
    throw error;
  }
}

export function recordIncoming(userId: string, input: IncomingStockInput) {
  return recordMovement(userId, input, "in");
}
export function recordOutgoing(
  userId: string,
  input: import("@/validators/inventory").OutgoingStockInput,
) {
  return recordMovement(userId, input, "out");
}

export async function getInventory(userId: string) {
  const rows = await db
    .select(productFields)
    .from(products)
    .where(activeOwner(userId))
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
    .where(and(eq(products.id, id), activeOwner(userId)))
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
    .where(activeOwner(userId));
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
        activeOwner(userId),
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
