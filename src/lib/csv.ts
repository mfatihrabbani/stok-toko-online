import { stockStatus, type Product } from "./inventory";
import { formatDateTime, type StockMovement } from "./movements";
import type { ProductMovementTotal } from "./reports";

export function encodeCsv(rows: (string | number)[][]): string {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value);
            if (
              typeof value === "string" &&
              /^[\s\u0000-\u001f]*[=+\-@]/.test(text)
            )
              text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}

export function stockCsv(products: Product[]) {
  return encodeCsv([
    ["Produk", "SKU", "Kategori", "Stok", "Stok minimum", "Satuan", "Status"],
    ...products.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.stock,
      p.minStock,
      p.unit,
      stockStatus(p),
    ]),
  ]);
}

export function movementCsv(movements: StockMovement[]) {
  return encodeCsv([
    [
      "Waktu (WIB)",
      "Produk",
      "SKU",
      "Jenis",
      "Jumlah",
      "Stok sebelum",
      "Stok sesudah",
      "Catatan",
    ],
    ...movements.map((m) => [
      formatDateTime(m.createdAt),
      m.productName,
      m.productSku,
      m.direction === "in" ? "Masuk" : "Keluar",
      m.quantity,
      m.stockBefore,
      m.stockAfter,
      m.note,
    ]),
  ]);
}

export function productTotalsCsv(products: ProductMovementTotal[]) {
  return encodeCsv([
    ["Produk", "SKU", "Total masuk", "Total keluar", "Perubahan neto"],
    ...products.map((p) => [
      p.productName,
      p.productSku,
      p.incoming,
      p.outgoing,
      p.incoming - p.outgoing,
    ]),
  ]);
}

export function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
