import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ArrowLeft, PackageX } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatNumber, stockStatus } from "@/lib/inventory";
import { getProductFn } from "@/lib/inventory-queries";
import { inventoryIdSchema } from "@/validators/inventory";
import { siteConfig } from "@/config/site";
import { parseStockSearch } from "@/lib/stock-search";

export const Route = createFileRoute("/_protected/products/$id")({
  validateSearch: parseStockSearch,
  head: () => ({ meta: [{ title: `Detail produk | ${siteConfig.name}` }] }),
  loader: async ({ params }) => {
    if (!inventoryIdSchema.safeParse(params.id).success) throw notFound();
    const detail = await getProductFn({ data: params.id });
    if (!detail) throw notFound();
    return detail;
  },
  component: ProductDetailPage,
  notFoundComponent: ProductNotFound,
});

function ProductDetailPage() {
  const { product, movements } = Route.useLoaderData();
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
          <CardFooter className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link
                to="/barang-keluar"
                search={{ ...search, product: product.id }}
              >
                <ArrowUpRight data-icon="inline-start" aria-hidden="true" />
                Catat keluar
              </Link>
            </Button>
            <Button asChild>
              <Link
                to="/barang-masuk"
                search={{ ...search, product: product.id }}
              >
                <ArrowDownLeft data-icon="inline-start" aria-hidden="true" />
                Catat masuk
              </Link>
            </Button>
          </CardFooter>
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
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Pergerakan terakhir</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length ? (
            <ul className="divide-y">
              {movements.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap justify-between gap-3 py-4"
                >
                  <div>
                    <strong>
                      {item.direction === "in"
                        ? "Barang masuk"
                        : "Barang keluar"}{" "}
                      · {formatNumber(item.quantity)} unit
                    </strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.note || "Tanpa catatan"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      {formatNumber(item.stockBefore)} →{" "}
                      {formatNumber(item.stockAfter)} unit
                    </p>
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada pergerakan stok. Catat barang masuk untuk memulai.
            </p>
          )}
        </CardContent>
      </Card>
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
