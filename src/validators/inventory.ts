import { z } from "zod";

export const inventoryIdSchema = z.string().uuid();
export const createProductSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    sku: z.string().trim().max(80).default(""),
    category: z.string().trim().min(1).max(80).default("Tanpa kategori"),
    minStock: z.number().int().min(0).max(2147483647).default(0),
    unit: z.string().trim().min(1).max(30).default("unit"),
  })
  .strict();
export type CreateProductInput = z.infer<typeof createProductSchema>;
export const listProductsSchema = z
  .object({
    q: z.string().trim().max(160).default(""),
    category: z.string().trim().max(80).default("all"),
    status: z.enum(["all", "low", "empty"]).default("all"),
    limit: z.coerce.number().int().min(1).max(1000).default(100),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();
export type ListProductsInput = z.infer<typeof listProductsSchema>;
export const incomingStockSchema = z
  .object({
    productId: inventoryIdSchema.optional(),
    newProduct: createProductSchema.optional(),
    quantity: z.number().int().min(1).max(2147483647),
    note: z.string().trim().max(300).default(""),
    requestId: z.string().uuid(),
  })
  .strict()
  .refine(
    (value) => Boolean(value.productId) !== Boolean(value.newProduct),
    "Pilih produk yang ada atau isi satu produk baru.",
  );
export type IncomingStockInput = z.infer<typeof incomingStockSchema>;
