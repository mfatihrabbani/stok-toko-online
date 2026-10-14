import { Check, PackageX, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, stockStatus, type Product } from "@/lib/inventory";

export function StockTable({ products }: { products: Product[] }) {
  return (
    <Table className="stock-table">
      <TableCaption className="sr-only">
        Daftar produk dan jumlah stok yang tersedia
      </TableCaption>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Produk</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Stok saat ini</TableHead>
          <TableHead>Minimal</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const status = stockStatus(product);
          const StatusIcon =
            status === "Aman"
              ? Check
              : status === "Habis"
                ? PackageX
                : TriangleAlert;
          return (
            <TableRow key={product.id} data-status={status}>
              <TableCell className="product-cell">
                <span className="block font-medium">{product.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {product.sku || "Tanpa SKU"}
                </span>
              </TableCell>
              <TableCell className="category-cell">
                {product.category}
              </TableCell>
              <TableCell data-label="Stok saat ini" className="tabular-nums">
                <strong className="text-lg font-semibold">
                  {formatNumber(product.stock)}
                </strong>
                <span className="ml-1 text-xs text-muted-foreground">
                  {product.unit}
                </span>
              </TableCell>
              <TableCell data-label="Stok minimal" className="tabular-nums">
                {formatNumber(product.minStock)}
                <span className="ml-1 text-xs text-muted-foreground">
                  {product.unit}
                </span>
              </TableCell>
              <TableCell className="status-cell">
                <Badge
                  variant={
                    status === "Aman"
                      ? "success"
                      : status === "Habis"
                        ? "empty"
                        : "warning"
                  }
                >
                  <StatusIcon aria-hidden="true" />
                  {status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
