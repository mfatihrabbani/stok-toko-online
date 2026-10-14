import { createFileRoute, Link } from "@tanstack/react-router";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export const Route = createFileRoute("/_protected/akun")({
  head: () => ({ meta: [{ title: "Akun toko | stok." }] }),
  component: AccountPage,
});
function AccountPage() {
  const { user, session } = Route.useRouteContext().session;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Akun toko
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Periksa identitas akun dan akses ke persediaan toko Anda.
        </p>
      </header>
      <Card className="max-w-2xl shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Identitas akun</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-5">
            <div>
              <dt className="text-xs text-muted-foreground">
                Nama pemilik atau toko
              </dt>
              <dd className="mt-1 break-words font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status akses</dt>
              <dd className="mt-2">
                <Badge variant="outline">Sedang masuk</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Sesi berlaku sampai
              </dt>
              <dd className="mt-1">
                {new Date(session.expiresAt).toLocaleString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}{" "}
                WIB
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Produk dan riwayat tersimpan pada akun ini. Keluar akan mengakhiri
            sesi tanpa menghapus data toko.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Pulihkan kata sandi</Link>
          </Button>
          <SignOutButton />
        </CardFooter>
      </Card>
    </div>
  );
}
