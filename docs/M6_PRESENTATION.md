# Maze Hunter M6 — bentuk dunia, kamera, rasa kontrol

## Pasang setelah M5

ZIP M6 hanya berisi file baru/berubah dibanding source M5. Upload pada branch
maze-1, pertahankan struktur folder dan timpa file yang sama. Tidak ada file
lama yang perlu dihapus. Sesudah Netlify build, home menampilkan 24.10.24-M6.
Tidak ada perubahan environment variables, rules Firebase, atau backend room.
Tidak ada commit/push/deployment otomatis.

## Retro mulai menantang dari level 6

- Level 1–5: papan pengenalan 5×5 sel.
- Level 6–10: 9×9 sel. Level 11–20: 11×11. Level 21–30: 15×15.
  Wilayah berikutnya bertambah hingga 29×29 pada kelompok terakhir.
- Generator menyaring berdasarkan panjang rute, persimpangan pada rute benar,
  jumlah jalan buntu, dan jumlah cabang salah dengan kedalaman minimal tiga sel.
  Level tidak lagi dinilai hanya dari ukuran dan beberapa persimpangan global.
- Aturan M5 tetap: tembok tidak mengurangi nyawa; memasuki jalan buntu reset ke
  Start dan mengurangi satu nyawa; jari boleh diangkat. Zoom/pan tetap tersedia
  untuk papan padat dan layar kecil.
- Layout level berubah; progres level sebelumnya tidak dihapus.

## Adventure: kamera belakang dan ruang menghindar

- Kamera perspektif mengikuti posisi dari belakang dan berangsur menyelaraskan
  arah berjalan. Arah input dikunci pada orientasi saat gerakan dimulai, agar
  kamera yang berputar tidak menyebabkan pemain berjalan berputar-putar.
- Geser area kanan layar untuk melihat sekitar; keyboard Q/E juga memutar kamera.
  Joystick kiri dan A/B tetap terpisah dari gesture kamera.
- Pengaturan menyediakan Follow from behind atau High view.
- Skala horizontal lingkungan 2,2 unit dunia per sel; bentuk karakter dipertahankan
  proporsional. Koridor memberi ruang lateral untuk menghindar/berpapasan.
- Radius tabrakan pemain dan kue disesuaikan dengan karakter, bukan hanya jalan
  yang dibuat terlihat lebar. Tes simulasi memverifikasi sidestep menghindari
  proyektil lurus di koridor.
- Kamera berpindah langsung saat respawn, tanpa terbang menembus seluruh map.
- Dinding tidak lagi diturunkan menjadi 30% tinggi ketika dekat kamera.

## Dunia dan karakter

- Jalur tanah, pagar tanaman, dan permukaan tanah memakai tekstur prosedural
  lokal berukuran kecil, tanpa download aset besar.
- Dasar tanah berkesinambungan, pagar dengan bagian dedaunan berbentuk, serta
  pohon berbatang dan berkanopi menggantikan balok polos sebagai visual utama.
- Sungai memakai geometri bertepi melengkung, batu tepi, permukaan mengilap dan
  riak bergerak. Bahaya air tetap mengikuti ubin sungai dalam logika permainan.
- Kabut jarak dan warna penemuan menjaga atmosfer; minimap tetap menyimpan area
  yang benar-benar ditemukan. Bentuk dinding jauh bisa terlihat sebagai lingkungan,
  sementara koleksi/musuh tersembunyi sampai ditemukan sesuai aturan sebelumnya.
- Ekor menjulur ke belakang badan dengan ujung melengkung, bukan kembali ke depan.
- Penjaga biji hutan mendapat helm daun, lengan akar, ekspresi dan pelontar kue;
  Raja Rimbun memiliki tubuh lebih besar, mahkota, permata dan jubah daun.
- Lemparan kue yang kena memunculkan percikan krim; lapisan krim menempel pada
  karakter untuk status hit pertama/kedua. Ada debu langkah dan percikan air.
- Home adalah panggung hutan dengan karakter besar menghadap pemain dan memakai
  kostum profil aktif. Identitas binturong dan pilihan warna tetap dipertahankan.

## Musik dan UI

- Musik latar instrumental sintetis orisinal dibuat dengan Web Audio, tanpa
  berkas lagu pihak ketiga. Tema mengikuti menu/Retro/Adventure.
- Musik dimulai setelah interaksi pengguna sesuai kebijakan browser, tidak
  memaksakan autoplay sebelum disentuh. Mute utama dan volume musik/efek terpisah.
- Efek langkah, lempar, lompat, percikan kue, air, tebasan dan hadiah ditambahkan.
- Root aplikasi dikunci ke viewport. Wardrobe menggunakan panggung karakter dan
  kisi kostum bergambar. Konten inventaris/dialog panjang boleh bergulir sendiri;
  halaman utama tidak bergulir sebagai dokumen web.
- Default joystick dinaikkan, dengan margin yang menyesuaikan tinggi layar.
  Preferensi lama yang masih memakai posisi bawaan 24 px diperbarui sekali.
  Penyesuaian ukuran/posisi, fixed/floating dan multi-touch tetap tersedia.
- Ikon piala di home setelah memilih profil membuka catatan keluarga: Retro per
  level berasal dari hasil profil keluarga; Adventure per difficulty/map menyimpan
  kemenangan nyata pada perangkat ini. Tidak ada angka atau peserta buatan.

## Batas yang perlu diketahui

- Peringkat global/online, room Race/Co-op Adventure 4/8/10 pemain, rejoin, dan
  penyimpanan inventaris Adventure ke cloud masih tahap berikutnya.
- Catatan Adventure perangkat tidak otomatis tersedia di perangkat lain.
- M6 memperbaiki presentasi prosedural dan kontrol; bukan klaim sudah setara
  kualitas aset/produksi Super Bear atau sudah mencapai 60 fps pada HP.
- Pengujian nyata Android/iOS, kualitas audio melalui speaker/headphone,
  keseimbangan manual seluruh level dan login/cloud di proyek pengguna belum
  digantikan oleh tes otomatis.
- Local Control Lab tetap hanya di development. Produksi meminta akun asli.

## Validasi

TypeScript dan production build PASS. 42 unit tests dan 19 browser tests PASS;
pemeriksaan ulang panel pada desktop, portrait dan landscape termasuk tombol
Solo Medium/Hard/Extreme yang sepenuhnya berada dalam viewport juga PASS.
Tes baru memverifikasi kepadatan naik mulai level 6, ukuran level 21, sidestep
menghindari kue, panel tanpa scroll dokumen, serta preferensi kamera/audio.
Pemeriksaan batas public-env PASS; tidak ada penambahan field environment publik.
Screenshot hanya digunakan untuk QA internal dan tidak disertakan dalam paket.
