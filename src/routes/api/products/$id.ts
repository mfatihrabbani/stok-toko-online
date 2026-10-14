import { createFileRoute } from "@tanstack/react-router";
import { ApiError, readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import {
  archiveProduct,
  getProduct,
  updateProduct,
} from "@/services/inventory.service.server";
import { inventoryIdSchema, updateProductSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/products/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        withInventorySession(request, async (session) => {
          const data = await getProduct(
            session.user.id,
            inventoryIdSchema.parse(params.id),
          );
          if (!data)
            throw new ApiError(404, "NOT_FOUND", "Produk tidak ditemukan.");
          return Response.json({ data });
        }),
      PATCH: ({ request, params }) =>
        withInventorySession(request, async (session) =>
          Response.json({
            data: await updateProduct(
              session.user.id,
              inventoryIdSchema.parse(params.id),
              updateProductSchema.parse(await readJson(request)),
            ),
          }),
        ),
      DELETE: ({ request, params }) =>
        withInventorySession(request, async (session) => {
          if (
            !(await archiveProduct(
              session.user.id,
              inventoryIdSchema.parse(params.id),
            ))
          )
            throw new ApiError(404, "NOT_FOUND", "Produk tidak ditemukan.");
          return new Response(null, { status: 204 });
        }),
    },
  },
});
