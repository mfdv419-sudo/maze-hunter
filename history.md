# Maze Hunter — riwayat revisi

## 2 November 2026 — Reference Camera & Traversal Pilot

**Dasar pemasangan:** setelah Comfort Camera (9 file). Menggunakan video referensi pengguna sebagai arah perilaku, bukan menjanjikan hasil visual identik. Paket ini menerapkan kamera/gerakan dan pilot aktivitas; inventaris shortcut, efek sepatu, set kostum dan penggantian model besar tetap pending.

### Kamera dan gerakan

- FOV kini tetap 60° juga di `resize()`. Sebelumnya konstruktor 60° masih ditimpa 50°/57° oleh resize. Jarak horizontal target disatukan menjadi 7,2 world unit; tambahan zoom otomatis dekat boss dihapus. Framing bebas halangan stabil saat arah kamera berubah.
- Comfort/Dynamic mengikuti arah perjalanan secara bertahap saat bergerak. Rotasi dibatasi 0,8 radian/detik; Comfort mulai setelah 1,3 detik tanpa input kamera, Dynamic setelah 0,7 detik. Karena gerak berbasis layar dan acuan kamera ikut berubah, joystick diagonal yang ditahan menghasilkan lintasan melengkung. Manual tetap tidak auto-center. Saat diam kamera tidak mengitari karakter sendiri.
- Drag kanan tetap memegang pointer yang sama hingga dilepas. Saat jari sentuh mencapai tepi layar, kamera meneruskan putaran perlahan sehingga tidak perlu mengangkat dan menempel ulang untuk melihat lebih jauh. Joystick/A/B tetap terpisah. Edge pan tidak diterapkan ke mouse.
- Collision mencari sisi dengan radius hampir penuh terlebih dahulu. **Jarak tidak dijanjikan tetap mutlak di ruang tertutup**: bila tak ada ruang bebas, collision tetap boleh memperpendek jarak untuk menghindari tembus dinding. Pelebaran/desain ulang seluruh koridor belum dilakukan dalam pilot ini.
- Saat diam dan kamera di depan, kepala karakter dapat menatap kamera dalam batas putar leher. Tubuh tidak otomatis ikut berputar; arah dari belakang memakai idle kecil yang sudah ada.

### Latihan dan aktivitas ngarai

- Tombol **LATIHAN KONTROL** pada pemilihan Adventure membuka taman latihan terpisah 35×35: lapangan kamera, pohon panjat, batu pelontar, tepian tinggi dan tiga pijakan. Tanpa penjaga, bahaya berjadwal, batas waktu, kematian, reward akun, kemenangan tercatat atau kenaikan urutan peta. Latihan hanya SOLO lokal; akun/Firebase asli tetap dipertahankan untuk game utama.
- Batu bercincin emas memberi lompatan tinggi saat A/Space ditekan di atasnya: tinggi puncak 2,2 world unit dan durasi lebih panjang, bukan teleport ke atas. Salto kedua tetap dibatasi satu kali. Papan petunjuk dan cincin berdenyut menjelaskan fungsi pad.
- Server menentukan boost dari posisi pad yang sah. `jumpBoost` disiarkan bersama state jump pemain dan dipakai perhitungan tinggi lokal/remote/server, termasuk hit detection. Klien tidak mengirim pengali lompat bebas.
- Ngarai mendapat bay opsional batu pelontar → tepian tinggi 2,35 → pijakan turun 1,35 pada ruang kosong yang memenuhi clearance. Tidak memotong dinding atau mengganti rute maze. Pada 10 peta Medium seed 15025, 8 peta menyediakan bay; peta tanpa ruang aman mempertahankan tantangan semula. **Ini pilot, bukan redesain seluruh area atau jaminan bay di semua seed.**
- Lebar/depth tepian baru dicocokkan antara geometri dan collider; tepian ID 800+ tidak bisa diangkat seperti batu lepas. Reward peti diperiksa kembali agar tidak berada pada tepian baru.
- Jalur pijakan jurang yang sudah ada dipertahankan. Titik masuk bank yang aman dan entry bay dapat memperbarui checkpoint. Efek debu/cahaya singkat serta suara pijakan muncul saat meraih/mencapai tepian; tinggi efek mengikuti permukaan, bukan tertinggal di bawah tanah.
- Panjat masih memakai rig prosedural yang sudah ada; ini tidak menyatakan seluruh masalah anatomi, penetrasi model, atau gerakan memanjat lama sudah selesai. Pelebaran kapal–dinding dan pengembangan area lain tetap lanjutan setelah pilot.

### Validasi

