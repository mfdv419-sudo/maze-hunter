# Revisi gerakan dan visual

Pasang delta ini setelah `maze-hunter-online-actions-sync-delta.zip` (14 file). Gabungkan isi folder `maze-hunter` ke repository pada branch preview lalu deploy ulang frontend Netlify. Tidak ada dependency, environment, skema akun atau perubahan data Firebase. Server Node.js yang sudah memakai room-lease fix dapat tetap berjalan; patch ini tidak mengubah aturan serangan, hadiah, jump boost atau validasi gerak server.

## Perubahan

- Gerakan pemain mulai dan berhenti dengan percepatan/pengereman singkat. Kecepatan maksimum tidak bertambah. Arah tubuh dan pemain lain berputar melalui lintasan sudut terpendek dengan batas kecepatan, termasuk ketika melewati -pi/pi.
- Gait kaki mengikuti kecepatan gerak dan fase langkah berlanjut; pose bahu, siku, lutut dan badan dibaurkan antaraksi. Memanjat pohon memakai beberapa gerakan tangan/kaki bergantian selama durasi pendakian yang sudah ada, sedangkan menarik badan ke tepian memakai urutan pull-up. Ini animasi prosedural berengsel, bukan inverse kinematics per-jari.
- Lompatan pertama tetap biasa. Pada lompatan kedua tubuh melakukan satu koprol melalui pivot di pusat badan, menekuk kaki di udara, kembali tegak sebelum mendarat, dan meredam pendaratan dengan lutut. Shadow tetap pada tanah; kamera tidak mengikuti putaran badan. Pemain online lain menerima visual lompatan dari jumpCount/jumpBase/jumpAt yang sudah dikirim server. Progres pose memanjat peer diperkirakan secara visual dari fase yang tersedia; posisi tetap otoritatif.
- Trenggiling menghadap arah patroli lagi setelah windup berakhir. Ia menggulung menggunakan model cangkang terpisah selama dash aktif, kemudian membuka badan kembali. Root penjaga tidak lagi diputar terus setelah timestamp dash usang. Bagian cangkang dan kendaraan statis digabung menjadi sejumlah kecil mesh untuk mengurangi draw call. Kecepatan animasi penjaga dibaurkan dan facing dibatasi; gerak boss lebih berat.
- Penjaga yang baru kalah dan sebelumnya terlihat mendapat reaksi roboh singkat. Penjaga yang tidak terlihat tidak dimunculkan hanya untuk animasi kalah. HP dan kematian tetap berasal dari simulasi/server.
- Kostum bergerak bersama karakter: scarf, backpack, cape, wings dan kilau bertema merespons gerak/lompatan. Efek kostum bersifat visual; tidak memberi tambahan damage, kecepatan atau keuntungan pembelian dalam multiplayer.
- Batu jatuh memiliki permukaan tidak seragam dan warna per-vertex, dengan seed yang sama antara batu jatuh dan batu yang bisa diangkat. Putaran berhenti pada pose akhir yang sama ketika batu menetap; posisi pickup dan radius gameplay tetap dipertahankan.
- Penampang dinding native biome lebih berlekuk dan memiliki cekungan/tonjolan tanpa mengubah jalur maze atau menambah jumlah segitiga/draw call dinding. Tonjolan ke koridor dibatasi agar tidak menutupi ruang aman karakter dan kamera. Ngarai tetap memakai model tebingnya yang terpisah.
- Kendaraan ekspedisi memperoleh rangka kaca depan, kursi, setir, grille, bumper, roda cadangan, dan karat. Bangkai pesawat mendapat jendela, mesin, propeller serta panel aus; tetap memakai lokasi dan area panjat sebelumnya.
- Pada kebangkitan boss, bagian patung bergeser dan terlepas bersama fragmen/retakan, lalu model hidup meregang dan membuka mata pada rig yang mendukungnya. Kamera mendekati arena secara halus, lalu kembali ke pemain; timeline enam detik dan perlindungan pemain tetap menggunakan implementasi sebelumnya.

## Validasi

228 tes / 37 suite lulus. Pengujian mencakup lintasan maze, multiplayer dan aksi sebelumnya, serta tujuh tes baru gerakan/model. TypeScript/Vite frontend, build realtime dan batas public environment lulus. Model diperiksa melalui render WebGL lokal: walk, climb, somersault, kostum, curled pangolin, kendaraan, batu dan patung retak.

Uji browser Play Solo memakai Chromium software dan viewport desktop/tablet. Skenario tombol A pertama, A kedua di udara, kembali mendarat, rotasi kamera dan gerak diuji pada viewport 1280×720 dan 844×390. Pengujian headless memakai DPR 0.5 dan waktu RAF virtual untuk menguji input dalam jendela lompatan secara deterministik pada renderer software; hasilnya bukan pengukuran FPS hardware. Tidak ada pengujian perangkat fisik atau koneksi Firebase/Cloudflare produksi dalam revisi ini.

## Cek setelah deploy

1. Uji Solo terlebih dahulu: belok tajam dan putar balik, lepas joystick, panjat pohon dan tepian, tekan A sekali lalu A lagi saat di udara.
2. Periksa trenggiling setelah serangan selesai: ia kembali berjalan dan tidak berputar penuh tanpa henti.
3. Coba kostum cape/wings/aurora serta amati kilau dan gerakan aksesori.
4. Lihat batu jatuh berhenti lalu angkat dengan kemampuan yang sudah tersedia; periksa model kendaraan dan dinding dari dekat.
5. Kumpulkan semua seal untuk menilai transisi patung ke boss hidup dan kembalinya kamera.
6. Setelah Solo sesuai, uji dua profil online. Bandingkan rasa gerak dan laporkan kondisi serta angka ms jika pembaruan dunia masih tertunda.

Model tetap bergaya kartun low-poly dan animasi prosedural. Pengalaman setara game referensi harus dinilai melalui bermain pada perangkat sasaran; tes otomatis hanya memverifikasi perilaku dan batas teknis.
