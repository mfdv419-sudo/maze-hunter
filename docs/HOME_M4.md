# M4 — halaman awal dengan pratinjau labirin

Pasang setelah M3 pada branch maze-1. Paket hanya berisi file baru/berubah
dibanding source M3; pertahankan jalur folder dan timpa file yang sama.
Tidak ada file yang perlu dihapus. Setelah deploy, versi: 24.10.24-M4.

Perubahan halaman awal:
- Diorama pulau labirin 3D dengan jalur yang benar-benar terhubung menuju gerbang.
  Menggunakan generator dan pencari rute game yang sudah ada.
- Preview Retro memperlihatkan titik bergerak menelusuri jalur emas.
- Preview Hidden Maze meredupkan area jauh dan menampilkan dinding lebih tinggi.
- Dua pilihan mode dapat dicoba sebelum login untuk melihat perbedaannya.
  Sesudah ada profil, tombol mode membuka game terkait dan Main mengikuti pilihan.
- Logo, teks, warna, tombol Main, ikon mode dan komposisi disusun ulang.
- Binturong di panggung kecil tetap merespons sentuhan, klik, Enter dan Spasi.
- Layout desktop, HP portrait dan HP landscape diperiksa dengan browser test.
- Geometri sederhana, tile/dinding instanced, tanpa gambar besar, model eksternal,
  efek post-processing atau shadow map. Animasi latar mengikuti reduced-motion.

Tidak ada perubahan kredensial, environment variables, rules Firebase, backend
multiplayer, atau mekanisme login. Perbaikan API key Netlify tetap berlaku.
Gambar pulau di home adalah pratinjau dunia, bukan progres pemain yang dibuat-buat.
Tidak ada deploy otomatis. Login Google asli dan performa HP fisik masih memerlukan
verifikasi pada perangkat pengguna.

Validasi: TypeScript dan production build PASS; 29 unit tests dan 13 browser
tests PASS, termasuk pemilihan preview tanpa login, sentuhan maskot, responsif
1440x900 / 390x844 / 844x390, gameplay Retro/Modern, diagnosis login, dan offline.