- Suite utama: **260 tes / 43 file lulus**. Setelah tambahan tes terbaru, **14 tes terarah kamera/pilot lulus**, termasuk resize FOV, lintasan diagonal, edge pan, isolasi latihan, kurva spring jump, pemain meraih dan menyelesaikan panjat tinggi, serta keputusan boost oleh server.
- Build frontend dan server berhasil. Tombol Latihan dan alur menuju halaman permainan terverifikasi melalui browser preview.
- Percobaan menjalankan arena pada browser cloud berhenti pada **THREE.WebGLRenderer: Error creating WebGL context**. Karena itu belum ada klaim gameplay visual/FPS, native multi-touch revisi ini, Safari/iPad, perangkat fisik atau kenyamanan bermain lama lulus. Ini batas lingkungan uji yang sama dengan revisi kamera sebelumnya. Uji jaringan produksi dua perangkat juga belum dilakukan.

### Pemasangan dan pilot perangkat

1. Salin file delta ke source GitHub/branch Netlify yang telah memuat revisi sebelumnya, lalu deploy ulang.
2. Salin file yang sama ke folder proyek server di laptop.
3. **PowerShell 1:** Ctrl+C, jawab Y bila diminta, lalu jalankan `npm.cmd run build:realtime` dan `npm.cmd run start:realtime:local`.
4. **PowerShell 2 tetap berjalan**; tidak ada environment baru dan tidak perlu mengganti URL tunnel yang masih aktif.
5. Buka ulang game pada kedua perangkat; gunakan **room baru**. Mulai dari Adventure → Latihan Kontrol, coba putaran kamera/joystick, lalu pad emas → tepian tinggi. Sesudah itu uji ngarai. Jangan unggah service-account JSON atau file environment.

Tidak ada GitHub push atau publikasi Netlify langsung dari sesi ini.

## 2 November 2026 — Third-Person Comfort Camera

**Dasar:** dipasang setelah Controls & Agreed Character Actions (25 file). Revisi ini fokus pada kamera Adventure SOLO dan ONLINE. Retro, aturan serangan, peta dan server realtime tidak diubah.

### Perubahan

- Kamera awal memakai pitch 18°, vertical FOV 60°, jarak horizontal 6,4–6,8 world unit (sekitar 3–4 tinggi avatar), dengan fokus badan yang tidak mengikuti bob animasi. Pengaturan lama high-view tidak lagi membuka game pada sudut tinggi.
- Geseran sentuh mengikuti lebar/tinggi viewport: satu lebar layar menghasilkan rotasi 180° pada sensitivitas standar. Slider sensitivitas sentuh terpisah dari mouse. Pointer joystick, kamera dan A/B tetap terpisah; perbaikan koordinat `lookY` sebelumnya dipertahankan.
- Pitch dibatasi −12° sampai 50°. Input tidak valid diabaikan/dipulihkan. Q/E dan R/F mengikuti pembatasan yang sama. Gerakan karakter tetap relatif terhadap arah kamera pada bidang horizontal.
- Settings menyediakan Comfort (default), Dynamic dan Manual. Comfort menunggu 5 detik setelah input manual sebelum centering perlahan; Dynamic menunggu 2 detik dan lebih aktif. Manual tidak melakukan centering. Kamera tidak melakukan centering saat diam, drag, pause/cuplikan, atau input gerak menyamping. Tidak ditambahkan shake, blur atau head bob.
- Tombol kamera menjadi **Reset Camera**: meminta sudut standar di belakang arah hadap karakter melalui transisi, tidak memindahkan kamera seketika.
- Saat boom terlalu pendek, kamera mencari ruang orbit di sisi sekitar pada ketinggian yang sama sebelum mendekati tubuh. Collision tetap menguji dinding dan terrain, ditambah tapak solid properti panjat yang dipindah; objek yang sedang dipegang tidak menghalangi kamera. Pemulihan jarak yang dibatasi sebelumnya tetap dipakai. Ruang yang benar-benar tertutup tetap dapat memperpendek jarak; perubahan ini bukan pengganti pelebaran arena.
- Tracking vertikal tetap terpisah dari koordinat jari dan diratakan. Kamera mundur sedikit saat berada dekat arena boss aktif.
- Cuplikan boss memilih satu sisi dengan clearance terbaik dan mempertahankannya selama dolly, bukan mengorbit melintasi bukit. Collision diterapkan pada posisi cuplikan dan transisinya. Titik fokus boss laut diperbaiki agar tidak mengarah ke dasar laut. Skip, timeline online dan perlindungan cuplikan tetap dipertahankan.

### Validasi dan batasnya

Build frontend berhasil. Suite utama 254 tes lulus; setelah tambahan dua tes kontak properti dan reset, 16 tes terarah kamera/kontrol/comfort lulus. Ekspektasi sensitivitas pada tes native multi-touch lama diperbarui untuk rumus baru. UI Settings terverifikasi menampilkan mode dan sensitivitas melalui browser preview.

