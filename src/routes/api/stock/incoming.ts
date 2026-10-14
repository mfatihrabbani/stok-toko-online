import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import { recordIncoming } from "@/services/inventory.service.server";
import { incomingStockSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/stock/incoming")({
  server: {
    handlers: {
      POST: ({ request }) =>
        withInventorySession(request, async (session) => {
          const input = incomingStockSchema.parse(await readJson(request));
          return Response.json(
            { data: await recordIncoming(session.user.id, input) },
            { status: 201 },
          );
        }),
    },
  },
});
