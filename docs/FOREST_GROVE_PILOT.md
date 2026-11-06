# Forest Grove — SOLO Medium Map 01

Implemented on the existing Maze Hunter source, using all four references in Forest_Grove_Final(1).zip. This is an authored playable pilot, not an image used as a game background. Existing Binturong, controller, combat, animation rig, account/reward integration and other maps are reused. The reference artwork is an artistic target; visual fidelity has not been approved in a GPU render.

## Entry and scope

Choose Adventure → Forest Grove/Hutan Rimbun → Medium → Play Solo. The SOLO selector uses Map 01, a 73×73 authored layout. Online continues using its existing maps/rules; Easy/Hard/Extreme and other areas keep their existing layouts. No environment switch is needed. This delta also includes the latest two-question Retro and camera corrections and can be applied to source already containing the 2,000-question bank; the superseded five-file camera ZIP is not required.

## World and progression

- Forest Entrance leads to Deep Forest Hub; three independent branches lead to Green Cliffs, Ancient Ruins and Waterfall Valley.
- Green Cliffs has stepped climbable ledges and an elevated route toward Giant Tree. Its Wind Sigil requires reaching the ledge height.
- Ancient Ruins has two interactable rune posts. Activate them using Context; the first opens a crosslink bridge and both release the Stone Sigil. No consumable key is required.
- Waterfall Valley has sloped banks, swimming/diving, water animation and an underwater passage with a solid low roof. Dive to pass; surfacing is constrained under the roof until clear, with a route back out. The Water Sigil requires diving.
- Giant Tree can be climbed and opens a return shortcut to Hub. It has access from the cliff route and waterfall route.
- Any two Sigils open the physical Sanctuary gate. The third is optional and does not secretly block combat or victory. Existing Guardian awakening/combat is retained; defeating the boss opens Exit Gate and the existing escape sequence.
- Multiple crosslinks and dead ends contain optional stars/chests. Cliff/ruin barriers have visible solid geometry. Traversal ledges use the existing Climber. Minimap uses discovered cells and does not draw reference-route lines or undiscovered pickup markers.

Geometry is procedural and uses the existing materials, textures and trees: layered stone boundaries with grassy tops, tree canopy, flowers, ruins/arches, plank bridges, pool/channel, animated cascade/foam, sky, rune/gate feedback and a clear arena. Static geometry is batched by shared material. Scene geometry QA counted 99 meshes and 90,112 triangles (world only, excluding character/sky), with no non-finite coordinates. This is not a measured draw-call/FPS result.

## HUD

The pilot has a small Forest Grove · SOLO / MEDIUM label and Back at upper left. Minimap at upper right, with Fullscreen/Settings/Guide stacked to its left. Objectives/zone details are in Guide, not the two persistent panels. Joystick remains lower left; compact icon-only Jump, Context, Merge and Ability controls are on the right. Ability opens a closable horizontal Cake/Chili/Spinach/Watermelon selector. Selection is highlighted; actual stock and context drive the main button. Spinach can be selected as a utility, then used for strength/lifting; other weapons remain usable during its buff. Extra cake colors and placing a carried object remain accessible in Settings. Settings contains audio toggle, music/effects volume, touch sensitivity and explicit camera reset.

SOLO creates no chat/mic controls. Existing Online chat/voice toggles are positioned below its minimap; their transport, permissions and error reporting are unchanged. No new voice backend or claim of live microphone success is included.

## Camera

The world-position anchor from the prior delta is replaced by RadiusOrbitCamera. The free-space target radius is 7.2 with a 60° FOV; position follows the character on that spherical orbit in the same frame. Relative height follows pitch rather than retaining an old world height after a wall contact/descent. There is no alternative-side search or idle recenter. Joystick lateral input drives continuous bounded orbit steering while moving, with manual look taking priority. Releasing steering does not start an independent turn. A real collision can shorten the radius; there is no timer-driven retreat. Character motion restores a shortened radius. A target originating inside a climbable is allowed to exit that volume instead of forcing the camera into the character.

## Retro countdown

The two-question flow remains. The remaining level time is shown during questions. Clock starts when questions are shown, carries across the first answer, and freezes at the last answer click before final verification. Timeout skips the optional bonus and retains the base maze reward. The backend checks the supplied answer duration against its calculated remaining level budget; individual-answer requests cannot bypass the timed batch route. Keys/feedback remain hidden until both answers finish. Session version changes; start a fresh level after deployment. Existing stars/progress are retained.

## Validation and limits

- Full suite: 291 tests / 46 files passed. After final UI/zone wording changes, the 10 pilot tests passed again using the actual jump curve for Wind ledge/Giant Tree climbs.
- Frontend build, realtime server build, Netlify Function bundle and 2,000-question validator passed. No bank IDs are included in production frontend JS.
- Pilot tests: reachable branches; 0/1 Sigil gates locked; all three two-Sigil combinations unlock Sanctuary; boss→Exit; rune gates; actual single-jump/climb; dive/roof/surface recovery; shortened routes after bridge/shortcut; valid pickup cells; serialization.
- Camera tests: fixed radius/relative height at 30/60/120 FPS, no retained world height, no autonomous retreat/side change, controlled circular steering. These are simulation tests, not physical-device comfort approval.
- Browser HUD fixture: horizontal selection and theme loaded; Guide fits 390×844 and 844×390 without overflow. Browser quiz fixture showed countdown continuing from question 1 to 2 and removed it from final verification; QuizClock tests verify elapsed time is frozen.
- Browser scene-geometry fixture constructed actual geometry and verified a visible locked gate becoming hidden after valid Sigils. It did not render pixels.
- Attempting the actual SOLO game failed in this cloud browser at THREE.WebGLRenderer: Error creating WebGL context (GL renderer disabled). Therefore visual quality, mobile FPS, native multitouch, water/camera feel, device fullscreen and authenticated live server flow remain UNVERIFIED. No fake screenshots or production dummy state are used to claim these passed.

## Install

Apply the changed files to source that already contains the 2,000-question bank, deploy Netlify including retro-quiz, refresh and start a new game/session. Firestore rules from the original Knowledge Bonus package must already be installed. No new environment/rules or realtime protocol changes; PowerShell server and tunnel may remain running. Realtime build was checked for compatibility. This task did not push GitHub, deploy Netlify or change live Firebase data.