Pemeriksaan runtime lintas ukuran layar disediakan pada `tests/fixtures/comfort-camera.html` (jalankan melalui Vite, bukan build production). Percobaan menjalankannya pada browser cloud berhenti saat membuat renderer: **THREE.WebGLRenderer: Error creating WebGL context**. Karena itu tes gameplay visual, native multi-touch baru, FPS, Safari/iPad, perangkat HP/tablet fisik dan jaringan internet nyata **belum dinyatakan lulus** dalam revisi ini. Fixture ONLINE adalah klien presentasi lokal, bukan koneksi server produksi. Kenyamanan bermain lama tetap memerlukan pilot perangkat pengguna.

### Catatan pengalaman bermain berikutnya — belum diterapkan

- Perlebar ruang air–kapal dan jalur naik agar kapal tidak berhimpit dengan dinding; pastikan karakter dan pendaratan terbaca.
- Audit macet saat panjat tinggi/pohon, penetrasi badan terhadap permukaan solid, kontak tangan/kaki, langkah yang masih kecil dan kemudahan melompat di antara banyak batu. Ini membutuhkan revisi collision/animasi tersendiri, bukan dinyatakan selesai oleh kamera.
- Efek langkah sesuai material; kaki/jejak basah setelah keluar air. Efek sepatu premium mengikuti footfall: nada untuk sepatu tari, efek bola untuk sepatu olahraga, dengan volume/frekuensi yang nyaman.
- Efek singkat untuk salto kedua tanpa mengganggu pandangan.
- Kostum dalam satu set: menyelam (tas, sepatu, kacamata, baju), roket, olahraga, dan tema berikutnya. Detail manfaat dan harga belum dikunci.
- UI bagian atas menunggu rekomendasi pengguna. Inventaris gerakan penjaga/boss serta variasi gameplay tetap dua fokus lanjutan yang disepakati.

### Pemasangan

Salin isi folder `maze-hunter` di ZIP ke source GitHub yang sudah memuat revisi sebelumnya, lalu deploy ulang Netlify dan buka ulang game pada kedua perangkat. Revisi ini hanya frontend: **tidak perlu build/restart PowerShell 1, tidak perlu menghentikan PowerShell 2, dan tidak ada environment variable baru**. Jangan mengunggah kredensial atau file environment. Tidak ada publikasi/deploy langsung yang dilakukan dari sesi ini.

## 1 November 2026 — Controls & Agreed Character Actions

**Penerapan:** delta ini dipasang setelah **Avatar & Camera Comfort (6 file)**. Ini mencakup koreksi yang dilaporkan dan implementasi lanjutan gerakan karakter pemain; inventaris variasi permainan tetap tahap desain. Penilaian nyaman/tidaknya di perangkat fisik belum digantikan oleh hasil tes otomatis.

### Koreksi yang diterapkan

- **CAM-01 — layar putih/pandangan melonjak ke atas:** akar masalah yang ditemukan adalah variabel `lookY` dipakai untuk koordinat jari sekaligus tinggi titik pandang. Render menimpa koordinat jari dan drag berikutnya menghasilkan delta pitch besar. Tinggi follow kini memakai variabel sendiri. Area mulai drag juga disesuaikan terhadap tinggi layar, bukan batas 130 piksel tetap.
- **CAM-02 — joystick dan kamera bersamaan:** drag kamera dan joystick tetap memakai pointer masing-masing; pointer capture tidak saling mengambil alih. Perubahan kecil tinggi viewport/address bar tidak lagi mereset joystick. Tes multi-touch Chromium memakai input sentuh native dengan render di sela gerakan dan pelepasan jari joystick saat jari kamera tetap aktif.
- **ARENA-01 — peti di jurang:** pembentukan ngarai kini memeriksa akses melalui sel dan segmen gerak yang aman dari zona jatuh/jurang. Peti yang tidak aman dipindah ke lokasi yang bisa dicapai tanpa jatuh, di luar tapak properti panjat dan reward lain. Indeks reward tetap sehingga data koleksi lama tidak diacak. Pemeriksaan mencakup 40 kombinasi peta/difficulty dengan seed uji, selain suite peta yang sudah ada.
- **UI-01 — popup:** dialog singkat, termasuk hasil menang/kalah dan Pause, memakai grid tombol sejajar dan ukuran yang mengikuti viewport. Pengaturan, buku panduan, bantuan, dan jurnal panjang memakai halaman sebelumnya/berikutnya sehingga tombol aksi tetap terlihat. Pagination menyesuaikan saat ukuran layar berubah. Perbaikan ditujukan pada isi dan layout, bukan hanya menyembunyikan scrollbar.
- **PHYS-01 — sebaran batu:** batu mempertahankan titik benturan dan titik istirahat terpisah. Bila tersedia ruang aman, jatuhan berikutnya memilih lokasi kosong di sekitar benturan, disertai rebound/roll singkat menuju posisi tersimpan. Ruang di sekitar reward dan jalur solusi dilindungi. Tumpukan masih boleh terjadi bila ruang aman habis; pemain tetap bisa menyusun sendiri. Batas 72 batu per arena tetap berlaku untuk performa.

