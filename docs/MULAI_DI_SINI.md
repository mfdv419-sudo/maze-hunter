# Mulai di sini — tampilan game terbaru

Paket `maze-hunter-game-ui-delta.zip` adalah **delta gabungan terhadap ZIP baseline maze-1 original**. Sudah termasuk implementasi awal, perbaikan Netlify Node 24/secret scanning, serta revisi UI, binturong, dan kontrol A/B. Tidak perlu menumpuk kembali paket lama setelah paket ini.

1. Upload seluruh isi paket ke branch `maze-1`, pertahankan struktur folder dan timpa file yang namanya sama.
2. Hapus file lama dalam `DELETE_FILES.txt`. ZIP tidak otomatis menghapus file.
3. Deploy source terbaru di Netlify. Node 24, `npm run build`, publish `dist` dan Functions sudah ditentukan di `netlify.toml`.
4. Konfigurasi publik Firebase Web yang Anda kirim sudah ada di source. Untuk login nyata, Google provider dan domain deployment harus diizinkan pada project Firebase existing.
5. Room online tetap membutuhkan URL Realtime Database yang benar serta environment server Functions. `storageBucket` bukan URL Realtime Database. Jangan kirim service account/private key melalui percakapan.

Yang berubah: home menjadi scene game 3D; font Fredoka tersimpan lokal; teks admin dihapus dari home; binturong memiliki moncong, kumis, telinga berjumbai dan ekor panjang terlihat; Modern memakai joystick kiri dan dua tombol kanan: A biru lompat, B merah tebas semak. Retro tetap trace-path. Lompat tidak melewati dinding; tebas tidak mengubah game menjadi combat wajib.

Panduan lengkap tetap ada di `README.md`; hasil tes di `QA_REPORT.md`. Browser game belum final komersial: koneksi Firebase/multiplayer nyata dan pembayaran/iklan tetap perlu diselesaikan dan diverifikasi. Tidak ada perubahan langsung ke GitHub Anda.
