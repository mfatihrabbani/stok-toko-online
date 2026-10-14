import { createFileRoute } from "@tanstack/react-router";
import { ApiError, withApiSession } from "@/lib/api.server";
import { getMovement } from "@/services/inventory.service.server";
import { inventoryIdSchema } from "@/validators/inventory";
export const Route = createFileRoute("/api/stock/movements/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        withApiSession(request, async (session) => {
          const data = await getMovement(
            session.user.id,
            inventoryIdSchema.parse(params.id),
          );
          if (!data)
            throw new ApiError(404, "NOT_FOUND", "Catatan tidak ditemukan.");
          return Response.json({ data });
        }),
    },
  },
});
