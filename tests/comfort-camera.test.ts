import {describe,it,expect,vi} from 'vitest';
vi.mock('../src/systems/audio',()=>({sfx:()=>{},setAudioScene:()=>{},environmentSound:()=>{}}));
import * as T from 'three';
import {autoCenter,clampPitch,lookDelta,clearOrbit,sceneAzimuth,CAMERA_PITCH} from '../src/game/comfort-camera';
import {CameraCollision} from '../src/game/camera-collision';
describe('comfort camera',()=>{
 it('touch turn scales to viewport instead of pixel density and ignores invalid deltas',()=>{for(const w of[390,844,1280])expect(lookDelta(w/2,0,w,390).yaw).toBeCloseTo(-Math.PI/2);expect(lookDelta(NaN,Infinity,844,390)).toEqual({yaw:0,pitch:0});});
 it('pitch cannot lock into a top-down view or become invalid',()=>{expect(clampPitch(Infinity)).toBe(CAMERA_PITCH);expect(clampPitch(99)).toBeCloseTo(60*Math.PI/180);expect(clampPitch(-99)).toBeCloseTo(-55*Math.PI/180);});
 it('manual mode never centers; other modes wait after manual input and stay still when stopped',()=>{expect(autoCenter('manual',100,3,false)).toBe(0);expect(autoCenter('comfort',1,3,false)).toBe(0);expect(autoCenter('comfort',9,0,false)).toBe(0);expect(autoCenter('comfort',9,3,true)).toBe(0);expect(autoCenter('dynamic',3,3,false)).toBe(0);});
 it('wall contact stays on the requested side without orbiting or raising pitch',()=>{const collision=new CameraCollision(),wall=new T.Mesh(new T.BoxGeometry(5,8,.4));wall.position.set(0,3,-1);collision.register(wall);const target=new T.Vector3(0,1,0),offset=new T.Vector3(0,2,-7),safe=clearOrbit(target,offset,(a,b)=>collision.resolve(a,b));expect(safe.distanceTo(target)).toBeLessThan(1);expect(safe.x).toBe(0);expect(safe.y).toBeLessThanOrEqual(3);expect(collision.resolve(target,safe).distanceTo(safe)).toBeLessThan(.03);});
 it('boss shot chooses the unblocked side of a hill',()=>{const c=new CameraCollision(p=>p.z>1&&p.y<10),target=new T.Vector3(0,2,0),a=sceneAzimuth(target,(x,y)=>c.resolve(x,y));const desired=target.clone().add(new T.Vector3(Math.sin(a)*8,2,Math.cos(a)*8));expect(c.resolve(target,desired).distanceTo(target)).toBeGreaterThan(7);});
});

import {ModernGame} from '../src/game/modern';
it('camera uses climbable solid footprints and follows moved objects while ignoring held objects',()=>{
 const g:any=Object.create(ModernGame.prototype);g.terrain=()=>0;g.maze={grid:Array.from({length:6},()=>Array(6).fill(0))};g.adventure={area:'forest',layout:{ledges:[{id:1,point:{x:2,y:2},height:3,kind:'tree'}],grass:[]},propMoves:{}};
 const solid=(x:number,z:number,y=1)=>g.cameraBlocked(new T.Vector3(x*2.2,y,z*2.2));
 expect(solid(2.5,2.5)).toBe(true);expect(solid(2.8,2.5)).toBe(false);expect(solid(2.5,2.5,3.5)).toBe(false);
 g.adventure.propMoves['1']={x:4,y:4};expect(solid(2.5,2.5)).toBe(false);expect(solid(4,4)).toBe(true);g.adventure.propMoves['1'].holder='self';expect(solid(4,4)).toBe(false);
});
it('reset requests a smooth behind-character view without teleporting the rendered camera',()=>{const g:any=Object.create(ModernGame.prototype);g.angle=1.2;g.time=8;g.cameraYaw=-1;g.cameraPitch=.6;g.resetCamera();expect(g.desiredCameraYaw).toBe(1.2);expect(g.desiredPitch).toBe(CAMERA_PITCH);expect(g.lastLook).toBe(8);expect(g.cameraYaw).toBe(-1);expect(g.cameraPitch).toBe(.6);});
it('resizing never overwrites the agreed field of view',()=>{const g:any=Object.create(ModernGame.prototype);g.options={};g.host={clientWidth:844,clientHeight:390};g.renderer={setSize:()=>{}};g.camera=new T.PerspectiveCamera(52);g.resize();expect(g.camera.fov).toBe(60);g.host={clientWidth:390,clientHeight:844};g.resize();expect(g.camera.fov).toBe(60);expect(g.camera.aspect).toBeCloseTo(390/844);});

