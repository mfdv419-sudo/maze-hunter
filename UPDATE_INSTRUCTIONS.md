## Camera collision, weapon dock and tablet fullscreen

Frontend revision after realtime-server-rocks (40 files). Camera wall collision replaces broad transparency; weapon selection stays clear of joystick/A/B; fullscreen has WebKit support and explicit failure feedback. See `CAMERA_TABLET_UPDATE.md` for application and device checks.

# Realtime Node Server & Wall-Stopped Rocks — 27 October 2026

Apply AFTER Responsive Weapons & Guardian Presentation (21-file delta). Full source is provided if delta ordering is uncertain. No baseline files are removed. New npm dependencies are locked: ws, @types/ws and explicit esbuild build tooling. Run npm ci.

## New backend and frontend integration
A real persistent Node/WebSocket server is included, with autonomous 50ms simulation ticks and 100ms sparse snapshots, per-room cached simulation instances, membership-validated commands, ready/start/private/random/chat, sequenced movement/ability acknowledgements, reconnect, token refresh/expiry/revocation checks, origin/rate/payload/backpressure limits, room owner leases, periodic checkpoints and durable idempotent final-result records. The frontend routes room/gameplay actions and subscriptions over WebSocket when VITE_REALTIME_URL is configured. Netlify HTTP gameplay writes into WS-owned rooms return HTTP 409, preventing two authorities. Existing Firebase/Netlify login, wallet and voice services remain.

This source defaults to the old HTTP path until an actual WebSocket endpoint is configured. No hosting account was bought or deployed. See docs/REALTIME_SETUP.md for laptop setup, server env, Docker/start commands, WSS rollout and rollback. Start with one instance and REALTIME_MAX_ROOMS=1; multi-instance room routing is not implemented.

## Rock correction
Ordinary falling rocks now travel in one horizontal direction, trace against the maze wall with their radius, stop at the last valid point without reversing, and stop vertically at their resting height. Rendering, contact and the saved fallen-rock pickup origin use that same grid-aware trajectory. The handoff no longer uses an offset/jitter position that could jump across a wall. Landed rocks remain movable/climbable under the existing strength/stacking rules and 72-rock cap. This is deterministic gameplay collision, not a full rigid-body solver.

## Validation and limits
207 tests / 34 files PASS. Frontend production, Node backend build, startup configuration guard and public-env boundary PASS. See docs/TEST_RESULTS.txt and docs/REALTIME_CAPACITY.jsonl for results. Real loopback WebSocket tests exercise two clients, idle AI, sparse patches, production browser transport, forced reconnect, weapon damage/death, duplicate-item protection, origin/auth rejection, ownership failover and durable-result gating. Firebase identity/storage are stubbed in those integration tests; no production credentials or data were used. Physical devices, real Google/Firebase backend auth, WSS/TLS hosting, Docker image, GPU visuals and production internet latency remain unverified.

One isolated local fixture measured mean tick times 18.6/29.6/32.9ms for 4/8/10 players, with 10-player p95 56.5ms exceeding the 50ms tick target. These values exclude gateway/network/compression and vary by map/load. They are not a promise of ten-player production performance or multi-room capacity. The conservative default is one active room per process until host-level tests pass.

Deploy order: source/dependencies → realtime backend → health and authenticated room checks → exact frontend origin allowlist → VITE_REALTIME_URL on preview → frontend + Netlify Functions redeploy → fresh rooms and real-device acceptance. Do not enable the URL before the backend is reachable.
