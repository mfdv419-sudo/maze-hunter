# Online Smoothness & Living Biomes — 27 October 2026

Paket ini melanjutkan **Online Sync & Chat (delta 22 file)**, bukan ZIP awal.

## Cara memasang
1. Cadangkan source existing. Salin isi delta ke root repository, pertahankan struktur folder. Tidak ada penghapusan file tambahan.
2. Deploy frontend **dan Netlify Functions** dalam revisi yang sama. Jangan melakukan drag-and-drop folder dist saja: perubahan aturan movement, harga dan multiplayer berada di Functions juga.
3. Pertahankan proyek Firebase, environment variables, Auth, RTDB dan rules existing. Tidak perlu variabel atau rules baru; jangan menaruh service-account JSON ke browser.
4. Setelah deploy selesai, refresh kedua perangkat dan **buat room baru**. Hindari meneruskan room/run yang dibuat dengan layout atau harga lama.
5. Bila urutan delta sebelumnya belum pasti, gunakan source lengkap rilis ini sebagai source konsolidasi.

## Online
Penyebab jeda: antrean 24 sampel dan respons lebih dari 1,2 detik otomatis menghentikan prediksi. Kini jalur berurutan mempertahankan tikungan, menyederhanakan segmen lurus, menampung hingga 160 titik, dan mengirim batch maksimal 24 titik. Respons 1,8–3 detik tidak menghentikan gerak. Koneksi lambat diberi status tanpa langsung menjeda. Pada putus koneksi atau respons di atas 8 detik, prediksi tetap dibatasi; request gerak timeout 10 detik. Ini bukan janji tetap bisa bermain ketika koneksi terputus.

Packet yang kehilangan acknowledgement diulang dengan sequence sama (idempoten), tanpa membuang gerak baru. Server menerima waktu gerak legal hingga 10 detik sambil tetap memvalidasi setiap segmen terhadap tembok, kecepatan, checkpoint dan respawn. Clock offset menggunakan perkiraan tengah round trip. Kegagalan transport tidak langsung mengembalikan posisi ke snapshot lama.

## Kamera dan lingkungan
- Kamera mempertahankan sudut dan jarak yang dipilih pemain. Penghalang yang memotong garis pandang menjadi transparan sementara, lalu pulih. Collision fisik pemain terhadap dinding tetap berlaku.
- Siluet gunung tajam/bersalju, undakan sandstone gurun, tebing pantai tererosi, akar hutan, karang laut dan kolom basalt dibedakan melalui geometri dan relief, bukan tekstur saja.
- Dua air terjun ngarai dan dua lava terjun: kolam, partikel air/kabut atau bara, retakan pijar dan suara berdasarkan jarak. Kolam lava melukai pemain.
- Batu lingkungan turun dari ketinggian 12 unit, di atas dinding, dengan tanda, suara jatuh dan benturan; tidak melukai sebelum mendekati tanah.
- Tiga kapal besar sebagai area diamond, dengan dek dan ramp yang memakai aturan permukaan yang sama pada renderer, berenang, pickup dan server. Sepuluh slot memakai kapal yang sama; tiga puluh diamond pribadi ditempatkan di dek tanpa duplikasi.

## Penjaga dan kebangkitan
Kambing mengambil ancang-ancang lalu menyeruduk; trenggiling menggulung/menggelinding; kepiting pantai/ngarai menggunakan gelembung. Penjaga volcano menggunakan model kadal, bukan kepiting yang hanya diganti warna. Penjaga laut memakai bentuk bersirip di air dan bentuk kadal laut saat naik ke dek, dengan transisi ukuran; Raja pari dibatasi ke habitat air.

Semua seal memicu timeline kebangkitan enam detik: kamera mendekati Raja, patung retak dan melepas serpihan, Raja hidup, tiga pelindung datang menuju Raja. Cuplikan lokal dapat dilewati; durasi perlindungan dan penghentian gerakan tetap berasal dari server untuk semua pemain Co-op. Sudut pilihan pemain dipertahankan; akhir adegan memakai fade singkat untuk menghindari gerakan kamera melintasi seluruh peta. Race tetap memiliki seal dan Raja pribadi.

## Audio dan redeem
Efek sintesis asli untuk langkah, serangan, warning, jatuh, benturan, pickup, air terjun, lava dan kebangkitan. Volume musik dan efek terpisah. Tidak ada rekaman eksternal baru; lihat docs/AUDIO_SOURCES.md.

Barang bawaan tetap gratis. Redeem berbayar mulai 50 bintang: Common 50–60, Uncommon 75–100, Rare 125–150, Epic 250–275, Legendary 500–525. Harga memakai kelipatan 10 atau 25. Pembelian/legacy unlock lama dipertahankan dan receipt tetap memakai harga yang dibayar. Bintang Retro serta hasil terbaik Adventure kampanye membentuk saldo; mengulang peta tidak menggandakan bintang. Forest sample tidak memberi progres akun.

Chat teks dan pesan cepat dari rilis sebelumnya tetap tersedia; live voice belum diimplementasikan. Aturan refill cake tidak berubah dari rilis Online Sync & Chat.

## Verifikasi dan batasnya
145 tes dalam 23 file lulus, TypeScript + build produksi lulus, Netlify Function berhasil dibundle. Termasuk dua klien bergerak bersamaan di Race/Co-op dengan delay 1,8 dan 3 detik, retry acknowledgement, validasi tembok/kecepatan, satu terrain kapal untuk 10 slot, perlindungan Co-op dan riwayat pembayaran.

Browser lokal: model kapal, air terjun, lava dan kambing diperiksa melalui renderer CPU/SVG yang menggunakan geometri source asli; penghalang turun ke opacity 0,08 dan kembali ke 1,00 dengan posisi kamera tetap. Pratinjau ini bukan bukti visual penuh WebGL. Browser QA menonaktifkan WebGL; runtime 3D penuh, kualitas suara pada perangkat fisik dan koneksi Firebase produksi melalui dua perangkat belum diverifikasi. Tidak ada deploy produksi atau perubahan data Firebase yang dilakukan.
