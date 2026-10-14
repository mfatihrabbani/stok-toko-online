import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StockTable } from "@/components/inventory/stock-table";
import { StockFilters } from "@/components/inventory/stock-filters";
import { StockSummary } from "@/components/inventory/stock-summary";
import { defaultProductFilters, filterProducts } from "@/lib/inventory";
import { useInventory } from "@/lib/use-inventory";
import { siteConfig } from "@/config/site";
import {
  parseStockSearch,
  stockFiltersFromSearch,
  stockSearchFromFilters,
} from "@/lib/stock-search";
import type { ProductFilters } from "@/lib/inventory";

export const Route = createFileRoute("/_protected/app")({
  validateSearch: parseStockSearch,
  head: () => ({ meta: [{ title: `Stok barang | ${siteConfig.name}` }] }),
  component: StockPage,
});

function StockPage() {
  const { products: inventory } = useInventory();
  const search = Route.useSearch();
  const filters = stockFiltersFromSearch(search);
  const navigate = Route.useNavigate();
  const update = (changes: Partial<ProductFilters>) => {
    void navigate({
      search: stockSearchFromFilters({ ...filters, ...changes }),
      replace: true,
      resetScroll: false,
    });
  };
  const products = filterProducts(inventory, filters);
  const active =
    Boolean(filters.query.trim()) ||
    filters.category !== "all" ||
    filters.status !== "all";
  const reset = () => update(defaultProductFilters);
  return (
    <div className="flex flex-col gap-6">
      <header className="stock-page-heading">
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Stok barang
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Periksa persediaan, lalu catat barang yang masuk dan keluar.
        </p>
        <div className="stock-page-actions">
          <Button variant="outline" asChild>
            <Link to="/barang-keluar" search={search}>
              <ArrowUpRight data-icon="inline-start" aria-hidden="true" />
              Barang keluar
            </Link>
          </Button>
          <Button asChild>
            <Link to="/barang-masuk" search={search}>
              <ArrowDownLeft data-icon="inline-start" aria-hidden="true" />
              Barang masuk
            </Link>
          </Button>
        </div>
      </header>
      <StockSummary products={inventory} />
      <Card className="gap-0 overflow-hidden shadow-none">
        <CardHeader className="pb-5">
          <CardTitle>
            <h2 className="flex items-center gap-2 text-xl">
              Daftar produk <Badge variant="outline">{inventory.length}</Badge>
            </h2>
          </CardTitle>
          <StockFilters
            products={inventory}
            filters={filters}
            onChange={update}
            onReset={reset}
          />
        </CardHeader>
        <CardContent className="px-0">
          <StockTable
            products={products}
            returnSearch={search}
            emptyTitle={active ? "Produk tidak ditemukan" : undefined}
            emptyDescription={
              active
                ? filters.query.trim()
                  ? `Tidak ada produk yang cocok dengan “${filters.query.trim()}” dan filter yang dipilih.`
                  : "Tidak ada produk dalam kategori dan kondisi stok yang dipilih."
                : undefined
            }
            onReset={active ? reset : undefined}
          />
        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          <span role="status">
            Menampilkan {products.length} dari {inventory.length} produk
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
