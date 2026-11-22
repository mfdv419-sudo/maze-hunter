# Maze Hunter — Organic Character Rebuild (Delta)

## Root and scope
Apply to the current `maze-1` branch **after** the Character Wardrobe & Motion delta.
Only these files have changed:
- `src/game/organic-avatar.ts` — new soft mesh/loft/curved-accessory construction
- `src/game/character.ts` — rebuilt Binturong head, body, rig attachment meshes, face, accessories and wardrobe integration; existing animation API and tail preserved
- `src/game/gear-model.ts` — rebuilt paws, toes, feet, wearable outlines and accessories as rounded organic forms
- `tests/organic-avatar-rebuild.test.ts` — geometry, costume and animation smoke tests

## Visual direction
- Replaces main cuboid head/torso with smooth skull, cheek/jaw, tapered trunk, overlapping sculpted limbs, rounded paws/feet, scarf, goggles and backpack.
- Keeps hands resting beside the legs with paw pads oriented toward the trouser side seams, rather than facing forward.
- Keeps the same model factory for Home, wardrobe thumbnails, game hero and networked avatars. Existing outfit selections are retained and rendered against the new character dimensions.
- Keeps Binturong identity, original active animation controls, tail and gameplay proportions; this is not a replacement of collision/player physics.
- Shape is built from stylized smooth procedural meshes, not a baked professional sculpt/GLB; final visual likeness remains for in-game review.

## Invariants
No changes to Retro, camera, world geometry, Netlify, Shop ownership/economy, HUD, or game controls.

## Validation status
The three changed TypeScript source files have been checked using TypeScript's transpile syntactic diagnostics. **Full Vite/Three.js WebGL build and visual QA could not be run locally**, because the supplied repository did not include installable node dependencies and registry access is unavailable here. Do not regard the model as visually approved until a Deploy Preview is checked on mobile and desktop.

## Manual QA
1. Home: compare front/side/back silhouette and paw orientation with the concept sheet.
2. Change wardrobe from leaf/goggles to explorer hat and scuba gear; confirm no floating accessories.
3. Move, jump, swim, climb, attack, turn and inspect elbow/knee seams and tail.
4. Watch gameplay camera without changing its rules: verify model does not obscure it.
5. Test on a narrow mobile viewport and watch frame rate with more than one avatar.
