# Maze Hunter M8 — gerak layar, kamera manual dan identitas petualang

## Pemasangan setelah M7

Gunakan branch `maze-1` yang sudah menerima M7. ZIP M8 hanya berisi file baru atau
berubah dibanding M7, bukan seluruh proyek. Tidak perlu menghapus file lama.
Tidak ada commit, push, deployment, atau perubahan akun/Firebase secara otomatis.

1. **Perbarui Firestore Rules** dengan isi `firestore.rules` dalam paket melalui
   Firebase Console → Firestore Database → Rules → Publish. Dua field opsional
   ditambahkan pada profil yang sama: `appearance` dan `adventures`. Batas akses
   berdasarkan UID dan aturan entitlements tetap dipertahankan. Tidak membuat
   ulang project, database, collection, atau akun.
2. Upload file ZIP yang telah diekstrak ke branch `maze-1`, mengikuti struktur
   folder dan menimpa file yang namanya sama.
3. Jalankan build Netlify seperti sebelumnya. Tidak ada environment variable baru.
   Label home harus **25.10.26-M8**.

Rules disertakan sebagai source, belum dipublikasikan ke Firebase oleh paket ini.
Tanpa pembaruan rules, penyimpanan field kostum/progres Adventure baru dapat
tertolak; cache lokal tetap dipertahankan oleh mekanisme yang sudah ada.

## Gerak dan kamera

- Joystick menentukan arah **layar**, bukan setir kiri/kanan karakter. Kanan:
  karakter menghadap kanan layar dan maju ke sana. Bawah: karakter berbalik lalu
  maju ke arah bawah layar. Tidak memakai langkah mundur atau strafe kepiting.
- Basis gerak dihitung dari arah kamera yang benar-benar dirender pada setiap
  frame. Tidak menyimpan yaw awal sentuhan, dan tanda sumbu horizontal diperbaiki.
- Karakter berputar melalui sudut terpendek dengan interpolasi singkat. Arah
  bergerak dan berhenti langsung merespons input, tanpa momentum berat.
- Kamera mengikuti posisi, **tanpa menyelaraskan putaran dengan arah karakter**.
  Geser area kanan untuk orbit horizontal/vertikal; Q/E untuk orbit keyboard.
  Sudut default 38°, rentang manual 35°–45°. Opsi tinggi memulai sekitar 44°.
- Joystick kiri, kamera kanan dan tombol A/B menggunakan pointer terpisah.
  Gestur kamera tidak dimulai dari tombol A/B. Pengangkatan jari, pembatalan
  pointer dan kehilangan fokus membersihkan input.
- Dorongan besar joystick memakai lari 2,6 sel/detik; dorongan kecil berjalan
  analog. Langkah, ayunan tangan, badan condong, debu dan ekor mengikuti gerak.
- Simulasi memakai substep maksimum 25 ms, dengan catch-up dibatasi 200 ms untuk
  mengurangi tunneling atau perlambatan fisika ketika frame turun.
- Koreksi posisi online kecil dipertahankan melalui prediksi jika masih valid;
  respawn dan koreksi besar tetap mengikuti server. Ini bukan klaim bahwa
  latensi jaringan sudah selesai diuji.

Target respons di bawah 100 ms merupakan tujuan UX. Tes browser tidak membuktikan
latensi layar sentuh atau FPS HP fisik.

## Memegang dan menaiki tepian

Tepian batu berlumut dengan bibir/pegangan berada di beberapa area terbuka.
Pagar labirin tetap membatasi perjalanan; tidak semua tembok dapat dipanjat.

- Berjalan ke batu tertahan dan dapat menggeser di sisinya.
- Melompat sambil mengarah ke tepi/sudut menangkap pegangan.
- Saat bergantung, lepas joystick untuk bertahan; A atau arah menuju tepian
  menarik karakter ke atas. Arah menjauh melepaskan pegangan.
- Tarikan berlangsung sekitar 0,55 detik, dengan pose tangan/ kaki dan elevasi
  yang mengikuti progres. Menjauh dari permukaan atas membuat karakter turun
  dengan gravitasi, bukan teleport ke tanah.
- Penemuan tepian memberi 5 koin sekali untuk tepian itu pada sesi tersebut.
- Pose, elevasi dan status pegangan dimasukkan ke snapshot room. Validasi gerak
  server memeriksa tepian dan tidak menerima jalan lurus melewati badan batu.

## Transisi masuk–keluar

Pergantian layar memakai dua bidang labirin yang menutup, jejak bercahaya, lalu
membuka ke layar berikutnya. Snapshot layar sebelumnya menutup pergantian DOM.
Masuk ke game menunggu canvas siap, dengan batas tunggu agar UI tidak terkunci.

Binding halaman tetap sinkron sehingga popup login masih dibuka melalui klik
asli pengguna. Sentuhan/aksi game ditahan selama cover masuk. Memilih bagian
kostum di halaman yang sama tidak memutar transisi labirin berulang kali.
Modal dan scene memakai fade singkat; preferensi reduced motion melewati shutter.

## Wardrobe dan Home

Enam kategori: Kepala, Wajah, Badan, Punggung, Ekor dan Palet Warna. Terdapat
27 pilihan bagian/palet dengan Common, Rare, Epic, Legendary dan Mythic.

- Item dapat dipadukan. Kartu menampilkan avatar memakai item tersebut, bukan ikon
  baju generik. Kategori punggung/ekor menggunakan sudut pratinjau dari belakang.
