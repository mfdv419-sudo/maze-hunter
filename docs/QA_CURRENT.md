# Current verification — 27 October 2026

- PASS: 145 Vitest tests, 23 files. Full output in TEST_RESULTS.txt.
- PASS: TypeScript and production Vite build. Existing vendor chunk-size warnings remain non-blocking.
- PASS: Netlify maze-room Function esbuild bundle, external packages retained.
- PASS: simultaneous Race and Co-op prediction/acknowledgements with 1.8–3 second round trips; lost-response retry; legal slow path validation and wall/speed rejection.
- PASS: camera occlusion fades, restores materials, preserves camera pose and handles rebuilt instanced wall bounds.
- PASS: all 10 sea slots share three ships; thirty unique diamonds lie on decks; shared renderer/swimming surfaces; underwater chest preserved; King remains aquatic.
- PASS: high cascades, lava contact damage, above-cliff falling rocks, charge/roll/bubbles, single shared Co-op awakening and six-second protection, old payment receipts and real progression.
- Browser: local CPU/SVG rendering of source geometry inspected. UI camera fixture showed opacity 0.08 then 1.00 and unchanged camera coordinates. Fixtures removed before packaging.
- LIMIT: browser WebGL is disabled; full in-game visual rendering, physical-device audio, live two-device Firebase multiplayer and production deployment were not verified.
- No mock data was written to production. No Firebase configuration, database, rules or deployment modified.
