# Maze Hunter M7 — kontrol karakter dan petualangan berzona

Pasang ZIP ini **setelah M6** pada branch `maze-1`. Timpa file dengan jalur
folder yang sama. ZIP hanya berisi file baru/berubah; tidak menyertakan dist,
node_modules, akun uji, atau environment variables. Label versi: **25.10.26-M7**.
Tidak ada commit, push, deploy, atau perubahan rules Firebase otomatis.

## Kontrol dan kamera

Joystick/WASD: atas maju, bawah mundur, kiri/kanan membelokkan karakter.
Diagonal berjalan sambil berbelok. Kamera tidak menjadi acuan arah input.
Q/E atau geser kanan layar memutar kamera secara terpisah. Kamera belakang
mengikuti secara halus; sudut nominal 35 derajat dari bidang tanah (opsi tinggi
sekitar 44 derajat), sebelum penyesuaian tabrakan kamera. Ini menggantikan input
M6 yang mengunci yaw kamera di awal sentuhan dan memiliki basis horizontal keliru.
Tidak ada tombol dodge tambahan pada M7; menghindar memakai gerak dan lompat.

## Retro

Level 1–5 tetap pengenalan. Level 6–100 menggunakan katalog 95 papan baru,
dipilih di luar runtime sehingga HP tidak perlu mencoba ribuan seed ketika
membuka level. Progres profil lama tetap dipertahankan.

Kriteria terukur untuk seluruh 95 papan:

- Graf lintasan adalah pohon: satu solusi dan tanpa loop penghubung solusi.
- Panjang setiap cabang terminal minimal 4 sel; rata-rata minimal 5 sel.
- Persimpangan penting pada rute benar: minimal 4 (level 6–10), 6 (11–20),
  lalu 8 (21–100).
- Rute solusi mencakup 50–65% sel logis yang tersedia untuk berjalan.
- Maksimal 30% sel pada solusi menyentuh batas papan; start/finish di bagian dalam.
- Ukuran papan: 9×9 mulai level 6, 11×11 mulai 11, 15×15 mulai 21,
  kemudian bertambah tiap wilayah hingga 29×29.

Tiga cabang yang semuanya mendekati finish dalam jarak dua sel **tidak dijamin**
pada setiap papan. Tidak ada klaim bahwa pemain pasti salah empat kali atau
pasti tertipu selama separuh cabang: hal itu bergantung pada pemain dan cara
melihat papan. Backtracking bukan kesalahan wajib; jalan buntu tetap mengambil
satu dari tiga nyawa dan mengulang dari Start. Kontak tembok dan mengangkat
jari tetap bebas hukuman. Loop dan jalur yang menyambung kembali dipakai pada
Adventure, bukan dipaksakan ke aturan solusi tunggal Retro.

## Dunia Adventure

10 struktur per tingkat, dengan letak sumber daya/penjaga berubah menurut seed.
Peta logis sekarang 43×43 / 53×53 / 63×63 termasuk taman pelarian di tepi dunia.
Ada tujuh kelompok area: Kebun Liar, Jalur Terlupakan, Wilayah Penjaga,
Simpang Perebutan, Rimba Dalam, Benteng Raja, dan Jalan Kebebasan.

Area terbuka dihubungkan jalur bercabang. Landmark asli prosedural mencakup
bunga, reruntuhan/totem, menara penjaga, tempat sumber daya, dan platform akar
Raja. Palet permukaan/semak berubah menurut zona. Geometri dekat karakter saja
yang dimasukkan ke batch lantai/dinding/daun; kabut membatasi pandangan jauh.
Semua aset tetap low-poly prosedural, bukan aset Super Bear/Roblox berlisensi.
Ini peningkatan prototipe, bukan klaim kualitas visual setara game tersebut.

### Rumput dan sumber daya

- Normal: rumput pendek, dekorasi.
- Tall: rumpun tinggi; B mencari 2 koin dan 2 kue.
- Rare: daun terang, bunga kristal dan cahaya bergerak; 10 koin, kunci,
  satu pelindung dan kecepatan sementara 12 detik.
- Danger: daun ungu/duri, hadiah 8 koin dan 2 kue, membangunkan anak penjaga.
- Semak tebas: batang dan rumpun berbeda, tanda lingkaran ketika dekat;
  B membuka jalur aktual. Jalan rahasia memiliki tanda kunci dan memakai satu kunci.
- Tombol B berubah antara KUE/TEBAS/CARI mengikuti objek terdekat.
- Peti memulihkan amunisi, memberi satu nyawa (maksimal tiga), koin dan kunci.

Koin, buff dan kunci hanya untuk sesi tersebut. Belum merupakan saldo pembelian
kostum/cloud inventory. Empat jenis rumput tidak menggantikan semak tebas.

### Penjaga dan Raja

