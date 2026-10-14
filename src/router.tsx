import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function Pending() {
  return (
    <div
      role="status"
      className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted-foreground"
    >
      Loading your app…
    </div>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    getScrollRestorationKey: (location) =>
      location.pathname === "/app"
        ? location.href
        : (location.state.__TSR_key ?? location.href),
    defaultPreload: "intent",
    defaultPendingComponent: Pending,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
