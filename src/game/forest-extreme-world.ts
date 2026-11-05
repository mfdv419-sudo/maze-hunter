import type {Grid,Point} from './maze';
import {route} from './maze';
import type {ForestRing,RingPassage,RingPortal,RingZone} from './forest-ring';
import {FOREST_ARENAS,FOREST_LAYERS,FOREST_MASTER_SIZE,arenaPoint,type ForestArenaId} from './forest-world-design';
import {applyForestSiteCollision,forestExtremeWorldSites,type ForestWorldSite} from './forest-rpg';

export const FOREST_EXTREME_BUILD='FG-EXTREME-REBUILD-04-20261105';
const point=(x:number,y:number):Point=>({x:Math.round(x),y:Math.round(y)});
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
const discrete=(pts:Point[])=>{const out:Point[]=[];for(let i=0;i<pts.length;i++){if(!i){out.push(pts[i]);continue;}const a=pts[i-1],b=pts[i],steps=Math.max(1,Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*3);for(let j=1;j<=steps;j++){const p=point(a.x+(b.x-a.x)*j/steps,a.y+(b.y-a.y)*j/steps);if(!same(p,out[out.length-1]))out.push(p);}}return out;};
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const pick=<T>(a:T[],k:string)=>a[hash(k)%a.length];

/** Extreme is deliberately independent from Easy/Medium/Hard. It is a new world baseline, not a larger Medium map. */
export function forestExtremeRing(mapIndex=0,variation=1):ForestRing{
 const n=FOREST_MASTER_SIZE,grid:Grid=Array.from({length:n},()=>Array(n).fill(1));
 const ids:ForestArenaId[]=['entrance','waterfall','green','ruins','chasm','giant','inner','boss','ug-flooded','ug-relic','ug-xp','ug-cross','sky-1','sky-2','sky-3'];
 const zones:RingZone[]=ids.map(id=>{const a=FOREST_ARENAS[id];return{id,point:arenaPoint(id),layer:a.layer,mandatory:['entrance','waterfall','green','ruins','inner','boss'].includes(id),radius:a.radius+(a.layer==='surface'&&!['entrance','inner','boss'].includes(id)?0:1),label:a.label};});
 const trails:Point[][]=[],passages:RingPassage[]=[],deadEnds:Point[]=[];
 const carve=(p:Point,r=1)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(y>1&&x>1&&y<n-2&&x<n-2&&Math.hypot(x-p.x,y-p.y)<=r+.35)grid[y][x]=0;};
 const block=(p:Point,r=1)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(grid[y]?.[x]!==undefined)grid[y][x]=1;};
 const draw=(pts:Point[],r=1)=>{const path=discrete(pts);path.forEach(p=>carve(p,r));trails.push(path);return path;};
 const connect=(id:string,from:ForestArenaId,to:ForestArenaId,kind:RingPassage['kind'],via:Point[]=[],reward?:RingPassage['reward'])=>{const path=draw([arenaPoint(from),...via,arenaPoint(to)],2);passages.push({id,from,to,kind,reward,path});};
 // Irregular playgrounds: several overlapping clearings, vertical pockets and internal branches. No arena is just a circular floor.
 for(const z of zones){const r=z.radius;carve(z.point,Math.max(7,r-5));for(let i=0;i<5;i++){const a=i*1.256+(hash(z.id)%29)/17,dist=r*(.48+(i%2)*.16),p=point(z.point.x+Math.sin(a)*dist,z.point.y+Math.cos(a)*dist);carve(p,Math.max(4,Math.round(r*.36)));draw([z.point,p],2);}if(!['entrance','inner','boss'].includes(z.id)){for(let i=0;i<4;i++){const a=i*1.71+(hash(z.id+'branch')%31)/13,end=point(z.point.x+Math.sin(a)*(r*.66+i*1.2),z.point.y+Math.cos(a)*(r*.66+i*1.2));const branch=draw([z.point,end],1);deadEnds.push(branch.at(-1)!);passages.push({id:`ext-${z.id}-branch-${i}`,from:z.id,to:z.id,kind:i===1?'stairs':i===2?'vine':'trail',optional:true,reward:i===0?'chest':i===1?'star':'xp',path:branch});}}
  // solid terrain masses inside the larger spaces; leave broad playable lanes around them.
  if(z.layer==='surface'&&!['entrance','inner','boss'].includes(z.id))for(let i=0;i<4;i++){const a=i*1.57+.4,p=point(z.point.x+Math.sin(a)*r*.52,z.point.y+Math.cos(a)*r*.52);block(p,i%2?2:1);}
 }
 // ONLY two physical routes leave Entry. Every other arena transition is discovered via portals/shortcuts.
 const e=arenaPoint('entrance');
 connect('ext-entry-waterfall','entrance','waterfall','trail',[{x:76,y:159},{x:64,y:139},{x:53,y:121}],undefined);
 connect('ext-entry-green','entrance','green','stairs',[{x:78,y:153},{x:67,y:127},{x:58,y:96},{x:55,y:67}],undefined);
 // meaningful wrong turns around Entry
 for(const [i,p] of [{x:132,y:164},{x:53,y:174},{x:112,y:175}].entries()){const path=draw([e,p],1);deadEnds.push(path.at(-1)!);passages.push({id:`entry-pocket-${i}`,from:'entrance',to:'entrance',kind:'trail',optional:true,reward:i===0?'chest':'xp',path});}
 // Underground and Floating are physically separate layer maps, not surface extensions.
 connect('ext-ug-flooded-cross','ug-flooded','ug-cross','tunnel',[{x:226,y:60},{x:226,y:84}],'chest');
 connect('ext-ug-cross-relic','ug-cross','ug-relic','tunnel',[{x:246,y:101},{x:264,y:82}],'relic');
 connect('ext-ug-cross-xp','ug-cross','ug-xp','tunnel',[{x:245,y:112},{x:270,y:118}],'xp');
 connect('ext-sky-1-2','sky-1','sky-2','sky',[{x:228,y:242},{x:231,y:224}],'star');
 connect('ext-sky-2-3','sky-2','sky-3','sky',[{x:260,y:209},{x:278,y:220}],'relic');
 // Inner/Boss approach is isolated and locked until progression allows it.
 draw([arenaPoint('inner'),{x:90,y:103},arenaPoint('boss')],2);
 draw([arenaPoint('inner'),{x:90,y:140},e],2);
 const bossGate=Array.from({length:9},(_,i)=>({x:86+i,y:103})),escapeGate=Array.from({length:9},(_,i)=>({x:86+i,y:132}));bossGate.forEach(p=>grid[p.y][p.x]=1);escapeGate.forEach(p=>grid[p.y][p.x]=1);
 const pools:Record<string,{A:ForestArenaId[];B:ForestArenaId[]}>= {
  waterfall:{A:['ug-flooded','ruins'],B:['chasm']},green:{A:['chasm','giant'],B:['ruins','sky-1']},ruins:{A:['ug-relic','inner'],B:['giant','waterfall']},chasm:{A:['ug-xp','ug-cross'],B:['giant','inner']},giant:{A:['inner','ruins'],B:['sky-1','sky-2']},
  'ug-flooded':{A:['ug-cross','ug-relic'],B:['waterfall','ruins']},'ug-relic':{A:['ug-cross','ug-xp'],B:['ruins','waterfall']},'ug-xp':{A:['ug-cross','ug-relic'],B:['chasm','giant']},'ug-cross':{A:['ug-flooded','ug-xp'],B:['waterfall','chasm']},
  'sky-1':{A:['sky-2'],B:['green','giant']},'sky-2':{A:['sky-3'],B:['giant','green']},'sky-3':{A:['sky-1'],B:['inner','giant']}
 };
 const forced:Partial<Record<ForestArenaId,Partial<Record<'A'|'B',ForestArenaId>>>>={waterfall:{B:'chasm'},green:{B:'ruins'},ruins:{A:'ug-relic'},chasm:{B:'giant'},giant:{B:'sky-1'},'ug-relic':{A:'ug-cross'},'ug-cross':{A:'ug-xp'},'ug-xp':{A:'ug-flooded'},'sky-1':{A:'sky-2'},'sky-2':{A:'sky-3'},'sky-3':{B:'inner'}};
 const gatePos=(id:ForestArenaId,slot:'A'|'B'|'RETURN')=>{const a=FOREST_ARENAS[id],p=arenaPoint(id),ang=slot==='A'?-2.25:slot==='B'?.62:2.78,dist=(a.radius+3)*.78;return point(p.x+Math.sin(ang)*dist,p.y+Math.cos(ang)*dist);};
 const spawn=(id:ForestArenaId)=>point(arenaPoint(id).x,arenaPoint(id).y+Math.min(7,FOREST_ARENAS[id].radius*.36));
 const portals:RingPortal[]=[];
 for(const id of ids.filter(id=>!['entrance','inner','boss'].includes(id))){const pool=pools[id];if(!pool)continue;for(const slot of ['A','B'] as const){const destination=forced[id]?.[slot]??pick(pool[slot],`ext:${mapIndex}:${variation}:${id}:${slot}`),p=gatePos(id,slot);carve(p,2);portals.push({id:`ext-${id}-${slot}`,arena:id,slot,kind:slot==='A'?'hidden':'mystic',point:p,destination,destinationPoint:spawn(destination),requiresBossReady:destination==='inner'});}const back=gatePos(id,'RETURN');carve(back,2);portals.push({id:`ext-${id}-return`,arena:id,slot:'RETURN',kind:'return',point:back,destination:'entrance',destinationPoint:{x:e.x,y:e.y-4}});}
 const exit={x:e.x+8,y:e.y};carve(exit,2);draw([e,exit],1);
 const rewardPieces=ids.flatMap(id=>{const a=FOREST_ARENAS[id];if(!a.reward)return[];const p=arenaPoint(id);return[{id:a.reward,arena:id,point:{x:p.x+Math.min(8,a.radius-3),y:p.y-2}}];});
 const protectedPoints=[e,exit,...zones.map(z=>z.point),...portals.flatMap(p=>[p.point,p.destinationPoint]),...rewardPieces.map(r=>r.point)];
 const routeRewards=['forest-berry','crystal-shard','ancient-coin','dragon-treat'] as const;
 const pockets:ForestWorldSite[]=deadEnds.slice(0,14).map((p,i)=>({id:`ext-route-pocket-${i}`,arena:zones.filter(z=>!['entrance','inner','boss'].includes(z.id)).sort((a,b)=>Math.hypot(a.point.x-p.x,a.point.y-p.y)-Math.hypot(b.point.x-p.x,b.point.y-p.y))[0]?.id||'waterfall',kind:i%4===0?'activity':'gather',point:{...p},label:i%4===0?['Tantangan Jalur','Trail Challenge']:['Cache Tersembunyi','Hidden Cache'],reward:routeRewards[i%routeRewards.length],xp:12+i}));
 const content=applyForestSiteCollision(grid,[...forestExtremeWorldSites(ids),...pockets],protectedPoints);
 const opened=grid.map(r=>[...r]);bossGate.forEach(p=>opened[p.y][p.x]=0);escapeGate.forEach(p=>opened[p.y][p.x]=0);const toBoss=route(opened,arenaPoint('inner'),arenaPoint('boss')),escape=route(opened,arenaPoint('boss'),exit);if(!toBoss.length||!escape.length)throw Error('Extreme rebuild final arc disconnected');
 return{version:FOREST_EXTREME_BUILD,difficulty:'extreme',size:n,center:arenaPoint('boss'),entry:e,exit,zones,passages,portals,trails,grid,gates:{boss:bossGate,escape:escapeGate,bridge:[],shortcut:[]},deadEnds,activeZones:ids,paths:{toBoss,escape},layers:FOREST_LAYERS,rewardPieces,content};
}
