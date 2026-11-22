# Forest Grove P0 — World, waterfall and collision alignment

Base: supplied `maze-hunter-maze-1 (1)(1).zip` (includes all 22 unchanged files from Delta 4.3).
Scope: pilot world generator only. No gameplay camera, Retro, HUD or Online changes.

## Changes

- `src/game/forest-pilot.ts`: terrain across multiple broad elevational bands (lower woodland, foothills, cliffs, tree route, sanctuary), riverbed preserved; trees favor the solid side of open path edges.
- `src/game/forest-pilot-world.ts`: continuous volumetric waterfall with a real side profile and foam strands; uses current upper-stream and pool coordinates.
- `src/game/forest-traversal.ts`: elevated decorative beam/waterfall rocks no longer act as full-height invisible blockers; elevated trees cannot block ground below their trunks.
- `tests/forest-p0-world.test.ts`: regression checks for elevation coverage, tree placement, waterfall volume/raycasting, overhead collisions.
- `history.md`: development notes and test limitations.

## Checks performed in this environment

- All three edited TypeScript source files passed TypeScript syntax/transpile diagnostics (0 errors).
- Pure terrain/layout check on the Medium pilot: 1,837 dry walkable grid samples; 76.9% above 0.5 elevation; entrance ~0.03, Green Cliffs ~2.34, Giant Tree ~2.62, Sanctuary ~2.16, Waterfall Valley -2.8; 409 tree sites, 295 adjacent to path borders; all placed on blocked grid cells.
- Full `npm ci`, `npm run build`, Vitest, 3D renderer and physical device tests **could not run** here: dependencies are not fully cached / registry request timed out; runtime Node 22 is below project's Node 24 requirement.

## Important limitations

These edits address generator geometry and identifiable invisible ledge colliders. They are **not yet proof** that the rendered gameplay matches the approved image or that all world collision bugs are gone. Terrain transitions, waterfall appearance, frame rate, pickup/quest logic, dive and equipment, and the actual deployed commit still need runtime verification. The source changes are provided as a focused P0 candidate for integration/testing, not a claim that all Forest Grove revisions are complete.

## Suggested acceptance run after installing on Node 24 and the target branch

1. `npm ci && npm run build && npm test -- tests/forest-p0-world.test.ts tests/forest-revision.test.ts tests/forest-traversal-update.test.ts`.
2. Deploy the branch being tested, hard reload, and verify the commit/version matches that build.
3. Walk through entrance, hub, cliffs, ruins and waterfall; inspect the cascade from the front and side; try walking under the Ruins overhead beam and around the pool without invisible walls.
4. Regression-check the original laptop/tablet layout and smartphone layout. No HUD or gameplay-camera source was edited in this delta.
