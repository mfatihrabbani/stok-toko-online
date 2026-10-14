export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  direction: "in" | "out";
  quantity: number;
  note: string;
  stockBefore: number;
  stockAfter: number;
  createdAt: string;
}
export const demoMovements: StockMovement[] = [
  {
    id: "movement-1",
    productId: "2",
    productName: "Kaos Essential — Putih",
    productSku: "PKN-001",
    direction: "out",
    quantity: 8,
    note: "Penjualan hari ini",
    stockBefore: 80,
    stockAfter: 72,
    createdAt: "2026-10-14T03:22:00Z",
  },
  {
    id: "movement-2",
    productId: "1",
    productName: "Canvas Tote Bag",
    productSku: "ACC-001",
    direction: "in",
    quantity: 24,
    note: "Restok dari pemasok",
    stockBefore: 24,
    stockAfter: 48,
    createdAt: "2026-10-14T02:45:00Z",
  },
  {
    id: "movement-3",
    productId: "3",
    productName: "Tumbler Stainless 500 ml",
    productSku: "PRL-001",
    direction: "out",
    quantity: 4,
    note: "Penjualan hari ini",
    stockBefore: 10,
    stockAfter: 6,
    createdAt: "2026-10-14T02:12:00Z",
  },
];
export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });
