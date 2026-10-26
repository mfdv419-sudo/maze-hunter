# Online Sync & Chat — pemasangan

Ini **delta setelah paket Terrain & Online yang berisi 42 file**, dengan source lengkap pendamping `maze-hunter-terrain-online-source.zip`. Terapkan pada branch terbaru yang sudah menjalankan revisi itu.

1. Ekstrak seluruh isi ZIP delta ke root repository, timpa path yang sama. Tidak ada penghapusan tambahan.
2. Commit/push frontend dan `netlify/functions/maze-room.ts` bersama, lalu deploy ulang. Node 24, `npm run build`, publish `dist` dan directory Functions tetap sama. Jangan hanya memperbarui dist: handler chat dan perubahan simulasi server harus ikut di-deploy.
3. Tidak ada environment variable atau rules baru. Pertahankan konfigurasi Firebase dan rules yang sudah digunakan pada revisi 42 file.
4. Buka room baru setelah deploy. Jangan melanjutkan room pertandingan yang dibuat sebelum perubahan simulasi ini. Muat ulang kedua perangkat agar memakai frontend yang sama.

## Yang diperbaiki

Posisi Online sebelumnya diubah pada objek tampilan saja, sementara simulasi masih memakai Start bawaan. Pembaruan room juga dapat mengembalikan gerakan lokal yang belum dikonfirmasi, dan nomor urut reconnect dimulai ulang. Sekarang kedua posisi diinisialisasi dari snapshot server, gerakan menunggu ack milik pemain sendiri, dan nomor urut melanjutkan server. Koreksi nyata saat jatuh, respawn atau lintasan ditolak tetap berlaku.

Pada koneksi lambat, prediksi dibatasi dan indikator “Menunggu koneksi” tampil. Permainan server tetap berjalan; ini tidak membekukan waktu pertandingan. Callback dari room/halaman yang sudah ditinggalkan diabaikan.

Lobby memakai grid tetap 4/8/10 slot dan footer terpisah. Anggota yang bergabung mengisi slot, bukan menambah tinggi halaman. Kode room bisa disalin. Error indikator hidden setelah dialog ditutup telah diperbaiki. Informasi HUD permainan memakai satu stack dengan jarak yang konsisten.

## Kue

| Sumber | Classic | Super merah/kuning/hijau |
|---|---|---|
| Checkpoint/wilayah segel | +1 setiap 2 detik, maksimal 8 | Tidak otomatis |
| Arena boss aktif, segel lengkap | +1 setiap 2 detik, maksimal 8 | Tidak otomatis |
| Tanaman tertentu saat memakai B | +2, maksimal 8 | Tidak menambah |
| Segel | +2, maksimal 8 | Tidak menambah |
| Penjaga dikalahkan | +3, maksimal 8 | Tidak menambah |
| Peti | Diisi hingga 8 | +1 setiap warna, maksimal 5 |

Stok awal super tetap 3 tiap warna. Menembakkan super menggunakan 1 bekal Classic dan 1 muatan warna. Isi ulang Classic kini juga berjalan pada server untuk setiap anggota Co-op; tidak lagi terlewati oleh jalur simulasi pemain bersama.

## Chat

Tombol Chat room tersedia di lobby dan tombol gelembung chat di permainan. Ada pesan teks (maksimal 180 karakter) dan empat pesan cepat: Tunggu, Bantu aku, Ayo ke Raja, Terima kasih. Chat terlihat oleh anggota room; pertandingan tetap berjalan. Tersimpan 30 pesan terakhir; batas kirim satu pesan per detik. Mengetik tidak memicu WASD/lompat/lempar. Live suara belum tersedia dan tidak ada pengambilan izin mikrofon pada paket ini.

## Verifikasi

134 tes Vitest / 22 file dan TypeScript lulus. Tes dua klien memakai fungsi sinkronisasi runtime yang sama, bergerak bersamaan dalam simulasi Race dan Co-op, menerima snapshot anggota lain, serta memeriksa ack, reconnect, respawn dan batas prediksi. Handler chat diuji untuk identitas dan keanggotaan.

UI lobby diperiksa pada frame 844×390 dan 740×360 dengan 10 anggota: seluruh tombol footer terlihat dan halaman tidak bertambah tinggi. Chat dikirim pada fixture lokal tanpa koneksi Firebase. Render WebGL dan sesi nyata dua perangkat pada deployment Anda belum diverifikasi. Build frontend, bundel Function dan pemasangan ulang delta diperiksa sebelum pengiriman.
