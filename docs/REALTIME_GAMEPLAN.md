# Proposed realtime migration — not implemented in this release

The current source advances authoritative simulation in HTTP Function requests. Player prediction can look smooth while NPC snapshots and confirmed combat arrive late. Render interpolation alone cannot remove delayed authoritative decisions.

Proposed implementation:
1. Keep Netlify for the frontend and the existing Firebase project for login/profiles/durable progression. Add a continuously running authoritative game process with a persistent connection per client; a deployment endpoint/host must be chosen before production integration.
2. Use one owner per active room and hold hydrated simulation state in that owner. Proposed targets: 20 simulation ticks/s, 10–20 incremental snapshots/s, input sequence acknowledgements and bounded per-client queues. These are design targets, not measured results.
3. Share the current deterministic layout, combat rules and quest logic. Send input/weapon intent; validate movement, stock and membership on the server. Persist durable rewards with idempotent receipts. Avoid rewriting the full durable room document for every movement frame.
4. Predict the local player, buffer/interpolate remote actors, and reconcile against server acknowledgements. Use bounded authoritative history for validated lag-compensated attacks, so visible targets and confirmed hits agree. Define authentication expiry/revocation and reconnect rules explicitly.
5. Preserve room ownership, Co-op/Race rules, existing Firebase data and rollback capability. Do not replace production data with fixtures.
6. Acceptance: two physical devices on Wi-Fi/cellular, 4/8/10-player rooms, repeated attack/harvest/weapon tests, network loss/rejoin, duplicate input/reward protection, server CPU and bandwidth profiles. Proposed target: frequent sub-100ms state cadence on a suitable regional network; measure rather than claim it.

This document does not provide a deployed server or guarantee latency. Use existing move/ability request durations and Server-Timing to establish the production baseline before migration.
