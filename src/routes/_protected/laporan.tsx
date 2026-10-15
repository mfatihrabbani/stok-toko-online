import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/inventory/report-view";
import { z } from "zod";
import { defaultReportPeriod } from "@/lib/reports";
import { useInventory } from "@/lib/use-inventory";
export const Route = createFileRoute("/_protected/laporan")({
  validateSearch: (search: Record<string, unknown>) => {
    const defaults = defaultReportPeriod();
    return {
      from: z.iso.date().safeParse(search.from).data ?? defaults.from,
      to: z.iso.date().safeParse(search.to).data ?? defaults.to,
    };
  },
  head: () => ({ meta: [{ title: "Laporan stok | stok." }] }),
  component: ReportPage,
});
function ReportPage() {
  const { products } = useInventory();
  const period = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ReportView
      products={products}
      period={period}
      onPeriodChange={(search) => {
        void navigate({ search, replace: true, resetScroll: false });
      }}
    />
  );
}
