import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { listProducts } from "@/services/inventory.service.server";
import { listProductsSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/products/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const query = listProductsSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          return Response.json(await listProducts(session.user.id, query));
        }),
    },
  },
});
