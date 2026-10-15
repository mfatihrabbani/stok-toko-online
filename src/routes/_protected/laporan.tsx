import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/inventory/report-view";
import { z } from "zod";
import { defaultReportPeriod } from "@/lib/reports";
import { useInventory } from "@/lib/use-inventory";
import { getReportFn } from "@/lib/report-queries";
import { downloadBlob } from "@/lib/csv";
export const Route = createFileRoute("/_protected/laporan")({
  validateSearch: (search: Record<string, unknown>) => {
    const defaults = defaultReportPeriod();
    return {
      from: z.iso.date().safeParse(search.from).data ?? defaults.from,
      to: z.iso.date().safeParse(search.to).data ?? defaults.to,
      offset:
        z.coerce.number().int().min(0).max(1_000_000).safeParse(search.offset)
          .data ?? 0,
    };
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    deps.from > deps.to
      ? {
          data: [],
          productTotals: [],
          summary: { incoming: 0, outgoing: 0, count: 0 },
          meta: { offset: 0, limit: 50, hasMore: false },
        }
      : getReportFn({ data: { ...deps, limit: 50 } }),
  head: () => ({ meta: [{ title: "Laporan stok | stok." }] }),
  component: ReportPage,
});
function ReportPage() {
  const report = Route.useLoaderData();
  const { products } = useInventory();
  const period = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ReportView
      products={products}
      movements={report.data}
      summary={report.summary}
      productTotals={report.productTotals}
      onExport={async (kind) => {
        const query = new URLSearchParams(
          kind === "stock"
            ? { kind }
            : { kind, from: period.from, to: period.to },
        );
        const response = await fetch(
          "/api/reports/export?" + query.toString(),
          { credentials: "same-origin" },
        );
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Sesi berakhir. Masuk kembali untuk mengunduh laporan."
              : "Laporan belum dapat diunduh. Coba lagi.",
          );
        const filename =
          kind === "stock"
            ? `stok-${defaultReportPeriod().to}.csv`
            : `pergerakan-${kind}-${period.from}-${period.to}.csv`;
        downloadBlob(await response.blob(), filename);
      }}
      pagination={{
        offset: report.meta.offset,
        hasMore: report.meta.hasMore,
        onChange: (offset) => {
          void navigate({ search: { ...period, offset }, resetScroll: false });
        },
      }}
      period={period}
      onPeriodChange={(search) => {
        void navigate({
          search: { ...search, offset: 0 },
          replace: true,
          resetScroll: false,
        });
      }}
    />
  );
}
