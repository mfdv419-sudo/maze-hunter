# Maze Hunter — Camera / Character Pose / Wardrobe delta

Apply to the `maze-1` branch **after** the following existing packages (if not already applied):
- `maze-hunter-adventure-polish-shop-delta.zip`
- `maze-hunter-adventure-camera-contact-delta.zip`
- `maze-hunter-character-wardrobe-motion-delta.zip`
- `maze-hunter-binturong-organic-rebuild-delta.zip`
- `maze-hunter-organic-rebuild-build-audit-fix-delta.zip`

Copy only the included paths into the repository root. This ZIP does **not** include a full source tree.

## Focused changes
1. Adventure camera: if its eye is physically embedded in terrain or a wall, seek the nearest collision-free location toward the player with stable search order. This recovery **is not activated** merely because the camera touches a wall. Preserve default 7.2 radius / 18-degree pitch and user-controlled free-view angle. Do not re-enable side switching or zoom oscillation.
2. Occlusion: replace stippled `alphaHash` masking on obstructing geometry with smooth local blending. No camera pass-through.
3. Binturong: put shoulders slightly farther apart, preserve palms-inward orientation and existing rig; move foot toe pads behind toe tips and under the sole to remove dots seen from in front.
4. Shop: categories are equipment types (headwear, face, outfit, backpack, tail, colors, gloves, shoes), shared across all biomes. Retain all 42 earned expedition items and their established prices/unlock logic; show biome and stage as *item metadata* rather than using a biome filter.

## Validation performed in this environment
- `audit-job1-full-ui19.mjs`: 14/14 pass.
- `audit-extreme-maze11.mjs`: 22/22 pass.
- Static TypeScript syntax/AST checks of changed TS files: pass.
- Camera logic executed with an isolated vector/collision test harness: embedded-wall recovery, stationary wall contact, stable recovery, and free-view hold after release pass.
- Full `tsc`, `vite build`, and rendered WebGL check: **not completed** because project dependencies were unavailable locally (`registry.npmjs.org` DNS failure). Validate on Netlify Deploy Preview and actual Android/desktop before sign-off.

## Scope exclusions
No changes to Retro, currencies/reward accounting, arena layouts, server, action buttons, general HUD, or persisted user profiles.
