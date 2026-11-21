import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
const glb = readFileSync(new URL('../public/models/binturong_master_rigged.glb', import.meta.url));
const root = new URL('../src/game/character.ts', import.meta.url);
const source = readFileSync(root,'utf8');
const bytes=glb.readUInt32LE(12),typ=glb.toString('ascii',16,20),scene=JSON.parse(glb.subarray(20,20+bytes).toString('utf8').trim());
const boneNames=scene.skins[0].joints.map(i=>scene.nodes[i].name);
test('exported glb is valid and contains skeleton',()=>{
 assert.equal(glb.toString('ascii',0,4),'glTF');
 assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
 assert.equal(typ,'JSON');assert.equal(scene.skins.length,1);
 assert.equal(boneNames.length,15);assert.ok(boneNames.includes('Head')&&boneNames.includes('Spine')&&boneNames.includes('TailTip'));
});
test('each mesh is truly skinned, not just a stack of runtime spheres',()=>{
 assert.ok(scene.meshes.length>=10);
 for(const m of scene.meshes){for(const p of m.primitives){
  assert.ok('JOINTS_0' in p.attributes,'missing joint weights '+m.name);
  assert.ok('WEIGHTS_0' in p.attributes,'missing vertex weights '+m.name);
  assert.ok('NORMAL' in p.attributes);
 }}
 assert.ok(scene.meshes.some(m=>m.name==='Slot::base::fur'));
 assert.ok(scene.meshes.some(m=>m.name==='Slot::outfit::ivory'));
 assert.ok(scene.meshes.some(m=>m.name==='Slot::backpack::gear_cream'));
 assert.ok(scene.meshes.length<=32, 'too many skinned draw calls for mobile');
});
test('animation clips cover core gameplay',()=>{
 const clips=scene.animations.map(a=>a.name);
 for(const name of ['Idle','Walk','Run','Jump','Climb','Swim','Attack','Wave'])assert.ok(clips.includes(name));
 for(const a of scene.animations){assert.ok(a.channels.length>0);for(const c of a.channels)assert.equal(c.target.path,'rotation');}
});
test('one owner has replaced procedural in-game character',()=>{
 assert.ok(source.includes('createRiggedBinturong'));
 assert.ok(!source.includes('organicOrb('));
 assert.ok(!source.includes('RoundedBoxGeometry'));
 assert.ok(!source.includes('!important'));
 assert.ok(!source.includes('@ts-ignore'));
});
