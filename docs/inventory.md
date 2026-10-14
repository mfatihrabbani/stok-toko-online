# Persediaan stok.

Produk toko disimpan di `products`. Akun baru mulai tanpa produk; data contoh desain tidak otomatis dimasukkan ke toko. API `/api/products`, `/api/products/summary`, dan `/api/products/:id` memerlukan sesi akun dan selalu menyaring pemilik di SQL.

`stock_movements` menyimpan jenis masuk/keluar, jumlah positif, stok sebelum dan sesudah, catatan, waktu, serta nama dan SKU ketika pencatatan dilakukan. Tabel ini dipakai bersama oleh barang masuk, barang keluar, dan detail produk. Foreign key gabungan memastikan catatan dan produk dimiliki akun yang sama; constraint menjaga keseimbangan dan stok tidak negatif. Migrasi `0004_silly_angel.sql` sudah menyiapkan tabel ini, sehingga fitur barang masuk tidak membutuhkan tabel duplikat.

`request_id` unik per akun menyediakan identitas pencatatan untuk mencegah pengiriman ulang menambah stok dua kali. Riwayat tidak boleh diubah diam-diam ketika produk berganti nama.

Barang keluar menggunakan tabel dan migrasi yang sama, dengan `direction = out`. Constraint keseimbangan mewajibkan stok akhir sama dengan stok awal dikurangi jumlah keluar, dan menolak nilai negatif. Tidak ada tabel pengeluaran kedua atau penghapusan migrasi sebelumnya.

Pemilih produk pada barang masuk memakai daftar milik akun yang dimuat dari server. Pencarian nama atau SKU juga tersedia lewat `/api/products?q=teks&limit=100&offset=0`; kategori dan kondisi stok dapat digabungkan. Input pencarian menjadi parameter SQL, bukan potongan query. SKU/nama yang mengandung tanda persen atau garis bawah tetap dicari sebagai teks biasa.
