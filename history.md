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
