import { Search } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  stockStatus,
  type Product,
  type ProductFilters,
} from "@/lib/inventory";

export function StockFilters({
  products,
  filters,
  onChange,
  onReset,
  className,
}: {
  products: Product[];
  filters: ProductFilters;
  onChange: (changes: Partial<ProductFilters>) => void;
  onReset: () => void;
  className?: string;
}) {
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort();
  const lowCount = products.filter(
    (product) => stockStatus(product) === "Menipis",
  ).length;
  const emptyCount = products.filter(
    (product) => stockStatus(product) === "Habis",
  ).length;
  const active =
    Boolean(filters.query.trim()) ||
    filters.category !== "all" ||
    filters.status !== "all";
  return (
    <div className={cn("stock-filters mt-4 flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          className="max-w-full flex-wrap"
          type="single"
          value={filters.status}
          onValueChange={(value) => {
            if (value) onChange({ status: value as ProductFilters["status"] });
          }}
          spacing={1}
          aria-label="Filter kondisi stok"
        >
          <ToggleGroupItem
            value="all"
            className="gap-1.5 px-2 sm:gap-2 sm:px-3"
          >
            Semua produk{" "}
            <span className="text-xs text-muted-foreground">
              {products.length}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="low"
            className="gap-1.5 px-2 sm:gap-2 sm:px-3"
          >
            Menipis{" "}
            <span className="text-xs text-muted-foreground">{lowCount}</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="empty"
            className="gap-1.5 px-2 sm:gap-2 sm:px-3"
          >
            Habis{" "}
            <span className="text-xs text-muted-foreground">{emptyCount}</span>
          </ToggleGroupItem>
        </ToggleGroup>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset filter
          </Button>
        )}
      </div>
      <FieldGroup className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
        <Field className="gap-2">
          <FieldLabel htmlFor="stock-search">Cari produk</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="stock-search"
              type="search"
              value={filters.query}
              onChange={(event) => onChange({ query: event.target.value })}
              placeholder="Nama produk atau SKU..."
              maxLength={160}
            />
          </InputGroup>
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="stock-category">Kategori</FieldLabel>
          <NativeSelect
            id="stock-category"
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            <NativeSelectOption value="all">Semua kategori</NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category} value={category}>
                {category}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </FieldGroup>
    </div>
  );
}
