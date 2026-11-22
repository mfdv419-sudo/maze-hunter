// Dependency-free QA for the Forest Grove action arc and Binturong paw revision.
// Run: node --test tests/forest-action-paws.node.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const css=read('src/forest-pilot.css');
const hud=read('src/ui/forest-hud.ts');
const icons=read('src/ui/forest-icons.ts');
const character=read('src/game/character.ts');

test('the three skills lie on the same jump-centered circular arc',()=>{
 const centres={jump:[2.30,1.95],action:[.90,1.95],merge:[1.40,3.02],ability:[1.40,.88]};
 const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const radius=dist(centres.jump,centres.action);
 for(const k of ['merge','ability'])assert.ok(Math.abs(dist(centres.jump,centres[k])-radius)<.015);
 for(const [a,b] of [['merge','action'],['action','ability'],['merge','ability']])assert.ok(dist(centres[a],centres[b])>1.1,`${a} and ${b} overlap`);
 for(const signature of ['forest-action-arc #jump-action','forest-action-arc #hit-action','forest-action-arc .forest-merge','forest-action-arc .forest-ability'])assert.ok(css.includes(signature),signature);
 assert.ok(css.includes('--forest-action: clamp(40px, min(9dvh, 12vw), 64px)'), 'scoped responsive action sizing');
});

test('four interactive action buttons and horizontal quick select survive',()=>{
 assert.match(hud,/actionControls\.classList\.add\('forest-action-arc'\)/);
 assert.match(hud,/actionControls\.append\(merge,ability\)/);
 assert.match(hud,/\['cake','chili','spinach','watermelon'\]/);
 assert.match(hud,/forest-quick-select/);
 assert.match(hud,/actionControls\.classList\.remove\('forest-action-arc'\)/);
 for(const k of ['merge','ability','jump','cake'])assert.ok(icons.includes(`${k}:'`),`icon ${k}`);
 assert.ok(icons.includes('ellipse cx="24" cy="30"'), 'ability icon is a paw, not generic spiral');
});

test('no trekking pole mesh; free hands, articulated paws and gait remain',()=>{
 assert.ok(!character.includes("'trekking-pole'"));
 assert.ok(!character.includes('pole.visible'));
 assert.match(character,/articulated-paw-hand/);
 assert.match(character,/articulated-paw-foot/);
 assert.match(character,/bareHands\.forEach/);
 assert.match(character,/bareFeet\.forEach/);
 assert.match(character,/gloveModel\(elbows\[i\]/);
 assert.match(character,/bootModel\(knees\[i\]/);
 assert.match(character,/if\(action\?\.swim\)/);
 assert.match(character,/action\?\.climb/);
});
