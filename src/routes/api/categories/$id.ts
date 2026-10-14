import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import {
  deleteCategory,
  renameCategory,
} from "@/services/categories.service.server";
import { categoryInputSchema, inventoryIdSchema } from "@/validators/inventory";
export const Route = createFileRoute("/api/categories/$id")({
  server: {
    handlers: {
      PATCH: ({ request, params }) =>
        withInventorySession(request, async (session) =>
          Response.json({
            data: await renameCategory(
              session.user.id,
              inventoryIdSchema.parse(params.id),
              categoryInputSchema.parse(await readJson(request)).name,
            ),
          }),
        ),
      DELETE: ({ request, params }) =>
        withInventorySession(request, async (session) => {
          await deleteCategory(
            session.user.id,
            inventoryIdSchema.parse(params.id),
          );
          return new Response(null, { status: 204 });
        }),
    },
  },
});
