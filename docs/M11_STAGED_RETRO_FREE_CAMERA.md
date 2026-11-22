# Maze Hunter M11 — 25 October 2026

Apply this changes-only archive after M10 on branch maze-1, then build/deploy with the existing workflow. No new environment variables or Firebase rule changes are required. No remote repository or deployment was changed.

## Per-decision 90% rule

The user's clarified rule compares each failed choice with the correct route from that same junction to the NEXT junction, or to the current map's exit if it is the last decision. It does not compare against the entire remaining level.

Every generated section uses either 30 correct edges versus 27 failed edges, or 40 correct edges versus 36 failed edges. Distances count logical room-to-room movement. At a three-choice junction, both failed choices independently meet the same 90% rule. Returning to the previous section is not counted as an offered forward choice.

There are no incidental extra forks or short terminal twigs inside these arms. The graph audit measures every route directly from the playable board and verifies that every visible corridor belongs to a declared arm. It also checks full connectivity, E=V−1, the exact number of offered choices, the absence of hidden intermediate junctions, and all failed-route lengths. Correct choices vary with the generated layouts; no correct route is highlighted.

This replaces M10's acceptance model of eight or more solution junctions and 90% board coverage. Those older targets conflict with the newly specified exact decision counts. Closed islands remain planted ground; they do not create additional fake corridor choices. Levels 1–4 retain their introductory boards. Levels 5–100 have 96 new layouts spanning 176 maps and 296 decisions. Generation runs offline; no search runs on the player's device. The generator publishes its completed catalogue atomically.

| Levels | Forward choices, in sequence | Maps |
| --- | --- | --- |
| 5–10 | 2 | 1 |
| 11–20 | 3 | 1 |
| 21–30 | 3 → 2 | 1 |
| 31–40 | 3 → 3 | 1 |
| 41–50 | 3 → 3 → 2 | 2 |
| 51–60 | 3 → 3 → 3 | 2 |
| 61–70 | 3 → 3 → 3 → 2 | 2 |
| 71–80 | 3 → 3 → 3 → 3 | 2 |
| 81–90 | 3 → 3 → 3 → 3 → 2 | 3 |
| 91–100 | 3 → 3 → 3 → 3 → 3 | 3 |

Each map holds up to two consecutive decisions. From level 41, the earlier maps end with a drawn golden gate and an arrow rather than fruit. The gate fades out/in to the next map, clears the old trace, resets the map zoom, and releases dragging so the player can re-grab the binturong. Reduced-motion skips the fade. Only the last map shows fruit and completes the level. The HUD and hints identify the current map and target.

All maps belong to one level: one timer, three lives, one final result and one final progress save. Crossing a gate does not award stars or advance the level. Entering any dead end costs one life and returns to the LEVEL Start on map 1, preserving elapsed time. Lifting a finger and touching walls remain free. Existing saved completion records are retained.

## Flexible Adventure camera

- Vertical right-side dragging now permits 0–65 degrees; it is no longer restricted to 35–45 degrees.
- The default comfortable angle is 22 degrees. The ↕ button cycles comfortable 22°, high 55°, and eye-level 0° without changing yaw.
- Settings can retain an eye-level initial preset across reloads. Both previous presets remain valid.
- Q/E orbit; R/F raise/lower the angle on a keyboard. Left joystick movement remains independent of right-side look gestures and action buttons.
- Movement turns the character toward travel; camera yaw never automatically follows the character's heading.
- In a clear area, 0° is physically horizontal. A foreground hedge can temporarily lift/shorten a low camera arm to keep the torso visible. Close-obstacle protection avoids filling the screen with the head. Existing angular and positional smoothing remains active.
- Phone gameplay bar labels shrink/truncate within their available space so the guide, camera and pause buttons remain visible.

## Validation

68 logic tests passed, including winning routes for all 100 levels and direct graph audits on all 176 generated maps. The staged audit verifies every failed arm's measured ratio is exactly 0.9, not merely catalogue metadata. Multi-map tests cover incomplete gates, final-only ratings, time/pause, later-map death and clean retries.

Nine targeted browser scenarios passed across focused runs: real mouse gate transition and later-map reset through a final win; camera presets and simultaneous joystick/vertical dragging; eye-level preference reload; physically horizontal camera in an unobstructed real clearing; legacy Retro mouse/lift/unlock; phone wall/dead-end/rotation behavior; Adventure keyboard/resize; illustrated guide pause/resume; three-finger joystick/camera/A interaction. The phone trace test now waits for the existing entry transition cover before sending raw touch events.

Production build, server-room bundle and generator syntax checks passed. The standard large-chunk build warning remains. Desktop and phone-viewport renders were inspected internally. Physical Android/iOS hardware, real multiplayer latency and player difficulty testing remain unverified.

Only changed/new source, generator, tests and this note are included. Dist output, dependencies and internal screenshots are excluded.
