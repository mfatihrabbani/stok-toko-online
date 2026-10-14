import { Check, PackageX, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function StockTable({
  products,
  emptyTitle = "Belum ada produk",
  emptyDescription = "Produk pertama yang Anda tambahkan akan muncul di daftar ini.",
  onReset,
}: {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  onReset?: () => void;
}) {
  if (products.length === 0) {
    return (
      <Empty className="min-h-64">
        <EmptyHeader>
          <EmptyMedia>
            <PackageX
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          </EmptyMedia>
          <EmptyTitle>
            <h3>{emptyTitle}</h3>
          </EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
        {onReset && (
          <EmptyContent>
            <Button variant="outline" onClick={onReset}>
              Reset pencarian dan filter
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }
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
