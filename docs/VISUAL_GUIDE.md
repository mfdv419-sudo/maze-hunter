# Tambahan Terrain & Online

Volcano / Gunung Bara ditambahkan dengan identitas basalt gelap, celah pijar dan rintangan bara. Area yang sudah ditetapkan dipertahankan. Implementasi terbaru memakai dinding native tinggi untuk setiap biome, properti yang dapat dicapai dan dipanjat, serta rintangan bergerak bertanda. Baca UPDATE_INSTRUCTIONS.md untuk aturan aktual dan QA_CURRENT.md untuk batas verifikasi.

# Panduan Visual Maze Hunter
Tanggal: 26 Oktober 2026
Status: arah visual disetujui. Implementasi pertama: Ngarai. Area lain masih berupa panduan, belum penerapan model/medan baru. Detail implementasi aktual dan batas pengujian dicatat di CHANGELOG.md.

## 1. Ketetapan Retro di HP
Peta boleh diperbesar demi kenyamanan. Semua sel, lebar jalur, dinding, ikon karakter, dan ikon finish membesar dengan skala yang seragam; tidak diregangkan pada salah satu sumbu. Konsistensi berarti proporsi dan bahasa visual yang sama, bukan memaksa semua level memakai ukuran tampilan kecil yang sama.

Prioritaskan keterbacaan jalur, dinding tegas, dan ikon yang mudah dikenali. Peta kecil tidak perlu dipaksa memenuhi layar. Peta besar boleh memakai zoom/pan; jangan menampilkan seluruh peta dengan mengorbankan keterbacaan. Bila seluruh arena tidak muat, sediakan tampilan keseluruhan yang bisa dipanggil, tanpa panah solusi. Saat tracing, pan jangan mengambil alih gesture pemain atau mereset posisi; kebutuhan detail kontrol dibahas sebelum implementasi. Pembesaran tidak mengubah aturan waktu, nyawa, jumlah percabangan, panjang gagal 90%, dan pembagian peta.

## 2. Bahasa visual Adventure
Dunia 3D bergaya kartun dengan bentuk membulat, siluet kuat, material sederhana tetapi memiliki variasi permukaan yang terarah. Tekstur mendukung bentuk; tidak menggantikan geometri. Karakter binturong original tetap menjadi pusat perhatian.

Setiap area harus memiliki bentuk medan, kontur, material tanah, susunan ruang, horizon, vegetasi, suara, penjaga, dan boss yang sesuai. Referensi Super Bear Adventure digunakan untuk keterbacaan ruang, gerak, dan kenyamanan kamera; aset, karakter, serta komposisi dunia dibuat original.

Pertahankan UI navy, ivory, dan champagne yang sudah dipilih. Warna lingkungan mengikuti area masing-masing. Ikon, tombol A/B, tipografi, dan bahasa petunjuk tetap satu sistem. Efek serangan mudah dibaca dan tidak menutupi pemain.

Ukuran relatif berikut adalah titik awal desain untuk diuji:
- Jalur utama memungkinkan sekitar tiga karakter berpapasan atau menghindar. Lorong sempit menjadi variasi singkat dan disengaja.
- Dinding umum sekitar 3–5 kali tinggi karakter; tebing ngarai 8–12 kali di titik tertentu, dengan pengaturan jarak pandang dan kamera yang sesuai.
- Boss sekitar 2,5–4 kali tinggi karakter, dipilih sesuai arena dan keterbacaan kamera.
- Arena boss memiliki ruang menghindar, perlindungan, pintu masuk yang terbaca, serta detail khas lokasi.

Ketinggian bukan alasan membuat setiap jalur seperti kotak tertutup. Gunakan lengkung tebing, teras, akar, gua, jembatan, pantai, dan punggung bukit untuk membentuk labirin. Hindari dekorasi yang tampak bisa dipanjat tetapi tidak punya interaksi.

## 3. Identitas per area

### Forest — Rimba Kanopi
Bentuk: pohon besar dengan akar melebar, batang tumbang, bukit tanah, lorong vegetasi, cekungan sungai, rumah tua dan gua akar. Dinding berlapis batang/akar/semak, bukan balok hijau seragam.
Tanah: cokelat hangat, akar, daun jatuh, bercak lumut; rumput di tepi jalur.
Langit: celah kanopi, awan menggumpal, cahaya lembut menembus daun; bukan seluruh arena tertutup hijau.
Aktivitas khas: panjat akar, lompat batang dan sungai, masuk rumah tua, tebas semak yang punya bentuk daun berbeda.
Penjaga usulan: Trenggiling Duri, tubuh berlapis, berjalan lalu menggulung dan menggelinding.
Boss usulan: Raja Akar, tubuh kayu dan mahkota ranting, bergerak mengejar, menghentakkan akar dan membuka titik lemah setelah serangan besar.
Arena: pelataran akar pohon raksasa, ada jalur mengitari dan batang untuk perlindungan.

