import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import { recordOutgoing } from "@/services/inventory.service.server";
import { outgoingStockSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/stock/outgoing")({
  server: {
    handlers: {
      POST: ({ request }) =>
        withInventorySession(request, async (session) => {
          const input = outgoingStockSchema.parse(await readJson(request));
          return Response.json(
            { data: await recordOutgoing(session.user.id, input) },
            { status: 201 },
          );
        }),
    },
  },
});
