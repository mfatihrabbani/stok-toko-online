import type { Product } from "@/lib/inventory";

export interface MovementResult {
  product: Product;
  receipt: {
    id: string;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
  };
}

export async function inventoryRequest<T>(
  url: string,
  options?: { method: string; body?: unknown },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: options?.method,
      headers: options?.body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      "Koneksi terputus. Coba simpan lagi; isian Anda tetap ada.",
    );
  }
  if (response.status === 204) return undefined as T;
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Sesi berakhir. Masuk kembali sebelum melanjutkan."
        : response.status >= 500
          ? "Penyimpanan belum dapat dipastikan. Coba simpan lagi dengan isian yang sama."
          : response.status === 422
            ? "Periksa isian produk dan jumlah barang."
            : result.error?.message || "Permintaan gagal. Coba lagi.",
    );
  return result.data as T;
}
