# Current camera implementation

Latest requirement: free-space default radius, no delayed world-position anchor and no sudden scenery-driven side switch. The previous ContactFollowCamera and StableCameraOrbit are replaced by RadiusOrbitCamera in Adventure.

Position is derived from the player target plus a spherical offset each frame. Manual yaw/pitch and bounded joystick steering choose that offset; collision never searches another angle. Free radius is 7.2 / FOV 60. A wall may shorten radius; no elapsed-time recovery pushes it outward while stationary. Player displacement restores a shortened radius. Relative camera height is derived from pitch/radius, so it cannot remain stranded at an old world Y after the player descends. Existing pitch input/vertical smoothing remains.

Lateral joystick input while moving supplies bounded orbit steering; manual look wins during a drag. This gives continuous circular movement for held diagonal input under the existing camera-relative controller. There is no idle recenter or obstacle-driven orbit. The boss cinematic remains a separately intentional camera sequence. Moving the character toward the camera may show the character's front; that is distinct from the camera switching sides itself.

Tests validate radius/height at 30/60/120 FPS, no autonomous side changes/recovery, descending after contact, circular steering and unchanged explicit reset. A camera ray starting inside a climbable may exit that volume instead of collapsing to the hero target. Actual renderer QA is blocked by disabled WebGL in the cloud browser; no physical HP/tablet comfort/FPS claim is made.

See FOREST_GROVE_PILOT.md for implementation scope, geometry/UI checks and installation. Earlier history entries record superseded approaches and are not active camera rules.
