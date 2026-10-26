# Changelog

## Online movement, viewport lobby and room chat

- Fixed online spawn initialization: both rendered and simulated positions restore the member's authoritative starting state before the first frame, including distinct starts and reconnect sequence numbers.
- Added own-sequence movement acknowledgement tracking. Teammate snapshots preserve pending local motion; rejected paths and real respawns still correct from the server. Prediction is bounded during slow requests; late responses cannot resurrect departed rooms. Local movement prediction no longer simulates authoritative damage, pickups, rewards or checkpoint resets. Projectile motion remains visual; actual hits stay server-owned.
- Fixed detached dialog progress references causing the screenshot error “Cannot set properties of null (setting hidden)”. Added generation guards for obsolete game callbacks and a lobby leave-confirmation layer.
- Replaced the vertical lobby with a dedicated viewport layout: fixed 4/8/10 slot grid, visible host/ready state, copyable room code, anchored separated footer actions and inline errors. Browser checked ten slots at 844×390 and 740×360; all footer buttons remained inside the frame. HUD metadata now flows in one spaced stack instead of overlapping absolute boxes.
- Added authenticated room text chat and four quick phrases, available in lobby and match. Thirty-message history, 180 characters, one send per second and duplicate-ID protection. Sender identity comes from membership. Text is rendered as textContent; typing does not move or attack. No microphone or live voice feature is included.
- Unified Classic cake refill at +1 per two-second tick, including individual Co-op members. Super charges never auto-refill. Shared-world keeper kills credit the firing member's Classic supplies. Plant +2, seal +2, keeper +3 and chest refill behavior is preserved; chests also replenish super charges.
- 134 tests / 22 files and TypeScript pass. Concurrent movement tests exercise the actual runtime sync method with two simulated clients against authoritative Race and Co-op simulation. Handler tests cover authenticated chat. Browser UI fixture sends local-only chat and verifies viewport bounds; no live Firebase messages were sent. Production build and Function bundle verified during release packaging. Live two-device Firebase sessions and WebGL gameplay remain unverified in this environment.
- Delta baseline: the delivered 42-file Terrain & Online update. No new environment variables, Firestore rules or RTDB rules; deploy frontend and Function together.

## Terrain & Online — continued from the delivered 49-file update

- Replaced remaining non-sample biome hedge blocks with high continuous native wall geometry: forest root/earth buttresses, sandstone strata, mountain crags/snow, limestone coast, reef fingers, and volcanic basalt. Heights are relative to terrain and comparable to the accepted canyon; camera collision uses the same wall-top function. Static silhouette details are batched.
- Added Easy (smaller map, more time, weaker quest keepers/boss, longer warnings) and Gunung Bara / Ember Volcano across selection, server validation, map cycle, records and co-op capacity. Existing Retro catalogue and original Solo/Forest authored routes remain preserved.
- Added reachable climbable trees, logs, rocks and broken cart/aircraft/ship props with first-climb coin rewards. Additional patrols spawn at route bends beyond seal sites. Added deterministic warned environmental hazards: falling rocks, tumbleweed, rolling logs, coastal waves, floating/submerged trash and volcanic embers. Contact costs a heart and returns to the last checkpoint; warnings and escape routes allow avoidance. Canyon bridge edges now fall to a checkpoint; shields do not cancel a fall.
- Sea arena is submerged, its dry arena disc is removed, the dormant monument rests on the seabed and the reef ray follows swimming depth. Gorge crab/stone and desert skink/sphinx have verified distinct rigs.
- Added selected red/yellow/green super cakes with limited stock, chest refills, colored projectiles/icing, 2 damage/stun/slow effects, save restore and authoritative multiplayer selection.
- Fixed room transactions aborting when RTDB first presents an empty local cache. Join and random matching now allow the authoritative retry and reject null-room results. Strict profile sync and HTTP/server errors are visible inline; actions have busy protection and timeouts. Online dialog has consistent 48px controls, spacing and responsive action/code grids.
- 124 tests across 20 files pass, including six Function-handler tests with controlled Firebase services. Production frontend and Node Function bundling pass. Browser observed the shipped Online markup/layout and Easy/Volcano menu. Live Firebase multi-device sessions, physical phones and new 3D visual render remain unverified because the available browser cannot create WebGL contexts. No previous render-test count is reused.
- Firestore adventure-record limit increases from 210 to 320 for eight areas × four difficulties × ten maps. Existing database identities and data are retained. Existing required online environment fields are now documented completely; no credentials are included.

## 2026-10-26 — Six biome identities, family quests, personal Race and wardrobe redemption

- Continued the uploaded maze-1 source and recovered saved work. Preserved original Solo routes, authored Forest layout, existing account progress, timers and map/life rules.
- Six biome scene identities, landmark illustrations, distinct enemy rigs and dormant boss monuments; Verdant Gorge has green cliff shelves. Desktop click-once free look with Escape release and optional drag mode; touch controls remain separate.
- Each of three quest regions requires 3 large and 2 small keepers. Co-op uses 3 times the starting roster, one shared enemy/world simulation, contribution credit and scaled shared boss health, without friendly fire. Race has three private seals and a private boss/escape. Disconnects retain the initial target; remaining members can collect every team seal.
- High terrace rewards require a real double jump and pull-up. Ground-level collection cannot claim elevated stars. Other ledges and palms retain their own interactions.
- Independent gloves and boots plus forest/climber/desert/diver gear. Retro achievement stars remain unchanged when spending the wardrobe balance. Server-owned transactional receipts prevent repeat charges and concurrent overspending; legacy unlocks are migrated.
- Every Retro level has its own illustrated destination; area cards have distinct compositions. Regenerated 170 of 176 catalogue maps, including repacked four-choice templates and endpoint-biased wrong paths. Counts, exact 40/36 lengths and at least 95% density remain verified. Wrong-tip mean Manhattan distance to the next goal fell from 10.51 to 9.21 cells. This is a layout improvement, not proof of subjective difficulty.
- Validation: 110 tests / 18 files pass. TypeScript, production frontend build and Netlify function bundle pass. Browser UI checked Home fallback, area navigation, illustrated level selection, Retro canvas and pause. WebGL is disabled in the available browser, so fresh 3D screenshots, physical-phone performance and live Firebase multi-device play are NOT verified.
- Deployment includes updated firestore.rules for appearance slots and a server-owned wardrobe receipt collection. No new environment variables. Deploy rules and frontend/functions together; see UPDATE_INSTRUCTIONS.md.

## 2026-10-26 — Ngarai visual example and readable phone Retro

- Retro now fits the actual board with one proportional cell scale. Early mazes grow substantially on phones; dense boards begin at a readable enlarged view, retain free pan/lift, and have a full-map button beside zoom. Darker continuous walls and proportional mascot/finish icons remove the previous thin highlight noise. The catalogue, branch counts, exact 90% arm ratio, lives, timers and map transitions are unchanged. Deceptive route design remains pending.
- Ngarai replaces recolored hedge blocks with continuous sculpted, layered cliffs, real shared terrain terraces, a shallow flowing channel, walkable bridge and bank approaches, cave arch, stone arch, scree, wispy sky and an open boss clearing. Cliff geometry is partitioned spatially for culling. Cave/terrain/cliff collision shortens the camera without forcing an overhead view. The smoothed camera arm is checked again to avoid cutting through geometry.
- Added original animated Ketam Tebing and Raja Batu Retak models, with articulated legs/claws/arms, idle movement, anticipation and hit reactions. The King moves, keeps room around its larger body, charges without overlapping the target, warns of slams/falling rocks, opens recovery windows and retains cake refill. Falling rocks use a distinct warning and impact visual; canyon quests explain the landmarks and enemy.
- Only Ngarai receives the new biome treatment in this stage. Other approved biome directions remain in `docs/VISUAL_GUIDE.md`. Original Solo, protected authored Forest and the Retro catalogue are byte-preserved. No new environment variables, Firebase rules, dependencies or removals. Rebuild frontend and Netlify functions together for the new rockfall hazard.
- Validation: 100 logic tests pass across 17 test files. 22 distinct targeted browser scenarios pass across the verification runs, including real menu launch, canyon render/camera/boss, proportional Retro trace/zoom/map transitions/rotation, other area regressions, phone HUD and production offline reload. Frontend production build and the Netlify room bundle pass. The final charge motion is also checked for gradual simulation movement and deterministic save/resume. No physical Android/iOS performance or production multi-client verification is claimed.

## 2026-10-26 — Presentation, aquatic exploration and source consolidation

- Restored natural Retro board proportions: every cell is square and uses the same viewport scale across levels. Small boards remain small; zoom is explicit.
- Replaced the sole Retro catalogue with 176 unique maps for levels 5–100, each occupying at least 95% of its logical room grid. Every correct stage is 40 steps and every failed branch is 36, with the agreed choice sequence, map count, entry countdown and shared lives/time retained. Compact junction clusters support four/five exits without adding unrelated branches. No standalone linking corridor, fog or solution overlay.
- Replaced green interface panels with navy, ivory and champagne surfaces. Adventure setup uses measured layout rows, two primary actions (Solo/Online), seven area choices, actual game preview and ID/EN guidance. Removed the separate Forest Sample player action; original Solo routes and authored Forest source remain intact.
- Added shared sea/coast depth simulation, island beaches, gradual dive/surface control (V or touch button), depth-gated underwater treasure, water-column projectiles, swimming poses, a trailing flexible tail, underwater tint/bubbles and coconut-palm climbs. Server snapshots and room actions carry swimming depth; cosmetic peer elevation follows terrain.
- Renamed revision-based tests and removed superseded catalogues/generators. Optional maze authoring uses one Python driver, a C++ packing helper and a compact template cache; production builds use the supplied JSON without requiring Python/C++.
- Consolidated historical notes into this file. README, setup and project brief remain operational documents. Build cleanup removes only the 53 recorded obsolete files, validates their content first and tolerates unchanged Windows line endings. Browser screenshots now use portable test-results paths.
- Validation: 95 logic tests pass; 16 distinct targeted browser scenarios pass across the verification runs; frontend production build and Netlify room bundle pass. Catalogue regeneration is deterministic with the retained templates. Applying the changed-files archive to the previous source and running cleanup is checked for byte parity.
- Deployment: rebuild frontend and Netlify functions together. No new environment variables, Firebase Auth settings or rule changes. Publish the previously delivered rules if not already applied.
- Limits: physical Android/iOS performance and a real ten-client production match remain unverified. Swimming is surface movement plus controllable depth, with automatic ascent on leaving deep water; there is no oxygen-survival mechanic. Existing billing/store release work remains outside this update.

## Archived development history


---

# Pemeriksaan login Google — 24 Oktober 2026

Paket kecil ini dipasang SETELAH maze-hunter-game-ui-delta.zip pada branch maze-1.
Timpa file dengan jalur yang sama. Tidak ada file yang perlu dihapus.
Tidak ada perubahan rules, kredensial, konfigurasi Firebase, karakter, atau deployment otomatis.

Dari screenshot pengguna: Google provider Enabled dan domain
`deploy-preview-1--maze-hunter.netlify.app` sudah ada dalam Authorized domains.
Penyebab tab Google menutup sendiri belum terbukti; jangan mengubah rules untuk menebak penyebab OAuth.

Perubahan:
- Kesalahan login menampilkan kode Firebase yang aman dan petunjuk ID/EN.
- Pesan tetap terlihat sampai ditutup, sehingga dapat difoto di tablet/HP.
- Respons provider, token, dan kredensial tidak ditampilkan.
- Login dimulai langsung dari handler klik. Tombol menunggu hasil dan bisa dicoba ulang.
- Satu proses popup dipakai bersama jika ada permintaan login saat proses sebelumnya masih berjalan.
- Akses profil Firestore yang ditolak dibedakan dari kegagalan login Google.

