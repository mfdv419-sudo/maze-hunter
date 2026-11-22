import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import test from 'node:test';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const main=read('src/main.ts'),css=read('src/home-ui.css');
const home=main.slice(main.indexOf('function home()'),main.indexOf('function settings()',main.indexOf('function home()')));
const asset=(name)=>new URL('../public/adventure/home-approved/'+name,import.meta.url);

test('Home has exactly two game entry buttons, no duplicate Play CTA',()=>{
 assert.match(home,/id="retro-mode"/);assert.match(home,/id="modern-mode"/);
 assert.match(home,/click\('retro-mode',/);assert.match(home,/click\('modern-mode',/);
 assert.doesNotMatch(home,/id="(?:play-now|home-play|play-solo)"/);
});

test('Home uses approved artwork as separate interactive layers',()=>{
 for(const image of ['forest-backdrop.webp','hero.png','logo.png','classic.png','adventure.png','shop.png','collection.png'])
   assert.ok(statSync(asset(image)).size>10000,`missing detailed approved artwork ${image}`);
 assert.match(home,/class="home-art-button home-art-button--classic"/);
 assert.match(home,/class="home-art-button home-art-button--adventure"/);
 assert.match(home,/class="home-scene"/);
 assert.match(home,/class="home-hero-action"/);
 assert.doesNotMatch(css,/\.mode-tile-art\b/);
});

test('High fidelity Home remains interactive and never forces a low-poly background',()=>{
 assert.match(home,/click\('home-hero-inspect'/);
 assert.match(home,/const \{menuWorld\}=await import\('\.\/game\/menu-world'\)/);
 assert.match(home,/click\('home-viewer-close',closeViewer\)/);
 assert.match(home,/click\('home-shop',\(\)=>wardrobe\(\)\)/);
 assert.match(home,/click\('collection-open',\(\)=>collection\(\)\)/);
 assert.match(home,/click\("fullscreen", requestGameFullscreen\)/);
 assert.doesNotMatch(home,/world3d-ready|\.classList\.add\('world3d-ready'\)/);
});

test('Hover, focus, reduced-motion and mobile layout remain intentional',()=>{
 assert.match(css,/\.home-art-button:hover/);
 assert.match(css,/\.home-art-button:focus-visible/);
 assert.match(css,/\.home-hero-action:hover/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(max-width:650px\) and \(orientation:portrait\)/);
 assert.doesNotMatch(css,/!important|@ts-ignore|@ts-nocheck|!ignore/);
});
