# Maze Hunter M2 — login dan sentuhan maskot

Versi yang harus terlihat di kanan bawah halaman utama: **24.10.24-M2**.

Paket ini menggabungkan maze-hunter-game-ui-delta.zip, login diagnostic, dan
perubahan M2. Gunakan paket ini saja; jangan timpa lagi dengan paket lama.
Upload isinya ke branch maze-1 dengan struktur folder yang sama. Ikuti
DELETE_FILES.txt untuk file lama yang memang sudah digantikan sebelumnya.
Tidak ada commit/push/deploy otomatis dari pembuat paket.

Setelah Netlify selesai build, muat ulang halaman. Jika versi M2 tidak terlihat,
periksa bahwa deploy preview berasal dari branch dan commit yang baru, lalu
tutup tab game lama dan buka lagi alamat preview yang benar. Jangan mengubah
rules Firebase hanya karena panel belum tampil.

Perilaku:
- Ketuk/klik binturong: melambaikan tangan, melompat kecil, menggerakkan ekor.
  Bisa juga difokuskan dengan Tab dan diaktifkan dengan Enter/Spasi.
- Area sentuh mengikuti posisi karakter saat layar berubah orientasi.
- Play segera menampilkan panel status login, bukan menunggu error.
- Jika belum ada hasil setelah 20 detik, panel menunjukkan login/pending.
  Ini kode status aplikasi, bukan kode error dari Firebase.
- Jika Firebase mengembalikan error, tampilkan kode aslinya yang aman.
- Error tanpa kode Firebase ditampilkan sebagai login/unknown.
- Panel tetap terlihat sampai ditutup. Foto panel tersebut untuk diagnosis.

Batas pemeriksaan:
Google provider dan domain preview sudah sesuai pada screenshot pengguna.
Penyebab jendela login live menutup sendiri belum diketahui.
Preview live memberikan HTTP 401 saat pemeriksaan otomatis tanpa sesi pengguna;
versi yang sedang tayang belum dapat dibandingkan dengan source.
Tidak ada perubahan konfigurasi Firebase, rules, atau kredensial.
Tidak ada simulasi akun untuk menggantikan login asli.

Validasi lokal: TypeScript, production build, 23 unit tests, 8 browser tests PASS.
Browser tests mencakup sentuhan maskot pada tablet/ponsel, keyboard, popup yang
ditolak browser, error yang dapat difoto, Retro, Modern, dan offline reload.
Login Google asli dan performa pada perangkat fisik pengguna belum terverifikasi.
