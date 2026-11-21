import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const home=readFileSync(new URL('../src/home-ui.css',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');

test('Home has exactly the two approved game entries, no separate play CTA',()=>{
 const block=main.slice(main.indexOf('function home()'),main.indexOf('const version = document.createElement("small")',main.indexOf('function home()')));
 const events=main.slice(main.indexOf('function home()'),main.indexOf('click("lab"',main.indexOf('function home()')));
 assert.match(block,/id="retro-mode"/);
 assert.match(block,/id="modern-mode"/);
 assert.match(events,/click\('retro-mode',/);
 assert.match(events,/click\('modern-mode',/);
 assert.doesNotMatch(block,/id="(?:play-now|home-play|play-solo)"/);
});

test('Both game entries have distinct illustrated scenes and readable icon/text',()=>{
 assert.match(main,/class="mode-tile-art"/);
 assert.match(main,/class="mode-glyph"/);
 assert.match(main,/class="mode-copy"/);
 assert.match(home,/mode-tile--retro \.mode-tile-art \{background-image:url\('\/adventure\/classic\.webp'\)/);
 assert.match(home,/mode-tile--adventure \.mode-tile-art \{background-image:url\('\/adventure\/forest-panorama\.webp'\)/);
});

test('Hover, keyboard focus and motion accessibility are real, not inert',()=>{
 assert.match(home,/\.mode-tile:hover/);
 assert.match(home,/\.mode-tile:focus-visible/);
 assert.match(home,/\.home-shortcuts button:hover/);
 assert.match(home,/\.home-tool:hover/);
 assert.match(home,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(home,/@media\(max-width:650px\) and \(orientation:portrait\)/);
});

test('No forbidden priority overrides; fullscreen and wardrobe actions retained',()=>{
 assert.doesNotMatch(home,/!important|@ts-ignore|@ts-nocheck/);
 assert.match(main,/homeTool\('fullscreen','expand'/);
 assert.match(main,/click\("fullscreen", requestGameFullscreen\)/);
 assert.match(main,/click\('home-shop',\(\)=>wardrobe\(\)\)/);
});
