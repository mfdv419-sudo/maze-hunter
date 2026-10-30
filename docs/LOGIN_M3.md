# M3 — detail kegagalan login

Paket ini hanya berisi file baru/berubah dibanding maze-hunter-m2-delta.zip.
Terapkan SETELAH M2 pada branch maze-1. Timpa dengan struktur folder yang sama.
Tidak ada penghapusan file, perubahan rules atau konfigurasi proyek Firebase.

Sesudah build Netlify selesai:
1. Muat ulang game, pastikan kanan bawah tertulis 24.10.24-M3.
2. Tekan Play satu kali.
3. Jika gagal, foto panel dengan jenis error, pesan, dan konteks proyek/domain.
   Pada layar sempit panel bisa digulir jika detail panjang.

Perubahan:
- Tidak lagi mengganti error tanpa kode Firebase menjadi login/unknown.
- Membaca name/message dari Error, TypeError, DOMException, string rejection,
  objek error provider, cause dan nested error; menelusuri maksimal enam objek.
- Kode Firebase dapat dipulihkan dari pesan/cause jika tersedia.
- Panel menampilkan maksimal dua lokasi sumber JavaScript sebagai nama file
  dan nomor baris, tanpa URL/query string lengkap.
- Hanya field pesan yang diizinkan dibaca. Respons provider tidak diserialisasi.
- Token, API key, private key, kata sandi, email dan URL pada pesan disamarkan.
- Konteks publik proyek, auth domain, host game, metode popup dan status masuk
  membantu membedakan konfigurasi yang benar-benar dipakai saat build.
- Diagnosis ditampilkan di browser pengguna; tidak dikirim ke server.
- login/pending tetap merupakan status menunggu, bukan penyebab kegagalan.

Hasil audit live:
Preview yang diperiksa menampilkan Netlify Team protection dan meminta akun
Netlify yang diundang. Pemeriksaan Google login live belum bisa dilanjutkan
dalam browser pemeriksa. Ini bukan bukti Team protection menyebabkan error
pada pengguna yang sudah dapat membuka game. Proteksi tidak diubah.

Batas hasil:
Perubahan memperbaiki penangkapan detail yang sebelumnya hilang. Penyebab
kegagalan Google login pada perangkat pengguna masih perlu dibaca dari panel M3.
Login asli belum dinyatakan berhasil. Tidak ada akun/login palsu untuk preview.
Browser tests memakai fault injection khusus pengujian untuk error TypeError
serta wrapped Firebase error; tidak mensimulasikan login berhasil.
