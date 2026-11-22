# Camera, weapon dock and tablet fullscreen revision

Apply this delta over `maze-hunter-realtime-server-rocks-source.zip` (or the previous 40-file realtime-server-rocks delta already merged with its baseline). Copy the files into the existing repository preserving paths. Do not replace or upload local `.env.realtime`, `.env.local` or service-account JSON files.

## Changes

- Camera uses collision against terrain and maze wall heights, including native batched biome walls. It approaches the hero when obstructed, never automatically raises pitch, blocks further rotation into an excessively tight wall and eases back to the chosen distance when clear. The final smoothed camera position is checked again to avoid crossing corners. Cuttable grass is not treated as an unbreakable maze wall.
- Residual occlusion fades only a small camera-to-hero patch (maximum 35% fade), instead of the previous 92% fade over a large patch. Front walls beyond the hero remain opaque.
- Weapon picker sits in a bottom lane computed from the actual joystick and A/B bounds. Both the closed selector and expanded inventory stay clear of those controls. Text labels show Cake/Chili/Watermelon/Spinach/Grenade; selecting a weapon still equips the Hit button. Item stock rules remain in force.
- Fullscreen button exists in the playbar as well as Home. Supports standard and WebKit APIs, catches rejected requests, and gives instructions when unavailable. Browsers or devices that restrict native fullscreen cannot be forced into it; opening from an installed Home Screen icon is suggested on iPad/iPhone.

## Deploy

Push these files to the same GitHub branch and redeploy Netlify. No new environment variables or dependency changes. No realtime server restart or rebuild is required for this frontend revision. Keep the existing local Node.js server and Cloudflare tunnel running while testing online; its current WSS address still belongs in Netlify.

## Validation

Automated unit/integration and browser results are recorded in `docs/QA_CAMERA_TABLET.md`. Browser automation emulates touch at tablet and landscape phone sizes; this is not a physical Android tablet or iPad test.

## Device acceptance

1. Approach walls in each biome and rotate camera left/right: no see-through maze, no forced upward pitch, no snap after releasing a blocked rotation. Leave the wall and check the return distance.
2. Open and close weapons at landscape tablet/phone sizes, choose an available cake color or collected food, then use B; A/B and joystick remain reachable.
3. Tap fullscreen on Home and in play. Exit native fullscreen using browser controls. If rejected, verify readable feedback; on iPad test Safari and Home Screen launch.
4. Confirm session and movement survive rotation/viewport changes, and test online with different player profiles.
