import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatNumber } from "@/lib/inventory";
import { formatDateTime, type StockMovement } from "@/lib/movements";
import { MovementDetail } from "./movement-detail";

export function ReportMovements({ movements }: { movements: StockMovement[] }) {
  const [selected, setSelected] = useState<StockMovement>();
  const trigger = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <MovementDetail
        movement={selected}
        onClose={() => setSelected(undefined)}
        onCloseFocus={() => trigger.current?.focus()}
      />
      {movements.length ? (
        <Table className="stock-table">
          <TableCaption className="sr-only">
            Barang masuk dan keluar pada periode laporan
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Waktu (WIB)</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...movements]
              .sort(
                (a, b) =>
                  b.createdAt.localeCompare(a.createdAt) ||
                  b.id.localeCompare(a.id),
              )
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="product-cell">
                    <strong>{item.productName}</strong>
                    <p className="text-xs text-muted-foreground">
                      {item.productSku || "Tanpa SKU"}
                    </p>
                  </TableCell>
                  <TableCell className="status-cell">
                    <Badge
                      variant="outline"
                      className={
                        item.direction === "in"
                          ? "border-transparent bg-success-soft text-success"
                          : "border-transparent bg-destructive/10 text-destructive"
                      }
                    >
                      {item.direction === "in" ? "Masuk" : "Keluar"}
                    </Badge>
                  </TableCell>
                  <TableCell data-label="Jumlah" className="tabular-nums">
                    {item.direction === "in" ? "+" : "−"}
                    {formatNumber(item.quantity)} unit
                  </TableCell>
                  <TableCell data-label="Waktu">
                    <time dateTime={item.createdAt}>
                      {formatDateTime(item.createdAt)}
                    </time>
                  </TableCell>
                  <TableCell
                    data-label="Catatan"
                    className="max-w-60 whitespace-normal break-words"
                  >
                    {item.note || "Tanpa catatan"}
                  </TableCell>
                  <TableCell className="action-cell">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Detail catatan ${item.productName}, ${formatDateTime(item.createdAt)}`}
                      onClick={(event) => {
                        trigger.current = event.currentTarget;
                        setSelected(item);
                      }}
                    >
                      <ArrowUpRight aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <Empty className="min-h-48">
          <EmptyHeader>
            <EmptyTitle>Belum ada pergerakan pada periode ini</EmptyTitle>
            <EmptyDescription>
              Ubah periode untuk melihat catatan lain. Barang masuk dan keluar
              akan tercatat setelah disimpan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
