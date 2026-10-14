import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { getStockSummary } from "@/services/inventory.service.server";

export const Route = createFileRoute("/api/products/summary")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) =>
          Response.json({ data: await getStockSummary(session.user.id) }),
        ),
    },
  },
});
