import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const read=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('home backgrounds live in profile sync and unlock only on gameplay progression',()=>{
 const local=read('src/services/local.ts'),back=read('src/game/home-backdrops.ts'),main=read('src/main.ts');
 assert.match(local,/homeBackdrops\?/);assert.match(local,/out\.homeBackdrops/);
 assert.match(local,/recordExpeditionWin/);assert.match(local,/grantHomeBackdrop\(profile,area\)/);
 assert.match(back,/homeBackdropAreas/);assert.match(back,/canEnterAdventureArea/);
 assert.match(main,/equipHomeBackdrop/);assert.match(main,/void save\(\)/);
 assert.match(main,/home-backdrop-equip/);
});
test('home level background is a 3D scene with solid faceted ledges and curved stream',()=>{
 const land=read('src/game/home-landscape.ts'),scene=read('src/game/menu-world.ts');
 assert.match(land,/solid-faceted-rock-cliff/);assert.match(land,/grass-cliff-cap/);
 assert.match(land,/CatmullRomCurve3/);assert.match(land,/winding-river/);
 assert.match(land,/home-landmark-gorge|home-landmark-\$\{area\}/);
 assert.match(scene,/homeLandscape\(scene\)/);
 assert.doesNotMatch(scene,/riverTile\(/);
});
test('Home visual elements use one owned style without suppression directives',()=>{
 const css=read('src/home-ui.css');
 assert.match(css,/home-backdrop-equip/);
 assert.doesNotMatch(css,/!important|!ignore|@ts-ignore/);
});
