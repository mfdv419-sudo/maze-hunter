# Maze Hunter

Browser-first family maze game with an original fantasy binturong, Indonesian and English, Retro Journey and Adventure. This is a playable browser project; app stores and commercial services are not final.

## Apply this update

Use the latest delivered project on branch `maze-1` as the baseline. Extract the changed-files ZIP over it, preserving relative paths, then rebuild the frontend and Netlify functions together. No new environment variables, Firebase rules, dependencies or file deletions are required by the canyon update. Do not upload the ZIP itself as the site source.

The existing prebuild cleanup still removes only the superseded files recorded in `maintenance/obsolete-files.json`. It validates all existing legacy files before deleting any and refuses customized content. `FILE_REMOVALS.txt` lists those earlier removals. A Netlify build cleans its checkout; permanent repository cleanup still requires the source deletions to be committed by the owner.

## Current scope

- Retro: 100 levels with unchanged staged choices, exact 40/36-step arms, map counts, time and lives. Cells remain square; actual board dimensions determine proportional fit. Phone views enlarge dense boards to a readable initial zoom. Use +/− to zoom, ⊡ for the entire map, and drag away from the character to pan while zoomed. Finger release and wall contact are free; a failed dead end consumes one life and restarts. The maze catalogue has not changed in this update; deceptive route design remains a separate outstanding correction.
- Adventure: landscape gameplay, left joystick, independent right-side camera, A jump/double-jump/climb, B cake/interact, V dive/surface in deep water. Original Solo routes and the accepted authored Forest source remain protected.
- Ngarai: the first implemented biome from the agreed visual guide. Continuous layered cliffs, contoured terraces, shallow stream, shared walkable bridge surface, cave arch, natural stone arch and a broad boss arena. Original animated Ketam Tebing and Raja Batu Retak replace recolored forest enemies in this area. The boss warns before slams, charges and falling rocks; recovery windows and automatic cake refill remain active.
- Other areas retain their previous implementation. Their proposed new visual identities and enemies are documented, not yet implemented. Swimming/diving, coconut climbs and underwater treasure remain available.

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
