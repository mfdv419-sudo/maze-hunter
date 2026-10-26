# Maze Hunter — Terrain & Online delta

## Baseline dan pemasangan

Paket ini adalah **delta terhadap paket 49 file terakhir** (`maze-hunter-changes.zip`, source lengkap pendamping `maze-hunter-source-complete.zip`). Terapkan setelah paket tersebut, pada branch `maze-1` yang sedang Anda pakai. Bukan delta terhadap source awal.

1. Ekstrak seluruh isi ZIP delta ke root repository dan timpa path yang sama.
2. Tidak ada penghapusan file baru pada revisi ini. Pembersih file warisan dari revisi sebelumnya tetap dipertahankan.
3. Publish isi `firestore.rules` yang disertakan melalui Firebase Console → Firestore Database → Rules. Batas catatan Adventure menjadi 320 untuk 8 area × 4 kesulitan × 10 peta. Jangan membuat ulang database/Auth/profil.
4. Commit/push frontend dan `netlify/functions/maze-room.ts` bersama. Netlify: Node 24, `npm run build`, publish `dist`, Functions `netlify/functions`.
5. Deploy ulang agar frontend, Function dan offline cache memakai revisi yang sama. Jangan hanya mengunggah folder dist karena itu tidak memperbarui Function Online.

## Online: bug kode dan konfigurasi nyata

Bug pada source telah diperbaiki: callback transaksi Join/Random sebelumnya membatalkan pembacaan awal kosong sebelum mendapatkan room nyata dari Realtime Database. Handler sekarang membolehkan retry dan memeriksa hasil akhir. Create/Join/Random/Ready/Start serta kesalahan konfigurasi/token diuji memakai Firebase terkontrol. Ini belum memverifikasi setting project online Anda.

Pastikan variabel yang sejak awal diperlukan ini sudah terpasang pada konteks deployment/branch Netlify yang digunakan:

| Variabel | Tempat | Isi |
|---|---|---|
| `VITE_FIREBASE_DATABASE_URL` | Build frontend | URL persis Realtime Database existing dari Firebase Console |
| `FIREBASE_DATABASE_URL` | Netlify Functions | URL database yang sama |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Netlify Functions saja | Kredensial Admin JSON yang valid untuk project existing |

Public Web identifiers lainnya tetap memakai konfigurasi existing atau variabel VITE_ yang sudah digunakan. Jangan menaruh service account/private key dalam VITE_, repository, chat, atau screenshot.

`database.rules.json` existing tetap berlaku: hanya anggota room boleh membaca room; penulisan world melalui server. Jika rules belum pernah dipasang, gunakan file existing pada Realtime Database Rules. Firestore Rules dan Realtime Database Rules adalah dua tempat berbeda.

Dialog kini menampilkan error asli dan kode HTTP. HTTP 503 “Room server is not configured” berarti konfigurasi Function belum tersedia; HTTP 401 menunjukkan autentikasi/token; HTTP 404/non-JSON menunjukkan layanan Function belum tersedia pada deployment itu. Pesan izin Firestore/RTDB menunjukkan aturan/akses yang perlu diperiksa. Jangan menganggap semua kegagalan berasal dari UI.

Random matching mempertemukan pemain dengan area, kesulitan dan mode yang sama. Bila belum ada pemain lain, sistem membuat lobby publik untuk menunggu; tidak menambahkan pemain palsu. Semua anggota harus Siap dan host menekan Mulai.

## Yang dapat dimainkan

- Easy tersedia untuk Solo dan Online; arena lebih kecil, waktu lebih longgar, penjaga/boss lebih lemah dan ancang-ancang lebih lama.
- Gunung Bara / Ember Volcano tersedia sebagai area tambahan dengan medan basalt dan rintangan bara.
- Dinding area memiliki bentuk native dan tinggi mendekati Ngarai. Dinding labirin tetap tidak bisa dipanjat. Benda mandiri yang dapat dicapai di jalur memiliki titik panjat bercincin, termasuk pohon, batang tumbang, batu dan kendaraan/kapal rusak. Pohon di puncak dinding merupakan bagian batas dunia, bukan rute panjat menembus labirin.
- Penjaga berpatroli di beberapa tikungan di luar wilayah segel. Setiap wilayah segel tetap dijaga 3 besar + 2 kecil.
- Jembatan Ngarai sempit; keluar dari tepi mengurangi satu hati dan mengembalikan pemain ke checkpoint terakhir. Kedua pendekatan jembatan menyediakan checkpoint aman. Lompatan dapat menyelamatkan penyeberangan; jatuh tidak dibatalkan pelindung.
- Bahaya memiliki peringatan sebelum aktif: batu jatuh Gunung/Ngarai, tumbuhan bergulir Gurun, kayu Hutan, gelombang Pantai, sampah mengapung/terendam Laut, dan bara Volcano. Berlari keluar lintasan, lompat atau ubah kedalaman untuk menghindar. Kontak yang valid mengurangi hati dan kembali ke checkpoint.
- Boss Laut berada di air; patung dorman di dasar laut bangkit menjadi pari. Boss Ngarai memakai rig batu, Gurun memakai rig sphinx.
- Pilih kue di deretan warna bawah: merah = 2 damage; kuning = stun; hijau = perlambatan. Tersedia 3 stok awal tiap jenis; peti menambah stok sampai batas 5. Kue asli memakai bekal reguler. Warna proyektil dan icing mengikuti pilihan; boss tetap hanya dapat diserang pada waktu rentan.

## Verifikasi

124 tes Vitest / 20 file lulus, TypeScript dan build frontend lulus, bundel Function lulus. Pemasangan delta ke source lengkap revisi 49 file diperiksa identik secara byte dan dibangun kembali.

UI dialog diperiksa di browser dengan markup yang sama seperti game. Easy/Volcano muncul pada menu. Browser di lingkungan pemeriksaan tidak menyediakan WebGL, sehingga render 3D terbaru, kelancaran HP fisik dan koneksi Firebase Online multi-perangkat belum dinyatakan lulus. Tidak ada deploy langsung ke website Anda.
