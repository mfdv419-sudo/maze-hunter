# Verification — 2026-10-26

- 110 Vitest tests, 18 files: PASS (qa-unit-result.log, refreshed after final generation).
- Entire 176-map catalogue: unique, reachable, exact choice counts, 40-step correct / 36-step failed routes, >=95% density, winding-route and deceptive-endpoint checks: PASS.
- Original Solo and authored Forest layout preservation: PASS.
- Five keepers per region, dormant/awake save restore, fixed Co-op roster, shared contribution credit, no friendly fire, private Race boss and gates: PASS.
- Wallet repeated purchase, merging, rejected overspend/unknown items, legacy ownership and independent equipment: PASS.
- Optional high terrace: single jump cannot grab; double jump can; elevated star cannot be collected from ground: PASS.
- Six original enemy pairs: distinct names/rigs, finite articulated geometry, dormant monuments: PASS.
- TypeScript and Vite production build: PASS. Function bundled with esbuild for Node: PASS.
- Browser observed: Home illustrated fallback, selection of Forest/Gorge/Desert, unique area card compositions, level illustrations, Retro Level 1 canvas with 48px square cells, functional pause dialog.
- 3D browser render, physical phone performance, production Firebase sync and live multi-device Co-op/Race: NOT VERIFIED. Available cloud browser cannot create WebGL contexts. No previous browser-test count is reused.

Release ZIP overlay and automatic removal are checked against the exact uploaded archive, then compared byte-for-byte with packaged source. See DELTA_MANIFEST.json for hashes.
