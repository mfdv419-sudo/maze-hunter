# Voice online: konfigurasi dan pengujian
Voice tersedia sebagai implementasi WebRTC audio di source ini, terpisah dari sinkronisasi gerak. Belum diverifikasi end-to-end pada perangkat/jaringan nyata.

## Wajib
- Deploy frontend dan Netlify Functions bersama di HTTPS.
- Publish database.rules.json dari paket ini ke **Realtime Database yang sudah digunakan**. Penambahan mazeVoice memvalidasi membership, pemilik UID/profil, SDP, session, dan timestamp. Tidak perlu mengganti database atau Firestore. Pertahankan integrasi rules lain milik project jika ada.
- Masuk room yang sama pada dua perangkat, tekan Gabung suara, izinkan mikrofon. Mikrofon awalnya mute; aktifkan mic atau tahan PTT. Speaker dapat perlu diketuk karena aturan autoplay browser.
- Tombol mute pribadi, mute peserta, volume suara terpisah, dan indikator bicara tersedia. Menyembunyikan tab memute mic. Keluar room/logout menghentikan track dan koneksi. Aplikasi tidak menyediakan perekaman audio.

## Relay untuk jaringan seluler / NAT
Default memakai STUN publik. Ini tidak menjamin koneksi lintas jaringan. Siapkan layanan TURN milik Anda yang kompatibel dengan coturn REST shared-secret credentials, lalu set variabel **server Netlify**, bukan VITE:
- VOICE_TURN_URLS: URL turn:/turns: yang valid, dipisah koma.
- VOICE_TURN_SECRET: shared secret coturn REST. Ini bukan password akun TURN statis biasa.
Redeploy Functions. Server hanya memberi kredensial sementara 1 jam kepada anggota room terautentikasi; secret tidak dikirim ke frontend. FIREBASE_SERVICE_ACCOUNT_JSON tetap server-only dengan konfigurasi lama.

Audio tidak lewat request movement/Firebase. Firebase hanya membawa presence dan signaling SDP. Koneksi audio mesh mengirim satu aliran per peserta lain (maksimal 9 peer); bitrate ditargetkan sampai 24 kbps per peer, belum termasuk overhead. Banyak pemain dan relay meningkatkan kuota. Ini bukan jaminan buffering gerak produksi sudah hilang.

## Test nyata sebelum rilis
1. Dua akun/perangkat, satu Wi-Fi dan satu data seluler: join room baru, gabung suara, unmute, bicara bergantian; pastikan suara dua arah dan gerak/pickup tetap berjalan.
2. Uji speaker, mute mic, PTT, mute peserta, volume, izin ditolak lalu retry, tab background, keluar/rejoin, pergantian room, serta TURN.
3. Pastikan indikator mic perangkat padam setelah keluar. Uji 3–10 peserta sesuai target dan pantau bandwidth/latency.

QA lokal: SDP offer/answer mencapai stable pada dua peer, namun browser test mengembalikan nol ICE candidate dan nol byte audio. Karena itu audio end-to-end belum dinyatakan lulus. Kedua synthetic audio track terhenti saat Stop; tidak ada mic perangkat yang diakses. Unit test memakai mock untuk lifecycle, membership, cleanup, dan signaling.
Referensi: https://webrtc.org/getting-started/turn-server
