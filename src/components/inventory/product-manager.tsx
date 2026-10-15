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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  filterProducts,
  formatNumber,
  stockStatus,
  type Product,
} from "@/lib/inventory";

import { useInventory } from "@/lib/use-inventory";
import { inventoryRequest } from "@/lib/inventory-client";

export function ProductManager() {
  const {
    products: savedProducts,
    categories: savedCategories,
    refresh,
  } = useInventory();
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const [products, setProducts] = useState<Product[]>(savedProducts);
  const [filters, setFilters] = useState(defaultProductFilters);
  const [categoryRecords, setCategoryRecords] = useState(savedCategories);
  const categories = [
    ...new Set([
      ...categoryRecords.map((item) => item.name),
      ...products.map((item) => item.category),
    ]),
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
          if (!open && !saving) closeEditor();
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-32px)] overflow-y-auto">
          {failure && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {failure}
            </p>
          )}
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
            saving={saving}
            onSave={async (product) => {
              if (saving) return;
              setSaving(true);
              setFailure("");
              try {
                const metadata = {
                  name: product.name,
                  sku: product.sku,
                  category: product.category,
                  minStock: product.minStock,
                  unit: product.unit,
                };
                const saved = await inventoryRequest<Product>(
                  editing ? `/api/products/${product.id}` : "/api/products",
                  {
                    method: editing ? "PATCH" : "POST",
                    body: editing
                      ? metadata
                      : { ...metadata, id: product.id, stock: product.stock },
                  },
                );
                setProducts((current) =>
                  editing
                    ? current.map((item) =>
                        item.id === saved.id ? saved : item,
                      )
                    : [...current, saved],
                );
                void inventoryRequest<Array<{ id: string; name: string }>>(
                  "/api/categories",
                )
                  .then(setCategoryRecords)
                  .catch(() => {});
                closeEditor();
                setMessage(
                  `${saved.name} ${editing ? "diperbarui" : "ditambahkan"}.`,
                );
                void refresh().catch(() => {});
              } catch (error) {
                setFailure(
                  error instanceof Error
                    ? error.message
                    : "Produk belum tersimpan. Coba lagi.",
                );
              } finally {
                setSaving(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !saving) setDeleting(undefined);
        }}
      >
        <DialogContent>
          {failure && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {failure}
            </p>
          )}
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
              disabled={saving}
              onClick={async () => {
                if (!deleting || saving) return;
                setSaving(true);
                setFailure("");
                try {
                  await inventoryRequest<void>(`/api/products/${deleting.id}`, {
                    method: "DELETE",
                  });
                  setProducts((current) =>
                    current.filter((item) => item.id !== deleting.id),
                  );
                  setMessage(
                    `${deleting.name} dihapus dari daftar aktif. Riwayat tetap tersimpan.`,
                  );
                  setDeleting(undefined);
                  void refresh().catch(() => {});
                } catch (error) {
                  setFailure(
                    error instanceof Error
                      ? error.message
                      : "Produk belum dihapus. Coba lagi.",
                  );
                } finally {
                  setSaving(false);
                }
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
        <CardHeader className="gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <CardTitle>
                <h2 className="flex flex-wrap items-center gap-2.5 text-lg">
                  Semua produk{" "}
                  <Badge variant="outline" className="font-medium tabular-nums">
                    {formatNumber(products.length)}
                  </Badge>
                </h2>
              </CardTitle>
              <CardDescription>
                Produk yang tersimpan pada toko Anda.
              </CardDescription>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <CategoryManager
                categories={categories}
                onChange={async (oldName, name) => {
                  const category = categoryRecords.find(
                    (item) => item.name === oldName,
                  );
                  if (oldName && !category)
                    throw new Error(
                      "Muat ulang halaman untuk mendapatkan kategori terbaru.",
                    );
                  const result = await inventoryRequest<
                    { id: string; name: string } | undefined
                  >(
                    category
                      ? `/api/categories/${category.id}`
                      : "/api/categories",
                    {
                      method:
                        name === null ? "DELETE" : category ? "PATCH" : "POST",
                      body: name === null ? undefined : { name },
                    },
                  );
                  setCategoryRecords((current) => [
                    ...current.filter((item) => item.id !== category?.id),
                    ...(result ? [result] : []),
                  ]);
                  if (oldName)
                    setProducts((current) =>
                      current.map((item) =>
                        item.category === oldName
                          ? {
                              ...item,
                              category: result?.name || "Tanpa kategori",
                            }
                          : item,
                      ),
                    );
                  setFilters(defaultProductFilters);
                  void refresh().catch(() => {});
                }}
              />
              <Button onClick={() => setCreating(true)}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                Tambah produk
              </Button>
            </div>
          </div>
          <StockFilters
            className="mt-0 border-t pt-5"
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
