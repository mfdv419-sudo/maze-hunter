import type {Grid,Point} from './maze';
import {route} from './maze';
import type {ForestRing,RingPassage,RingPortal,RingZone} from './forest-ring';
import {FOREST_ARENAS,FOREST_LAYERS,FOREST_MASTER_SIZE,arenaPoint,type ForestArenaId} from './forest-world-design';
import {applyForestSiteCollision,forestExtremeWorldSites,forestNpcWorldPoint,type ForestWorldSite} from './forest-rpg';
import {pilotWaterDepth} from './forest-pilot';

export const FOREST_EXTREME_BUILD='FG-EXTREME-MAZE-10-20261106';
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
 // Authored arena mazes: every major arena has real junctions, alternate routes, loops and rewarding dead ends.
 // This deliberately avoids the old fake-zigzag pattern where a corridor bends but never offers a choice.
 for(const z of zones){
  const r=z.radius;carve(z.point,Math.max(6,r-7));
  if(['entrance','inner','boss'].includes(z.id)){carve(z.point,Math.max(6,r-6));continue;}
  const phase=(hash(z.id)%37)/17;
  const nodes=Array.from({length:7},(_,i)=>{const a=phase+i*Math.PI*2/7,dist=r*(i%2?.62:.48);return point(z.point.x+Math.sin(a)*dist,z.point.y+Math.cos(a)*dist);});
  // Three genuine choices from the arena heart.
  for(const i of [0,2,5]){const path=draw([z.point,nodes[i]],2);passages.push({id:`ext-${z.id}-choice-${i}`,from:z.id,to:z.id,kind:i===2?'stairs':i===5?'vine':'trail',optional:true,path});}
  // Braided local maze: two loops plus a cross-link so routes can reconnect.
  for(const [a,b,k] of [[0,1,'trail'],[1,2,'trail'],[2,3,'stairs'],[3,4,'trail'],[4,5,'vine'],[5,6,'trail'],[6,0,'trail'],[1,5,'trail']] as const){const path=draw([nodes[a],nodes[b]],1);passages.push({id:`ext-${z.id}-maze-${a}-${b}`,from:z.id,to:z.id,kind:k,optional:true,path});}
  // Two long convincing dead ends with rewards; choosing wrong is still worthwhile.
  for(const [i,node] of [[0,nodes[3]],[1,nodes[6]]] as const){const a=phase+1.13+i*2.27,end=point(node.x+Math.sin(a)*r*.38,node.y+Math.cos(a)*r*.38);const branch=draw([node,end],1);deadEnds.push(branch.at(-1)!);passages.push({id:`ext-${z.id}-dead-${i}`,from:z.id,to:z.id,kind:'trail',optional:true,reward:i===0?'chest':'xp',path:branch});}
  // Terrain islands split sight-lines so the whole route cannot be read from one position.
  if(z.layer==='surface')for(let i=0;i<5;i++){const a=phase+i*1.31+.4,p=point(z.point.x+Math.sin(a)*r*.42,z.point.y+Math.cos(a)*r*.42);block(p,i%3===0?2:1);}
 }
 // Long travel routes are real braided mazes, not a bent single corridor.
 const e=arenaPoint('entrance');
 const braidedConnector=(id:string,from:ForestArenaId,to:ForestArenaId,hubs:Point[])=>{
  const chain=[arenaPoint(from),...hubs,arenaPoint(to)];
  for(let i=0;i<chain.length-1;i++){
   const a=chain[i],b=chain[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   const m=point((a.x+b.x)/2,(a.y+b.y)/2),spread=5+(i%2)*2;
   const l=point(m.x+nx*spread,m.y+ny*spread),r=point(m.x-nx*spread,m.y-ny*spread);
   const lp=draw([a,l,b],2),rp=draw([a,r,b],2);
   passages.push({id:`${id}-branch-${i}-L`,from,to,kind:'trail',optional:i>0,path:lp});
   passages.push({id:`${id}-branch-${i}-R`,from,to,kind:i%2?'stairs':'trail',optional:true,path:rp});
   if(i%2===0){const cross=draw([l,point(m.x,m.y),r],1);passages.push({id:`${id}-cross-${i}`,from,to,kind:'trail',optional:true,path:cross});}
   const deadBase=i%2?l:r,dead=point(deadBase.x+nx*(i%2?4:-4),deadBase.y+ny*(i%2?4:-4));
   const dp=draw([deadBase,dead],1);deadEnds.push(dp.at(-1)!);passages.push({id:`${id}-dead-${i}`,from,to,kind:'trail',optional:true,reward:i%2?'xp':'chest',path:dp});
  }
 };
 braidedConnector('ext-entry-waterfall','entrance','waterfall',[{x:77,y:155},{x:70,y:145},{x:62,y:134},{x:55,y:123}]);
 braidedConnector('ext-entry-green','entrance','green',[{x:82,y:151},{x:73,y:132},{x:65,y:111},{x:59,y:88},{x:56,y:69}]);
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
 const rawContent=[...forestExtremeWorldSites(ids),...pockets];
 // Solid structures sit beside the maze, not on its centerline. Runtime collision handles their actual footprint.
 const routePoints=passages.flatMap(p=>p.path);
 for(const s of rawContent){if(!s.solid)continue;const original={...s.point},center=arenaPoint(s.arena),clearance=Math.max(s.solid.w,s.solid.d)*.48+1.25;let best:Point|undefined,bestScore=1e9;for(let radius=0;radius<=14;radius++)for(let deg=0;deg<360;deg+=20){const a=deg*Math.PI/180,c={x:Math.round(original.x+Math.sin(a)*radius),y:Math.round(original.y+Math.cos(a)*radius)};if(grid[c.y]?.[c.x]!==0)continue;if(Math.hypot(c.x-center.x,c.y-center.y)>FOREST_ARENAS[s.arena].radius*.82)continue;const dRoute=routePoints.reduce((m,p)=>Math.min(m,Math.hypot(c.x-p.x,c.y-p.y)),1e9);if(dRoute<clearance)continue;const score=Math.hypot(c.x-original.x,c.y-original.y);if(score<bestScore){bestScore=score;best=c;}}if(best)s.point=best;}
 // NPCs must stand on dry, reachable terrain. Relocate authored site anchors before collision is committed.
 for(const s of rawContent){if(!s.npc)continue;const original={...s.point},center=arenaPoint(s.arena);let best:Point|undefined,bestScore=1e9;for(let radius=0;radius<=16;radius++)for(let deg=0;deg<360;deg+=15){const a=deg*Math.PI/180,candidate={x:Math.round(original.x+Math.sin(a)*radius),y:Math.round(original.y+Math.cos(a)*radius)};s.point=candidate;const q=forestNpcWorldPoint(s),gx=Math.round(q.x),gy=Math.round(q.y);if(grid[gy]?.[gx]!==0||pilotWaterDepth(q.x,q.y)>.12||!route(grid,center,{x:gx,y:gy}).length)continue;const score=Math.hypot(candidate.x-original.x,candidate.y-original.y)+Math.hypot(candidate.x-center.x,candidate.y-center.y)*.02;if(score<bestScore){bestScore=score;best=candidate;}}if(!best)throw Error(`No dry reachable NPC site for ${s.id}`);s.point=best;}
 const content=applyForestSiteCollision(grid,rawContent,protectedPoints);
 const opened=grid.map(r=>[...r]);bossGate.forEach(p=>opened[p.y][p.x]=0);escapeGate.forEach(p=>opened[p.y][p.x]=0);const toBoss=route(opened,arenaPoint('inner'),arenaPoint('boss')),escape=route(opened,arenaPoint('boss'),exit);if(!toBoss.length||!escape.length)throw Error('Extreme rebuild final arc disconnected');
 return{version:FOREST_EXTREME_BUILD,difficulty:'extreme',size:n,center:arenaPoint('boss'),entry:e,exit,zones,passages,portals,trails,grid,gates:{boss:bossGate,escape:escapeGate,bridge:[],shortcut:[]},deadEnds,activeZones:ids,paths:{toBoss,escape},layers:FOREST_LAYERS,rewardPieces,content};
}
