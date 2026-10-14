import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { demoProducts, formatNumber } from "@/lib/inventory";
import type { StockSearch } from "@/lib/stock-search";

export function StockEntryForm({
  initialProductId,
  returnSearch,
}: {
  initialProductId?: string;
  returnSearch: StockSearch;
}) {
  const [productId, setProductId] = useState(
    initialProductId &&
      demoProducts.some((item) => item.id === initialProductId)
      ? initialProductId
      : (demoProducts[0]?.id ?? ""),
  );
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const product = demoProducts.find((item) => item.id === productId);
  const amount = Number(quantity);
  const valid =
    Boolean(product) &&
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    amount <= 2147483647 - (product?.stock ?? 0);
  const after = (product?.stock ?? 0) + (valid ? amount : 0);
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (valid) setReviewing(true);
  }
  return (
    <div className="stock-entry grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      {reviewing && product ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl">Tinjau barang masuk</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">Produk</dt>
                <dd className="mt-1 font-medium">{product.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Jumlah masuk</dt>
                <dd className="mt-1">
                  {formatNumber(amount)} {product.unit}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Catatan</dt>
                <dd className="mt-1 break-words">
                  {note.trim() || "Tanpa catatan"}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setReviewing(false)}>
              Ubah catatan
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="shadow-none">
          <CardHeader className="sr-only">
            <CardTitle>Data barang masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={review} className="flex flex-col gap-6">
              <FieldGroup className="gap-5">
                <Field className="gap-2">
                  <FieldLabel htmlFor="entry-product">Produk</FieldLabel>
                  <NativeSelect
                    id="entry-product"
                    name="product"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    required
                  >
                    {demoProducts.map((item) => (
                      <NativeSelectOption key={item.id} value={item.id}>
                        {item.name} · {formatNumber(item.stock)} {item.unit}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="entry-quantity">Jumlah masuk</FieldLabel>
                  <Input
                    id="entry-quantity"
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={2147483647 - (product?.stock ?? 0)}
                    step={1}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Contoh: 10"
                    required
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="entry-note">
                    Catatan (opsional)
                  </FieldLabel>
                  <Textarea
                    id="entry-note"
                    name="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder="Contoh: restok dari pemasok"
                  />
                </Field>
              </FieldGroup>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link to="/app" search={returnSearch}>
                    Batal
                  </Link>
                </Button>
                <Button type="submit">
                  Tinjau catatan{" "}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <aside aria-label="Ringkasan barang masuk">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <h2 className="text-sm">Ringkasan stok</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="flex flex-col gap-4">
              <div className="flex justify-between gap-3">
                <dt>Saat ini</dt>
                <dd>{formatNumber(product?.stock ?? 0)} unit</dd>
              </div>
              <Separator />
              <div className="flex justify-between gap-3">
                <dt>Masuk</dt>
                <dd>{formatNumber(valid ? amount : 0)} unit</dd>
              </div>
            </dl>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Stok setelah dicatat
            </p>
            <strong className="text-[32px] font-semibold tabular-nums">
              {formatNumber(after)} unit
            </strong>
            <p className="rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
              Stok diperbarui setelah konfirmasi. Setiap perubahan masuk ke
              riwayat.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
