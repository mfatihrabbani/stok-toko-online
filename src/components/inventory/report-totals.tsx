import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/inventory";

export function ReportTotals({
  incoming,
  outgoing,
}: {
  incoming: number;
  outgoing: number;
}) {
  const net = incoming - outgoing;
  const values = [
    {
      title: "Total masuk",
      value: incoming,
      label: "Barang diterima pada periode ini",
      icon: ArrowDownLeft,
      color: "text-success",
    },
    {
      title: "Total keluar",
      value: outgoing,
      label: "Barang dikeluarkan pada periode ini",
      icon: ArrowUpRight,
      color: "text-destructive",
    },
    {
      title: "Perubahan neto",
      value: net,
      label: "Total masuk dikurangi total keluar",
      icon: ArrowLeftRight,
      color: "text-foreground",
    },
  ];
  return (
    <section
      aria-label="Ringkasan pergerakan periode"
      className="grid gap-4 sm:grid-cols-3"
    >
      {values.map(({ title, value, label, icon: Icon, color }) => (
        <Card key={title} className="gap-4 py-5 shadow-none">
          <CardHeader className="px-5">
            <CardTitle>
              <h2 className="flex items-center justify-between gap-3 text-sm">
                {title}
                <Icon aria-hidden="true" className={`size-4 ${color}`} />
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <strong className={`stock-kpi-value ${color}`}>
              {value > 0 && title === "Perubahan neto" ? "+" : ""}
              {formatNumber(value)}
            </strong>
            <p className="text-xs text-muted-foreground">unit</p>
          </CardContent>
          <CardFooter className="mx-5 border-t px-0 pt-4">
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}

export function ReportMovementChart({
  incoming,
  outgoing,
}: {
  incoming: number;
  outgoing: number;
}) {
  const largest = Math.max(incoming, outgoing, 1);
  return (
    <div
      className="space-y-4"
      role="img"
      aria-label={`Perbandingan pergerakan: ${formatNumber(incoming)} unit masuk dan ${formatNumber(outgoing)} unit keluar`}
    >
      {[
        { label: "Masuk", value: incoming, color: "bg-success" },
        { label: "Keluar", value: outgoing, color: "bg-destructive" },
      ].map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[50px_1fr_64px] items-center gap-3 text-xs"
        >
          <span>{item.label}</span>
          <div className="h-3 overflow-hidden rounded bg-secondary">
            <div
              className={`h-full rounded ${item.color}`}
              style={{ width: `${(item.value / largest) * 100}%` }}
            />
          </div>
          <span className="text-right tabular-nums">
            {formatNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
