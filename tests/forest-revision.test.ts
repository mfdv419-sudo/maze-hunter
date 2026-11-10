import {it,expect,vi} from 'vitest';
import * as T from 'three';
import {forestPilotLayout,pilotGround,pilotWallHeight,PILOT_WATER_LEVEL} from '../src/game/forest-pilot';
import {AdventureState} from '../src/game/adventure-state';
import {fits,center} from '../src/game/maze';
import {awakeningShot} from '../src/game/awakening';
vi.mock('../src/game/biome-scenery',()=>({biomeSky:()=>new T.Texture()}));
import {forestPilotWorld} from '../src/game/forest-pilot-world';
it('solid cliffs have actual elevation, and water triangles cover swimming depths without grass islands',()=>{
 const s=new AdventureState('medium',0,1,false,undefined,'forest',false,true),scene=new T.Scene(),world=new T.Group();scene.add(world);const v=forestPilotWorld(scene,world,s.layout,()=>s),mesh=world.getObjectByName('depth-matched-water') as T.Mesh,points=mesh.geometry.attributes.position;
 expect(points.count).toBeGreaterThan(1000);for(let i=0;i<points.count;i++){expect(points.getY(i)).toBeCloseTo(PILOT_WATER_LEVEL);expect(pilotGround(points.getX(i),points.getZ(i))).toBeLessThan(PILOT_WATER_LEVEL);}
 expect(pilotGround(12.5,24.5)).toBeGreaterThan(1);expect(pilotWallHeight(12,24)).toBeGreaterThan(pilotGround(12,24)+2);expect(world.getObjectsByProperty('name','continuous-cliff-chunk').length).toBeGreaterThan(8);expect(world.getObjectsByProperty('name','instanced-forest-trees').length).toBeLessThanOrEqual(6);expect(world.getObjectByName('waterfall-volume')).toBeDefined();v.dispose();expect(world.children).toHaveLength(0);
});
it('sustained fast movement cannot tunnel through pilot grid walls or leave the navigation surface',()=>{
 const s=new AdventureState('medium',0,1,false,undefined,'forest',false,true);s.position=center(s.layout.maze.start);for(let i=0;i<250;i++){s.step(.1,0,-15,-9,0,true,true);expect(fits(s.grid,s.position,.26)).toBe(true);}
});
it('objective patrols are bounded and all patrol nodes are on navigable land',()=>{const l=forestPilotLayout();expect(l.patrols.length).toBe(7);for(const patrol of l.patrols)for(const p of patrol){expect(l.maze.grid[p.y][p.x],JSON.stringify(p)).toBe(0);expect(pilotGround(p.x+.5,p.y+.5)).toBeGreaterThan(-1.05);}});
it('cinematic starts below the boss, pulls out, orbits, and holds the final reveal',()=>{const a=awakeningShot(0),b=awakeningShot(1),hold=awakeningShot(.95);expect(a.y).toBeLessThan(a.lookHeight);expect(Math.hypot(b.x,b.z)).toBeGreaterThan(Math.hypot(a.x,a.z)+4);expect(b.angle-a.angle).toBeGreaterThan(1);expect(hold).toEqual(b);});
it('guards cannot tunnel through rune pillars during a fast patrol step',()=>{const s=new AdventureState('medium',0,1,false,undefined,'forest',false,true),move=(s as any).moveGuard.bind(s),start={x:50,y:26},end=move(start,0,4,.27);expect(end.y).toBeLessThan(27);expect(Math.hypot(end.x-50,end.y-27)).toBeGreaterThanOrEqual(.64);});
