import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/index.server";
import { stockMovements } from "@/db/schema/stock-movements";
import { movementFields } from "./inventory.service.server";
import type { ReportQuery } from "@/validators/reports";
import type { ReportExportQuery } from "@/validators/reports";
import { getInventory } from "./inventory.service.server";
import { stockCsv, movementCsv, productTotalsCsv } from "@/lib/csv";

export async function exportReport(userId: string, input: ReportExportQuery) {
  if (input.kind === "stock") return stockCsv(await getInventory(userId));
  if (input.kind === "products") {
    const report = await getMovementReport(userId, {
      ...input,
      limit: 1,
      offset: 0,
    });
    return productTotalsCsv(report.productTotals);
  }
  const rows = await db
    .select(movementFields)
    .from(stockMovements)
    .where(reportScope(userId, input))
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id));
  return movementCsv(
    rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
  );
}

export function reportScope(
  userId: string,
  input: Pick<ReportQuery, "from" | "to">,
) {
  return and(
    eq(stockMovements.userId, userId),
    gte(stockMovements.createdAt, new Date(input.from + "T00:00:00+07:00")),
    lt(
      stockMovements.createdAt,
      new Date(Date.parse(input.to + "T00:00:00+07:00") + 86_400_000),
    ),
  );
}

export async function getMovementReport(userId: string, input: ReportQuery) {
  return db.transaction(
    async (tx) => {
      const scope = reportScope(userId, input);
      const [summary] = await tx
        .select({
          incoming:
            sql`coalesce(sum(${stockMovements.quantity}::bigint) filter (where ${stockMovements.direction} = 'in'), 0)`.mapWith(
              Number,
            ),
          outgoing:
            sql`coalesce(sum(${stockMovements.quantity}::bigint) filter (where ${stockMovements.direction} = 'out'), 0)`.mapWith(
              Number,
            ),
          count: sql`count(*)`.mapWith(Number),
        })
        .from(stockMovements)
        .where(scope);
      const rows = await tx
        .select(movementFields)
        .from(stockMovements)
        .where(scope)
        .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
        .limit(input.limit + 1)
        .offset(input.offset);
      const productTotals = await tx
        .select({
          productId: stockMovements.productId,
          productName: sql<string>`(array_agg(${stockMovements.productName} order by ${stockMovements.createdAt} desc, ${stockMovements.id} desc))[1]`,
          productSku: sql<string>`(array_agg(${stockMovements.productSku} order by ${stockMovements.createdAt} desc, ${stockMovements.id} desc))[1]`,
          incoming:
            sql`coalesce(sum(${stockMovements.quantity}::bigint) filter (where ${stockMovements.direction} = 'in'), 0)`.mapWith(
              Number,
            ),
          outgoing:
            sql`coalesce(sum(${stockMovements.quantity}::bigint) filter (where ${stockMovements.direction} = 'out'), 0)`.mapWith(
              Number,
            ),
        })
        .from(stockMovements)
        .where(scope)
        .groupBy(stockMovements.productId);
      productTotals.sort(
        (a, b) =>
          a.productName.localeCompare(b.productName, "id") ||
          a.productId.localeCompare(b.productId),
      );
      return {
        productTotals,
        summary,
        period: { from: input.from, to: input.to },
        data: rows
          .slice(0, input.limit)
          .map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
        meta: {
          limit: input.limit,
          offset: input.offset,
          hasMore: rows.length > input.limit,
        },
      };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" },
  );
}
