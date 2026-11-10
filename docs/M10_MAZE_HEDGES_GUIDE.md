# Maze Hunter M10 — 25 October 2026

Apply this changes-only package after M9 on branch maze-1, then use the existing build/deploy workflow. No environment-variable or Firebase rule changes are needed for this patch. No remote repository or deployment was changed.

## Retro: uncertainty replaces solution-length scoring

The old generator privileged a solution occupying at least 60% of available rooms and accepted terminal branches as short as four cells. That rewarded a long correct corridor with short visible distractions. M10 replaces that acceptance model for levels 6–100; levels 1–5 remain introductory.

The build-time generator now generates a connected tree, repairs short terminal limbs by rewiring cycles back into a tree, and removes only the remaining short twigs. Every catalogue board is then audited directly from its graph:

- At least two available directions at Start, with a wrong branch there reaching at least half the complete solution distance.
- At least eight junctions along the solution.
- At least three major wrong branches reaching at least 50% of the remaining correct distance from their junction, each also at least eight cells deep.
- At least two of those branches occur in the first half of the solution and extend at least 50% of the full solution distance.
- At least one major branch falls in the 50–70% range relative to the remaining correct route. Others can be longer.
- At least one major wrong branch contains two or more further decisions.
- Terminal limbs have at least six edges; small incidental branches are not all 50–70% of the complete solution. The long-branch ratio is a requirement for major deceptive choices, not a claim about every twig.
- At least 90% of logical rooms are connected and used. Actual catalogue coverage is 94.7–99.8%. Unused closed pockets render as planted ground rather than empty beige rooms.
- One unique solution. E=V−1 and full reachability are checked on the actual open graph. Retro remains fully visible, including its fruit goal.

Example: level 21 has a 43-edge correct route. Two early wrong routes reach 26 and 24 edges from their junctions, rather than terminating after five moves. Distances count logical room-to-room movement, not raw pixels or turns of the pointer.

The catalogue is generated offline by scripts/generate-retro-v10.py. Search and scoring never run on the player's phone. Existing saved completion records are retained; they are not invalidated by the revised boards.

## Adventure hedge presentation

The faceted per-cell crowns are replaced by joined hedge cores and lightly bevelled, trimmed tops. A deterministic 256px leaf atlas adds individual leaf shapes and veins, including wrapped edges. The hedge tint changes smoothly with distance, rather than flipping between bright and dark tiles at line-of-sight boundaries. Existing zone colors, solid collisions, cuttable grass, camera controls and discovery minimap remain functional. This patch does not convert the Adventure layout into the circular real-world reference photograph.

## Illustrated Explorer Handbook

A ? button in the gameplay bar and an Item guide button inside Help open a separate ID/EN panel. Eight illustrated entries explain Forest Seals, stars, chests, keys, cakes, shields, coins and cuttable grass. It distinguishes the turquoise seal crystal from the outline shield indicator; there is no independent diamond currency.

The text reflects current behavior: Retro stars unlock cosmetics; Adventure stars record optional expedition collections; coins currently record best collection totals rather than funding a shop. Chest and shield effects match the simulation. Solo pauses while the book is open and resumes on close; online matches keep running on the server and display that notice. The book scrolls internally on a small screen.

## Validation

- 67 logic tests passed, including all 100 Retro playthroughs, graph-based audit of all 95 revised boards, multiplayer room regressions and existing Adventure tests.
- Five targeted browser scenarios passed: illustrated guide with Solo pause/resume, phone width and English text; full level-21 board; textured hedge rendering; full Retro/Adventure navigation; minimap expansion and pause.
- Production build and Netlify room-server bundle passed. The standard large-chunk warning remains.
- Desktop/phone-viewport renders inspected internally. Physical Android/iOS devices, real multiplayer latency and player difficulty/playtesting are not certified by these checks.

The archive contains only changed/new source, tests, generator and this note. It excludes dist, dependencies and internal screenshots.
