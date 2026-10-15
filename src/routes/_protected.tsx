import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  Package,
  History,
  TriangleAlert,
  UserRound,
  ChartColumn,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCategoriesFn, getInventoryFn } from "@/lib/inventory-queries";
import { defaultReportPeriod } from "@/lib/reports";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: "/sign-in" });
    return { session: context.session };
  },
  component: ProtectedLayout,
  loader: async () => {
    const [products, categories] = await Promise.all([
      getInventoryFn(),
      getCategoriesFn(),
    ]);
    return { products, categories };
  },
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
            <Link
              to="/produk"
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <Package aria-hidden="true" />
              Produk
            </Link>
            <Link
              to="/riwayat"
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <History aria-hidden="true" />
              Riwayat
            </Link>
            <Link
              to="/peringatan"
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <TriangleAlert aria-hidden="true" />
              Peringatan
            </Link>
            <Link
              to="/laporan"
              search={{ ...defaultReportPeriod(), offset: 0 }}
              activeOptions={{ includeSearch: false }}
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <ChartColumn aria-hidden="true" />
              Laporan
            </Link>
            <Link
              to="/akun"
              className="stock-nav-link"
              activeProps={{ "aria-current": "page" }}
            >
              <UserRound aria-hidden="true" />
              Akun toko
            </Link>
          </div>
        </nav>
        <div className="stock-sidebar-bottom">
          <Separator />
          <Link
            to="/barang-masuk"
            className="stock-nav-link"
            activeProps={{ "aria-current": "page" }}
          >
            <ArrowDownLeft aria-hidden="true" />
            Barang masuk
          </Link>
          <Link
            to="/barang-keluar"
            className="stock-nav-link"
            activeProps={{ "aria-current": "page" }}
          >
            <ArrowUpRight aria-hidden="true" />
            Barang keluar
          </Link>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            Persediaan toko Anda
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
          <Badge variant="outline">Toko online</Badge>
        </header>
        <main id="main-content" className="stock-main">
          <Outlet />
        </main>
        <footer className="stock-footer">stok. · Persediaan toko Anda</footer>
      </div>
    </div>
  );
}
