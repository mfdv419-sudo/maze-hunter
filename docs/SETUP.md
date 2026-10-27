# Mobile Login, Expedition Items & Voice — 27 October 2026
Terapkan delta ini **setelah Pickup, Bandwidth & Camera (delta 19 file)**. Jika baseline tidak pasti, gunakan source lengkap. Tidak ada file baseline yang perlu dihapus.

## Instalasi
1. Salin isi delta sesuai struktur folder ke source repository. Jangan upload ZIP sebagai dist.
2. Deploy frontend dan Netlify Functions bersama. Node 24.x >=24.12; npm ci lalu npm run build. Refresh kedua perangkat dan gunakan room baru.
3. Untuk voice: publish penambahan RTDB rules dari database.rules.json ke database lama; ikuti docs/VOICE_SETUP.md. TURN opsional secara konfigurasi tetapi diperlukan pada jaringan tertentu. VOICE_TURN_URLS dan VOICE_TURN_SECRET adalah environment server saja.
4. Perbaikan popup Google aktif tanpa flag baru. Untuk fallback redirect smartphone, ikuti urutan domain/OAuth/proxy di docs/MOBILE_LOGIN.md sebelum mengaktifkan VITE_FIREBASE_AUTH_SAME_ORIGIN=true dan redeploy. Tidak perlu publish produksi untuk menguji preview yang domainnya diizinkan.
5. Jangan membuat ulang Firebase, mengganti database, atau memasukkan service account ke frontend. Tidak ada dependency npm baru.

## Perubahan
- Login menyimpan tujuan Adventure/Retro dan melanjutkan setelah autentikasi/profil, termasuk popup yang observer-nya sudah sukses.
- Feed peti vertikal sementara; chili napas api, watermelon biji, spinach kekuatan 25 detik; craft cake Classic + chili menjadi granat api.
- Angkat/pindahkan/lempar objek yang memenuhi syarat; validasi mencegah menutup seluruh rute quest. Batang melintang dapat menjadi pijakan; ledge bertanda dapat dipanjat/lompat.
- Jalur batu lava/jurang opsional dengan gap fatal mengurangi satu nyawa dan respawn checkpoint; lima pijakan memberi hadiah sekali. Jalan aspal dan empat ruang sponsor kurasi.
- Voice mic/speaker/PTT, mute peserta, volume dan cleanup per room. Audio memakai WebRTC, signaling terpisah dari gerak.
- Mempertahankan revisi sebelumnya: biome, penjaga, kebangkitan, audio, redeem, pickup online dan mask kamera.

## Validasi dan batas
173 tests / 29 files PASS; TypeScript, Vite production, bundling Function, dan public-env boundary PASS. UI pendek diuji 844×390 serta 740×360: delapan tombol supply muat dua baris. Browser WebRTC hanya mencapai SDP stable, tidak mengeluarkan ICE candidate/audio: audio dua perangkat belum terverifikasi. WebGL lingkungan QA tidak tersedia; visual game penuh, Google login smartphone fisik, Firebase rules produksi, pickup/movement lintas jaringan dan TURN nyata perlu test setelah deploy. Belum dideploy/publish oleh paket ini.

See MOBILE_LOGIN.md and VOICE_SETUP.md in this folder for console/environment setup.
