# Maze Hunter M12 — Forest Grove playable sample

Apply this changes-only package after M11 on branch maze-1, then use the existing build/deploy workflow. No new environment variables, account setup or Firebase rules are needed. No remote repository or deployment was changed.

## Try the example

Sign in/select a profile as usual, open Adventure, then choose **HUTAN RIMBUN · CONTOH / FOREST GROVE · SAMPLE**. The existing local control lab can also open it without cloud access. The sample uses fixed Medium balance so comparisons between revisions are repeatable.

Explore the connected forest paths, collect three turquoise seals, face the Forest King, then reach the golden gate before the escape timer expires. B throws cakes or interacts with nearby cuttable plants; A jumps and grabs climbable mossy rocks. Purple enemy fruit slows/stuns the explorer. Chests, seals and checkpoints replenish supplies. The King arena also replenishes one cake every two seconds while active.

This is one authored Solo forest example, rather than another batch of procedural maps. It has three-cell-wide paths, taller hedges (about 2.1 scene units), seven recognizable areas, tree trunks in the routes, climbable rocks, three seals, nine optional stars, supplies and a large arena. Tree trunks and stone arena pillars have actual circular collision. Stone pillars and rocks also stop projectiles.

The sample retains a real running timer and lives, but its collection totals and wins do not alter the account's persistent family records or cosmetic unlocks. Ordinary Solo and Online Beta remain available through their existing buttons.

## Character and wardrobe

The shared binturong model is rebuilt with a softer trapezoid/rounded head, projecting muzzle, short tufted ears, expressive eyes, paws, teal neckerchief and maze badge. It uses a lightweight hierarchical joint rig, with elbows/knees, breathing, walking, waving, throwing and climbing poses. These are procedural articulated animations, not a claim of a finished external motion-capture asset pipeline.

The prehensile tail is now one continuously deformed, tapered tube rather than separate cylindrical pieces. It sways and follows turns. In backpack previews it rests to the side.

Cosmetics retain their existing IDs and unlock conditions. Glasses have thicker frames, lenses and temple arms; the leaf mask covers the muzzle; the backpack has straps, flap, pocket and bedroll; the cape is a waving cloth mesh. The same model is used on Home, wardrobe previews and in 3D gameplay. Existing profiles, fur palettes and equipped items are preserved.

## Guardian and King

Guardians have articulated shoulders, elbows and hips, independent breathing/head motion, blinking, wind-up, recoil and stun poses. Their rendered heading blends toward travel direction and toward their aim during attacks. The forest sample adds short pursuit behavior and stops a guardian while it aims. The King slowly closes distance within his arena and has a larger crowned silhouette.

Player projectiles remain cakes. Enemy projectiles are purple fruit with a green stem. Existing slow/stun/life rules remain in effect. The forest player's hit splashes use a purple tint.

The sample King cycles ground slam, lightning, roots and spin attacks, with visible warning circles before impact. Later phases can add a second lightning target. Lightning renders a bolt after the warning expires. The in-game boss panel shows actual health, phase and warning countdown. Leaving a marked impact area avoids its damage; defeating the King opens the final escape.

## Camera, sky and rendering

Right-side vertical dragging permits a requested view from 25° upward through eye level to 75° overhead. The orbit arm stays above ground while looking upward. Q/E orbit on a keyboard; R/F raise/lower the view. The ↕ button retains its quick presets. Camera yaw remains independent of the character's heading.

The sample adds a gradient sky, slowly moving clouds, taller forest trees and fern/flower details. Low-camera obstruction handling still adjusts the arm when a hedge hides the character. High views adjust fog/culling so the ground remains visible. Keyboard camera input integrates elapsed time rather than depending on one capped simulation frame.

Static vegetation, tree canopies and landmarks are batched by material where safe; named interactive rings remain separate. Used WebGL contexts are explicitly released when previews/games are disposed. These reduce rendering overhead but are not an FPS guarantee on physical mobile hardware.

## Validation and limits

- 74 logic tests passed, including the existing Retro/Adventure/room regressions, all 176 staged Retro map audits, forest objective connectivity, tree sliding, King warning/dodge/win behavior, finite animated character geometry, static batching bounds and stone projectile cover.
- Nine targeted browser scenarios passed across focused runs: the three new Home/wardrobe, real-menu forest controls/camera/phone, and King warning/bolt scenarios; plus six existing transition, cosmetics, Retro/navigation, climbing, multi-touch and minimap scenarios. The final forest cases were rechecked after the changes.
- Production build and room-function bundle passed. The standard large-chunk warning remains.
- Desktop and phone-viewport renders were inspected internally. Physical Android/iOS performance, real multiplayer load and final art/player balancing have not been certified.

The first example focuses on land-based Solo forest play. Swimming, fish enemies, other biomes, a spendable currency wallet and top-up billing remain future work. The forest sample is not exposed as an online room mode. Shared character/guardian visual improvements also appear in existing 3D modes.

Only changed/new source, tests and this note are included. Dependencies, dist output, legacy catalogues and internal screenshots are excluded from this archive.