Cara menggunakan:
1. Upload isi ZIP ke branch maze-1, pertahankan struktur folder.
2. Tunggu Netlify selesai build. Muat ulang halaman game agar versi terbaru aktif.
3. Tekan Play satu kali. Bila gagal, ambil screenshot panel kode error.
4. Bila akun muncul di Firebase Authentication > Users tetapi profil gagal dimuat,
   periksa kode Firestore yang ditampilkan, bukan hanya konfigurasi OAuth.

Validasi lokal: typecheck, production build, 23 unit tests, dan browser suite.
Browser test mensimulasikan browser menolak popup, bukan akun/login berhasil.
Login Google asli, konfigurasi Firebase yang efektif pada deploy Netlify, dan
perangkat Android pengguna belum terverifikasi. Paket ini memperbaiki visibilitas
kegagalan dan pengendalian permintaan; belum menjamin penyebab login live selesai.


---

# Maze Hunter — verification report

Date: 2026-10-23. Baseline: uploaded `maze-hunter-maze-1.zip`.
Status: **first playable browser implementation; final release gate not met**.

## Baseline evidence

All entries in the uploaded `maze-1` and `maze-hunter-modern-hidden-maze` archives were byte-identical after stripping their outer directory names. `main` differs mainly in CI and the previously fixed source typing/API calls. The old runtime is combat/shard based; Retro was only a palette switch; fog affected only the minimap; online Auth/Firestore/rooms were absent.

Before the new implementation, dependency installation, typecheck, three legacy unit tests, level validation and production build all completed successfully in this environment. Successful baseline build did not establish compliance with the new gameplay design.

## Executed checks

| Check | Result | Evidence/scope |
| --- | --- | --- |
| `npm run typecheck` | PASS | Strict TypeScript including frontend and Netlify function source |
| `npm run test` | PASS | 17 tests across levels, gameplay/progress and authoritative room reducers |
| `npm run validate:levels` | PASS | Four level suites: all 100 Retro layouts unique, deterministic and solvable; 10 regions; distinct fair Modern entrances across 60 generated scenarios; ordered difficulty sizes/vision |
| `npm run build` | PASS | Vite production output generated with lazy game/engine chunks and versioned service worker |
| Netlify function bundling | PASS | `maze-room.ts` bundled for Node with esbuild; not a deployed Firebase invocation |
| `npm run test:browser` | PASS | Five Playwright Chromium tests, including production offline asset cache |
| Visual review | PASS for inspected layouts | Desktop 1360×900, phone portrait 390×844 and landscape 844×390, rendered screenshots inspected internally |
| Delta reconstruction | PASS | ZIP checked for corruption; delta plus explicit deletions reproduces the final source tree byte for byte |

### Browser test scope

1. Google login gate and ID/English menu switching; no simulated production account.
2. Actual Retro mouse playthrough, lifting/regrabbing, real star result and next-level unlock.
3. Modern 3D canvas, keyboard input exercise, resize, pause/resume and no page runtime errors.
4. Phone touch events via Chromium DevTools Protocol: one wall penalty per gesture, lift/regrab, orientation change preserving lives, then completing the valid path with the expected two-star score. Canvas dimensions are checked before continuing after rotation.
5. Built production excludes the local control lab; service-worker cache contains Retro/Phaser assets and production UI reloads without network.

The browser tests do not log in as a Google user. They use a separately labeled development-only control lab to exercise gameplay. That lab does not exist in the production build and does not simulate Firebase or online multiplayer.

### Pure logic test scope

- Sliding along walls, preventing tunneling, line-of-sight obstruction.
- Retro pause, timer/life exhaustion, invalid path rejection, honest rating and clean new session.
- Progress merge preserving best time/stars and sequential unlock across missing levels.
- Four-player room capacity, host/ready conditions, movement validation and replay rejection.
- Race winner cannot be overwritten; Co-op requires all players; leave ends the match without invented victory.

### Issues found and resolved during testing/review

- Two Retro layouts initially duplicated; deterministic regional selection now rejects duplicates and sorts by route length.
- Production offline reload initially failed to match cached module responses with differing `Vary` request headers. Static assets are now matched from the current named cache by their allowlisted path with `ignoreVary`; the offline regression test passes.
- Rotation could race Phaser's delayed resize. The Retro host now has a ResizeObserver, and the touch regression waits for matching canvas/host dimensions before continuing.
- Near walls obscured a small Modern character. Camera framing and character scale were adjusted; near-camera walls lower for readability.
- Timer accumulation uses elapsed time, separately from capped movement integration. Failure no longer selects a victory animation.

## Not verified / unfinished

| Area | Actual status |
| --- | --- |
| Google sign-in against the owner's project | NOT VERIFIED — real web app configuration/authorized domains were not supplied |
| Family cloud save, account switching and authenticated offline resume | NOT VERIFIED against live Firebase; source/rules/local merge logic included |
| Race/Co-op with 2–4 independently connected users | NOT VERIFIED — client, server function and rules included, but no real Firebase backend/session credentials were available |
| Room security rules in a Firebase emulator or production | NOT VERIFIED — must be checked with the owner's actual rule set; do not overwrite unrelated project rules |
| Netlify deploy/remote GitHub Actions | NOT VERIFIED — no remote branch changes or deployment performed |
| Real ad serving/frequency callbacks | NOT VERIFIED — placement adapter included; publisher account approval/configuration absent |
| Subscription checkout, recurring billing, paid costume ownership/restoration | NOT IMPLEMENTED — provider/prices/commercial terms not selected; no simulated purchase buttons |
| Physical Android/iPhone performance and Safari/iOS browser behavior | NOT VERIFIED — headless Chromium/mobile viewport tests do not prove physical-device performance |
| Full family playtesting of all 100 levels | NOT VERIFIED — all layouts validated algorithmically; human difficulty and comfort require review |
| Final character polish, additional animal roster and production audio | PARTIAL — procedural animated binturong, four looks and simple sound controls implemented |
| Google Play/App Store build and publication | DEFERRED until final browser acceptance |

## Build observations

The production build reports large vendor chunks. Approximate engine bundle gzip sizes: Phaser 340 kB, Three.js 130 kB, Firebase 215 kB. Engine bundles are split; offline preparation intentionally caches the game modules. No runtime model downloads, detailed fur textures or external image packs are required for the procedural character.

Tests ran on Node 24 in this execution environment; the original Netlify/CI configuration targeted Node 22 (corrected to Node 24 by the 2026-10-24 fix below). Chromium 153 was used through an existing executable path after the default browser CDN download returned an invalid archive in this environment. The project itself supports normal Playwright browser installation and does not depend on that local executable path.

No source credentials, generated build output, node_modules, browser binaries or internal screenshots are included in the deliverable ZIP.


## Netlify deploy correction — 2026-10-24

The supplied Netlify deploy log shows TypeScript/Vite and Function bundling succeeded; deployment then failed because the secret scanner matched the two public Firebase browser configuration values. It also showed Firebase packages requiring Node >=24.12 under a Node 22 build. That runtime configuration in the earlier package was incorrect.

Changes: Node 24 in Netlify, CI and .nvmrc; package/lockfile minimum Node >=24.12 <25; secret scanning remains enabled with only five explicitly public Firebase web keys omitted; Firebase source reads only its required fields instead of serializing import.meta.env; a production bundling regression checks unrelated/server values stay out of frontend output.

Reverification on Node 24.22.1:

| Check | Result |
| --- | --- |
| npm ci --engine-strict --ignore-scripts --no-audit --no-fund | PASS; no EBADENGINE mismatch |
| npm run typecheck | PASS |
| npm run test | PASS — 17 tests |
| npm run validate:levels | PASS — four suites |
| npm run build | PASS |
| npm run check:public-env | PASS — five public fields retained, unused VITE values and server marker excluded |
| npm run test:browser | PASS — five Chromium tests |
| Netlify configuration and delta archive validation | PASS locally |
| New Netlify deployment and its real secret scanner | NOT VERIFIED — no remote account mutation/deploy performed |
| Google authentication/room services | NOT VERIFIED against owner's Firebase project |

The failed deploy's listed environment did not include VITE_FIREBASE_APP_ID; the owner must confirm it in the deploy-preview build context. It is required for client initialization but is distinct from the secret-scanning failure. No real secret value appeared in the supplied log, and none was requested or inserted into the fix.


## Game UI, mascot and touch action revision — 2026-10-24

Implemented a 3D title scene, self-hosted Fredoka game typography, game buttons/HUD, original binturong snout/whisker/ear/tail geometry, removal of home admin copy, blue A jump and red B optional shrub-clearing controls. Modern game navigation no longer reserves a website header. Owner-supplied public Firebase Web app configuration is used as a fallback, without service account credentials or automatic Analytics initialization.

Checks: strict typecheck PASS; 20 unit tests PASS (including three action tests); level validation PASS; production build PASS; public-env bundle boundary check PASS; six Chromium browser tests PASS. The added browser test checks the 3D title canvas, absence of Firebase/family admin home text, and simultaneous touch joystick + jump plus the hit button. Offline regression now verifies the local font is cached too. The hit feedback initially depended on a throttled HUD callback; it is now updated directly on input and each frame.

Visual review: desktop 1366x768, phone portrait 390x844, tablet 1024x768; the title/mascot/controls were inspected in rendered screenshots. Phone title layout reports no horizontal overflow. Screenshots are internal QA artifacts, not included in the source deliverable. Physical-device performance, real Google sign-in, multiplayer action synchronization, subscriptions, payments and real ad serving remain NOT VERIFIED/unfinished as described above.


---

# Tampilan game dan kontrol — 24 Oktober 2026

Arah visual: **Rimba Petualangan**. Menu sekarang adalah scene 3D ringan dengan labirin taman, pepohonan, portal dan maskot, bukan layout landing page. Logo dan tombol MAIN memakai Fredoka; font disimpan lokal agar tampilan tetap sama saat offline. Informasi setup Firebase dan penjelasan struktur akun keluarga dihapus dari home.

Binturong diperjelas lewat moncong abu-abu yang menonjol, kumis panjang, telinga gelap berjumbai, syal kecil hijau toska, dan ekor panjang yang melengkung di samping tubuh. Modelnya tetap sederhana, terdiri dari geometri asli yang dianimasikan; tidak memakai karakter atau aset game lain.

## Kontrol Modern

| Perangkat | Gerak | Lompat | Tebas semak |
| --- | --- | --- | --- |
| HP/tablet | Joystick kiri | A biru kanan | B merah kanan |
| Komputer | WASD / panah | Spasi | J atau B |

Joystick dan tombol aksi mendukung sentuhan bersamaan. Lompat mengubah posisi vertikal karakter dan memiliki cooldown; dinding tetap membatasi pergerakan. Tebas membuka semak opsional di jalan buntu terdekat yang tidak terhalang dinding. Tidak ada serangan wajib terhadap pemain/hewan dan objektif utama tetap mencari finish. Retro tetap menelusuri jalur dengan jari/mouse tanpa A/B.

Scene Modern menggunakan HUD di dalam layar permainan; header website tidak lagi mengurangi ruang bermain. Aksi room memiliki validasi cooldown di server dan state semak bersama. Sinkronisasi online nyata masih perlu diuji dengan Firebase/Functions yang dikonfigurasi.

## Firebase

Empat identifier publik dari Firebase Web app yang diberikan pengguna sudah dimasukkan sebagai konfigurasi default project `maze-hunter-e362b`, dengan override environment tetap tersedia. Kredensial Admin tidak dimasukkan. Analytics tidak diaktifkan otomatis.

Agar Google login bekerja pada deployment: pastikan provider Google aktif dan domain Netlify yang dipakai terdaftar di Firebase Authentication. Konfigurasi yang diberikan belum menyertakan `databaseURL`; `storageBucket` bukan URL Realtime Database. Room tetap membutuhkan URL tersebut dan service account server melalui environment Netlify Functions. Jangan mengirim private key lewat chat.

