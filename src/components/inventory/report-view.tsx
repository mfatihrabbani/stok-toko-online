import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoProducts, formatNumber, type Product } from "@/lib/inventory";
import { demoMovements, type StockMovement } from "@/lib/movements";
import { StockSummary } from "./stock-summary";

export function ReportView({
  products = demoProducts,
  movements = demoMovements,
}: {
  products?: Product[];
  movements?: StockMovement[];
}) {
  const incoming = movements
    .filter((item) => item.direction === "in")
    .reduce((total, item) => total + item.quantity, 0);
  const outgoing = movements
    .filter((item) => item.direction === "out")
    .reduce((total, item) => total + item.quantity, 0);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Laporan Stok
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Lihat ringkasan pergerakan untuk periode tertentu dan ekspor ke
          spreadsheet.
        </p>
      </header>
      <StockSummary products={products} />
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Masuk & keluar</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">
            {formatNumber(incoming)} unit masuk · {formatNumber(outgoing)} unit
            keluar · {formatNumber(incoming - outgoing)} unit perubahan neto
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Data contoh untuk pratinjau laporan.
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Stok saat ini</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {formatNumber(products.length)} produk ·{" "}
            {formatNumber(
              products.reduce((sum, product) => sum + product.stock, 0),
            )}{" "}
            unit tersedia. Ringkasan ini menunjukkan persediaan saat ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