### Gerakan karakter dan penunjangnya

- Cake memiliki ancang-ancang singkat, ayunan, pelepasan, dan pemulihan; cake yang dipegang mengikuti grip tangan dan disembunyikan setelah pelepasan. Cake super memakai pose sama dengan icing berwarna sesuai pilihan.
- Granat dan lemparan benda berat memakai timing/pose yang berbeda. Auto-aim cake dibatasi ke kerucut depan sehingga tidak menembak musuh di belakang sambil tubuh tetap menghadap depan.
- Cabe/semangka/bayam terlihat di tangan selama gerak makan. Efek cabe dan biji baru mulai setelah gerak makan awal; rentetan tetap berwaktu. Projectiles mengikuti asal tangan atau mulut sebelum dilepas. Damage yang diterima dapat membatalkan serangan yang belum dilepas.
- Tongkat disimpan selama aksi tangan lain, memanjat, dan membawa benda. Aksi serangan/makan tidak dapat dilakukan saat menggantung atau menarik badan naik.
- Gerak angkat/taruh memakai tekukan lutut, perubahan tumpuan dan dua tangan. Properti yang dibawa diposisikan terhadap pusat geometri; pohon diputar untuk dibawa mendatar. Gerak pelepasan benda ditampilkan menuju posisi akhirnya. Saat membawa objek, kecepatan turun; tombol B menampilkan Lempar dan melempar objek yang sedang dibawa.
- Memanjat pohon menangkap pada jarak yang sesuai batang, bukan tepi blok batu. Tarikan tubuh berhenti dekat tinggi pegangan sebelum perpindahan terakhir ke atas. Naik bangunan/batu menahan posisi di tepi lebih lama sebelum lutut dan badan melewati tepian.
- Langkah/berhenti, salto depan dan pendaratan mempertahankan perbaikan sebelumnya. Reaksi terkena serangan, kalah dan pickup diperjelas. Gimmick diam hanya muncul saat aman dan berhenti saat bergerak/beraksi. Kamera tidak ikut gerakan badan/napas.
- Suara langkah dipicu dari siklus kaki; suara lempar dijadwalkan pada waktu pelepasan.
- State aksi bertanda waktu dan progress memanjat diteruskan kepada pemain lain. Avatar lokal dan remote memakai dasar pose yang sama; state pribadi pemain lain tetap tidak dikirim ke browser.

### Validasi

249 tes unit lulus, termasuk akses peti ngarai, arah dan timing serangan, pembatalan sebelum pelepasan, sebaran/serialisasi batu, jarak tangkap pohon dan publikasi pose Co-op. Enam tes browser lulus: native dua jari, popup/pagination, pole lokal/remote, gerak/kamera serta cuplikan boss. Geometri pose diperiksa dengan render WebGL tanpa runtime error. Build frontend dan server lulus.

Audit jalan statis menonaktifkan jatuhan berjadwal; collision, persistensi dan clearance batu diuji terpisah. Tes browser bukan uji Safari/iPad fisik atau pengukuran FPS/latensi jaringan pengguna.

Animasi dan rebound tetap prosedural, bukan motion capture atau simulasi rigid-body penuh. Kontak jari dan penyesuaian telapak terhadap setiap permukaan belum merupakan IK seluruh tubuh. Penempatan properti tetap divalidasi server; transisi lempar properti adalah presentasi dari hasil penempatan tersebut. Perilaku mencari/kembali patroli baru serta variasi aktivitas area yang masih rancangan tidak ditambahkan diam-diam.

### Pemasangan

1. Salin isi folder `maze-hunter` dalam delta ke branch GitHub yang dipakai Netlify; jalankan deploy ulang.
2. Salin file yang sama ke proyek server di laptop.
3. Di **PowerShell 1 (server)**: hentikan dengan Ctrl+C, jawab Y jika diminta, kemudian:

```powershell
npm.cmd run build:realtime
npm.cmd run start:realtime:local
```

4. Biarkan **PowerShell 2 (tunnel Cloudflare)** tetap berjalan. Tidak ada environment variable baru dan tidak perlu mengganti alamat tunnel jika jendela tunnel tidak direstart.
5. Buka ulang game di kedua perangkat setelah deploy dan uji **room baru**, agar client/server memakai versi yang sama. Jangan unggah service-account JSON atau file environment ke GitHub.

## 1 November 2026 — Kesepakatan desain gerakan dan inventaris permainan

### Status dan batas pekerjaan

