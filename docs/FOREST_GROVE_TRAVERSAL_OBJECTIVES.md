# Forest Grove — traversal, objective dan UI

Revisi 3 November 2026. Dasar: source setelah `maze-hunter-forest-grove-environment-hud-delta.zip`, lampiran `Teks yang ditempel (1)(3).txt`, referensi approved dan screenshot bug terbaru. Ketentuan objective/HUD pada dokumen ini menggantikan ketentuan revisi terdahulu. Map lain dan Retro tidak dikembangkan ulang.

## Aturan yang diterapkan

- Forest Grove SOLO / Medium / Map 01 memiliki **3 Diamond utama**, terpisah dari **3 Forest Sigils**. Dua Sigil membuka akses Sanctuary. Boss baru bangkit setelah tiga Diamond, minimal dua Sigil, dan pemain masuk trigger arena yang valid. Area refill di pinggir arena tidak dapat melewati trigger tersebut. Exit dibuka setelah boss kalah.
- Diamond dikumpulkan sekali, disimpan dalam save run, tetap tercatat saat respawn, hilang dari dunia setelah diambil, dan diperlihatkan dalam Petunjuk. Indeks save tidak valid dibuang. Save pilot lama yang masih memiliki boss aktif tanpa syarat baru dikembalikan ke eksplorasi; run lama yang sudah selesai tidak dihapus.
- Permukaan tebing, pohon dunia, pilar/beam reruntuhan, deck jembatan, bibir waterfall, dan props di sekitar pemain didaftarkan pada resolver permukaan pilot. Collider grid tidak dihapus dari state: grid traversal sementara hanya digunakan ketika tinggi kaki/jangkauan memang memungkinkan.
- Step-up, pendaratan saat turun, dan grab/pull-up dibedakan. Pendaratan tidak menarik karakter ke platform sebelum kontak. Kaki dinaikkan melewati bibir sebelum fase gerak maju pull-up. Tangga batu dapat dilalui tanpa animasi hanging. Giant Tree memiliki ruang kepala pada landing.
- Profil jump pilot naik sekitar **1,15 unit**, fase naik **0,34 detik**, turun **0,62 detik**, dengan double jump tetap ada. Profil area lain tetap menggunakan kurva lama. Lompat di permukaan air bisa dipakai untuk keluar; saat masih di kedalaman, tombol Jump mengarahkan ke permukaan dahulu.
- Swim pilot menurunkan badan/kaki ke air; kepala dikoreksi agar mata tetap di atas permukaan. Pengujian posisi rig memeriksa hal ini secara geometris. Dive memakai oksigen **22 detik**, pulih **8 unit/detik** di permukaan. Kehabisan oksigen memakai damage/respawn/checkpoint existing, bukan hanya mengganti ikon.
- Set diver **body + back + face**, yang lolos `permittedAppearance` dari profil pemilik, memberi kapasitas **90 detik**. Kostum lain atau set tidak lengkap tidak memberi bonus tersebut. Kapasitas dari save tidak dapat menaikkan hak equipment saat restore.
- Ring oksigen bersifat kontekstual, bukan banner. Semua angka Diamond, Star, Sigil, Cake, Key dan peti berada di Petunjuk, bukan HUD permanen.
- Settings berisi toggle/volume musik, toggle/volume efek dan sensitivitas. Equipment dipindah ke tab Inventori di Petunjuk. Tab Kontrol memuat binding sebenarnya dan reset kamera. Sapaan memakai ikon SVG dan animasi karakter; tidak menjadi tombol aksi utama kelima.
- Notifikasi yang masih relevan, termasuk checkpoint, menjadi teks sementara kecil di kiri. Aksi ability yang jelas tetap tanpa toast berulang.
- Material tanah/rumput/tebing dibuat sebagai tekstur tileable orisinal mengikuti detail referensi. Gambar bola material yang sudah memiliki pencahayaan tidak ditempel sebagai albedo. Jalan diperbaiki sambungannya, diberi tepi transparan dan diangkat cukup untuk mencegah garis tanah menembusnya.
- Waterfall terdiri dari beberapa ribbon melengkung, upper stream mengikuti puncak tebing, kolam/anak sungai memakai depth field bersama, serta foam/spray ringan. Deck jembatan melintas di atas ravine, tidak lagi mengikuti dasar jurang. Jatuh ke dasar ravine memakai checkpoint, bukan mode berenang.

