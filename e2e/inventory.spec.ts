import { expect, test } from "@playwright/test";
import { setTimeout as delay } from "node:timers/promises";

test("stock page shows inventory after signup and fits desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products/1");
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/barang-masuk");
  await expect(page).toHaveURL(/\/sign-in$/);
  const signup = {
    headers: { Origin: "http://localhost:3101" },
    data: {
      name: "Pemilik toko",
      email: `inventory-${Date.now()}@example.com`,
      password: "Stock-test-password-123!",
    },
  };
  let result = await page.request.post("/api/auth/sign-up/email", signup);
  if (result.status() === 429) {
    const seconds = Number(result.headers()["retry-after"] || 10);
    expect(seconds).toBeLessThanOrEqual(10);
    await delay((seconds + 0.1) * 1000);
    result = await page.request.post("/api/auth/sign-up/email", signup);
  }
  expect(result.status()).toBe(200);
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Stok barang", exact: true }),
  ).toBeVisible();
  const summary = page.getByRole("region", { name: "Ringkasan persediaan" });
  await expect(
    summary.getByRole("heading", { name: "Total produk" }),
  ).toBeVisible();
  await expect(summary).toContainText("356");
  await expect(summary).toContainText("25%");
  await expect(
    page.getByRole("cell", { name: "Canvas Tote Bag ACC-001" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Habis", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Cari produk", { exact: true }).fill("acc-001");
  await expect(page.getByRole("status")).toHaveText(
    "Menampilkan 1 dari 12 produk",
  );
  await expect(
    page.getByRole("cell", { name: "Canvas Tote Bag ACC-001" }),
  ).toBeVisible();
  await page
    .getByLabel("Cari produk", { exact: true })
    .fill("Produk yang tidak ada");
  await expect(
    page.getByRole("heading", { name: "Produk tidak ditemukan" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset pencarian dan filter" })
    .click();
  await page.getByLabel("Kategori", { exact: true }).selectOption("Pakaian");
  await page.getByRole("radio", { name: "Menipis 3", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Menampilkan 1 dari 12 produk",
  );
  await expect(
    page.getByRole("cell", { name: "Topi Baseball — Hitam PKN-002" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filter", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Menampilkan 12 dari 12 produk",
  );
  await page.screenshot({
    path: "test-results/stock-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Canvas Tote Bag", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/1$/);
  await expect(
    page.getByRole("heading", { name: "Canvas Tote Bag", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Stok memenuhi batas minimal.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Canvas Tote Bag", exact: true }),
  ).toBeVisible();
  await page.goto("/products/not-a-product");
  await expect(
    page.getByRole("heading", { name: "Produk tidak ditemukan" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Kembali ke stok", exact: true })
    .click();
  await page.getByLabel("Cari produk", { exact: true }).fill("Topi");
  await page.getByLabel("Kategori", { exact: true }).selectOption("Pakaian");
  await page.getByRole("radio", { name: "Menipis 3", exact: true }).click();
  await page
    .getByRole("link", { name: "Topi Baseball — Hitam", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Kembali ke stok", exact: true })
    .click();
  await expect(page.getByLabel("Cari produk", { exact: true })).toHaveValue(
    "Topi",
  );
  await expect(page.getByLabel("Kategori", { exact: true })).toHaveValue(
    "Pakaian",
  );
  await expect(
    page.getByRole("radio", { name: "Menipis 3", exact: true }),
  ).toBeChecked();
  await page.reload();
  await expect(page.getByLabel("Cari produk", { exact: true })).toHaveValue(
    "Topi",
  );
  await page.getByRole("button", { name: "Reset filter", exact: true }).click();
  const lastProduct = page.getByRole("link", {
    name: "Keychain Akrilik",
    exact: true,
  });
  await lastProduct.scrollIntoViewIfNeeded();
  const beforeDetailScroll = await page.evaluate(() => window.scrollY);
  expect(beforeDetailScroll).toBeGreaterThan(0);
  await lastProduct.click();
  await page
    .getByRole("link", { name: "Kembali ke stok", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(beforeDetailScroll - 40);
  await page
    .getByRole("main")
    .getByRole("link", { name: "Barang masuk", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Barang masuk", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Jumlah masuk", { exact: true }).fill("10");
  await page
    .getByLabel("Catatan (opsional)", { exact: true })
    .fill("Restok dari pemasok");
  await expect(
    page.getByRole("complementary", { name: "Ringkasan barang masuk" }),
  ).toContainText("58 unit");
  await page
    .getByRole("button", { name: "Tinjau catatan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tinjau barang masuk", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ubah catatan", exact: true }).click();
  await expect(page.getByLabel("Jumlah masuk", { exact: true })).toHaveValue(
    "10",
  );
  await page.getByRole("link", { name: "Batal", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Stok barang", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/stock-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
