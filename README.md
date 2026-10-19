# Maze Hunter

A browser-based, dark-fantasy maze action game built with Phaser 3, TypeScript, and Vite. The game currently ships with a procedural 100-chamber solo campaign, five sectors, local progress, bilingual UI (English / Bahasa Indonesia), retro palette toggle, keyboard and touch controls, enemy AI, active hazards, combat, fog-of-war minimap, timer, pause/retry/next-level flows, and Race vs AI practice.

## Requirements
- Node.js 20+ (CI uses Node 22)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite. Use WASD or arrow keys to move; Space or J to attack; Escape to pause. On phones, use the on-screen direction pad, attack, and pause controls. Collect the glowing shards and reach the gate before time runs out.

## Checks
```bash
npm run typecheck
npm run test
npm run validate:levels
npm run build
```
The level validation suite checks all 100 generated configurations for reachable exits, walkable objective/spawn tiles, non-overlapping spawns, and deterministic generation.

## Progress and settings
Campaign progress, cleared chambers, best times, language, sound, reduced-motion preference, and retro palette are stored locally in the browser. Clearing a chamber unlocks the next. Clearing chamber 100 triggers the campaign-complete screen.

## Online services status
**Firebase Authentication / Cloud Firestore are not connected in this build.** Local play and local save work without credentials. Do not present a local profile as an online login. To add Firebase, create a Firebase project, enable Google Authentication, create Firestore, then implement and test the provider and per-user security rules before advertising cloud save. `.env.example` is only a configuration placeholder; it does not imply that online login is implemented.

**Race is local AI practice only.** No online multiplayer server, cross-client synchronization, or authoritative race validation is included. Online race must not be advertised until a server is deployed and multi-client disconnect/reconnect tests pass.

## Build and deploy
```bash
npm run build
npm run preview
```
Deploy the generated `dist/` directory to a static host such as GitHub Pages, Netlify, or Cloudflare Pages. Keep secrets out of the repository. GitHub Actions runs typecheck, tests, level validation, and production build on pushes and pull requests.

## Current limitations / QA notes
- Art is generated with in-engine pixel-style primitives and procedural maze geometry; no third-party asset pack is bundled. This is a functional vertical slice with 100 generated playable chambers, but it is not yet a fully animated hand-authored sprite-sheet production art set.
- The five sectors vary palette, maze dimensions, enemy pressure, hazards, and time pressure; further hand-authored room gimmicks, bosses, weapons, and balancing are recommended for production quality.
- Race AI reuses the core chamber and opponent pressure rather than implementing synchronized multi-racer standings.
- Firebase login/cloud persistence and online multiplayer remain unimplemented, as stated above.
