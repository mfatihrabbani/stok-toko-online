import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { assertNode, loadEnvironment } from "./lib.mjs";
import {
  databaseUrl,
  databaseError,
  managesLocalDatabase,
} from "./postgres.mjs";

// Explicit local demo data. This script never runs during signup or setup.
const demoProducts = [
  ["Canvas Tote Bag", "ACC-001", "Aksesori", 48, 15],
  ["Kaos Essential — Putih", "PKN-001", "Pakaian", 72, 20],
  ["Tumbler Stainless 500 ml", "PRL-001", "Perlengkapan", 6, 10],
  ["Notebook A5", "ATK-001", "Alat tulis", 24, 10],
  ["Pouch Serbaguna", "ACC-002", "Aksesori", 0, 8],
  ["Sticker Pack", "ATK-002", "Alat tulis", 96, 20],
  ["Topi Baseball — Hitam", "PKN-002", "Pakaian", 3, 8],
  ["Mug Keramik", "PRL-002", "Perlengkapan", 18, 10],
  ["Kaus Kaki Basic", "PKN-003", "Pakaian", 30, 12],
  ["Lanyard", "ACC-003", "Aksesori", 12, 5],
  ["Poster A3", "ATK-003", "Alat tulis", 5, 10],
  ["Keychain Akrilik", "ACC-004", "Aksesori", 42, 10],
];

function parseArguments() {
  const result = { dryRun: false };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--dry-run") result.dryRun = true;
    else if (["--user", "--email"].includes(args[index]) && args[index + 1]) {
      result[args[index].slice(2)] = args[++index];
    } else
      throw new Error(
        "Gunakan npm run db:seed -- [--user ID | --email EMAIL] [--dry-run].",
      );
  }
  if (result.user && result.email)
    throw new Error("Pilih satu identitas akun: --user atau --email.");
  return result;
}

function historyFor(stock, index, today) {
  const saleOne = 4 + (index % 4);
  const saleTwo = 8 + (index % 5);
  const refill = 6 + (index % 7);
  const steps = [
    ["in", stock + saleOne + saleTwo, -14, "Persediaan awal toko"],
    ["out", saleOne, -10, "Pesanan marketplace selesai dikirim"],
    ["out", saleTwo, -7, "Penjualan toko online"],
    ["in", refill, -3, "Restok dari pemasok"],
    ["out", refill, -1, "Pesanan pelanggan pekan ini"],
  ];
  let balance = 0;
  return steps.map(([direction, quantity, day, note], step) => {
    const before = balance;
    balance += direction === "in" ? quantity : -quantity;
    if (balance < 0)
      throw new Error("Riwayat contoh menghasilkan stok negatif.");
    return {
      direction,
      quantity,
      before,
      after: balance,
      note,
      at: new Date(
        Date.parse(today + "T00:00:00+07:00") +
          day * 86_400_000 +
          (9 + (index % 6)) * 3_600_000 +
          step * 60_000,
      ),
    };
  });
}

assertNode();
await loadEnvironment();
let pool;
try {
  const options = parseArguments();
  if (!managesLocalDatabase())
    throw new Error(
      "Seed ini hanya untuk database lokal yang dikelola starter; koneksi luar tidak diubah.",
    );
  pool = new Pool({
    connectionString: databaseUrl(),
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  pool.on("error", () => {});
  const users = await pool.query(
    'SELECT id, name FROM "user" WHERE ($1::text IS NULL OR id = $1) AND ($2::text IS NULL OR lower(email) = lower($2)) ORDER BY created_at LIMIT 2',
    [options.user ?? null, options.email ?? null],
  );
  if (!users.rows.length)
    throw new Error(
      "Buat akun melalui /sign-up terlebih dahulu, atau periksa identitas akun.",
    );
  if (users.rows.length !== 1)
    throw new Error(
      "Ada beberapa akun. Tentukan akun tujuan dengan npm run db:seed -- --email EMAIL.",
    );
  const owner = users.rows[0];
  const existing = await pool.query(
    "SELECT lower(sku) AS sku FROM products WHERE user_id = $1",
    [owner.id],
  );
  const skus = new Set(existing.rows.map((row) => row.sku));
  const missing = demoProducts.filter(
    (product) => !skus.has(product[1].toLowerCase()),
  );
  if (options.dryRun) {
    console.log(
      `Pratinjau untuk ${owner.name}: ${missing.length} produk dan ${missing.length * 5} pergerakan akan ditambahkan. Data yang sudah ada dipertahankan.`,
    );
  } else {
    const client = await pool.connect();
    let created = 0;
    let movementCount = 0;
    const today = new Date(Date.now() + 7 * 3_600_000)
      .toISOString()
      .slice(0, 10);
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
        ["categories:" + owner.id],
      );
      await client.query('SELECT id FROM "user" WHERE id = $1 FOR KEY SHARE', [
        owner.id,
      ]);
      for (const [
        index,
        [name, sku, category, stock, minimum],
      ] of demoProducts.entries()) {
        const duplicate = await client.query(
          "SELECT id FROM products WHERE user_id = $1 AND lower(sku) = lower($2)",
          [owner.id, sku],
        );
        if (duplicate.rows.length) continue;
        await client.query(
          "INSERT INTO categories (user_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [owner.id, category],
        );
        const group = (
          await client.query(
            "SELECT id, name FROM categories WHERE user_id = $1 AND lower(name) = lower($2)",
            [owner.id, category],
          )
        ).rows[0];
        const history = historyFor(stock, index, today);
        const last = history.at(-1);
        if (last.after !== stock)
          throw new Error("Stok akhir riwayat contoh tidak cocok.");
        const product = await client.query(
          "INSERT INTO products (user_id, name, sku, category, category_id, stock, min_stock, unit, created_at, updated_at, restock_handled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'unit',$8,$9,$10) ON CONFLICT DO NOTHING RETURNING id",
          [
            owner.id,
            name,
            sku,
            group.name,
            group.id,
            stock,
            minimum,
            history[0].at,
            last.at,
            sku === "PKN-002" ? new Date() : null,
          ],
        );
        if (!product.rows.length) continue;
        for (const event of history) {
          await client.query(
            "INSERT INTO stock_movements (user_id, product_id, product_name, product_sku, direction, quantity, stock_before, stock_after, note, request_id, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
            [
              owner.id,
              product.rows[0].id,
              name,
              sku,
              event.direction,
              event.quantity,
              event.before,
              event.after,
              event.note,
              randomUUID(),
              event.at,
            ],
          );
          movementCount++;
        }
        created++;
      }
      await client.query("COMMIT");
      console.log(
        `Seed selesai untuk ${owner.name}: ${created} produk dan ${movementCount} pergerakan baru. Produk/SKU yang sudah ada dilewati.`,
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
} catch (error) {
  console.error(error.code ? databaseError(error) : error.message);
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