## Penerapan

Gunakan satu paket terbaru `maze-hunter-game-ui-delta.zip` pada branch `maze-1`. Paket adalah delta gabungan terhadap baseline maze-1 original, sudah mencakup perbaikan Netlify sebelumnya. Timpa semua path yang sama dan ikuti `DELETE_FILES.txt`. Tidak perlu mengunggah ulang paket lama sesudahnya.

## Hasil pemeriksaan

- Typecheck, 20 tes logika, validasi level, build dan pemeriksaan batas environment: PASS.
- Enam tes Chromium: PASS, termasuk input sentuh joystick + A secara bersamaan, B, tampilan tanpa teks admin di home, rotasi/resize dan cache font saat offline.
- Bundling Function untuk Node 24: PASS.
- Tampilan dirender dan diperiksa di desktop, portrait HP dan tablet; tidak ada horizontal overflow pada phone viewport yang diperiksa.
- Google login nyata, runtime Netlify, sinkronisasi multi-client dan performa perangkat fisik belum terverifikasi. Pembayaran/langganan tetap belum diimplementasikan.

Referensi desain faktual: ciri binturong https://animals.sandiegozoo.org/animals/binturong ; font Fredoka dan lisensi https://github.com/google/fonts/tree/main/ofl/fredoka ; konfigurasi publik Firebase https://firebase.google.com/docs/web/learn-more .


---

# M4 — halaman awal dengan pratinjau labirin

Pasang setelah M3 pada branch maze-1. Paket hanya berisi file baru/berubah
dibanding source M3; pertahankan jalur folder dan timpa file yang sama.
Tidak ada file yang perlu dihapus. Setelah deploy, versi: 24.10.24-M4.

Perubahan halaman awal:
- Diorama pulau labirin 3D dengan jalur yang benar-benar terhubung menuju gerbang.
  Menggunakan generator dan pencari rute game yang sudah ada.
- Preview Retro memperlihatkan titik bergerak menelusuri jalur emas.
- Preview Hidden Maze meredupkan area jauh dan menampilkan dinding lebih tinggi.
- Dua pilihan mode dapat dicoba sebelum login untuk melihat perbedaannya.
  Sesudah ada profil, tombol mode membuka game terkait dan Main mengikuti pilihan.
- Logo, teks, warna, tombol Main, ikon mode dan komposisi disusun ulang.
- Binturong di panggung kecil tetap merespons sentuhan, klik, Enter dan Spasi.
- Layout desktop, HP portrait dan HP landscape diperiksa dengan browser test.
- Geometri sederhana, tile/dinding instanced, tanpa gambar besar, model eksternal,
  efek post-processing atau shadow map. Animasi latar mengikuti reduced-motion.

Tidak ada perubahan kredensial, environment variables, rules Firebase, backend
multiplayer, atau mekanisme login. Perbaikan API key Netlify tetap berlaku.
Gambar pulau di home adalah pratinjau dunia, bukan progres pemain yang dibuat-buat.
Tidak ada deploy otomatis. Login Google asli dan performa HP fisik masih memerlukan
verifikasi pada perangkat pengguna.

Validasi: TypeScript dan production build PASS; 29 unit tests dan 13 browser
tests PASS, termasuk pemilihan preview tanpa login, sentuhan maskot, responsif
1440x900 / 390x844 / 844x390, gameplay Retro/Modern, diagnosis login, dan offline.


---

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


---

# Maze Hunter M2 — login dan sentuhan maskot

Versi yang harus terlihat di kanan bawah halaman utama: **24.10.24-M2**.

Paket ini menggabungkan maze-hunter-game-ui-delta.zip, login diagnostic, dan
perubahan M2. Gunakan paket ini saja; jangan timpa lagi dengan paket lama.
Upload isinya ke branch maze-1 dengan struktur folder yang sama. Ikuti
DELETE_FILES.txt untuk file lama yang memang sudah digantikan sebelumnya.
Tidak ada commit/push/deploy otomatis dari pembuat paket.

Setelah Netlify selesai build, muat ulang halaman. Jika versi M2 tidak terlihat,
periksa bahwa deploy preview berasal dari branch dan commit yang baru, lalu
tutup tab game lama dan buka lagi alamat preview yang benar. Jangan mengubah
rules Firebase hanya karena panel belum tampil.

Perilaku:
- Ketuk/klik binturong: melambaikan tangan, melompat kecil, menggerakkan ekor.
  Bisa juga difokuskan dengan Tab dan diaktifkan dengan Enter/Spasi.
- Area sentuh mengikuti posisi karakter saat layar berubah orientasi.
- Play segera menampilkan panel status login, bukan menunggu error.
- Jika belum ada hasil setelah 20 detik, panel menunjukkan login/pending.
  Ini kode status aplikasi, bukan kode error dari Firebase.
- Jika Firebase mengembalikan error, tampilkan kode aslinya yang aman.
- Error tanpa kode Firebase ditampilkan sebagai login/unknown.
- Panel tetap terlihat sampai ditutup. Foto panel tersebut untuk diagnosis.

Batas pemeriksaan:
Google provider dan domain preview sudah sesuai pada screenshot pengguna.
Penyebab jendela login live menutup sendiri belum diketahui.
Preview live memberikan HTTP 401 saat pemeriksaan otomatis tanpa sesi pengguna;
versi yang sedang tayang belum dapat dibandingkan dengan source.
Tidak ada perubahan konfigurasi Firebase, rules, atau kredensial.
Tidak ada simulasi akun untuk menggantikan login asli.

Validasi lokal: TypeScript, production build, 23 unit tests, 8 browser tests PASS.
Browser tests mencakup sentuhan maskot pada tablet/ponsel, keyboard, popup yang
ditolak browser, error yang dapat difoto, Retro, Modern, dan offline reload.
Login Google asli dan performa pada perangkat fisik pengguna belum terverifikasi.


---

# Maze Hunter M10 — 25 October 2026

Apply this changes-only package after M9 on branch maze-1, then use the existing build/deploy workflow. No environment-variable or Firebase rule changes are needed for this patch. No remote repository or deployment was changed.

## Retro: uncertainty replaces solution-length scoring

The old generator privileged a solution occupying at least 60% of available rooms and accepted terminal branches as short as four cells. That rewarded a long correct corridor with short visible distractions. M10 replaces that acceptance model for levels 6–100; levels 1–5 remain introductory.

The build-time generator now generates a connected tree, repairs short terminal limbs by rewiring cycles back into a tree, and removes only the remaining short twigs. Every catalogue board is then audited directly from its graph:

- At least two available directions at Start, with a wrong branch there reaching at least half the complete solution distance.
- At least eight junctions along the solution.
- At least three major wrong branches reaching at least 50% of the remaining correct distance from their junction, each also at least eight cells deep.
- At least two of those branches occur in the first half of the solution and extend at least 50% of the full solution distance.
- At least one major branch falls in the 50–70% range relative to the remaining correct route. Others can be longer.
- At least one major wrong branch contains two or more further decisions.
- Terminal limbs have at least six edges; small incidental branches are not all 50–70% of the complete solution. The long-branch ratio is a requirement for major deceptive choices, not a claim about every twig.
- At least 90% of logical rooms are connected and used. Actual catalogue coverage is 94.7–99.8%. Unused closed pockets render as planted ground rather than empty beige rooms.
- One unique solution. E=V−1 and full reachability are checked on the actual open graph. Retro remains fully visible, including its fruit goal.

Example: level 21 has a 43-edge correct route. Two early wrong routes reach 26 and 24 edges from their junctions, rather than terminating after five moves. Distances count logical room-to-room movement, not raw pixels or turns of the pointer.

The catalogue is generated offline by scripts/generate-retro-v10.py. Search and scoring never run on the player's phone. Existing saved completion records are retained; they are not invalidated by the revised boards.

## Adventure hedge presentation

The faceted per-cell crowns are replaced by joined hedge cores and lightly bevelled, trimmed tops. A deterministic 256px leaf atlas adds individual leaf shapes and veins, including wrapped edges. The hedge tint changes smoothly with distance, rather than flipping between bright and dark tiles at line-of-sight boundaries. Existing zone colors, solid collisions, cuttable grass, camera controls and discovery minimap remain functional. This patch does not convert the Adventure layout into the circular real-world reference photograph.

## Illustrated Explorer Handbook

A ? button in the gameplay bar and an Item guide button inside Help open a separate ID/EN panel. Eight illustrated entries explain Forest Seals, stars, chests, keys, cakes, shields, coins and cuttable grass. It distinguishes the turquoise seal crystal from the outline shield indicator; there is no independent diamond currency.

The text reflects current behavior: Retro stars unlock cosmetics; Adventure stars record optional expedition collections; coins currently record best collection totals rather than funding a shop. Chest and shield effects match the simulation. Solo pauses while the book is open and resumes on close; online matches keep running on the server and display that notice. The book scrolls internally on a small screen.

## Validation

- 67 logic tests passed, including all 100 Retro playthroughs, graph-based audit of all 95 revised boards, multiplayer room regressions and existing Adventure tests.
- Five targeted browser scenarios passed: illustrated guide with Solo pause/resume, phone width and English text; full level-21 board; textured hedge rendering; full Retro/Adventure navigation; minimap expansion and pause.
- Production build and Netlify room-server bundle passed. The standard large-chunk warning remains.
- Desktop/phone-viewport renders inspected internally. Physical Android/iOS devices, real multiplayer latency and player difficulty/playtesting are not certified by these checks.

The archive contains only changed/new source, tests, generator and this note. It excludes dist, dependencies and internal screenshots.


---

# Maze Hunter M11 — 25 October 2026

Apply this changes-only archive after M10 on branch maze-1, then build/deploy with the existing workflow. No new environment variables or Firebase rule changes are required. No remote repository or deployment was changed.

## Per-decision 90% rule

The user's clarified rule compares each failed choice with the correct route from that same junction to the NEXT junction, or to the current map's exit if it is the last decision. It does not compare against the entire remaining level.

Every generated section uses either 30 correct edges versus 27 failed edges, or 40 correct edges versus 36 failed edges. Distances count logical room-to-room movement. At a three-choice junction, both failed choices independently meet the same 90% rule. Returning to the previous section is not counted as an offered forward choice.

There are no incidental extra forks or short terminal twigs inside these arms. The graph audit measures every route directly from the playable board and verifies that every visible corridor belongs to a declared arm. It also checks full connectivity, E=V−1, the exact number of offered choices, the absence of hidden intermediate junctions, and all failed-route lengths. Correct choices vary with the generated layouts; no correct route is highlighted.

This replaces M10's acceptance model of eight or more solution junctions and 90% board coverage. Those older targets conflict with the newly specified exact decision counts. Closed islands remain planted ground; they do not create additional fake corridor choices. Levels 1–4 retain their introductory boards. Levels 5–100 have 96 new layouts spanning 176 maps and 296 decisions. Generation runs offline; no search runs on the player's device. The generator publishes its completed catalogue atomically.

| Levels | Forward choices, in sequence | Maps |
| --- | --- | --- |
| 5–10 | 2 | 1 |
| 11–20 | 3 | 1 |
| 21–30 | 3 → 2 | 1 |
| 31–40 | 3 → 3 | 1 |
| 41–50 | 3 → 3 → 2 | 2 |
| 51–60 | 3 → 3 → 3 | 2 |
| 61–70 | 3 → 3 → 3 → 2 | 2 |
| 71–80 | 3 → 3 → 3 → 3 | 2 |
| 81–90 | 3 → 3 → 3 → 3 → 2 | 3 |
| 91–100 | 3 → 3 → 3 → 3 → 3 | 3 |

Each map holds up to two consecutive decisions. From level 41, the earlier maps end with a drawn golden gate and an arrow rather than fruit. The gate fades out/in to the next map, clears the old trace, resets the map zoom, and releases dragging so the player can re-grab the binturong. Reduced-motion skips the fade. Only the last map shows fruit and completes the level. The HUD and hints identify the current map and target.

