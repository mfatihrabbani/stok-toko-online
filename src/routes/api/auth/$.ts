import { createFileRoute } from "@tanstack/react-router";
import { handleAuthRequest } from "@/lib/auth-handler.server";

// Better Auth owns everything under /api/auth: signup, signin, session, signout.
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthRequest(request),
      POST: ({ request }) => handleAuthRequest(request),
    },
  },
});
