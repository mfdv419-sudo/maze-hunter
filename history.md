# Maze Hunter — riwayat revisi

## 2 November 2026 — Pilot Forest Grove, orbit radius dan countdown Retro

Dasar: source terbaru yang sudah memuat bank 2.000 soal dan revisi dua soal. Delta digabung agar bisa ditimpa pada paket bank tersebut; ZIP kamera lima file yang dibatalkan tidak diperlukan. Prompt serta keempat gambar Forest_Grove_Final(1).zip diperiksa. Scope pilot tetap **SOLO / Medium / Map 01**, bukan seluruh map Adventure.

- Dunia authored 73×73: Entrance, Hub tiga cabang, Green Cliffs, Ancient Ruins, Giant Tree, Waterfall Valley, Sanctuary terisolasi dan Exit. Tepian/pohon bisa dipanjat; ada selam, atap terowongan, rune, jembatan lintas zona dan shortcut setelah pohon ditaklukkan. Dua dari tiga Sigil membuka Sanctuary; boss dikalahkan dahulu sebelum Exit terbuka. Pertarungan, Binturong, reward serta map lainnya dipertahankan.
- Scene prosedural memakai batu/rumput bertingkat, pohon/bunga yang dibatch, reruntuhan, jembatan papan, langit, air terjun/foam, kolam/alur air serta feedback rune/gate. Tidak menggambar garis solusi referensi. Minimap pilot menyembunyikan pickup yang belum terjelajah. QA geometri: 99 mesh dunia, 90.112 triangle, tanpa koordinat invalid; ini bukan pengukuran FPS.
- HUD pilot ringkas: Back/Forest Grove di kiri atas; minimap dan Fullscreen/Settings/Guide di kanan atas. Objective dipindah ke Guide. Kontrol kanan ikon saja dan pilihan horizontal empat ability. Spinach dapat dipilih sebagai utility; senjata lain tetap bisa dipakai selama buff. Pengaturan audio, volume, sensitivitas, reset, warna cake dan taruh benda dipertahankan. SOLO tanpa chat/mic; toggle Online existing dipindah ke bawah minimap, transportnya tidak diganti.
- Anchor posisi dunia dan pencarian sisi diganti RadiusOrbitCamera. Radius bebas 7,2 / FOV 60; ketinggian relatif mengikuti karakter/pitch. Steering dari input memungkinkan lingkaran, drag manual diprioritaskan, tanpa idle recenter/pencarian sisi. Collision nyata boleh memendekkan radius; tidak ada pemulihan berdasarkan timer. Asal ray di dalam objek panjat boleh keluar volumenya agar kamera tidak dipaksa masuk ke karakter.
- Sisa countdown Retro kini tampil dan berjalan melewati dua soal, berhenti pada klik jawaban terakhir, tidak menghitung verifikasi akhir. Timeout mempertahankan hadiah dasar tanpa bonus. Backend memeriksa budget/durasi dan menerima batch dua jawaban; feedback tetap di akhir. Versi sesi v4 perlu permainan baru, progress lama tidak dihapus.

Validasi: **291 tes / 46 file lulus**; build frontend/server realtime, bundle function dan validator 2.000 soal lulus. Tes terarah pilot memakai kurva lompat asli. Cakupan: semua pasangan dua Sigil, gate/Exit, panjat aktual, selam/atap/kembali, pickup valid, crosslink/shortcut lebih singkat, serialisasi, orbit dan batas timer. Browser fixture menguji HUD/Guide portrait/landscape serta countdown 1/2 → 2/2 → verifikasi. Fixture geometri memakai pembuat scene asli tanpa renderer.

**Batas:** peluncuran game asli di browser cloud gagal membuat WebGL context (renderer dinonaktifkan). Kualitas visual, FPS HP, native multitouch, fullscreen perangkat, kuis akun nyata dan voice online belum terverifikasi. Tidak diganti data produksi palsu atau diklaim lulus. Ini pilot source dengan pemeriksaan visual perangkat yang masih terbuka.

