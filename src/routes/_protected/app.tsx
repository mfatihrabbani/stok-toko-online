import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StockTable } from "@/components/inventory/stock-table";
import { demoProducts } from "@/lib/inventory";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/_protected/app")({
  head: () => ({ meta: [{ title: `Stok barang | ${siteConfig.name}` }] }),
  component: StockPage,
});

function StockPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
            Stok barang
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Periksa persediaan toko dalam satu daftar yang mudah dibaca.
          </p>
        </div>
      </div>
      <Card className="gap-0 overflow-hidden shadow-none">
        <CardHeader className="pb-6">
          <CardTitle>
            <h2 className="flex items-center gap-2 text-xl">
              Daftar produk{" "}
              <Badge variant="outline">{demoProducts.length}</Badge>
            </h2>
          </CardTitle>
          <CardDescription>
            Nama produk, jumlah tersedia, dan kondisi stok saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <StockTable products={demoProducts} />
        </CardContent>
        <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
          {demoProducts.length} produk ditampilkan
        </CardFooter>
      </Card>
    </div>
  );
}
