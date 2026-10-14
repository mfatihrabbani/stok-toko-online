export interface Product {
  lowStock?: boolean;
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  updatedAt: string;
}

export const demoProducts: Product[] = [
  {
    id: "1",
    name: "Canvas Tote Bag",
    sku: "ACC-001",
    category: "Aksesori",
    stock: 48,
    minStock: 15,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "2",
    name: "Kaos Essential — Putih",
    sku: "PKN-001",
    category: "Pakaian",
    stock: 72,
    minStock: 20,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "3",
    name: "Tumbler Stainless 500 ml",
    sku: "PRL-001",
    category: "Perlengkapan",
    stock: 6,
    minStock: 10,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "4",
    name: "Notebook A5",
    sku: "ATK-001",
    category: "Alat tulis",
    stock: 24,
    minStock: 10,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "5",
    name: "Pouch Serbaguna",
    sku: "ACC-002",
    category: "Aksesori",
    stock: 0,
    minStock: 8,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "6",
    name: "Sticker Pack",
    sku: "ATK-002",
    category: "Alat tulis",
    stock: 96,
    minStock: 20,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "7",
    name: "Topi Baseball — Hitam",
    sku: "PKN-002",
    category: "Pakaian",
    stock: 3,
    minStock: 8,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "8",
    name: "Mug Keramik",
    sku: "PRL-002",
    category: "Perlengkapan",
    stock: 18,
    minStock: 10,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "9",
    name: "Kaus Kaki Basic",
    sku: "PKN-003",
    category: "Pakaian",
    stock: 30,
    minStock: 12,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "10",
    name: "Lanyard",
    sku: "ACC-003",
    category: "Aksesori",
    stock: 12,
    minStock: 5,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "11",
    name: "Poster A3",
    sku: "ATK-003",
    category: "Alat tulis",
    stock: 5,
    minStock: 10,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
  {
    id: "12",
    name: "Keychain Akrilik",
    sku: "ACC-004",
    category: "Aksesori",
    stock: 42,
    minStock: 10,
    unit: "unit",
    updatedAt: "2026-10-14T08:00:00+07:00",
  },
];

export function stockStatus(product: Pick<Product, "stock" | "minStock">) {
  return product.stock === 0
    ? "Habis"
    : product.stock < product.minStock
      ? "Menipis"
      : "Aman";
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);
export function sortLowStockProducts(products: Product[]) {
  return products
    .filter((item) => item.stock < item.minStock)
    .sort(
      (a, b) =>
        a.stock / a.minStock - b.stock / b.minStock ||
        b.minStock - b.stock - (a.minStock - a.stock) ||
        a.name.localeCompare(b.name, "id-ID") ||
        a.id.localeCompare(b.id),
    );
}

export interface ProductFilters {
  query: string;
  category: string;
  status: "all" | "low" | "empty";
}

export const defaultProductFilters: ProductFilters = {
  query: "",
  category: "all",
  status: "all",
};

export function filterProducts(products: Product[], filters: ProductFilters) {
  const query = filters.query.trim().toLocaleLowerCase("id-ID");
  return products.filter((product) => {
    const matchesQuery = `${product.name} ${product.sku}`
      .toLocaleLowerCase("id-ID")
      .includes(query);
    const matchesCategory =
      filters.category === "all" || product.category === filters.category;
    const status = stockStatus(product);
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "low" && status === "Menipis") ||
      (filters.status === "empty" && status === "Habis");
    return matchesQuery && matchesCategory && matchesStatus;
  });
}
