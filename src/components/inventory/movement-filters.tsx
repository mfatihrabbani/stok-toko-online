import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { defaultMovementFilters, type MovementFilters } from "@/lib/movements";

export function MovementFiltersBar({
  filters,
  onChange,
}: {
  filters: MovementFilters;
  onChange: (filters: MovementFilters) => void;
}) {
  const invalid = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );
  const update = (change: Partial<MovementFilters>) =>
    onChange({ ...filters, ...change });
  return (
    <div className="stock-entry">
      <FieldGroup className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_160px_150px_auto]">
        <Field>
          <FieldLabel htmlFor="history-query">
            Cari produk atau catatan
          </FieldLabel>
          <Input
            id="history-query"
            type="search"
            maxLength={160}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Nama, SKU, atau catatan..."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="history-from">Dari tanggal</FieldLabel>
          <Input
            id="history-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => update({ from: e.target.value })}
            aria-invalid={invalid}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="history-to">Sampai tanggal</FieldLabel>
          <Input
            id="history-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => update({ to: e.target.value })}
            aria-invalid={invalid}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="history-direction">Jenis</FieldLabel>
          <NativeSelect
            id="history-direction"
            value={filters.direction}
            onChange={(e) =>
              update({
                direction: e.target.value as MovementFilters["direction"],
              })
            }
          >
            <NativeSelectOption value="all">Semua jenis</NativeSelectOption>
            <NativeSelectOption value="in">Barang masuk</NativeSelectOption>
            <NativeSelectOption value="out">Barang keluar</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Button
          variant="outline"
          onClick={() => onChange(defaultMovementFilters)}
        >
          Reset
        </Button>
      </FieldGroup>
      {invalid && (
        <FieldError className="mt-3">
          Tanggal akhir harus sama atau sesudah tanggal awal.
        </FieldError>
      )}
    </div>
  );
}
