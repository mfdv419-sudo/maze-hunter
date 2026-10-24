# Maze Hunter — browser implementation on `maze-1`

This source replaces the old action/combat gameplay with the agreed Retro trace-path and Modern 3D exploration design. The uploaded `maze-hunter-maze-1.zip` is the comparison baseline. No remote repository has been changed.

**Status: first playable implementation, not a final commercial release.** See `QA_REPORT.md` for verified and unverified scope. Google Play and App Store packaging are deferred until the browser game is final.

## Apply the delta manually

1. Work on branch **`maze-1`**, using the same source revision as the supplied ZIP.
2. Extract `maze-hunter-delta.zip` outside the repository.
3. Copy/upload the files, keeping the relative paths. Do not upload `node_modules` or the ZIP as the website source.
4. Delete the obsolete files listed in **`DELETE_FILES.txt`**. ZIP extraction alone does not perform deletions.
5. Let Netlify build from the resulting branch with `npm run build` and publish `dist`. `netlify.toml` supplies these settings and the Functions directory.
6. If using a deploy preview or branch deployment, make its environment variables available in that deployment context too.

No Node or Netlify CLI installation is required on the user's laptop for the GitHub upload → Netlify build route.

The delta includes a real `package-lock.json`; CI now uses `npm ci` with the matching lockfile. Do not discard it.

## Local development

Node 24.12+ (24 LTS; `.nvmrc` pins the major version):

```sh
npm ci
npm run dev
```

The project owner’s public Firebase Web app configuration is included in `src/services/firebase-web-config.ts`; explicit build environment variables can override the four identifiers. Service account credentials are not included. Login and server errors use player-facing feedback, while technical details remain in the console and documentation. In **Vite development only**, a separate **local control lab** is available to exercise movement and gameplay. It has a persistent banner, no Google identity, no cloud progress, no multiplayer, no purchases, and does not write family progress. It is excluded from the production build. It is not an authentication bypass for the published game.

## Netlify build correction (2026-10-24)

Netlify/CI now use Node 24, matching the installed Firebase packages' minimum Node 24.12 requirement. Secret scanning stays enabled. `netlify.toml` omits only the five public Firebase web configuration keys from value scanning. No directory exclusion, private-key exclusion, or global scanner disable is used.

Only explicitly referenced browser fields are bundled; unrelated `VITE_` values are no longer serialized by the Firebase client module. Run `npm run check:public-env` to verify the built output excludes synthetic unrelated/admin markers while retaining public web configuration. Never place actual secrets in a `VITE_` variable.

The supplied failed deploy's environment list did not include `VITE_FIREBASE_APP_ID`. Confirm it in the same **deploy-preview build** context; its value comes from the existing Firebase **Web app** configuration and is not the project ID or measurement ID. Rooms also require the actual `VITE_FIREBASE_DATABASE_URL` and the two server-side settings described below. `VITE_FIREBASE_CLIENT_EMAIL` is not used by the app and should not be supplied as browser configuration. Keep Admin credentials in `FIREBASE_SERVICE_ACCOUNT_JSON` with Functions scope.

See `docs/NETLIFY_BUILD_FIX.md` for manual application and verification.

## Activate Google sign-in and family cloud saves

Use the **existing** Firebase project. Verify its identity in the console before supplying configuration. Do not recreate a project or replace unrelated collections/rules.

1. Enable the Google provider in Firebase Authentication if not already enabled.
2. Add the exact browser deployment domains to Firebase Authentication's authorized domains, including a preview domain when testing that preview.
3. Check Cloud Firestore availability. Merge the `/families/{uid}/profiles/{profile}` and `/entitlements/{uid}` rules from `firestore.rules` into the project's existing rules. Preserve unrelated rules.
4. In Netlify's build environment, set the public Firebase configuration:

| Variable | Source |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Existing Firebase web app configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | Existing Firebase web app configuration |
| `VITE_FIREBASE_PROJECT_ID` | Existing Firebase project |
| `VITE_FIREBASE_APP_ID` | Existing Firebase web app configuration |
| `VITE_FIREBASE_DATABASE_URL` | Existing/approved Realtime Database instance, required for rooms |

5. Rebuild the same deployment context after changing `VITE_` variables. They are embedded at build time.
6. Sign in with the parent's Google account and add nickname profiles. Up to six profiles are offered by the UI.

Every profile has separate Retro results, language, equipped outfit and Modern solo win count. Local results are scoped to the authenticated parent UID. Synchronization merges best stars/time and the union of completed levels. Modern room state is separate from Retro progress. The legacy `maze-hunter-progress-v1` save is not overwritten or silently reinterpreted as trace-path completion.

## Activate private online rooms

Room code is implemented, but live multi-client operation has **not been verified** against your Firebase project.

1. Confirm/enable a Realtime Database instance in the same Firebase project. Use its actual URL.
2. Merge the `mazeRooms` and `mazePresence` paths from `database.rules.json` into existing database rules. Client room state writes are denied. Only presence records are client writable for their owner. Room reads require membership.
3. Supply these **server-side Functions variables** in Netlify:
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — JSON for an appropriately authorized service account in this project. Never use a `VITE_` prefix, never commit it, and never place it in an uploaded ZIP.
4. Deploy `netlify/functions/maze-room.ts` with the source. Static drag-and-drop hosting of `dist` alone does not deploy this function.
5. Test using independently authenticated browser sessions and at least two profiles/devices. A parent account can use different family profiles as separate players.

The function verifies the Firebase token and profile ownership. Server transactions control join capacity, host/ready/start, countdown, movement batches, wall collision, speed limits, Race winner, Co-op finish and leave. Positions are submitted in 250 ms batches, validated on the server and read through Realtime Database. Local movement is immediate; remote positions interpolate. This is a modest four-player implementation, not a claim of large-scale multiplayer capacity or latency performance.

