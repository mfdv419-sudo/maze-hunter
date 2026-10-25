# Maze Hunter M9 — 25.10.26

Apply these changed files over M8 on the maze-1 branch, then build and deploy using the existing workflow. No new environment variables or Firebase rule changes are introduced by M9.

- Retro renders the full maze and its fig goal from the start. The existing branching layouts, difficulty progression and dead-end life rule are retained. Internal exploration tracking is no longer used to conceal the Retro board; Adventure retains its discovery map.
- The Adventure setup and help explain Forest Seals: floating turquoise crystals collected by walking into them. A crystal illustration appears in the briefing; discovered seals use matching diamond markers on the minimap. The main objective identifies their color and shape, and nearby instructions explain collection.
- Wardrobe previews and actual avatar thumbnails frame the selected category more closely: head, face, body, back or tail. Back and tail start from a rear angle; drag/swipe rotation remains available. Palette retains an overall view.
- Boss ammunition recovery already existed: while all three seals are collected, the King is alive and the player is within the arena radius, supplies replenish one cake every two seconds, up to eight. M9 exposes that condition through a shared state getter and an arena hint. The empty-ammo notification explains waiting and dodging inside the arena. Outside the arena, the existing chest/checkpoint refill instructions remain.

Validation: production build and room-server bundle passed; 65 logic tests passed, including empty-ammo recovery on Medium, Hard and Extreme; three targeted browser scenarios passed (wardrobe integration, Retro/Adventure navigation, category focus and seal briefing). Desktop browser images were inspected internally. Physical mobile hardware and real multiplayer latency were not tested in this patch.

Only changed/new source, tests and this note are included. Generated dist assets, dependencies and screenshots are excluded.
