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

Versi sesi menjadi `retro-levels-001-100-two-timed-v4`; mulai level baru sesudah deploy. Attempt tiga soal versi lama tidak dilanjutkan sebagai dua soal, sedangkan progress/bintang tersimpan tetap dipertahankan. Rules dari paket awal Knowledge Bonus tetap harus sudah diterapkan.

## Validasi

291 tes/46 file lulus; validator 2.000 soal dan bundle function lulus. Handler dengan adapter Auth/Firestore pengujian memverifikasi dua soal, preload tanpa kunci, penilaian batch hanya setelah Gate, duplicate answers ditolak, retry tanpa tambahan reward, ownership dan level berpeta ganda. Ini bukan pengujian Firebase produksi.

Browser fixture render memverifikasi soal pertama langsung menjadi kedua tanpa hasil antarsoal, meskipun promise verifikasi masih pending. Ringkasan contoh dua soal muat tanpa overflow pada 390×844 (panel 351×261) dan 844×390 (panel 532×254). Fixture hanya render dengan backend sengaja tidak tersedia, bukan kuis produksi atau bukti latensi jaringan nyata. Alur akun nyata setelah Netlify deploy masih memerlukan pilot.

## Current timed revision

Session version: `retro-levels-001-100-two-timed-v4`. Remaining level time is carried into the two-question panel and displayed. A shared QuizClock spans both answers, uses the actual display deadline, and freezes on the last click. Final verification/retry time does not consume answer time. If the deadline expires, optional bonus is skipped; the base maze reward remains. Refresh/resume retains the question deadline or frozen elapsed answer time.

The server calculates its question budget from the level config and verified maze seconds, rejects missing/negative/excess answer duration, and requires both answers in one timed submission. This follows the existing browser completion-proof model; it is not a claim of a complete anti-cheat system. Single-answer scoring requests are no longer supported. No correct count/keys/explanations are returned early. Question preload still avoids waiting for a finish response before showing the questions. Deploy frontend and function together and begin a fresh attempt.
