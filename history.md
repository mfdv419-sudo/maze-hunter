# Maze Hunter — Shop 3D Try-On + Verified Ownership Delta

Date: 2026-11-22

## Scope
- Uses 90 real entries from the existing cosmetics / expedition-equipment catalogue. Does not add proposed concepts to players' inventories, alter IDs, prices, rarity, or reward stages.
- Replaces Shop/Wardrobe UI with a single-owner `mh-shop` view, independent CSS, in-scene player character, selectable items including locked ones, and clear **preview only / owned / equipped / pending** states.
- Adds a Three.js OrbitControls try-on scene. Mouse/touch drag rotates horizontally and vertically; wheel/pinch zooms; presets front/left/right/back/top/bottom; +/- and Reset controls. A selected item's appearance exists only inside the preview. It cannot change `Profile.appearance` by previewing.
- Purchase uses the existing ★ stars and existing server-validated `maze-room` Wardrobe settlement (not an external cash payment gateway). Pending purchase reserves ★ but is **not an equip entitlement**. Equip is offered only to owned equipment. Purchases made while offline or in local Lab cannot be initiated; these modes remain preview-only.
- Active equipped appearance and game logic stay unchanged until confirmed purchase. Reuses the current runtime character mesh, NOT the unapproved generic GLB. No camera, Retro, map/world, or gameplay rendering code changed.

## Changed files (relative to repository root)
- `src/main.ts` — Shop selection UI, temporary preview appearance, purchase confirmation, pending sync, category buttons, status and zoom/orbit controls.
- `src/services/cosmetics.ts` — pending no longer counts as owned until server confirms; idempotent pending redeem.
- `src/game/wardrobe-preview.ts` — dedicated Three.js interactive preview renderer with full orbit/zoom and proper disposal.
- `src/wardrobe-preview.css` — new Shop-only layout and responsive controls. No `!important`, no legacy layered CSS overrides on the Shop.
- `tests/shop-preview-ownership.test.ts` — catalogue, preview isolation, pending ownership and settlement tests.
- `tests/browser/shop-preview.spec.ts` — interactive Shop browser regression (requires project dependencies and browser).
- `history.md` — this single handover record.

## Integration
Extract ZIP into the repository root of branch `maze-1`, on top of the previously delivered **Home Live Character Recovery** delta and **Adventure Polish & Shop** catalogue. Overwrite paths with the matching names. No GitHub edits were made.

## Verification actually performed
- Source-level UI audit: 14/14 pass.
- Source-level Maze audit: 22/22 pass.
- 90 unique (slot,id) entries checked via executed cosmetics TypeScript module.
- Runtime wallet tests executed: preview does not write profile; unowned cannot equip; pending reserves currency but does not grant ownership; repeated pending redeem is idempotent; confirmed server-style settlement grants ownership.
- Updated TypeScript files syntactically transpiled with 0 diagnostics.
- Shop CSS parsed with 0 errors; no `!important` in new files.

## Not yet verified / not included
- Full `npm run build` and Playwright browser/WebGL screenshots: unavailable in this environment because npm dependencies could not be installed from the offline package cache (registry DNS unreachable); host Node 22 whereas project targets Node 24.
- High-quality newly sculpted 3D base binturong master and independent GLBs for the 79 mesh requirements: **not created** in this delta. Existing model remains the one used for gameplay, which means similar-looking items will still appear similar until genuinely distinct model assets are produced. This delta solves the try-on workflow, not the sculpture/rigging backlog.
- Real-money checkout/transactions: not implemented; existing Shop uses ★ stars.
