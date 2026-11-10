import {expect,it,vi} from 'vitest';
import * as T from 'three';
import {forestPilotLayout,pilotGround,pilotTreeSites,PILOT_WATER_LEVEL,pilotWallHeight} from '../src/game/forest-pilot';
import {ForestClimber} from '../src/game/forest-traversal';
vi.mock('../src/game/biome-scenery',()=>({biomeSky:()=>new T.Texture()}));
import {forestPilotWorld} from '../src/game/forest-pilot-world';

it('Forest Grove has distinct playable elevation bands, including a lower swimming valley',()=>{
 const l=forestPilotLayout(),g=l.maze.grid;
 const dry:number[]=[];
 for(let z=1;z<g.length-1;z++)for(let x=1;x<g.length-1;x++){
  if(g[z][x]!==0)continue;
  const y=pilotGround(x+.5,z+.5);
  if(y>=PILOT_WATER_LEVEL)dry.push(y);
 }
 expect(dry.length).toBeGreaterThan(1500);
 expect(dry.filter(y=>y>.5).length/dry.length).toBeGreaterThan(.6);
 expect(pilotGround(12.5,63.5)).toBeLessThan(.5); // gentle entrance
 expect(pilotGround(12.5,24.5)).toBeGreaterThan(1.5); // high cliffs
 expect(pilotGround(34.5,25.5)).toBeGreaterThan(1.8); // elevated tree routes
 expect(pilotGround(34.5,9.5)).toBeGreaterThan(1.3); // high sanctuary
 expect(pilotGround(55.5,53.5)).toBeLessThan(PILOT_WATER_LEVEL);
});

it('trees concentrate on solid visible path edges without blocking walkable cells',()=>{
 const l=forestPilotLayout(),trees=pilotTreeSites(l),g=l.maze.grid;
 expect(trees.length).toBeGreaterThan(300);
 const edges=trees.filter(t=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>g[t.z-.5+dz]?.[t.x-.5+dx]===0));
 expect(edges.length).toBeGreaterThan(100);
 for(const t of trees)expect(g[t.z-.5]?.[t.x-.5]).toBe(1);
});

it('waterfall is connected 3D geometry visible from side and both faces',()=>{
 const scene=new T.Scene(),world=new T.Group(),l=forestPilotLayout();scene.add(world);
 const visual=forestPilotWorld(scene,world,l),mesh=world.getObjectByName('waterfall-continuous-volume') as T.Mesh;
 expect(mesh).toBeDefined();
 const box=new T.Box3().setFromObject(mesh);
 expect(box.max.y-box.min.y).toBeGreaterThan(2.5);
 expect(box.max.z-box.min.z).toBeGreaterThan(2.5);
 expect(box.max.x-box.min.x).toBeGreaterThan(.9);
 const y=(box.max.y+box.min.y)/2,z=40.5;
 const front=new T.Raycaster(new T.Vector3(64,y,z),new T.Vector3(1,0,0));
 const rear=new T.Raycaster(new T.Vector3(68,y,z),new T.Vector3(-1,0,0));
 const side=new T.Raycaster(new T.Vector3(66,y,44),new T.Vector3(0,0,-1));
 expect(front.intersectObject(mesh).length).toBeGreaterThan(0);
 expect(rear.intersectObject(mesh).length).toBeGreaterThan(0);
 expect(side.intersectObject(mesh).length).toBeGreaterThan(0);
 visual.dispose();
});

it('trees rooted on the upper rock layer do not block free ground below',()=>{
 const c=new ForestClimber(),p={x:8.0,y:8.5},next={x:8.3,y:8.5};
 const l={id:800001,kind:'tree' as const,point:{x:8,y:8},width:.9,depth:.9,
  height:pilotWallHeight(8.5,8.5)-pilotGround(8.5,8.5)+3};
 const moved=c.step(p,next,{x:1,y:0},0,.016,[l]);
 expect(moved.position.x).toBe(next.x);
 expect(c.state.phase).toBe('ground');
});
