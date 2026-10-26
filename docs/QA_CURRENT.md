# Terrain & Online — current verification

- 124 tests / 20 Vitest files: PASS. Complete output: TEST_RESULTS.txt.
- Six handler tests with controlled Firebase Auth/Firestore/RTDB: private create, initial-null-cache join, compatible random matching, missing/expired room rejection, mode isolation and ready/start, missing server config (503), expired token (401).
- Easy: 80 area/map combinations connected; correct smaller dimensions, keeper HP and boss HP.
- Wall geometry: six distinct high native styles; batched detail meshes.
- Gorge vs Desert: separate crab/skink and stone/sphinx rigs and bounds.
- Sea boss position: swimmable home and nearby fighting positions; no dry arena disc.
- Bridge fall: valid edge fall costs one heart and returns to checkpoint, even with a shield.
- Environmental hazards: warning, active phase, dodge, and sea trash damage.
- Reachable prop kinds and additional roaming guards: PASS.
- Super cake color, effects, stock, save restore: PASS.
- Existing exact Retro branching, preservation of Solo/authored Forest, physical primary-route traversal and Co-op/Race isolation: PASS.
- TypeScript, Vite production frontend and bundled Node Function: PASS.
- Browser: actual Online dialog markup measured with 48px buttons and corrected grid; eight area options and four difficulties, including Volcano Easy, observed through game menu.
- New 3D browser render: BLOCKED by unavailable WebGL in the test browser. Not a verified visual pass.
- Real project Firebase configuration, live multi-device rooms and physical-phone performance: NOT VERIFIED. No credentials or production URL were supplied and no production deployment was changed.
