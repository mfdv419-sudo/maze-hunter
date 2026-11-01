# Maze Hunter — riwayat revisi

## 1 November 2026 — Gameplay & Animation Polish

Paket delta ini dipasang setelah **Motion Corrections (12 file, 30 Oktober)**. Salin isi folder `maze-hunter` di ZIP ke proyek yang sudah memuat revisi sebelumnya. Paket hanya berisi file yang berubah; bukan source lengkap.

### Yang diperbaiki

- **Dialog jeda:** semua tombol memakai lebar, sisi kiri/kanan, jarak, dan ukuran teks yang konsisten. Panel lebih ringkas dan muat tanpa scrollbar pada ukuran layar yang diuji, termasuk landscape ponsel. Override dibatasi pada dialog jeda agar daftar panjang seperti koleksi dan peringkat tetap dapat diakses.
- **Retro:** waktu setiap level berkurang tepat 20 detik. Level 1–20: 60 → 40 detik; 21–40: 90 → 70 detik; 41–80: 120 → 100 detik; 81–100: 150 → 130 detik.
- **Adventure Easy:** seluruh penjaga biasa, termasuk penjaga seal besar/kecil dan elite, memiliki 2 HP. Dua cake klasik mengalahkan mereka. Cake merah tetap lebih kuat. HP boss tidak diubah. Save lama membatasi HP penjaga Easy yang masih hidup ke maksimum 2.
- **Kebangkitan boss:** kamera memiliki lintasan orbit dan dolly yang nyata, kemudian berpindah kembali menuju sudut pemain di bagian akhir cuplikan. Model boss mengangkat kepala dan meregangkan anggota tubuh saat bangkit. Timeline server, perlindungan pemain dan tombol lewati dipertahankan.
- **Ekor Binturong:** winding segitiga diperbaiki, rangka penampang dijaga kontinu saat melengkung, dan bentuk saat berenang diputar dari pangkal agar tidak terlipat atau mengarah ke depan. Ini perbaikan geometri, bukan menyembunyikan celah dengan transparansi.
- **Trekking pole:** pegangan dipasang pada tangan; sudut shaft dikompensasi terhadap bahu dan siku supaya hampir tegak dengan ujung sedikit ke belakang, bukan menyapu jauh di depan. Ada wrist strap. Pole disimpan saat memanjat dan saat berdiri di atas objek.
- **Memanjat:** tangan memakai perhitungan dua ruas agar panjang lengan tetap, perpindahan pose lebih lembut, dan tarikan naik bangunan/batu diperpanjang menjadi 0,9 detik. Pohon tetap menggunakan tiga tahap tarikan dalam 2,1 detik. Animasi masih memakai rig prosedural; belum memakai animasi rekaman atau kontak jari lengkap.
- **Batu jatuh:** tumbukan diteruskan ke batu persisten pada posisi akhir yang sama. Ada pantulan vertikal yang mereda selama 0,9 detik. Ketinggian tumpukan dan waktu tumbukan disimpan. Tumpukan menangkap batu berikutnya lebih awal. Kontak memperhitungkan permukaan tanah di seluruh tapak batu, permukaan arena boss, serta tepian/objek panjat. Batu tetap bisa diangkat dengan efek spinach dan diletakkan seperti sebelumnya. Batas performa 72 batu persisten per arena dipertahankan; sesudah penuh, jatuhan baru dihentikan.

### Cara memasang

1. Salin file yang berubah ke branch GitHub yang digunakan Netlify; jalankan deploy/build ulang.
2. Salin perubahan yang sama ke folder server di laptop.
3. **PowerShell 1 (server):** hentikan server dengan Ctrl+C, jawab Y bila diminta. Dari folder proyek jalankan:

```powershell
npm.cmd run build:realtime
npm.cmd run start:realtime:local
```

4. Biarkan **PowerShell 2 (tunnel)** tetap berjalan. Tidak ada environment variable baru. Jika tunnel dinyalakan ulang dan alamat berubah, ikuti pembaruan `VITE_REALTIME_URL` seperti sebelumnya.
5. Buka ulang game setelah deploy dan uji **room baru** agar frontend dan server memakai aturan yang sama. Jangan mengunggah `.env.realtime` atau service-account JSON ke GitHub.

### Rekomendasi peningkatan desain berikutnya

Bagian ini adalah arah desain, belum merupakan penggantian model dalam paket ini.

- **Binturong:** pertahankan telinga berjumbai, moncong, kumis dan ekor panjang; perhalus sambungan bahu/pinggul dan proporsi telapak. Gunakan fur shading ringan, ekspresi mata/alis, idle bernapas dan penyesuaian telapak ke tanah. Kostum sebaiknya mengikuti gerak tubuh dengan detail kain, strap dan aksesori yang jelas.
- **Penjaga:** bedakan siluet dan cara bergerak per habitat, bukan sekadar warna. Kambing memakai langkah kuku dan ancang-ancang; trenggiling menekuk badan sebelum menggulung; kepiting bergerak menyamping dengan capit dan gelembung. Gerakan pembuka harus tetap mudah dibaca pemain.
- **Boss:** gunakan siluet khas yang lebih besar dan mudah dikenali, material/armor yang konsisten dengan area, ekspresi mata, reaksi kena serang, serta perubahan pose per fase. Adegan retak sebaiknya dilengkapi gerak berat badan dan serpihan yang mengikuti materialnya.

### Validasi dan batas pengujian

Suite unit mencakup arah permukaan ekor pada beberapa pose, arah pole, panjang ruas lengan, dua hit Easy, waktu Retro, lintasan kamera, pantulan dan serialisasi tumpukan batu. Tes browser memakai UI jeda asli pada tiga ukuran layar dan memeriksa perubahan kamera serta posisi batu pada runtime game. Hasil validasi: 238 tes unit dan 2 tes browser lulus; build frontend dan server juga lulus.

Pengujian ini bukan pengukuran FPS di HP/tablet fisik atau latensi multiplayer melalui koneksi internet pengguna. Pantulan batu merupakan presentasi deterministik dari state server; tidak memakai engine rigid-body 3D penuh. Peningkatan desain model besar di atas tetap merupakan rekomendasi.
