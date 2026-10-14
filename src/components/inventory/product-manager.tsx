import { useState } from "react";
import { StockStatus } from "@/components/inventory/stock-status";
import { ProductEditor } from "@/components/inventory/product-editor";
import { CategoryManager } from "@/components/inventory/category-manager";
import { StockFilters } from "@/components/inventory/stock-filters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  defaultProductFilters,
  demoProducts,
  filterProducts,
  formatNumber,
  stockStatus,
  type Product,
} from "@/lib/inventory";

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [filters, setFilters] = useState(defaultProductFilters);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const categories = [
    ...new Set([...extraCategories, ...products.map((item) => item.category)]),
  ].sort();
  const visible = filterProducts(products, filters);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Product>();
  const [deleting, setDeleting] = useState<Product>();
  const closeEditor = () => {
    setCreating(false);
    setEditing(undefined);
  };
  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-32px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah produk" : "Tambah produk"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Ubah identitas dan batas stok. Catat perubahan jumlah melalui barang masuk atau keluar."
                : "Isi identitas produk dan stok awal."}
            </DialogDescription>
          </DialogHeader>
          <ProductEditor
            products={products}
            key={editing?.id ?? "new"}
            initialProduct={editing}
            categories={categories}
            onCancel={closeEditor}
            onSave={(product) => {
              setProducts((current) =>
                editing
                  ? current.map((item) =>
                      item.id === product.id ? product : item,
                    )
                  : [...current, product],
              );
              closeEditor();
              setMessage(
                `${product.name} ${editing ? "diperbarui" : "ditambahkan"} pada data contoh.`,
              );
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus produk?</DialogTitle>
            <DialogDescription>
              {deleting?.name} akan dihapus dari daftar produk. Periksa kembali
              sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleting) return;
                setProducts((current) =>
                  current.filter((item) => item.id !== deleting.id),
                );
                setMessage(`${deleting.name} dihapus dari data contoh.`);
                setDeleting(undefined);
              }}
            >
              Hapus produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {message && (
        <p
          role="status"
          className="rounded-md bg-success-soft p-3 text-sm text-success"
        >
          {message}
        </p>
      )}
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
          <CategoryManager
            categories={categories}
            onChange={(oldName, name) => {
              setExtraCategories((current) => [
                ...current.filter((item) => item !== oldName),
                ...(name ? [name] : []),
              ]);
              if (oldName)
                setProducts((current) =>
                  current.map((item) =>
                    item.category === oldName
                      ? { ...item, category: name || "Tanpa kategori" }
                      : item,
                  ),
                );
              setFilters(defaultProductFilters);
            }}
          />
          <Button className="w-fit self-end" onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Tambah produk
          </Button>
          <CardTitle>
            <h2 className="flex items-center gap-3 text-xl">
              Semua produk <Badge variant="outline">{products.length}</Badge>
            </h2>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Data contoh untuk pratinjau pengelolaan produk.
          </p>
          <StockFilters
            products={products}
            filters={filters}
            onChange={(changes) =>
              setFilters((current) => ({ ...current, ...changes }))
            }
            onReset={() => setFilters(defaultProductFilters)}
          />
          <p role="status" className="text-xs text-muted-foreground">
            {visible.length} produk ditemukan
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
                <TableHead>Kelola</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!visible.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="col-span-2 py-12 text-center text-muted-foreground"
                  >
                    {products.length
                      ? "Produk tidak ditemukan. Ubah pencarian atau reset filter."
                      : "Belum ada produk. Tambahkan produk pertama Anda."}
                  </TableCell>
                </TableRow>
              )}
              {visible.map((product) => (
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
                    <span
                      className={
                        stockStatus(product) === "Habis"
                          ? "font-semibold text-destructive"
                          : stockStatus(product) === "Menipis"
                            ? "font-semibold text-warning"
                            : "font-medium"
                      }
                    >
                      {formatNumber(product.stock)} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell data-label="Minimal">
                    {formatNumber(product.minStock)} {product.unit}
                  </TableCell>
                  <TableCell className="status-cell">
                    <StockStatus product={product} />
                  </TableCell>
                  <TableCell className="product-manage-cell">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Ubah ${product.name}`}
                        onClick={() => setEditing(product)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Hapus ${product.name}`}
                        onClick={() => setDeleting(product)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
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
