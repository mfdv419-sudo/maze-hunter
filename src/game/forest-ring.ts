import type {Difficulty,Grid,Point} from './maze';
import {route} from './maze';

/** Extreme is the master graph. Lower difficulties select connected subsets of
 * its optional zones/crosslinks; the three Diamond zones never disappear.
 * This module owns the same grid cells that game physics and map rendering use.
 */
export const FOREST_RING_BUILD='FG-RING-MASTER-01-20261104';
export type RingZoneId='entrance'|'green'|'ruins'|'waterfall'|'chasm'|'giant'|'underground'|'floating'|'boss';
export type RingConnector='trail'|'stairs'|'bridge'|'water'|'tunnel'|'vine'|'sky';
export interface RingZone {id:RingZoneId;point:Point;ring:'outer'|'objective'|'inner'|'core';mandatory:boolean}
export interface RingPassage {id:string;from:RingZoneId;to:RingZoneId;kind:RingConnector;optional?:boolean;reward?:'star'|'chest'|'xp';path:Point[]}
export interface ForestRing {
 version:string;difficulty:Difficulty;size:number;center:Point;entry:Point;exit:Point;
 zones:RingZone[];passages:RingPassage[];trails:Point[][];grid:Grid;
 gates:{boss:Point[];escape:Point[];bridge:Point[];shortcut:Point[]};
 deadEnds:Point[];activeZones:RingZoneId[];paths:{toBoss:Point[];escape:Point[]};
}
const c={x:36,y:36},point=(x:number,y:number):Point=>({x:Math.round(x),y:Math.round(y)});
const zonePoints:Record<RingZoneId,Point>={
 entrance:point(36,68),green:point(12,24),ruins:point(54,30),waterfall:point(55,53),
 chasm:point(20,47),giant:point(34,25),underground:point(42,62),floating:point(10,39),boss:point(36,36)
};
const coreZones=['entrance','green','ruins','waterfall','boss'] as RingZoneId[];
const optionalZones:Record<Difficulty,RingZoneId[]>={
 easy:[],medium:['chasm','giant'],hard:['chasm','giant','underground'],
 extreme:['chasm','giant','underground','floating']
};
const ringOf:Record<RingZoneId,RingZone['ring']>={entrance:'outer',green:'objective',ruins:'objective',waterfall:'objective',chasm:'objective',giant:'inner',underground:'outer',floating:'outer',boss:'core'};
function nearRing(p:Point,r:number):Point{const a=Math.atan2(p.y-c.y,p.x-c.x);return point(c.x+Math.cos(a)*r,c.y+Math.sin(a)*r);}
function circleArc(radius:number,start:number,end:number,steps:number):Point[]{return Array.from({length:steps+1},(_,i)=>point(c.x+Math.cos(start+(end-start)*i/steps)*radius,c.y+Math.sin(start+(end-start)*i/steps)*radius));}
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
function discrete(points:Point[]):Point[]{const out:Point[]=[];
 for(let i=0;i<points.length;i++){if(i===0){out.push(points[i]);continue;}
  const a=points[i-1],b=points[i],steps=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*3;
  for(let j=1;j<=steps;j++){const p=point(a.x+(b.x-a.x)*j/steps,a.y+(b.y-a.y)*j/steps);
   if(!same(p,out[out.length-1]))out.push(p);
  }
 }return out;
}
/** A physically contiguous connected graph. Escape has its own locked corridor,
 * preventing accidental direct access to the boss before objectives are met. */