Pasang delta pada source dengan bank 2.000 soal, deploy Netlify frontend/functions, refresh dan mulai sesi baru. Tidak ada environment/rules atau protokol realtime baru; PowerShell 1/2 boleh tetap berjalan. Tidak ada push/deploy/perubahan data Firebase live dari sesi ini. Laporan: docs/FOREST_GROVE_PILOT.md.

## 2 November 2026 — Kamera kontak dan Retro dua soal

**Dasar source:** paket 16 file berisi bank aktif 2.000 soal. Pengguna belum menerapkan koreksi kamera lima file sesudahnya; ZIP tersebut diabaikan dan bukan prasyarat. Revisi ini dapat ditimpa langsung pada paket 16 file. Riwayat paket lima file tetap dicatat di bawah sebagai riwayat pembuatan, bukan status pemasangan pengguna.

- Kamera memakai anchor posisi dunia (`ContactFollowCamera`), bukan boom yang memulihkan jarak berdasarkan waktu atau pencarian sisi. Kamera follow menyapu jalur perpindahan kamera aktual; ketika mentok kamera berhenti. Karakter yang mendekat/memulihkan jarak. Setelah jarak standar tercapai kamera mengikuti lagi pada frame yang sama.
- Orbit manual menjaga radius yang berlaku; collision nyata di ray orbit boleh memperpendeknya. Saat halangan hilang kamera tidak mundur sendiri. Orbit setelah anchor memakai delta sudut relatif terhadap sisi aktual, tidak meloncat ke sudut lama. Tidak ada auto-center pada mode gameplay. Normal/default berarti posisi follow aktual sudah sesuai, bukan perintah menggerakkan kamera lagi. Input/Reset dan cinematic boss tetap eksplisit.
- Retro menjadi dua soal: dua soal lokal mapel terpilih, atau dua mapel berbeda pada Mix. Hasil/pembahasan hanya sesudah keduanya dijawab; server menahan kunci dan jumlah benar hingga selesai. 2/2 memberi total dua kali dasar, maksimum/replay idempoten tetap berlaku.
- Pertanyaan/opsi tanpa kunci disiapkan saat start session. Setelah Gate, soal langsung dibuka dari preload sambil validasi berjalan. Await penyimpanan profil yang sebelumnya memblokir pembukaan soal dihapus. Kedua jawaban dikirim dalam satu transaksi; hasil tetap menunggu backend sah. Retry mempertahankan bukti dan jawaban. Versi sesi diperbarui; mulai level baru setelah deploy.
- Backend tetap Netlify Function/Firebase, bukan server multiplayer laptop. Tidak ada environment, rules baru atau restart PowerShell.

Validasi: **281 tes/45 file lulus**, validator bank dan bundle function lulus; setelah penyesuaian Reset, 14 tes kamera dan build final lulus. Browser fixture memverifikasi perpindahan 1/2 → 2/2 tanpa feedback ketika verifikasi pending; ringkasan dua hasil muat pada portrait/landscape tanpa overflow. Tes handler memakai mock Auth/Firestore; belum uji akun produksi/latensi nyata. Kamera belum terverifikasi visual pada HP/tablet; WebGL browser pengujian sebelumnya disabled. Dokumen: `docs/CAMERA_VIDEO_REVIEW.md` dan `docs/RETRO_QUIZ.md`.

Pemasangan: timpa delta ini pada source paket 16 file, abaikan ZIP lima file, deploy Netlify termasuk function, refresh game dan mulai sesi baru. PowerShell 1/2 tetap berjalan. Tidak ada push/deploy langsung pada sesi ini.

## 2 November 2026 — Koreksi regresi kamera berpindah sisi

Setelah paket Retro 1–100 & Camera Pilot (16 file), pengguna mengirim video `petal_20261102_221800.mp4` dan menegaskan kamera tidak boleh mengitari karakter atau mendekat tanpa halangan. Kedekatan akibat tembok nyata diterima; perpindahan sisi otomatis tidak.

