# Desain aplikasi stok.

Referensi utama adalah prototipe DesainPakeAI milik pengguna: `../prototype-stok.html` dan screenshot di `../artifacts/page-*-desktop.png` serta `page-*-mobile.png`.

- Pertahankan sidebar desktop 216 px, latar abu-abu #f4f4f4, panel putih, garis #e1e2e3, dan aksi utama arang #242424.
- Di bawah 780 px, navigasi berpindah ke atas. Baris tabel stok menjadi susunan vertikal; nama, SKU, stok saat ini, stok minimal, dan status tetap terbaca.
- Radius panel 16 px, kontrol 8 px, dan indikator status 4 px. Gunakan komponen shadcn yang dimiliki proyek dan token semantik di globals.css.
- Atas permintaan perbaikan tipografi, aplikasi memakai Inter variable yang disajikan lokal dari `public/fonts`, dengan lisensi OFL terlampir. Gunakan regular 400 untuk isi, medium 500 untuk label/kontrol, dan semibold 600 untuk judul/angka utama. Judul halaman tetap 40 px di desktop dan 28 px di ponsel; line-height judul rapat dan isi tetap lega.
- Header daftar produk mengelompokkan judul/jumlah/deskripsi di kiri dan tombol Kelola kategori/Tambah produk di kanan pada desktop. Pada layar sempit, kelompok aksi turun di bawah judul dan dapat membungkus tanpa meluap. Filter dipisahkan dari judul dan aksi dengan divider serta jarak yang konsisten.
- Status Aman, Menipis, dan Habis selalu memiliki teks dan ikon. Warna status harus memakai token success, warning, dan destructive beserta permukaan pendampingnya.
- Data contoh mengikuti 12 produk dalam prototipe dan diberi label Data contoh selama layer frontend. Jangan menyamarkan data tiruan sebagai stok tersimpan.
- Bangun bagian halaman sesuai task yang aktif; komponen dari task berikutnya belum dianggap selesai hanya karena terlihat di prototipe.
- Uji tampilan desktop dan lebar 390 px, navigasi keyboard, serta alur akun. Jangan menambah fitur atau mengubah prototipe sumber saat menerjemahkannya ke TanStack.
