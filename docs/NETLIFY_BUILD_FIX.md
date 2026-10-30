# Perbaikan deploy Netlify — 24 Oktober 2026

## Diagnosis dari log yang dikirim

- Instalasi dependency berhasil.
- TypeScript dan build Vite berhasil.
- Bundling `maze-room.ts` berhasil.
- Deploy diblokir pada tahap secret scanning: nilai `VITE_FIREBASE_API_KEY` dan `VITE_FIREBASE_AUTH_DOMAIN` ditemukan di JavaScript browser.
- Peringatan `EBADENGINE` adalah masalah terpisah: Firebase yang terkunci di package-lock membutuhkan Node >=24.12, sementara konfigurasi sebelumnya memilih Node 22.

Konfigurasi Firebase **Web app** memang harus tersedia di browser. Ia berbeda dari service account/private key Admin. Referensi: https://firebase.google.com/docs/projects/api-keys dan https://firebase.google.com/docs/web/learn-more .

## Terapkan

Paket ini adalah delta kecil **di atas `maze-hunter-delta.zip` yang sudah diterapkan**, tetap di branch `maze-1`.

1. Ekstrak dan upload semua file perbaikan, pertahankan direktori relatifnya, termasuk `.nvmrc`, `.github/workflows/ci.yml`, `package.json` dan `package-lock.json`.
2. `netlify.toml` menggunakan Node 24 dan hanya mengecualikan lima nama konfigurasi publik yang digunakan browser melalui `SECRETS_SCAN_OMIT_KEYS`.
3. Jangan menambahkan `FIREBASE_SERVICE_ACCOUNT_JSON`, private key, atau secret lain ke daftar pengecualian. Jangan mematikan pemindai secara global atau mengecualikan seluruh folder `dist`.
4. Pastikan perubahan masuk ke branch/PR yang menghasilkan deploy-preview yang sedang diuji. Log sebelumnya memakai `pull/1/head`, yaitu sumber pull request.
5. Jalankan deploy ulang dari source terbaru. Pada log berikutnya, periksa Node 24, build dan Function bundling berhasil, lalu secret scanning tidak lagi memblokir lima field publik tersebut.

Dokumentasi Netlify untuk pengecualian per nama: https://docs.netlify.com/build/environment-variables/secrets-controller/ . Node 24 didukung untuk builds dan Functions: https://docs.netlify.com/build/functions/configuration/ .

## Environment yang perlu dicek setelah deploy

Daftar environment dalam log belum menampilkan `VITE_FIREBASE_APP_ID`. Ini bukan penyebab kegagalan secret scanning, tetapi dapat membuat login tetap berstatus belum dikonfigurasi setelah deploy berhasil.

| Nama | Isi dan scope |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | apiKey dari Firebase Web app, scope Builds |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain dari Web app, scope Builds |
| `VITE_FIREBASE_PROJECT_ID` | projectId existing, scope Builds |
| `VITE_FIREBASE_APP_ID` | appId Web app, scope Builds; berbeda dari Project ID/Measurement ID |
| `VITE_FIREBASE_DATABASE_URL` | URL Realtime Database actual, scope Builds; diperlukan room |
| `FIREBASE_DATABASE_URL` | URL database yang sama, scope Functions |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account Admin JSON, secret dengan scope Functions; jangan prefix VITE_ |

Pastikan variabel tersedia pada konteks **Deploy previews** yang sedang dipakai. Jangan menyalin seluruh nilai environment ke percakapan. Ambil field publik dari Firebase Console → Project settings → aplikasi Web existing → SDK configuration. Jangan membuat project pengganti.

`VITE_FIREBASE_CLIENT_EMAIL` tidak dipakai aplikasi dan tidak perlu dipasang. Hapus dari konfigurasi browser jika sebelumnya ditambahkan. Email akun layanan bukan pengganti service account JSON untuk backend.

## Verifikasi

- `npm run typecheck`
- `npm run test`
- `npm run validate:levels`
- `npm run build`
- `npm run check:public-env`
- `npm run test:browser` dengan Chromium tersedia

Tes boundary memakai nilai sintetis hanya untuk membangun output sementara, memeriksa bahwa lima field publik tersedia dan variabel lain tidak ikut terbawa, kemudian menghapus build sementara. Ia tidak melakukan login Firebase, tidak menghubungi layanan, dan bukan preview online dengan data palsu.

Deploy nyata, pemindaian Netlify, login Firebase dan multiplayer tetap memerlukan pengujian di akun Anda. Tidak ada commit/push/deploy remote yang dilakukan dalam pengerjaan paket ini.
