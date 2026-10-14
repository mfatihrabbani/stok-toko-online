import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StockStatus } from "@/components/inventory/stock-status";
import { demoProducts, formatNumber, stockStatus } from "@/lib/inventory";
import { siteConfig } from "@/config/site";
import { parseStockSearch } from "@/lib/stock-search";

export const Route = createFileRoute("/_protected/products/$id")({
  validateSearch: parseStockSearch,
  head: () => ({ meta: [{ title: `Detail produk | ${siteConfig.name}` }] }),
  loader: ({ params }) => {
    const product = demoProducts.find((item) => item.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetailPage,
  notFoundComponent: ProductNotFound,
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const search = Route.useSearch();
  const status = stockStatus(product);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
        Detail produk
      </h1>
      <Link
        to="/app"
        search={search}
        className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke stok
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>
                <h2 className="text-xl">{product.name}</h2>
              </CardTitle>
              <StockStatus product={product} />
            </div>
            <p className="text-xs text-muted-foreground">
              {product.sku || "Tanpa SKU"} · {product.category}
            </p>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <dt>Stok saat ini</dt>
                <dd className="text-right">
                  <strong className="text-[40px] leading-none font-semibold tabular-nums">
                    {formatNumber(product.stock)}
                  </strong>
                  <span className="ml-2">{product.unit}</span>
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <dt>Stok minimal</dt>
                <dd className="tabular-nums">
                  {formatNumber(product.minStock)} {product.unit}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <h2 className="text-sm">Kondisi persediaan</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {status === "Aman"
                ? "Stok memenuhi batas minimal."
                : status === "Habis"
                  ? "Produk habis. Catat barang masuk saat restok tiba."
                  : `Tambahkan minimal ${formatNumber(product.minStock - product.stock)} ${product.unit} untuk mencapai batas aman.`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductNotFound() {
  const search = Route.useSearch();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <PackageX className="size-8" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>
          <h1>Produk tidak ditemukan</h1>
        </EmptyTitle>
        <EmptyDescription>
          Produk yang Anda cari tidak tersedia. Kembali ke daftar stok untuk
          memilih produk lain.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/app" search={search}>
            Kembali ke stok
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
