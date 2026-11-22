# Perbaikan aksi online, retry gerak, dan tampilan penjaga

Paket ini dipasang setelah revisi camera-tablet 13 file. Paket ini juga mencakup ulang seluruh room-lease fix 5 file, sehingga repository GitHub yang belum menerima patch backend lokal tersebut dapat menggunakan paket ini langsung setelah camera-tablet.

## Perubahan

1. Konfirmasi gerak sekarang menyelesaikan rekonsiliasi dan membersihkan penanda in-flight sebelum promise yang ditunggu aksi hit/jump/item selesai. Sebelumnya, promise jaringan mentah dapat selesai sebelum callback cleanup; aksi yang mengantre lalu mendapat packet null dan berhenti tanpa dikirim.
2. Penolakan command WebSocket dibedakan dari gangguan transport. Jalur gerak dan aksi kini mereset prediksi dari snapshot otoritatif ketika server menolak command, seperti pergerakan menembus dinding. Paket gerak yang sama tidak diulang terus hanya karena error WebSocket tidak memiliki teks HTTP 400.
3. Snapshot dengan revision/epoch/room yang sama tidak lagi memulihkan simulasi klien dua kali pada objek game yang sama. Snapshot yang baru dan sesi game baru tetap diproses.
4. Prediksi visual patroli penjaga kembali berjalan setelah waktu telegraph/ancang-ancang berakhir; timestamp lama yang bernilai positif tidak lagi menghentikan extrapolasi selamanya. HP, damage, pickup dan hasil serangan tetap ditentukan server.
5. Transport mengukur waktu respons command (round trip termasuk pemrosesan), dan menghitung offset jam menggunakan titik tengah kirim-terima. Jika respons lebih dari 350 ms, status koneksi dalam permainan menampilkan angka ms. Angka tickMs dari /health tetap hanya durasi simulasi server, bukan latensi jaringan atau FPS perangkat.
6. Koreksi import tipe pada tes patch room-lease agar pemeriksaan TypeScript frontend juga lulus.

## Pemasangan

- Gabungkan folder maze-hunter dari delta ke repository GitHub pada branch yang menghasilkan deploy-preview-1. Timpa file dengan jalur yang sama.
- Deploy ulang frontend Netlify, lalu refresh game di kedua perangkat. Gunakan akun/profil berbeda dan buat room baru.
- Tidak perlu environment baru. Pertahankan VITE_REALTIME_URL yang menunjuk ke tunnel yang sedang aktif.
- Server laptop yang sudah memakai room-lease fix (storage healthy) tidak memerlukan restart karena file backend dalam paket ini identik dengan patch sebelumnya. Biarkan PowerShell server dan tunnel tetap berjalan.
- Source lokal boleh digabungkan juga agar sesuai repository. Jangan mengunggah service-account.json, .env.realtime atau private key ke GitHub.

## Pengujian

- 221 tes / 36 suite lulus, termasuk dua koneksi WebSocket nyata pada loopback dengan balasan gerak ditunda. Aksi yang mengantre berhasil menebas grass di area classic dan memanen vegetasi di forest, dan state kedua pemain menerima perubahan.
- Tes serangan watermelon membunuh penjaga dalam state kedua pemain dan menjaga idempotensi penggunaan item.
- Tes produksi RealtimeClient mencakup tipe penolakan command, reconnect, patch snapshot, dan pengukuran respons yang sengaja ditunda.
- Tes antrean memastikan packet tersedia setelah konfirmasi gerak selesai, retry transport tetap tersedia, dan prediksi penjaga bergerak lagi setelah telegraph berakhir.
- Build frontend TypeScript/Vite dan pemeriksaan batas public environment lulus.

Pengujian jaringan menggunakan loopback dengan autentikasi/store tes; bukan Google/Firebase produksi atau Cloudflare tunnel pengguna. Patch ini memperbaiki kesalahan yang ditemukan pada kode, tetapi belum membuktikan latensi perangkat nyata setara Solo.

## Uji penerimaan dua perangkat

1. Berdiri dekat rumput, lalu tekan B saat masih berjalan dan setelah berhenti. Periksa rumput hilang untuk pemain lain dan hadiah tidak berulang.
2. Lempar cake ke penjaga yang memiliki jalur tembak terbuka sampai kalah, lalu cek kedua layar.
3. Pilih item yang stoknya tersedia, tekan B, dan pastikan efek serta stok dikonfirmasi.
4. Bila masih lag, catat angka ms status koneksi dan apakah seluruh tampilan tersendat atau hanya pembaruan dunia. Sertakan /health saat pertandingan berlangsung. Laptop dan HP pada Wi-Fi yang sama tetap melewati internet ketika frontend menggunakan URL Cloudflare publik.