Medium memiliki 3 penjaga; Hard 5 ditambah 1 penjaga elite benteng; Extreme 7
ditambah 2 elite. Ada **satu Raja utama bersama**, bukan tiga Raja pemicu pelarian.

Raja dilindungi hingga tiga segel ditemukan. HP dasar: 12/18/24 sesuai tingkat.
Fase 1: gelombang hentakan akar, biji, anak pohon. Di bawah 70%: akar penahan
(memperlambat dua detik), putaran duri, sulur dan tambahan penjaga pada tingkat
lebih tinggi. Di bawah 30%: gelombang luas, dahan jatuh, serangan garis dan minion.
Serangan bertanda lebih dahulu 1,5–2,2 detik. Serangan garis divisualkan dengan
bidang peringatan; Raja belum memiliki animasi dash skeletal. Anak penjaga
berukuran lebih kecil. Arena memiliki pasokan kue perlahan agar pertarungan solo
bisa diselesaikan. Musik dan pencahayaan berubah saat pertarungan/phase akhir.

Kue biasa masih slow → stun → kehilangan satu nyawa. Raja Hard/Extreme
mengembalikan pemain ke Start dan mereset penemuan pribadi; segel disimpan.
Co-op tidak menghapus penemuan tim akibat satu anggota terkena Raja.

### Pelarian

Raja tumbang membuka lintasan akar menuju taman pelarian dan memulai timer
45–90 detik. Tidak langsung memenangkan permainan. Timer menonjol dan musik
lebih cepat. Dahan jatuh dengan tanda sebelum benturan.

Tiga pilihan yang diperiksa pada seluruh 30 peta:

1. Aman: memutar, bebas sungai.
2. Cepat: lebih pendek, harus melompati air.
3. Rahasia: pintu berkunci, memotong putaran aman, memberi peti tambahan.

Lintasan aman tidak ditutup secara acak. Rintangan dinamis M7 berupa dahan
jatuh; sistem dinding duri yang menutup/membuka cabang secara berkala belum ada.
Gerbang membesar dan bercahaya saat terbuka. Melewatinya menjadi kondisi menang.

## Online beta

Menu Online menyediakan pencarian room acak, pembuatan room privat Race/Co-op,
dan gabung dengan kode. Google login, RTDB dan Netlify Function asli diperlukan;
lab lokal tidak menyimulasikan akun/room online. Tidak ada env/rules baru.

- Kapasitas Medium 4, Hard 8, Extreme 10; start berbeda dan terhubung.
- Start dipilih berdasarkan biaya rute ke benteng dan jarak antartitik. Ini belum
  jaminan kesetaraan turnamen; uji banyak pemain masih diperlukan.
- Semua pemain siap; host memulai. Pencarian acak mempertemukan pemain di lobby,
  bukan memasukkan pemain baru ke pertandingan yang sudah berjalan.
- Server memvalidasi kepemilikan profil/token, lintasan, anggaran kecepatan,
  urutan paket, cooldown, amunisi, HP Raja, kemenangan dan waktu finish.
- HP Raja, timer pelarian dan jalan pintas dibagikan. Co-op membagikan segel serta
  penemuan dan menonaktifkan friendly fire. Race memakai segel pribadi dan kue PvP.
- Pemain yang sudah finish menunggu hasil; urutan finish memakai waktu server.
- Room aktif tidak otomatis dibatalkan hanya karena presence terputus; tombol
  reconnect tersedia selama room masih aktif. Ini belum jaminan grace period
  tanpa risiko: simulasi/timer server tetap berjalan saat pemain terputus.

**Batas beta:** encounter NPC/projectile/hazard masih disimulasikan per peserta,
dengan HP Raja bersama; belum satu simulasi seluruh NPC yang identik untuk semua
kamera pemain. HP Raja belum diskalakan menurut jumlah peserta. Sinkronisasi
menggunakan snapshot dan Netlify request, belum server tick persisten. Belum ada
uji beban 10 perangkat atau uji koneksi Firebase produksi. Karena itu bagian ini
bukan multiplayer final yang sudah tervalidasi. Papan peringkat global permanen
serta verifikasi catatan keluarga/cloud bukan cakupan M7.

## Verifikasi

Tes mencakup graf Retro, seluruh 30 peta, ketiga pilihan pelarian, empat rumput,
resource/pelindung, tiga fase Raja, timer, gerak, collision, river/jump, snapshot,
kapasitas room, validasi server, segel Co-op dan timer bersama. Browser memeriksa
kontrol terhadap rotasi kamera, arena, pause, multi-touch, resize, tiga viewport,
login gagal yang nyata, Retro playthrough dan cache offline build produksi.

Belum diuji pada speaker/layar sentuh HP fisik, Safari/iOS, FPS Android kelas
menengah, login Firebase live atau dua perangkat online. Tes headless bukan bukti
FPS profesional ataupun keseimbangan rasa bermain. Instal M7, cek label versi,
lalu uji kontrol dahulu sebelum menilai keseimbangan musuh.
