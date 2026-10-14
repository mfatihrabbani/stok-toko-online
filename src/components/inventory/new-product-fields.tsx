import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldDescription,
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
  initialProduct,
  submitLabel = "Gunakan produk",
  categories = [],
  saving = false,
}: {
  products: Product[];
  onCreate: (product: Product) => void;
  onCancel: () => void;
  initialProduct?: Product;
  submitLabel?: string;
  categories?: string[];
  saving?: boolean;
}) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? "");
  const [minimum, setMinimum] = useState(String(initialProduct?.minStock ?? 0));
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
        (product) =>
          product.id !== initialProduct?.id &&
          product.sku.toLowerCase() === sku.trim().toLowerCase(),
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
      id: initialProduct?.id ?? crypto.randomUUID(),
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || "Tanpa kategori",
      stock: initialProduct?.stock ?? 0,
      minStock,
      unit: initialProduct?.unit ?? "unit",
      updatedAt: new Date().toISOString(),
    });
  }
  return (
    <FieldSet disabled={saving} className="rounded-md border bg-muted/50 p-4">
      <FieldLegend>
        {initialProduct ? "Data produk" : "Produk baru"}
      </FieldLegend>
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
            {[
              ...new Set([
                ...categories,
                ...products.map((product) => product.category),
              ]),
            ].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>
        <Field data-invalid={Boolean(errors.minimum)} className="gap-2">
          <FieldLabel htmlFor="new-product-minimum">Stok minimal</FieldLabel>
          <FieldDescription>
            Produk ditandai menipis ketika stok kurang dari batas ini. Isi 0
            bila tidak memerlukan batas minimal.
          </FieldDescription>
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
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal tambah produk
        </Button>
      </div>
    </FieldSet>
  );
}
