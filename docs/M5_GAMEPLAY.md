# Maze Hunter M5 — Retro dan Adventure Solo

## Pemasangan

Gunakan setelah M4 pada branch maze-1. ZIP hanya memuat file baru/berubah dari
paket M4, bukan keseluruhan proyek. Pertahankan struktur folder, timpa file yang
sama. Tidak ada file yang harus dihapus. Sesudah Netlify build, versi home M5.
Tidak ada commit, push, publikasi rules atau deployment otomatis.
Tidak ada perubahan environment variables maupun rules Firebase.

## Retro Journey

- 100 level tetap tersedia. Generator kini mensyaratkan sedikitnya tiga
  persimpangan dan empat ujung koridor per kandidat, sehingga level awal tidak
  menjadi satu koridor tanpa pilihan.
- Tampilan memakai dinding tipis dan koridor berbasis sel. Pendeteksian tembok
  mengikuti garis batas sel yang digambar, bukan blok dinding lama yang lebar.
- Avatar binturong adalah Start dan penanda yang digerakkan. Tujuan berupa buah
  ara, dengan ilustrasi vektor langsung di canvas.
- Menyentuh tembok menghentikan lintasan tanpa penalti. Jari boleh diangkat.
- Memasuki sel jalan buntu selain Start/Finish mengurangi satu nyawa, menghapus
  jejak percobaan dan mengembalikan avatar ke Start. Satu gerakan tidak berulang
  mengurangi nyawa setelah reset. Waktu tetap berjalan. Tiga nyawa habis: kalah.
- Peta ditempatkan di bawah HUD; zoom/pan tetap tersedia untuk level padat.
- Skor Retro sebelumnya tetap tersimpan. Aturan/layout baru tidak menghapus
  progres pemain yang sudah ada.

## Adventure Solo yang dapat dimainkan

- Nama mode menjadi Adventure. Pilihan Solo menggunakan state permainan baru.
- Medium: 31×31, 12 menit, 3 penjaga, 1 Raja.
- Hard: 41×41, 18 menit, 5 penjaga, 2 Raja.
- Extreme: 51×51, 25 menit, 7 penjaga, 3 Raja.
- Inventaris 10 struktur deterministik per difficulty (30 total). Permainan baru
  memilih map yang berbeda dari map terakhir pada difficulty tersebut. Letak
  koleksi/patroli bervariasi berdasarkan seed pertandingan; bentuk map tetap
  sesuai indeks katalog. Retry memakai map dan seed yang sama.
- Validasi otomatis: jarak Start–Finish minimum 80/120/160 langkah grid untuk
  Medium/Hard/Extreme; semua segel, hadiah, sungai dan Raja dapat dicapai.
- Tiga segel DAN satu Raja dikalahkan wajib untuk membuka gerbang akhir.
  Melangkah ke Finish saja tidak lagi memenangkan permainan.
- Sembilan bintang tambahan dan tiga peti per run. Peti memulihkan satu nyawa
  dan mengisi kue. Segel menjadi checkpoint serta menambah persediaan kue.
- Penjaga berbentuk biji hutan berkaki akar, berbeda dari karakter pemain.
  Raja Rimbun memakai mahkota dan ukuran lebih besar. HUD menampilkan nyawa Raja
  saat berada dekat dan terlihat. Lingkaran target menandai persiapan serangan.
- B/J melempar kue; bila bersebelahan dengan pagar rumput bertanda hijau, B
  menebas pagar tersebut dan benar-benar membuka sel dinding menjadi jalan.
  Tebasan menarik penjaga sekitar menuju lokasi tersebut.
- Kue pemain memiliki amunisi dan cooldown, bertabrakan dengan tembok, serta
  dapat mengenai penjaga. Ada bantuan bidik pada musuh dekat yang terlihat.
- Penjaga: terkena pertama melambat, kedua terhenti sesaat, ketiga menyerah.
  Raja perlu delapan lemparan. Penjaga biasa pulih setelah tujuh detik tanpa hit;
  kemajuan damage Raja tetap tersimpan sepanjang run.
- Pemain: kue penjaga pertama memperlambat, kedua menghentikan sesaat, ketiga
  mengurangi nyawa dan kembali ke checkpoint. Ada jeda kebal setelah terkena.
