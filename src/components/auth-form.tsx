import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { siteConfig } from "@/config/site";
import { signInSchema, signUpSchema } from "@/validators/auth";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const router = useRouter();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const clear = (field: string) =>
    setFields((current) => ({ ...current, [field]: "" }));
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };
    const input = signingUp
      ? { ...credentials, name: String(form.get("name") || "").trim() }
      : credentials;
    const validated = (signingUp ? signUpSchema : signInSchema).safeParse(
      input,
    );
    setError("");
    if (!validated.success) {
      const errors: Record<string, string> = {};
      for (const issue of validated.error.issues) {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = issue.message;
      }
      setFields(errors);
      (errors.name
        ? nameRef
        : errors.email
          ? emailRef
          : passwordRef
      ).current?.focus();
      return;
    }
    setFields({});
    setPending(true);
    try {
      const result = signingUp
        ? await authClient.signUp.email({
            ...credentials,
            name: String(form.get("name") || "").trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          result.error.status === 429
            ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
            : signingUp
              ? "Akun belum bisa dibuat. Periksa isian atau masuk bila sudah terdaftar."
              : "Belum berhasil masuk. Periksa email dan kata sandi Anda.",
        );
        return;
      }
      await router.invalidate();
      await navigate({ to: siteConfig.homePath, replace: true });
    } catch {
      setError("Server belum dapat dihubungi. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="w-full max-w-sm">
      <p className="mb-3 text-sm font-medium text-primary">
        {signingUp ? "Mulai kelola persediaan" : "Persediaan toko Anda"}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        {signingUp ? "Daftar akun toko" : "Masuk ke toko"}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {signingUp
          ? "Buat akun untuk menyimpan produk dan stok toko Anda."
          : "Lihat stok dan catat barang masuk atau keluar dengan akun Anda."}
      </p>
      <form
        onSubmit={onSubmit}
        noValidate
        className="stock-entry mt-8"
        aria-busy={pending}
      >
        <fieldset disabled={pending}>
          <legend className="sr-only">
            {signingUp ? "Data akun toko" : "Data untuk masuk"}
          </legend>
          <FieldGroup className="gap-5">
            {signingUp && (
              <Field data-invalid={Boolean(fields.name)}>
                <FieldLabel htmlFor="name">Nama pemilik atau toko</FieldLabel>
                <Input
                  ref={nameRef}
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Contoh: Toko Sinar"
                  required
                  maxLength={100}
                  onChange={() => clear("name")}
                  aria-invalid={Boolean(fields.name)}
                  aria-describedby={fields.name ? "name-error" : undefined}
                />
                {fields.name && (
                  <FieldError id="name-error">{fields.name}</FieldError>
                )}
              </Field>
            )}
            <Field data-invalid={Boolean(fields.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@contoh.com"
                required
                maxLength={254}
                onChange={() => clear("email")}
                aria-invalid={Boolean(fields.email)}
                aria-describedby={fields.email ? "email-error" : undefined}
              />
              {fields.email && (
                <FieldError id="email-error">{fields.email}</FieldError>
              )}
            </Field>
            <Field data-invalid={Boolean(fields.password)}>
              <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                autoComplete={signingUp ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={128}
                onChange={() => clear("password")}
                aria-invalid={Boolean(fields.password)}
                aria-describedby={
                  fields.password
                    ? "password-error"
                    : signingUp
                      ? "password-hint"
                      : undefined
                }
              />
              {signingUp && (
                <FieldDescription id="password-hint">
                  Gunakan 8–128 karakter.
                </FieldDescription>
              )}
              {fields.password && (
                <FieldError id="password-error">{fields.password}</FieldError>
              )}
            </Field>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm leading-6 text-destructive"
              >
                {error}
              </p>
            )}
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={pending}
            >
              {pending && (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {pending
                ? "Mohon tunggu..."
                : signingUp
                  ? "Daftar akun toko"
                  : "Masuk"}
              {!pending && (
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              )}
            </Button>
          </FieldGroup>
        </fieldset>
      </form>
      {!signingUp && (
        <p className="mt-5 text-right text-sm">
          <Link to="/forgot-password" className="underline underline-offset-4">
            Lupa kata sandi?
          </Link>
        </p>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {signingUp ? "Sudah punya akun toko?" : "Belum punya akun toko?"}{" "}
        <Link
          className="rounded-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          to={signingUp ? "/sign-in" : "/sign-up"}
        >
          {signingUp ? "Masuk" : "Daftar akun toko"}
        </Link>
      </p>
    </div>
  );
}
