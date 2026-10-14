import { createFileRoute } from "@tanstack/react-router";
import { MovementHistory } from "@/components/inventory/movement-history";
import { siteConfig } from "@/config/site";
export const Route = createFileRoute("/_protected/riwayat")({
  head: () => ({ meta: [{ title: `Riwayat | ${siteConfig.name}` }] }),
  component: MovementHistory,
});
