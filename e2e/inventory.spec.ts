import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const headers = { Origin: "http://localhost:3101" };
test("inventory persists, isolates accounts, prevents duplicate saves and concurrent overselling", async ({
  page,
  playwright,
}) => {
  test.setTimeout(90_000);
  const client = page.request;
  await page.goto("/riwayat");
  await expect(page).toHaveURL(/\/sign-in$/);
  expect((await client.get("/api/products")).status()).toBe(401);
  expect(
    (
      await client.post("/api/auth/sign-up/email", {
        headers,
        data: {
          name: "Toko Uji",
          email: `stok-${randomUUID()}@example.com`,
          password: "Inventory-test-123!",
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Stok barang", exact: true }),
  ).toBeVisible();
  await page.goto("/barang-masuk");
  await page
    .getByRole("button", { name: "Tambah produk baru", exact: true })
    .click();
  await page.getByLabel("Nama produk").fill("Produk uji");
  await page.getByLabel("SKU (opsional)").fill("UJI-001");
  await page
    .getByRole("button", { name: "Gunakan produk", exact: true })
    .click();
  await page.getByLabel("Jumlah masuk").fill("10");
  await page.getByRole("button", { name: "Tinjau catatan" }).click();
  await page.getByRole("button", { name: "Simpan barang masuk" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "berhasil dicatat masuk" }),
  ).toBeVisible();
  await page.goto("/app");
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Produk uji", exact: true }),
  ).toBeVisible();
  const list = await (await client.get("/api/products?q=UJI-001")).json();
  const product = list.data[0];
  expect(product.stock).toBe(10);
  const incoming = {
    productId: product.id,
    quantity: 2,
    requestId: randomUUID(),
  };
  const repeated = await Promise.all([
    client.post("/api/stock/incoming", { headers, data: incoming }),
    client.post("/api/stock/incoming", { headers, data: incoming }),
  ]);
  expect(repeated.map((r) => r.status())).toEqual([201, 201]);
  expect(
    (
      await client.post("/api/stock/outgoing", {
        headers,
        data: { productId: product.id, quantity: 0, requestId: randomUUID() },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await client.post("/api/stock/outgoing", {
        data: { productId: product.id, quantity: 1, requestId: randomUUID() },
      })
    ).status(),
  ).toBe(403);
  const concurrent = await Promise.all(
    [1, 2].map(() =>
      client.post("/api/stock/outgoing", {
        headers,
        data: { productId: product.id, quantity: 8, requestId: randomUUID() },
      }),
    ),
  );
  expect(concurrent.map((r) => r.status()).sort()).toEqual([201, 409]);
  const detail = await (await client.get(`/api/products/${product.id}`)).json();
  expect(detail.data.product.stock).toBe(4);
  expect(detail.data.movements).toHaveLength(3);
  const minimum = await client.patch(`/api/products/${product.id}`, {
    headers,
    data: { minStock: 5 },
  });
  expect((await minimum.json()).data.lowStock).toBe(true);
  expect(
    (
      await client.patch(`/api/products/${product.id}`, {
        headers,
        data: { stock: 99 },
      })
    ).status(),
  ).toBe(422);
  const category = (
    await (
      await client.post("/api/categories", { headers, data: { name: "Kado" } })
    ).json()
  ).data;
  expect(
    (
      await client.patch(`/api/products/${product.id}`, {
        headers,
        data: { category: category.name },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await client.patch(`/api/categories/${category.id}`, {
        headers,
        data: { name: "Hadiah" },
      })
    ).status(),
  ).toBe(200);
  expect(
    (await (await client.get(`/api/products/${product.id}`)).json()).data
      .product.category,
  ).toBe("Hadiah");
  expect(
    (
      await client.delete(`/api/categories/${category.id}`, { headers })
    ).status(),
  ).toBe(204);
  expect(
    (await (await client.get(`/api/products/${product.id}`)).json()).data
      .product.category,
  ).toBe("Tanpa kategori");
  const day = new Date(
    Date.parse(detail.data.movements[0].createdAt) + 7 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
  expect(
    (
      await (
        await client.get(`/api/stock/movements?from=${day}&to=${day}`)
      ).json()
    ).data,
  ).toHaveLength(3);
  const stranger = await playwright.request.newContext({
    // A fulfilled restock clears handling, including when stock equals its minimum.
    baseURL: headers.Origin,
  });
  expect(
    (
      await client.post(`/api/products/${product.id}/handled`, {
        headers,
        data: {},
      })
    ).status(),
  ).toBe(200);
  expect(
    (await (await client.get("/api/products/low-stock")).json()).data,
  ).toEqual([]);
  expect(
    (await (await client.get("/api/products/low-stock?status=handled")).json())
      .data,
  ).toHaveLength(1);
  expect(
    (
      await client.post("/api/stock/incoming", {
        headers,
        data: { productId: product.id, quantity: 1, requestId: randomUUID() },
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await client.post("/api/stock/outgoing", {
        headers,
        data: { productId: product.id, quantity: 1, requestId: randomUUID() },
      })
    ).status(),
  ).toBe(201);
  expect(
    (await (await client.get("/api/products/low-stock")).json()).data,
  ).toHaveLength(1);
  try {
    expect(
      (
        await stranger.post("/api/auth/sign-up/email", {
          headers,
          data: {
            name: "Toko Lain",
            email: `other-${randomUUID()}@example.com`,
            password: "Inventory-test-123!",
          },
        })
      ).status(),
    ).toBe(200);
    expect((await (await stranger.get("/api/products")).json()).data).toEqual(
      [],
    );
    expect(
      (await (await stranger.get("/api/stock/movements")).json()).data,
    ).toEqual([]);
    expect(
      (await (await stranger.get("/api/products/summary")).json()).data
        .productCount,
    ).toBe(0);
    expect(
      (
        await stranger.get(
          `/api/stock/movements/${detail.data.movements[0].id}`,
        )
      ).status(),
    ).toBe(404);
    expect(
      (
        await stranger.post(`/api/products/${product.id}/handled`, {
          headers,
          data: {},
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await stranger.patch(`/api/products/${product.id}`, {
          headers,
          data: { name: "Produk dicoba akun lain" },
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await stranger.delete(`/api/products/${product.id}`, { headers })
      ).status(),
    ).toBe(404);
    expect((await stranger.get(`/api/products/${product.id}`)).status()).toBe(
      404,
    );
    expect(
      (
        await stranger.post("/api/stock/outgoing", {
          headers,
          data: { productId: product.id, quantity: 1, requestId: randomUUID() },
        })
      ).status(),
    ).toBe(404);
  } finally {
    await stranger.dispose();
  }
  expect(
    (await client.delete(`/api/products/${product.id}`, { headers })).status(),
  ).toBe(204);
  expect((await (await client.get("/api/products")).json()).data).toEqual([]);
  expect(
    (
      await client.get(`/api/stock/movements/${detail.data.movements[0].id}`)
    ).status(),
  ).toBe(200);
});
