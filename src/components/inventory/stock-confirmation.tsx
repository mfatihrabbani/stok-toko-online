import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber, type Product } from "@/lib/inventory";

export function StockConfirmation({
  product,
  quantity,
  note,
  open,
  onOpenChange,
  onCloseFocus,
  onConfirm,
  direction = "in",
  saving = false,
}: {
  product?: Product;
  quantity: number;
  note: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseFocus: () => void;
  onConfirm?: () => void;
  direction?: "in" | "out";
  saving?: boolean;
}) {
  if (!product) return null;
  const newStock = product.stock + quantity * (direction === "out" ? -1 : 1);
  const valid =
    Number.isSafeInteger(quantity) &&
    quantity > 0 &&
    newStock >= 0 &&
    newStock <= 2147483647;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-32px)] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseFocus();
        }}
      >
        <DialogHeader className="pr-8">
          <DialogTitle>Konfirmasi perubahan stok</DialogTitle>
          <DialogDescription>
            Periksa produk, jumlah, dan stok baru sebelum menyimpan.
          </DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Produk</dt>
            <dd className="min-w-0 max-w-[65%] break-words text-right font-medium">
              {product.name}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Jenis catatan</dt>
            <dd>Barang {direction === "out" ? "keluar" : "masuk"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Jumlah</dt>
            <dd>
              {formatNumber(quantity)} {product.unit}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Catatan</dt>
            <dd className="min-w-0 max-w-[65%] break-words text-right">
              {note.trim() || "Tanpa catatan"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3 rounded-md bg-muted p-3">
            <dt>Stok saat ini → stok baru</dt>
            <dd className="font-semibold tabular-nums">
              {formatNumber(product.stock)} → {formatNumber(newStock)}{" "}
              {product.unit}
            </dd>
          </div>
        </dl>
        {direction === "out" && newStock < product.minStock && (
          <p className="rounded-md bg-warning-soft p-3 text-sm text-warning">
            Setelah dicatat, stok berada di bawah batas minimal{" "}
            {formatNumber(product.minStock)} {product.unit}.
          </p>
        )}
        <p className="rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
          Menyimpan catatan akan{" "}
          {direction === "out" ? "mengurangi" : "menambah"} stok produk dan
          mencatatnya di riwayat.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Ubah catatan
          </Button>
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={!valid || saving}
              aria-busy={saving}
            >
              {saving
                ? "Menyimpan..."
                : `Simpan barang ${direction === "out" ? "keluar" : "masuk"}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