- Kesalahan pilot: pencarian kandidat `StableCameraOrbit` relatif terhadap yaw hasil sebelumnya, sehingga pergeseran dapat terus menumpuk. Ray lama yang bebas menarik kamera kembali; auto-center Comfort masih mengubah yaw bersamaan. Penguncian sisi/durasi tidak mengatasi dua pemilik arah ini.
- Class solver dan seluruh pemakai gameplay dihapus, diganti `followCameraPosition` pada satu ray milik input. Collision hanya memperpendek radius ray tersebut, tidak memilih sisi atau pitch baru.
- Comfort/default dan Manual tidak auto-center. Dynamic yang dipilih pengguna tetap tracking arah. Input manual, Reset Camera dan cuplikan boss tetap disengaja.
- Pivot kamera dan lookAt disatukan; penghalusan fokus horizontal yang tertinggal dihapus. Yaw/pitch/followHeight tetap diratakan. Radius bebas halangan 7,2 dan FOV 60 dipertahankan. Boom direset saat awal/respawn agar jarak pendek lokasi lama tidak terbawa.
- Tidak ada perubahan Retro/bank/bonus, arena, karakter, server Node, environment atau rules. Rincian dan batas ada di `docs/CAMERA_VIDEO_REVIEW.md`.

Validasi: **280 tes/45 file lulus; build frontend lulus**. Regresi menguji helper produksi pada 30/60/120 FPS di ruang terbuka; objek di luar ray; 30 detik halangan lalu hilang; putaran manual; tidak ada auto-center Comfort setelah bergerak lama. Tidak ada lagi referensi solver pilot pada src/tests. Bukan klaim uji visual HP/tablet: WebGL lingkungan browser sebelumnya disabled, perangkat fisik dan koneksi nyata belum diuji.

Pemasangan: timpa lima file setelah paket 16 file sebelumnya, deploy Netlify, buka ulang game dan mulai sesi baru. **PowerShell 1/2 tetap berjalan.** Comfort default stabil tanpa auto-center; jika pengguna sebelumnya memilih Dynamic, gunakan Comfort untuk perilaku tersebut. Tidak ada deploy langsung dari sesi ini.

## 2 November 2026 — Bank Retro aktif 1–100 dan audit zoom kamera

Menggantikan pembatas Level 1/draft pada integrasi kuis sebelumnya atas koreksi eksplisit pengguna. Lampiran baru memuat bank 2.000 soal dan README/manifest, **tidak memuat prompt implementasi terpisah**.

- Konversi setia 2.000 soal aktif, 20 per level dan 2 per mapel per level. Normalisasi kode mapel ke kode existing; konten/opsi/kunci/pembahasan dipertahankan. Bank/kunci hanya dibundel backend. Bank 500/review lama tidak lagi dipakai runtime.
- Checkbox berfungsi di level 1–100, OFF tetap normal, ON menampilkan 10 mapel dan Random Mix. Tidak ada filter draft atau environment preview baru. Untuk satu mapel: dua soal lokal dan satu soal level terdekat dengan kelas/mapel sama; Mix: tiga mapel lokal berbeda. Mengikuti README agar tetap tiga soal per kuis.
- Validasi Golden Gate menerima level yang benar. Completion trace terpisah menyimpan seluruh halaman pada run sukses; reset saat salah. Ini memperbaiki penolakan bonus pada maze berpeta ganda tanpa mengubah path visual, generator, orientasi, timer atau scoring Retro.
- Idempotensi, Auth, kunci privat dan reward maksimum sebelumnya dipertahankan; mulai attempt baru sesudah deploy karena versi bank berubah. Progress lama tetap disimpan.
- Video baru mengonfirmasi lonjakan skala karakter. Kode mengonfirmasi boom memendek segera ketika ray menabrak, ditambah snap resolver kedua setelah interpolasi posisi. Audit lengkap: `docs/CAMERA_VIDEO_REVIEW.md`.
- Pilot kamera memprioritaskan orbit sisi lapang, menahan arah hindar 1,2 detik, membatasi koreksi otomatis 0,85 rad/detik, serta probe luas tiap 150 ms. Putaran yang memasuki tepi dinding dibatasi jika posisi semula cukup lapang. Lerp chord koordinat dunia dan resolver kedua kamera normal dihapus. Yaw/pitch/tinggi tetap diratakan. Tidak mengganti FOV atau kontrol/gameplay.
- **Belum menyelesaikan seluruh zoom di ruang tertutup**: collision masih dapat memendekkan radius ketika tidak ada sisi bebas. Pelebaran koridor/kapal atau fallback occlusion perlu keputusan arena; tidak ada janji jarak tetap mutlak atau kenyamanan perangkat lulus.

