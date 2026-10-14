import { Link } from "@tanstack/react-router";
import { ArrowUpRight, PackageX } from "lucide-react";
import { StockStatus } from "@/components/inventory/stock-status";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import type { StockSearch } from "@/lib/stock-search";

export function StockTable({
  products,
  emptyTitle = "Belum ada produk",
  emptyDescription = "Produk pertama yang Anda tambahkan akan muncul di daftar ini.",
  onReset,
  returnSearch,
}: {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  onReset?: () => void;
  returnSearch?: StockSearch;
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
          <TableHead>
            <span className="sr-only">Detail produk</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} data-status={stockStatus(product)}>
            <TableCell className="product-cell">
              <Link
                to="/products/$id"
                params={{ id: product.id }}
                search={returnSearch}
                className="block w-fit rounded-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                {product.name}
              </Link>
              <span className="mt-1 block text-xs text-muted-foreground">
                {product.sku || "Tanpa SKU"}
              </span>
            </TableCell>
            <TableCell className="category-cell">{product.category}</TableCell>
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
              <StockStatus product={product} />
            </TableCell>
            <TableCell className="action-cell">
              <Button asChild variant="ghost" size="icon">
                <Link
                  to="/products/$id"
                  params={{ id: product.id }}
                  search={returnSearch}
                  aria-label={`Lihat detail ${product.name}`}
                >
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
