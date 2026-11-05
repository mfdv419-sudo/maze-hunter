# Maze Hunter — History

## 2026-11-05 — Forest Grove Extreme RESET06
- Extreme Forest Grove remains the only active master baseline; Forest setup and preview force Extreme instead of Medium.
- Fixed pilot terrain source-of-truth: visual/physics terrain uses `pilotGround`; swimming uses explicit `pilotWaterDepth`.
- Removed legacy maze floor/wall/earth rendering underneath Extreme master to prevent duplicated/inverted layers and square-tile terrain.
- Rebuilt Extreme renderer around one organic Surface heightfield, one separate Underground terrain, and actual Floating islands only.
- Replaced uniform brown box walls with natural cliff/boulder/tree boundary visualization tied to the same navigation grid.
- Master renderer owns physical ledge visuals; legacy ledge renderer is disabled for Extreme to prevent duplicated stairs/bridges/platforms.
- Added denser forest canopy/understory, deep Waterfall basin and multi-stage water flow, natural Green Cliffs, Ruins, Chasm, Giant Tree, Underground and Floating identities.
- Paw revised to `single-animal-paw-v6`: one animal paw silhouette only; no explicit fingers, front-pad second hand, thumb, or glove cuff.
- Walk cycle corrected to contralateral gait (opposite arm and leg advance together).
- Removed legacy Forest action-button positioning; shared Adventure action pad is authoritative.
- Quiz availability endpoint remains deployed/wired without login/Firebase Admin requirement for availability checks.
- Added `scripts/audit-extreme-reset06.mjs` to prebuild; build fails if core routing/HUD/paw/terrain/quiz architecture regresses.
