# MAZE HUNTER — CANONICAL PRODUCT AND IMPLEMENTATION BRIEF

This document supersedes conflicting product directions in the original prompt, old source, old README, old screenshots and branch names. The latest agreed design is authoritative. `maze-1` is the technical comparison baseline, not a mandate to retain incorrect gameplay.

## 1. Product and platforms

Maze Hunter is a family maze game with two distinct experiences. Browser first, including desktop and phone. Google Play and App Store implementation begins after the browser game is final. Do not claim store readiness from a web deployment.

## 2. Identity and character

The primary mascot is an original fantasy binturong inspired by Indonesian fauna. The approved direction is the simple low-poly/block-shaped concept, not the earlier detailed fur illustrations. Use a broad simple head, short muzzle, tufted ears, expressive prehensile segmented tail and a recognizable maze emblem. Preserve an original silhouette and personality. References communicate accessibility and simplicity, not permission to copy their characters, proportions, assets or branding.

Build a real 3D character with separate animatable limbs/body/tail. Walking, turning, stopping, idle and celebration should transition smoothly. Feet must not keep walking against a blocking wall. Costumes preserve recognizable character features. Start with one working character and one costume test before expanding the roster. Additional fantasy fauna and costume collections follow the same art direction. Paid characters/costumes confer no competitive advantage.

## 3. Retro Maze Journey

Trace a valid route from START to FINISH with finger or mouse. This is not combat, shard collection or a palette toggle. Provide 100 distinct deterministic levels, ten regions of ten, a journey map, sequential unlock, timer, three lives, honest 1–3-star performance, retry and result screens.

Lifting a finger never consumes a life. Regrab at the last valid point. A wall crossing is rejected and costs at most one life per gesture. Do not teleport across a wall when the pointer moves quickly. Backtracking/dead ends are allowed. Levels must remain usable on a phone; use zoom/pan when a dense map would make corridors too small. Difficulty needs measured structure and family playtesting, not only a changed label.

Only Retro is required offline. First account authentication and content preparation require internet. Save local profile progress and synchronize on reconnection without discarding legitimate results.

## 4. Modern Hidden Maze

Actual 3D stylized world, simple geometry and materials suitable for a browser on a phone. Angled overhead follow camera; players are not required to rotate it. Expose nearby paths, hide unexplored areas, remember discovered areas dimly, and block vision through walls. Do not leak finish or hidden paths through other UI.

Provide real multiple entrances, Medium/Hard/Extreme and actual finish/timeout conditions. Continuous movement with rounded collision, sliding, substeps and smooth visual turning. Structure may use a grid; movement must not snap to cells. Near-camera walls must not hide the character. Keyboard and touch controls must both work. Resizing or rotating must not restart the game.

Phaser is a 2D framework. Retain suitable components, but permit a dedicated 3D renderer when the agreed design requires it. Do not force the new design into an incompatible old renderer.

## 5. Multiplayer final gate

Race and Co-op are required before the browser game can be called final. Initial private rooms support 2–4 players. No bots presented as online users. Authenticated profiles, room capacity, ready/start, separate fair entrances, synchronized state, server-validated results and disconnect handling are required. Co-op shares discovered map information and requires the team to finish. No free-text chat is needed for the first family release.

Do not claim multiplayer ready merely because its client/server code compiles. Verify independent clients against deployed backend services.

## 6. Accounts and language

Mandatory parent Google sign-in with separate family nickname profiles. Each profile has its own progress, language and equipped costume. Profiles are not separate Google accounts. Parental account actions own purchases and subscription management. No fake login or production bypass.

Bahasa Indonesia and English are required. Localize menus, tutorial, gameplay feedback, results, wardrobe, subscription descriptions and errors where feasible. Keep language changes from destroying active gameplay.

## 7. Monetization

Free with ads at natural breaks after several levels; never interrupt a trace or an online match. Subscription removes advertising. Paid funny costumes are cosmetic. Family members' progress remains separate. Purchased ownership must survive subscription cancellation according to the final commercial model.

Provider approval, actual checkout/billing and server-verified ownership are separate from UI and cannot be simulated. Prices/provider have not yet been chosen. Do not invent sales, payments, entitlements or receipts. Offer earned cosmetics as implemented gameplay content without calling them purchases.

## 8. Source and work rules

Audit existing source first. Retain valid build/deployment/integration utilities. Replace contradictory combat scenes, retro-palette behavior, minimap-only fog, fake races and outdated visual rules at their actual source. Avoid parallel active runtimes implementing the same responsibilities. Preserve valid prior data without translating unrelated combat results into new campaign completion.

Do not commit/push/merge remotely. Deliver a tested ZIP delta with original relative paths and an explicit deletion list. Include dependencies/lockfile/configuration needed for a reproducible build, and no secrets, cache, dependencies, generated build folder or unrelated history.

## 9. Tests and truthfulness

Run TypeScript, unit tests, all-level validation and production build. Test actual browser gameplay, mouse and touch, lift/regrab, collision, timeout/lives, pause/retry/unlock, resizing/orientation, visibility and error-free navigation. Test authenticated cloud/offline flows and 2–4 online clients before final status. Measure physical mobile performance; desktop headless rendering is not proof of phone performance.

Separate PASS, FAIL and NOT VERIFIED. A delivered stage may be playable without being commercially final. List unfinished scope plainly, including payments or services requiring owner configuration.

## 10. Acceptance

The final browser game includes complete Retro, Modern Solo, actual Race/Co-op, family sign-in/profiles, bilingual UI, original low-poly characters with smooth movement, saved progress, configured ads/subscriptions/costume purchases and tested responsive play. App-store work follows, not precedes, this gate.


## 11. Accepted UI refinement — 2026-10-24

Replace the marketing-style landing page with a full-screen lightweight 3D garden maze title screen. Use expressive game typography, a large Play button, clear icon controls and bright family-friendly colors. Operational Firebase/setup messages and account architecture explanations do not belong on the home. Put setup details in documentation; communicate failures to players in understandable language.

The mascot must visibly read as a fantasy binturong through its snout, tufted dark ears, prominent whiskers and long prehensile tail visible in the silhouette. Keep simple geometry and animation, with an original small teal scarf/maze badge.

Modern tablet/phone: joystick left; blue A for jump, red B for hit. The implemented hit is a friendly shrub-clearing swipe, not mandatory enemy combat. Space and J/B provide keyboard equivalents. The actions must be real, support simultaneous movement, obey cooldowns and respect wall collision. Keep Retro solely trace-path. Network actions require server validation and must not be claimed live-tested before actual multi-client testing.

Bahasa Indonesia/English remain required. The owner supplied public Firebase Web app settings for the existing project. These identifiers are distinct from Admin credentials; do not request or expose Admin secrets in chat. The Realtime Database URL was not supplied.
