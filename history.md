# Maze Hunter — Fix Netlify TS2552 cosmeticKey (2026-11-22)

## Error
Netlify Deploy Preview PR #1: TypeScript build fails at `src/main.ts` lines 984, 1012, and 1054 with `TS2552: Cannot find name 'cosmeticKey'`.

## Cause and resolution
The latest Shop try-on code calls `cosmeticKey(c)` to look up pending purchases, but its `src/main.ts` import from `./services/cosmetics` omitted the helper. That helper **already exists** and is exported in the Shop delta's `src/services/cosmetics.ts`.

**Changed:** `src/main.ts` — add `cosmeticKey` to the named import from `./services/cosmetics`. No purchase, preview, user-profile, model, or game logic was changed.

**Added:** `tests/cosmetic-key-import-contract.test.mjs` — prevents the same missing-import regression.

## Install
Unzip into the source root on the `maze-1` branch and replace only listed paths. This `src/main.ts` is based on `maze-hunter-shop-orbit-preview-verified-purchase-delta.zip` (the version matching the three failed Netlify line numbers). Apply over that Shop delta and the later Character V2 delta. Do not upload an older `main.ts` afterward. No direct GitHub edits have been made.

## Validation
- Verified the three failing lines against the exact Shop delta source.
- Verified `cosmeticKey` exists in `src/services/cosmetics.ts`.
- Executed the regression test with the Shop service file in place.
- Parsed/transpiled the changed TypeScript source, no syntax diagnostics.

Netlify's complete `npm run build` must still be run on the deployed branch; this offline container does not have the project's npm dependencies available. This package does not fix or claim to fix character/preview visual bugs.
