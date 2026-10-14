import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import { handleLowStock } from "@/services/inventory.service.server";
import { handleStockSchema, inventoryIdSchema } from "@/validators/inventory";
export const Route = createFileRoute("/api/products/$id/handled")({
  server: {
    handlers: {
      POST: ({ request, params }) =>
        withInventorySession(request, async (session) => {
          handleStockSchema.parse(await readJson(request));
          return Response.json({
            data: await handleLowStock(
              session.user.id,
              inventoryIdSchema.parse(params.id),
            ),
          });
        }),
    },
  },
});
