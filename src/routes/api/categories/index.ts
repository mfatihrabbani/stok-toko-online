import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import {
  createCategory,
  listCategories,
} from "@/services/categories.service.server";
import { categoryInputSchema } from "@/validators/inventory";
export const Route = createFileRoute("/api/categories/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withInventorySession(request, async (session) =>
          Response.json({ data: await listCategories(session.user.id) }),
        ),
      POST: ({ request }) =>
        withInventorySession(request, async (session) =>
          Response.json(
            {
              data: await createCategory(
                session.user.id,
                categoryInputSchema.parse(await readJson(request)).name,
              ),
            },
            { status: 201 },
          ),
        ),
    },
  },
});
