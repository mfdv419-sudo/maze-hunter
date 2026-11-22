# Maze Hunter — Binturong Mascot Proportion Delta (2026-11-22)

**Scope:** `src/game/character.ts` and `src/game/gear-model.ts` only, plus this history and contract test. **Base:** the organic/modular Binturong runtime after the `restore-modular-character-wardrobe` delta. Apply over the latest branch `maze-1`, replacing only listed files. Do not upload the full source ZIP or edit GitHub directly through a tool.

## Actual source changes

- Rebalanced Binturong proportions: larger rounded head, fuller cheeks, shorter muzzle, more compact pear-shaped torso, shorter upper/fore arms and legs, distinct shoulder/elbow/knee joints.
- Reworked face geometry: wider glossy eyes/catchlights, curved whiskers, rounded ears/ear tufts, visible smile/tongue and short animal snout.
- Rebuilt the clothing silhouette as a continuous **front-and-back** vest shell, with rear yoke, lapels, seams, pocket hardware, lower stitched hem, and scarf. Hat brim/crown, round goggles and backpack placement adjusted to suit the larger head and compact torso.
- Revised paw/finger proportions to look less like large mittens, while retaining **palms facing the outer thighs** in neutral stance. Foot paws/boots remain independently selectable and support diver fins.
- Thickened the tail while retaining its procedural curve, idle motion and charm attachment.
- Preserved public `createBinturong()` and `Character.animate()` contracts, item keys, inventory/reward lookup, source of saved outfits, animations and game mode integration.

## What is and is not done

**Implemented:** runtime modular 3D geometry and size/shape changes in game code. The package is **not just a 2D character sheet** and does not replace the actual character with an image.

**Not implemented or not verified:** this is **not** a new hand-sculpted `.blend` / independently skinned `.glb` master. It does **not** complete 79 independently sculpted Shop assets. Full Vite build, actual WebGL browser rendering, animation rig quality and pixel-level match to the approved concept image are **not verified** in this environment. Do **not** label this artwork approved until preview comparison on the real application passes.

**No changes:** Shop preview controls, Shop prices/purchases, camera gameplay, world terrain, Retro Mode, ownership/rewards, Home layout and source profiles.

## Install and validation

1. Extract ZIP into the source root on your working branch `maze-1`; preserve file paths, replace the two `src/game` files.
2. Prerequisite: `src/game/organic-avatar.ts` and `src/game/expedition-equipment.ts` must already exist from prior organic/modular deltas; this ZIP does not replace those files.
3. `node tests/binturong-mascot-v2-contract.test.mjs` (passes on this package).
4. `npm run typecheck` and `npm run build` in your repo. Then review character from front, 3/4, side and back, with vest, scarf, hat, backpack, bare paws and boots, in Home and Shop. Also inspect run/swim/jump/flip to detect joint/mesh clipping.
5. If the visual character is below the approved image quality, **do not call it final**; that still requires a production-quality sculpted, skinned master model and independent modeled accessories.