All maps belong to one level: one timer, three lives, one final result and one final progress save. Crossing a gate does not award stars or advance the level. Entering any dead end costs one life and returns to the LEVEL Start on map 1, preserving elapsed time. Lifting a finger and touching walls remain free. Existing saved completion records are retained.

## Flexible Adventure camera

- Vertical right-side dragging now permits 0–65 degrees; it is no longer restricted to 35–45 degrees.
- The default comfortable angle is 22 degrees. The ↕ button cycles comfortable 22°, high 55°, and eye-level 0° without changing yaw.
- Settings can retain an eye-level initial preset across reloads. Both previous presets remain valid.
- Q/E orbit; R/F raise/lower the angle on a keyboard. Left joystick movement remains independent of right-side look gestures and action buttons.
- Movement turns the character toward travel; camera yaw never automatically follows the character's heading.
- In a clear area, 0° is physically horizontal. A foreground hedge can temporarily lift/shorten a low camera arm to keep the torso visible. Close-obstacle protection avoids filling the screen with the head. Existing angular and positional smoothing remains active.
- Phone gameplay bar labels shrink/truncate within their available space so the guide, camera and pause buttons remain visible.

## Validation

68 logic tests passed, including winning routes for all 100 levels and direct graph audits on all 176 generated maps. The staged audit verifies every failed arm's measured ratio is exactly 0.9, not merely catalogue metadata. Multi-map tests cover incomplete gates, final-only ratings, time/pause, later-map death and clean retries.

Nine targeted browser scenarios passed across focused runs: real mouse gate transition and later-map reset through a final win; camera presets and simultaneous joystick/vertical dragging; eye-level preference reload; physically horizontal camera in an unobstructed real clearing; legacy Retro mouse/lift/unlock; phone wall/dead-end/rotation behavior; Adventure keyboard/resize; illustrated guide pause/resume; three-finger joystick/camera/A interaction. The phone trace test now waits for the existing entry transition cover before sending raw touch events.

Production build, server-room bundle and generator syntax checks passed. The standard large-chunk build warning remains. Desktop and phone-viewport renders were inspected internally. Physical Android/iOS hardware, real multiplayer latency and player difficulty testing remain unverified.

Only changed/new source, generator, tests and this note are included. Dist output, dependencies and internal screenshots are excluded.


---

# Maze Hunter M12 — Forest Grove playable sample

Apply this changes-only package after M11 on branch maze-1, then use the existing build/deploy workflow. No new environment variables, account setup or Firebase rules are needed. No remote repository or deployment was changed.

## Try the example

Sign in/select a profile as usual, open Adventure, then choose **HUTAN RIMBUN · CONTOH / FOREST GROVE · SAMPLE**. The existing local control lab can also open it without cloud access. The sample uses fixed Medium balance so comparisons between revisions are repeatable.

Explore the connected forest paths, collect three turquoise seals, face the Forest King, then reach the golden gate before the escape timer expires. B throws cakes or interacts with nearby cuttable plants; A jumps and grabs climbable mossy rocks. Purple enemy fruit slows/stuns the explorer. Chests, seals and checkpoints replenish supplies. The King arena also replenishes one cake every two seconds while active.

This is one authored Solo forest example, rather than another batch of procedural maps. It has three-cell-wide paths, taller hedges (about 2.1 scene units), seven recognizable areas, tree trunks in the routes, climbable rocks, three seals, nine optional stars, supplies and a large arena. Tree trunks and stone arena pillars have actual circular collision. Stone pillars and rocks also stop projectiles.

The sample retains a real running timer and lives, but its collection totals and wins do not alter the account's persistent family records or cosmetic unlocks. Ordinary Solo and Online Beta remain available through their existing buttons.

## Character and wardrobe

The shared binturong model is rebuilt with a softer trapezoid/rounded head, projecting muzzle, short tufted ears, expressive eyes, paws, teal neckerchief and maze badge. It uses a lightweight hierarchical joint rig, with elbows/knees, breathing, walking, waving, throwing and climbing poses. These are procedural articulated animations, not a claim of a finished external motion-capture asset pipeline.

The prehensile tail is now one continuously deformed, tapered tube rather than separate cylindrical pieces. It sways and follows turns. In backpack previews it rests to the side.

Cosmetics retain their existing IDs and unlock conditions. Glasses have thicker frames, lenses and temple arms; the leaf mask covers the muzzle; the backpack has straps, flap, pocket and bedroll; the cape is a waving cloth mesh. The same model is used on Home, wardrobe previews and in 3D gameplay. Existing profiles, fur palettes and equipped items are preserved.

## Guardian and King

Guardians have articulated shoulders, elbows and hips, independent breathing/head motion, blinking, wind-up, recoil and stun poses. Their rendered heading blends toward travel direction and toward their aim during attacks. The forest sample adds short pursuit behavior and stops a guardian while it aims. The King slowly closes distance within his arena and has a larger crowned silhouette.

Player projectiles remain cakes. Enemy projectiles are purple fruit with a green stem. Existing slow/stun/life rules remain in effect. The forest player's hit splashes use a purple tint.

The sample King cycles ground slam, lightning, roots and spin attacks, with visible warning circles before impact. Later phases can add a second lightning target. Lightning renders a bolt after the warning expires. The in-game boss panel shows actual health, phase and warning countdown. Leaving a marked impact area avoids its damage; defeating the King opens the final escape.

## Camera, sky and rendering

Right-side vertical dragging permits a requested view from 25° upward through eye level to 75° overhead. The orbit arm stays above ground while looking upward. Q/E orbit on a keyboard; R/F raise/lower the view. The ↕ button retains its quick presets. Camera yaw remains independent of the character's heading.

The sample adds a gradient sky, slowly moving clouds, taller forest trees and fern/flower details. Low-camera obstruction handling still adjusts the arm when a hedge hides the character. High views adjust fog/culling so the ground remains visible. Keyboard camera input integrates elapsed time rather than depending on one capped simulation frame.

Static vegetation, tree canopies and landmarks are batched by material where safe; named interactive rings remain separate. Used WebGL contexts are explicitly released when previews/games are disposed. These reduce rendering overhead but are not an FPS guarantee on physical mobile hardware.

## Validation and limits

- 74 logic tests passed, including the existing Retro/Adventure/room regressions, all 176 staged Retro map audits, forest objective connectivity, tree sliding, King warning/dodge/win behavior, finite animated character geometry, static batching bounds and stone projectile cover.
- Nine targeted browser scenarios passed across focused runs: the three new Home/wardrobe, real-menu forest controls/camera/phone, and King warning/bolt scenarios; plus six existing transition, cosmetics, Retro/navigation, climbing, multi-touch and minimap scenarios. The final forest cases were rechecked after the changes.
- Production build and room-function bundle passed. The standard large-chunk warning remains.
- Desktop and phone-viewport renders were inspected internally. Physical Android/iOS performance, real multiplayer load and final art/player balancing have not been certified.

The first example focuses on land-based Solo forest play. Swimming, fish enemies, other biomes, a spendable currency wallet and top-up billing remain future work. The forest sample is not exposed as an online room mode. Shared character/guardian visual improvements also appear in existing 3D modes.

Only changed/new source, tests and this note are included. Dependencies, dist output, legacy catalogues and internal screenshots are excluded from this archive.


---

# Maze Hunter — M13

Apply this changed-files package **after M12**, on the user's `maze-1` working branch. Extract at the project root and replace matching paths. This package contains source changes only. It does not deploy, commit, change Firebase rules or require new environment variables. Netlify must rebuild the frontend **and** its existing `maze-room` function together because online jump and quest rules changed.

## Home

- Retro Journey and Adventure open directly; the redundant Play button is removed. Signed-out players can start Google sign-in from either mode.
- A tap gives a short jump with both arms raised outward. Holding and dragging rotates the equipped 3D character through a full turn, preserving the chosen angle after release. Enter/Space also greets; arrow keys rotate the focused mascot.
- Corrected shoulder direction to keep hands outside the torso. The account control uses a profile icon instead of a text chevron.
- Responsive controls recalculate their bottom inset after resize/orientation changes. The journal button sits below the action controls.

## Forest expedition (Adventure → Hutan Rimbun · Contoh)

- Replaces the compact M12 sample with an authored **81 × 81** Solo expedition, five-cell main trails, distant branches, optional treasure paths and a larger eight-cell-radius boss arena. Expedition limit: 25 minutes.
- Three quest destinations: shallow flooded gorge/cave, an abandoned lodge with a physical south entrance and interior, and an elevated moss grove reached by stone treads. A journal supplies directional clues and live guardian/collection status in Indonesian and English. Each seal stays locked until its own quest guardian is defeated.
- A continuous rendered heightfield supports slopes, highland elevation and the depressed cave pool; character, items, walls, camera and effects follow the same terrain height. Water in the cave is shallow wading water, not a new underwater/swimming biome. The existing small river crossings remain jump hazards.
- Rock gorge walls and lodge walls use separate materials. The cave has a blue irregular pool, foam edge and moving ripples. Roofs lift near the player to keep interiors playable. Tall canopy and real trail trees retain collision.
- Seals are taller turquoise crystals with gold orbit rings and stone bases. Treasure chests have rounded lids, bands, seams and locks. Picking up a chest opens a reward window showing actual gains after inventory caps: coins, key, cakes and hearts. Solo pauses for this window; online play continues.
- The forest King pursues, circles at close range, charges toward a marked point, fires a fruit spread and varies roots, lightning and area attacks. Roots have visible emerging branches. Armor blocks cake spam; a brief counterattack window follows major attacks, with a visible shield and HUD prompt. Hit cadence is limited during the window. Cake refill remains available in the live arena.
- Enemies, including the King, use line of sight beyond the small minimap discovery radius so an enemy in a visible clearing no longer vanishes at the discovery boundary. The minimap still tracks discoveries separately.
- Character animation adds outward greeting arms, airborne poses and idle looking/breathing. In this Solo forest sample the explorer carries a trekking pole, stowed while throwing or climbing. Gloves and boots are modeled as part of each existing non-classic body outfit; there are still six account cosmetic slots, not separate glove/shoe purchase slots.
- Sample rewards remain expedition-local and do not add account wins, stars, coins or unlocks. Existing normal Adventure maps and online beta remain separate menu entries.

## Double jump and online seals

- A second A/Space press in the air gives a continuous upward impulse from the current height. A third impulse is rejected until landing. The same height function and checks run on the Adventure server; remote avatars receive the boost metadata. The old non-Adventure legacy room path retains its existing single-jump server behavior.
- New online Adventure rooms freeze their starting slot roster. Co-op creates **3 × participants distinct reachable seal locations**, shared by the team: 4 players need 12; 8 need 24; 10 need 30. Race assigns three disjoint locations to each participant. New rooms are required to use this rule; existing rooms without roster metadata retain their former layout.
- These online changes apply to the existing generated Adventure maps. The authored forest expedition remains Solo. Online NPC encounters still use the existing participant simulations with shared King health, rather than a newly unified global NPC simulation.

## Retro campaign

The timer starts when the level scene opens, before touching the mascot. Pause still freezes it. The entire maze remains visible. Failed branches remain 90% of their corresponding correct route, measured to the next decision or current map exit.

| Levels | Forward choices | Maps | Shared time |
| --- | --- | --- | --- |
| 1–4 | Introduction | 1 | 60 s |
| 5–10 | 2 | 1 | 60 s |
| 11–20 | 3 | 1 | 60 s |
| 21–30 | 3 → 2 | 1 | 90 s |
| 31–40 | 3 → 3 | 1 | 90 s |
| 41–50 | 4 → 3 → 4 | 2 | 120 s |
| 51–60 | 5 → 4 → 4 | 2 | 120 s |
| 61–70 | 5 → 4 → 4 → 3 | 2 | 120 s |
| 71–80 | 5 → 5 → 4 → 4 | 2 | 120 s |
| 81–90 | 5 → 5 → 5 → 4 → 4 | 3 | 150 s |
| 91–100 | 5 → 5 → 5 → 5 → 5 | 3 | 150 s |