Tahap sekarang adalah mencatat, menginventarisasi dan menyepakati desain; belum menerapkan revisi kode baru. Catatan ini tidak menyatakan bug di bawah sudah diperbaiki. Dua fokus tetap: (1) gerakan dan kamera beserta penunjangnya; (2) variasi pengalaman bermain beserta lingkungan, tantangan, musuh dan hadiah. Ide di luar kedua fokus dicatat sebagai backlog, tidak langsung diterapkan. Setelah kesepakatan desain, satu arena menjadi pilot sebelum penerapan bertahap.

Gambar hanya digunakan seperlunya untuk memperjelas gerakan. Satu strip 4–6 pose dapat mewakili satu aksi. Gambar konsep tidak mengunci model/kualitas render game dan bukan rekaman gameplay.

### Fokus 1 — Inventaris gerakan yang disepakati

Pose berjalan Binturong dan ancang-ancang/serudukan kambing pada lembar acuan telah disetujui pengguna.

| Bagian | Acuan gerakan |
|---|---|
| Diam | Napas ringan, kedip sesekali, kaki menapak; tidak bergoyang berlebihan. |
| Berjalan | Menapak → menumpu → mengangkat kaki → langkah berikut; kaki bergantian, lutut terbaca, tangan berlawanan dengan kaki, ekor mengikuti tubuh. |
| Mulai/berhenti | Langkah awal dan langkah penutup terlihat; tidak meluncur. |
| Berbelok | Tumpuan kaki dan berat badan mengikuti arah baru; tidak berputar kaku seperti patung. |
| Lompat pertama | Tekuk lutut → dorong tubuh → bersiap mendarat. |
| Lompat kedua | Salto ke depan; tubuh menekuk dan kembali berorientasi kaki ke tanah sebelum mendarat. |
| Mendarat | Telapak menyentuh tanah, lutut menyerap benturan, lalu kembali siap. |
| Pohon | Tangan meraih bergantian, kaki mencengkeram/mendorong; kenaikan tubuh mengikuti tarikan, bukan eskalator. |
| Bangunan/batu | Tangkap tepian → menggantung → menarik badan → menaikkan lutut → berdiri. |
| Berenang | Tangan mendayung, kaki mendorong, ekor tetap tersambung dan mengikuti badan. |
| Benda/perlengkapan | Tangan benar-benar memegang; tidak menembus badan; disimpan bila kedua tangan diperlukan. |
| Terkena serangan/kalah | Reaksi mengikuti benturan; kehilangan keseimbangan tanpa menjadi gepeng. |

### Melempar, item dan gimmick — disetujui sebagai acuan diskusi

Semua aksi memiliki persiapan → pelepasan/efek → gerak lanjutan → kembali siap. Arah serangan mengikuti arah hadap karakter. Cake dapat dilempar sambil bergerak; kaki tetap melangkah sementara tubuh atas melakukan lemparan. Aksi berulang diringkas agar tetap responsif, tanpa mengulang ancang-ancang panjang setiap tembakan. Tongkat disimpan/dipindah bila tangan yang sama dibutuhkan. Saat memanjat, senjata disimpan. Sebelum pelepasan, benturan dapat memutus aksi; setelah dilepas, proyektil tetap melaju.

| Aksi | Acuan |
|---|---|
| Cake biasa/super | Tangan menarik ke belakang, badan sedikit memutar, tangan mengayun, cake lepas dari tangan, gerak lanjutan. Dasar animasi sama; warna, jejak dan cipratan membedakan efeknya. |
| Granat cake–cabe | Ancang-ancang lebih besar dan lemparan melambung; ledakan api saat benturan. |
| Cabe | Angkat ke mulut → gigit → tarik napas singkat → condong dan semburkan; api dari mulut melebar ke depan. |
| Semangka | Gigit → pipi menggembung → semburkan rentetan biji → menghela napas; kepala bergerak kecil, kamera tidak berguncang. |
| Spinach | Makan → menegakkan badan → mengepalkan tangan; tanda kekuatan terlihat tanpa menutupi karakter. |
| Angkat batu/batang | Raih → tekuk lutut → angkat dengan seluruh tubuh → tahan beban; tangan menyentuh benda. |
| Lempar benda berat | Dua tangan, tumpuan kuat, dorongan kaki dan tubuh, pelepasan, pemulihan keseimbangan; berbeda dari cake ringan. |

Kepribadian Binturong: penasaran, cekatan dan sedikit jahil. Gimmick: mengendus/menoleh/merapikan syal saat aman; senyum singkat saat pickup; gerak senang saat seal; tangan melebar dan ekor membantu saat hampir jatuh; reaksi benturan; selebrasi kemenangan singkat. Gimmick tidak terlalu sering, berhenti saat ada input dan tidak mengunci kontrol dalam bahaya. Penjaga mengamati lingkungan dengan telinga/capit/gerakan khas; boss menunjukkan tatapan, tumpuan dan napas/armor yang lebih berat.