Validasi: 277 tes/45 file lulus; tambahan tes orbit mengitari dinding terbatas lulus (total 12 tes kamera terarah). Build frontend, bundle Netlify Function dan validator 2.000 soal lulus. Seluruh ID bank tidak ada dalam JS production. Handler pengujian memverifikasi kuis production level 1–100, private keys, kepemilikan, retry dan hasil setelah semua peta level 100; adapter Auth/Firestore adalah mock pengujian, bukan koneksi produksi. Browser fixture level 100 memverifikasi checkbox → 10 mapel + Mix, tanpa scoring palsu. Uji kamera visual terblokir WebGL context Disabled; HP/tablet fisik dan alur akun nyata setelah deploy belum diuji.

Pemasangan: timpa delta setelah paket sebelumnya, deploy Netlify termasuk retro-quiz, refresh dan mulai level baru. Tidak ada environment baru atau restart PowerShell 1/2. Rules Firestore dari paket Knowledge Bonus awal tetap perlu sudah diterapkan. Rincian: `docs/RETRO_QUIZ.md`. Tidak ada push/deploy/rules live dari sesi ini.

## 2 November 2026 — Quiz Setup Layout Hotfix

Dipasang setelah Retro Knowledge Bonus & Camera Fix (23 file). Tidak ada perubahan scoring, bank, kamera, rules, environment atau server.

- Akar tombol bergeser: `presentation.css` masih memuat `.modal>button+button{margin-left:8px}` yang mengalahkan reset margin sebelumnya. Aturan lama dihapus; tombol bertumpuk tidak lagi mendapat offset tombol kedua.
- Checkbox sebelumnya mewarisi min-height/padding/margin input form dan label block umum. Kini label toggle flex satu baris, margin nol, checkbox 22×22 px.
- Panel setup kuis dipisah dari grid pertanyaan landscape: satu kolom ringkas, tinggi otomatis, judul Retro · Level N dan satu grup tombol dengan lebar/tinggi/spacing sama.
- Bila kuis belum tersedia, kontrol checkbox/mapel disembunyikan. Pesan menjelaskan tetap memperoleh bintang dasar. Bank yang tersedia tetap hanya Level 1; ini bukan perubahan cakupan data.
- Fixture render baru memuat **style.css dan presentation.css**, agar override tema yang sebelumnya terlewat ikut diperiksa.

Validasi: build frontend lulus. Browser DOM pada 390×844 dan 844×390 memverifikasi sisi kiri/kanan kedua tombol identik, tinggi 44/40 px, tanpa horizontal/vertical overflow. Panel landscape available tinggi 233 px; setelah checkbox aktif/mapel muncul 285 px, tetap muat. Checkbox tepat 22×22 px. Tes bersifat layout UI, tanpa backend atau penilaian dummy; tidak memerlukan pengulangan suite scoring karena logikanya tidak berubah.

Pemasangan: timpa file perubahan pada source GitHub, deploy Netlify dan refresh browser. **Tidak perlu perubahan environment, rules Firestore, atau restart PowerShell 1/2 untuk hotfix ini.** Ketentuan pemasangan rules/review dari paket kuis sebelumnya tetap berlaku.

## 2 November 2026 — Retro Knowledge Bonus B/C/D & Camera Collision Correction

**Pemasangan:** setelah Camera & Traversal Pilot (19 file). Source kerja terbaru dari revisi sesi ini dipakai sebagai dasar. Dua perubahan diminta bersamaan oleh pengguna: Retro sesuai prompt/Excel yang dilampirkan dan koreksi kamera dari rekaman bug. Generator, orientasi portrait/landscape dan kontrol maze Retro tidak diubah.

### Audit dan kamera

