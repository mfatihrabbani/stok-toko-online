import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MovementDetail } from "@/components/inventory/movement-detail";
import { MovementFiltersBar } from "@/components/inventory/movement-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/inventory";
import {
  demoMovements,
  defaultMovementFilters,
  filterMovements,
  formatDateTime,
  type StockMovement,
} from "@/lib/movements";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function MovementHistory({
  initialMovements = demoMovements,
}: {
  initialMovements?: StockMovement[];
}) {
  const [filters, setFilters] = useState(defaultMovementFilters);
  const [selected, setSelected] = useState<StockMovement>();
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const movements = filterMovements(initialMovements, filters).sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
  return (
    <div className="flex flex-col gap-6">
      <MovementDetail
        movement={selected}
        onClose={() => setSelected(undefined)}
        onCloseFocus={() => detailTrigger.current?.focus()}
      />
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Riwayat Pergerakan
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Telusuri setiap perubahan stok dari catatan terbaru.
        </p>
      </header>
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>
              <h2 className="text-xl">Catatan pergerakan</h2>
            </CardTitle>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/barang-keluar">Barang keluar</Link>
              </Button>
              <Button asChild>
                <Link to="/barang-masuk">Barang masuk</Link>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Data contoh untuk pratinjau riwayat.
          </p>
          <MovementFiltersBar filters={filters} onChange={setFilters} />
          <p role="status" className="text-xs text-muted-foreground">
            {movements.length} catatan ditemukan · Waktu Indonesia Barat
          </p>
        </CardHeader>
        <CardContent className="px-0">
          {!movements.length ? (
            <Empty className="min-h-64">
              <EmptyHeader>
                <EmptyTitle>
                  {initialMovements.length
                    ? "Tidak ada catatan yang cocok"
                    : "Belum ada pergerakan stok"}
                </EmptyTitle>
                <EmptyDescription>
                  {initialMovements.length
                    ? "Ubah rentang tanggal, pencarian, atau jenis pergerakan."
                    : "Catat barang masuk atau keluar. Setiap perubahan stok akan muncul di sini."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link to="/barang-masuk">Catat barang masuk</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table className="stock-table">
              <TableCaption className="sr-only">
                Riwayat barang masuk dan keluar
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="product-cell">
                      <strong>{item.productName}</strong>
                      <p className="text-xs text-muted-foreground">
                        {item.productSku}
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
                          detailTrigger.current = event.currentTarget;
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
