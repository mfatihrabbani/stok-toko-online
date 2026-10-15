import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatNumber } from "@/lib/inventory";
import type { ProductMovementTotal } from "@/lib/reports";

export function ReportProductTotals({
  products,
}: {
  products: ProductMovementTotal[];
}) {
  if (!products.length)
    return (
      <Empty className="min-h-48">
        <EmptyHeader>
          <EmptyTitle>Belum ada pergerakan pada periode ini</EmptyTitle>
          <EmptyDescription>
            Pilih periode lain untuk melihat ringkasan per produk.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return (
    <Table className="stock-table">
      <TableCaption className="sr-only">
        Ringkasan pergerakan per produk pada periode laporan
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead>Total masuk</TableHead>
          <TableHead>Total keluar</TableHead>
          <TableHead>Perubahan neto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.productId}>
            <TableCell className="product-cell">
              <strong>{product.productName}</strong>
              <p className="text-xs text-muted-foreground">
                {product.productSku || "Tanpa SKU"}
              </p>
            </TableCell>
            <TableCell
              data-label="Total masuk"
              className="tabular-nums text-success"
            >
              {formatNumber(product.incoming)} unit
            </TableCell>
            <TableCell
              data-label="Total keluar"
              className="tabular-nums text-destructive"
            >
              {formatNumber(product.outgoing)} unit
            </TableCell>
            <TableCell data-label="Perubahan neto" className="tabular-nums">
              {formatNumber(product.incoming - product.outgoing)} unit
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
