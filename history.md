# Maze Hunter history

## UI Contract 12 — 2026-11-06
- Removed layered Forest/Adventure HUD CSS ownership.
- Added one authoritative `adventure-hud.css` for HP/stamina, minimap, utility controls, joystick, contextual mission/dialogue/enemy/oxygen HUD.
- Rebuilt `adventure-action-pad.css` as the sole owner of Jump, Action/Throw, Ability and Merge geometry.
- Rebuilt `forest-pilot.css` as Forest-only component skin; it may not reposition global HUD.
- Removed Adventure geometry `!important` rules from legacy `presentation.css`.
- Added `audit-ui-contract.mjs`; Netlify prebuild fails on forbidden `!important`, duplicate UI ownership, legacy Adventure overrides, or CSS import-order regression.
- UI contract applies to every future Maze Hunter area/screen; approved components are frozen unless the user explicitly requests a redesign.

## JOB 1 — UI/UX FULL REBUILD 13 · 2026-11-06
- UI engineering contract enforced: no `!important`, no layered layout overrides, one owner stylesheet per component family.
- Added dedicated owners: `home-ui.css`, `ui-pages.css`, `retro-ui.css`; rebuilt `adventure-hud.css` and `adventure-action-pad.css`.
- Removed duplicate Home/Adventure/Retro/Page selectors from legacy `style.css` and `presentation.css`.
- Restored actual `mountAdventureActionPad()` runtime mount/update/dispose path that had regressed out of `main.ts`.
- Adventure action controls are exactly four buttons: Jump, contextual Action/Throw, Ability, Merge. No floating ability selector.
- Ability button cycles available abilities instead of spawning an extra floating selector.
- Adventure HUD uses one owner for health/stamina, minimap, utilities, joystick, transient quest/dialogue and enemy/boss status.
- Utility controls near the minimap are normalized to one compact grid; legacy playbar remains hidden in Adventure.
- Home redesigned as a game lobby while preserving Retro/Adventure direct mode selection and interactive character preview.
- Collection, wardrobe, ranking, Adventure setup, guide/settings, inventory/shop presentation consolidated in `ui-pages.css`.
- Retro HUD separated into `retro-ui.css` so Adventure changes cannot regress Retro layout.
- Forest-specific CSS is now skin-only and is forbidden from positioning global HUD/action controls.
- Strengthened `audit-ui-contract.mjs`; build fails for forbidden `!important`, duplicate owners, missing action-pad runtime mount, duplicate mode bindings, or CSS ownership order regression.
- Updated MAZE11 audit UI assertions to the new UI contract without changing map/gameplay topology.
- QA: UI ownership audit PASS; MAZE11 audit 26/26 PASS; changed TypeScript transpile PASS; CSS parse PASS; full local typecheck blocked by incomplete dependencies/Node 22 while project requires Node 24.12+.
