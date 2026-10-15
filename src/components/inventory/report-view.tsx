import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoProducts, formatNumber, type Product } from "@/lib/inventory";
import { demoMovements, type StockMovement } from "@/lib/movements";
import { StockSummary } from "./stock-summary";
import { ReportMovements } from "./report-movements";
import { ReportMovementChart, ReportTotals } from "./report-totals";
import { ReportProductTotals } from "./report-product-totals";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupReportMovements } from "@/lib/reports";
import type { ProductMovementTotal } from "@/lib/reports";
import {
  downloadCsv,
  movementCsv,
  productTotalsCsv,
  stockCsv,
} from "@/lib/csv";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { filterMovements } from "@/lib/movements";
import {
  defaultReportPeriod,
  formatReportDate,
  type ReportPeriod,
} from "@/lib/reports";

export function ReportView({
  products = demoProducts,
  movements = demoMovements,
  period: externalPeriod,
  onPeriodChange,
  summary,
  productTotals: externalProductTotals,
  onExport,
  pagination,
}: {
  products?: Product[];
  movements?: StockMovement[];
  period?: ReportPeriod;
  onPeriodChange?: (period: ReportPeriod) => void;
  summary?: { incoming: number; outgoing: number; count: number };
  productTotals?: ProductMovementTotal[];
  onExport?: (kind: "stock" | "movements" | "products") => Promise<void>;
  pagination?: {
    offset: number;
    hasMore: boolean;
    onChange: (offset: number) => void;
  };
}) {
  const [localPeriod, setPeriod] = useState(defaultReportPeriod);
  const [view, setView] = useState<"all" | "products">("all");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const period = externalPeriod ?? localPeriod;
  const changePeriod = onPeriodChange ?? setPeriod;
  const invalidPeriod = period.from > period.to;
  const periodMovements = filterMovements(movements, {
    ...period,
    q: "",
    direction: "all",
  });
  const productTotals =
    externalProductTotals ?? groupReportMovements(periodMovements);
  const incoming =
    summary?.incoming ??
    periodMovements
      .filter((item) => item.direction === "in")
      .reduce((total, item) => total + item.quantity, 0);
  const outgoing =
    summary?.outgoing ??
    periodMovements
      .filter((item) => item.direction === "out")
      .reduce((total, item) => total + item.quantity, 0);
  async function handleExport(kind: "stock" | "movements" | "products") {
    setExporting(true);
    setExportError("");
    try {
      if (onExport) await onExport(kind);
      else if (kind === "stock")
        downloadCsv(stockCsv(products), `stok-${defaultReportPeriod().to}.csv`);
      else
        downloadCsv(
          kind === "movements"
            ? movementCsv(periodMovements)
            : productTotalsCsv(productTotals),
          `pergerakan-${kind}-${period.from}-${period.to}.csv`,
        );
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Laporan belum dapat diunduh. Coba lagi.",
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">
          Laporan Stok
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Lihat ringkasan pergerakan untuk periode tertentu dan ekspor ke
          spreadsheet.
        </p>
      </header>
      {exportError && (
        <p role="alert" className="text-sm text-destructive">
          {exportError}
        </p>
      )}
      {exporting && (
        <p role="status" className="text-sm text-muted-foreground">
          Menyiapkan unduhan laporan…
        </p>
      )}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Periode laporan</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field>
              <FieldLabel htmlFor="report-from">Dari tanggal</FieldLabel>
              <Input
                id="report-from"
                type="date"
                value={period.from}
                max={period.to}
                aria-invalid={invalidPeriod}
                onChange={(event) =>
                  changePeriod({
                    ...period,
                    from: event.target.value || period.from,
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="report-to">Sampai tanggal</FieldLabel>
              <Input
                id="report-to"
                type="date"
                value={period.to}
                min={period.from}
                aria-invalid={invalidPeriod}
                onChange={(event) =>
                  changePeriod({
                    ...period,
                    to: event.target.value || period.to,
                  })
                }
              />
            </Field>
            <Button
              variant="outline"
              onClick={() => changePeriod(defaultReportPeriod())}
            >
              Bulan ini
            </Button>
          </FieldGroup>
          {invalidPeriod ? (
            <p role="alert" className="text-sm text-destructive">
              Tanggal akhir harus sama atau setelah tanggal awal.
            </p>
          ) : (
            <p role="status" className="text-sm">
              Periode aktif: {formatReportDate(period.from)} –{" "}
              {formatReportDate(period.to)} (WIB)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Periode berlaku untuk barang masuk dan keluar. Ringkasan persediaan
            selalu menunjukkan stok saat ini.
          </p>
        </CardContent>
      </Card>
      <StockSummary products={products} />
      <ReportTotals incoming={incoming} outgoing={outgoing} />
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Masuk & keluar pada periode ini</h2>
          </CardTitle>
          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            aria-label="Tampilan laporan"
            onValueChange={(value) => {
              if (value === "all" || value === "products") setView(value);
            }}
          >
            <ToggleGroupItem value="all">Keseluruhan</ToggleGroupItem>
            <ToggleGroupItem value="products">Per produk</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            disabled={
              exporting ||
              invalidPeriod ||
              !(summary?.count ?? periodMovements.length)
            }
            onClick={() => {
              void handleExport(view === "all" ? "movements" : "products");
            }}
          >
            <Download aria-hidden="true" />
            Unduh CSV pergerakan
          </Button>
        </CardHeader>
        <CardContent>
          <ReportMovementChart incoming={incoming} outgoing={outgoing} />
          <p className="text-sm leading-6">
            {formatNumber(incoming)} unit masuk · {formatNumber(outgoing)} unit
            keluar · {formatNumber(incoming - outgoing)} unit perubahan neto
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {summary
              ? `${formatNumber(summary.count)} catatan pada seluruh periode ini.`
              : "Data contoh untuk pratinjau laporan."}
          </p>
        </CardContent>
        {pagination && view === "all" && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6">
            <p className="text-xs text-muted-foreground">
              Halaman {Math.floor(pagination.offset / 50) + 1}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={pagination.offset === 0}
                onClick={() =>
                  pagination.onChange(Math.max(0, pagination.offset - 50))
                }
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                disabled={!pagination.hasMore}
                onClick={() => pagination.onChange(pagination.offset + 50)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
        <CardContent className="px-0">
          {view === "all" ? (
            <ReportMovements movements={periodMovements} />
          ) : (
            <ReportProductTotals products={productTotals} />
          )}
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Stok saat ini</h2>
          </CardTitle>
          <Button
            variant="outline"
            disabled={exporting || !products.length}
            onClick={() => {
              void handleExport("stock");
            }}
          >
            <Download aria-hidden="true" />
            Unduh CSV stok
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {formatNumber(products.length)} produk ·{" "}
            {formatNumber(
              products.reduce((sum, product) => sum + product.stock, 0),
            )}{" "}
            unit tersedia. Ringkasan ini menunjukkan persediaan saat ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
