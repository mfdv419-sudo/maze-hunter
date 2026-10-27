# Movement Jitter, Abandoned Roads & Voice Recovery — 27 October 2026

Apply AFTER Room Creation & Mobile Entry Hotfix (13-file delta). Use the full source if the delta order is uncertain. Deploy frontend AND Netlify Functions together. Reopen the game on all devices and create a fresh room. No new environment variables, dependencies, database reset or new public database permissions are needed for this release.

## Movement
The old server discarded unused movement time after every arrival. A slow request followed by a fast one could reject normally buffered movement as too fast, acknowledge the old position, and snap the client backwards. The server now accumulates bounded movement allowance using server time, subtracts actual accepted distance, and caps stored allowance to ten seconds. Wall collision, speed factors, respawns, membership and sequence validation remain authoritative. Duplicate packets cannot spend the allowance twice. Old local acknowledgements are ignored to avoid restoring an older respawn counter/state.

The before-fix regression stops at x=5.5 instead of the expected x=7.5; the fixed regression preserves the expected endpoint. Existing two-client Race/Co-op and 1.8–3s latency simulations still pass. These are local simulations, not a measurement of the production network.

“Waiting for server sync” still means a request has not returned within 1.2 seconds. It is not evidence that the user's internet is slow or that high data volume is the cause. This release does not remove that warning or claim to eliminate Netlify/Firebase/network latency. A slow move response now includes Server-Timing (auth/profile/room); the browser console prints Movement confirmation timing without tokens or player identities. For persistent waits, inspect the move request duration and Server-Timing in Network/Console, plus Netlify Function logs, to distinguish processing and transport delays. No production timing was captured here.

## Roads
Biome routes are three-cell-wide corridors. BFS solution cells may hug a side; old slabs followed those cells. Roads now follow the middle of three-cell blocks, retain open shoulder space, conform to ground elevation, and join across corners. Interrupted stretches carry cracks, dust patches, exposed aggregate, faded/broken center markings and small weeds. Sea and Classic have no asphalt; the lava/canyon jumping course remains clear. This is original procedural geometry, with no imported licensed textures. GPU rendering was unavailable in QA; road center/clearance are verified by geometry tests, not a full game screenshot.

## Voice
PERMISSION_DENIED from Firebase signaling is separate from browser microphone permission. If realtime voice access is denied, the client automatically uses authenticated Netlify Function signaling. Each request verifies the Firebase identity, existing family profile, current room UID membership and expiry. Targets must also be room members; the server derives sender identity, validates SDP/nonce bounds, and only returns the recipient's inbox plus member presence. It does not expose private Firebase credentials or open database rules.

The fallback polls lightweight voice presence/signaling every 1.8 seconds, one request in flight at a time. It reads roster/expiry metadata rather than the full Adventure simulation. Audio remains direct WebRTC or TURN; it is not sent in movement, Firebase JSON, or polling responses. Polling adds Function requests and is only used when realtime access is denied. Realtime voice still uses the existing additive mazeVoice rules when installed. Setup/timings are not an audio jitter buffer and do not pause all voice every 1.8 seconds.

Deploying only frontend leaves the fallback endpoint unavailable: deploy Functions too. Browser/device mic denial is now labeled distinctly; check OS/browser mic permissions for NotAllowedError. TURN envs remain optional to configure, but relay may be needed for actual cross-network audio. Blank TURN fields do not cause Firebase PERMISSION_DENIED. Two-device audio has not been verified here.

Voice controls also override the generic large form input styles: compact checkbox/range, label margins, natural-height rows, and a bounded panel.

## Validation
183 tests across 30 files PASS, including the before/after movement jitter regression, stale acknowledgement handling, road center/clearance, authenticated voice inbox/recipient isolation, denied-realtime fallback, polling cleanup, existing login and multiplayer regressions. TypeScript + Vite production, Function bundle, and public-env boundary PASS. Full GPU visuals, physical smartphone controls, real Google auth and two-device voice/production multiplayer still require post-deploy validation. No deploy/publish or production Firebase console change was performed.
