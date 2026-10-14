import type { ProductFilters } from "@/lib/inventory";

export interface StockSearch {
  q?: string;
  category?: string;
  status?: "low" | "empty";
}

export function parseStockSearch(search: Record<string, unknown>): StockSearch {
  return {
    q:
      typeof search.q === "string" && search.q.trim()
        ? search.q.slice(0, 160)
        : undefined,
    category:
      typeof search.category === "string" && search.category !== "all"
        ? search.category.slice(0, 80)
        : undefined,
    status:
      search.status === "low" || search.status === "empty"
        ? search.status
        : undefined,
  };
}

export function stockFiltersFromSearch(search: StockSearch): ProductFilters {
  return {
    query: search.q ?? "",
    category: search.category ?? "all",
    status: search.status ?? "all",
  };
}

export function stockSearchFromFilters(filters: ProductFilters): StockSearch {
  return {
    q: filters.query || undefined,
    category: filters.category === "all" ? undefined : filters.category,
    status: filters.status === "all" ? undefined : filters.status,
  };
}
