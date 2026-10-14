import { expect, test } from "@playwright/test";
import { setTimeout as delay } from "node:timers/promises";

test("stock page shows inventory after signup and fits desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
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
