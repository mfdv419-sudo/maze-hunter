# Maze Hunter — pembaruan 26 Oktober 2026

Paket perubahan dibuat terhadap ZIP `maze-hunter-maze-1 (1).zip` yang Anda unggah. Bukan source awal dan bukan proyek baru.

1. Ekstrak isi ZIP perubahan ke ROOT repository `maze-1`, menimpa file dengan path yang sama. Jangan membuat subfolder tambahan.
2. Bersihkan file lama yang tercantum di FILE_REMOVALS.txt. Build menjalankan `node scripts/clean-legacy.mjs` dengan pemeriksaan hash sehingga file lama yang telah Anda modifikasi tidak akan dihapus diam-diam. Catat penghapusan di Git. Untuk komputer yang memiliki Git: `git rm --ignore-unmatch --pathspec-from-file=FILE_REMOVALS.txt`.
3. **Perbarui Firestore Rules** menggunakan isi `firestore.rules` pada Firebase Console → Firestore Database → Rules → Publish. Ini diperlukan untuk slot `hands`/`feet` dan pembacaan bukti kepemilikan kostum milik profil. Penulisan dokumen `families/{uid}/wardrobes/{profile}` hanya dilakukan Admin SDK di Function; klien tidak boleh menulisnya. Tidak perlu membuat ulang database, Auth atau data profil.
4. Commit/push seluruh file frontend, `netlify/functions/maze-room.ts`, rules, dan penghapusannya pada branch yang sama. Netlify menjalankan `npm run build` dengan Node 24. Functions dan frontend harus memakai revisi yang sama.
5. Tidak ada environment variable baru. Pertahankan konfigurasi Firebase Web dan server yang sudah ada. Jika Functions belum dikonfigurasi, gunakan konfigurasi server asli pada `.env.example`/SETUP; jangan menaruh service account pada variabel VITE_.
6. Sesudah deploy, muat ulang game. Offline cache memakai identitas build baru. Uji memakai profil lama: kostum lama tetap dimiliki; total prestasi tidak berkurang saat menukar saldo.

## Aturan bermain

- Setiap wilayah segel memiliki 3 penjaga besar dan 2 kecil. Semua lima harus dikalahkan sebelum segel wilayah itu terbuka.
- Co-op: target 3 × jumlah anggota saat mulai. Siapa pun boleh mengumpulkan semuanya, kontribusi ditampilkan, boss dan HP dibagi. Pemain tidak saling melukai. Target tidak berubah jika anggota terputus/keluar; anggota tersisa dapat mengambil semua segel. Koneksi ulang menggunakan room yang sama selama anggota belum keluar secara eksplisit.
- Race: masing-masing 3 segel, boss/HP dan gerbang pribadi. Pemain pertama menyelesaikan segel, boss dan finish menang.
- Boss tetap dorman sampai segel lengkap dan pemain memasuki arena. Transformasi 1,8 detik mendahului pergerakan/serangan.
- Desktop: klik arena untuk kamera bebas, gerakkan mouse tanpa menahan klik; Esc melepas mouse, klik kiri menyerang, WASD berjalan, Spasi lompat. Pengaturan menyediakan klik-geser. HP memakai joystick kiri dan geser kanan.
- Sepatu dan sarung tangan dipilih terpisah. Bintang hasil Retro menjadi saldo belanja; penukaran tidak menghapus hasil level/prestasi. Bintang Adventure tetap koleksi ekspedisi, terpisah dari mata uang Retro.

## Verifikasi dan batas pemeriksaan

110 tes logika lulus, termasuk audit seluruh 176 peta, aturan 90%, lima penjaga, Co-op/Race, migrasi dan transaksi kostum, serta hadiah teras tinggi. TypeScript, build frontend, bundel Function dan pemasangan ulang paket diperiksa.

UI browser diperiksa untuk navigasi area, ilustrasi level, Retro canvas dan jeda. Browser pengujian menonaktifkan WebGL sehingga hasil render 3D baru belum dapat diperiksa visual. Belum ada pengujian Android/iPhone fisik atau Firebase Online multi-perangkat. Jangan menganggap laporan browser revisi terdahulu sebagai pengujian revisi ini.

Cadangan source lengkap disediakan terpisah tanpa node_modules dan dist. ZIP perubahan cukup untuk repository unggahan ini; source lengkap berguna untuk pemulihan.
