# Maze Hunter — FG-CORRECTION-01

Apply to the repository AFTER Forest Grove Ring Master 01. This archive contains only changed/new files; it does **not** remove files or change GitHub.

Corrections implemented:
- Same four-button Adventure HUD on pilot and non-pilot maps, with three action buttons on an equal-radius quarter arc from bottom right. CSS imported after previous presentation styles in `src/main.ts`.
- Forest Grove boss hit handling: three-stage guard-like hit progression before a life is lost, 1.9-second hit protection, pilot checkpoint instead of hard reset, longer attack windows.
- Online HUD cleanup and a boss-damage regression test.

Important limitations: not a new Forest Grove level; collision, map design, water, and boss 3D art remain unchanged. Full `npm run build` was not verified in this workspace, because the dependency packages are not installed. Install dependencies under required Node 24 and run the build and tests before committing.

Test locally:
```
npm.cmd ci
npm.cmd run build
npx.cmd vitest run tests/forest-combat-balance.test.ts
```

Important: No GitHub push was performed; apply manually. Repository cleanup/deletion is a separate workflow; do not perform deletions as part of this patch.
