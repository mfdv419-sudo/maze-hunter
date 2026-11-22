import {describe,expect,it} from 'vitest';
import * as T from 'three';
import {AdventureCamera,ADVENTURE_CAMERA_RADIUS} from '../src/game/comfort-camera';
import {CameraCollision} from '../src/game/camera-collision';
import {createBinturong} from '../src/game/character';
import {bootModel} from '../src/game/gear-model';
import {cosmetics,slots} from '../src/services/cosmetics';

const dt=1/60;
describe('Adventure camera: distinguish wall contact from embedded geometry',()=>{
 it('recovers from a wall overlapping the existing camera position without switching sides',()=>{
  let placed=false;
  const wall=new CameraCollision(p=>placed&&Math.abs(p.z+ADVENTURE_CAMERA_RADIUS)<.27);
  const c=new AdventureCamera(),target=new T.Vector3(0,1,0),offset=new T.Vector3(0,0,-ADVENTURE_CAMERA_RADIUS);
  const first=c.step(target,offset,wall,{mode:'follow',dt});
  expect(first.z).toBeCloseTo(-ADVENTURE_CAMERA_RADIUS);
  placed=true;
  const recovered=c.step(target,offset,wall,{mode:'follow',dt});
  expect(wall.isClear(recovered,.28)).toBe(true);
  expect(recovered.x).toBeCloseTo(0);
  expect(recovered.distanceTo(first)).toBeLessThan(2);
 });
 it('does not relocate automatically at a clear stationary eye',()=>{
  const camera=new AdventureCamera();const wall=new CameraCollision(p=>p.z<-8);
  const target=new T.Vector3(0,1,0),offset=new T.Vector3(0,0,-ADVENTURE_CAMERA_RADIUS);
  const first=camera.step(target,offset,wall,{mode:'follow',dt});
  for(let i=0;i<60;i++){
   const next=camera.step(target,offset,wall,{mode:'follow',dt});
   expect(next.distanceTo(first)).toBeLessThan(.0001);
  }
 });
});

describe('Wardrobe categorization and revised avatar',()=>{
 it('retains all 42 progression items and groups by their equipment slots, not by worlds',()=>{
  const gear=cosmetics.filter(c=>c.expedition);
  expect(gear).toHaveLength(42);
  expect(gear.every(item=>slots.includes(item.slot))).toBe(true);
  for(const item of gear){
   expect(cosmetics.filter(c=>c.slot===item.slot)).toContain(item);
  }
 });
 it('keeps a small visible side gap by moving shoulders outward',()=>{
  const a=createBinturong();const shoulders=a.root.getObjectsByProperty('name','shoulder');
  expect(shoulders).toHaveLength(2);
  const positions=shoulders.map(s=>s.position.x).sort((x,y)=>x-y);
  expect(positions[0]).toBeLessThan(-.30);expect(positions[1]).toBeGreaterThan(.30);
  a.dispose();
 });
 it('retains toe pads below and behind the forward tips of each foot',()=>{
  const b=bootModel(new T.Group(),'bare',1),pads=b.getObjectsByProperty('name','foot-toe-pad');
  expect(pads).toHaveLength(4);
  for(const pad of pads){expect(pad.position.z).toBeLessThan(.15);expect(pad.position.y).toBeLessThan(-.07);}
 });
});
