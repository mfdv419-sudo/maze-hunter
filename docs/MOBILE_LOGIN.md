# Google login pada smartphone / deploy preview
Login Google di browser belum tentu menjadi sesi Firebase game pada origin preview. Perbaikan menyimpan pilihan Adventure/Retro selama 15 menit, menunggu pemulihan auth, melanjutkan pilihan setelah profil tersedia, dan menerima observer auth ketika popup sudah berhasil tetapi promise belum kembali. Satu profil otomatis dipilih; beberapa profil tetap meminta pilihan.

## Alur default
Deploy frontend dan Functions bersama, gunakan HTTPS, tambahkan hostname preview persis ke Firebase Authentication > Settings > Authorized domains. Buka preview langsung di Chrome/Safari, bukan browser dalam aplikasi. Pilih Adventure dan selesaikan popup Google. Mode seharusnya dilanjutkan tanpa kembali diam di Home. Flag redirect tetap false secara default.

## Pemulihan redirect opsional (urutan penting)
1. Gunakan project Firebase yang sudah ada, jangan membuat database/project baru.
2. Pada Firebase Authentication > Settings > Authorized domains tambahkan hostname preview dan produksi yang benar-benar digunakan. Preview tidak harus dipublish ke produksi.
3. Pada Google Cloud Console > APIs & Services > Credentials, OAuth Web client milik Firebase yang sama: tambahkan Authorized redirect URI `https://<HOST>/__/auth/handler` untuk setiap hostname tersebut.
4. netlify.toml dalam paket sudah menyediakan proxy transparan HTTP 200 untuk /__/auth/* dan /__/firebase/init.json ke project maze-hunter-e362b. Pertahankan aturan sebelum fallback SPA; jangan menggantinya dengan redirect 302.
5. Baru set Netlify environment `VITE_FIREBASE_AUTH_SAME_ORIGIN=true`, pada context preview/production yang sesuai, lalu redeploy. Flag ini mengubah authDomain ke host saat ini dan menyediakan tombol pemulihan masuk di halaman yang sama.
6. Uji tab incognito smartphone tanpa sesi game lama: Adventure → Google → profil → Adventure. Uji juga batal masuk, retry, refresh, akun lain, dan Retro.

Hostname deploy preview berubah antar PR; setiap hostname yang digunakan perlu diizinkan. Jangan memasukkan FIREBASE_SERVICE_ACCOUNT_JSON ke variabel VITE atau browser. Perbaikan kode telah diuji dengan SDK mock; Google OAuth pada smartphone fisik dan konfigurasi console Anda belum diuji dari lingkungan ini.

Referensi: https://firebase.google.com/docs/auth/web/redirect-best-practices