Lokasi yang diperiksa: `src/main.ts` (pemilihan level/kemenangan), `src/game/retro-state.ts` dan `retro-board.ts` (Golden Gate/rumus rating), `src/services/local.ts` (level-best), `cosmetics.ts` (saldo/kostum), `cloud.ts` (Auth/Firestore), `netlify/functions/maze-room.ts` (Admin/settlement), `firestore.rules`, serta `modern.ts`/`comfort-camera.ts`.

- Pencarian sisi kamera setiap frame dihapus. Collision tetap pada ray/sisi yang diminta pemain; tidak mencoba kanan/kiri/belakang demi memaksakan jarak.
- Orbit vertikal positif sekarang memakai sin/cos pada radius tetap, bukan tinggi tangent dengan jarak horizontal tetap yang menyebabkan skala karakter berubah ketika pitch berubah.
- Batas pitch menjadi −55° sampai 60°. Saat melihat ke atas, titik pandang benar-benar diarahkan ke atas, bukan hanya menyimpan nilai pitch sementara tinggi dipotong ke nol.
- Collision/pemulihan jarak tetap berlaku pada sisi yang sama. Ruang sempit masih dapat memendekkan jarak; belum ada klaim seluruh arena sempit sudah diperlebar atau kenyamanan visual lulus pada perangkat fisik.

### Retro B — Alur kuis

- Panel sebelum level menawarkan Bonus Quiz OFF (bawaan) atau mata pelajaran/Random Mix saat bank tersedia. Level 2+ tetap normal dengan keterangan belum tersedia; tidak memakai ulang soal Level 1.
- Kuis hanya dipicu setelah kemenangan. Reward dasar dengan rumus existing dicatat terlebih dahulu; skip atau layanan gagal tidak menghapusnya.
- Tiga soal unik; Random Mix mengambil tiga mapel berbeda. Satu jawaban final per soal, pembahasan sesudah pengiriman sah, Next, hasil 0–3 dan skip. Konten ditampilkan sebagai teks/bidi, bukan HTML dari bank.
- Ada stable attempt ID, pack version, status sesi dan tombol Resume Bonus Quiz pada Journey setelah refresh. Maze belum selesai tidak dipulihkan karena engine existing tidak menyimpan jalurnya; attempt tersebut aman dilewati tanpa bonus. Bukti finish dengan respons hilang dan kuis aktif dapat dilanjutkan/retry tanpa soal baru.

### Retro C — Data dan review

Lampiran berisi prompt dan XLSX, bukan JSON/ZIP yang disebut prompt. **500 baris asli dari XLSX** dikonversi ke `netlify/private/questions_level01_500_master.json`: 50 per 10 mapel, hanya L1/SD kelas 1, tanpa mengganti pertanyaan/opsi/kunci/pembahasan. Metadata SD/grade/subject/status diturunkan dari tab dan spesifikasi. Seluruh soal masih `draft_pedagogical_review`.

Validator `scripts/validate_question_bank.py` dan tes TypeScript memeriksa jumlah, ID, duplikasi, 3 opsi distinct, kunci dan pembahasan. Ini bukan persetujuan akademik. `netlify/private/quiz-review.json` berisi daftar ID yang telah disetujui; daftar bawaan kosong. Draft tidak otomatis diaktifkan pada situs produksi. Rincian editorial dan pilot draft ada di `docs/RETRO_QUIZ.md`.

Master bank/kunci hanya di function backend; tidak di `src`, `public`, `dist` atau koleksi Firestore yang bisa dibaca klien. Pemeriksaan build memastikan ID/master soal tidak ada di output frontend. Tiga proyeksi pertanyaan tanpa kunci hanya disediakan di fixture render pengujian; bukan asset build production.

### Retro D — Auth, reward dan ekonomi