### Penjaga, boss dan penunjang

Penjaga: patroli → menyadari pemain → ancang-ancang → serangan utama → pemulihan. Perilaku mencari/kembali berpatroli setelah kehilangan pemain masih berupa rancangan yang perlu dirinci pada inventaris permainan.

- Kambing: empat kaki; kepala turun, kaki menekuk, menyeruduk lurus, lalu mengerem. Setelah serudukan dilepas, tidak terus membelok mengejar pemain.
- Trenggiling: berhenti → menggulung → menggelinding → melambat → membuka badan.
- Kepiting: langkah menyamping, capit terangkat sebelum gelembung keluar.
- Kadal/amfibi: badan rendah, kaki mendorong bergantian, ekor menyeimbangkan; pose darat dan berenang berbeda.
- Penjaga tumbuhan: akar/kaki menopang; badan/cabang mengikuti serangan.
- Semua ancang-ancang memberi waktu menghindar; damage tidak mendahului serangan yang terlihat.

Boss: patung tertidur → retak dan serpihan lepas → kepala/anggota tubuh mulai hidup → menegakkan badan dan melihat pemain → ancang-ancang serangan → serangan dan pemulihan → perubahan fase yang terbaca → kehilangan tenaga/keseimbangan saat kalah. Gerak mengikuti anatomi masing-masing boss.

Penunjang: kontak tangan/kaki, suara tepat saat menapak/melepas/benturan, efek singkat dan terbaca, kamera tidak bergetar mengikuti animasi, aksi/perlengkapan konsisten antarperangkat. Kamera tidak berputar otomatis saat berjalan/berbelok, tidak memaksa pitch naik dekat tembok, dan cuplikan boss mengembalikan kontrol dengan halus.

Urutan prioritas gerak: berjalan–berhenti–berbelok dan kamera → lompat–mendarat → memanjat → interaksi benda → penjaga → boss. Gambar berikut yang masih direncanakan: lempar cake dan angkat batu; belum dibuat.

### Fokus 2 — Variasi permainan (rancangan, belum dikunci rinci)

Irama permainan berganti antara eksplorasi, tantangan gerak, pertarungan, penemuan/hadiah dan kesempatan istirahat. Bukan sekadar belokan, perubahan tekstur dan musuh dengan pola sama.

| Area | Calon aktivitas khas |
|---|---|
| Hutan | Memanjat mencari jalur, memindahkan batang, melewati akar. |
| Ngarai | Jembatan sempit, tepian tebing, jalur belakang air terjun. |
| Gunung | Menghindari batu, mencari perlindungan, menyusun pijakan. |
| Gurun | Membaca angin, menghindari tanaman bergulung, menjelajah reruntuhan. |
| Pantai | Memanfaatkan surut, membaca ombak, menjelajah bangkai kendaraan. |
| Laut | Berenang/menyelam, menghindari sampah, naik kapal menuju diamond. |
| Gunung lava | Batu pijakan, semburan lava dan waktu menyeberang. |

Selanjutnya setiap unsur diberi status: sudah ada, bermasalah, perlu ditingkatkan, atau fitur baru; lalu ditentukan prioritas dan arena pilotnya. Tabel area ini adalah usulan awal, bukan klaim implementasi selesai.

### Laporan baru pengguna — belum diperbaiki/penyebab belum diverifikasi

| ID | Laporan | Kriteria perbaikan |
|---|---|---|
| CAM-01 | Di HP/tablet, menggeser view kadang membuat layar putih lalu sudut menjadi dari atas. Menggeser kembali tidak berhasil mengembalikan sudut belakang. Laptop dilaporkan aman. | Uji perangkat sentuh; drag tidak memutihkan layar, tidak mengubah pitch tanpa kendali, sudut tetap dapat dikembalikan. Penyebab belum boleh diasumsikan. |
| CAM-02 | Ketika maju dengan joystick, drag kamera kadang tidak merespons/terputus; pemain harus mengangkat dan menyentuh lagi. Ketidaksesuaian respons ini dirasakan membuat pusing. | Joystick kiri dan kamera kanan bekerja bersamaan secara independen; satu drag berlangsung kontinu sampai jari itu dilepas; pergantian/pelepasan jari joystick tidak mengambil alih atau membatalkan kamera. Uji multi-touch nyata. |
| ARENA-01 | Peti ditemukan di bawah jurang ngarai; jatuh ke sana menyebabkan mati sehingga jalur ambil tidak jelas. | Peti berada di permukaan yang bisa dicapai, dibuka dan ditinggalkan dengan selamat; bila di teras bawah harus ada rute aman dan jalan kembali. Jangan meletakkan reward di volume kematian. |
| UI-01 | Popup hasil kalah masih memiliki scrollbar horizontal dan tombol tidak sejajar. Screenshot: No lives left, 70 seconds. Beberapa popup lain juga masih scroll. | Audit seluruh dialog singkat, bukan hanya Pause. Ukuran panel/tombol/spacing menyesuaikan layar; sisi tombol sejajar; isi dan aksi terlihat tanpa overflow. Perbaiki layout, bukan hanya menyembunyikan scrollbar hingga konten terpotong. Pengguna tidak pernah meminta scrollbar tersebut; justru meminta panel muat satu layar. |
| PHYS-01 | Batu jatuh terlihat bertumpuk pada satu tempat, bukan berserakan. Pengguna sebelumnya mengizinkan tumpukan, bukan meminta semua batu otomatis membentuk menara. | Arah rancangan: jatuhan menghantam permukaan, memantul/menggelinding secukupnya, menyebar ke posisi aman lalu menetap sebagai properti. Tumpukan kecil boleh terjadi karena tumbukan; susunan sengaja dapat dibuat pemain. Sebaran tidak menutup akses utama, peti, seal atau gate. Detail batas fisika ditentukan saat merinci desain. |

