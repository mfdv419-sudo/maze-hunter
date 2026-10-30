# Perbaikan room hilang saat lobby / Room unavailable

Paket backend ini kompatibel dengan realtime-server-rocks (40 file) dan revisi kamera/tablet (13 file). Tidak mengganti konfigurasi Firebase, frontend, atau data pemain.

## Penyebab yang diperbaiki

Transaksi Firebase Admin dapat memanggil callback pertama kali dengan null karena cache lokal belum berisi data, meskipun node room ada di server. Pembaruan lease dan recovery sebelumnya langsung mengembalikan undefined, sehingga transaksi dibatalkan sebelum membandingkan data server. Lease tidak diperbarui dan instance berhenti mengelola room setelah batas 12 detik.

Callback kini mengembalikan null pada cache kosong: Firebase melakukan perbandingan dan mengulang callback dengan data server bila node remote ada. Bila node benar-benar tidak ada, node tetap tidak ada dan hasil tersebut tidak dianggap sebagai pembaruan lease yang berhasil. Pemeriksaan pemilik dan waktu lease tetap berlaku; instance lain tidak boleh menulis room yang masih dimiliki server aktif.

Rujukan perilaku transaksi: https://firebase.google.com/docs/database/admin/save-data#transaction_function_is_called_multiple_times

Kegagalan checkpoint kini dicatat di terminal server. `/health` menambahkan `storage.healthy`, `storage.failures`, dan `storage.lastError`, tanpa token, kunci Firebase atau data pemain. `healthy` adalah status checkpoint yang telah dicoba, bukan pemeriksaan aktif seluruh izin Firebase. Kegagalan database lain seperti permission atau jaringan tetap perlu diselesaikan menurut pesan log.

## Pemasangan di laptop server Windows

1. Biarkan PowerShell Cloudflare tetap menyala agar alamat tunnel tidak berubah.
2. Di PowerShell server Node.js, tekan Ctrl+C.
3. Gabungkan isi folder `maze-hunter` dari delta ke folder source server yang selama ini dipakai. Timpa tiga file di folder `realtime`, tambahkan test dan dokumen. Jangan hapus atau menimpa `.env.realtime` maupun `service-account.json`.
4. Dari folder yang memiliki package.json, jalankan satu per satu:

```powershell
npm.cmd run build:realtime
npm.cmd run start:realtime:local
```

Gunakan PowerShell server yang sama agar environment service account yang dimuat sebelumnya tetap tersedia. Jika jendela sudah ditutup dan service account memang dibaca dari file, muat kembali dahulu:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content -Raw ".\service-account.json" | ConvertFrom-Json | ConvertTo-Json -Compress
```

Tidak perlu npm ci, instal aplikasi lagi, mengubah VITE_REALTIME_URL, atau deploy ulang Netlify untuk patch backend ini.

## Pemeriksaan

- Setelah server menyala, muat ulang game dan buat room baru. Tetap di lobby.
- Buka http://localhost:8080/health, pastikan rooms bernilai 1.
- Tunggu minimal 30 detik, refresh /health: room tetap 1 dan storage.healthy true dengan failures 0.
- Join dari perangkat lain menggunakan profil berbeda, lalu uji Ready dan Start.
- Jika room masih terlepas, simpan isi /health dan baris terminal `Realtime checkpoint failed` beserta kode error. Jangan kirim kunci Firebase.

## Validasi paket

216 tes / 36 suite lulus. Lima tes baru mereproduksi cache kosong untuk penyimpanan, join/recovery, penolakan pemilik lain, node yang benar-benar dihapus, pemulihan kegagalan sementara, serta fencing saat kegagalan berlanjut. Uji dua koneksi WebSocket loopback berhasil create, melewati 30 detik waktu simulasi, join, dan memeriksa status HTTP health. Build backend TypeScript/esbuild lulus.

Firebase untuk regresi memakai simulasi transaksi dengan perilaku cache awal null. Kredensial Firebase produksi dan perangkat fisik pengguna tidak digunakan dalam pengujian ini; penerimaan akhir tetap dilakukan pada server laptop pengguna.
