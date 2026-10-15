import { z } from "zod";

export const reportQuerySchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict()
  .refine(
    (value) => value.from <= value.to,
    "Tanggal akhir harus sama atau setelah tanggal awal.",
  );
export type ReportQuery = z.infer<typeof reportQuerySchema>;
