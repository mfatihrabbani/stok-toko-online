import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ChevronRight, FlaskConical, LayoutDashboard } from "lucide-react";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: "/sign-in" });
    return { session: context.session };
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { user } = Route.useRouteContext().session;
  return (
    <div className="stock-shell">
      <aside className="stock-sidebar">
        <div className="stock-sidebar-heading">
          <Brand />
          <div className="stock-store">
            <span className="stock-store-avatar" aria-hidden="true">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <strong className="block truncate">{user.name}</strong>
              <span className="text-xs text-muted-foreground">Toko online</span>
            </div>
          </div>
        </div>
        <nav aria-label="Navigasi utama" className="flex flex-col gap-3">
          <span className="stock-nav-label">Ruang kerja</span>
          <div className="stock-nav-links">
            <Link
              to="/app"
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <LayoutDashboard aria-hidden="true" />
              Stok barang
            </Link>
          </div>
        </nav>
        <div className="stock-sidebar-bottom">
          <Separator />
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FlaskConical className="size-4" aria-hidden="true" />
            Data contoh
          </p>
          <SignOutButton />
        </div>
      </aside>
      <div className="stock-workspace">
        <header className="stock-topbar">
          <div className="flex items-center gap-3">
            <span>Ruang kerja</span>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="text-foreground">Persediaan</span>
          </div>
          <Badge variant="outline">Data contoh</Badge>
        </header>
        <main id="main-content" className="stock-main">
          <Outlet />
        </main>
        <footer className="stock-footer">
          Data contoh · Perubahan belum disimpan ke persediaan toko.
        </footer>
      </div>
    </div>
  );
}
