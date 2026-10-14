# Desain aplikasi stok.

Referensi utama adalah prototipe DesainPakeAI milik pengguna: `../prototype-stok.html` dan screenshot di `../artifacts/page-*-desktop.png` serta `page-*-mobile.png`.

- Pertahankan sidebar desktop 216 px, latar abu-abu #f4f4f4, panel putih, garis #e1e2e3, dan aksi utama arang #242424.
- Di bawah 780 px, navigasi berpindah ke atas. Baris tabel stok menjadi susunan vertikal; nama, SKU, stok saat ini, stok minimal, dan status tetap terbaca.
- Radius panel 16 px, kontrol 8 px, dan indikator status 4 px. Gunakan komponen shadcn yang dimiliki proyek dan token semantik di globals.css.
- Font referensi adalah Cal Sans UI. Prototipe tidak menyertakan berkas font, sehingga CSS menyediakan fallback sistem. Judul halaman 40 px di desktop dan 28 px di ponsel.
- Status Aman, Menipis, dan Habis selalu memiliki teks dan ikon. Warna status harus memakai token success, warning, dan destructive beserta permukaan pendampingnya.
- Data contoh mengikuti 12 produk dalam prototipe dan diberi label Data contoh selama layer frontend. Jangan menyamarkan data tiruan sebagai stok tersimpan.
- Bangun bagian halaman sesuai task yang aktif; komponen dari task berikutnya belum dianggap selesai hanya karena terlihat di prototipe.
- Uji tampilan desktop dan lebar 390 px, navigasi keyboard, serta alur akun. Jangan menambah fitur atau mengubah prototipe sumber saat menerjemahkannya ke TanStack.
