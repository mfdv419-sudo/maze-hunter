# Maze Hunter History

## JOB 1A — Gameplay UI14 — 2026-11-06
- Scope corrected to in-game Adventure UI only; Home/Adventure-selection UI changes from JOB1 are rolled back by removing their imports.
- One owner for Adventure HUD geometry and one owner for the four-button action pad.
- Removed legacy gameplay geometry ownership from style.css/presentation.css.
- Removed runtime inline positioning/scaling of action-controls from touch-controls.ts.
- Four buttons only: Jump, Context Action/Throw, Ability, Merge. No floating selector or bottom item belt.
- Minimap opens directly on tap; no + toggle. Utilities remain proportional beside minimap.
- Adventure camera reset is no longer a separate floating gameplay button; camera reset remains in Settings/Guide flow.
- UI audit and MAZE11 regression audit are run in prebuild.
