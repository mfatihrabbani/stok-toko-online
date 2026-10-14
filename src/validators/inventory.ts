import { z } from "zod";

export const inventoryIdSchema = z.string().uuid();
export const listProductsSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(1000).default(100),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();
export type ListProductsInput = z.infer<typeof listProductsSchema>;
