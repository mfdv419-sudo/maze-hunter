# Retro Knowledge Bonus — dua soal, hasil di akhir

Dasar: paket 16 file dengan bank 2.000 soal aktif untuk level 1–100. Bank dan mapping mapel/kelas tidak berubah. Checkbox OFF bermain normal; ON memilih mapel atau Random Mix.

- Satu mapel: tepat dua soal dari level itu sendiri. Tidak lagi meminjam soal ketiga dari level lain.
- Mix: dua mapel berbeda dari level tersebut.
- Jawaban pertama langsung membuka soal kedua, tanpa informasi benar/salah, kunci atau pembahasan.
- Kedua jawaban dikirim bersama; hasil akhir berisi skor /2, total hadiah dan dua ringkasan benar/salah. Tiap ringkasan dapat dibuka untuk melihat jawaban, kunci dan pembahasan. Server juga tidak mengirim jumlah benar/kunci/pembahasan sebelum kuis selesai.
- 2/2 benar = dua kali hadiah dasar. Hasil lain/skip tetap dasar. Reward maksimum, kepemilikan Auth, transaksi dan replay idempoten dipertahankan.

## Jeda sesudah Golden Gate

Alur sebelumnya menunggu `save()` profil, lalu request finish, validasi trace dan transaksi backend sebelum memperoleh teks soal. Penyebab menunggu ini terkonfirmasi pada kode; tidak ada pengukuran untuk menyatakan cold start atau jaringan tertentu sebagai penyebab utama rekaman pengguna.

Sekarang teks/opsi dua soal dikirim bersama start session sebelum maze dimulai, **tanpa kunci**. Setelah Gate, panel menggunakan teks tersebut langsung; save profil dan verifikasi kemenangan tidak memblokir pembukaan soal. Verifikasi tetap berjalan pada Netlify Function/Firebase. Sesudah dua jawaban, hasil/reward menunggu verifikasi dan satu transaksi penilaian. Jika jaringan gagal, jawaban/bukti dipertahankan dan tersedia retry; tidak menampilkan hasil sukses palsu.

Function retro-quiz memakai backend Netlify dan Firebase Admin existing. Tidak memakai proses Node multiplayer di laptop. Tidak perlu hosting atau environment baru. Kunci tetap privat di function; preload hanya untuk dua pertanyaan sesi, bukan seluruh bank.

Versi sesi menjadi `retro-levels-001-100-two-v3`; mulai level baru sesudah deploy. Attempt tiga soal versi lama tidak dilanjutkan sebagai dua soal, sedangkan progress/bintang tersimpan tetap dipertahankan. Rules dari paket awal Knowledge Bonus tetap harus sudah diterapkan.

## Validasi

281 tes/45 file lulus; validator 2.000 soal dan bundle function lulus. Handler dengan adapter Auth/Firestore pengujian memverifikasi dua soal, preload tanpa kunci, penilaian batch hanya setelah Gate, duplicate answers ditolak, retry tanpa tambahan reward, ownership dan level berpeta ganda. Ini bukan pengujian Firebase produksi.

Browser fixture render memverifikasi soal pertama langsung menjadi kedua tanpa hasil antarsoal, meskipun promise verifikasi masih pending. Ringkasan contoh dua soal muat tanpa overflow pada 390×844 (panel 351×261) dan 844×390 (panel 532×254). Fixture hanya render dengan backend sengaja tidak tersedia, bukan kuis produksi atau bukti latensi jaringan nyata. Alur akun nyata setelah Netlify deploy masih memerlukan pilot.
