# Menjalankan server realtime Maze Hunter

Source ini menambahkan server Node.js/WebSocket. Netlify tetap frontend/Function akun, Firebase lama tetap Auth/data permanen. Jangan membuat ulang Firebase atau mengganti data produksi.

## 1. Tes di laptop, belum perlu membeli hosting
Gunakan Node 24.x >=24.12. Di root source:

```sh
npm ci --ignore-scripts
npm run build:realtime
```

Buat file lokal **.env.realtime** (jangan commit). Isi dengan konfigurasi **server** yang sudah dipakai di Netlify:

```env
FIREBASE_SERVICE_ACCOUNT_JSON='PASTE_JSON_SERVICE_ACCOUNT_YANG_SUDAH_ADA'
FIREBASE_DATABASE_URL=DATABASE_URL_YANG_SUDAH_DIPAKAI
REALTIME_ALLOWED_ORIGINS=http://localhost:5173
REALTIME_MAX_ROOMS=1
PORT=8080
```

Ganti placeholder dengan nilai asli Anda. JSON harus satu baris dan valid; tanda kutip luar menjaga nilainya saat dibaca env-file. Service account hanya berada di backend. Jangan menambahkan awalan VITE_ atau mengunggah file ini ke GitHub.

Jalankan terminal pertama:

```sh
npm run start:realtime:local
```

Buka http://localhost:8080/health. Respons ok hanya menunjukkan proses hidup; uji login dan room tetap wajib untuk memeriksa akses Firebase.

Di file frontend lokal **.env.local**, pertahankan seluruh konfigurasi publik Firebase yang sudah ada dan tambahkan:

```env
VITE_REALTIME_URL=ws://localhost:8080/game
VITE_FIREBASE_AUTH_SAME_ORIGIN=false
MAZE_FUNCTIONS_PROXY=https://SITUS_NETLIFY_ANDA
```

MAZE_FUNCTIONS_PROXY harus origin deployment Netlify Anda sendiri tanpa path/query. Ini hanya proxy Vite lokal untuk Function akun/wallet yang masih dibutuhkan sebelum membuat room; bukan jalur gameplay realtime. Deploy Functions terbaru di situs tersebut terlebih dahulu. Jangan mengarahkannya ke situs pihak lain, karena request akun membawa token pengguna.

Jalankan terminal kedua:

```sh
npm run dev:realtime
```

Buka http://localhost:5173. Pastikan localhost diizinkan pada Firebase Auth. Gunakan dua profil pemain berbeda pada dua browser/session. Profil yang sama pada dua koneksi akan menggantikan koneksi sebelumnya. Buat room baru, join, Siap, lalu mulai. Di Network, gameplay harus tampak pada WebSocket /game; move/ability tidak lagi dikirim ke /.netlify/functions/maze-room. Wallet/voice masih boleh memakai Functions.

localhost di smartphone berarti smartphone tersebut, bukan laptop. Untuk uji dua perangkat lewat internet, gunakan endpoint WSS dengan sertifikat valid dari hosting atau proxy HTTPS yang Anda kelola. Izin mic/Google juga memerlukan konfigurasi origin yang sesuai.

## 2. Deploy backend setelah siap memilih hosting
Gunakan host proses Node.js yang terus aktif atau container, bukan perintah start server pada build frontend Netlify. Source backend ada di realtime/; entry hasil build adalah build/realtime/server.mjs.

Pilihan perintah:
- Build: npm ci --ignore-scripts && npm run build:realtime
- Start: npm run start:realtime
- Port: PORT dari host, default 8080.
- Liveness: /health; WebSocket: /game.
- Host/proxy harus meneruskan WebSocket Upgrade dan menyediakan WSS/TLS.

Opsi Docker dari root source:

```sh
docker build -f realtime/Dockerfile -t maze-hunter-realtime .
docker run --rm -p 8080:8080 --env-file .env.container maze-hunter-realtime
```

Untuk Docker, buat .env.container dengan key yang sama tetapi nilai JSON tanpa tanda kutip luar. Pada secret dashboard hosting, tempel JSON mentah tanpa tanda kutip luar juga; parser env Docker berbeda dari Node --env-file. Jangan commit kedua file credential.

