import { Layers, Package, PackageX, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, stockStatus, type Product } from "@/lib/inventory";

export function StockSummary({ products }: { products: Product[] }) {
  const categories = [...new Set(products.map((product) => product.category))];
  const categoryCounts = categories.map(
    (category) =>
      products.filter((product) => product.category === category).length,
  );
  const total = products.reduce((sum, product) => sum + product.stock, 0);
  const low = products.filter((product) => stockStatus(product) === "Menipis");
  const empty = products.filter(
    (product) => stockStatus(product) === "Habis",
  ).length;
  const lowPercent = products.length ? (low.length / products.length) * 100 : 0;
  const emptyPercent = products.length ? (empty / products.length) * 100 : 0;
  const circumference = 2 * Math.PI * 24;
  return (
    <section className="stock-summary" aria-label="Ringkasan persediaan">
      <Card className="gap-4 py-5 shadow-none">
        <CardHeader className="px-5">
          <CardTitle>
            <h2 className="flex items-center justify-between gap-2 text-sm">
              Total produk{" "}
              <Package
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 px-5">
          <div>
            <strong className="stock-kpi-value">
              {formatNumber(products.length)}
            </strong>
            <p className="text-xs text-muted-foreground">produk</p>
          </div>
          <svg
            className="stock-kpi-chart"
            viewBox="0 0 120 72"
            role="img"
            aria-label={
              categories
                .map(
                  (category, index) =>
                    `${category}: ${categoryCounts[index]} produk`,
                )
                .join(", ") || "Belum ada kategori"
            }
          >
            {categoryCounts.map((count, index) => {
              const height = (count / Math.max(...categoryCounts, 1)) * 40;
              return (
                <g key={categories[index]}>
                  <rect
                    x={8 + index * 27}
                    y={64 - height}
                    width="17"
                    height={height}
                    rx="3"
                    fill="currentColor"
                  />
                  <text
                    x={16 + index * 27}
                    y={58 - height}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
        <CardFooter className="mx-5 border-t px-0 pt-4">
          <p className="text-xs">{categories.length} kategori terdaftar</p>
        </CardFooter>
      </Card>
      <Card className="gap-4 py-5 shadow-none">
        <CardHeader className="px-5">
          <CardTitle>
            <h2 className="flex items-center justify-between gap-2 text-sm">
              Total stok{" "}
              <Layers
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <strong className="stock-kpi-value">{formatNumber(total)}</strong>
          <p className="text-xs text-muted-foreground">unit</p>
        </CardContent>
        <CardFooter className="mx-5 border-t px-0 pt-4">
          <p className="text-xs text-muted-foreground">
            Jumlah seluruh persediaan
          </p>
        </CardFooter>
      </Card>
      <Card className="gap-4 py-5 shadow-none">
        <CardHeader className="px-5">
          <CardTitle>
            <h2 className="flex items-center justify-between gap-2 text-sm">
              Stok menipis{" "}
              <TriangleAlert
                className="size-4 text-warning"
                aria-hidden="true"
              />
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 px-5">
          <div>
            <strong className="stock-kpi-value text-warning">
              {formatNumber(low.length)}
            </strong>
            <p className="text-xs text-muted-foreground">produk</p>
          </div>
          <svg
            className="stock-kpi-chart text-warning"
            viewBox="0 0 120 72"
            role="img"
            aria-label={
              low
                .slice(0, 3)
                .map(
                  (product) =>
                    `${product.name}: ${product.stock} dari minimal ${product.minStock}`,
                )
                .join(", ") || "Tidak ada stok menipis"
            }
          >
            {low.slice(0, 3).map((product, index) => (
              <g key={product.id}>
                <text
                  x="0"
                  y={20 + index * 20}
                  fontSize="10"
                  fill="currentColor"
                >
                  {product.stock}/{product.minStock}
                </text>
                <rect
                  x="40"
                  y={12 + index * 20}
                  width="76"
                  height="6"
                  rx="3"
                  fill="var(--secondary)"
                />
                <rect
                  x="40"
                  y={12 + index * 20}
                  width={
                    76 *
                    Math.min(product.stock / Math.max(product.minStock, 1), 1)
                  }
                  height="6"
                  rx="3"
                  fill="currentColor"
                />
              </g>
            ))}
          </svg>
        </CardContent>
        <CardFooter className="mx-5 border-t px-0 pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-warning">
              {formatNumber(Math.round(lowPercent))}%
            </span>{" "}
            dari seluruh produk
          </p>
        </CardFooter>
      </Card>
      <Card className="gap-4 py-5 shadow-none">
        <CardHeader className="px-5">
          <CardTitle>
            <h2 className="flex items-center justify-between gap-2 text-sm">
              Stok habis{" "}
              <PackageX
                className="size-4 text-destructive"
                aria-hidden="true"
              />
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 px-5">
          <div>
            <strong className="stock-kpi-value text-destructive">
              {formatNumber(empty)}
            </strong>
            <p className="text-xs text-muted-foreground">produk</p>
          </div>
          <svg
            className="stock-kpi-ring"
            viewBox="0 0 64 64"
            role="img"
            aria-label={`${formatNumber(Math.round(emptyPercent * 10) / 10)} persen produk habis`}
          >
            <circle
              cx="32"
              cy="32"
              r="24"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r="24"
              fill="none"
              stroke="var(--destructive)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(circumference * emptyPercent) / 100} ${circumference}`}
              transform="rotate(-90 32 32)"
            />
            <text
              x="32"
              y="36"
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              {formatNumber(Math.round(emptyPercent * 10) / 10)}%
            </text>
          </svg>
        </CardContent>
        <CardFooter className="mx-5 border-t px-0 pt-4">
          <p className="text-xs text-muted-foreground">
            {empty ? "Perlu diisi kembali" : "Semua produk tersedia"}
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}
