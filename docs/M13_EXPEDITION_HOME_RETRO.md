# Maze Hunter — M13

Apply this changed-files package **after M12**, on the user's `maze-1` working branch. Extract at the project root and replace matching paths. This package contains source changes only. It does not deploy, commit, change Firebase rules or require new environment variables. Netlify must rebuild the frontend **and** its existing `maze-room` function together because online jump and quest rules changed.

## Home

- Retro Journey and Adventure open directly; the redundant Play button is removed. Signed-out players can start Google sign-in from either mode.
- A tap gives a short jump with both arms raised outward. Holding and dragging rotates the equipped 3D character through a full turn, preserving the chosen angle after release. Enter/Space also greets; arrow keys rotate the focused mascot.
- Corrected shoulder direction to keep hands outside the torso. The account control uses a profile icon instead of a text chevron.
- Responsive controls recalculate their bottom inset after resize/orientation changes. The journal button sits below the action controls.

## Forest expedition (Adventure → Hutan Rimbun · Contoh)

- Replaces the compact M12 sample with an authored **81 × 81** Solo expedition, five-cell main trails, distant branches, optional treasure paths and a larger eight-cell-radius boss arena. Expedition limit: 25 minutes.
- Three quest destinations: shallow flooded gorge/cave, an abandoned lodge with a physical south entrance and interior, and an elevated moss grove reached by stone treads. A journal supplies directional clues and live guardian/collection status in Indonesian and English. Each seal stays locked until its own quest guardian is defeated.
- A continuous rendered heightfield supports slopes, highland elevation and the depressed cave pool; character, items, walls, camera and effects follow the same terrain height. Water in the cave is shallow wading water, not a new underwater/swimming biome. The existing small river crossings remain jump hazards.
- Rock gorge walls and lodge walls use separate materials. The cave has a blue irregular pool, foam edge and moving ripples. Roofs lift near the player to keep interiors playable. Tall canopy and real trail trees retain collision.
- Seals are taller turquoise crystals with gold orbit rings and stone bases. Treasure chests have rounded lids, bands, seams and locks. Picking up a chest opens a reward window showing actual gains after inventory caps: coins, key, cakes and hearts. Solo pauses for this window; online play continues.
- The forest King pursues, circles at close range, charges toward a marked point, fires a fruit spread and varies roots, lightning and area attacks. Roots have visible emerging branches. Armor blocks cake spam; a brief counterattack window follows major attacks, with a visible shield and HUD prompt. Hit cadence is limited during the window. Cake refill remains available in the live arena.
- Enemies, including the King, use line of sight beyond the small minimap discovery radius so an enemy in a visible clearing no longer vanishes at the discovery boundary. The minimap still tracks discoveries separately.
- Character animation adds outward greeting arms, airborne poses and idle looking/breathing. In this Solo forest sample the explorer carries a trekking pole, stowed while throwing or climbing. Gloves and boots are modeled as part of each existing non-classic body outfit; there are still six account cosmetic slots, not separate glove/shoe purchase slots.
- Sample rewards remain expedition-local and do not add account wins, stars, coins or unlocks. Existing normal Adventure maps and online beta remain separate menu entries.

## Double jump and online seals

- A second A/Space press in the air gives a continuous upward impulse from the current height. A third impulse is rejected until landing. The same height function and checks run on the Adventure server; remote avatars receive the boost metadata. The old non-Adventure legacy room path retains its existing single-jump server behavior.
- New online Adventure rooms freeze their starting slot roster. Co-op creates **3 × participants distinct reachable seal locations**, shared by the team: 4 players need 12; 8 need 24; 10 need 30. Race assigns three disjoint locations to each participant. New rooms are required to use this rule; existing rooms without roster metadata retain their former layout.
- These online changes apply to the existing generated Adventure maps. The authored forest expedition remains Solo. Online NPC encounters still use the existing participant simulations with shared King health, rather than a newly unified global NPC simulation.

## Retro campaign

The timer starts when the level scene opens, before touching the mascot. Pause still freezes it. The entire maze remains visible. Failed branches remain 90% of their corresponding correct route, measured to the next decision or current map exit.

| Levels | Forward choices | Maps | Shared time |
| --- | --- | --- | --- |
| 1–4 | Introduction | 1 | 60 s |
| 5–10 | 2 | 1 | 60 s |
| 11–20 | 3 | 1 | 60 s |
| 21–30 | 3 → 2 | 1 | 90 s |
| 31–40 | 3 → 3 | 1 | 90 s |
| 41–50 | 4 → 3 → 4 | 2 | 120 s |
| 51–60 | 5 → 4 → 4 | 2 | 120 s |
| 61–70 | 5 → 4 → 4 → 3 | 2 | 120 s |
| 71–80 | 5 → 5 → 4 → 4 | 2 | 120 s |
| 81–90 | 5 → 5 → 5 → 4 → 4 | 3 | 150 s |
| 91–100 | 5 → 5 → 5 → 5 → 5 | 3 | 150 s |

Four/five forward options use multiple tunnel entrances along one decision hall. A square-grid point cannot support five outgoing routes plus its incoming route. Hall paths therefore share the hall's interior segment while remaining separate long tunnels. Actual graph audits verify the advertised choices, unique route, reachable cells and exact 90% failed-route lengths. There are no decorative extra dead-end stubs. Levels 5–40 keep their previously accepted geometry; 41–100 use the new catalog. Timer and lives continue through gates; a dead end returns to the level's first-map Start.

## Validation and limits

Validation: **81 logic tests** passed across 13 test files; **15 unique targeted browser scenarios** passed across M8/M12/M13 runs; production TypeScript/Vite build and the Netlify room-function bundle passed. Automated checks cover all Retro maps, quest locks, heightfield continuity, chest caps, boss armor and pursuit, double-jump rejection, thirty unique seal locations and server Co-op sharing. Browser checks cover menu entry, rotation, countdown, wardrobe, journal, camera, phone layout and representative locations.

No physical Android/iOS, live Firebase sign-in, real ten-device session or store deployment has been tested. Rendering and animations remain procedural Three.js models; this is an expanded playable build, not a claim of finished commercial art or certified device frame rates. Other biomes, deep swimming/fish guardians and top-up billing are not part of this revision.
