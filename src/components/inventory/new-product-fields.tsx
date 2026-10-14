import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/inventory";

export function NewProductFields({
  products,
  onCreate,
  onCancel,
}: {
  products: Product[];
  onCreate: (product: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [minimum, setMinimum] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const minimumRef = useRef<HTMLInputElement>(null);
  function create() {
    const next: Record<string, string> = {};
    const minStock = Number(minimum);
    if (!name.trim() || name.trim().length > 160)
      next.name = "Isi nama produk, maksimal 160 karakter.";
    if (sku.trim().length > 80) next.sku = "SKU maksimal 80 karakter.";
    else if (
      sku.trim() &&
      products.some(
        (product) => product.sku.toLowerCase() === sku.trim().toLowerCase(),
      )
    )
      next.sku = "SKU sudah digunakan. Gunakan kode lain.";
    if (
      !minimum.trim() ||
      !Number.isSafeInteger(minStock) ||
      minStock < 0 ||
      minStock > 2147483647
    )
      next.minimum = "Stok minimal harus bilangan bulat, minimal 0.";
    setErrors(next);
    if (Object.keys(next).length) {
      (next.name ? nameRef : next.sku ? skuRef : minimumRef).current?.focus();
      return;
    }
    onCreate({
      id: crypto.randomUUID(),
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || "Tanpa kategori",
      stock: 0,
      minStock,
      unit: "unit",
      updatedAt: new Date().toISOString(),
    });
  }
  return (
    <FieldSet className="rounded-md border bg-muted/50 p-4">
      <FieldLegend>Produk baru</FieldLegend>
      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.name)} className="gap-2">
          <FieldLabel htmlFor="new-product-name">Nama produk</FieldLabel>
          <Input
            ref={nameRef}
            id="new-product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={160}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? "new-product-name-error" : undefined
            }
          />
          {errors.name && (
            <FieldError id="new-product-name-error">{errors.name}</FieldError>
          )}
        </Field>
        <Field data-invalid={Boolean(errors.sku)} className="gap-2">
          <FieldLabel htmlFor="new-product-sku">SKU (opsional)</FieldLabel>
          <Input
            ref={skuRef}
            id="new-product-sku"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            maxLength={80}
            aria-invalid={Boolean(errors.sku)}
            aria-describedby={errors.sku ? "new-product-sku-error" : undefined}
          />
          {errors.sku && (
            <FieldError id="new-product-sku-error">{errors.sku}</FieldError>
          )}
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="new-product-category">
            Kategori (opsional)
          </FieldLabel>
          <Input
            id="new-product-category"
            list="new-product-categories"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            maxLength={80}
          />
          <datalist id="new-product-categories">
            {[...new Set(products.map((product) => product.category))].map(
              (item) => (
                <option key={item} value={item} />
              ),
            )}
          </datalist>
        </Field>
        <Field data-invalid={Boolean(errors.minimum)} className="gap-2">
          <FieldLabel htmlFor="new-product-minimum">Stok minimal</FieldLabel>
          <Input
            ref={minimumRef}
            id="new-product-minimum"
            type="number"
            min={0}
            step={1}
            value={minimum}
            onChange={(event) => setMinimum(event.target.value)}
            aria-invalid={Boolean(errors.minimum)}
            aria-describedby={
              errors.minimum ? "new-product-minimum-error" : undefined
            }
          />
          {errors.minimum && (
            <FieldError id="new-product-minimum-error">
              {errors.minimum}
            </FieldError>
          )}
        </Field>
      </FieldGroup>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={create}>
          Gunakan produk
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal tambah produk
        </Button>
      </div>
    </FieldSet>
  );
}
