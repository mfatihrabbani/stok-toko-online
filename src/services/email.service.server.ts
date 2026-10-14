import nodemailer from "nodemailer";
import { env } from "@/lib/env.server";
const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE === "true",
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
    : undefined,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10_000,
  disableFileAccess: true,
  disableUrlAccess: true,
});
export async function sendPasswordRecovery(email: string, url: string) {
  await transport.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: "Pulihkan kata sandi akun stok.",
    text: `Buka tautan berikut untuk membuat kata sandi baru:\n\n${url}\n\nJika Anda tidak meminta pemulihan, abaikan email ini. Tautan hanya dapat digunakan sebelum kedaluwarsa.`,
  });
}