- Karakter di ruang kostum dapat diputar dengan drag/swipe untuk memeriksa semua
  sisi. Home tetap menghadap pemain dan memakai kombinasi yang sama dengan game.
- Potret kartu dibuat dengan satu renderer sementara dan cache terbatas; tidak
  menjalankan satu scene WebGL aktif untuk setiap kartu.
- Pilihan lama classic/explorer/raincoat/space tetap dibaca dan dipetakan ke bagian.
  Tiga warna lama tetap gratis. Pilihan kostum baru disimpan pada profil masing-masing.
- Home mempunyai pedestal, gerakan idle, respons sentuhan dan aktivitas ambient.
- Koleksi/Misi menampilkan tiga tugas nyata: bintang pertama, menjelajahi tiga zona,
  dan kemenangan pertama. Status berasal dari progres profil, bukan angka demo.
- Koin dan hasil penjelajahan disimpan sebagai catatan terbaik per peta (maksimum
  30 peta). Penggabungan antarperangkat mengambil maksimum dan gabungan zona,
  sehingga replay/sinkronisasi tidak menggandakan koin secara otomatis.
- Bintang serta kemenangan membuka item. Koin yang ditampilkan adalah koin
  terkumpul dari catatan peta, bukan saldo checkout. Semua kelangkaan hanya kosmetik.
  Tidak ada klaim transaksi uang, subscription atau pembelian toko sudah aktif.

## Retro baru

Level 1–5 tetap papan pengenalan. Level 6–100 menggunakan katalog baru yang
lolos pemeriksaan struktur, bukan pencarian ribuan seed pada HP saat bermain.

- Rute solusi minimal 60% sel logis yang tersedia.
- Minimal 8 persimpangan bermakna pada rute benar, mulai level 6.
- Cabang terminal minimal 4 sel dan rata-rata minimal 4 sel.
- Minimal 3 komponen cabang mengecoh; ukuran proxy: setidaknya separuh sel cabang
  tidak lebih jauh dari tujuan daripada titik masuknya.
- Minimal 2 cabang salah mencapai posisi setidaknya 2 sel Manhattan lebih dekat
  ke tujuan. Ini **bukan** klaim dua cabang berakhir dalam radius dua sel dari exit.
- Start/finish di interior, maksimal 30% sel solusi berada di batas papan.
- Level 6–10 berukuran 13×13, 11–20 15×15, 21–30 17×17, lalu bertambah tiap wilayah
  hingga 31×31. Peningkatan ukuran menyediakan ruang untuk delapan keputusan dan
  cabang panjang; ukuran saja bukan ukuran kelulusan katalog.

Tujuan buah tidak ditampilkan di awal. Lintasan dan tujuannya muncul melalui
penjelajahan dengan garis pandang pendek. Penemuan bertahan ketika kehilangan
nyawa pada run yang sama. Melihat ujung buntu lalu mundur sebelum masuk sel
terminal diperbolehkan, sehingga eksplorasi tidak mewajibkan kehilangan nyawa.

Masuk sel jalan buntu tetap mengulang dari Start dan mengurangi satu nyawa.
Tembok/angkat jari tetap bebas hukuman. Retry run baru mengulang penemuan.
Papan memiliki tema batu, hutan atau akar, dengan canopy menutup wilayah yang
belum dijelajahi. Zoom/pan tetap tersedia. Graf Retro tetap satu solusi tanpa
loop penghubung; jalur menyambung kembali tetap ada di Adventure.

Metode pengukuran adalah proxy struktural, bukan bukti bahwa setiap manusia
pasti merasa tertipu. Generator pengembang disertakan di scripts; browser hanya
membaca katalog JSON yang sudah jadi.

## Navigasi Adventure

- Satu tujuan utama aktif: temukan segel → capai benteng → kalahkan Raja → lolos.
- Zona menampilkan nama, deskripsi singkat dan tingkat bahaya. Penemuan pertama
  zona memberi 3 koin sekali per sesi dan pemberitahuan area.
- Minimap north-up menampilkan area lokal 17 sel agar jalur terbaca pada HP.
  Panah menunjukkan posisi/arah karakter; landmark dan objek muncul setelah
  ditemukan. Benteng ditandai setelah segel lengkap; gerbang ditandai saat terbuka.
- Tombol + pada minimap membuka tampilan seluruh penemuan, × menutupnya. Solo
  berhenti sementara ketika peta diperbesar; pertandingan online tetap berjalan.
- Penanda di tepi minimap menunjuk tujuan aktif yang sudah diketahui tetapi di
  luar area lokal. Peta yang belum dijelajahi tetap tertutup.
- Gerbang menunjukkan syarat segel/Raja, jalan rahasia menyebut kunci yang
  dibutuhkan, segel memberi progres, tepian menjelaskan aksi panjat, dan simpang
  perebutan menunjukkan status penjaga sekitar.

## Batas verifikasi

Build produksi, bundel server room, pengujian logika dan browser lokal dilakukan
sebelum pengiriman. Browser memeriksa kontrol, multi-touch, pose panjat, inventory,
transisi, minimap, ukuran desktop/HP/tablet, login gagal dan cache offline.

Belum ada pengujian pada Android/iOS fisik, Safari, speaker HP, dua akun Firebase
live atau beban 10 perangkat. Rules belum diuji terhadap project produksi.
Multiplayer tetap beta dengan batas simulasi NPC bersama yang dijelaskan di M7;
M8 tidak mengklaim penyelesaian sistem NPC bersama atau pintu dinamis M7.