Prioritas sekarang: CAM-01/CAM-02 terlebih dahulu karena kenyamanan dan kendali; kemudian audit akses reward dan popup; perilaku sebaran batu masuk rancangan fisika arena. Semua masih berada dalam dua fokus kerja dan penunjangnya, bukan pembukaan proyek baru.

## 1 November 2026 — Avatar Sync & Camera Comfort

Delta ini dipasang **setelah Gameplay & Animation Polish (20 file)**.

- Aturan trekking pole disatukan untuk avatar lokal dan pemain lain. Avatar pemain lain sebelumnya tidak menerima flag pole sama sekali. Pole kini terlihat pada kedua sisi dalam kondisi berjalan/diam di tanah dan tersimpan saat melompat, berenang, memanjat, membawa objek atau sedang menyerang.
- Kecepatan animasi pemain lain dihitung dari perpindahan horizontal yang benar-benar ditampilkan per frame, lalu diratakan. Tidak lagi memakai jarak ke paket posisi terakhir sebagai ukuran kekuatan langkah.
- Langkah dibuat lebih lebar dengan ayunan kaki bergantian, tekukan lutut dan angkatan kaki yang lebih jelas. Irama langkah diturunkan dan gerak naik-turun badan diperkecil.
- Kamera mempertahankan yaw manual. Tracking vertikal diratakan; kamera dan fokus menggunakan laju follow yang sama. Saat dinding memaksa jarak kamera mendekat, pemulihan jarak menunggu sejenak lalu dibatasi kecepatannya untuk mengurangi gerak maju-mundur berulang. Tumbukan tetap dijaga; sudut tidak dipaksa naik.

**Pemasangan:** salin perubahan ke GitHub/branch Netlify lalu deploy ulang. Buka ulang game di semua perangkat supaya tidak mencampur versi frontend. Tidak ada perubahan environment atau server Node, sehingga server dan tunnel yang sudah berjalan tidak perlu direstart untuk delta ini.

**Validasi:** 243 tes unit, 2 tes browser baru dan build frontend lulus. Tes browser memeriksa pole avatar lokal dan remote, penyimpanan pole saat memanjat/menyerang, perubahan kecepatan langkah remote, serta kamera yang tidak berputar otomatis saat berjalan dan stabil setelah berhenti. Tes merupakan fixture runtime lokal; belum merupakan tes online dua perangkat fisik atau pengukuran FPS/kenyamanan bermain lama. Animasi tetap menggunakan rig prosedural.

## 1 November 2026 — Gameplay & Animation Polish

Paket delta ini dipasang setelah **Motion Corrections (12 file, 30 Oktober)**. Salin isi folder `maze-hunter` di ZIP ke proyek yang sudah memuat revisi sebelumnya. Paket hanya berisi file yang berubah; bukan source lengkap.

### Yang diperbaiki