export function forestRing(difficulty:Difficulty):ForestRing{
 const n=73,grid:Grid=Array.from({length:n},()=>Array(n).fill(1));
 const active=new Set<RingZoneId>([...coreZones,...optionalZones[difficulty]]);
 const zones=([...active] as RingZoneId[]).map(id=>({id,point:{...zonePoints[id]},ring:ringOf[id],mandatory:coreZones.includes(id)}));
 const trails:Point[][]=[],passages:RingPassage[]=[],deadEnds:Point[]=[];
 const carve=(p:Point,r=1)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(y>0&&x>0&&y<n-1&&x<n-1&&Math.hypot(x-p.x,y-p.y)<=r+.18)grid[y][x]=0;};
 const draw=(points:Point[],radius=1)=>{const path=discrete(points);path.forEach(p=>carve(p,radius));trails.push(path);return path;};
 const connection=(id:string,from:RingZoneId,to:RingZoneId,kind:RingConnector,via:Point[]=[],reward?:RingPassage['reward'])=>{
  if(!active.has(from)||!active.has(to))return;
  const path=draw([zonePoints[from],...via,zonePoints[to]]);
  passages.push({id,from,to,kind,optional:!coreZones.includes(from)||!coreZones.includes(to),reward,path});
 };
 const objectiveR=22,outerR=30,innerR=12;
 // The exploration circuit is bent around the boss. Terrain walls between
 // the rings are actual grid obstacles, not a decorative painted circle.
 draw(circleArc(objectiveR,-Math.PI,Math.PI,110),1);
 // Additional peripheral routes become available as level difficulty grows.
 const outerAngles:{[K in Difficulty]:[number,number]}={
  easy:[.18*Math.PI,.82*Math.PI],medium:[-.22*Math.PI,.92*Math.PI],
  hard:[-.63*Math.PI,.99*Math.PI],extreme:[-Math.PI,Math.PI]
 };
 const [a0,a1]=outerAngles[difficulty];draw(circleArc(outerR,a0,a1,difficulty==='extreme'?160:80),1);
 if(difficulty!=='easy')draw(circleArc(innerR,-Math.PI*.9,-Math.PI*.1,55),1);
 // Core mandatory connectors exist across all four modes.
 connection('entrance-outer','entrance','waterfall','trail',[point(36,61),point(45,60),point(49,57)]);
 connection('cliff-ring','green','ruins','trail',[point(17,30),point(19,19),point(36,16),point(48,23)]);
 connection('valley-ring','waterfall','ruins','water',[point(62,46),point(61,37),point(57,34)]);
 connection('green-radial','entrance','green','stairs',[point(25,60),point(17,47),point(14,34)]);
 // Giant Tree has a lightweight access path on Easy; the full vertical
 // objective branch is only part of Medium/Hard/Extreme.
 const inner=zonePoints.giant;
 draw([point(36,14),point(36,20),inner,point(36,28),point(36,34)]);
 draw([point(36,36),point(36,47),point(36,59),zonePoints.entrance]);
 if(active.has('giant'))connection('ruins-canopy','ruins','giant','vine',[point(48,24),point(41,22)],'star');
 else draw([zonePoints.ruins,point(45,25),point(36,26)]);
 if(active.has('chasm'))connection('cliff-chasm','green','chasm','bridge',[point(14,35),point(18,41)],'star');
 if(active.has('chasm'))connection('chasm-waterfall','chasm','waterfall','trail',[point(28,51),point(39,54),point(48,54)]);
 if(active.has('underground')){
  connection('secret-cave','underground','waterfall','tunnel',[point(48,63),point(53,59)],'xp');
  connection('ruins-cave','ruins','underground','tunnel',[point(60,34),point(62,44),point(58,58)],'chest');
 }
 if(active.has('floating')){
  connection('cliff-sky','green','floating','sky',[point(10,29),point(8,35)],'star');
  connection('sky-tree','floating','giant','bridge',[point(14,34),point(22,25),point(27,21)],'chest');
 }
 // Intentionally convincing dead ends with a reward and a safe return route.
 for(const [id,via,reward]of [
  ['green',[point(8,20),point(5,14)],'star'],
  ['ruins',[point(60,25),point(66,18)],'chest'],
  ['waterfall',[point(61,60),point(67,65)],'star'],
  ['chasm',[point(13,50),point(7,55)],'star'],
  ['underground',[point(45,66),point(51,68)],'xp'],
  ['floating',[point(5,34),point(5,26)],'chest']
 ] as [RingZoneId,Point[],RingPassage['reward']][]){if(!active.has(id))continue;
  const path=draw([zonePoints[id],...via],1);deadEnds.push(path[path.length-1]);passages.push({id:'dead-end-'+id,from:id,to:id,kind:id==='underground'?'tunnel':'trail',optional:true,reward,path});
 }
 // Each active zone has a real open clearing. The central boss is isolated
 // from the circuit by two separate controllable physical gate segments.
 for(const z of zones)carve(z.point,z.id==='boss'?5:z.id==='entrance'?2:3);
 for(const p of [point(36,14),inner,point(36,28)])carve(p,2);
 const gates={
  boss:Array.from({length:5},(_,i)=>point(34+i,30)),
  escape:Array.from({length:5},(_,i)=>point(34+i,44)),
  bridge:Array.from({length:3},(_,i)=>point(18+i,42)),
  shortcut:Array.from({length:3},(_,i)=>point(15+i,36)),
 };
 // Optional gates must not break the mandatory objective circuit.
 if(!active.has('chasm'))gates.bridge=[];
 if(!active.has('floating'))gates.shortcut=[];
 for(const p of Object.values(gates).flat())grid[p.y][p.x]=1;
 // A small outer exit alcove adjacent to the entrance remains accessible,
 // but completion is gated by bossCleared in AdventureState.
 const exit=point(38,68);draw([zonePoints.entrance,exit],1);
 // Ensure an entrance can't accidentally enter the boss via an arc tangent.
 const closedPath=route(grid,zonePoints.entrance,zonePoints.boss);
 if(closedPath.length)throw Error('Forest ring boss must be locked at entry');
 for(const name of ['green','ruins','waterfall'] as const)if(!route(grid,zonePoints.entrance,zonePoints[name]).length)throw Error('Unreachable mandatory zone: '+name);
 const opened=grid.map(row=>[...row]);for(const p of [...gates.boss,...gates.escape,...gates.bridge,...gates.shortcut])opened[p.y][p.x]=0;
 const toBoss=route(opened,zonePoints.entrance,zonePoints.boss),escape=route(opened,zonePoints.boss,exit);
 if(!toBoss.length||!escape.length)throw Error('Forest ring boss or escape corridor disconnected');
 return{version:FOREST_RING_BUILD,difficulty,size:n,center:zonePoints.boss,entry:zonePoints.entrance,exit,zones,passages,trails,grid,gates,deadEnds,activeZones:[...active],paths:{toBoss,escape}};
}
export function forestRingAreaCount(difficulty:Difficulty){return forestRing(difficulty).activeZones.length-2;}
export function ringProgression(){return(['easy','medium','hard','extreme'] as const).map(d=>{
 const r=forestRing(d);return{difficulty:d,active:r.activeZones.filter(n=>n!=='entrance'&&n!=='boss').length,walkable:r.grid.reduce((n,row)=>n+row.filter(v=>v===0).length,0),links:r.passages.length};
});}