Four/five forward options use multiple tunnel entrances along one decision hall. A square-grid point cannot support five outgoing routes plus its incoming route. Hall paths therefore share the hall's interior segment while remaining separate long tunnels. Actual graph audits verify the advertised choices, unique route, reachable cells and exact 90% failed-route lengths. There are no decorative extra dead-end stubs. Levels 5–40 keep their previously accepted geometry; 41–100 use the new catalog. Timer and lives continue through gates; a dead end returns to the level's first-map Start.

## Validation and limits

Validation: **81 logic tests** passed across 13 test files; **15 unique targeted browser scenarios** passed across M8/M12/M13 runs; production TypeScript/Vite build and the Netlify room-function bundle passed. Automated checks cover all Retro maps, quest locks, heightfield continuity, chest caps, boss armor and pursuit, double-jump rejection, thirty unique seal locations and server Co-op sharing. Browser checks cover menu entry, rotation, countdown, wardrobe, journal, camera, phone layout and representative locations.

No physical Android/iOS, live Firebase sign-in, real ten-device session or store deployment has been tested. Rendering and animations remain procedural Three.js models; this is an expanded playable build, not a claim of finished commercial art or certified device frame rates. Other biomes, deep swimming/fish guardians and top-up billing are not part of this revision.


---

# Maze Hunter — M14 Retro landscape correction

Apply this changed-files package after **M13** on `maze-1`, replacing matching files at the project root. Rebuild the existing application. No Firebase rules, environment variables, online match rules or Adventure changes are included. No repository or remote deployment was performed.

## Cause and correction

M13 used a 53 × 53 square envelope with short paths placed in separate sectors. Large unused areas were rendered as repeated green dots. Fitting the entire square to screen height made the actual corridors extremely small on landscape phones.

M14 replaces that geometry and presentation:

- Every Retro map is a landscape rectangle, with width and height carried separately through drawing, collision, route tracing and viewport fitting.
- Introductory levels use a fully carved rectangular maze. Levels 5–100 use a new compact catalog; branch trails weave next to each other across one connected labyrinth. Local path expansion absorbs unused pockets while retaining one solution and the specified decision count.
- Solid walls, a warm floor and a thin continuous wall network replace the dotted vegetation pattern. There is no fog in Retro.
- The arena adapts to the available screen area with modest rectangular cells. Phone portrait rotates the view and input coordinates together; it does not regenerate the board or reset progress.
- On an 844 × 390 landscape viewport, the tested level bands occupy more than 85% of screen width and the hardest corridors have at least 18 px in both dimensions at the initial full-maze view. Zoom remains available for closer tracing.
- Zoom controls are in the HUD, outside the maze, so no route or endpoint is covered by those buttons.
- Start retains the binturong; the last map retains its fruit goal. Earlier maps retain their map gate.

## Rules retained

The accepted 60 / 90 / 120 / 150 second schedule, immediate countdown on entering a level, three lives, pause, harmless wall contact/finger release, later-map reset to map 1, and final-map-only reward all remain.

The accepted branch progression remains 2; 3; 3→2; 3→3; 4→3→4; 5→4→4; 5→4→4→3; 5→5→4→4; 5→5→5→4→4; 5→5→5→5→5 across the corresponding level bands. Four/five options still use a **compact decision hall** because a four-neighbour cell cannot have five outgoing routes plus its incoming route.

Each failed branch is still exactly 90% of its corresponding correct route to the next decision or map goal. The compact catalog uses 40/36 steps for two-choice stages and 50/45 steps for stages with three or more choices. The paths fill the maze rather than adding a sparse perimeter corridor. All paths and their real graph lengths are audited, including the connector to the following decision.

Existing level results and unlocked progression are preserved. Map geometry is updated for replayed levels; an already running browser session must reload to receive the new build label **25.10.26-M14**.

## Validation

**84 logic tests passed**, including audits of all 176 generated maps; **7 targeted browser scenarios passed** across the regression runs; production TypeScript/Vite build passed. Checks cover all 176 generated maps, actual branch lengths, unique routes, endpoints, rectangle bounds, input transforms in both orientations, phone corridor size, gate progression, dead-end reset and rendering on early and late levels. Physical phone touch feel remains to be checked on the user's device.


---

# Maze Hunter — M15

Apply **after M14** at the existing project root on `maze-1`. This package contains changed/new files only. No commit, push or remote deployment was performed.

## Apply

1. Replace matching files from this ZIP.
2. Rebuild/deploy the frontend **and `netlify/functions/maze-room.ts` together**. The room API now includes the selected area and separates public matchmaking queues by area, difficulty and match type.
3. Publish the included **`firestore.rules`** in Firebase → Firestore Database → Rules. The only rule change increases the existing `adventures` map limit from 30 to 210, allowing separate progress for seven areas × three difficulties × ten map slots. Ownership, profile fields and entitlement protections are unchanged. No environment variables or Authentication settings are added.
4. Reload and check the Home build label: **26.10.26-M15**.

## Retro: restore the accepted game

- Levels **5–40 use the exact catalog entries from the accepted M11/M12 baseline**, including walls, Start, goal, decisions and branch lengths. Introductory levels also return to the earlier generator. M13/M14's replacement layouts are no longer the source for these levels.
- Level 41+ keeps the latest approved 4/5-choice progression. Its new catalog removes the fixed straight central connector: links wind through corridors, goal rows vary, whole-page reflections vary, and the correct branch is selected from all available directions.
- The full map and goal stay visible. No fog, hint arrow or solution overlay was added. The earlier warm path/green-stone wall palette is restored. The player's own traced path remains visible.
- Latest timing is preserved: 60 s for 1–20; 90 s for 21–40; 120 s for 41–80; 150 s for 81–100. The timer starts on scene entry. Three lives, harmless wall contact/finger release, pause, map gates and reset to map 1 are unchanged.
- Failed branches remain exactly 90% of the correct route to the next decision or current map goal. All actual graph lengths and one-solution topology are audited.
- Retro supports landscape and portrait through its existing drawing/input transform. Accepted maze geometry is preserved instead of forcing every legacy board to become a different rectangle. Zoom stays in the HUD.

## Adventure: preserve and add

The original **SOLO ASLI / ORIGINAL SOLO** still uses the existing generated 43/53/63 maps. **FOREST · CONTOH / FOREST · SAMPLE** still opens the accepted authored 81×81 Medium forest. The original `adventure-layout.ts`, `forest-layout.ts` and `forest-world.ts` files are unchanged from M14.

Additional expeditions are separate choices:

| Choice | Medium | Hard | Extreme | Theme |
| --- | --- | --- | --- | --- |
| Labirin Asli / Original Maze | 43 | 53 | 63 | Existing SOLO routes |
| Hutan Rimbun / Forest Grove | 81 | 105 | 129 | Canopy, keeper lodge, mossy highlands |
| Gurun Surya / Sunlit Desert | 81 | 105 | 129 | Cacti, sandstone, oasis, ruins |
| Ngarai Toska / Turquoise Gorge | 81 | 105 | 129 | Tall cliffs, crystal cave, shallow pool |
| Gunung Awan / Cloud Mountain | 81 | 105 | 129 | Slopes, snowy silhouettes, camp, ledges |
| Pantai Senja / Sunset Coast | 81 | 105 | 129 | Palms, cove, coastal lodge, beacon |
| Laut Karang / Coral Sea | 81 | 105 | 129 | Surface swimming, coral and animated fish guardians |

Sizes are grid width × height. New areas use three-cell-wide corridors and a large boss clearing. Layout candidates are checked **after** clearings are opened: minimum Start-to-King path 140/220/300 cells, plus spatial separation. Templates are deterministic by area, difficulty and map index; run variation changes secondary placements. New expedition limits are 30/40/55 minutes. The protected Forest example retains its existing limit and authored routes.

Each new expedition has three guarded seal quests, a journal, optional stars/chests, climbable ledges, round trail obstacles, a moving King with armor/counterattack windows, telegraphed area attacks and a timed final escape. Terrain, actor heights and camera use the same heightfield. Sea swimming is a **surface swim**; it is not a diving/oxygen system. Gorge and oasis water is shallow wading water.

Progress records are namespaced by area, preserving the old SOLO keys. Adventure records include an area filter. The protected Forest sample still keeps rewards local to the sample, as before.

## Online area selection

Choose an area on the Adventure picker, then Online → Race or Co-op. The area is stored on the room and validated by the server. Joining by code uses the room's actual area; public matchmaking never mixes areas or difficulties. Medium/Hard/Extreme capacities remain 4/8/10. Server and client rebuild the same map from the room's area, difficulty, index and seed. Co-op retains 3 × participants shared seals; Race retains three separate sites per participant.

Existing rooms without area metadata default to the original maze. NPC encounters retain the existing per-participant simulations with shared King health. This revision does not claim a new globally unified NPC simulation, real ten-device stress testing, or live Firebase verification.

## Menus and orientation

- The Adventure picker has a preview captured from its real playable 3D scene, seven illustrated area cards, unified action buttons and a visible guidance button.
- The menu artwork uses original lightweight vector scenes appropriate to each theme; profile, records, collection and Retro map pages use different world backgrounds. Home and wardrobe keep their existing actual 3D avatar scenes.
- Guidance covers area selection, controls, quests, seals, King and online match types; the illustrated item guide remains available.
- Adventure setup, lobby and gameplay require landscape. In portrait an overlay asks the player to rotate. Solo input and its clock pause; online authority/timers continue. Rotating back resumes the same run. Retro remains available in both orientations.

## Validation

Validation passed: **91 logic tests across 15 files**, **9 unique targeted browser scenarios** across the regression runs, the production TypeScript/Vite build and the Netlify room-function bundle. Automated coverage includes baseline preservation, all Retro maps and branch ratios, winding high-level connectors, new-area reachability and distance, unique starts, thirty distinct seal sites, server/client world parity, and physical traversal through all three quests and escape for each new Medium area. Browser checks cover real menus, guidance, all six additional 3D themes, preserved SOLO/Forest entry, orientation, records/collection backgrounds and Retro touch/map transitions.

New area art is an initial playable pass for further polish. Physical Android/iOS performance, production sign-in and a real ten-device match have not been certified. Subscriptions, top-ups and store publication are outside this revision.


---

# Maze Hunter M5 — Retro dan Adventure Solo

## Pemasangan

Gunakan setelah M4 pada branch maze-1. ZIP hanya memuat file baru/berubah dari
paket M4, bukan keseluruhan proyek. Pertahankan struktur folder, timpa file yang
sama. Tidak ada file yang harus dihapus. Sesudah Netlify build, versi home M5.
Tidak ada commit, push, publikasi rules atau deployment otomatis.
Tidak ada perubahan environment variables maupun rules Firebase.

## Retro Journey

- 100 level tetap tersedia. Generator kini mensyaratkan sedikitnya tiga
  persimpangan dan empat ujung koridor per kandidat, sehingga level awal tidak
  menjadi satu koridor tanpa pilihan.
- Tampilan memakai dinding tipis dan koridor berbasis sel. Pendeteksian tembok
  mengikuti garis batas sel yang digambar, bukan blok dinding lama yang lebar.
- Avatar binturong adalah Start dan penanda yang digerakkan. Tujuan berupa buah
  ara, dengan ilustrasi vektor langsung di canvas.
