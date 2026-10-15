import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/index.server";
import { stockMovements } from "@/db/schema/stock-movements";
import { movementFields } from "./inventory.service.server";
import type { ReportQuery } from "@/validators/reports";

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
      return {
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
