# Setup terkini

Baca `UPDATE_INSTRUCTIONS.md` pada root untuk paket Terrain & Online yang berlaku saat ini. Paket ini melanjutkan delta 49 file sebelumnya; source lengkap disertakan sebagai cadangan.

Konfigurasi memakai Firebase project existing. `.env.example` memuat seluruh nama variabel frontend/server yang diperlukan. Tidak ada kredensial dalam paket. Frontend dan Functions harus di-deploy bersama. Firestore Rules catatan Adventure sudah mendukung 320 kombinasi area/kesulitan/peta.

Laporan verifikasi terbaru ada di `docs/QA_CURRENT.md` dan `docs/TEST_RESULTS.txt`. Tidak ada klaim pengujian Online produksi atau render 3D terbaru di browser tanpa WebGL.
