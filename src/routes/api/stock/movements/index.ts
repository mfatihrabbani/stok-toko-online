import { createFileRoute } from "@tanstack/react-router";
import { withApiSession } from "@/lib/api.server";
import { listMovements } from "@/services/inventory.service.server";
import { listMovementsSchema } from "@/validators/inventory";

export const Route = createFileRoute("/api/stock/movements/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async (session) => {
          const query = listMovementsSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          return Response.json(await listMovements(session.user.id, query));
        }),
    },
  },
});
