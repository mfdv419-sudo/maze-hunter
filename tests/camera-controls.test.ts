import {it,expect} from 'vitest';
import * as T from 'three';
import {CameraCollision} from '../src/game/camera-collision';
import {toggleFullscreen} from '../src/ui/fullscreen';
it('camera stops before solid walls and returns full distance in open corridors',()=>{
 const c=new CameraCollision(),wall=new T.Mesh(new T.BoxGeometry(5,5,.4));wall.position.set(0,2,3);c.register(wall);
 const target=new T.Vector3(0,1,0),wanted=new T.Vector3(0,2,6),safe=c.resolve(target,wanted);
 expect(safe.z).toBeLessThan(2.59);expect(safe.x).toBe(0);expect(safe.y).toBeGreaterThan(1);expect(safe.clone().sub(target).normalize().distanceTo(wanted.clone().sub(target).normalize())).toBeLessThan(.00001);
 expect(c.resolve(target,new T.Vector3(6,2,0))).toEqual(new T.Vector3(6,2,0));c.dispose();
});
it('camera volume catches edge clipping and rebuilt wall instances without fading front walls',()=>{
 const c=new CameraCollision(),walls=new T.InstancedMesh(new T.BoxGeometry(1,4,.4),new T.MeshBasicMaterial(),1),m=new T.Matrix4();walls.setMatrixAt(0,m.makeTranslation(.65,1,2));walls.instanceMatrix.needsUpdate=true;c.register(walls);
 const origin=new T.Vector3(0,1,0),desired=new T.Vector3(0,1,5);expect(c.resolve(origin,desired).z).toBeLessThan(2);
 walls.setMatrixAt(0,m.makeTranslation(30,1,2));walls.instanceMatrix.needsUpdate=true;expect(c.resolve(origin,desired)).toEqual(desired);
 walls.setMatrixAt(0,m.makeTranslation(0,1,-2));walls.instanceMatrix.needsUpdate=true;expect(c.resolve(origin,desired)).toEqual(desired);expect((walls.material as T.Material).transparent).toBe(false);
});
it('fullscreen supports native enter/exit, WebKit and rejected or absent browser APIs',async()=>{
 let entered=0,exited=0;const d:any={documentElement:{requestFullscreen:()=>{entered++;return Promise.resolve();}},exitFullscreen:()=>{exited++;return Promise.resolve();}};
 expect(await toggleFullscreen(d)).toBe('entered');d.fullscreenElement={};expect(await toggleFullscreen(d)).toBe('exited');expect([entered,exited]).toEqual([1,1]);
 expect(await toggleFullscreen({documentElement:{webkitRequestFullscreen:()=>{entered++;}}}as any)).toBe('entered');
 expect(await toggleFullscreen({documentElement:{requestFullscreen:()=>Promise.reject(Error('Denied'))}}as any)).toBe('unavailable');
 expect(await toggleFullscreen({documentElement:{}}as any)).toBe('unavailable');
});

it('terrain collision works independently of hidden or batched visual walls and catches floors',()=>{
 const c=new CameraCollision(p=>p.z>=2&&p.z<=3&&p.y<8||p.y<0),target=new T.Vector3(0,1,0);
 expect(c.resolve(target,new T.Vector3(0,3,6)).z).toBeLessThan(1.8);
 expect(c.resolve(target,new T.Vector3(0,1,-5))).toEqual(new T.Vector3(0,1,-5));
 expect(c.resolve(target,new T.Vector3(0,-2,0)).y).toBeGreaterThan(0);
});
