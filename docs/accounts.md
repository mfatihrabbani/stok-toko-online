# Akun toko

Buka `/sign-up`, isi nama pemilik atau toko, email, dan kata sandi 8–128 karakter. Akun baru otomatis masuk dan mulai dengan persediaan kosong. Nama akun digunakan sebagai nama toko. Buka Produk untuk menambahkan produk pertama, atau Barang masuk untuk sekaligus menambahkan produk dan stok.

Starter sudah memiliki tabel Better Auth `user`, `account`, `session`, dan `verification` beserta migrasi PostgreSQL. Tabel tersebut dipakai langsung oleh fitur akun; tidak ada tabel pengguna kedua. Kata sandi disimpan sebagai hash pada akun credential. Peran pengguna berasal dari server dan tidak boleh ditentukan melalui form daftar.

Keluar mengakhiri sesi; produk dan riwayat tetap tersimpan. Halaman serta API persediaan memerlukan sesi yang masih berlaku dan menyaring data berdasarkan akun pemilik. Tautan lupa kata sandi berada di halaman masuk.

`POST /api/auth/sign-up/email` memvalidasi nama, email, dan kata sandi pada server, lalu menyerahkan pembuatan akun serta cookie kepada Better Auth. Nama dan email dirapikan, nama dibatasi 100 karakter, dan permintaan dari origin lain ditolak. Respons auth tidak boleh disimpan cache.

`POST /api/auth/sign-in/email` memeriksa kata sandi melalui Better Auth dan menerbitkan cookie sesi HttpOnly. `POST /api/auth/sign-out` mengakhiri sesi tersebut pada server dan menghapus cookie. Tombol Keluar memuat ulang konteks router sebelum membuka halaman masuk; panggilan API persediaan berikutnya menolak sesi yang sudah diakhiri.

Pemulihan akun lokal memakai Mailpit. `npm run dev` menyiapkan layanan email secara otomatis; `npm run mail:up` menyalakannya secara terpisah. Buka tautan **kotak masuk lokal** pada halaman lupa kata sandi untuk membaca email pemulihan. Email ditampung di komputer ini dan tidak dikirim ke inbox Gmail atau layanan email pribadi. Pengaturan SMTP yang sudah disediakan dipertahankan.

`POST /api/auth/request-password-reset` memberi respons umum agar tidak mengungkap akun yang terdaftar. Email berisi tautan pemulihan yang berlaku 30 menit. `POST /api/auth/reset-password` memakai token tersebut sekali, menyimpan hash kata sandi baru, dan mengakhiri semua sesi lama dalam transaksi auth. Tautan kedaluwarsa atau yang sudah dipakai tidak dapat digunakan lagi.