Dockerfile disediakan; image build/deploy pada Docker/hosting belum diuji di lingkungan ini. Container menjalankan user non-root dan tidak memasukkan env credential lokal ke image.

Pasang env backend:
- FIREBASE_SERVICE_ACCOUNT_JSON dan FIREBASE_DATABASE_URL: konfigurasi lama pada server, bukan browser.
- REALTIME_ALLOWED_ORIGINS: daftar origin HTTPS preview/produksi persis, dipisah koma; tanpa wildcard atau slash terakhir. Contoh format: https://HOST-PREVIEW,https://HOST-PRODUKSI.
- REALTIME_MAX_ROOMS=1 untuk awal. Naikkan hanya setelah tes beban pada host yang dipakai.
- PORT: sesuai host.

**Jalankan satu instance/replica saja.** Lock room mencegah dua pemilik, tetapi discovery/routing antarinstance belum dibuat. Autoscaling beberapa replica akan membuat join room gagal pada instance yang salah. Ini belum rilis horizontal scaling.

## 3. Aktifkan pada Netlify preview
Set env **frontend Netlify**:

```env
VITE_REALTIME_URL=wss://HOST-SERVER-ANDA/game
```

Jangan memakai alamat Netlify frontend sebagai endpoint ini. Tambahkan origin preview yang tepat ke REALTIME_ALLOWED_ORIGINS backend, lalu deploy frontend dan Functions dari paket ini bersama. Node realtime dideploy terpisah ke host proses yang terus aktif.

Jika VITE_REALTIME_URL kosong, alur HTTP lama tetap digunakan. Menyalin source saja tidak menyalakan WebSocket. Room HTTP lama dan room realtime tidak dicampur; buat room baru dan perbarui kedua klien.

Rollback: kosongkan VITE_REALTIME_URL lalu redeploy frontend dan gunakan room HTTP baru. Jangan mengubah backend pada pertandingan yang sedang berjalan.

## 4. Data, koneksi, dan hasil
Simulasi ditargetkan 20 tick/s, snapshot sparse 10/s; klien mengirim gerak sampai 20/s sesuai RTT. Tidak ada read Auth/Firestore pada setiap gerakan. Login/profile diverifikasi pada autentikasi socket; token harus diperbarui sebelum kedaluwarsa dan pemeriksaan revocation diulang sekitar 60 detik (heartbeat 15 detik). Ini berbeda dari pemeriksaan revocation per request pada jalur HTTP lama.

Room aktif berada di memori pemilik. Checkpoint RTDB sekitar 2 detik, lease 12 detik. Kehilangan lease menghentikan pemilik lama. Restart tiba-tiba dapat mengembalikan hingga sekitar satu interval checkpoint, lebih lama jika storage terganggu; shutdown normal melakukan flush. Epoch baru membuat klien mereset acknowledgement lama. Jika semua anggota offline lebih dari 60 detik, ronde diakhiri untuk membebaskan kapasitas. Host hanya dapat mulai saat semua anggota online dan Siap.

Hasil akhir dicatat secara idempotent di Firestore **mazeMatchResults/{roomCode}**, dan UI menunggu konfirmasi penyimpanan sebelum menampilkan penyelesaian ronde. Record hasil bukan penggantian otomatis seluruh ekonomi profil lama. Tidak ada database/profile yang direset. Perlu izin server Admin untuk membaca families/profiles/wardrobes, mengelola mazeRooms, dan mencatat mazeMatchResults. Jangan membuka rules client ke publik.

Voice tetap WebRTC dengan konfigurasi/rules/fallback sebelumnya; server baru hanya menangani gameplay dan metadata room yang dibutuhkan voice. TURN bukan pengganti server gameplay.

## 5. Acceptance sebelum publish
Dua akun/perangkat di Wi-Fi dan seluler: join/private/random, ready/start, gerak/putar/lompat, cake/cabe/semangka, penjaga mati, grass reward satu kali, diamond, voice, disconnect/reconnect dan server restart. Uji juga 4/8/10 pemain, p95 tick/latency, CPU/RAM, bandwidth, dan penyimpanan hasil. Rata-rata tick lokal tidak menjamin performa host atau internet.
