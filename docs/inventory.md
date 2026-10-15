# Persediaan stok.

Halaman `/laporan` menyimpan rentang tanggal WIB dalam URL (bawaan bulan ini). `GET /api/reports/movements?from=YYYY-MM-DD&to=YYYY-MM-DD` mengembalikan total seluruh periode, agregasi per produk, dan 50 catatan per halaman. Tanggal akhir termasuk sampai sebelum tengah malam berikutnya; rentang terbalik ditolak. Total dan agregasi dibaca dalam transaksi konsisten, terpisah dari paginasi tabel.

`GET /api/reports/export?kind=stock` mengunduh seluruh stok aktif saat ini. `kind=movements` atau `kind=products` memerlukan from/to dan mengekspor seluruh periode, termasuk riwayat produk diarsipkan. Semua ekspor hanya berisi data pemilik sesi, memakai CSV UTF-8 dengan BOM untuk Excel/Google Sheets, mengutip koma/tanda kutip/baris baru, serta menetralkan teks yang dapat dibaca sebagai rumus spreadsheet. Unduhan tidak dibatasi halaman yang sedang terlihat.

Ringkasan laporan memakai kontrak `GET /api/products/summary`: `productCount`, `totalStock`, `lowCount`, `emptyCount`, dan `categoryCount`. Agregasi SQL hanya mencakup produk aktif pemilik sesi; akun kosong mendapat angka nol. Kartu dan ekspor stok halaman laporan memakai daftar produk aktif dari loader sesi yang sama. Periode pergerakan tidak memengaruhi stok saat ini.

Laporan menggunakan tabel `stock_movements` dan migrasi 0004 yang sama dengan pencatatan serta riwayat. Indeks `movements_user_created_idx` melayani rentang waktu per akun; indeks `movements_product_created_idx` melayani rincian per produk. Laporan tidak membuat salinan data atau tabel pergerakan kedua. Snapshot nama/SKU dan produk yang diarsipkan tetap tersedia untuk laporan historis, sedangkan ringkasan stok saat ini hanya menghitung produk aktif.

Produk toko disimpan di `products`. Akun baru mulai tanpa produk; data contoh desain tidak otomatis dimasukkan ke toko. API `/api/products`, `/api/products/summary`, dan `/api/products/:id` memerlukan sesi akun dan selalu menyaring pemilik di SQL.

`stock_movements` menyimpan jenis masuk/keluar, jumlah positif, stok sebelum dan sesudah, catatan, waktu, serta nama dan SKU ketika pencatatan dilakukan. Tabel ini dipakai bersama oleh barang masuk, barang keluar, dan detail produk. Foreign key gabungan memastikan catatan dan produk dimiliki akun yang sama; constraint menjaga keseimbangan dan stok tidak negatif. Migrasi `0004_silly_angel.sql` sudah menyiapkan tabel ini, sehingga fitur barang masuk tidak membutuhkan tabel duplikat.

`request_id` unik per akun menyediakan identitas pencatatan untuk mencegah pengiriman ulang menambah stok dua kali. Riwayat tidak boleh diubah diam-diam ketika produk berganti nama.

Barang keluar menggunakan tabel dan migrasi yang sama, dengan `direction = out`. Constraint keseimbangan mewajibkan stok akhir sama dengan stok awal dikurangi jumlah keluar, dan menolak nilai negatif. Tidak ada tabel pengeluaran kedua atau penghapusan migrasi sebelumnya.

Pemilih produk pada barang masuk memakai daftar milik akun yang dimuat dari server. Pencarian nama atau SKU juga tersedia lewat `/api/products?q=teks&limit=100&offset=0`; kategori dan kondisi stok dapat digabungkan. Input pencarian menjadi parameter SQL, bukan potongan query. SKU/nama yang mengandung tanda persen atau garis bawah tetap dicari sebagai teks biasa.

Barang keluar memakai kontrak daftar/pencarian yang sama. Pemilih tetap menampilkan produk habis beserta jumlah tersedia agar pengguna memahami mengapa produk itu belum dapat dikeluarkan. Produk baru di form masuk tetap berupa draf sampai konfirmasi tersimpan.

Layanan produk menghitung `lowStock` dari stok saat ini dan batas minimal di SQL; nilainya ikut berubah setelah pencatatan maupun pengubahan batas. Antarmuka membedakan Habis (stok nol) dan Menipis (stok positif di bawah batas). Batas yang sama dengan stok masih dianggap aman. Stok awal produk baru dicatat sebagai pergerakan masuk dalam transaksi pembuatan yang sama; pengubahan produk tidak dapat menimpa jumlah stok secara langsung.

Fitur riwayat memakai `stock_movements` dari migrasi 0004 dan indeks per pemilik/waktu serta produk/waktu. Data catatan bersifat tetap: produk yang dihapus hanya diberi waktu arsip, sehingga foreign key dan snapshot nama/SKU riwayat tetap terjaga. Pengubahan kategori memperbarui data produk terkait dalam transaksi; penghapusan kategori memindahkan produknya ke Tanpa kategori tanpa menghapus stok atau catatan.

`GET /api/stock/movements` mendukung q, from/to tanggal WIB inklusif, direction, productId, limit, dan offset. `GET /api/stock/movements/:id` mengembalikan satu catatan milik akun, termasuk saat produknya telah diarsipkan. Catatan yang tidak ada dan catatan milik akun lain sama-sama menghasilkan 404. Halaman `/riwayat` menyimpan filter di URL dan membuka 50 catatan per halaman.

Halaman stok, produk, riwayat, pencatatan, dan peringatan berada dalam layout `_protected`; pengguna tanpa sesi diarahkan ke `/sign-in` sebelum loader data berjalan. Server function melakukan pemeriksaan sesi tersimpan sendiri, dan setiap API tetap menolak akses tanpa sesi walaupun dipanggil langsung. Halaman lupa/reset kata sandi terbuka bagi pemilik tautan pemulihan; halaman masuk/daftar mengarahkan pengguna yang sudah masuk ke stok.

Peringatan memakai batas minimal produk dan `restock_handled_at`. Saat stok mencapai atau melewati batas minimal, transaksi stok menghapus tanda penanganan. Bila stok turun lagi, peringatan aktif muncul kembali. Pengubahan batas minimal yang membuat stok aman juga menghapus tanda tersebut. Menandai sudah dipesan tidak mengubah stok atau membuat riwayat pergerakan.
