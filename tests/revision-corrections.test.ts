import {it,expect} from 'vitest';
import * as T from 'three';
import {biomeWalls} from '../src/game/biome-walls';
import {biomeLayout} from '../src/game/biome-layout';
import {distances,fits} from '../src/game/maze';
import {fieldPose} from '../src/game/field-obstacles';
import {settleRocks} from '../src/game/fallen-rocks';
import {Climber} from '../src/game/climbing';
it('joins perpendicular wall edges at the same corner at every height band',()=>{
 const layout=biomeLayout('forest','easy',1,0);layout.maze.grid=Array.from({length:5},(_,y)=>Array.from({length:5},(_,x)=>x===2&&y===2?1:0));
 const world=new T.Group();biomeWalls(world,layout,'forest');const root=world.getObjectByName('forest-native-walls')!;
 const p=(root.children[0] as T.Mesh).geometry.attributes.position,edges=new Map<string,{count:number;y:number}>();const key=(i:number)=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(4)).join(',');for(let i=0;i<p.count;i+=3)for(const[a,b]of[[i,i+1],[i+1,i+2],[i+2,i]]){const k=[key(a),key(b)].sort().join('|'),old=edges.get(k);edges.set(k,{count:(old?.count||0)+1,y:Math.max(p.getY(a),p.getY(b))});}
 // Only the bottom rim is open: terrain closes it. Every raised edge has a mate.
 const base=Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)).filter(y=>y<1));expect([...edges.values()].filter(e=>e.count===1&&e.y>base+.01)).toEqual([]);
});
it('all three distinct seal sites remain reachable across expedition maps',()=>{for(const area of ['forest','desert','mountain','coast','sea','volcano','gorge'] as const)for(let index=1;index<=10;index++){const l=biomeLayout(area,'medium',index,0),reach=distances(l.maze.grid,l.maze.start);expect(new Set(l.seals.map(p=>`${p.x},${p.y}`)).size).toBe(3);for(const p of l.seals){expect(reach.has(`${p.x},${p.y}`),`${area} ${index}`).toBe(true);expect(l.ledges.some(q=>Math.abs(q.point.x-p.x)<.7&&Math.abs(q.point.y-p.y)<.7)).toBe(false);}}},60000);
it('field rocks stop before walls and remain at their landing origin beyond the active window',()=>{const grid=Array.from({length:7},(_,y)=>Array.from({length:7},(_,x)=>x===0||x===6||y===0||y===6?1:0)),h={id:0,kind:'rock' as const,point:{x:3.5,y:3.5},axis:{x:1,y:0},phase:0,period:8};const landing=fieldPose(h,4.5,false,grid);expect(fits(grid,landing.point,.48)).toBe(true);expect(landing.height).toBe(.4);const rocks={};settleRocks(rocks,[h],5,false,grid);expect(Object.keys(rocks)).toHaveLength(1);const original=structuredClone(rocks);settleRocks(rocks,[h],7,false,grid);expect(rocks).toEqual(original);});
it('tree climbing keeps hands by the trunk until the final pull over and pauses between grips',()=>{const c=new Climber(),ledge={id:1,kind:'tree' as const,point:{x:2,y:2},height:2.8};c.state={phase:'climbing',ledge:1,elapsed:0,elevation:.18,anchor:{x:2.5,y:2.5},edge:{x:2.5,y:3.15},cooldown:0};let p={...c.state.edge};for(let i=0;i<60;i++){const out=c.step(p,p,{x:0,y:0},0,.01,[ledge]);p=out.position;}expect(p.y).toBeCloseTo(3.15);expect(c.elevation).toBeGreaterThan(.5);for(let i=0;i<200;i++)p=c.step(p,p,{x:0,y:0},0,.01,[ledge]).position;expect(c.state.phase).toBe('top');expect(p).toEqual(c.state.anchor);});
