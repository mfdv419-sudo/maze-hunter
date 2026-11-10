# JOB 1B — Final Gameplay UI15

Scope: Adventure in-game UI only. Home/menu and Forest world/map are intentionally unchanged.

Locked implementation:
- one anchored bottom-right action-pad: Jump + Action/Throw + Ability + Merge
- no duplicate context/ability icon
- Adventure joystick is dynamic floating with elastic follow
- top-left character status: HP, Stamina, Adventure Level and XP progress
- top navigation progress chips: Mfeer, XP, Coins
- minimap + proportional utility controls remain one navigation group
- Main Quest defaults compact, expands temporarily on progress or manually on tap
- quest hides while NPC dialogue is active
- no quick belt / floating selector / legacy HUD geometry
- no forbidden CSS !important; no runtime action-pad positioning

Validation:
- JOB1 gameplay UI15 audit: 16/16 PASS
- changed TypeScript transpile parse: PASS
- changed CSS brace parse: PASS
