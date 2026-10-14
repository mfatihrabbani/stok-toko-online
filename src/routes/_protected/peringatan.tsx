import { createFileRoute } from "@tanstack/react-router";
import { LowStockList } from "@/components/inventory/low-stock-list";
import { siteConfig } from "@/config/site";
export const Route = createFileRoute("/_protected/peringatan")({
  head: () => ({ meta: [{ title: `Peringatan stok | ${siteConfig.name}` }] }),
  component: LowStockList,
});
