# Retro Knowledge Bonus — bank aktif level 1–100

Bank baru dari pengguna: 2.000 soal, 100 level × 10 mata pelajaran × 2 soal. Konten/opsi/kunci/pembahasan dipertahankan; kode BIN/ARA/MAN/PPK/INF dipetakan ke IDN/ARB/ZHO/PP/TIK existing. Berkas backend aktif: `netlify/private/questions_2000_master.json`. Bank lama 500 dan quiz-review tidak lagi dipakai function. File lama boleh tetap berada di source; tidak dibundel oleh function ini.

Checkbox OFF: Retro normal. Checkbox ON: pilih satu pelajaran atau Random Mix, selesaikan maze, jawab tiga soal. Pilihan tersedia level 1–100. Level di luar bank tidak dibuat-buat. Tidak diperlukan RETRO_QUIZ_DRAFT_ORIGIN; variabel lama tidak lagi dipakai. Kredensial Firebase Admin existing tetap diperlukan oleh function, sama seperti sebelumnya.

Satu mapel: dua soal level terpilih, soal ketiga dari level terdekat dengan kelas dan mapel yang sama, tanpa duplikasi sesi. Bila jarak sama, pilih level lebih rendah dahulu. Random Mix: tiga mapel berbeda dari level saat ini. Peta kelas mengikuti manifest pengguna (1–16 kelas 1, 17–33 kelas 2, 34–50 kelas 3, 51–66 kelas 4, 67–83 kelas 5, 84–100 kelas 6).

3/3 benar = total dua kali hadiah dasar. Hasil lain/skip = hadiah dasar. Simpan maksimum per profil/level, bukan reward penuh setiap replay. Kunci tetap privat di Netlify Function, jawaban diperiksa server. Attempt versi lama tidak dapat dilanjutkan dengan bank baru; mulai permainan baru setelah deploy. Bintang yang sudah tersimpan dipertahankan.

Bukti kemenangan sekarang menyimpan semua halaman pada run sukses. Riwayat dibuang ketika terkena dead end/restart, tanpa mengubah generator, kontrol, orientasi, timer, path visual, atau rumus bintang. Backend mengulang trace pada level yang benar. Ini bukan sistem anti-bot lengkap.

## Pemasangan

Timpa delta pada source yang sudah memuat paket sebelumnya, deploy ulang Netlify termasuk function retro-quiz, refresh browser dan mulai level baru. Firestore rules dari paket awal Knowledge Bonus tetap harus sudah dipasang (retroKnowledge read milik akun, write server saja). Paket ini tidak mengubah rules. Tidak ada environment baru, tidak perlu restart PowerShell server/tunnel.

## Verifikasi dan batas

Tes handler memakai adapter Auth/Firestore pengujian; bukan koneksi Firebase produksi. Uji real setelah deploy: centang bonus, pilih mapel, capai Golden Gate, pastikan tiga soal muncul, jawaban/pembahasan berfungsi, hasil terbaik tersimpan dan replay tidak menggandakan saldo. Ulangi level 1, 2, dan level berpeta ganda. Kuis dapat dilewati tanpa kehilangan hadiah dasar.