- Tembakan Raja mengurangi satu nyawa langsung. Medium kembali ke checkpoint
  dengan penemuan peta tersimpan. Hard/Extreme kembali ke Start dan menghapus
  penemuan minimap pribadi. Segel, hadiah serta layout run tidak diacak ulang.
- Sungai adalah ubin air pada koridor; A/Spasi melompat melewatinya. Berjalan
  ke air mengurangi satu nyawa dan kembali ke checkpoint. Lompat tidak menembus
  dinding utama.
- Minimap: belum ditemukan gelap; ditemukan redup; area pandangan terang;
  ada panah pemain dan ikon koleksi/gerbang yang sudah ditemukan. Musuh hanya
  ditampilkan ketika berada dalam pandangan. Objek sungai/rumput/koleksi juga
  mengikuti penemuan dalam dunia 3D.
- Tujuan sampingan bintang/peti saat ini per pertandingan; belum menjadi
  inventaris hadiah kosmetik permanen atau sistem pembayaran.

## Gerakan, karakter, kontrol

- Percepatan/pengereman dan rotasi halus; pergerakan tetap menggunakan circle
  collision, substep dan wall sliding. Kamera mengikuti dengan interpolasi.
- Ekor diubah dari balok panjang menjadi 16 sambungan silinder kecil mengikuti
  kurva, gelombang berfase dan respons berbelok. Ini animasi prosedural ringan,
  bukan simulasi bulu/fisika berat.
- Kepala home/login dan preview kostum diangkat ke arah kamera.
- Gerbang emas baru memiliki pilar, lengkungan, ornamen dan cahaya portal.
- Pengaturan home: bulu arang/cokelat/perak, joystick tetap/mengikuti sentuhan,
  ukuran kontrol serta jarak joystick dari kiri/bawah. Preferensi disimpan
  lokal pada perangkat, belum disinkronkan sebagai pilihan antaranggota keluarga.
- Joystick tetap menjadi bawaan. Pada mode mengikuti sentuhan, pusat ditentukan
  saat sentuhan dimulai di zona kiri-bawah dan tidak bergeser selama jari ditahan.
  Multi-touch joystick + A/B didukung. Pointer cancel, blur dan resize melepas
  input agar karakter tidak berjalan sendiri.

## Batas tahap ini

Ini paket gameplay Solo untuk diuji, belum versi final/store release.
- Main Acak, ruang Adventure Race/Co-op 4/8/10 pemain, rejoin dan sinkronisasi
  penjaga/Raja/rumput belum dibuat pada protokol server yang baru.
- UI tidak menawarkan room legacy empat pemain sebagai Adventure baru. Source
  backend lama dipertahankan untuk tahap migrasi, tanpa perubahan deployment.
- Jumlah Raja bertambah menurut difficulty, tetapi arena bercabang akhir dan
  keseimbangan rute multiplayer belum selesai. Pola Raja saat ini tembakan
  terarah; Extreme menambah sebaran tiga arah.
- Semua 30 map lolos validasi konektivitas; pengujian rasa bermain/manual setiap
  map, penyeimbangan durasi, serta pengujian HP fisik masih diperlukan.
- Login Google asli, cloud save di proyek pengguna, iklan dan billing tidak
  dianggap terverifikasi oleh pengujian gameplay lokal.
- Local Control Lab hanya ada dalam development. Build produksi tetap meminta
  akun asli dan tidak memiliki login palsu/pemain online buatan.

## Validasi paket

TypeScript dan production build PASS. 40 unit tests dan 15 browser tests PASS.
Tes mencakup: konektivitas 100 Retro, katalog 30 Adventure, perjalanan state
mengumpulkan semua segel sampai Finish, prasyarat gerbang, penalti jalan buntu,
penalti sungai vs lompat, siklus kue, imunitas, reset Raja, tabrakan proyektil,
perubahan sel setelah menebas, joystick multi-touch, pause/rotate, menu, diagnosis
login dan reload offline. Pemeriksaan batas public-env juga PASS.
Screenshot browser dipakai untuk QA internal, tidak disertakan dalam ZIP.
