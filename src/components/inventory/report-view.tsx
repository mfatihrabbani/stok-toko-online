import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoProducts, formatNumber, type Product } from "@/lib/inventory";
import { demoMovements, type StockMovement } from "@/lib/movements";
import { StockSummary } from "./stock-summary";
import { ReportMovements } from "./report-movements";
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
}: {
  products?: Product[];
  movements?: StockMovement[];
  period?: ReportPeriod;
  onPeriodChange?: (period: ReportPeriod) => void;
}) {
  const [localPeriod, setPeriod] = useState(defaultReportPeriod);
  const period = externalPeriod ?? localPeriod;
  const changePeriod = onPeriodChange ?? setPeriod;
  const invalidPeriod = period.from > period.to;
  const periodMovements = filterMovements(movements, {
    ...period,
    q: "",
    direction: "all",
  });
  const incoming = periodMovements
    .filter((item) => item.direction === "in")
    .reduce((total, item) => total + item.quantity, 0);
  const outgoing = periodMovements
    .filter((item) => item.direction === "out")
    .reduce((total, item) => total + item.quantity, 0);
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
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Masuk & keluar</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">
            {formatNumber(incoming)} unit masuk · {formatNumber(outgoing)} unit
            keluar · {formatNumber(incoming - outgoing)} unit perubahan neto
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Data contoh untuk pratinjau laporan.
          </p>
        </CardContent>
        <CardContent className="px-0">
          <ReportMovements movements={periodMovements} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Stok saat ini</h2>
          </CardTitle>
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