- Function baru `retro-quiz` memakai Firebase Admin server-only yang sama, tanpa ketergantungan server Node multiplayer laptop.
- Server memverifikasi Auth dan profil milik UID tersebut, memverifikasi trace legal ke Golden Gate Level 1 menggunakan engine yang sama, menghitung rating dasar, lalu menilai jawaban dari bank privat. Client `correctCount` tidak dipercaya. Trace bukan sistem anti-bot/anti-cheat lengkap; input waktu/error mengikuti bukti sesi dan validasi batas yang tersedia.
- 3/3 memberi hasil run 2× dasar; 0/1/2 benar atau skip tetap dasar. Transaksi Firestore menyimpan session/answers/score dan maksimum hasil per profil/level. Retry/duplicate/replay tidak menambah reward penuh lagi.
- Bintang dasar 1–3 pada profil tetap dipertahankan. `retroKnowledge` adalah progress tambahan milik server. Saldo total dihitung dari maksimum antara hasil dasar dan hasil terbaik kuis; jika dasar meningkat setelah kuis lebih lemah, total tidak ikut menggelembung. Contoh 2×2=4 lalu dasar 3 tetap total 4, bukan 5.
- Settlement kostum membaca progress bonus tepercaya dalam transaksi. Client tidak bisa menulis `knowledge` pada profil atau menulis koleksi bonus/sesi sendiri. Read own-profile progress diizinkan lewat rules baru; session hanya melalui function.
- Profil, ringkasan Retro, node level, peringkat dan saldo kostum memperhitungkan hasil tambahan tanpa mengganti currency atau aturan unlock.

### Validasi dan batas

**273 tes / 45 file lulus**, validator 500 soal lulus, build frontend lulus dan bundle function Node lulus. Tes mencakup skor 0–3, skip, MTK/Random Mix, kunci tidak dikirim sebelum jawab, jawaban final, trace Golden Gate, duplikasi/network retry, kepemilikan akun pada handler dengan adapter Auth/Firestore mock, reward-best dan ekonomi, serta regresi Retro/Adventure/realtime.

Browser preview memverifikasi panel pre-level OFF/unavailable dan render maze Retro existing. Fixture DOM tiga ukuran (390×844 Arab RTL, 844×390 Mandarin/pinyin, 1024×768 Prancis beraksen) tidak mengalami horizontal/vertical overflow pada kasus yang diperiksa; target jawaban ponsel sekitar 46 px. Fixture hanya menguji render, bukan penilaian atau backend produksi.

Belum diuji ke project Firebase/Netlify produksi atau emulator rules; belum uji kuis penuh dengan akun nyata, HP/tablet fisik atau native multi-touch baru. Kamera 3D masih perlu pilot visual; browser pengujian sebelumnya gagal membuat WebGL context. Tidak mengklaim kamera sudah nyaman hanya berdasarkan unit test.

**Status: integrasi source selesai; review akademik pending; deployment dan pilot perangkat belum dilakukan.**

### Pemasangan

1. Salin delta ke source GitHub yang sudah berisi revisi sebelumnya; deploy ulang Netlify, termasuk function `retro-quiz` baru dan perubahan `maze-room`.
2. Terbitkan rules Firestore dari `firestore.rules` pada project Firebase existing. Tidak ada perubahan rules RTDB.
3. Untuk menguji 500 soal draft di preview, tambahkan environment Netlify `RETRO_QUIZ_DRAFT_ORIGIN=https://deploy-preview-1--maze-hunter.netlify.app` (sesuaikan nomor preview yang benar), lalu redeploy. Tanpa slash akhir/Markdown/path. Backend hanya menerima pengecualian draft dari origin deploy-preview yang persis sama; situs produksi tetap menunggu approved IDs. Hapus variable setelah pilot/review.
4. Tetap gunakan `FIREBASE_SERVICE_ACCOUNT_JSON` server-only existing; tidak ada kredensial frontend baru. Jika function belum dikonfigurasi, Retro normal tetap dapat dimainkan dan kuis menyatakan belum tersedia. Jangan memasukkan credential ke GitHub.
5. **PowerShell 1 dan 2 tidak perlu direstart** untuk delta ini. Update dilakukan pada frontend dan Netlify Functions. Buka ulang browser setelah deploy.

Lihat `docs/RETRO_QUIZ.md` untuk review, struktur, keterbatasan dan konfigurasi. Tidak ada publikasi Netlify/GitHub atau perubahan akun Firebase langsung dari sesi ini.

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