## Perubahan per file

| File | Perubahan |
|---|---|
| `src/game/forest-rules.ts` | Tuning tunggal oksigen, step-up dan jump pilot. |
| `src/game/forest-traversal.ts` | Resolver pilot, permukaan alami dan props, grid sementara, step/landing/grab/pull-up. |
| `src/game/climbing.ts` | `fromHeight` opsional untuk persistence awal pull-up. Climber area lain dipertahankan. |
| `src/game/actions.ts` | Profil jump forest opsional; kurva default tidak diubah. |
| `src/game/adventure-layout.ts` | Daftar posisi Diamond opsional. |
| `src/game/forest-pilot.ts` | Tiga Diamond, cache pohon deterministik, void dan tributary waterfall, fungsi permukaan bersama. |
| `src/game/adventure-state.ts` | Koleksi/persistence Diamond, boss readiness/trigger, oksigen dan respawn, integrasi permukaan pilot. |
| `src/game/aquatic.ts` | Void bukan area berenang; dasar air tetap satu sumber. |
| `src/game/forest-materials.ts` | Material tileable tanah, rumput dan tebing tanpa unduhan/aset tambahan. |
| `src/game/forest-pilot-world.ts` | Material/UV, jalur bertemu tanpa celah, vegetasi blade, relief tebing, deck, source waterfall/ribbon/spray dan gate di atas permukaan. |
| `src/game/forest-pilot-props.ts` | Headroom Giant Tree dan ukuran log sesuai permukaan interaksi. |
| `src/game/forest-sigil.ts` | Emblem 3D Wind/Stone/Water agar berbeda dari Diamond biru. |
| `src/game/character.ts` | Orientasi kepala saat swim; rig, kostum dan animasi existing dipertahankan. |
| `src/game/modern.ts` | Penyajian Diamond/Sigil, bonus gear yang telah diperiksa, konsumsi landing/jump, swim placement, emote lokal, target minimap dan tampilan shield sesuai state. |
| `src/main.ts` | Equipment effect dari profil yang diperbolehkan; pesan objective pilot dan notifikasi kiri. |
| `src/ui/forest-hud.ts` | Petunjuk bertab, inventory/controls, Settings, quick select, ring oksigen, close/resume. |
| `src/ui/forest-icons.ts` | Artwork sapaan SVG. |
| `src/forest-pilot.css` | Dialog/slider/close scoped, layout koleksi, notifikasi kecil, ring oksigen. |
| `tests/forest-traversal-update.test.ts` | 14 pengujian tambahan untuk aturan baru dan regresi kontak/gerakan. |
| `tests/fixtures/forest-hud.html` | Controller render-only untuk Settings, inventory dan kondisi oxygen, tanpa API/reward produksi. |
| `history.md` | Riwayat yang sama, ditambah revisi ini. |
| Dokumen ini | Handover dan hasil pemeriksaan. |

## Pengujian

**Otomatis:** suite penuh **310 tes / 48 file lulus**. Pemeriksaan terfokus diulang setelah koreksi geometri model. Frontend build dan realtime build lulus. Peringatan Vite tentang chunk besar existing masih ada.

Pengujian baru meliputi:

