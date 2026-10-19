# Maze Hunter — delta patch

This ZIP contains only the two source changes intended to address the TypeScript errors in the supplied Netlify build log.

## Files
- `src/scenes/GameScene.ts.patch`
- `src/scenes/MenuScene.ts.patch`

These are unified diffs, not full replacement source files. Apply from the repository root with `git apply` after saving the patch files at the paths shown, or apply the changes manually. Check the patch before applying because it targets the current `main` source revision inspected for this fix.

## Changes
- Use `this.make.graphics({ x: 0, y: 0 })` for the texture graphics factory.
- Replace the three `Set.iterate` callbacks with `getChildren().forEach`, avoiding the callback return-type contract reported by TypeScript.
- Pass a CSS color string to the Phaser text style instead of the numeric `C.gold` constant.

## Verification required
Run the project's existing typecheck, tests, level validation, and production build before deploying. This patch has not been built or browser-tested in this environment.
