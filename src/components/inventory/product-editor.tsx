import { useRef, useState } from "react";
import { NewProductFields } from "@/components/inventory/new-product-fields";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/inventory";

export function ProductEditor({
  products,
  onSave,
  onCancel,
  initialProduct,
  categories,
  saving = false,
}: {
  products: Product[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  initialProduct?: Product;
  categories?: string[];
  saving?: boolean;
}) {
  const [stock, setStock] = useState("0");
  const [error, setError] = useState("");
  const stockRef = useRef<HTMLInputElement>(null);
  return (
    <div className="stock-entry flex flex-col gap-5">
      {!initialProduct && (
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="product-initial-stock">Stok awal</FieldLabel>
          <Input
            id="product-initial-stock"
            disabled={saving}
            ref={stockRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={2147483647}
            step={1}
            value={stock}
            onChange={(event) => {
              setStock(event.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby="product-stock-help"
          />
          <FieldDescription id="product-stock-help">
            Isi 0 bila produk belum memiliki stok. Stok awal tercatat sebagai
            barang masuk.
          </FieldDescription>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      )}
      <NewProductFields
        products={products}
        initialProduct={initialProduct}
        categories={categories}
        saving={saving}
        submitLabel={
          saving
            ? "Menyimpan..."
            : initialProduct
              ? "Simpan perubahan"
              : "Simpan produk"
        }
        onCancel={onCancel}
        onCreate={(created) => {
          const amount = initialProduct?.stock ?? Number(stock);
          if (
            !stock.trim() ||
            !Number.isSafeInteger(amount) ||
            amount < 0 ||
            amount > 2147483647
          ) {
            setError(
              "Stok awal harus bilangan bulat antara 0 dan 2.147.483.647.",
            );
            stockRef.current?.focus();
            return;
          }
          onSave({ ...created, stock: amount });
        }}
      />
    </div>
  );
}
