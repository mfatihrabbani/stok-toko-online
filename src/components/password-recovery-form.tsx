import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function PasswordRecoveryForm({
  mode,
  token,
  invalidToken,
}: {
  mode: "request" | "reset";
  token?: string;
  invalidToken?: boolean;
}) {
  const resetting = mode === "reset";
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const unavailable = resetting && (!token || invalidToken);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || unavailable) return;
    const data = new FormData(event.currentTarget);
    const value = String(data.get(resetting ? "password" : "email") || "");
    const validation = (
      resetting ? signInSchema.shape.password : signInSchema.shape.email
    ).safeParse(value);
    setError("");
    setFieldError("");
    if (!validation.success) {
      setFieldError(validation.error.issues[0].message);
      inputRef.current?.focus();
      return;
    }
    if (resetting && value !== data.get("confirmation")) {
      setFieldError("Kedua kata sandi harus sama.");
      inputRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      const result = resetting
        ? await authClient.resetPassword({ token: token!, newPassword: value })
        : await authClient.requestPasswordReset({
            email: validation.data,
            redirectTo: `${window.location.origin}/reset-password`,
          });
      if (result.error) {
        setError(
          resetting
            ? "Tautan tidak berlaku atau kedaluwarsa. Minta tautan baru lalu coba lagi."
            : result.error.status === 429
              ? "Tunggu sebentar sebelum meminta tautan lagi."
              : "Permintaan belum dapat dikirim. Coba lagi.",
        );
        return;
      }
      setMessage(
        resetting
          ? "Kata sandi berhasil diperbarui. Masuk dengan kata sandi baru."
          : "Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk Anda.",
      );
    } catch {
      setError("Server belum dapat dihubungi. Coba lagi.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">
        {resetting ? "Kata sandi baru" : "Lupa kata sandi"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {resetting
          ? "Gunakan kata sandi baru yang belum dipakai pada layanan lain."
          : "Isi email akun toko untuk mendapatkan tautan pemulihan."}
      </p>
      {unavailable ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          Tautan pemulihan tidak berlaku. Minta tautan baru melalui halaman lupa
          kata sandi.
        </p>
      ) : message ? (
        <p
          role="status"
          className="mt-6 rounded-md bg-success-soft p-3 text-sm text-success"
        >
          {message}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="stock-entry mt-6">
          <fieldset disabled={pending}>
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldError)}>
                <FieldLabel htmlFor="recovery-value">
                  {resetting ? "Kata sandi baru" : "Email akun toko"}
                </FieldLabel>
                <Input
                  id="recovery-value"
                  name={resetting ? "password" : "email"}
                  ref={inputRef}
                  type={resetting ? "password" : "email"}
                  autoComplete={resetting ? "new-password" : "email"}
                  required
                  maxLength={resetting ? 128 : 254}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={
                    fieldError ? "recovery-field-error" : undefined
                  }
                  onChange={() => setFieldError("")}
                />
                {resetting && (
                  <FieldDescription>Gunakan 8–128 karakter.</FieldDescription>
                )}
                {fieldError && (
                  <FieldError id="recovery-field-error">
                    {fieldError}
                  </FieldError>
                )}
              </Field>
              {resetting && (
                <Field>
                  <FieldLabel htmlFor="recovery-confirmation">
                    Ulangi kata sandi baru
                  </FieldLabel>
                  <Input
                    id="recovery-confirmation"
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    maxLength={128}
                    required
                  />
                </Field>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={pending} aria-busy={pending}>
                {pending
                  ? "Mohon tunggu..."
                  : resetting
                    ? "Simpan kata sandi baru"
                    : "Kirim tautan pemulihan"}
              </Button>
            </FieldGroup>
          </fieldset>
        </form>
      )}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link className="underline underline-offset-4" to="/sign-in">
          Kembali ke masuk
        </Link>
        {resetting && (
          <Link className="underline underline-offset-4" to="/forgot-password">
            Minta tautan baru
          </Link>
        )}
      </div>
    </div>
  );
}
