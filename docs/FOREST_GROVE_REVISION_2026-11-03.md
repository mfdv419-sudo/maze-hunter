# Forest Grove — koreksi lingkungan, HUD, dan cinematic

Dasar: source Forest Grove pilot terakhir, `Forest_Grove_Final(1).zip` sebagai acuan, empat screenshot kondisi salah, dan `Teks yang ditempel (1)(2).txt`. Revisi ini ditimpa ke source yang sudah menerima paket Forest Grove pilot. Bukan paket source lengkap.

## Batas perubahan

Pilot tetap SOLO / Forest / Medium / Map 01. Map lain, bank 2.000 soal, alur Retro, autentikasi, ekonomi, dan protokol multiplayer dipertahankan. Bentuk dasar karakter diperhalus untuk semua pemakai model yang sama. Cutscene khusus boss menggunakan waktu kebangkitan server yang sudah ada, termasuk Online. Kamera gameplay tidak diganti: blok orbit/follow/input per frame dibandingkan byte-for-byte dengan sumber awal revisi dan tetap sama. Kamera cinematic terpisah; perubahan renderer memilih kamera tersebut hanya saat cutscene.

## Perubahan per file

| File | Perubahan |
|---|---|
| `src/game/forest-pilot.ts` | Kontur bukit/lereng, dasar kolam dan kanal bersama renderer/physics, tinggi tebing, tujuh patroli termasuk pasangan penjaga objective, tiga undakan batu menuju Green Cliffs. |
| `src/game/forest-pilot-world.ts` | Permukaan tebing menyambung per chunk, tanah berkontur, jalur tanah berkelok mengikuti permukaan, pohon instanced, vegetasi lantai hutan, deck mengikuti arah jalur dan tinggi tanah, reruntuhan/rune, air berdasarkan depth field, waterfall bervolume, buih, arena berumput dengan ring kecil. Canopy duplikat dan cakram pink besar dihapus. |
| `src/game/forest-pilot-props.ts` | Model pohon panjat, log panjang, batu berfaset dan undakan mengikuti dimensi interaksi; tidak menambahkan canopy raksasa kedua. |
| `src/game/biome-walls.ts` | Tinggi collision kamera tebing pilot mengambil fungsi tinggi permukaan visual yang sama. Algoritme kamera tidak berubah. |
| `src/game/adventure-state.ts` | Radius tubuh pilot diperbesar; clearance pilar mencakup tubuh; gerakan penjaga pilot disubstep dan memeriksa pilar/trunk/boulder agar tidak menembus. |
| `src/game/character.ts` | Kepala/muzzle lebih lembut dan proporsional, kumis lebih pendek. Rig, kostum, animasi dan skala gameplay dipertahankan. |
| `src/ui/forest-icons.ts` | SVG orisinal untuk merge, ability, jump, item, rune, dive, lift dan throw; bukan huruf/emoji pada empat tombol aksi. |
| `src/ui/forest-hud.ts` | Empat tombol tetap, SVG konteks, quick select horizontal, progres ringkas, shortcut kompatibel dan petunjuknya, kontrol dinonaktifkan ketika peta diperbesar. |
| `src/forest-pilot.css` | Override scoped untuk mengatasi CSS presentasi lama; tiga tombol satu warna, Jump dibedakan, ukuran berdasarkan viewport, boss kecil kiri, progres kanan di bawah minimap; peta expanded tetap berfungsi. |
| `src/main.ts` | Toast besar ability/merge/lift tidak ditampilkan pada pilot; efek visual, stok, damage dan reward tetap melalui mekanisme existing. |
| `src/game/awakening.ts` | Timeline low angle → dolly keluar dan naik → orbit → final reveal. Durasi server tetap enam detik. |
| `src/game/modern.ts` | Kamera cinematic terpisah, sudut orbit benar-benar digunakan, cue debu/impact/roar berbasis waktu, model boss menghadap reveal, pemasangan props pilot. Kamera gameplay tidak ditulis oleh cutscene. |
| `src/game/dormant-boss.ts` | Fragmen kayu untuk boss akar; boss batu tetap menggunakan batu. |
| `src/game/forest-guardian.ts` | Nama mesh mulut untuk ekspresi roar. |
| `src/game/biome-guardian.ts` | Mulut terbuka saat cue roar dan kembali normal sesudahnya. |
| `tests/polish-gameplay.test.ts` | Ekspektasi dolly masuk lama diganti dolly keluar sesuai instruksi baru. |
| `tests/forest-revision.test.ts` | Depth air/terrain, geometri finite, instancing, collision gerakan cepat, patroli objective dan timeline cinematic. |
| `tests/fixtures/forest-hud.html` | Fixture HUD asli dengan kondisi boss; controller render-only, tidak melakukan reward/API produksi. |
| `tests/fixtures/forest-hud-layout.html` | Matriks viewport HP portrait/landscape, tablet dan laptop. |
| `tests/fixtures/forest-render.html` | Percobaan renderer 3D aktual dan pelaporan kegagalan WebGL; bukan gameplay simulator. |
| `history.md` | Catatan revisi ini ditambahkan ke riwayat yang sama. |
| Dokumen ini | Handover, hasil pengujian, batas dan cara penerapan. |

