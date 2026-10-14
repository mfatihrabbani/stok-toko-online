import { z } from "zod";
export const signInSchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(254, "Email maksimal 254 karakter.")
      .pipe(z.email({ error: "Isi alamat email yang valid." })),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(128, "Kata sandi maksimal 128 karakter."),
  })
  .strict();
export const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Isi nama pemilik atau toko.")
    .max(100, "Nama maksimal 100 karakter."),
});
