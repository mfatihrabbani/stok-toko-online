import { createFileRoute } from "@tanstack/react-router";
import { StockEntryForm } from "@/components/inventory/stock-entry-form";
import { parseStockSearch, type StockSearch } from "@/lib/stock-search";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_protected/barang-masuk")({
  validateSearch: (
    search: Record<string, unknown>,
  ): StockSearch & { product?: string } => ({
    ...parseStockSearch(search),
    product: typeof search.product === "string" ? search.product : undefined,
  }),
  head: () => ({ meta: [{ title: `Barang masuk | ${siteConfig.name}` }] }),
  component: IncomingPage,
});

function IncomingPage() {
  const search = Route.useSearch();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Barang masuk
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Catat persediaan yang diterima dari pemasok atau stok awal produk
          baru.
        </p>
      </header>
      <StockEntryForm
        initialProductId={search.product}
        returnSearch={parseStockSearch(search)}
      />
    </div>
  );
}
