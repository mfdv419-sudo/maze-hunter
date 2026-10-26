# Pickup, Bandwidth & Camera — 27 October 2026

Terapkan setelah **Online Smoothness & Living Biomes (delta 41 file)**. Source lengkap disertakan bila urutan delta tidak pasti. Tidak ada file yang perlu dihapus.

## Instalasi
Salin isi delta ke root source repository sesuai folder, lalu deploy frontend dan Netlify Functions bersama. Perubahan ini mencakup netlify/functions/maze-room.ts dan dependencies server; jangan hanya mengunggah dist. Refresh kedua perangkat dan buat room baru. Tidak perlu environment variable, database, Firebase Auth atau rules baru. Jangan membuat ulang Firebase atau memasukkan service-account JSON ke frontend.

## Akar masalah dan perubahan
1. **Pickup terlewat di antara endpoint.** Jalur online menyederhanakan bagian lurus, sementara server sebelumnya memeriksa pickup di ujungnya saja. Kini pemeriksaan dilakukan setiap <=0,08 cell sepanjang jalur. Bintang dan diamond yang sudah terbuka tetap diambil meskipun dilewati tanpa berhenti. Respawn/death menghentikan sisa lintasan agar tidak mengumpulkan hadiah setelah mati.
2. **Interaksi B dengan posisi tertinggal.** Interaksi menunggu request gerak yang sedang berjalan, lalu menyertakan gerak terbaru dan aksi dalam satu transaksi server. Server memvalidasi jalur/kecepatan/endpoint sebelum aksi. Tidak ada hadiah palsu yang diberikan hanya berdasarkan klien. Jika konfirmasi server tertunda, hasil pickup/interaksi tetap bisa terlambat terlihat.
3. **Data terlalu luas.** Respons HTTP sebelumnya membawa state lengkap semua pemain dan salinan sharedWorld Co-op. Kini respons hanya membawa simulasi pemain peminta beserta transform pemain lain dan metadata. Langganan RTDB juga dipisah menjadi metadata umum, state sendiri, map/quest roster dan kontribusi; tidak lagi berlangganan root yang berisi seluruh simulasi. Sequence di dalam save sendiri memastikan metadata dan state yang datang terpisah tidak diterapkan sebagai acknowledgement yang salah.
4. **Transparansi satu batch.** Sebelumnya satu hit ray mengubah opacity seluruh mesh, termasuk instanced walls dan chunk besar. Kini shader menggunakan posisi dunia setiap fragmen dan mask yang hanya berada pada segmen kamera-ke-karakter. Bagian di depan/melewati karakter dan bagian samping tidak ikut pudar meskipun berada dalam mesh yang sama. Alpha-hash menjaga depth write sehingga permukaan opaque di luar mask tetap memiliki depth yang benar. Kamera tidak diangkat otomatis. Efek dapat tampak seperti transparansi berbintik halus, bukan bidang besar yang seluruhnya transparan.
5. **Label diagnostik.** Tulisan berubah menjadi “Menunggu sinkronisasi server…” karena ambang 1,2 detik hanya menunjukkan respons belum kembali. Itu tidak membuktikan koneksi internet pemain lambat. Batas prediksi panjang/putus koneksi tetap berlaku.

## Pengukuran data
Pengukuran deterministik lokal pada room Laut awal, bukan capture jaringan produksi. Angka adalah byte JSON UTF-8 sebelum kompresi, bukan total kuota internet. Lihat docs/BANDWIDTH_COMPARISON.jsonl untuk seluruh fixture.

| Pemain | Seluruh room Race | Seluruh room Co-op | Respons per pemain baru |
|---|---:|---:|---:|
| 2 | 21.096 B | 31.281 B | 10.899 B |
| 4 | 41.821 B | 52.006 B | 11.266 B |
| 10 | 149.407 B | 164.144 B | sekitar 16.913 B |

Pada contoh 10 pemain, body HTTP berkurang sekitar 89–90%. Metadata, chat, RTDB, request, TLS/HTTP overhead dan kompresi berada di luar perbandingan body ini. Pemakaian nyata bergantung jumlah pemain, durasi, isi state dan transport. Model, gambar dan keseluruhan peta tidak dikirim ulang pada setiap gerakan. Latensi juga mencakup autentikasi, Function, RTDB transaction/retry dan jaringan; pengurangan payload bukan bukti semua masalah latency produksi selesai.

## Aturan item tetap berlaku
- Diamond/seal masih terkunci sampai penjaga wilayah dikalahkan.
- Bintang di tepian tinggi harus diraih pada ketinggian yang benar; tidak diberikan saat lewat di bawahnya.
- Tanaman tertentu dipanen dengan B. Rumput dekoratif/normal tidak semuanya merupakan item atau bekal.
- Stok dan reward tetap dikonfirmasi server; tidak mengarang pickup lokal untuk menyembunyikan respons yang terlambat.

## Verifikasi
152 tes dalam 25 file lulus, termasuk pickup lintasan, pencegahan pickup setelah respawn, sequence dan listener RTDB terpisah, interaksi movement+ability pada handler, projection data, shader mask depan/belakang dan regresi sebelumnya. TypeScript/build produksi serta bundle Netlify Function lulus. Delta diterapkan di atas source 41-file dan dibandingkan byte demi byte dengan source lengkap.

Batas: tidak ada deploy produksi, capture traffic/latensi Firebase nyata atau pengujian dua perangkat fisik. Browser QA lingkungan ini menonaktifkan WebGL; mask shader diuji matematis dan melalui hook material, tetapi tampilannya di GPU/perangkat Anda belum diverifikasi. Jangan menyebut pengujian simulasi sebagai bukti gameplay online produksi sudah mulus.
