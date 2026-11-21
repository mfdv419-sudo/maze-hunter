# Maze Hunter — Character, Wardrobe & Motion Delta (2026-11-21)

## Apply
Overlay the files in this ZIP onto the existing `maze-1` branch **after** the previously delivered Adventure Camera Contact delta. Preserve their directory structure. User handles GitHub upload and deployment manually. No files are deleted.

## Scope
- `src/game/gear-model.ts`: inward-facing resting paws and 3D attachments for worn expedition apparel, eyewear, boot details, backpack tools and premium suit emblems. Equipment details follow the animated character rig; the original 42-item Shop matrix, purchases, free unlocks and rewards remain unchanged.
- `src/game/character.ts`: arm and leg gait polish, body/head lean during a turn, landing response, support for visible equipped garments in Home, character preview and gameplay.
- `src/game/climbing.ts`: ledge-grab from a rock requires an intentional jump from below the rim; prevents accidental re-grab as the character steps/falls off a platform. Tree and palm climb remain possible.
- `src/game/forest-guardian.ts`: animation polish for Forest guardian / Root King locomotion, heavy idle and hit/attack timing, without changing combat stats or model size.
- `src/main.ts`, `src/ui/loading-waterfall.ts`, `src/arena-loading.css`, `public/adventure/forest-loading.webp`: new approved Forest loading composition: explorer at left, looking into the multi-layer floating-island maze. Moving waterfall overlay adjusted to the new scene. Non-Forest loading art stays untouched.
- `tests/character-revision.test.ts`: tests for palms, outfit attachment and ledge behavior.

## Scope exclusions / unchanged
- Gameplay camera logic, Action Pad, HUD, Retro mode, stage unlocks, Shop prices, reward balance, terrain and multiplayer protocol are not modified by this ZIP.
- Not a replacement for the full model/rig of every guardian in every biome or a fully authored animation library. No new melee damage mechanics.

## Verification
- Standalone local syntax transcription checks: PASS for all changed TypeScript files (TypeScript `transpileModule`).
- Script audits: Job 1 UI 14/14 PASS, MAZE11 22/22 PASS.
- Isolated ledge logic checks: 4/4 PASS.
- Full `tsc`, Vite build and browser/WebGL visual QA: **not verified in this environment** because project dependencies could not be installed (npm registry unavailable). User should verify in deployed build, including equip/unequip across wardrobe and gameplay, and devices.
