import { createFileRoute } from "@tanstack/react-router";
import { LowStockList } from "@/components/inventory/low-stock-list";
import { siteConfig } from "@/config/site";
import { useInventory } from "@/lib/use-inventory";
import { inventoryRequest } from "@/lib/inventory-client";
export const Route = createFileRoute("/_protected/peringatan")({
  head: () => ({ meta: [{ title: `Peringatan stok | ${siteConfig.name}` }] }),
  component: WarningPage,
});
function WarningPage() {
  const { products, refresh } = useInventory();
  return (
    <LowStockList
      products={products}
      onHandled={async (id) => {
        try {
          await inventoryRequest(`/api/products/${id}/handled`, {
            method: "POST",
            body: {},
          });
        } finally {
          void refresh().catch(() => {});
        }
      }}
      handledIds={products
        .filter((item) => item.restockHandled)
        .map((item) => item.id)}
    />
  );
}
