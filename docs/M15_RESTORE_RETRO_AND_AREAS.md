# Maze Hunter — M15

Apply **after M14** at the existing project root on `maze-1`. This package contains changed/new files only. No commit, push or remote deployment was performed.

## Apply

1. Replace matching files from this ZIP.
2. Rebuild/deploy the frontend **and `netlify/functions/maze-room.ts` together**. The room API now includes the selected area and separates public matchmaking queues by area, difficulty and match type.
3. Publish the included **`firestore.rules`** in Firebase → Firestore Database → Rules. The only rule change increases the existing `adventures` map limit from 30 to 210, allowing separate progress for seven areas × three difficulties × ten map slots. Ownership, profile fields and entitlement protections are unchanged. No environment variables or Authentication settings are added.
4. Reload and check the Home build label: **26.10.26-M15**.

## Retro: restore the accepted game

- Levels **5–40 use the exact catalog entries from the accepted M11/M12 baseline**, including walls, Start, goal, decisions and branch lengths. Introductory levels also return to the earlier generator. M13/M14's replacement layouts are no longer the source for these levels.
- Level 41+ keeps the latest approved 4/5-choice progression. Its new catalog removes the fixed straight central connector: links wind through corridors, goal rows vary, whole-page reflections vary, and the correct branch is selected from all available directions.
- The full map and goal stay visible. No fog, hint arrow or solution overlay was added. The earlier warm path/green-stone wall palette is restored. The player's own traced path remains visible.
- Latest timing is preserved: 60 s for 1–20; 90 s for 21–40; 120 s for 41–80; 150 s for 81–100. The timer starts on scene entry. Three lives, harmless wall contact/finger release, pause, map gates and reset to map 1 are unchanged.
- Failed branches remain exactly 90% of the correct route to the next decision or current map goal. All actual graph lengths and one-solution topology are audited.
- Retro supports landscape and portrait through its existing drawing/input transform. Accepted maze geometry is preserved instead of forcing every legacy board to become a different rectangle. Zoom stays in the HUD.

## Adventure: preserve and add

The original **SOLO ASLI / ORIGINAL SOLO** still uses the existing generated 43/53/63 maps. **FOREST · CONTOH / FOREST · SAMPLE** still opens the accepted authored 81×81 Medium forest. The original `adventure-layout.ts`, `forest-layout.ts` and `forest-world.ts` files are unchanged from M14.

Additional expeditions are separate choices:

| Choice | Medium | Hard | Extreme | Theme |
| --- | --- | --- | --- | --- |
| Labirin Asli / Original Maze | 43 | 53 | 63 | Existing SOLO routes |
| Hutan Rimbun / Forest Grove | 81 | 105 | 129 | Canopy, keeper lodge, mossy highlands |
| Gurun Surya / Sunlit Desert | 81 | 105 | 129 | Cacti, sandstone, oasis, ruins |
| Ngarai Toska / Turquoise Gorge | 81 | 105 | 129 | Tall cliffs, crystal cave, shallow pool |
| Gunung Awan / Cloud Mountain | 81 | 105 | 129 | Slopes, snowy silhouettes, camp, ledges |
| Pantai Senja / Sunset Coast | 81 | 105 | 129 | Palms, cove, coastal lodge, beacon |
| Laut Karang / Coral Sea | 81 | 105 | 129 | Surface swimming, coral and animated fish guardians |

Sizes are grid width × height. New areas use three-cell-wide corridors and a large boss clearing. Layout candidates are checked **after** clearings are opened: minimum Start-to-King path 140/220/300 cells, plus spatial separation. Templates are deterministic by area, difficulty and map index; run variation changes secondary placements. New expedition limits are 30/40/55 minutes. The protected Forest example retains its existing limit and authored routes.

Each new expedition has three guarded seal quests, a journal, optional stars/chests, climbable ledges, round trail obstacles, a moving King with armor/counterattack windows, telegraphed area attacks and a timed final escape. Terrain, actor heights and camera use the same heightfield. Sea swimming is a **surface swim**; it is not a diving/oxygen system. Gorge and oasis water is shallow wading water.

Progress records are namespaced by area, preserving the old SOLO keys. Adventure records include an area filter. The protected Forest sample still keeps rewards local to the sample, as before.

## Online area selection

Choose an area on the Adventure picker, then Online → Race or Co-op. The area is stored on the room and validated by the server. Joining by code uses the room's actual area; public matchmaking never mixes areas or difficulties. Medium/Hard/Extreme capacities remain 4/8/10. Server and client rebuild the same map from the room's area, difficulty, index and seed. Co-op retains 3 × participants shared seals; Race retains three separate sites per participant.

Existing rooms without area metadata default to the original maze. NPC encounters retain the existing per-participant simulations with shared King health. This revision does not claim a new globally unified NPC simulation, real ten-device stress testing, or live Firebase verification.

## Menus and orientation

- The Adventure picker has a preview captured from its real playable 3D scene, seven illustrated area cards, unified action buttons and a visible guidance button.
- The menu artwork uses original lightweight vector scenes appropriate to each theme; profile, records, collection and Retro map pages use different world backgrounds. Home and wardrobe keep their existing actual 3D avatar scenes.
- Guidance covers area selection, controls, quests, seals, King and online match types; the illustrated item guide remains available.
- Adventure setup, lobby and gameplay require landscape. In portrait an overlay asks the player to rotate. Solo input and its clock pause; online authority/timers continue. Rotating back resumes the same run. Retro remains available in both orientations.

## Validation

Validation passed: **91 logic tests across 15 files**, **9 unique targeted browser scenarios** across the regression runs, the production TypeScript/Vite build and the Netlify room-function bundle. Automated coverage includes baseline preservation, all Retro maps and branch ratios, winding high-level connectors, new-area reachability and distance, unique starts, thirty distinct seal sites, server/client world parity, and physical traversal through all three quests and escape for each new Medium area. Browser checks cover real menus, guidance, all six additional 3D themes, preserved SOLO/Forest entry, orientation, records/collection backgrounds and Retro touch/map transitions.

New area art is an initial playable pass for further polish. Physical Android/iOS performance, production sign-in and a real ten-device match have not been certified. Subscriptions, top-ups and store publication are outside this revision.
