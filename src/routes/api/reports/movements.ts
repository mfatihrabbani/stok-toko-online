import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { reportQuerySchema } from "@/validators/reports";
import { getMovementReport } from "@/services/reports.service.server";

export const Route = createFileRoute("/api/reports/movements")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const query = reportQuerySchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          return Response.json(await getMovementReport(session.user.id, query));
        }),
    },
  },
});
