import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";
import { StockConfirmation } from "@/components/inventory/stock-confirmation";
import { NewProductFields } from "@/components/inventory/new-product-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  defaultProductFilters,
  demoProducts,
  filterProducts,
  formatNumber,
} from "@/lib/inventory";
import type { StockSearch } from "@/lib/stock-search";

export function StockEntryForm({
  initialProductId,
  returnSearch,
  direction = "in",
}: {
  initialProductId?: string;
  returnSearch: StockSearch;
  direction?: "in" | "out";
}) {
  const outgoing = direction === "out";
  const [products, setProducts] = useState(demoProducts);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productId, setProductId] = useState(
    initialProductId && products.some((item) => item.id === initialProductId)
      ? initialProductId
      : (products[0]?.id ?? ""),
  );
  const [quantity, setQuantity] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const matches = filterProducts(products, {
    ...defaultProductFilters,
    query: productQuery,
  });
  function searchProducts(query: string) {
    setProductQuery(query);
    if (
      !filterProducts(products, { ...defaultProductFilters, query }).some(
        (item) => item.id === productId,
      )
    )
      setProductId("");
  }
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  }>();
  const savingRef = useRef(false);
  const [errors, setErrors] = useState<{ product?: string; quantity?: string }>(
    {},
  );
  const quantityRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLSelectElement>(null);
  const reviewRef = useRef<HTMLButtonElement>(null);
  const product = products.find((item) => item.id === productId);
  const amount = Number(quantity);
  const insufficient =
    outgoing &&
    Boolean(product) &&
    Number.isSafeInteger(amount) &&
    amount > (product?.stock ?? 0);
  const valid =
    Boolean(product) &&
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    amount <=
      (outgoing ? (product?.stock ?? 0) : 2147483647 - (product?.stock ?? 0));
  const after =
    (product?.stock ?? 0) + (valid ? amount * (outgoing ? -1 : 1) : 0);
  function save() {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      if (!product || !valid)
        throw new Error("Periksa kembali produk dan jumlah barang.");
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, stock: after } : item,
        ),
      );
      setFeedback({
        kind: "success",
        message: `${formatNumber(amount)} ${product.unit} ${product.name} berhasil dicatat ${outgoing ? "keluar" : "masuk"}. Stok contoh kini ${formatNumber(after)} ${product.unit}.`,
      });
      setReviewing(false);
      setQuantity("");
      setNote("");
      setProductQuery("");
      setErrors({});
      setAddingProduct(false);
    } catch (error) {
      setReviewing(false);
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Catatan belum tersimpan. Coba lagi; isian kamu tetap ada.",
      });
    } finally {
      savingRef.current = false;
    }
  }
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(undefined);
    if (addingProduct) return;
    const nextErrors: typeof errors = {};
    if (!product) nextErrors.product = "Pilih produk sebelum melanjutkan.";
    if (!quantity.trim())
      nextErrors.quantity = outgoing
        ? "Masukkan jumlah barang yang keluar."
        : "Masukkan jumlah barang yang diterima.";
    else if (!Number.isSafeInteger(amount) || amount < 1)
      nextErrors.quantity = "Gunakan bilangan bulat, minimal 1.";
    else if (outgoing && amount > (product?.stock ?? 0))
      nextErrors.quantity = `Jumlah keluar melebihi stok. Tersedia ${formatNumber(product?.stock ?? 0)} unit.`;
    else if (!outgoing && amount > 2147483647 - (product?.stock ?? 0))
      nextErrors.quantity = `Jumlah terlalu besar. Maksimal ${formatNumber(2147483647 - (product?.stock ?? 0))} unit.`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.product) productRef.current?.focus();
      else quantityRef.current?.focus();
      return;
    }
    if (valid) setReviewing(true);
  }
  return (
    <div className="stock-entry grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="shadow-none">
        <CardHeader className="sr-only">
          <CardTitle>Data barang {outgoing ? "keluar" : "masuk"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={review} noValidate className="flex flex-col gap-6">
            {feedback && (
              <p
                role={feedback.kind === "error" ? "alert" : "status"}
                className={
                  feedback.kind === "error"
                    ? "rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                    : "rounded-md bg-success-soft p-3 text-sm text-success"
                }
              >
                {feedback.message}
              </p>
            )}
            <FieldGroup className="gap-5">
              <Field className="gap-2">
                <FieldLabel htmlFor="entry-search">Cari produk</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Search aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="entry-search"
                    type="search"
                    value={productQuery}
                    onChange={(event) => searchProducts(event.target.value)}
                    placeholder="Nama produk atau SKU..."
                    maxLength={160}
                  />
                </InputGroup>
                <FieldDescription
                  role="status"
                  className={productQuery ? undefined : "sr-only"}
                >
                  {productQuery
                    ? matches.length
                      ? `${matches.length} produk cocok. Pilih produk di bawah.`
                      : "Produk tidak ditemukan. Ubah pencarian nama atau SKU."
                    : ""}
                </FieldDescription>
              </Field>
              <Field className="gap-2" data-invalid={Boolean(errors.product)}>
                <FieldLabel htmlFor="entry-product">Produk</FieldLabel>
                <NativeSelect
                  id="entry-product"
                  ref={productRef}
                  aria-invalid={Boolean(errors.product)}
                  aria-describedby={
                    errors.product ? "entry-product-error" : undefined
                  }
                  name="product"
                  value={productId}
                  onChange={(event) => {
                    setProductId(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      product: undefined,
                    }));
                  }}
                  required
                >
                  <NativeSelectOption value="" disabled>
                    Pilih produk
                  </NativeSelectOption>
                  {matches.map((item) => (
                    <NativeSelectOption key={item.id} value={item.id}>
                      {item.name} · {formatNumber(item.stock)} {item.unit}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {!outgoing && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAddingProduct((current) => !current)}
                  >
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Tambah produk baru
                  </Button>
                )}
                {errors.product && (
                  <FieldError id="entry-product-error">
                    {errors.product}
                  </FieldError>
                )}
                {product && (
                  <FieldDescription>
                    {product.sku || "Tanpa SKU"} · {product.category}
                    {outgoing &&
                      ` · Tersedia ${formatNumber(product.stock)} ${product.unit}`}
                  </FieldDescription>
                )}
              </Field>
              {addingProduct && (
                <NewProductFields
                  products={products}
                  onCancel={() => setAddingProduct(false)}
                  onCreate={(created) => {
                    setProducts((current) => [...current, created]);
                    setProductId(created.id);
                    setProductQuery("");
                    setAddingProduct(false);
                    setErrors({});
                  }}
                />
              )}
              <Field className="gap-2" data-invalid={Boolean(errors.quantity)}>
                <FieldLabel htmlFor="entry-quantity">
                  Jumlah {outgoing ? "keluar" : "masuk"}
                </FieldLabel>
                <Input
                  id="entry-quantity"
                  ref={quantityRef}
                  aria-invalid={Boolean(errors.quantity) || insufficient}
                  aria-describedby={
                    insufficient
                      ? "entry-stock-warning"
                      : errors.quantity
                        ? "entry-quantity-error"
                        : "entry-quantity-hint"
                  }
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={
                    outgoing
                      ? (product?.stock ?? 0)
                      : 2147483647 - (product?.stock ?? 0)
                  }
                  step={1}
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      quantity: undefined,
                    }));
                  }}
                  placeholder="Contoh: 10"
                  required
                />
                <FieldDescription id="entry-quantity-hint">
                  {outgoing
                    ? `Gunakan bilangan bulat, minimal 1 dan maksimal ${formatNumber(product?.stock ?? 0)} unit.`
                    : "Gunakan bilangan bulat, minimal 1."}
                </FieldDescription>
                {errors.quantity && (
                  <FieldError id="entry-quantity-error">
                    {errors.quantity}
                  </FieldError>
                )}
                {insufficient && (
                  <p
                    id="entry-stock-warning"
                    role="alert"
                    className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    Stok tidak cukup. Tersedia{" "}
                    {formatNumber(product?.stock ?? 0)} unit; kurangi jumlah
                    keluar sebelum menyimpan.
                  </p>
                )}
                {outgoing && product?.stock === 0 && (
                  <p role="status" className="text-sm text-destructive">
                    Produk ini habis. Catat barang masuk terlebih dahulu.
                  </p>
                )}
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="entry-note">Catatan (opsional)</FieldLabel>
                <Textarea
                  id="entry-note"
                  name="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder={
                    outgoing
                      ? "Contoh: penjualan pesanan toko"
                      : "Contoh: restok dari pemasok"
                  }
                />
              </Field>
            </FieldGroup>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/app" search={returnSearch}>
                  Batal
                </Link>
              </Button>
              <Button
                type="submit"
                ref={reviewRef}
                disabled={
                  addingProduct ||
                  insufficient ||
                  (outgoing && product?.stock === 0)
                }
                aria-describedby={
                  addingProduct ? "entry-new-product-hint" : undefined
                }
              >
                Tinjau catatan{" "}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
            {addingProduct && (
              <p
                id="entry-new-product-hint"
                className="text-xs text-muted-foreground"
              >
                Gunakan produk baru atau batalkan penambahan sebelum meninjau
                catatan.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
      <aside aria-label={`Ringkasan barang ${outgoing ? "keluar" : "masuk"}`}>
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
                <dt>{outgoing ? "Keluar" : "Masuk"}</dt>
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
      <StockConfirmation
        product={product}
        quantity={amount}
        note={note}
        open={reviewing}
        onOpenChange={setReviewing}
        onCloseFocus={() =>
          feedback?.kind === "success"
            ? quantityRef.current?.focus()
            : reviewRef.current?.focus()
        }
        onConfirm={save}
        direction={direction}
      />
    </div>
  );
}