1. Diamond terpisah, pickup sekali, save/restore dan respawn.
2. Matriks syarat Diamond/Sigil dan trigger arena.
3. Oksigen habis/pulih dan kehilangan satu nyawa lewat respawn existing.
4. Kurva jump lebih tinggi dan fase turun lebih lama, kurva default tetap sama.
5. Step-up/descending landing tanpa forced grab.
6. Permukaan tebing/pohon dan grid navigasi sementara.
7. Void tidak dianggap air.
8. Posisi mata/hip saat swim.
9. Save tidak dapat memberikan kapasitas gear atau Diamond tidak valid.
10. Tangga batu dapat dilewati tanpa hanging.
11. Tidak snap turun sebelum menyentuh platform.
12. Kaki melewati bibir setelah berada di atas platform.
13. Headroom Giant Tree.
14. Refill tepi arena tidak memicu boss terlalu dini atau melewati perlindungan cinematic.

**Browser / viewport**, menggunakan CSS aplikasi dan AdventureState asli pada fixture HUD, controller interaksi render-only:

| Simulasi | Ukuran | Hasil |
|---|---|---|
| HP portrait | 390 × 844 | Settings 354 × 250 area isi, scrollWidth/Height sama dengan clientWidth/Height; close terpisah, tanpa equipment di Settings. |
| HP landscape | 844 × 390 | Settings tanpa overflow; Help tanpa overflow; empat tombol terpisah, Ability bar 218 × 62 tidak menimpa Jump/joystick/boss. |
| Tablet | 1024 × 768 | Help 532 × 285 area isi tanpa overflow; tab Inventori, pemilihan warna cake, Sapaan, close dan pembukaan ability kembali berjalan pada controller fixture. |
| Laptop | 1366 × 768 | Settings 532 × 227 area isi tanpa overflow; kontrol pointer tidak mendominasi. |

Toggle musik diuji mematikan slider musik tanpa mematikan efek suara. Ring oksigen muncul dengan nilai aksesibilitas 50% pada kondisi fixture dive. HUD normal tidak memuat progres koleksi permanen. Pemeriksaan viewport bukan uji multi-touch native atau perangkat fisik.

**Geometri:** scene builder browser menghasilkan 189 mesh, 85.279 triangle sumber, nol nilai tidak valid, gate berubah setelah dua Sigil. Hitungan ini tidak mengalikan instance dan bukan FPS.

## Kamera dan batas verifikasi

Blok input kamera per frame, target, orbit, follow dan framing normal dibandingkan dengan source paket sebelumnya dan tetap sama. Tidak ada pergantian sistem kamera gameplay dalam revisi ini. Trigger cinematic tetap menggunakan waktu kebangkitan existing; kamera cinematic terpisah dari revisi sebelumnya dipertahankan.

Percobaan renderer aktual kembali gagal: `THREE.WebGLRenderer: Error creating WebGL context`. Karena itu, tampilan 3D akhir, kualitas visual yang setara artwork approved, kenyamanan gerakan, seluruh sudut kamera, dan performa HP **belum dapat dinyatakan terverifikasi**. Implementasi dan pengujian geometri tidak menggantikan pemeriksaan visual tersebut. Bug kamera gameplay yang sudah dilaporkan tetap pekerjaan kamera terpisah sesuai larangan prompt ini.

Belum dilakukan sesi Online dua perangkat, mic fisik, atau pengujian multi-touch native. Map pilot masih SOLO; Online memakai layout/protokol existing dan diuji melalui suite regresi, bukan dipindahkan ke map pilot secara diam-diam. Tidak ada deployment atau perubahan akun produksi.

## Penerapan

Timpa file dengan struktur path asli pada source yang sudah menerima paket environment/HUD sebelumnya. Tidak perlu mengisi environment baru. Tidak ada kredensial, bank soal, `node_modules`, `dist`, atau output build dalam ZIP ini.

Deploy preview frontend seperti biasa. Untuk menyamakan server lokal, di PowerShell 1 hentikan proses, jalankan `npm.cmd run build:realtime`, lalu `npm.cmd run start:realtime:local`. PowerShell 2 cloudflared dapat tetap berjalan agar URL tidak berubah.