Rooms have a six-character private code, maximum four players, no chat, and a three-second start countdown. Four mirrored maze quadrants provide exactly equal shortest routes from the four entrances. Co-op shares discovered cells and requires every player to finish. Leaving or a detected disconnection ends an active match without fabricating a winner. A live peer's next server movement request detects a false presence record; this is not instantaneous host migration. Expired rooms are rejected. Automated deletion of expired stored records is not included.

## Retro controls and offline operation

- Touch/click the white marker at START, then drag through the pale corridor to the gold finish.
- Lift freely and regrab the last marker; no life is lost for lifting.
- Attempting to cross a wall costs one life, at most once per gesture. Continue from the last valid point.
- Three lives, a real elapsed-time timer, pause/resume, retry, 1–3 stars and sequential unlock.
- Journey: 100 deterministic distinct layouts in ten regions. Route complexity is sorted within each region; layout sizes increase between regions. Difficulty still requires family playtesting.
- `+` / `−` zoom makes later levels easier to trace on a small screen. While zoomed, drag away from the white marker to pan; regrab the marker to continue.
- The generated service worker caches the app and game bundles after an online load. The first Google sign-in and profile creation need internet. Previously authenticated profiles can use locally stored Retro progress offline and sync on reconnection.
- Modern, cloud operations and online rooms require connectivity.
- Service-worker app-shell caching was browser-tested. Real-account offline resumption and sync conflicts still require validation with the owner's Firebase configuration.

## Game UI and character revision (2026-10-24)

The title screen is now an actual lightweight 3D garden/maze scene with an animated mascot, game logo, large Play button, language/sound/help/fullscreen controls. The old marketing hero layout, family account explanation and Firebase configuration status are removed from the player home. Fredoka is self-hosted as a subset WOFF font and cached for offline use; its SIL OFL license is included in `public/fonts/OFL-Fredoka.txt`.

The binturong has a projecting grey snout, dark tufted ears, long whiskers, a short teal neckerchief, and a long segmented tail curled beside its silhouette. It does not use the old cream square bear muzzle. This is original procedural game geometry, not a reskinned existing character.

Modern touch controls: joystick left, **blue A = jump**, **red B = clear shrubs** on the right. Desktop: Space jumps, J/B hits. Actions work together with joystick movement. Jump changes the character’s vertical position but cannot cross maze walls. Hit clears nearby optional dead-end shrubs; there are no mandatory combat encounters and no change to Retro trace-path objectives. In rooms, the server validates cooldowns and stores shared cleared shrubs/action timestamps; live multi-client verification remains pending.

The supplied Firebase Web app configuration activates the client for `maze-hunter-e362b`; verify the Google provider and authorized deployment domain in the existing Firebase project. The supplied configuration does not contain a Realtime Database URL. Room setup still needs that URL plus the server credentials described above. Analytics is not initialized automatically by this revision.

## Modern controls and character

Three.js supplies the real 3D world. Phaser remains dedicated to Retro. The Modern renderer does not reuse the old combat scene.

- Angled overhead camera, screen-relative WASD/arrow keys and touch joystick.
- Continuous circle-based collision, substeps against wall tunneling, sliding along walls, and visual turning interpolation.
- Position-based visibility with walls blocking sight. Unexplored geometry is hidden, discovered cells remain dim. The finish is hidden until discovered.
- Medium/Hard/Extreme have increasing grid sizes and decreasing vision radii.
- The original binturong is actual procedural 3D geometry. Arms, legs, head, body and segmented tail animate. Nearby camera-facing walls lower so they do not obscure the character.
- Four currently implemented looks: classic, explorer, raincoat and space. The last three are earned with 10/20/50 Retro stars in this implementation. They have identical gameplay statistics.
- This first code-built model is a gameplay asset, not the detailed illustration from concept exploration. Character polish and physical-device review remain necessary.

## Ads, subscriptions and paid costumes

This is **not** an activated commercial store.

- Optional browser H5 ad placement hook: `VITE_ADSENSE_CLIENT`. Provider approval/configuration and family-audience suitability must be resolved before real serving. Do not enable it just to make a demo appear monetized.
- Placement is requested at a natural next-level break, after the introductory levels, every third completed level and at least two minutes after a displayed ad. Actual serving depends on the provider. Gameplay is never intentionally interrupted mid-level.
- A server-owned `/entitlements/{uid}` document may contain `adFreeUntil` as a Firestore Timestamp. Active entitlements suppress ad initialization and placement. Clients cannot write them.
- **Checkout, recurring billing, paid costume ownership, purchase restoration and billing webhooks are not implemented.** A payment provider, pricing, and commercial rules still need to be selected and integrated. No button pretends to complete a purchase or subscription.
- Earned costumes are usable now. Paid purchases must not be granted from a client-side flag or unverified redirect.

## Verification

```sh
npm run typecheck
npm run test
npm run validate:levels
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests cover the development control lab without claiming Google authentication. A separate production test verifies that the lab is absent and that cached production assets reload offline. Playwright can use a preinstalled Chromium through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

CI installs dependencies, runs all four gates, installs Chromium and runs the browser suite. The CI workflow itself has not been executed remotely in this session.

## Production release gate

Before calling the browser version final: verify Google sign-in/cloud save/offline resume on actual accounts; test Race and Co-op with 2–4 independently connected clients, latency, disconnect and reconnection; complete payment/subscription integration; verify real ad behavior; playtest difficulty and touch comfort across the 100 levels; measure performance on physical Android and iPhone devices; and finish character/art polish. Android/iOS store packaging follows that gate.
