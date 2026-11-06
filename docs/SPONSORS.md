# Ruang sponsor arena
Empat papan kurasi ditempatkan di arena tiga diamond dan boss; area laut menggunakan posisi dek kapal untuk diamond. Jalan aspal mengikuti potongan rute yang ada, selain laut/classic. public/sponsors.json default [] sehingga tidak mengiklankan merek fiktif.

Operator dapat mengisi array dengan objek: id (huruf kecil/angka/tanda hubung, 1–40), name (<70 karakter), image (URL HTTPS gambar), url (URL HTTPS tujuan), active (true), slot (boss, diamond-1, diamond-2, diamond-3; opsional). Maksimal empat objek aktif valid. Server gambar harus mengizinkan CORS agar tekstur dapat dimuat. Ini papan gambar kurasi, bukan portal pembayaran, iklan otomatis, atau tautan interaktif yang sudah ditagih.
