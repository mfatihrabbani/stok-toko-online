# Stok Toko Online

Aplikasi manajemen persediaan untuk toko online. Kelola produk, catat barang masuk dan keluar, pantau stok menipis, serta unduh laporan CSV dalam satu tempat.

Dibangun menggunakan **TanStack Start, React, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Tailwind CSS, dan shadcn/ui**. Tampilan mengacu pada DesainPakeAI dengan font Inter lokal.

## Fitur

- Produk, SKU, kategori, dan batas stok minimal.
- Pencatatan barang masuk/keluar dengan konfirmasi dan perlindungan stok negatif.
- Riwayat pergerakan dengan pencarian, filter tanggal WIB, dan rincian stok sebelum/sesudah.
- Peringatan stok menipis/habis serta penandaan restok yang sudah ditangani.
- Laporan periode, ringkasan per produk, dan ekspor CSV untuk spreadsheet.
- Daftar, masuk, keluar, serta pemulihan kata sandi. Data setiap akun terpisah.
- Sidebar sticky pada desktop dan tata letak responsif untuk ponsel.

## Menjalankan proyek

Siapkan **Node.js 22.12 atau lebih baru** dan **Docker Desktop** yang sudah berjalan. Docker dipakai untuk PostgreSQL dan kotak email lokal; aplikasinya berjalan melalui Node.js.

```sh
git clone https://github.com/mfatihrabbani/stok-toko-online.git
cd stok-toko-online
npm run setup
npm run dev
```

Setup memasang dependensi, membuat pengaturan lokal yang belum ada, menyalakan database dan email lokal, serta menerapkan migrasi. Tidak perlu membuat password database atau menyalin file env sendiri. Menjalankan setup kembali mempertahankan pengaturan dan data yang sudah ada.

Buka URL yang dicetak terminal, biasanya **http://localhost:3000**. Pilih **Daftar**, lalu isi nama pemilik/toko, email, dan kata sandi minimal 8 karakter. Akun baru mulai dengan persediaan kosong. Tambahkan produk melalui **Produk** atau **Barang masuk**.

Biarkan terminal tetap terbuka selama memakai aplikasi. Untuk menjalankannya lagi, cukup gunakan `npm run dev` setelah mesin container berjalan. Petunjuk lengkap tersedia di [panduan pengembangan lokal](docs/local-development.md).

## Data contoh

Setelah membuat akun, jalankan:

```sh
npm run db:seed
```

Seed menambahkan **12 produk, 4 kategori, dan 60 catatan pergerakan** dengan stok akhir yang konsisten. SKU yang sudah ada dilewati, sehingga menjalankannya ulang tidak membuat duplikat atau menimpa stok. Seed hanya berjalan pada database lokal yang dikelola starter.

Jika ada beberapa akun, pilih tujuan dengan `npm run db:seed -- --email EMAIL`. Tambahkan `--dry-run` untuk melihat pratinjau tanpa menyimpan perubahan. Muat ulang halaman setelah seed.

## Pemulihan kata sandi

Pilih **Lupa kata sandi** dan masukkan email akun. Buka URL inbox lokal yang dicetak saat setup, biasanya **http://localhost:8025**, lalu gunakan tautan dari email pemulihan. Mailpit menangkap email lokal; email tersebut tidak dikirim ke Gmail atau layanan lain.

## Perintah pengembangan

| Perintah                                | Kegunaan                                                 |
| --------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                           | Menyiapkan layanan lokal dan menyalakan dev server       |
| `npm run db:seed`                       | Mengisi data contoh ke akun lokal                        |
| `npm run db:up` / `npm run db:down`     | Menyalakan/mematikan database tanpa menghapus data       |
| `npm run mail:up` / `npm run mail:down` | Menyalakan/mematikan inbox email lokal                   |
| `npm run doctor`                        | Memeriksa kesiapan lingkungan                            |
| `npm run lint` / `npm run typecheck`    | Memeriksa kode                                           |
| `npm run build`                         | Membuat build produksi                                   |
| `npm test` / `npm run test:e2e`         | Menjalankan pengujian dengan database sementara terpisah |

Untuk pengujian browser pertama kali, jalankan `npx playwright install chromium` setelah memasang dependensi.

## Dokumentasi

- [Akun dan pemulihan kata sandi](docs/accounts.md)
- [Persediaan, seed, riwayat, dan laporan](docs/inventory.md)
- [Arsitektur aplikasi](docs/architecture.md)
- [Pola backend dan izin akses](docs/backend.md)
- [Deployment](docs/deployment.md)
- [Panduan desain](DESIGN.md)

## Pengaturan pada komputer pengembang saat ini

Salinan lokal yang sudah disiapkan memakai **http://localhost:3001**. Untuk membukanya kembali dengan Podman:

```sh
podman machine start
npm run dev -- --port=3001 --strictPort
```

Jika mesin sudah berjalan, lanjutkan perintah kedua. Pengaturan pribadi tetap berada pada file lingkungan yang diabaikan Git; clone baru menyiapkan pengaturannya sendiri.

## Lisensi

[MIT](LICENSE). Atribusi komponen dan font tersedia di [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
