import { useState } from "react";
import { StockStatus } from "@/components/inventory/stock-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { demoProducts, formatNumber, type Product } from "@/lib/inventory";

export function ProductManager() {
  const [products] = useState<Product[]>(demoProducts);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Produk
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Kelola nama, kategori, SKU, dan batas minimal persediaan.
        </p>
      </header>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-3 text-xl">
              Semua produk <Badge variant="outline">{products.length}</Badge>
            </h2>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Data contoh untuk pratinjau pengelolaan produk.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <Table className="stock-table">
            <TableCaption className="sr-only">
              Produk dan pengaturan persediaan
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Minimal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="product-cell">
                    <strong className="block">{product.name}</strong>
                    <span className="text-xs text-muted-foreground">
                      {product.sku || "Tanpa SKU"}
                    </span>
                  </TableCell>
                  <TableCell data-label="Kategori">
                    {product.category}
                  </TableCell>
                  <TableCell data-label="Stok">
                    {formatNumber(product.stock)} {product.unit}
                  </TableCell>
                  <TableCell data-label="Minimal">
                    {formatNumber(product.minStock)} {product.unit}
                  </TableCell>
                  <TableCell className="status-cell">
                    <StockStatus product={product} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
