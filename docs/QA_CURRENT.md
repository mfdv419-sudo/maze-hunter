# Online World Consistency & Persistent Rocks — 27 October 2026

Apply AFTER Movement Jitter, Abandoned Roads & Voice Recovery (26-file delta). Use the complete source if the installed delta order is uncertain. Deploy frontend AND Netlify Functions together, reopen all clients, and use a fresh room. No new env variables, Firebase rules, dependencies, database reset or source deletions are needed. Existing voice/login configuration remains unchanged.

## Online world consistency
Metadata and own simulation arrive over separate RTDB subscriptions. Matching only movement sequence was insufficient: another member could advance room metadata while the cached simulation still contained old guardian/grass state at the same movement sequence. Every committed Adventure simulation is now stamped with the exact room revision; realtime and HTTP application require a coherent pair. Legacy rooms gain the marker on the next server transaction. Stale or mixed snapshots wait instead of restoring obsolete inventory, guardian health, grass or position. This does not turn HTTP/Netlify/Firebase into a zero-latency game server; existing timing diagnostics and slow-response status remain.

An explicit keep-position acknowledgement also preserves a valid predicted climbing state; an older climb phase alone no longer forces a return to the earlier sent point. Death/respawn, lost supports, invalid movement and server corrections remain authoritative.

## Attacks and grass
- A cooling-down/unavailable ability previously aborted the entire transaction, including valid movement. With a movement-bearing ability, valid movement is now committed and the action acceptance is returned separately. The sequence identifies a repeated action so a duplicate request cannot spend items or award loot again. Invalid movement is still rejected.
- Non-boss guardians no longer silently reset HP when attacks are more than seven seconds apart. Visual hit streaks can expire, but confirmed damage and death persist. Server projectile tests cover long attack gaps in both Race and Co-op.
- Co-op harvested vegetation, broken grass, related guardian changes and fallen objects use the shared world. A rare plant grants its reward once to the collector; other members see it consumed and cannot claim it again. Race retains each player's personal collection state. Grass does not regrow during the round in this release; no instant reward/regrowth loop is intended.
- Projectile and target visibility checks use current physical prop positions, including carried/moved objects, so moved props do not leave an invisible projectile blocker at the original position.

## More usable rocks
- Additional arena rock placement targets up to 6/10/14/18 new stones for Easy/Medium/Hard/Extreme, subject to quest clearance, spacing and route reachability. Original Solo/Retro and the accepted Forest sample layouts are not rebuilt.
- Environmental falling rocks and the King's rockfall leave saved, climbable, movable debris. Immutable landing origins survive carrying, strength expiry, death and save/restore. No timer removes landed debris in the round.
- Spinach strength enables lifting stones. Place can stack a stone on a nearby rock support; its saved elevation is reflected by rendering and climbing. This is game placement logic, not a full rigid-body physics simulation. Throwing objects keeps the existing attack behavior.
- A maximum of 72 fallen stones prevents unbounded save/model growth; existing stones remain and further ordinary falling-rock spawning is suppressed at the cap. Other hazards continue. The cap excludes authored starting rocks.
- Characters already overlapping a newly landed stone can move out rather than becoming trapped inside its collider.

## Validation and limits
192 tests / 31 files PASS, plus 8 targeted tests after the final finished-room coherence check. TypeScript/Vite production, Function bundle and public-env boundary PASS. See docs/TEST_RESULTS.txt and QA_CURRENT.md for the final results. Before-fix regression variants fail on mixed metadata/state and guardian HP reset; fixed tests pass. Tests include real server-side cake projectile damage/death, shared rare-grass reward persistence, movement accepted despite ability cooldown, duplicate ability sequences, saved debris, stacking, escape from overlap and existing biome route traversal.

No live multiplayer session, physical smartphone or full GPU rendering was available for this release. Production sync latency, visual stone piles, two-device combat and voice still require post-deploy acceptance testing. No deployment or production Firebase change was performed.

## Two-device acceptance
Create a new Co-op room with two profiles. Have one player harvest a golden plant; verify it disappears for both, only that player receives the reward, and revisiting/interacting cannot award it again. Attack the same guardian with intervals greater than seven seconds until it dies; verify both players see death and an unlocked seal. Repeat Race to check personal collection rules. Walk, turn, jump and attack during delayed responses; test cooldowns without teleporting back. In mountain/canyon, wait for rock landing, move away/back, lift/place/stack a rock, expire spinach, and rejoin: saved debris must still be represented. Boss rockfalls leave debris as well.