### Desert — Gurun Reruntuhan
Bentuk: bukit pasir bergelombang, dinding batu pasir terkikis, lengkung batu, reruntuhan bertingkat dan oasis. Bukan hutan berwarna kuning.
Tanah: pasir dengan riak halus dan bagian batu keras; lereng nyata yang tidak mengganggu kontrol.
Langit: horizon panjang, awan tipis jarang, cahaya hangat dan bayangan terarah.
Aktivitas khas: naik reruntuhan, turun lereng, melompat antarlantai batu.
Penjaga usulan: Kadal Pasir, bergerak menyamping cepat lalu melesat; persembunyian ditandai gundukan atau jejak sebelum muncul.
Boss usulan: Raja Bukit Pasir, kadal besar dengan perisai batu, menerjang setelah memberi tanda dan menciptakan gelombang pasir.
Arena: cekungan reruntuhan dengan pilar dan beberapa bidang tanah padat.

### Ngarai — Ngarai Batu Berlapis
Bentuk: tebing menjulang berlapis, dasar jurang sempit lalu melebar, jalur tepi tebing, gua, jembatan batu dan sungai di bawah. Perbedaan elevasi menjadi ciri utama.
Tanah: kerikil, bongkah pecahan batu, permukaan batu dengan strata; warna oker/terakota diselingi batu netral.
Langit: potongan langit di antara tebing, awan tinggi memanjang, horizon banyak tertutup batu; kedalaman dibantu kabut jarak yang halus.
Aktivitas khas: menyeberang jembatan, naik teras batu, menyusuri gua dangkal berair dan melihat sungai dari ketinggian.
Penjaga usulan: Ketam Tebing, cangkang bersudut dan capit besar; berjalan di teras, menutup tubuh saat bertahan.
Boss usulan: Raja Batu Retak, makhluk batu dengan inti amber; bergerak memutari arena, menerjang, memukul lantai dan memicu runtuhan yang ditandai.
Arena: cekungan luas yang terbuka ke langit dengan pilar batu dan jalan masuk dari gua.
Contoh pertama yang dianjurkan: satu segmen pendek lengkap dari pintu gua, jalur sungai, teras tebing, sampai arena boss. Ini menguji bahasa visual sebelum membuat seluruh peta.

### Mountain — Puncak Kabut
Bentuk: punggung gunung, batu bersudut, lereng bertingkat, lembah dalam dan jembatan gantung. Ngarai berfokus di dasar tebing; gunung berfokus perjalanan naik dan pandangan jauh.
Tanah: batu abu kebiruan, tanah dingin, lumut pendek, salju terbatas di puncak bila dipilih.
Langit: lapisan awan bergerak di bawah dan di atas beberapa jalur; siluet puncak jauh.
Aktivitas khas: mendaki, berpindah teras, berlindung dari hembusan angin yang diberi tanda.
Penjaga usulan: Kambing Batu, tanduk melingkar, gerak lompat pendek dan ancang-ancang seruduk.
Boss usulan: Raja Tanduk Badai, tubuh besar dengan tanduk bercahaya; seruduk dan petir berarea yang memiliki tanda sebelum menyambar.
Arena: dataran puncak luas, tidak hanya koridor dengan boss di ujung.

### Coast — Pantai Karang
Bentuk: garis pantai melengkung, pasir landai, tanjung, batu karang yang muncul saat air dangkal, gua pantai dan kebun kelapa.
Tanah: pasir kering lebih terang, pasir basah lebih gelap dan halus, tepian air jelas.
Langit: horizon laut terbuka, awan tropis besar, burung sebagai aksen ringan.
Aktivitas khas: jalan di pantai, berenang di teluk, panjat kelapa, masuk gua dan menyelam singkat mengambil peti.
Penjaga usulan: Kepiting Kelapa, cangkang membulat, capit dan langkah menyamping yang berbeda dari Ketam Tebing.
Boss usulan: Raja Karapas, kepiting besar yang bergerak di pantai dan air dangkal, menyapu capit dan mendorong gelombang.
Arena: teluk dengan pulau pasir dan karang untuk perlindungan.

