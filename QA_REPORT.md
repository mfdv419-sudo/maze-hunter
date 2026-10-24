# Maze Hunter — verification report

Date: 2026-10-23. Baseline: uploaded `maze-hunter-maze-1.zip`.
Status: **first playable browser implementation; final release gate not met**.

## Baseline evidence

All entries in the uploaded `maze-1` and `maze-hunter-modern-hidden-maze` archives were byte-identical after stripping their outer directory names. `main` differs mainly in CI and the previously fixed source typing/API calls. The old runtime is combat/shard based; Retro was only a palette switch; fog affected only the minimap; online Auth/Firestore/rooms were absent.

Before the new implementation, dependency installation, typecheck, three legacy unit tests, level validation and production build all completed successfully in this environment. Successful baseline build did not establish compliance with the new gameplay design.

## Executed checks

| Check | Result | Evidence/scope |
| --- | --- | --- |
| `npm run typecheck` | PASS | Strict TypeScript including frontend and Netlify function source |
| `npm run test` | PASS | 17 tests across levels, gameplay/progress and authoritative room reducers |
| `npm run validate:levels` | PASS | Four level suites: all 100 Retro layouts unique, deterministic and solvable; 10 regions; distinct fair Modern entrances across 60 generated scenarios; ordered difficulty sizes/vision |
| `npm run build` | PASS | Vite production output generated with lazy game/engine chunks and versioned service worker |
| Netlify function bundling | PASS | `maze-room.ts` bundled for Node with esbuild; not a deployed Firebase invocation |
| `npm run test:browser` | PASS | Five Playwright Chromium tests, including production offline asset cache |
| Visual review | PASS for inspected layouts | Desktop 1360×900, phone portrait 390×844 and landscape 844×390, rendered screenshots inspected internally |
| Delta reconstruction | PASS | ZIP checked for corruption; delta plus explicit deletions reproduces the final source tree byte for byte |

### Browser test scope

1. Google login gate and ID/English menu switching; no simulated production account.
2. Actual Retro mouse playthrough, lifting/regrabbing, real star result and next-level unlock.
3. Modern 3D canvas, keyboard input exercise, resize, pause/resume and no page runtime errors.
4. Phone touch events via Chromium DevTools Protocol: one wall penalty per gesture, lift/regrab, orientation change preserving lives, then completing the valid path with the expected two-star score. Canvas dimensions are checked before continuing after rotation.
5. Built production excludes the local control lab; service-worker cache contains Retro/Phaser assets and production UI reloads without network.

The browser tests do not log in as a Google user. They use a separately labeled development-only control lab to exercise gameplay. That lab does not exist in the production build and does not simulate Firebase or online multiplayer.

### Pure logic test scope

- Sliding along walls, preventing tunneling, line-of-sight obstruction.
- Retro pause, timer/life exhaustion, invalid path rejection, honest rating and clean new session.
- Progress merge preserving best time/stars and sequential unlock across missing levels.
- Four-player room capacity, host/ready conditions, movement validation and replay rejection.
- Race winner cannot be overwritten; Co-op requires all players; leave ends the match without invented victory.

### Issues found and resolved during testing/review

- Two Retro layouts initially duplicated; deterministic regional selection now rejects duplicates and sorts by route length.
- Production offline reload initially failed to match cached module responses with differing `Vary` request headers. Static assets are now matched from the current named cache by their allowlisted path with `ignoreVary`; the offline regression test passes.
- Rotation could race Phaser's delayed resize. The Retro host now has a ResizeObserver, and the touch regression waits for matching canvas/host dimensions before continuing.
- Near walls obscured a small Modern character. Camera framing and character scale were adjusted; near-camera walls lower for readability.
- Timer accumulation uses elapsed time, separately from capped movement integration. Failure no longer selects a victory animation.

## Not verified / unfinished

| Area | Actual status |
| --- | --- |
| Google sign-in against the owner's project | NOT VERIFIED — real web app configuration/authorized domains were not supplied |
| Family cloud save, account switching and authenticated offline resume | NOT VERIFIED against live Firebase; source/rules/local merge logic included |
| Race/Co-op with 2–4 independently connected users | NOT VERIFIED — client, server function and rules included, but no real Firebase backend/session credentials were available |
| Room security rules in a Firebase emulator or production | NOT VERIFIED — must be checked with the owner's actual rule set; do not overwrite unrelated project rules |
| Netlify deploy/remote GitHub Actions | NOT VERIFIED — no remote branch changes or deployment performed |
| Real ad serving/frequency callbacks | NOT VERIFIED — placement adapter included; publisher account approval/configuration absent |
| Subscription checkout, recurring billing, paid costume ownership/restoration | NOT IMPLEMENTED — provider/prices/commercial terms not selected; no simulated purchase buttons |
| Physical Android/iPhone performance and Safari/iOS browser behavior | NOT VERIFIED — headless Chromium/mobile viewport tests do not prove physical-device performance |
| Full family playtesting of all 100 levels | NOT VERIFIED — all layouts validated algorithmically; human difficulty and comfort require review |
| Final character polish, additional animal roster and production audio | PARTIAL — procedural animated binturong, four looks and simple sound controls implemented |
| Google Play/App Store build and publication | DEFERRED until final browser acceptance |

## Build observations

The production build reports large vendor chunks. Approximate engine bundle gzip sizes: Phaser 340 kB, Three.js 130 kB, Firebase 215 kB. Engine bundles are split; offline preparation intentionally caches the game modules. No runtime model downloads, detailed fur textures or external image packs are required for the procedural character.

Tests ran on Node 24 in this execution environment; the original Netlify/CI configuration targeted Node 22 (corrected to Node 24 by the 2026-10-24 fix below). Chromium 153 was used through an existing executable path after the default browser CDN download returned an invalid archive in this environment. The project itself supports normal Playwright browser installation and does not depend on that local executable path.

No source credentials, generated build output, node_modules, browser binaries or internal screenshots are included in the deliverable ZIP.


## Netlify deploy correction — 2026-10-24

The supplied Netlify deploy log shows TypeScript/Vite and Function bundling succeeded; deployment then failed because the secret scanner matched the two public Firebase browser configuration values. It also showed Firebase packages requiring Node >=24.12 under a Node 22 build. That runtime configuration in the earlier package was incorrect.

Changes: Node 24 in Netlify, CI and .nvmrc; package/lockfile minimum Node >=24.12 <25; secret scanning remains enabled with only five explicitly public Firebase web keys omitted; Firebase source reads only its required fields instead of serializing import.meta.env; a production bundling regression checks unrelated/server values stay out of frontend output.

Reverification on Node 24.22.1:

| Check | Result |
| --- | --- |
| npm ci --engine-strict --ignore-scripts --no-audit --no-fund | PASS; no EBADENGINE mismatch |
| npm run typecheck | PASS |
| npm run test | PASS — 17 tests |
| npm run validate:levels | PASS — four suites |
| npm run build | PASS |
| npm run check:public-env | PASS — five public fields retained, unused VITE values and server marker excluded |
| npm run test:browser | PASS — five Chromium tests |
| Netlify configuration and delta archive validation | PASS locally |
| New Netlify deployment and its real secret scanner | NOT VERIFIED — no remote account mutation/deploy performed |
| Google authentication/room services | NOT VERIFIED against owner's Firebase project |

The failed deploy's listed environment did not include VITE_FIREBASE_APP_ID; the owner must confirm it in the deploy-preview build context. It is required for client initialization but is distinct from the secret-scanning failure. No real secret value appeared in the supplied log, and none was requested or inserted into the fix.
