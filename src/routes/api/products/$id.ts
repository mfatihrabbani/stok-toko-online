import { createFileRoute } from "@tanstack/react-router";
import { ApiError, withApiSession } from "@/lib/api.server";
import { getProduct } from "@/services/inventory.service.server";
import { inventoryIdSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/products/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        withApiSession(request, async (session) => {
          const data = await getProduct(
            session.user.id,
            inventoryIdSchema.parse(params.id),
          );
          if (!data)
            throw new ApiError(404, "NOT_FOUND", "Produk tidak ditemukan.");
          return Response.json({ data });
        }),
    },
  },
});