- **Dialog jeda:** semua tombol memakai lebar, sisi kiri/kanan, jarak, dan ukuran teks yang konsisten. Panel lebih ringkas dan muat tanpa scrollbar pada ukuran layar yang diuji, termasuk landscape ponsel. Override dibatasi pada dialog jeda agar daftar panjang seperti koleksi dan peringkat tetap dapat diakses.
- **Retro:** waktu setiap level berkurang tepat 20 detik. Level 1–20: 60 → 40 detik; 21–40: 90 → 70 detik; 41–80: 120 → 100 detik; 81–100: 150 → 130 detik.
- **Adventure Easy:** seluruh penjaga biasa, termasuk penjaga seal besar/kecil dan elite, memiliki 2 HP. Dua cake klasik mengalahkan mereka. Cake merah tetap lebih kuat. HP boss tidak diubah. Save lama membatasi HP penjaga Easy yang masih hidup ke maksimum 2.
- **Kebangkitan boss:** kamera memiliki lintasan orbit dan dolly yang nyata, kemudian berpindah kembali menuju sudut pemain di bagian akhir cuplikan. Model boss mengangkat kepala dan meregangkan anggota tubuh saat bangkit. Timeline server, perlindungan pemain dan tombol lewati dipertahankan.
- **Ekor Binturong:** winding segitiga diperbaiki, rangka penampang dijaga kontinu saat melengkung, dan bentuk saat berenang diputar dari pangkal agar tidak terlipat atau mengarah ke depan. Ini perbaikan geometri, bukan menyembunyikan celah dengan transparansi.
- **Trekking pole:** pegangan dipasang pada tangan; sudut shaft dikompensasi terhadap bahu dan siku supaya hampir tegak dengan ujung sedikit ke belakang, bukan menyapu jauh di depan. Ada wrist strap. Pole disimpan saat memanjat dan saat berdiri di atas objek.
- **Memanjat:** tangan memakai perhitungan dua ruas agar panjang lengan tetap, perpindahan pose lebih lembut, dan tarikan naik bangunan/batu diperpanjang menjadi 0,9 detik. Pohon tetap menggunakan tiga tahap tarikan dalam 2,1 detik. Animasi masih memakai rig prosedural; belum memakai animasi rekaman atau kontak jari lengkap.
- **Batu jatuh:** tumbukan diteruskan ke batu persisten pada posisi akhir yang sama. Ada pantulan vertikal yang mereda selama 0,9 detik. Ketinggian tumpukan dan waktu tumbukan disimpan. Tumpukan menangkap batu berikutnya lebih awal. Kontak memperhitungkan permukaan tanah di seluruh tapak batu, permukaan arena boss, serta tepian/objek panjat. Batu tetap bisa diangkat dengan efek spinach dan diletakkan seperti sebelumnya. Batas performa 72 batu persisten per arena dipertahankan; sesudah penuh, jatuhan baru dihentikan.

### Cara memasang

1. Salin file yang berubah ke branch GitHub yang digunakan Netlify; jalankan deploy/build ulang.
2. Salin perubahan yang sama ke folder server di laptop.
3. **PowerShell 1 (server):** hentikan server dengan Ctrl+C, jawab Y bila diminta. Dari folder proyek jalankan:

```powershell
npm.cmd run build:realtime
npm.cmd run start:realtime:local
```

4. Biarkan **PowerShell 2 (tunnel)** tetap berjalan. Tidak ada environment variable baru. Jika tunnel dinyalakan ulang dan alamat berubah, ikuti pembaruan `VITE_REALTIME_URL` seperti sebelumnya.
5. Buka ulang game setelah deploy dan uji **room baru** agar frontend dan server memakai aturan yang sama. Jangan mengunggah `.env.realtime` atau service-account JSON ke GitHub.

### Rekomendasi peningkatan desain berikutnya

Bagian ini adalah arah desain, belum merupakan penggantian model dalam paket ini.

- **Binturong:** pertahankan telinga berjumbai, moncong, kumis dan ekor panjang; perhalus sambungan bahu/pinggul dan proporsi telapak. Gunakan fur shading ringan, ekspresi mata/alis, idle bernapas dan penyesuaian telapak ke tanah. Kostum sebaiknya mengikuti gerak tubuh dengan detail kain, strap dan aksesori yang jelas.
- **Penjaga:** bedakan siluet dan cara bergerak per habitat, bukan sekadar warna. Kambing memakai langkah kuku dan ancang-ancang; trenggiling menekuk badan sebelum menggulung; kepiting bergerak menyamping dengan capit dan gelembung. Gerakan pembuka harus tetap mudah dibaca pemain.
- **Boss:** gunakan siluet khas yang lebih besar dan mudah dikenali, material/armor yang konsisten dengan area, ekspresi mata, reaksi kena serang, serta perubahan pose per fase. Adegan retak sebaiknya dilengkapi gerak berat badan dan serpihan yang mengikuti materialnya.

### Validasi dan batas pengujian

Suite unit mencakup arah permukaan ekor pada beberapa pose, arah pole, panjang ruas lengan, dua hit Easy, waktu Retro, lintasan kamera, pantulan dan serialisasi tumpukan batu. Tes browser memakai UI jeda asli pada tiga ukuran layar dan memeriksa perubahan kamera serta posisi batu pada runtime game. Hasil validasi: 238 tes unit dan 2 tes browser lulus; build frontend dan server juga lulus.

Pengujian ini bukan pengukuran FPS di HP/tablet fisik atau latensi multiplayer melalui koneksi internet pengguna. Pantulan batu merupakan presentasi deterministik dari state server; tidak memakai engine rigid-body 3D penuh. Peningkatan desain model besar di atas tetap merupakan rekomendasi.
