# Motion and environment corrections

Apply this delta AFTER Online Actions Sync (14 files) and Motion Visual (13 files). Copy the `maze-hunter` folder contents over the existing project, including tests/docs.

## Changes
- All adjoining wall faces share fixed corner vertices. Split top caps now share the same edge samples as the sides; no open upper seams. Interior relief remains bounded. Layer colors use longer, spatially varied strata rather than alternating each band.
- Double jump rotates forwards along the character's local +Z facing direction.
- Tree/palm ascent takes 2.1 seconds, with three pull-and-hold stages. The body stays beside the trunk until the final pull onto the top. Hands and knees continue to alternate. This is a procedural rig, not hand-contact IK or motion capture.
- Defeat tilt is applied inside the compensated model scale, avoiding flattening from the world's horizontal scale. Short upward arc replaces sinking into the floor.
- Falling field rocks use larger wall clearance. Resolved rockfall hazards hand over to the persistent rock instead of drawing a second intersecting copy. Unsafe landing origins move to nearby open space. Settled/field boulders sample surrounding ground height so slopes do not swallow their base.
- After two seals, the minimap points to the final site even if its exact tile has not been explored. Seals remain locked until their assigned keepers are defeated; the update does not grant seals automatically.

## Deployment
Frontend: commit changed source to the same GitHub branch and let Netlify rebuild. No new environment variables.
Server: shared climbing duration and rock landing rules changed. Stop the Node server in PowerShell 1 (Ctrl+C, Y if prompted), merge this delta there too, then run:

```powershell
npm.cmd run build:realtime
npm.cmd run start:realtime:local
```

Keep the tunnel window running. If the tunnel is restarted and its address changes, update the frontend realtime URL and redeploy as before. Test a new room after both client and server are updated.

## Validation and limits
Automated geometry test checks that every raised edge on a closed test wall has a matching adjacent triangle. Seal tests cover three distinct reachable sites across 70 biome/map combinations. Tests also cover rock persistence/clearance, staged tree climbing and forward somersault direction. Full frontend/server builds and unit suite are run before packaging.

The reported two-seal run could not be reproduced from the screenshot alone: its biome/map seed and save are unknown. The guide helps locate the final site, but is not proof that the reported run is repaired. Actual mobile animation comfort, online latency and hardware frame rate need device testing. Existing sessions/checkpoints retain collected seals and rewards.
