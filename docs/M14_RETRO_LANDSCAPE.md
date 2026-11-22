# Maze Hunter — M14 Retro landscape correction

Apply this changed-files package after **M13** on `maze-1`, replacing matching files at the project root. Rebuild the existing application. No Firebase rules, environment variables, online match rules or Adventure changes are included. No repository or remote deployment was performed.

## Cause and correction

M13 used a 53 × 53 square envelope with short paths placed in separate sectors. Large unused areas were rendered as repeated green dots. Fitting the entire square to screen height made the actual corridors extremely small on landscape phones.

M14 replaces that geometry and presentation:

- Every Retro map is a landscape rectangle, with width and height carried separately through drawing, collision, route tracing and viewport fitting.
- Introductory levels use a fully carved rectangular maze. Levels 5–100 use a new compact catalog; branch trails weave next to each other across one connected labyrinth. Local path expansion absorbs unused pockets while retaining one solution and the specified decision count.
- Solid walls, a warm floor and a thin continuous wall network replace the dotted vegetation pattern. There is no fog in Retro.
- The arena adapts to the available screen area with modest rectangular cells. Phone portrait rotates the view and input coordinates together; it does not regenerate the board or reset progress.
- On an 844 × 390 landscape viewport, the tested level bands occupy more than 85% of screen width and the hardest corridors have at least 18 px in both dimensions at the initial full-maze view. Zoom remains available for closer tracing.
- Zoom controls are in the HUD, outside the maze, so no route or endpoint is covered by those buttons.
- Start retains the binturong; the last map retains its fruit goal. Earlier maps retain their map gate.

## Rules retained

The accepted 60 / 90 / 120 / 150 second schedule, immediate countdown on entering a level, three lives, pause, harmless wall contact/finger release, later-map reset to map 1, and final-map-only reward all remain.

The accepted branch progression remains 2; 3; 3→2; 3→3; 4→3→4; 5→4→4; 5→4→4→3; 5→5→4→4; 5→5→5→4→4; 5→5→5→5→5 across the corresponding level bands. Four/five options still use a **compact decision hall** because a four-neighbour cell cannot have five outgoing routes plus its incoming route.

Each failed branch is still exactly 90% of its corresponding correct route to the next decision or map goal. The compact catalog uses 40/36 steps for two-choice stages and 50/45 steps for stages with three or more choices. The paths fill the maze rather than adding a sparse perimeter corridor. All paths and their real graph lengths are audited, including the connector to the following decision.

Existing level results and unlocked progression are preserved. Map geometry is updated for replayed levels; an already running browser session must reload to receive the new build label **25.10.26-M14**.

## Validation

**84 logic tests passed**, including audits of all 176 generated maps; **7 targeted browser scenarios passed** across the regression runs; production TypeScript/Vite build passed. Checks cover all 176 generated maps, actual branch lengths, unique routes, endpoints, rectangle bounds, input transforms in both orientations, phone corridor size, gate progression, dead-end reset and rendering on early and late levels. Physical phone touch feel remains to be checked on the user's device.