- Menyentuh tembok menghentikan lintasan tanpa penalti. Jari boleh diangkat.
- Memasuki sel jalan buntu selain Start/Finish mengurangi satu nyawa, menghapus
  jejak percobaan dan mengembalikan avatar ke Start. Satu gerakan tidak berulang
  mengurangi nyawa setelah reset. Waktu tetap berjalan. Tiga nyawa habis: kalah.
- Peta ditempatkan di bawah HUD; zoom/pan tetap tersedia untuk level padat.
- Skor Retro sebelumnya tetap tersimpan. Aturan/layout baru tidak menghapus
  progres pemain yang sudah ada.

## Adventure Solo yang dapat dimainkan

- Nama mode menjadi Adventure. Pilihan Solo menggunakan state permainan baru.
- Medium: 31×31, 12 menit, 3 penjaga, 1 Raja.
- Hard: 41×41, 18 menit, 5 penjaga, 2 Raja.
- Extreme: 51×51, 25 menit, 7 penjaga, 3 Raja.
- Inventaris 10 struktur deterministik per difficulty (30 total). Permainan baru
  memilih map yang berbeda dari map terakhir pada difficulty tersebut. Letak
  koleksi/patroli bervariasi berdasarkan seed pertandingan; bentuk map tetap
  sesuai indeks katalog. Retry memakai map dan seed yang sama.
- Validasi otomatis: jarak Start–Finish minimum 80/120/160 langkah grid untuk
  Medium/Hard/Extreme; semua segel, hadiah, sungai dan Raja dapat dicapai.
- Tiga segel DAN satu Raja dikalahkan wajib untuk membuka gerbang akhir.
  Melangkah ke Finish saja tidak lagi memenangkan permainan.
- Sembilan bintang tambahan dan tiga peti per run. Peti memulihkan satu nyawa
  dan mengisi kue. Segel menjadi checkpoint serta menambah persediaan kue.
- Penjaga berbentuk biji hutan berkaki akar, berbeda dari karakter pemain.
  Raja Rimbun memakai mahkota dan ukuran lebih besar. HUD menampilkan nyawa Raja
  saat berada dekat dan terlihat. Lingkaran target menandai persiapan serangan.
- B/J melempar kue; bila bersebelahan dengan pagar rumput bertanda hijau, B
  menebas pagar tersebut dan benar-benar membuka sel dinding menjadi jalan.
  Tebasan menarik penjaga sekitar menuju lokasi tersebut.
- Kue pemain memiliki amunisi dan cooldown, bertabrakan dengan tembok, serta
  dapat mengenai penjaga. Ada bantuan bidik pada musuh dekat yang terlihat.
- Penjaga: terkena pertama melambat, kedua terhenti sesaat, ketiga menyerah.
  Raja perlu delapan lemparan. Penjaga biasa pulih setelah tujuh detik tanpa hit;
  kemajuan damage Raja tetap tersimpan sepanjang run.
- Pemain: kue penjaga pertama memperlambat, kedua menghentikan sesaat, ketiga
  mengurangi nyawa dan kembali ke checkpoint. Ada jeda kebal setelah terkena.
- Tembakan Raja mengurangi satu nyawa langsung. Medium kembali ke checkpoint
  dengan penemuan peta tersimpan. Hard/Extreme kembali ke Start dan menghapus
  penemuan minimap pribadi. Segel, hadiah serta layout run tidak diacak ulang.
- Sungai adalah ubin air pada koridor; A/Spasi melompat melewatinya. Berjalan
  ke air mengurangi satu nyawa dan kembali ke checkpoint. Lompat tidak menembus
  dinding utama.
- Minimap: belum ditemukan gelap; ditemukan redup; area pandangan terang;
  ada panah pemain dan ikon koleksi/gerbang yang sudah ditemukan. Musuh hanya
  ditampilkan ketika berada dalam pandangan. Objek sungai/rumput/koleksi juga
  mengikuti penemuan dalam dunia 3D.
- Tujuan sampingan bintang/peti saat ini per pertandingan; belum menjadi
  inventaris hadiah kosmetik permanen atau sistem pembayaran.

## Gerakan, karakter, kontrol

- Percepatan/pengereman dan rotasi halus; pergerakan tetap menggunakan circle
  collision, substep dan wall sliding. Kamera mengikuti dengan interpolasi.
- Ekor diubah dari balok panjang menjadi 16 sambungan silinder kecil mengikuti
  kurva, gelombang berfase dan respons berbelok. Ini animasi prosedural ringan,
  bukan simulasi bulu/fisika berat.
- Kepala home/login dan preview kostum diangkat ke arah kamera.
- Gerbang emas baru memiliki pilar, lengkungan, ornamen dan cahaya portal.
- Pengaturan home: bulu arang/cokelat/perak, joystick tetap/mengikuti sentuhan,
  ukuran kontrol serta jarak joystick dari kiri/bawah. Preferensi disimpan
  lokal pada perangkat, belum disinkronkan sebagai pilihan antaranggota keluarga.
- Joystick tetap menjadi bawaan. Pada mode mengikuti sentuhan, pusat ditentukan
  saat sentuhan dimulai di zona kiri-bawah dan tidak bergeser selama jari ditahan.
  Multi-touch joystick + A/B didukung. Pointer cancel, blur dan resize melepas
  input agar karakter tidak berjalan sendiri.

## Batas tahap ini

Ini paket gameplay Solo untuk diuji, belum versi final/store release.
- Main Acak, ruang Adventure Race/Co-op 4/8/10 pemain, rejoin dan sinkronisasi
  penjaga/Raja/rumput belum dibuat pada protokol server yang baru.
- UI tidak menawarkan room legacy empat pemain sebagai Adventure baru. Source
  backend lama dipertahankan untuk tahap migrasi, tanpa perubahan deployment.
- Jumlah Raja bertambah menurut difficulty, tetapi arena bercabang akhir dan
  keseimbangan rute multiplayer belum selesai. Pola Raja saat ini tembakan
  terarah; Extreme menambah sebaran tiga arah.
- Semua 30 map lolos validasi konektivitas; pengujian rasa bermain/manual setiap
  map, penyeimbangan durasi, serta pengujian HP fisik masih diperlukan.
- Login Google asli, cloud save di proyek pengguna, iklan dan billing tidak
  dianggap terverifikasi oleh pengujian gameplay lokal.
- Local Control Lab hanya ada dalam development. Build produksi tetap meminta
  akun asli dan tidak memiliki login palsu/pemain online buatan.

## Validasi paket

TypeScript dan production build PASS. 40 unit tests dan 15 browser tests PASS.
Tes mencakup: konektivitas 100 Retro, katalog 30 Adventure, perjalanan state
mengumpulkan semua segel sampai Finish, prasyarat gerbang, penalti jalan buntu,
penalti sungai vs lompat, siklus kue, imunitas, reset Raja, tabrakan proyektil,
perubahan sel setelah menebas, joystick multi-touch, pause/rotate, menu, diagnosis
login dan reload offline. Pemeriksaan batas public-env juga PASS.
Screenshot browser dipakai untuk QA internal, tidak disertakan dalam ZIP.


---

# Maze Hunter M6 — bentuk dunia, kamera, rasa kontrol

## Pasang setelah M5

ZIP M6 hanya berisi file baru/berubah dibanding source M5. Upload pada branch
maze-1, pertahankan struktur folder dan timpa file yang sama. Tidak ada file
lama yang perlu dihapus. Sesudah Netlify build, home menampilkan 24.10.24-M6.
Tidak ada perubahan environment variables, rules Firebase, atau backend room.
Tidak ada commit/push/deployment otomatis.

## Retro mulai menantang dari level 6

- Level 1–5: papan pengenalan 5×5 sel.
- Level 6–10: 9×9 sel. Level 11–20: 11×11. Level 21–30: 15×15.
  Wilayah berikutnya bertambah hingga 29×29 pada kelompok terakhir.
- Generator menyaring berdasarkan panjang rute, persimpangan pada rute benar,
  jumlah jalan buntu, dan jumlah cabang salah dengan kedalaman minimal tiga sel.
  Level tidak lagi dinilai hanya dari ukuran dan beberapa persimpangan global.
- Aturan M5 tetap: tembok tidak mengurangi nyawa; memasuki jalan buntu reset ke
  Start dan mengurangi satu nyawa; jari boleh diangkat. Zoom/pan tetap tersedia
  untuk papan padat dan layar kecil.
- Layout level berubah; progres level sebelumnya tidak dihapus.

## Adventure: kamera belakang dan ruang menghindar

- Kamera perspektif mengikuti posisi dari belakang dan berangsur menyelaraskan
  arah berjalan. Arah input dikunci pada orientasi saat gerakan dimulai, agar
  kamera yang berputar tidak menyebabkan pemain berjalan berputar-putar.
- Geser area kanan layar untuk melihat sekitar; keyboard Q/E juga memutar kamera.
  Joystick kiri dan A/B tetap terpisah dari gesture kamera.
- Pengaturan menyediakan Follow from behind atau High view.
- Skala horizontal lingkungan 2,2 unit dunia per sel; bentuk karakter dipertahankan
  proporsional. Koridor memberi ruang lateral untuk menghindar/berpapasan.
- Radius tabrakan pemain dan kue disesuaikan dengan karakter, bukan hanya jalan
  yang dibuat terlihat lebar. Tes simulasi memverifikasi sidestep menghindari
  proyektil lurus di koridor.
- Kamera berpindah langsung saat respawn, tanpa terbang menembus seluruh map.
- Dinding tidak lagi diturunkan menjadi 30% tinggi ketika dekat kamera.

## Dunia dan karakter

- Jalur tanah, pagar tanaman, dan permukaan tanah memakai tekstur prosedural
  lokal berukuran kecil, tanpa download aset besar.
- Dasar tanah berkesinambungan, pagar dengan bagian dedaunan berbentuk, serta
  pohon berbatang dan berkanopi menggantikan balok polos sebagai visual utama.
- Sungai memakai geometri bertepi melengkung, batu tepi, permukaan mengilap dan
  riak bergerak. Bahaya air tetap mengikuti ubin sungai dalam logika permainan.
- Kabut jarak dan warna penemuan menjaga atmosfer; minimap tetap menyimpan area
  yang benar-benar ditemukan. Bentuk dinding jauh bisa terlihat sebagai lingkungan,
  sementara koleksi/musuh tersembunyi sampai ditemukan sesuai aturan sebelumnya.
- Ekor menjulur ke belakang badan dengan ujung melengkung, bukan kembali ke depan.
- Penjaga biji hutan mendapat helm daun, lengan akar, ekspresi dan pelontar kue;
  Raja Rimbun memiliki tubuh lebih besar, mahkota, permata dan jubah daun.
- Lemparan kue yang kena memunculkan percikan krim; lapisan krim menempel pada
  karakter untuk status hit pertama/kedua. Ada debu langkah dan percikan air.
- Home adalah panggung hutan dengan karakter besar menghadap pemain dan memakai
  kostum profil aktif. Identitas binturong dan pilihan warna tetap dipertahankan.

## Musik dan UI

- Musik latar instrumental sintetis orisinal dibuat dengan Web Audio, tanpa
  berkas lagu pihak ketiga. Tema mengikuti menu/Retro/Adventure.
- Musik dimulai setelah interaksi pengguna sesuai kebijakan browser, tidak
  memaksakan autoplay sebelum disentuh. Mute utama dan volume musik/efek terpisah.
- Efek langkah, lempar, lompat, percikan kue, air, tebasan dan hadiah ditambahkan.
- Root aplikasi dikunci ke viewport. Wardrobe menggunakan panggung karakter dan
  kisi kostum bergambar. Konten inventaris/dialog panjang boleh bergulir sendiri;
  halaman utama tidak bergulir sebagai dokumen web.
- Default joystick dinaikkan, dengan margin yang menyesuaikan tinggi layar.
  Preferensi lama yang masih memakai posisi bawaan 24 px diperbarui sekali.
  Penyesuaian ukuran/posisi, fixed/floating dan multi-touch tetap tersedia.
