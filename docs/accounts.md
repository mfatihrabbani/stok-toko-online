# Akun toko

Buka `/sign-up`, isi nama pemilik atau toko, email, dan kata sandi 8–128 karakter. Akun baru otomatis masuk dan mulai dengan persediaan kosong. Nama akun digunakan sebagai nama toko. Buka Produk untuk menambahkan produk pertama, atau Barang masuk untuk sekaligus menambahkan produk dan stok.

Starter sudah memiliki tabel Better Auth `user`, `account`, `session`, dan `verification` beserta migrasi PostgreSQL. Tabel tersebut dipakai langsung oleh fitur akun; tidak ada tabel pengguna kedua. Kata sandi disimpan sebagai hash pada akun credential. Peran pengguna berasal dari server dan tidak boleh ditentukan melalui form daftar.

Keluar mengakhiri sesi; produk dan riwayat tetap tersimpan. Halaman serta API persediaan memerlukan sesi yang masih berlaku dan menyaring data berdasarkan akun pemilik. Tautan lupa kata sandi berada di halaman masuk.