## Shortcut yang dipertahankan

WASD/panah bergerak; Space lompat; J/B aksi; V menyelam; Q/E putar kamera; R/F pitch. Tambahan: 1 Cake, 2 Chili, 3 Spinach, 4 Watermelon; X Merge; C Ability bar; M peta. Binding Q/E/R/F/V lama sengaja tidak ditimpa oleh alternatif pada prompt. Semua shortcut tambahan diabaikan ketika input teks/chat, modal, pause atau awakening aktif. Online chat/voice mengikuti UI dan binding existing; V tidak dipakai ulang untuk mic karena sudah berfungsi sebagai dive. Tidak ditemukan tombol emote khusus existing pada source ini, sehingga tidak dibuat tombol utama kelima.

## Pengujian

- Suite penuh: **296 tes / 47 file lulus**. Meliputi progression, traversal, Retro, room actions, combat, voice/chat dan kamera existing. Setelah penambahan tiga undakan, tes pilot dan revisi dijalankan lagi.
- Build frontend: `npm run build` lulus. Peringatan chunk besar existing masih ada.
- Build realtime: `npm run build:realtime` lulus.
- Scene builder browser: 182 mesh, 70.531 triangle sumber, nol nilai geometri tidak valid; gate tertutup → terbuka pada dua Sigil. Hitungan ini tidak mengalikan setiap instance dan bukan pengukuran FPS.
- Renderer aktual dicoba: **gagal membuat WebGL context** pada browser QA. Tidak mengklaim scene 3D, pencahayaan, kualitas model atau animasi boss telah disetujui secara visual.

| Perangkat simulasi | Ukuran | Hasil yang diperiksa |
|---|---|---|
| HP portrait | 390 × 844 | Empat tombol terlihat dan terpisah; HUD ringkas. |
| HP landscape | 844 × 390 | Empat tombol tidak overlap; Ability bar horizontal 218 × 62; boss meter 210 × 43 di kiri; Help 532 × 276 tanpa scroll. |
| Tablet | 1024 × 768 | Empat tombol dan boss meter berada di dalam viewport. Browser QA memiliki pointer mouse; bukan simulasi perangkat sentuh fisik. |
| Laptop | 1366 × 768 | Tombol diperkecil untuk pointer fine, boss meter ringkas dan minimap terpisah. |

## Batas yang masih perlu pemeriksaan di perangkat

1. Screenshot kamera masuk ke kepala karakter **belum diperbaiki**: prompt ini secara eksplisit melarang perubahan kamera gameplay. Kamera tersebut dipertahankan, bukan dinyatakan sudah benar.
2. Kesamaan visual dengan referensi, kerapatan vegetasi yang nyaman, sudut cinematic bebas halangan sepanjang orbit, serta FPS/suhu HP belum dapat diverifikasi karena WebGL QA tidak tersedia. Geometri dan logika saja tidak membuktikan hasil visual final.
3. Tidak dilakukan sesi Online dua perangkat, uji mic fisik, multi-touch native, atau deployment produksi. Trigger kebangkitan memakai state existing; hasil transport yang sebenarnya belum diverifikasi di server pengguna.
4. Jalur, pohon, batu dan undakan menggunakan aset prosedural 3D; tidak ada klaim identik dengan artwork referensi.

## Penerapan

Ekstrak dengan struktur path asli dan timpa source proyek yang sudah memakai paket Forest Grove pilot terakhir. Commit file source, kemudian deploy preview Netlify untuk pemeriksaan. Tidak ada environment baru, kredensial, file build, node_modules, dist atau bank soal dalam ZIP ini.

Untuk menyamakan server lokal dengan source terbaru, hentikan PowerShell 1, jalankan `npm.cmd run build:realtime`, lalu `npm.cmd run start:realtime:local`. PowerShell 2 cloudflared tetap berjalan agar URL tunnel tidak berubah. Frontend menjalankan build Netlify seperti biasa. Perubahan map pilot ini tetap SOLO; tidak mengaktifkan map pilot untuk room Online.
