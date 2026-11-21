# JOB 1F UI19 — Full In-Game UI Correction

Replaces the partial UI18 pass. Scope: in-game Adventure UI only.

- Rebuilt approved HUD layout hierarchy.
- Minimap and four utility buttons use one aligned right-side grid.
- Quest/context text typography reduced and spacing opened up.
- One four-button action-pad owner; generic Ability icon prevents duplicate Cake visuals.
- Rebuilt Settings, Adventure Bag, Adventure Guide and NPC modal presentation.
- Removed forbidden layout overrides / !important from owned UI styles.
- Fixed invalid hyphenated message keys in forest-hud.ts.
- MAZE11 audit no longer duplicates UI ownership checks.

## 2026-11-21 — Home Adventure/Character/Area Progression Delta

**Dasar:** branch `maze-1` setelah delta Organic Binturong, Camera Contact, dan Camera/Pose/Shop Categories. Revisi mengikuti konsep character sheet dan Home game-first yang disetujui.

**Home:** Menghapus posisi lama (mode cards kiri bawah, utilitas berbentuk office card) dan menggantinya di owner `src/home-ui.css`: karakter 3D di tengah, skala preview 85% dari sebelumnya, tombol Classic/Adventure di kanan berbentuk plakat game berlapis, tombol utilitas kiri atas berbentuk emblem yang sama tema, tombol Main yang jelas, dan pemilihan area yang mengubah panorama yang terlihat. Tema latar sesuai biome pilihan dan disimpan secara lokal sebagai pilihan terakhir, dengan animasi 3D karakter/Home yang tetap merespons tap serta drag. Tidak ada penambahan CSS `!important`.

**Model:** Memperbaiki siluet lengan, mengurangi ukuran paw yang menggumpal, dan mengganti lingkaran perut polos dengan shell vest mengikuti torso lengkap dengan tepi jahitan, lapel, resleting, dan kantong. Geometri tetap prosedural; kesamaan penuh dengan ilustrasi sculpted 3D memerlukan verifikasi visual.

**Progress:** Classic dan Forest terbuka sejak awal. Dunia selanjutnya (Desert, Gorge, Mountain, Coast, Sea, Volcano) dibuka setelah empat tahap Solo berurutan di biome sebelumnya. Rank lama tidak di-reset. Expanded Hard/Extreme memakai aturan progres yang sudah ada. Akses review disediakan lewat `VITE_MH_REVIEWER_UIDS` (UID Firebase autentik), bukan nama profil `mf`, dan hanya untuk masuk ke area saat review; tidak menghadiahkan gear/rekor yang tidak diperoleh.

**Berubah:** `src/main.ts`, `src/home-ui.css`, `src/style.css`, `src/presentation.css`, `src/game/menu-world.ts`, `src/game/character.ts`, `src/game/gear-model.ts`, `src/game/adventure-access.ts`, `src/ui/adventure-picker.ts`, `src/ui/forest-icons.ts`, `src/adventure-picker.css`, `scripts/audit-ui-contract.mjs`, `.env.example`, `tests/home-adventure-progression.test.ts`, `history.md`. Tidak mengubah file Retro, logika kamera gameplay, atau seluruh source aplikasi.

**Validasi:** UI19 14/14, MAZE11 22/22 audit lulus; pemeriksaan sintaks TypeScript seluruh file berubah lulus. Build Vite/runtime WebGL belum diverifikasi karena paket npm tidak tersedia secara lengkap di lingkungan eksekusi. Uji dunia di dua perangkat dan server-side enforcement unlock Online belum dinyatakan selesai.

**Pemasangan:** ekstrak ZIP delta ke root source terbaru; tambahkan UID Firebase akun review ke `VITE_MH_REVIEWER_UIDS` di Netlify Deploy Preview agar semua biome dan Expanded bisa dipilih tanpa menyamakan nama profil dengan hak akses. Tidak perlu mengubah cache/progres yang sudah tersimpan.

## 2026-11-21 — Home regression correction (limited scope, NOT character rebuild)

**Baseline:** the existing `maze-1` Home/Character/Unlock revision. This delta targets the reproduced Home regressions seen in user screenshots. It does not claim to fix the still-unapproved body, limbs, outfit, or character rig.

- **Fullscreen and utilities:** The Home utility buttons were rendered *under* the page header stacking context. Moved their existing DOM element into the actual header, preserving button IDs, handlers, and keyboard interaction. Fullscreen remains one owner.
- **Mode choice:** Removed obsolete `.title-screen .mode-selector` rules, including one `!important`, from the shared stylesheet; they still imposed a 46% width on the new right-hand panel. The Home stylesheet now owns mode tile width, insets, text wrapping and responsive layout, with distinct plaque treatment and sufficient spacing.
- **Backdrop:** When the 3D scene renders successfully, the scene-owned sky remains visible and the 440×439 fallback thumbnail is removed instead of scaling it behind the transparent canvas. Fallback art remains for failed WebGL initialization. Home character size remains 85% of its original 1.275 scene scale (now 1.06).
- **No changes:** Retro, camera gameplay, arena layouts, unlock rewards, Wardrobe data, saved progress, or character meshes. The user rejected the segmented character; a genuine replacement needs a continuous surface and rigged character asset, not more sphere primitives or cosmetic CSS patches.
- **Validation:** UI ownership audit 14/14 and Extreme Maze audit 22/22 PASS. TypeScript transpilation syntax checks for affected TS modules passed. Full Vite/WebGL visual QA is **not verified** in this environment; do not label the appearance approved until a tested preview has been compared to references.
- **File scope:** `src/main.ts`, `src/style.css`, `src/home-ui.css`, `src/game/menu-world.ts`, `history.md`.