- Ikon piala di home setelah memilih profil membuka catatan keluarga: Retro per
  level berasal dari hasil profil keluarga; Adventure per difficulty/map menyimpan
  kemenangan nyata pada perangkat ini. Tidak ada angka atau peserta buatan.

## Batas yang perlu diketahui

- Peringkat global/online, room Race/Co-op Adventure 4/8/10 pemain, rejoin, dan
  penyimpanan inventaris Adventure ke cloud masih tahap berikutnya.
- Catatan Adventure perangkat tidak otomatis tersedia di perangkat lain.
- M6 memperbaiki presentasi prosedural dan kontrol; bukan klaim sudah setara
  kualitas aset/produksi Super Bear atau sudah mencapai 60 fps pada HP.
- Pengujian nyata Android/iOS, kualitas audio melalui speaker/headphone,
  keseimbangan manual seluruh level dan login/cloud di proyek pengguna belum
  digantikan oleh tes otomatis.
- Local Control Lab tetap hanya di development. Produksi meminta akun asli.

## Validasi

TypeScript dan production build PASS. 42 unit tests dan 19 browser tests PASS;
pemeriksaan ulang panel pada desktop, portrait dan landscape termasuk tombol
Solo Medium/Hard/Extreme yang sepenuhnya berada dalam viewport juga PASS.
Tes baru memverifikasi kepadatan naik mulai level 6, ukuran level 21, sidestep
menghindari kue, panel tanpa scroll dokumen, serta preferensi kamera/audio.
Pemeriksaan batas public-env PASS; tidak ada penambahan field environment publik.
Screenshot hanya digunakan untuk QA internal dan tidak disertakan dalam paket.


---

# Maze Hunter M7 — kontrol karakter dan petualangan berzona

Pasang ZIP ini **setelah M6** pada branch `maze-1`. Timpa file dengan jalur
folder yang sama. ZIP hanya berisi file baru/berubah; tidak menyertakan dist,
node_modules, akun uji, atau environment variables. Label versi: **25.10.26-M7**.
Tidak ada commit, push, deploy, atau perubahan rules Firebase otomatis.

## Kontrol dan kamera

Joystick/WASD: atas maju, bawah mundur, kiri/kanan membelokkan karakter.
Diagonal berjalan sambil berbelok. Kamera tidak menjadi acuan arah input.
Q/E atau geser kanan layar memutar kamera secara terpisah. Kamera belakang
mengikuti secara halus; sudut nominal 35 derajat dari bidang tanah (opsi tinggi
sekitar 44 derajat), sebelum penyesuaian tabrakan kamera. Ini menggantikan input
M6 yang mengunci yaw kamera di awal sentuhan dan memiliki basis horizontal keliru.
Tidak ada tombol dodge tambahan pada M7; menghindar memakai gerak dan lompat.

## Retro

Level 1–5 tetap pengenalan. Level 6–100 menggunakan katalog 95 papan baru,
dipilih di luar runtime sehingga HP tidak perlu mencoba ribuan seed ketika
membuka level. Progres profil lama tetap dipertahankan.

Kriteria terukur untuk seluruh 95 papan:

- Graf lintasan adalah pohon: satu solusi dan tanpa loop penghubung solusi.
- Panjang setiap cabang terminal minimal 4 sel; rata-rata minimal 5 sel.
- Persimpangan penting pada rute benar: minimal 4 (level 6–10), 6 (11–20),
  lalu 8 (21–100).
- Rute solusi mencakup 50–65% sel logis yang tersedia untuk berjalan.
- Maksimal 30% sel pada solusi menyentuh batas papan; start/finish di bagian dalam.
- Ukuran papan: 9×9 mulai level 6, 11×11 mulai 11, 15×15 mulai 21,
  kemudian bertambah tiap wilayah hingga 29×29.

Tiga cabang yang semuanya mendekati finish dalam jarak dua sel **tidak dijamin**
pada setiap papan. Tidak ada klaim bahwa pemain pasti salah empat kali atau
pasti tertipu selama separuh cabang: hal itu bergantung pada pemain dan cara
melihat papan. Backtracking bukan kesalahan wajib; jalan buntu tetap mengambil
satu dari tiga nyawa dan mengulang dari Start. Kontak tembok dan mengangkat
jari tetap bebas hukuman. Loop dan jalur yang menyambung kembali dipakai pada
Adventure, bukan dipaksakan ke aturan solusi tunggal Retro.

## Dunia Adventure

10 struktur per tingkat, dengan letak sumber daya/penjaga berubah menurut seed.
Peta logis sekarang 43×43 / 53×53 / 63×63 termasuk taman pelarian di tepi dunia.
Ada tujuh kelompok area: Kebun Liar, Jalur Terlupakan, Wilayah Penjaga,
Simpang Perebutan, Rimba Dalam, Benteng Raja, dan Jalan Kebebasan.

Area terbuka dihubungkan jalur bercabang. Landmark asli prosedural mencakup
bunga, reruntuhan/totem, menara penjaga, tempat sumber daya, dan platform akar
Raja. Palet permukaan/semak berubah menurut zona. Geometri dekat karakter saja
yang dimasukkan ke batch lantai/dinding/daun; kabut membatasi pandangan jauh.
Semua aset tetap low-poly prosedural, bukan aset Super Bear/Roblox berlisensi.
Ini peningkatan prototipe, bukan klaim kualitas visual setara game tersebut.

### Rumput dan sumber daya

- Normal: rumput pendek, dekorasi.
- Tall: rumpun tinggi; B mencari 2 koin dan 2 kue.
- Rare: daun terang, bunga kristal dan cahaya bergerak; 10 koin, kunci,
  satu pelindung dan kecepatan sementara 12 detik.
- Danger: daun ungu/duri, hadiah 8 koin dan 2 kue, membangunkan anak penjaga.
- Semak tebas: batang dan rumpun berbeda, tanda lingkaran ketika dekat;
  B membuka jalur aktual. Jalan rahasia memiliki tanda kunci dan memakai satu kunci.
- Tombol B berubah antara KUE/TEBAS/CARI mengikuti objek terdekat.
- Peti memulihkan amunisi, memberi satu nyawa (maksimal tiga), koin dan kunci.

Koin, buff dan kunci hanya untuk sesi tersebut. Belum merupakan saldo pembelian
kostum/cloud inventory. Empat jenis rumput tidak menggantikan semak tebas.

### Penjaga dan Raja

Medium memiliki 3 penjaga; Hard 5 ditambah 1 penjaga elite benteng; Extreme 7
ditambah 2 elite. Ada **satu Raja utama bersama**, bukan tiga Raja pemicu pelarian.

Raja dilindungi hingga tiga segel ditemukan. HP dasar: 12/18/24 sesuai tingkat.
Fase 1: gelombang hentakan akar, biji, anak pohon. Di bawah 70%: akar penahan
(memperlambat dua detik), putaran duri, sulur dan tambahan penjaga pada tingkat
lebih tinggi. Di bawah 30%: gelombang luas, dahan jatuh, serangan garis dan minion.
Serangan bertanda lebih dahulu 1,5–2,2 detik. Serangan garis divisualkan dengan
bidang peringatan; Raja belum memiliki animasi dash skeletal. Anak penjaga
berukuran lebih kecil. Arena memiliki pasokan kue perlahan agar pertarungan solo
bisa diselesaikan. Musik dan pencahayaan berubah saat pertarungan/phase akhir.

Kue biasa masih slow → stun → kehilangan satu nyawa. Raja Hard/Extreme
mengembalikan pemain ke Start dan mereset penemuan pribadi; segel disimpan.
Co-op tidak menghapus penemuan tim akibat satu anggota terkena Raja.

### Pelarian

Raja tumbang membuka lintasan akar menuju taman pelarian dan memulai timer
45–90 detik. Tidak langsung memenangkan permainan. Timer menonjol dan musik
lebih cepat. Dahan jatuh dengan tanda sebelum benturan.

Tiga pilihan yang diperiksa pada seluruh 30 peta:

1. Aman: memutar, bebas sungai.
2. Cepat: lebih pendek, harus melompati air.
3. Rahasia: pintu berkunci, memotong putaran aman, memberi peti tambahan.

Lintasan aman tidak ditutup secara acak. Rintangan dinamis M7 berupa dahan
jatuh; sistem dinding duri yang menutup/membuka cabang secara berkala belum ada.
Gerbang membesar dan bercahaya saat terbuka. Melewatinya menjadi kondisi menang.

## Online beta

Menu Online menyediakan pencarian room acak, pembuatan room privat Race/Co-op,
dan gabung dengan kode. Google login, RTDB dan Netlify Function asli diperlukan;
lab lokal tidak menyimulasikan akun/room online. Tidak ada env/rules baru.

- Kapasitas Medium 4, Hard 8, Extreme 10; start berbeda dan terhubung.
- Start dipilih berdasarkan biaya rute ke benteng dan jarak antartitik. Ini belum
  jaminan kesetaraan turnamen; uji banyak pemain masih diperlukan.
- Semua pemain siap; host memulai. Pencarian acak mempertemukan pemain di lobby,
  bukan memasukkan pemain baru ke pertandingan yang sudah berjalan.
- Server memvalidasi kepemilikan profil/token, lintasan, anggaran kecepatan,
  urutan paket, cooldown, amunisi, HP Raja, kemenangan dan waktu finish.
- HP Raja, timer pelarian dan jalan pintas dibagikan. Co-op membagikan segel serta
  penemuan dan menonaktifkan friendly fire. Race memakai segel pribadi dan kue PvP.
- Pemain yang sudah finish menunggu hasil; urutan finish memakai waktu server.
- Room aktif tidak otomatis dibatalkan hanya karena presence terputus; tombol
  reconnect tersedia selama room masih aktif. Ini belum jaminan grace period
  tanpa risiko: simulasi/timer server tetap berjalan saat pemain terputus.

**Batas beta:** encounter NPC/projectile/hazard masih disimulasikan per peserta,
dengan HP Raja bersama; belum satu simulasi seluruh NPC yang identik untuk semua
kamera pemain. HP Raja belum diskalakan menurut jumlah peserta. Sinkronisasi
menggunakan snapshot dan Netlify request, belum server tick persisten. Belum ada
uji beban 10 perangkat atau uji koneksi Firebase produksi. Karena itu bagian ini
bukan multiplayer final yang sudah tervalidasi. Papan peringkat global permanen
serta verifikasi catatan keluarga/cloud bukan cakupan M7.

## Verifikasi

Tes mencakup graf Retro, seluruh 30 peta, ketiga pilihan pelarian, empat rumput,
resource/pelindung, tiga fase Raja, timer, gerak, collision, river/jump, snapshot,
kapasitas room, validasi server, segel Co-op dan timer bersama. Browser memeriksa
kontrol terhadap rotasi kamera, arena, pause, multi-touch, resize, tiga viewport,
login gagal yang nyata, Retro playthrough dan cache offline build produksi.

Belum diuji pada speaker/layar sentuh HP fisik, Safari/iOS, FPS Android kelas
menengah, login Firebase live atau dua perangkat online. Tes headless bukan bukti
FPS profesional ataupun keseimbangan rasa bermain. Instal M7, cek label versi,
lalu uji kontrol dahulu sebelum menilai keseimbangan musuh.


---

# Maze Hunter M8 — gerak layar, kamera manual dan identitas petualang

## Pemasangan setelah M7

Gunakan branch `maze-1` yang sudah menerima M7. ZIP M8 hanya berisi file baru atau
berubah dibanding M7, bukan seluruh proyek. Tidak perlu menghapus file lama.
Tidak ada commit, push, deployment, atau perubahan akun/Firebase secara otomatis.