### Sea — Laut Kepulauan
Bentuk: pulau timbul, karang bawah laut bertingkat, cekungan pasir, celah batu, lorong karang, gua air dan reruntuhan tenggelam. Dasar laut memiliki kedalaman yang nyata.
Tanah/dasar: pasir pucat bergelombang, batu berkarang, rumput laut dan koral berkelompok; jalur renang mudah dibaca.
Langit di permukaan: horizon samudra dan gugus awan; di bawah air digantikan tampilan permukaan dari bawah, cahaya air, jarak pandang kebiruan dan partikel ringan.
Aktivitas khas: berenang, menyelam, keluar ke pulau, menelusuri lorong karang dan membuka peti bawah air.
Penjaga usulan: Ikan Taring Karang, tubuh berbentuk torpedo, ekor dan sirip aktif; berenang serta berbelok mengikuti kedalaman.
Boss usulan: Raja Pari Karang, siluet sirip lebar, menyapu lintasan, menciptakan pusaran dan meluncur melewati arena.
Arena: cekungan karang luas dengan pilar, ruang vertikal untuk menghindar, dan titik aman di permukaan.
Kebutuhan khusus: penjaga, boss dan proyektil harus benar-benar memahami kedalaman. Kemampuan menyelam pemain saja belum cukup untuk menyatakan pertempuran laut selesai.

## 4. Solo yang sudah diterima
Pertahankan rute, progres dan pengalaman Solo yang disepakati. Jangan mengganti layout tersebut untuk menyamakan dengan biome baru. Tema tambahan tidak menjadi alasan menghapus konten yang telah diterima.

## 5. Boss dan penjaga: rekomendasi pembagian
Gunakan identitas berbeda per area. Penjaga dan boss dalam satu area punya hubungan bentuk, material dan efek, tetapi boss bukan sekadar penjaga yang dibesarkan.

Untuk scope awal: satu jenis penjaga utama dan satu boss khas per area. Varian tambahan menunggu contoh utama berhasil. Boleh memakai kerangka animasi dan sistem AI bersama untuk efisiensi, tetapi siluet, cara bergerak, pose ancang-ancang, senjata dan pola bertarung harus sesuai lingkungan.

Ketam Tebing dan Kepiting Kelapa dapat berbagi kerangka, tetapi bentuk cangkang, proporsi, langkah dan serangannya harus berbeda. Jika masih terasa seperti penggantian warna, pisahkan modelnya lebih jauh.

Musuh tidak berdiri diam menerima kue. Siklus minimal: patroli/waspada → mendekati → memberi tanda serangan → menyerang → pemulihan → bereaksi terkena hit. Idle memiliki napas, kedipan dan gerak bagian tubuh. Pergantian arah memiliki putaran tubuh yang halus.

Boss memiliki dua fase sebagai usulan awal: fase awal memperkenalkan pola, fase kedua menggabungkan pola dan perubahan posisi. Medium/Hard/Extreme menambah kombinasi, agresivitas dan tuntutan menghindar; bukan hanya menambah HP atau mengganti warna. Jumlah boss serta kapasitas pemain tetap mengikuti keputusan gameplay sebelumnya.

Sifat keluarga: serangan fantasi berupa buah berduri/berlendir, lumpur, akar, pasir, cipratan atau energi kartun; tanpa darah. Racun divisualkan sebagai buah berlendir dan efek status yang jelas, bukan detail realistis. Kue pemain meninggalkan krim pada target dan reaksi yang terlihat. Untuk laut, usulan bentuknya bola krim dengan pelindung gelembung agar tetap terbaca; ini perlu disepakati sebelum implementasi. Pastikan refill dan kesempatan serangan jarak dekat yang aman agar boss tidak menjadi buntu saat amunisi habis.

## 6. Validasi sebelum perluasan
- Tanpa nama area atau pewarnaan khas, siluet medan tetap cukup berbeda untuk dikenali.
- Bentuk tanah dan elevasi terbukti berbeda dari sudut setinggi karakter, bukan hanya dari tampilan atas.
- Langit berbeda melalui komposisi awan, horizon, visibilitas dan cahaya, tidak hanya warna latar.
- Penjaga dan boss bisa dibedakan dari siluet serta gerak, termasuk pada layar HP.
- Kamera bisa memperlihatkan ketinggian dan langit tanpa tabrakan dinding atau gerakan otomatis yang memusingkan. Pemain tetap mengatur sudut dengan tangan kanan.
- Detail visual tidak menghilangkan percabangan atau membuat rute benar mendapat petunjuk khusus.
- Jarak pandang boss tidak hilang mendadak ketika masih seharusnya terlihat.
- Anggaran model, tekstur, transparansi dan efek ditetapkan melalui contoh yang diuji di perangkat sasaran; belum ada klaim performa HP.

## 7. Urutan pengerjaan yang diusulkan
Matangkan contoh Ngarai → tinjau tampilan medan, langit, penjaga dan boss bersama → uji kontrol/kamera serta kinerja → baru terapkan panduan ke area lain. Jangan menjalankan perubahan seluruh biome hanya dari tabel warna.

