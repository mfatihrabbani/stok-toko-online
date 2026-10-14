import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MovementHistory } from "@/components/inventory/movement-history";
import { siteConfig } from "@/config/site";
import { getMovementsFn } from "@/lib/inventory-queries";
import type { MovementFilters } from "@/lib/movements";
interface HistorySearch {
  q?: string;
  from?: string;
  to?: string;
  direction?: "in" | "out";
  offset?: number;
}
export const Route = createFileRoute("/_protected/riwayat")({
  validateSearch: (search: Record<string, unknown>): HistorySearch => ({
    q: typeof search.q === "string" ? search.q.slice(0, 160) : undefined,
    from: z.iso.date().safeParse(search.from).success
      ? (search.from as string)
      : undefined,
    to: z.iso.date().safeParse(search.to).success
      ? (search.to as string)
      : undefined,
    direction:
      search.direction === "in" || search.direction === "out"
        ? search.direction
        : undefined,
    offset:
      z.coerce.number().int().min(0).max(1_000_000).safeParse(search.offset)
        .data ?? 0,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    deps.from && deps.to && deps.from > deps.to
      ? { data: [], meta: { offset: 0, limit: 50, hasMore: false } }
      : getMovementsFn({ data: { ...deps, limit: 50 } }),
  head: () => ({ meta: [{ title: `Riwayat | ${siteConfig.name}` }] }),
  component: HistoryPage,
});
function HistoryPage() {
  const { data, meta } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const filters: MovementFilters = {
    q: search.q ?? "",
    from: search.from ?? "",
    to: search.to ?? "",
    direction: search.direction ?? "all",
  };
  return (
    <MovementHistory
      initialMovements={data}
      filters={filters}
      onFiltersChange={(next) => {
        void navigate({
          search: {
            q: next.q || undefined,
            from: next.from || undefined,
            to: next.to || undefined,
            direction: next.direction === "all" ? undefined : next.direction,
            offset: 0,
          },
          replace: true,
          resetScroll: false,
        });
      }}
      pagination={{
        offset: meta.offset,
        hasMore: meta.hasMore,
        onChange: (offset) => {
          void navigate({ search: { ...search, offset }, resetScroll: false });
        },
      }}
    />
  );
}
