import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const router = useRouter();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const credentials = {
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
      };
      const result = signingUp
        ? await authClient.signUp.email({
            ...credentials,
            name: String(data.get("name")).trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          signingUp
            ? "Akun belum bisa dibuat. Periksa isian atau masuk bila sudah terdaftar."
            : "Belum berhasil masuk. Periksa email dan kata sandi Anda.",
        );
        return;
      }
      // Re-run route guards with the new cookie, then move to the app.
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
        className="mt-8 space-y-5"
        aria-busy={pending}
        aria-describedby={error ? "auth-error" : undefined}
      >
        <fieldset disabled={pending} className="space-y-5">
          <legend className="sr-only">
            {signingUp ? "Data akun toko" : "Data untuk masuk"}
          </legend>
          {signingUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Nama pemilik atau toko</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Contoh: Toko Sinar"
                required
                minLength={1}
                maxLength={100}
                pattern=".*\S.*"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              required
              maxLength={254}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={signingUp ? "new-password" : "current-password"}
              required
              minLength={8}
              maxLength={128}
              aria-describedby={signingUp ? "password-hint" : undefined}
            />
            {signingUp && (
              <p id="password-hint" className="text-sm text-muted-foreground">
                Gunakan 8–128 karakter. Simpan kata sandi agar bisa masuk
                kembali.
              </p>
            )}
          </div>
          {error && (
            <p
              id="auth-error"
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm leading-6 text-destructive"
            >
              {error}
            </p>
          )}
          <Button className="w-full" type="submit" size="lg" disabled={pending}>
            {pending ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : null}
            {pending
              ? "Mohon tunggu..."
              : signingUp
                ? "Daftar akun toko"
                : "Masuk"}
            {!pending && <ArrowRight aria-hidden="true" />}
          </Button>
        </fieldset>
      </form>
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
