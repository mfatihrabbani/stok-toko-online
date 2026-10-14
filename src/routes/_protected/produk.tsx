import { createFileRoute } from "@tanstack/react-router";
import { ProductManager } from "@/components/inventory/product-manager";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_protected/produk")({
  head: () => ({ meta: [{ title: `Produk | ${siteConfig.name}` }] }),
  component: ProductManager,
});
