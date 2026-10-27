# Room Creation & Mobile Entry Hotfix — 27 October 2026

Apply AFTER Mobile Login, Expedition Items & Voice (46-file delta). If unsure use the complete source. Deploy frontend AND Netlify Functions together, refresh/reopen all devices, create a fresh room. No new environment variables, Firebase rules, dependencies or source deletions are required by THIS hotfix. Prior voice/redirect configuration still applies unchanged.

## Cause and corrections
- Firebase RTDB prunes empty children. A newly created lobby adventure.states={} disappears from persisted snapshots. clientRoom previously indexed states[playerKey] unconditionally, producing Cannot read properties of undefined (reading UID_profile) and HTTP 400 after a successful room write. Response serialization now tolerates missing states and sends an empty local map. Loading/leaving a pruned lobby is also safe.
- Test snapshots now prune null/empty children like Firebase. Reinstating the old response code reproduces HTTP 400 u1_p; corrected code passes create, random, join, reconnect, leave and existing start/movement/chat/voice regressions.
- Four difficulty choices occupy one row. Setup reserves equal 48px Solo/Online targets and prevents legacy primary/media styles from shrinking or misaligning them. Portrait setup/lobby remain accessible; landscape prompt applies to gameplay only.
- Phones/coarse pointers and viewports <=960px keep the illustrated menu artwork instead of constructing an entire offscreen 3D game merely for a thumbnail. This removes avoidable menu CPU/GPU work; actual Adventure remains 3D.

## Verification
174 unit/integration tests in 29 files PASS. TypeScript + Vite production build PASS. Function bundle PASS. Browser QA used a local lab account, no live Firebase: equal reachable 48px buttons at 740x360 and 640x320; portrait 390x844 targets measured 176x48 each. Online produced the expected local-lab restriction message, Solo click entered the modern screen. WebGL is disabled in this QA browser so full game rendering was not verified. Four hasTouch Playwright regression scenarios are included but were not executed in this environment. Physical smartphone gestures, real Google auth and production multiplayer need post-deploy testing.
