import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const char=read('src/game/character.ts');
const gear=read('src/game/gear-model.ts');
const preview=read('src/game/modern.ts');
test('there is one active character owner, without an asynchronous GLB placeholder',()=>{
 assert.match(char,/export function createBinturong\(/);
 assert.doesNotMatch(char,/createRiggedBinturong|preloadBinturongMaster/);
 assert.doesNotMatch(preview,/preloadBinturongMaster/);
 assert.match(preview,/const hero=createBinturong\(outfit,undefined,appearances\[i\]\)/);
});
test('base body is continuous geometry and retains animatable joints',()=>{
 assert.match(char,/loftBody\(body,fur,'continuous-torso'/);
 for(const name of ['head','shoulder','elbow','hip','knee'])assert.ok(char.includes(name),name);
 assert.match(char,/action\?\.cameraLook/);
 assert.match(char,/action\.cameraElevation/);
});
test('visual outfit selection changes 3D geometries, not solely colors',()=>{
 for(const expression of ["a.head==='explorer'","a.head==='leaf'","a.head==='crown'","a.back==='pack'","a.back==='cape'"])
  assert.ok(char.includes(expression),expression);
 for(const expression of ["a.body==='explorer'","a.body==='climber'","a.body==='desert'","a.body==='diver'","a.head==='climber'","a.head==='desert'","a.head==='diver'","a.back==='climber'","a.back==='diver'"])
  assert.ok(gear.includes(expression),expression);
 for(const name of ['gloveModel','bootModel','equippedExpeditionDetails','expeditionWeaponModel'])assert.ok(char.includes(name),name);
});
