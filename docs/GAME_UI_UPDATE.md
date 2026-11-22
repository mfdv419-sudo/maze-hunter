# Tampilan game dan kontrol — 24 Oktober 2026

Arah visual: **Rimba Petualangan**. Menu sekarang adalah scene 3D ringan dengan labirin taman, pepohonan, portal dan maskot, bukan layout landing page. Logo dan tombol MAIN memakai Fredoka; font disimpan lokal agar tampilan tetap sama saat offline. Informasi setup Firebase dan penjelasan struktur akun keluarga dihapus dari home.

Binturong diperjelas lewat moncong abu-abu yang menonjol, kumis panjang, telinga gelap berjumbai, syal kecil hijau toska, dan ekor panjang yang melengkung di samping tubuh. Modelnya tetap sederhana, terdiri dari geometri asli yang dianimasikan; tidak memakai karakter atau aset game lain.

## Kontrol Modern

| Perangkat | Gerak | Lompat | Tebas semak |
| --- | --- | --- | --- |
| HP/tablet | Joystick kiri | A biru kanan | B merah kanan |
| Komputer | WASD / panah | Spasi | J atau B |

Joystick dan tombol aksi mendukung sentuhan bersamaan. Lompat mengubah posisi vertikal karakter dan memiliki cooldown; dinding tetap membatasi pergerakan. Tebas membuka semak opsional di jalan buntu terdekat yang tidak terhalang dinding. Tidak ada serangan wajib terhadap pemain/hewan dan objektif utama tetap mencari finish. Retro tetap menelusuri jalur dengan jari/mouse tanpa A/B.

Scene Modern menggunakan HUD di dalam layar permainan; header website tidak lagi mengurangi ruang bermain. Aksi room memiliki validasi cooldown di server dan state semak bersama. Sinkronisasi online nyata masih perlu diuji dengan Firebase/Functions yang dikonfigurasi.

## Firebase

Empat identifier publik dari Firebase Web app yang diberikan pengguna sudah dimasukkan sebagai konfigurasi default project `maze-hunter-e362b`, dengan override environment tetap tersedia. Kredensial Admin tidak dimasukkan. Analytics tidak diaktifkan otomatis.

Agar Google login bekerja pada deployment: pastikan provider Google aktif dan domain Netlify yang dipakai terdaftar di Firebase Authentication. Konfigurasi yang diberikan belum menyertakan `databaseURL`; `storageBucket` bukan URL Realtime Database. Room tetap membutuhkan URL tersebut dan service account server melalui environment Netlify Functions. Jangan mengirim private key lewat chat.

## Penerapan

Gunakan satu paket terbaru `maze-hunter-game-ui-delta.zip` pada branch `maze-1`. Paket adalah delta gabungan terhadap baseline maze-1 original, sudah mencakup perbaikan Netlify sebelumnya. Timpa semua path yang sama dan ikuti `DELETE_FILES.txt`. Tidak perlu mengunggah ulang paket lama sesudahnya.

## Hasil pemeriksaan

- Typecheck, 20 tes logika, validasi level, build dan pemeriksaan batas environment: PASS.
- Enam tes Chromium: PASS, termasuk input sentuh joystick + A secara bersamaan, B, tampilan tanpa teks admin di home, rotasi/resize dan cache font saat offline.
- Bundling Function untuk Node 24: PASS.
- Tampilan dirender dan diperiksa di desktop, portrait HP dan tablet; tidak ada horizontal overflow pada phone viewport yang diperiksa.
- Google login nyata, runtime Netlify, sinkronisasi multi-client dan performa perangkat fisik belum terverifikasi. Pembayaran/langganan tetap belum diimplementasikan.

Referensi desain faktual: ciri binturong https://animals.sandiegozoo.org/animals/binturong ; font Fredoka dan lisensi https://github.com/google/fonts/tree/main/ofl/fredoka ; konfigurasi publik Firebase https://firebase.google.com/docs/web/learn-more .
