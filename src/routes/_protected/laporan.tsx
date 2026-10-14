import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/inventory/report-view";
export const Route = createFileRoute("/_protected/laporan")({
  head: () => ({ meta: [{ title: "Laporan stok | stok." }] }),
  component: ReportView,
});
