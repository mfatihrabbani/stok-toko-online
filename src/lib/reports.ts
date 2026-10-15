import type { StockMovement } from "./movements";

export interface ProductMovementTotal {
  productId: string;
  productName: string;
  productSku: string;
  incoming: number;
  outgoing: number;
}

export function groupReportMovements(
  movements: StockMovement[],
): ProductMovementTotal[] {
  const grouped = new Map<string, ProductMovementTotal>();
  for (const row of [...movements].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )) {
    const product = grouped.get(row.productId) ?? {
      productId: row.productId,
      productName: row.productName,
      productSku: row.productSku,
      incoming: 0,
      outgoing: 0,
    };
    if (row.direction === "in") product.incoming += row.quantity;
    else product.outgoing += row.quantity;
    grouped.set(row.productId, product);
  }
  return [...grouped.values()].sort((a, b) =>
    a.productName.localeCompare(b.productName, "id"),
  );
}

export interface ReportPeriod {
  from: string;
  to: string;
}

export function defaultReportPeriod(): ReportPeriod {
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { from: today.slice(0, 8) + "01", to: today };
}

export function formatReportDate(date: string) {
  return new Date(date + "T00:00:00+07:00").toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
  });
}
