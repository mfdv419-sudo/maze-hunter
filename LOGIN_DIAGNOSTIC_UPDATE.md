# Pemeriksaan login Google — 24 Oktober 2026

Paket kecil ini dipasang SETELAH maze-hunter-game-ui-delta.zip pada branch maze-1.
Timpa file dengan jalur yang sama. Tidak ada file yang perlu dihapus.
Tidak ada perubahan rules, kredensial, konfigurasi Firebase, karakter, atau deployment otomatis.

Dari screenshot pengguna: Google provider Enabled dan domain
`deploy-preview-1--maze-hunter.netlify.app` sudah ada dalam Authorized domains.
Penyebab tab Google menutup sendiri belum terbukti; jangan mengubah rules untuk menebak penyebab OAuth.

Perubahan:
- Kesalahan login menampilkan kode Firebase yang aman dan petunjuk ID/EN.
- Pesan tetap terlihat sampai ditutup, sehingga dapat difoto di tablet/HP.
- Respons provider, token, dan kredensial tidak ditampilkan.
- Login dimulai langsung dari handler klik. Tombol menunggu hasil dan bisa dicoba ulang.
- Satu proses popup dipakai bersama jika ada permintaan login saat proses sebelumnya masih berjalan.
- Akses profil Firestore yang ditolak dibedakan dari kegagalan login Google.

Cara menggunakan:
1. Upload isi ZIP ke branch maze-1, pertahankan struktur folder.
2. Tunggu Netlify selesai build. Muat ulang halaman game agar versi terbaru aktif.
3. Tekan Play satu kali. Bila gagal, ambil screenshot panel kode error.
4. Bila akun muncul di Firebase Authentication > Users tetapi profil gagal dimuat,
   periksa kode Firestore yang ditampilkan, bukan hanya konfigurasi OAuth.

Validasi lokal: typecheck, production build, 23 unit tests, dan browser suite.
Browser test mensimulasikan browser menolak popup, bukan akun/login berhasil.
Login Google asli, konfigurasi Firebase yang efektif pada deploy Netlify, dan
perangkat Android pengguna belum terverifikasi. Paket ini memperbaiki visibilitas
kegagalan dan pengendalian permintaan; belum menjamin penyebab login live selesai.
