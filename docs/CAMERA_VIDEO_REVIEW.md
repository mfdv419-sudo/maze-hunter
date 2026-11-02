# Kamera kontak — kesepakatan terakhir pengguna

Dasar source: paket 16 file Retro 2.000 soal (`maze-hunter-retro-100-levels-camera-pilot-delta.zip`). Paket kamera lima file setelahnya belum dipasang pengguna dan **bukan prasyarat** revisi ini.

## Perilaku

1. Ruang bebas: kamera mengikuti perpindahan karakter pada offset/jarak standar (7,2; FOV 60).
2. Drag pemain: kamera berputar pada radius yang sedang berlaku. Bila ray orbit benar-benar terhalang, collision boleh mendekatkan kamera agar tidak menembus tembok.
3. Bila kamera tertahan/menjadi dekat: posisi kamera disimpan dalam koordinat dunia. Hilangnya halangan atau berlalunya waktu tidak membuat kamera mundur sendiri.
4. Karakter bergerak menjauh: selama jarak belum standar, kamera tetap pada anchor. Begitu jarak standar tercapai, kamera mengikuti kelebihan perpindahan pada frame tersebut, lalu mengikuti gerakan berikutnya. Tidak menunggu timer dan tidak memainkan animasi pemulihan jarak.
5. Jika kamera dalam keadaan mengikuti dan jalur perpindahan kamera menabrak permukaan, kamera berhenti di kontak. Karakter dapat bergerak mendekat; kamera tidak diproyeksikan ke dekat karakter akibat dinding di antara karakter dan kamera.
6. Kembali ke tampilan normal/default berarti posisi aktual kebetulan sudah sesuai dengan follow orang ketiga. Tidak ada perintah putar/zoom tambahan menuju sudut default. Kontak dan pelepasan tidak mengganti yaw/pitch permintaan pemain.

## Implementasi

`ContactFollowCamera` menyimpan posisi dunia, target terakhir, permintaan orbit terakhir dan status anchor. Gerak follow menguji sweep kamera dari posisi aktual ke posisi aktual + perpindahan karakter. Orbit manual menguji ray target–posisi orbit. Keduanya tidak dicampur. Ketika anchor dilepas, offset aktual dipertahankan agar tidak meloncat ke sudut lama. Orbit berikutnya memakai perubahan sudut relatif terhadap posisi aktual, bukan menarik kamera kembali ke permintaan lama.

`StableCameraOrbit`/pencarian sisi dihapus. Boom recovery berbasis waktu tidak dipakai oleh kamera Adventure. Tidak ada auto-center pada ketiga mode; input manual/reset dan cinematic boss tetap disengaja. Yaw/pitch dan tracking tinggi existing tetap diratakan. LookAt dan kamera memakai target yang sama agar fokus tidak tertinggal. Reset Camera tetap perintah eksplisit pemain. Tidak mengubah gerak karakter, fisika properti, area atau protokol server realtime.

## Verifikasi dan batas

Suite utama 281 tes/45 file lulus; sesudah penyesuaian Reset Camera, 14 tes kamera terarah dan build frontend final lulus. Tes mencakup follow bebas pada 30/60/120 FPS, kontak kamera terhadap wall, kamera diam ketika karakter mendekat/menjauh dalam radius, mengikuti tepat setelah radius tercapai, halangan hilang tanpa pemulihan otomatis, objek di antara hero/kamera tidak memindahkan kamera, serta orbit relatif saat anchor berubah sisi.

Tes geometri menggunakan helper yang sama dengan runtime. Ini bukan klaim visual HP/tablet atau jaringan nyata lulus. Browser pengujian sebelumnya tidak dapat membuat WebGL context. Cuplikan boss tetap memakai kamera tersendiri; perubahan framing selama cinematic tersebut bukan auto-follow normal. Occlusion lokal existing dipertahankan ketika penghalang berada di garis pandang.

Pemasangan: timpa delta ini langsung setelah paket 16 file. Abaikan ZIP koreksi lima file. Deploy ulang Netlify, buka ulang game, mulai sesi baru. Tidak ada environment/rules/server realtime baru dan PowerShell 1/2 tetap berjalan.
