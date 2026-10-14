import { z } from "zod";

export const inventoryIdSchema = z.string().uuid();
export const categoryInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .refine(
        (value) => !["all", "tanpa kategori"].includes(value.toLowerCase()),
        "Gunakan nama kategori lain.",
      ),
  })
  .strict();
export const productMetadataSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    sku: z.string().trim().max(80).default(""),
    category: z.string().trim().min(1).max(80).default("Tanpa kategori"),
    minStock: z.number().int().min(0).max(2147483647).default(0),
    unit: z.string().trim().min(1).max(30).default("unit"),
  })
  .strict();
export const createProductSchema = productMetadataSchema
  .extend({
    id: inventoryIdSchema.optional(),
    stock: z.number().int().min(0).max(2147483647).default(0),
  })
  .strict();
export type CreateProductInput = z.infer<typeof createProductSchema>;
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    sku: z.string().trim().max(80).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    minStock: z.number().int().min(0).max(2147483647).optional(),
    unit: z.string().trim().min(1).max(30).optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Isi setidaknya satu perubahan.",
  );
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
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
    newProduct: productMetadataSchema.optional(),
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
export const outgoingStockSchema = z
  .object({
    productId: inventoryIdSchema,
    quantity: z.number().int().min(1).max(2147483647),
    note: z.string().trim().max(300).default(""),
    requestId: z.string().uuid(),
  })
  .strict();
export type OutgoingStockInput = z.infer<typeof outgoingStockSchema>;
export const listMovementsSchema = z
  .object({
    q: z.string().trim().max(160).default(""),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(50),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
    direction: z.enum(["in", "out"]).optional(),
    productId: inventoryIdSchema.optional(),
  })
  .strict()
  .refine(
    (value) => !value.from || !value.to || value.from <= value.to,
    "Tanggal akhir harus sesudah tanggal awal.",
  );
export type ListMovementsInput = z.infer<typeof listMovementsSchema>;
