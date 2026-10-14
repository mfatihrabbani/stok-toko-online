import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CategoryManager({
  categories,
  onChange,
}: {
  categories: string[];
  onChange: (oldName: string | null, name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string>();
  const [error, setError] = useState("");
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Kelola kategori
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-32px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kategori produk</DialogTitle>
            <DialogDescription>
              Kelompokkan produk agar mudah dicari.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = name.trim();
              if (
                !trimmed ||
                trimmed.length > 80 ||
                trimmed.toLowerCase() === "all"
              ) {
                setError("Isi nama kategori, maksimal 80 karakter.");
                return;
              }
              if (
                categories.some(
                  (item) =>
                    item !== editing &&
                    item.toLowerCase() === trimmed.toLowerCase(),
                )
              ) {
                setError("Kategori dengan nama ini sudah ada.");
                return;
              }
              onChange(editing, trimmed);
              setEditing(null);
              setName("");
              setError("");
            }}
          >
            <Field>
              <FieldLabel htmlFor="category-name">
                {editing ? "Nama kategori baru" : "Tambah kategori"}
              </FieldLabel>
              <Input
                id="category-name"
                value={name}
                maxLength={80}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <div className="flex gap-3">
              <Button type="submit">
                {editing ? "Simpan nama" : "Tambah kategori"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setName("");
                  }}
                >
                  Batal ubah
                </Button>
              )}
            </div>
          </form>
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 break-words">{category}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={category === "Tanpa kategori"}
                    onClick={() => {
                      setEditing(category);
                      setName(category);
                      setError("");
                    }}
                  >
                    Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={category === "Tanpa kategori"}
                    onClick={() => setDeleting(category)}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(value) => {
          if (!value) setDeleting(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus kategori?</DialogTitle>
            <DialogDescription>
              Produk dalam kategori {deleting} akan dipindahkan ke Tanpa
              kategori. Produk dan stok tetap tersimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleting) onChange(deleting, null);
                setDeleting(undefined);
                setEditing(null);
                setName("");
              }}
            >
              Hapus kategori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
