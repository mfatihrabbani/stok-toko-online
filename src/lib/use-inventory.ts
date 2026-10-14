import { getRouteApi, useRouter } from "@tanstack/react-router";

export function useInventory() {
  const { products, categories } = getRouteApi("/_protected").useLoaderData();
  const router = useRouter();
  return { products, categories, refresh: () => router.invalidate() };
}
