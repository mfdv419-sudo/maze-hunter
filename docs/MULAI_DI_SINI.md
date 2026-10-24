# Mulai di sini — Maze Hunter

Paket ini diterapkan ke **branch `maze-1`**, bukan `main`. Konsep terbaru menjadi acuan: Retro trace-path, Modern 3D, dan maskot binturong sederhana.

## Cara menerapkan tanpa instalasi di laptop

1. Ekstrak ZIP delta.
2. Upload seluruh file di dalamnya ke root branch `maze-1`, pertahankan struktur folder.
3. Hapus file lama yang tercantum dalam `DELETE_FILES.txt`. Mengekstrak atau mengunggah ZIP tidak otomatis menghapus file lama.
4. Di Netlify, pastikan branch/deploy preview yang dibangun sesuai, build command `npm run build`, publish directory `dist`. Folder Functions adalah `netlify/functions`.
5. Lengkapi konfigurasi Firebase milik project. Nama variabel ada di `.env.example`, penjelasan rinci di `README.md`. Jangan memasukkan secret ke source atau ZIP.
6. Jika menguji deploy preview atau branch deploy, pastikan variabel tersedia di konteks deployment tersebut. Perubahan `VITE_` memerlukan rebuild.

## Mengapa halaman meminta Google login?

Login merupakan persyaratan produk yang sudah disepakati. Versi production tidak memiliki akun palsu atau bypass. Tanpa konfigurasi Firebase, halaman tetap tampil tetapi menjelaskan bahwa login belum dikonfigurasi.

Setelah Google login berjalan, buat profil dengan nama panggilan. Progres dan kostum setiap profil terpisah. Gunakan project Firebase existing; jangan membuat project pengganti hanya untuk mengikuti panduan ini.

## Apa yang sudah dapat dimainkan?

- Retro: menelusuri jalur, 100 level unik, 10 wilayah, timer, tiga nyawa, bintang, unlock, retry, zoom/pan, mouse dan sentuhan.
- Modern Solo: labirin 3D, binturong dengan animasi, joystick/keyboard, gerakan kontinu dan sliding dinding, peta tersembunyi, beberapa pintu masuk, tiga kesulitan.
- Empat tampilan binturong: classic, explorer, raincoat, space. Kostum awal diperoleh dari bintang; kemampuan bermain tetap setara.
- Bahasa Indonesia/English dan kontrol suara.

## Apa yang belum boleh disebut final?

Kode login/cloud dan room Race/Co-op sudah disertakan, tetapi belum diuji dengan layanan Firebase Anda. Uji online harus memakai sesi terpisah dan koneksi nyata, bukan lab lokal.

Iklan memerlukan konfigurasi/persetujuan penyedia. Checkout, penagihan langganan dan pembelian kostum belum diimplementasikan. Game belum boleh dinyatakan final komersial sebelum bagian-bagian tersebut selesai dan teruji.

Lihat `QA_REPORT.md` untuk hasil pengujian. Belum ada perubahan langsung atau deployment ke GitHub/Netlify Anda.
