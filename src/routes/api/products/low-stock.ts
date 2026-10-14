import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { listLowStock } from "@/services/inventory.service.server";
import { lowStockQuerySchema } from "@/validators/inventory";
export const Route = createFileRoute("/api/products/low-stock")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) =>
          Response.json(
            await listLowStock(
              session.user.id,
              lowStockQuerySchema.parse(
                Object.fromEntries(new URL(request.url).searchParams),
              ),
            ),
          ),
        ),
    },
  },
});
