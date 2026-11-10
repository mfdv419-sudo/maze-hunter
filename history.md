# Maze Hunter — JOB 1C Gameplay UI16

Scope: gameplay UI only. No Home or world/map layout changes.

Key fixes:
- Final Adventure HUD now mounts for every Adventure runtime, not pilot-only.
- HUD runtime made safe when `layout.pilot` is absent.
- Approved left-top character condition panel: HP, stamina, level, XP.
- Approved top-center progression counters: coin, Mfeer, sigil.
- Compact/collapsible quest tracker; hidden during NPC dialogue.
- World-anchored NPC dialogue.
- Right-top minimap + proportional utility rail.
- Dynamic/elastic floating joystick remains the sole movement UI.
- Approved four-button quarter-arc action pad; no duplicate selector/belt.
- Short pickup feedback; no permanent quick inventory strip.
- No forced CSS overrides and no legacy geometry ownership.
- New prebuild audit `audit-job1-gameplay-ui16.mjs` checks the runtime contract.

Validation:
- UI16 audit: 19/19 PASS
- MAZE11 regression audit: 24/24 PASS
- TypeScript transpile syntax: PASS
- CSS brace parse: PASS