import {cameraOrbit,cameraFocus} from '../src/game/comfort-camera';
it('vertical orbit preserves radius and upward look has a real focus above the avatar',()=>{for(const degrees of[0,18,40,60]){const p=degrees*Math.PI/180,o=cameraOrbit(p,7.2);expect(Math.hypot(o.horizontal,o.height)).toBeCloseTo(7.2);}expect(cameraFocus(-45*Math.PI/180,7.2)).toBeCloseTo(7.2);});

import {ADVENTURE_CAMERA_RADIUS,AdventureCamera,RadiusOrbitCamera,steerOrbit} from '../src/game/comfort-camera';
import {screenMotion} from '../src/game/movement';
const open=(_:T.Vector3,p:T.Vector3)=>p.clone();
it('keeps spherical radius and relative height at 30/60/120 FPS while moving and turning',()=>{for(const hz of[30,60,120]){const c=new RadiusOrbitCamera(),radius=7.2;for(let i=0;i<hz*10;i++){const yaw=i/hz,target=new T.Vector3(Math.sin(yaw)*4,Math.sin(yaw)*2,Math.cos(yaw)*4),o=cameraOrbit(CAMERA_PITCH,radius),p=c.step(target,new T.Vector3(-Math.sin(yaw)*o.horizontal,o.height,-Math.cos(yaw)*o.horizontal),open);expect(p.distanceTo(target)).toBeCloseTo(radius);expect(p.y-target.y).toBeCloseTo(o.height);}}});
it('does not retain old world height after wall contact and descending',()=>{const c=new RadiusOrbitCamera(),offset=new T.Vector3(0,2,-7);c.step(new T.Vector3(0,8,0),offset,(a,b)=>a.clone().lerp(b,.5));const t=new T.Vector3(0,1,0),p=c.step(t,offset,open),d=p.distanceTo(t);expect((p.y-t.y)/d).toBeCloseTo(2/Math.hypot(7,2));expect(p.y).toBeLessThan(4);});
it('no scenery-driven yaw change and no time-based retreat while stationary',()=>{const c=new RadiusOrbitCamera(),t=new T.Vector3(0,1,0),o=new T.Vector3(0,2,-7),p=c.step(t,o,(a,b)=>a.clone().lerp(b,.4));for(let i=0;i<900;i++){const next=c.step(t,o,open);expect(next.distanceTo(p)).toBeLessThan(.00001);expect(next.x).toBe(0);expect(next.z).toBeLessThan(0);}});
it('held diagonal steering makes a continuous circle; releasing steering never spins the camera',()=>{for(const side of[-1,1]){let yaw=0,p={x:0,y:0};const x=side/Math.sqrt(2),dt=1/120,period=2*Math.PI/(Math.abs(x)*1.05);for(let i=0;i<Math.round(period/dt);i++){yaw=steerOrbit(yaw,x,dt);const v=screenMotion(x,-1/Math.sqrt(2),yaw,2.3);p={x:p.x+v.x*dt,y:p.y+v.y*dt};}expect(Math.hypot(p.x,p.y)).toBeLessThan(.05);expect(steerOrbit(yaw,0,dt)).toBe(yaw);expect(steerOrbit(yaw,side,dt,true)).toBe(yaw);}});

