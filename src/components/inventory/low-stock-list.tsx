import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LowStockList({
  products = demoProducts,
  handledIds = [],
  onHandled,
}: {
  products?: Product[];
  handledIds?: string[];
  onHandled?: (id: string) => Promise<void>;
}) {
  const [localHandled, setLocalHandled] = useState<string[]>([]);
  const handled = new Set([...handledIds, ...localHandled]);
  const [view, setView] = useState("active");
  const [selected, setSelected] = useState<Product>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const low = sortLowStockProducts(products);
  const ordered = low.filter((item) => handled.has(item.id));
  const active = low.filter((item) => !handled.has(item.id));
  const visible = view === "handled" ? ordered : active;
  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !saving) setSelected(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai sudah dipesan?</DialogTitle>
            <DialogDescription>
              {selected?.name} akan dipindahkan ke daftar Sudah dipesan. Tanda
              ini mencatat rencana restok; jumlah stok tetap sama sampai barang
              diterima.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setSelected(undefined)}
            >
              Batal
            </Button>
            <Button
              disabled={saving}
              aria-busy={saving}
              onClick={async () => {
                if (!selected || saving) return;
                setSaving(true);
                setError("");
                try {
                  await onHandled?.(selected.id);
                  setLocalHandled((current) => [...current, selected.id]);
                  setMessage(
                    `${selected.name} ditandai sudah dipesan. Catat barang masuk saat restok tiba.`,
                  );
                  setSelected(undefined);
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : "Tanda belum tersimpan. Coba lagi.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Menyimpan..." : "Tandai sudah dipesan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Peringatan Stok
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Siapkan restok untuk produk menipis. Tandai produk yang sudah dipesan
          agar peringatannya tidak terus muncul.
        </p>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-md bg-success-soft p-3 text-sm text-success"
        >
          {message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Peringatan aktif", active.length],
          ["Sudah dipesan", ordered.length],
          ["Produk habis", low.filter((item) => item.stock === 0).length],
        ].map(([label, value]) => (
          <Card key={label} className="gap-3 shadow-none">
            <CardHeader>
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <strong className="text-[28px] font-semibold tabular-nums">
                {value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>
              <h2 className="text-xl">
                {view === "handled" ? "Sudah dipesan" : "Perlu ditangani"}
              </h2>
            </CardTitle>
            <ToggleGroup
              type="single"
              variant="outline"
              value={view}
              onValueChange={(value) => {
                if (value) setView(value);
              }}
              aria-label="Status peringatan"
            >
              <ToggleGroupItem value="active">Aktif</ToggleGroupItem>
              <ToggleGroupItem value="handled">Sudah dipesan</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p className="text-xs text-muted-foreground">
            Produk habis ditampilkan lebih dulu, lalu stok yang paling jauh dari
            batas aman.
          </p>
        </CardHeader>
        <CardContent>
          {!visible.length ? (
            <Empty className="min-h-56">
              <EmptyHeader>
                <EmptyTitle>
                  {!products.length
                    ? "Belum ada produk"
                    : !low.length
                      ? "Semua stok aman"
                      : view === "handled"
                        ? "Belum ada produk ditandai"
                        : "Semua peringatan ditangani"}
                </EmptyTitle>
                <EmptyDescription>
                  {!products.length
                    ? "Tambahkan produk dan atur batas minimal persediaan."
                    : !low.length
                      ? "Stok seluruh produk memenuhi batas minimal."
                      : view === "handled"
                        ? "Produk yang sudah dipesan akan muncul di sini."
                        : "Pantau kedatangan restok melalui daftar Sudah dipesan, lalu catat barang masuk."}
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
              {visible.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-5 rounded-lg border p-5"
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
                  <div className="flex flex-wrap gap-3">
                    {handled.has(product.id) ? (
                      <Badge variant="outline">Sudah dipesan</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelected(product);
                          setError("");
                        }}
                      >
                        <Check data-icon="inline-start" aria-hidden="true" />
                        Tandai sudah dipesan
                      </Button>
                    )}
                    <Button asChild>
                      <Link to="/barang-masuk" search={{ product: product.id }}>
                        Catat restok
                      </Link>
                    </Button>
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
