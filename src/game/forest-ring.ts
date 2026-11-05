import type {Difficulty,Grid,Point} from './maze';
import {route} from './maze';
import {FOREST_ARENAS,FOREST_LAYERS,FOREST_MASTER_SIZE,activeSurfaceArenas,arenaPoint,gatePools,type ForestArenaId,type ForestLayerId} from './forest-world-design';

export const FOREST_RING_BUILD='FG-EXTREME-MASTER-02-20261105';
export type RingZoneId=ForestArenaId;
export type RingConnector='trail'|'stairs'|'bridge'|'water'|'tunnel'|'vine'|'sky'|'portal';
export interface RingZone {id:RingZoneId;point:Point;layer:ForestLayerId;mandatory:boolean;radius:number;label:string}
export interface RingPassage {id:string;from:RingZoneId;to:RingZoneId;kind:RingConnector;optional?:boolean;reward?:'star'|'chest'|'xp'|'relic';path:Point[]}
export interface RingPortal {id:string;arena:RingZoneId;slot:'A'|'B'|'RETURN';kind:'hidden'|'mystic'|'return';point:Point;destination:RingZoneId;destinationPoint:Point;requiresBossReady?:boolean}
export interface ForestRing {
 version:string;difficulty:Difficulty;size:number;center:Point;entry:Point;exit:Point;
 zones:RingZone[];passages:RingPassage[];portals:RingPortal[];trails:Point[][];grid:Grid;
 gates:{boss:Point[];escape:Point[];bridge:Point[];shortcut:Point[]};
 deadEnds:Point[];activeZones:RingZoneId[];paths:{toBoss:Point[];escape:Point[]};layers:typeof FOREST_LAYERS;rewardPieces:{id:string;arena:RingZoneId;point:Point}[];
}
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const pick=<T>(items:T[],key:string)=>items[hash(key)%items.length];
const point=(x:number,y:number):Point=>({x:Math.round(x),y:Math.round(y)}),same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
function discrete(points:Point[]):Point[]{const out:Point[]=[];for(let i=0;i<points.length;i++){if(i===0){out.push(points[i]);continue;}const a=points[i-1],b=points[i],steps=Math.max(1,Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*3);for(let j=1;j<=steps;j++){const p=point(a.x+(b.x-a.x)*j/steps,a.y+(b.y-a.y)*j/steps);if(!same(p,out[out.length-1]))out.push(p);}}return out;}
export function forestRing(difficulty:Difficulty,mapIndex=0,variation=1):ForestRing{
 const n=FOREST_MASTER_SIZE,grid:Grid=Array.from({length:n},()=>Array(n).fill(1));
 const enabled=new Set<ForestArenaId>(['entrance','inner','boss',...activeSurfaceArenas[difficulty]]);
 if(difficulty==='hard'||difficulty==='extreme')for(const id of ['ug-flooded','ug-relic','ug-xp','ug-cross'] as ForestArenaId[])enabled.add(id);
 if(difficulty==='extreme')for(const id of ['sky-1','sky-2','sky-3'] as ForestArenaId[])enabled.add(id);
 const zones=[...enabled].map(id=>{const a=FOREST_ARENAS[id];return{id,point:arenaPoint(id),layer:a.layer,mandatory:['entrance','waterfall','green','ruins','inner','boss'].includes(id),radius:a.radius,label:a.label};});
 const trails:Point[][]=[],passages:RingPassage[]=[],deadEnds:Point[]=[];
 const carve=(p:Point,r=1)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(y>1&&x>1&&y<n-2&&x<n-2&&Math.hypot(x-p.x,y-p.y)<=r+.35)grid[y][x]=0;};
 const block=(p:Point,r=1)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(grid[y]?.[x]!==undefined)grid[y][x]=1;};
 const draw=(points:Point[],r=1)=>{const path=discrete(points);path.forEach(p=>carve(p,r));trails.push(path);return path;};
 const connect=(id:string,from:ForestArenaId,to:ForestArenaId,kind:RingConnector,via:Point[]=[],reward?:RingPassage['reward'])=>{if(!enabled.has(from)||!enabled.has(to))return;const path=draw([arenaPoint(from),...via,arenaPoint(to)],2);passages.push({id,from,to,kind,reward,path});};
 // Large playground arenas first. Internal solid islands keep exploration interesting without reducing the arena to corridors.
 for(const z of zones){carve(z.point,z.id==='boss'?z.radius:z.radius);if(!['entrance','inner','boss','ug-cross'].includes(z.id)){
  for(let i=0;i<5;i++){const a=(hash(z.id+':obstacle:'+i)%628)/100,r=z.radius*(.28+(i%3)*.09),p={x:Math.round(z.point.x+Math.sin(a)*r),y:Math.round(z.point.y+Math.cos(a)*r)};block(p,1+i%2);}
  // mini exploration branches inside each playground
  for(let i=0;i<3;i++){const a=(i*2.11+(hash(z.id)%100)/70),end={x:Math.round(z.point.x+Math.sin(a)*(z.radius+5+i*2)),y:Math.round(z.point.y+Math.cos(a)*(z.radius+5+i*2))};const p=draw([z.point,end],1);deadEnds.push(p[p.length-1]);passages.push({id:`${z.id}-explore-${i}`,from:z.id,to:z.id,kind:'trail',optional:true,reward:i===0?'star':i===1?'chest':'xp',path:p});}
 }}
 // The only physical surface routes from the start. They branch and dead-end; there is no complete circular road.
 const e=arenaPoint('entrance'),w=arenaPoint('waterfall'),g=arenaPoint('green');
 connect('entry-waterfall','entrance','waterfall','trail',[{x:72,y:154},{x:56,y:143},{x:48,y:128}]);
 connect('entry-green','entrance','green','stairs',[{x:104,y:151},{x:91,y:127},{x:78,y:96},{x:67,y:67}]);
 draw([e,{x:112,y:161},{x:129,y:156},{x:142,y:163}],1);deadEnds.push({x:142,y:163});
 draw([e,{x:72,y:168},{x:56,y:174}],1);deadEnds.push({x:56,y:174});
 // Inner gate is reachable only from its own short approach; portals reveal it later.
 draw([arenaPoint('inner'),{x:90,y:103},arenaPoint('boss')],2);
 const bossGate=Array.from({length:7},(_,i)=>({x:87+i,y:103}));for(const p of bossGate)grid[p.y][p.x]=1;
 const escapeGate=Array.from({length:7},(_,i)=>({x:87+i,y:131}));for(const p of escapeGate)grid[p.y][p.x]=1;
 // Underground is a separate cave map with multiple rooms and an XP loop.
 if(enabled.has('ug-flooded')){
  connect('ug-flooded-cross','ug-flooded','ug-cross','tunnel',[{x:226,y:60},{x:226,y:84}],'chest');
  connect('ug-cross-relic','ug-cross','ug-relic','tunnel',[{x:248,y:103},{x:266,y:80}],'relic');
  connect('ug-cross-xp','ug-cross','ug-xp','tunnel',[{x:248,y:111},{x:270,y:118}],'xp');
 }
 // Floating layer is its own map of islands; only Extreme activates it.
 if(enabled.has('sky-1')){
  connect('sky-1-2','sky-1','sky-2','bridge',[{x:230,y:235},{x:233,y:220}],'star');
  connect('sky-2-3','sky-2','sky-3','sky',[{x:260,y:208},{x:278,y:220}],'relic');
 }
 const portals:RingPortal[]=[];

 const backbone:Partial<Record<ForestArenaId,Partial<Record<'A'|'B',ForestArenaId>>>>={
  waterfall:{B:'chasm'},green:{B:'ruins'},chasm:{B:'giant'},
  ...(difficulty==='hard'||difficulty==='extreme'?{ruins:{A:'ug-relic'},'ug-relic':{A:'ug-cross'},'ug-cross':{A:'ug-xp'},'ug-xp':{A:'ug-flooded'}}:{}),
  ...(difficulty==='extreme'?{giant:{B:'sky-1'},'sky-1':{A:'sky-2'},'sky-2':{A:'sky-3'}}:{})
 };
 const gatePos=(id:ForestArenaId,slot:'A'|'B'|'RETURN')=>{const a=FOREST_ARENAS[id],p=arenaPoint(id),ang=slot==='A'?-2.2:slot==='B'?.55:2.7,dist=a.radius*.72;return point(p.x+Math.sin(ang)*dist,p.y+Math.cos(ang)*dist);};
 const destinationSpawn=(id:ForestArenaId)=>{const p=arenaPoint(id),r=FOREST_ARENAS[id].radius;return point(p.x,p.y+Math.min(5,r*.3));};
 for(const id of [...enabled]){if(['entrance','inner','boss'].includes(id))continue;const pool=gatePools[id];if(!pool)continue;for(const slot of ['A','B'] as const){let candidates=pool[slot].filter(d=>enabled.has(d));if(!candidates.length)candidates=[...enabled].filter(d=>!['entrance','boss'].includes(d)&&d!==id);const forced=backbone[id]?.[slot],destination=forced&&enabled.has(forced)?forced:pick(candidates,`${difficulty}:${mapIndex}:${variation}:${id}:${slot}`);const pointA=gatePos(id,slot);carve(pointA,2);portals.push({id:`${id}-${slot}`,arena:id,slot,kind:slot==='A'?'hidden':'mystic',point:pointA,destination,destinationPoint:destinationSpawn(destination),requiresBossReady:destination==='inner'});}
  const back=gatePos(id,'RETURN');carve(back,1);portals.push({id:`${id}-return`,arena:id,slot:'RETURN',kind:'return',point:back,destination:'entrance',destinationPoint:{x:e.x,y:e.y-3}});
 }
 const exit={x:e.x+7,y:e.y};carve(exit,2);draw([e,exit],1);
 const opened=grid.map(r=>[...r]);for(const p of bossGate)opened[p.y][p.x]=0;for(const p of escapeGate)opened[p.y][p.x]=0;
 const toBoss=route(opened,arenaPoint('inner'),arenaPoint('boss')),escape=route(opened,arenaPoint('boss'),exit);
 if(!toBoss.length||!escape.length)throw Error('Forest master boss/escape topology disconnected');
 const rewardPieces=[...enabled].flatMap(id=>{const a=FOREST_ARENAS[id];if(!a.reward)return[];const p=arenaPoint(id);return[{id:a.reward,arena:id,point:{x:p.x+Math.min(6,a.radius-3),y:p.y}}];});
 return{version:FOREST_RING_BUILD,difficulty,size:n,center:arenaPoint('boss'),entry:e,exit,zones,passages,portals,trails,grid,gates:{boss:bossGate,escape:escapeGate,bridge:[],shortcut:[]},deadEnds,activeZones:[...enabled],paths:{toBoss,escape},layers:FOREST_LAYERS,rewardPieces};
}
export function forestRingAreaCount(difficulty:Difficulty){return forestRing(difficulty).activeZones.filter(z=>!['entrance','inner','boss'].includes(z)).length;}
export function ringProgression(){return(['easy','medium','hard','extreme'] as const).map(d=>{const r=forestRing(d);return{difficulty:d,active:forestRingAreaCount(d),walkable:r.grid.reduce((n,row)=>n+row.filter(v=>v===0).length,0),links:r.passages.length,portals:r.portals.length};});}
