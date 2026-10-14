import { createFileRoute } from "@tanstack/react-router";
import { LowStockList } from "@/components/inventory/low-stock-list";
import { siteConfig } from "@/config/site";
import { useInventory } from "@/lib/use-inventory";
export const Route = createFileRoute("/_protected/peringatan")({
  head: () => ({ meta: [{ title: `Peringatan stok | ${siteConfig.name}` }] }),
  component: WarningPage,
});
function WarningPage() {
  const { products } = useInventory();
  return (
    <LowStockList
      products={products}
      handledIds={products
        .filter((item) => item.restockHandled)
        .map((item) => item.id)}
    />
  );
}
