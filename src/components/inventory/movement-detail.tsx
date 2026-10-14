import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/inventory";
import { formatDateTime, type StockMovement } from "@/lib/movements";

export function MovementDetail({
  movement,
  onClose,
  onCloseFocus,
}: {
  movement?: StockMovement;
  onClose: () => void;
  onCloseFocus: () => void;
}) {
  return (
    <Dialog
      open={Boolean(movement)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-32px)] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail catatan stok</DialogTitle>
          <DialogDescription>
            Rincian perubahan persediaan yang telah dicatat.
          </DialogDescription>
        </DialogHeader>
        {movement && (
          <dl className="flex flex-col gap-5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Produk</dt>
              <dd className="mt-1 break-words font-semibold">
                {movement.productName}
              </dd>
              <dd className="text-xs text-muted-foreground">
                {movement.productSku || "Tanpa SKU"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Jenis</dt>
              <dd>
                {movement.direction === "in" ? "Barang masuk" : "Barang keluar"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Jumlah</dt>
              <dd className="font-semibold">
                {formatNumber(movement.quantity)} unit
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-3 rounded-md bg-muted p-3">
              <dt>Stok sebelum → sesudah</dt>
              <dd className="font-semibold tabular-nums">
                {formatNumber(movement.stockBefore)} →{" "}
                {formatNumber(movement.stockAfter)} unit
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Waktu (WIB)</dt>
              <dd className="mt-1">
                <time dateTime={movement.createdAt}>
                  {formatDateTime(movement.createdAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Catatan</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words">
                {movement.note || "Tanpa catatan"}
              </dd>
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
