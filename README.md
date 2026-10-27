> Current release: **Room Creation & Mobile Entry Hotfix**. Apply after the 46-file Mobile Login, Expedition Items & Voice delta. Read UPDATE_INSTRUCTIONS.md.

# Maze Hunter

Browser-first family maze game with an original fantasy binturong, Indonesian and English, Retro Journey and Adventure. This is a playable browser project; app stores and commercial services are not final.

## Apply this update

Apply this hotfix to the Mobile Login, Expedition Items & Voice release (46-file delta), or use the full source archive. Deploy frontend and Functions together. Voice requires publishing the additive RTDB rules; optional same-origin OAuth redirect requires domain/client configuration before enabling its flag. No new npm dependencies or baseline source removals.

The existing prebuild cleanup still removes only the superseded files recorded in `maintenance/obsolete-files.json`. It validates all existing legacy files before deleting any and refuses customized content. `FILE_REMOVALS.txt` lists those earlier removals. A Netlify build cleans its checkout; permanent repository cleanup still requires the source deletions to be committed by the owner.

## Current scope

- Retro: 100 levels with unchanged staged choices, exact 40/36-step arms, map counts, time and lives. Cells remain square; actual board dimensions determine proportional fit. Phone views enlarge dense boards to a readable initial zoom. Use +/− to zoom, ⊡ for the entire map, and drag away from the character to pan while zoomed. Finger release and wall contact are free; a failed dead end consumes one life and restarts. The maze catalogue has not changed in this update; deceptive route design remains a separate outstanding correction.
- Adventure: landscape gameplay, left joystick, independent right-side camera, A jump/double-jump/climb, B cake/interact, V dive/surface in deep water. Original Solo routes and the accepted authored Forest source remain protected.
- Ngarai: the first implemented biome from the agreed visual guide. Continuous layered cliffs, contoured terraces, shallow stream, shared walkable bridge surface, cave arch, natural stone arch and a broad boss arena. Original animated Ketam Tebing and Raja Batu Retak replace recolored forest enemies in this area. The boss warns before slams, charges and falling rocks; recovery windows and automatic cake refill remain active.
- Other biomes include the earlier Living Biomes revision. This release adds supplies, movable props, marked climbing ledges, optional lava/canyon stepping courses, roads and curated sponsor boards. Voice and mobile-login configuration are documented separately. Swimming/diving and underwater treasure remain available.

## Run and validate

Use Node 24.12 or later in the 24.x line. Install dependencies with `npm ci` when needed.

```sh
npm run dev
npm test
npm run build
npm run test:browser
```

The supplied production catalogue requires no Python or C++ during normal builds. Optional catalogue authoring uses `scripts/generate-retro.py`, `scripts/retro-packing.cpp`, and `scripts/retro-templates.json`.

## Documentation

- `CHANGELOG.md`: the single development-history document and verification results.
- `docs/PROJECT_BRIEF.md`: current product/gameplay constraints.
- `docs/VISUAL_GUIDE.md`: agreed biome art direction and implementation scope.
- `docs/SETUP.md`: existing Firebase/account/environment setup.

Automated viewport checks do not establish physical Android/iOS performance. Production Google login, real multi-client matches, ads, billing/subscriptions and store packaging require their respective final verification. No remote deployment or Git write is performed by preparing this package.
