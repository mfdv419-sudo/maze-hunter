import {describe,it,expect,vi} from 'vitest';
vi.mock('../src/systems/audio',()=>({sfx:()=>{},setAudioScene:()=>{},environmentSound:()=>{}}));
import * as T from 'three';
import {autoCenter,clampPitch,lookDelta,clearOrbit,sceneAzimuth,CAMERA_PITCH} from '../src/game/comfort-camera';
import {CameraCollision} from '../src/game/camera-collision';
describe('comfort camera',()=>{
 it('touch turn scales to viewport instead of pixel density and ignores invalid deltas',()=>{for(const w of[390,844,1280])expect(lookDelta(w/2,0,w,390).yaw).toBeCloseTo(-Math.PI/2);expect(lookDelta(NaN,Infinity,844,390)).toEqual({yaw:0,pitch:0});});
 it('pitch cannot lock into a top-down view or become invalid',()=>{expect(clampPitch(Infinity)).toBe(CAMERA_PITCH);expect(clampPitch(99)).toBeCloseTo(50*Math.PI/180);expect(clampPitch(-99)).toBeCloseTo(-12*Math.PI/180);});
 it('manual mode never centers; other modes wait after manual input and stay still when stopped',()=>{expect(autoCenter('manual',100,3,false)).toBe(0);expect(autoCenter('comfort',4,3,false)).toBe(0);expect(autoCenter('comfort',9,0,false)).toBe(0);expect(autoCenter('comfort',9,3,true)).toBe(0);expect(autoCenter('dynamic',3,3,false)).toBeGreaterThan(autoCenter('comfort',6,3,false));});
 it('finds a clear side beside a wall without pushing into the hero or increasing pitch',()=>{const collision=new CameraCollision(),wall=new T.Mesh(new T.BoxGeometry(5,8,.4));wall.position.set(0,3,-1);collision.register(wall);const target=new T.Vector3(0,1,0),offset=new T.Vector3(0,2,-7),safe=clearOrbit(target,offset,(a,b)=>collision.resolve(a,b));expect(safe.distanceTo(target)).toBeGreaterThan(2.1);expect(safe.y).toBeLessThanOrEqual(3);expect(collision.resolve(target,safe).distanceTo(safe)).toBeLessThan(.03);});
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
