import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/api.server";
import { withInventorySession } from "@/lib/inventory-api.server";
import {
  createProduct,
  listProducts,
} from "@/services/inventory.service.server";
import {
  createProductSchema,
  listProductsSchema,
} from "@/validators/inventory";

export const Route = createFileRoute("/api/products/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withInventorySession(request, async (session) => {
          const query = listProductsSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          return Response.json(await listProducts(session.user.id, query));
        }),
      POST: ({ request }) =>
        withInventorySession(request, async (session) => {
          const data = await createProduct(
            session.user.id,
            createProductSchema.parse(await readJson(request)),
          );
          return Response.json(
            { data },
            { status: 201, headers: { Location: `/api/products/${data.id}` } },
          );
        }),
    },
  },
});