1. **Perbarui Firestore Rules** dengan isi `firestore.rules` dalam paket melalui
   Firebase Console → Firestore Database → Rules → Publish. Dua field opsional
   ditambahkan pada profil yang sama: `appearance` dan `adventures`. Batas akses
   berdasarkan UID dan aturan entitlements tetap dipertahankan. Tidak membuat
   ulang project, database, collection, atau akun.
2. Upload file ZIP yang telah diekstrak ke branch `maze-1`, mengikuti struktur
   folder dan menimpa file yang namanya sama.
3. Jalankan build Netlify seperti sebelumnya. Tidak ada environment variable baru.
   Label home harus **25.10.26-M8**.

Rules disertakan sebagai source, belum dipublikasikan ke Firebase oleh paket ini.
Tanpa pembaruan rules, penyimpanan field kostum/progres Adventure baru dapat
tertolak; cache lokal tetap dipertahankan oleh mekanisme yang sudah ada.

## Gerak dan kamera

- Joystick menentukan arah **layar**, bukan setir kiri/kanan karakter. Kanan:
  karakter menghadap kanan layar dan maju ke sana. Bawah: karakter berbalik lalu
  maju ke arah bawah layar. Tidak memakai langkah mundur atau strafe kepiting.
- Basis gerak dihitung dari arah kamera yang benar-benar dirender pada setiap
  frame. Tidak menyimpan yaw awal sentuhan, dan tanda sumbu horizontal diperbaiki.
- Karakter berputar melalui sudut terpendek dengan interpolasi singkat. Arah
  bergerak dan berhenti langsung merespons input, tanpa momentum berat.
- Kamera mengikuti posisi, **tanpa menyelaraskan putaran dengan arah karakter**.
  Geser area kanan untuk orbit horizontal/vertikal; Q/E untuk orbit keyboard.
  Sudut default 38°, rentang manual 35°–45°. Opsi tinggi memulai sekitar 44°.
- Joystick kiri, kamera kanan dan tombol A/B menggunakan pointer terpisah.
  Gestur kamera tidak dimulai dari tombol A/B. Pengangkatan jari, pembatalan
  pointer dan kehilangan fokus membersihkan input.
- Dorongan besar joystick memakai lari 2,6 sel/detik; dorongan kecil berjalan
  analog. Langkah, ayunan tangan, badan condong, debu dan ekor mengikuti gerak.
- Simulasi memakai substep maksimum 25 ms, dengan catch-up dibatasi 200 ms untuk
  mengurangi tunneling atau perlambatan fisika ketika frame turun.
- Koreksi posisi online kecil dipertahankan melalui prediksi jika masih valid;
  respawn dan koreksi besar tetap mengikuti server. Ini bukan klaim bahwa
  latensi jaringan sudah selesai diuji.

Target respons di bawah 100 ms merupakan tujuan UX. Tes browser tidak membuktikan
latensi layar sentuh atau FPS HP fisik.

## Memegang dan menaiki tepian

Tepian batu berlumut dengan bibir/pegangan berada di beberapa area terbuka.
Pagar labirin tetap membatasi perjalanan; tidak semua tembok dapat dipanjat.

- Berjalan ke batu tertahan dan dapat menggeser di sisinya.
- Melompat sambil mengarah ke tepi/sudut menangkap pegangan.
- Saat bergantung, lepas joystick untuk bertahan; A atau arah menuju tepian
  menarik karakter ke atas. Arah menjauh melepaskan pegangan.
- Tarikan berlangsung sekitar 0,55 detik, dengan pose tangan/ kaki dan elevasi
  yang mengikuti progres. Menjauh dari permukaan atas membuat karakter turun
  dengan gravitasi, bukan teleport ke tanah.
- Penemuan tepian memberi 5 koin sekali untuk tepian itu pada sesi tersebut.
- Pose, elevasi dan status pegangan dimasukkan ke snapshot room. Validasi gerak
  server memeriksa tepian dan tidak menerima jalan lurus melewati badan batu.

## Transisi masuk–keluar

Pergantian layar memakai dua bidang labirin yang menutup, jejak bercahaya, lalu
membuka ke layar berikutnya. Snapshot layar sebelumnya menutup pergantian DOM.
Masuk ke game menunggu canvas siap, dengan batas tunggu agar UI tidak terkunci.

Binding halaman tetap sinkron sehingga popup login masih dibuka melalui klik
asli pengguna. Sentuhan/aksi game ditahan selama cover masuk. Memilih bagian
kostum di halaman yang sama tidak memutar transisi labirin berulang kali.
Modal dan scene memakai fade singkat; preferensi reduced motion melewati shutter.

## Wardrobe dan Home

Enam kategori: Kepala, Wajah, Badan, Punggung, Ekor dan Palet Warna. Terdapat
27 pilihan bagian/palet dengan Common, Rare, Epic, Legendary dan Mythic.

- Item dapat dipadukan. Kartu menampilkan avatar memakai item tersebut, bukan ikon
  baju generik. Kategori punggung/ekor menggunakan sudut pratinjau dari belakang.
- Karakter di ruang kostum dapat diputar dengan drag/swipe untuk memeriksa semua
  sisi. Home tetap menghadap pemain dan memakai kombinasi yang sama dengan game.
- Potret kartu dibuat dengan satu renderer sementara dan cache terbatas; tidak
  menjalankan satu scene WebGL aktif untuk setiap kartu.
- Pilihan lama classic/explorer/raincoat/space tetap dibaca dan dipetakan ke bagian.
  Tiga warna lama tetap gratis. Pilihan kostum baru disimpan pada profil masing-masing.
- Home mempunyai pedestal, gerakan idle, respons sentuhan dan aktivitas ambient.
- Koleksi/Misi menampilkan tiga tugas nyata: bintang pertama, menjelajahi tiga zona,
  dan kemenangan pertama. Status berasal dari progres profil, bukan angka demo.
- Koin dan hasil penjelajahan disimpan sebagai catatan terbaik per peta (maksimum
  30 peta). Penggabungan antarperangkat mengambil maksimum dan gabungan zona,
  sehingga replay/sinkronisasi tidak menggandakan koin secara otomatis.
- Bintang serta kemenangan membuka item. Koin yang ditampilkan adalah koin
  terkumpul dari catatan peta, bukan saldo checkout. Semua kelangkaan hanya kosmetik.
  Tidak ada klaim transaksi uang, subscription atau pembelian toko sudah aktif.

## Retro baru

Level 1–5 tetap papan pengenalan. Level 6–100 menggunakan katalog baru yang
lolos pemeriksaan struktur, bukan pencarian ribuan seed pada HP saat bermain.

- Rute solusi minimal 60% sel logis yang tersedia.
- Minimal 8 persimpangan bermakna pada rute benar, mulai level 6.
- Cabang terminal minimal 4 sel dan rata-rata minimal 4 sel.
- Minimal 3 komponen cabang mengecoh; ukuran proxy: setidaknya separuh sel cabang
  tidak lebih jauh dari tujuan daripada titik masuknya.
- Minimal 2 cabang salah mencapai posisi setidaknya 2 sel Manhattan lebih dekat
  ke tujuan. Ini **bukan** klaim dua cabang berakhir dalam radius dua sel dari exit.
- Start/finish di interior, maksimal 30% sel solusi berada di batas papan.
- Level 6–10 berukuran 13×13, 11–20 15×15, 21–30 17×17, lalu bertambah tiap wilayah
  hingga 31×31. Peningkatan ukuran menyediakan ruang untuk delapan keputusan dan
  cabang panjang; ukuran saja bukan ukuran kelulusan katalog.

Tujuan buah tidak ditampilkan di awal. Lintasan dan tujuannya muncul melalui
penjelajahan dengan garis pandang pendek. Penemuan bertahan ketika kehilangan
nyawa pada run yang sama. Melihat ujung buntu lalu mundur sebelum masuk sel
terminal diperbolehkan, sehingga eksplorasi tidak mewajibkan kehilangan nyawa.

Masuk sel jalan buntu tetap mengulang dari Start dan mengurangi satu nyawa.
Tembok/angkat jari tetap bebas hukuman. Retry run baru mengulang penemuan.
Papan memiliki tema batu, hutan atau akar, dengan canopy menutup wilayah yang
belum dijelajahi. Zoom/pan tetap tersedia. Graf Retro tetap satu solusi tanpa
loop penghubung; jalur menyambung kembali tetap ada di Adventure.

Metode pengukuran adalah proxy struktural, bukan bukti bahwa setiap manusia
pasti merasa tertipu. Generator pengembang disertakan di scripts; browser hanya
membaca katalog JSON yang sudah jadi.

## Navigasi Adventure

- Satu tujuan utama aktif: temukan segel → capai benteng → kalahkan Raja → lolos.
- Zona menampilkan nama, deskripsi singkat dan tingkat bahaya. Penemuan pertama
  zona memberi 3 koin sekali per sesi dan pemberitahuan area.
- Minimap north-up menampilkan area lokal 17 sel agar jalur terbaca pada HP.
  Panah menunjukkan posisi/arah karakter; landmark dan objek muncul setelah
  ditemukan. Benteng ditandai setelah segel lengkap; gerbang ditandai saat terbuka.
- Tombol + pada minimap membuka tampilan seluruh penemuan, × menutupnya. Solo
  berhenti sementara ketika peta diperbesar; pertandingan online tetap berjalan.
- Penanda di tepi minimap menunjuk tujuan aktif yang sudah diketahui tetapi di
  luar area lokal. Peta yang belum dijelajahi tetap tertutup.
- Gerbang menunjukkan syarat segel/Raja, jalan rahasia menyebut kunci yang
  dibutuhkan, segel memberi progres, tepian menjelaskan aksi panjat, dan simpang
  perebutan menunjukkan status penjaga sekitar.

## Batas verifikasi

Build produksi, bundel server room, pengujian logika dan browser lokal dilakukan
sebelum pengiriman. Browser memeriksa kontrol, multi-touch, pose panjat, inventory,
transisi, minimap, ukuran desktop/HP/tablet, login gagal dan cache offline.

Belum ada pengujian pada Android/iOS fisik, Safari, speaker HP, dua akun Firebase
live atau beban 10 perangkat. Rules belum diuji terhadap project produksi.
Multiplayer tetap beta dengan batas simulasi NPC bersama yang dijelaskan di M7;
M8 tidak mengklaim penyelesaian sistem NPC bersama atau pintu dinamis M7.


---

# Maze Hunter M9 — 25.10.26

Apply these changed files over M8 on the maze-1 branch, then build and deploy using the existing workflow. No new environment variables or Firebase rule changes are introduced by M9.

- Retro renders the full maze and its fig goal from the start. The existing branching layouts, difficulty progression and dead-end life rule are retained. Internal exploration tracking is no longer used to conceal the Retro board; Adventure retains its discovery map.
- The Adventure setup and help explain Forest Seals: floating turquoise crystals collected by walking into them. A crystal illustration appears in the briefing; discovered seals use matching diamond markers on the minimap. The main objective identifies their color and shape, and nearby instructions explain collection.
- Wardrobe previews and actual avatar thumbnails frame the selected category more closely: head, face, body, back or tail. Back and tail start from a rear angle; drag/swipe rotation remains available. Palette retains an overall view.
- Boss ammunition recovery already existed: while all three seals are collected, the King is alive and the player is within the arena radius, supplies replenish one cake every two seconds, up to eight. M9 exposes that condition through a shared state getter and an arena hint. The empty-ammo notification explains waiting and dodging inside the arena. Outside the arena, the existing chest/checkpoint refill instructions remain.

Validation: production build and room-server bundle passed; 65 logic tests passed, including empty-ammo recovery on Medium, Hard and Extreme; three targeted browser scenarios passed (wardrobe integration, Retro/Adventure navigation, category focus and seal briefing). Desktop browser images were inspected internally. Physical mobile hardware and real multiplayer latency were not tested in this patch.

Only changed/new source, tests and this note are included. Generated dist assets, dependencies and screenshots are excluded.


---

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

