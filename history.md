# Maze Hunter — Forest Grove Extreme RESET07
Date: 2026-11-05
Build: FG-EXTREME-RESET-07-20261105

Implementation based on the post-RESET06 audit. Changed-files-only package.

- Replaced square walkable-floor renderer with continuous textured surface heightfield using pilotGround, shared with physics.
- Removed old authoritative box-wall renderer; collision boundary is rendered as continuous tall natural cliff faces with moss caps.
- Added forest soil path ribbons sourced from authored passage graph.
- Added denser canopy/understory ecology using existing forest art assets while keeping solid trees on blocked navigation cells.
- Waterfall Valley water now comes from sampled explicit water volume and includes upstream stream, cascades, deep basin, downstream channel.
- Fixed pilot aquatic ground: terrain elevation is pilotGround; swimming is controlled by explicit pilotWaterDepth.
- Ground guards use a dry navigation grid for chase routes, not only dry spawn points.
- Baby dragon companion hovers above water instead of following the submerged terrain floor.
- Rebuilt paw as one integrated stylized binturong paw with exactly three short paw digits; removed prior glove/blob/front-pad/cuff masses.
- Removed minimap “Tap map” text.
- Forest HUD hides redundant back arrow and repeated area title.
- Removed legacy Forest action-button positioning; one shared bottom-right arc owns Jump/Merge/Action/Ability positions.
- Improved merchant/clue/quest NPC role silhouettes/props.
- Added RESET07 prebuild acceptance audit.

Validation in implementation environment:
- RESET07 architecture/behavior source audit: 18/18 PASS.
- TypeScript syntax transpile for all changed TS files: PASS.
- Full npm build not claimed because local container does not have the project dependencies installed; Netlify/Node 24 build remains the deployment validation.