describe('Adventure camera collision and free view',()=>{
 const dt=1/60;
 const target=new T.Vector3(0,1,0),offset=new T.Vector3(0,0,-ADVENTURE_CAMERA_RADIUS);
 const follow={mode:'follow',dt} as const;
 const manual={mode:'manual',dt} as const;
 it('stops at a wall, allows the player to approach, and resumes only after the player restores room',()=>{
  const camera=new AdventureCamera();
  const collision=new CameraCollision(p=>p.z<-8);
  const at=(z:number)=>target.clone().setZ(z);
  expect(camera.step(target,offset,collision,follow).z).toBeCloseTo(-7.2);
  const held=camera.step(at(-.8),offset,collision,follow);
  expect(held.z).toBeGreaterThan(-7.73);
  expect(held.z).toBeLessThan(-7.65);
  expect(held.x).toBe(0);
  expect(collision.isClear(held,.28)).toBe(true);
  for(let frame=0;frame<160;frame++)expect(camera.step(at(-1.8),offset,collision,{...follow,outOfFrame:true})).toEqual(held);
  expect(held.distanceTo(at(-1.8))).toBeLessThan(7.2);
  expect(camera.step(at(-1),offset,collision,follow)).toEqual(held);
  const resumed=camera.step(at(-.4),offset,collision,follow);
  expect(resumed.distanceTo(at(-.4))).toBeCloseTo(7.2);
  expect(resumed.z).toBeGreaterThan(held.z);
 });
 it('free view approaches on the requested side smoothly and retains the clipped view on release',()=>{
  const camera=new AdventureCamera(),collision=new CameraCollision(p=>p.x>3);
  const towardWall=new T.Vector3(7.2,0,0);
  let eye=camera.step(target,offset,collision,follow);
  for(let frame=0;frame<160;frame++){
   const next=camera.step(target,towardWall,collision,manual);
   expect(next.distanceTo(eye)).toBeLessThanOrEqual(.218);
   expect(collision.isClear(next,.28)).toBe(true);
   eye=next;
  }
  expect(eye.x).toBeGreaterThan(2.6);
  expect(Math.abs(eye.z)).toBeLessThan(.05);
  const release=eye.clone();
  for(let frame=0;frame<120;frame++)expect(camera.step(target,offset,collision,follow)).toEqual(release);
  for(let frame=0;frame<100;frame++)eye=camera.step(target,offset,collision,manual);
  expect(eye.distanceTo(target)).toBeGreaterThan(release.distanceTo(target));
  expect(eye.z).toBeLessThan(-3);
  expect(Math.abs(eye.x)).toBeLessThan(.01);
  for(let frame=0;frame<120;frame++)expect(camera.step(target,offset,collision,manual).distanceTo(eye)).toBeLessThan(.0001);
 });
 it('free view stays above the floor while looking up from beside the player',()=>{
  const camera=new AdventureCamera(),collision=new CameraCollision(p=>p.y<0);
  const low=new T.Vector3(0,-4,-Math.sqrt(7.2**2-4**2));
  let eye=camera.step(target,offset,collision,follow);
  for(let frame=0;frame<100;frame++){
   const next=camera.step(target,low,collision,manual);
   expect(next.distanceTo(eye)).toBeLessThanOrEqual(.218);
   expect(next.y).toBeGreaterThan(.28);
   eye=next;
  }
  expect(eye.y).toBeLessThan(.42);
  expect(eye.distanceTo(target)).toBeLessThan(2);
 });
 it('turns gently on lost framing after a real character turn, with stable yaw while still or in view',()=>{
  const camera=new AdventureCamera(),collision=new CameraCollision();
  const behind=new T.Vector3(0,0,-7.2);
  camera.step(target,behind,collision,follow);
  camera.step(target.clone().setZ(.1),behind,collision,{...follow,heading:0,outOfFrame:true});
  const right=target.clone().setX(.1).setZ(.1);
  const inFrame=camera.step(right,behind,collision,{...follow,heading:Math.PI/2});
  expect(inFrame.clone().sub(right).toArray()).toEqual(behind.toArray());
  const next=right.clone().add(new T.Vector3(.1,0,0));
  const turned=camera.step(next,behind,collision,{...follow,heading:Math.PI/2,outOfFrame:true});
  expect(turned.x-next.x).toBeLessThan(0);
  expect(turned.distanceTo(next)).toBeCloseTo(7.2);
  expect(turned.distanceTo(inFrame)).toBeLessThan(.22);
  for(let frame=0;frame<12;frame++)expect(camera.step(next,behind,collision,{...follow,outOfFrame:true})).toEqual(turned);
 });
 it('recognizes a gradual joystick turn without recentering on straight travel',()=>{
  const camera=new AdventureCamera(),collision=new CameraCollision();
  let point=target.clone(),eye=camera.step(point,offset,collision,follow);
  for(let frame=0;frame<=4;frame++){
   const heading=frame*.16;
   point.add(new T.Vector3(Math.sin(heading)*.05,0,Math.cos(heading)*.05));
   eye=camera.step(point,offset,collision,{...follow,heading,outOfFrame:true});
   if(frame<3)expect(eye.x).toBeCloseTo(point.x);
  }
  expect(eye.x).toBeLessThan(point.x-.1);
 });
});
