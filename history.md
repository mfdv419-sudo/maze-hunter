# Maze Hunter History

## FG-EXTREME-VISION-09 — 2026-11-06
- Replaced generic capsule/sphere NPC placeholders with coherent low-poly woodland characters: torso, head, muzzle, ears, eyes, paws, legs, tail, clothing and role-specific accessories.
- NPC visual position, interaction position and collision use the same authored world point.
- Player can no longer pass through NPCs.
- Extreme world relocates NPC sites out of water volumes onto dry reachable terrain before collision/content is committed.
- NPC proximity uses the NPC's rendered position rather than the center of the stall/site.
- NPC clue/shop prompt is projected above the NPC in screen space; removed fixed bottom-left world dialogue behavior.
- Merchant Action opens the actual RPG buy/sell inventory flow.
- Empty quick-item belt is hidden instead of showing empty boxes at bottom center.
- Rebuilt Adventure action pad with one fixed responsive quarter-arc: Jump large lower-right, three smaller actions on the same sweep; removed trig-based positioning that overlapped on different aspect ratios.
- Rebuilt player hand paw as one integrated three-digit animal paw with central pad and proportional wrist; rebuilt bare foot paw in the same design language.
- Changed cliff soil to neutral earth brown and guaranteed visible canopy trees on selected cliff-top solid cells.
- Bumped Extreme build to FG-EXTREME-VISION-09-20261106.
- Added VISION09 prebuild audit for NPC model/collision/water placement, NPC-anchored dialogue, action-pad ownership, paw model, cliff color and canopy presence.

## FG-EXTREME-MAZE-10 — 2026-11-06
- Replaced long Entry travel corridors with genuine braided maze connectors: parallel choices, cross-links, loops and rewarding dead ends.
- Removed unrequested gameplay quick belt and disabled floating ability selector; Adventure action pad is again the only four-button control surface.
- Rebuilt action-pad geometry so all four button centers share one radius from the bottom-right corner.
- Expanded minimap now frames explored territory instead of the entire 181x181 layer; undiscovered portals are hidden.
- Solid shops/ruins/NPCs use runtime collision instead of mutating or silently disabling maze collision.
- NPC placement requires dry reachable terrain; merchant/clue NPC cannot silently fall back into water.
- Added visible world pickup meshes and auto-pickup for gather/activity rewards.
- Widened soil paths and added brown soil clearings so Surface is not a single green carpet.
- Corrected hand paw local axis and foot sole/pad orientation; paws continue the limb direction instead of projecting outward.
- Added prebuild audit `audit-extreme-maze10.mjs` for these acceptance requirements.

## FG-EXTREME-MAZE-11 — 2026-11-06
- Fixed Adventure action-pad regression: one clean four-button arc only; removed overlapping layout behavior.
- Merchant interaction is explicit: Action button becomes shop button and is always enabled near merchants.
- Main Quest panel is contextual/temporary instead of permanently covering gameplay; hidden while NPC dialogue is active.
- NPC dialogue remains anchored to the NPC and no longer competes with the quest panel.
- Surface art direction changed to soil-first forest floor with layered grass patches, dirt paths, and lighter natural earth cliffs instead of an all-green carpet/dark brown walls.
- Build: FG-EXTREME-MAZE-11-20261106.
