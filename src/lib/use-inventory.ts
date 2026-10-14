import { getRouteApi, useRouter } from "@tanstack/react-router";

export function useInventory() {
  const products = getRouteApi("/_protected").useLoaderData();
  const router = useRouter();
  return { products, refresh: () => router.invalidate() };
}
