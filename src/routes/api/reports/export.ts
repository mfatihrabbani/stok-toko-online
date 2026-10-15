import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { reportExportSchema } from "@/validators/reports";
import { exportReport } from "@/services/reports.service.server";
import { defaultReportPeriod } from "@/lib/reports";

export const Route = createFileRoute("/api/reports/export")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const input = reportExportSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          const filename =
            input.kind === "stock"
              ? `stok-${defaultReportPeriod().to}.csv`
              : `pergerakan-${input.kind}-${input.from}-${input.to}.csv`;
          return new Response(await exportReport(session.user.id, input), {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="${filename}"`,
              "X-Content-Type-Options": "nosniff",
            },
          });
        }),
    },
  },
});
