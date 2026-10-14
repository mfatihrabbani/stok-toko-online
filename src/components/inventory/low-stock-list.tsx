import {
  demoProducts,
  formatNumber,
  sortLowStockProducts,
  type Product,
} from "@/lib/inventory";
import { StockStatus } from "@/components/inventory/stock-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function LowStockList({
  products = demoProducts,
}: {
  products?: Product[];
}) {
  const low = sortLowStockProducts(products);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Peringatan Stok
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Siapkan restok untuk produk menipis. Tandai produk yang sudah dipesan
          agar peringatannya tidak terus muncul.
        </p>
      </header>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Perlu ditangani</h2>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Produk habis ditampilkan lebih dulu, lalu stok yang paling jauh dari
            batas aman. Data contoh.
          </p>
        </CardHeader>
        <CardContent>
          {!low.length ? (
            <Empty className="min-h-56">
              <EmptyHeader>
                <EmptyTitle>
                  {products.length ? "Semua stok aman" : "Belum ada produk"}
                </EmptyTitle>
                <EmptyDescription>
                  {products.length
                    ? "Stok seluruh produk memenuhi batas minimal. Peringatan akan muncul ketika stok menipis."
                    : "Tambahkan produk dan atur batas minimal agar aplikasi bisa mengingatkan waktu restok."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" asChild>
                  <Link to={products.length ? "/app" : "/produk"}>
                    {products.length ? "Lihat stok barang" : "Tambah produk"}
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {low.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5"
                >
                  <div className="min-w-0">
                    <h3 className="break-words font-medium">{product.name}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {product.sku || "Tanpa SKU"} · {product.category}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <StockStatus product={product} />
                      <p className="text-xs">
                        {formatNumber(product.stock)} {product.unit} tersedia ·
                        minimal {formatNumber(product.minStock)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-warning">
                      Perlu {formatNumber(product.minStock - product.stock)}{" "}
                      {product.unit} lagi untuk mencapai batas aman.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
