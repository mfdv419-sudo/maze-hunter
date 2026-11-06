# Maze Hunter history

## UI Contract 12 — 2026-11-06
- Removed layered Forest/Adventure HUD CSS ownership.
- Added one authoritative `adventure-hud.css` for HP/stamina, minimap, utility controls, joystick, contextual mission/dialogue/enemy/oxygen HUD.
- Rebuilt `adventure-action-pad.css` as the sole owner of Jump, Action/Throw, Ability and Merge geometry.
- Rebuilt `forest-pilot.css` as Forest-only component skin; it may not reposition global HUD.
- Removed Adventure geometry `!important` rules from legacy `presentation.css`.
- Added `audit-ui-contract.mjs`; Netlify prebuild fails on forbidden `!important`, duplicate UI ownership, legacy Adventure overrides, or CSS import-order regression.
- UI contract applies to every future Maze Hunter area/screen; approved components are frozen unless the user explicitly requests a redesign.
