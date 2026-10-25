import type {Ledge} from './climbing';
import {carve, distances, route, random, type Maze, type Difficulty, type Point} from './maze';
import type {GrassKind} from './adventure-zones';
export const adventureRules={medium:{size:43,seconds:720,guards:3,bosses:1,minPath:65},hard:{size:53,seconds:1080,guards:5,bosses:2,minPath:90},extreme:{size:63,seconds:1500,guards:7,bosses:3,minPath:120}} as const;
export interface Vegetation extends Point {kind:GrassKind}
export interface AdventureLayout {forest?:{trunks:Point[];pillars:Point[];arenaRadius:number};ledges:Ledge[];secret?:Point;escapeConnector:Point[];fastRiver:Point;areas:{point:Point;zone:number}[];zoneCells:number[][];vegetation:Vegetation[];starts:Point[];fortress:Point;escapeRoutes:Point[][];maze:Maze;index:number;seals:Point[];stars:Point[];chests:Point[];rivers:Point[];grass:Point[];patrols:Point[][];bosses:Point[];solution:Point[]}
const key=(p:Point)=>`${p.x},${p.y}`;
const layoutCache=new Map<string,AdventureLayout>();
export function adventureLayout(difficulty:Difficulty,index:number,variation=1):AdventureLayout {
 index=((index%10)+10)%10;const cacheKey=`${difficulty}:${index}:${variation}`;if(layoutCache.has(cacheKey))return structuredClone(layoutCache.get(cacheKey)!);const rules=adventureRules[difficulty],baseSize=rules.size-12,rng=random(variation+index*9173);
 let maze!:Maze,solution:Point[]=[],areas:{point:Point;zone:number}[]=[];
 for(let attempt=0;attempt<200;attempt++) {
  const seed=8053+index*7919+attempt*104729,grid=carve(baseSize,baseSize,seed),start={x:1,y:1};
  // Sparse loops add alternative routes without turning the maze into open space.
  let opened=0;
  for(let y=2;y<grid.length-2;y++)for(let x=2;x<grid.length-2;x++) {
   if(!grid[y][x]||(x+y+index)%17||opened>=baseSize/3)continue;
   const horizontal=!grid[y][x-1]&&!grid[y][x+1]&&grid[y-1][x]&&grid[y+1][x];
   const vertical=!grid[y-1][x]&&!grid[y+1][x]&&grid[y][x-1]&&grid[y][x+1];
   if(horizontal||vertical){grid[y][x]=0;opened++;}
  }
  const ds=distances(grid,start);let finish=start,best=0;
  for(const [k,d] of ds)if(d>best){const [x,y]=k.split(',').map(Number);finish={x,y};best=d;}
  if(best<rules.minPath+30)continue;
  const initial=route(grid,start,finish);
  areas=Array.from({length:7},(_,zone)=>({point:initial[Math.floor((initial.length-1)*[.03,.19,.35,.5,.65,.82,.98][zone])],zone}));
  // Deliberately sized clearings, linked by exploratory paths. Keep the border closed.
  for(const area of areas){const radius=area.zone===5?3:area.zone===2||area.zone===3?2:1;
   for(let y=area.point.y-radius;y<=area.point.y+radius;y++)for(let x=area.point.x-radius;x<=area.point.x+radius;x++)if(x>0&&y>0&&x<baseSize-1&&y<baseSize-1)grid[y][x]=0;
  }
  if(route(grid,start,finish).length<=rules.minPath+8)continue;
  maze={grid,start,finish,entrances:[start],seed};solution=route(grid,start,finish);break;
 }
 if(!maze)throw Error('Adventure layout validation failed');
 // A dedicated three-route escape garden. Its straight route crosses water;
 // the lower route is safe, while the upper treasure route needs a key.
 const old=maze.grid,oldN=old.length,fort=areas[5].point;
 const expanded=Array.from({length:oldN+12},(_,y)=>Array.from({length:oldN+12},(_,x)=>old[y]?.[x]??1));
 const cy=Math.max(3,fort.y),entry={x:oldN+1,y:cy},exit={x:oldN+10,y:cy};
 const carveLine=(a:Point,b:Point)=>{let p={...a};expanded[p.y][p.x]=0;while(p.x!==b.x||p.y!==b.y){if(p.x!==b.x)p.x+=Math.sign(b.x-p.x);else p.y+=Math.sign(b.y-p.y);expanded[p.y][p.x]=0;}};
 for(const offset of [0,3,-2]){carveLine(entry,{x:entry.x,y:cy+offset});carveLine({x:entry.x,y:cy+offset},{x:exit.x,y:cy+offset});carveLine({x:exit.x,y:cy+offset},exit);}
 const secret={x:oldN+6,y:cy-2};expanded[secret.y][secret.x]=1;
 // An ordinary reachable approach exists; King defeat also opens a direct root passage.
 const fd0=distances(old,fort);let edge={x:oldN-2,y:1},bestEdge=Infinity;for(let y=1;y<oldN-1;y++){const d=fd0.get(`${oldN-2},${y}`);if(d!==undefined&&d<bestEdge){bestEdge=d;edge={x:oldN-2,y};}}
 carveLine(edge,{x:entry.x,y:edge.y});carveLine({x:entry.x,y:edge.y},entry);
 const escapeConnector:Point[]=[];for(let x=fort.x;x<=entry.x;x++)escapeConnector.push({x,y:fort.y});for(let y=Math.min(fort.y,cy);y<=Math.max(fort.y,cy);y++)escapeConnector.push({x:entry.x,y});
 const fastRiver={x:oldN+5,y:cy};
 maze={...maze,grid:expanded,finish:exit};areas[6]={point:entry,zone:6};solution=[...route(expanded,maze.start,fort),...route(expanded,fort,exit).slice(1)];
 const {grid,start,finish}=maze,ds=distances(grid,start),df=distances(grid,finish);
 const open:Point[]=[],ends:Point[]=[],grass:Point[]=[];
 for(let y=1;y<grid.length-1;y++)for(let x=1;x<grid.length-1;x++) {
  const p={x,y};
  if(!grid[y][x]) {
   if((ds.get(key(p))||0)<12||(df.get(key(p))||0)<8)continue;
   open.push(p);const degree=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>grid[y+b][x+a]===0).length;
   if(degree===1)ends.push(p);
  }else if((x+y)%7===index%7&&grass.length<8) {
   if((!grid[y][x-1]&&!grid[y][x+1])||(!grid[y-1][x]&&!grid[y+1][x]))grass.push(p);
  }
 }
 const pool=[...ends,...open.filter((_,i)=>i%7===0)];
 const used=new Set<string>();
 function pick(count:number,source=pool) {
  const out:Point[]=[];
  const shuffled=[...source].sort((a,b)=>((a.x*71+a.y*131+variation*43)%997)-((b.x*71+b.y*131+variation*43)%997));
  for(let i=0;i<count;i++) {
   let best:Point|undefined,score=-1;
   for(const p of shuffled) {
    if(used.has(key(p)))continue;
    const spread=out.length?Math.min(...out.map(q=>Math.hypot(p.x-q.x,p.y-q.y))):rng()*10;
    if(spread>score){score=spread;best=p;}
   }
   if(best){out.push(best);used.add(key(best));}
  }return out;
 }
 const seals=pick(3),stars=pick(9),chests=pick(3);
 const riverCandidates=solution.filter((p,i)=>i>15&&i<solution.length-20&&(p.x%2===0||p.y%2===0)&&!used.has(key(p)));
 const rivers=riverCandidates.length?[riverCandidates[Math.floor(riverCandidates.length*.45)],fastRiver]:[fastRiver];
 for(const p of rivers)used.add(key(p));
 const guardStarts=pick(rules.guards,open.filter(p=>!rivers.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<3)));
 const patrols=guardStarts.map(p=>{
  const nearby=distances(grid,p);let target=p;
  for(const [k,d] of nearby)if(d>=5&&d<=8){const [x,y]=k.split(',').map(Number);target={x,y};}
  return route(grid,p,target);
 });
 const fortress=areas[5].point;
 const bosses:Point[]=[fortress];
 // One main King. Additional elite guardians protect fortress approaches.
 for(let i=1;i<rules.bosses;i++)patrols.push([solution[Math.floor(solution.length*(.63+i*.04))]]);
 // Connected regions grow from their actual landmark, rather than progress bands.
 const zoneDistance=new Map<string,{zone:number;distance:number}>(),zoneQueue:{point:Point;zone:number;distance:number}[]=[];
 zoneDistance.set(key(start),{zone:0,distance:0});zoneQueue.push({point:start,zone:0,distance:0});
 for(const a of areas){zoneDistance.set(key(a.point),{zone:a.zone,distance:0});zoneQueue.push({point:a.point,zone:a.zone,distance:0});}
 for(let i=0;i<zoneQueue.length;i++){const q=zoneQueue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:q.point.x+dx,y:q.point.y+dy},k=key(p);if(grid[p.y]?.[p.x]!==0||zoneDistance.has(k))continue;zoneDistance.set(k,{zone:q.zone,distance:q.distance+1});zoneQueue.push({point:p,zone:q.zone,distance:q.distance+1});}}
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>{const known=zoneDistance.get(`${x},${y}`);if(known)return known.zone;let closest=0,best=Infinity;areas.forEach((a,i)=>{const distance=Math.hypot(a.point.x-x,a.point.y-y);if(distance<best){best=distance;closest=i;}});return closest;}));
 const vegetation:Vegetation[]=pick(24,open.filter(p=>!rivers.some(q=>key(q)===key(p))&&Math.hypot(p.x-fortress.x,p.y-fortress.y)>5)).map((p,i)=>({...p,kind:i%8===0?'rare':i%7===0?'danger':i%3===0?'normal':'tall'}));
 // Starts are chosen by route cost to the shared fortress, with spatial separation.
 const fd=distances(grid,fortress),target=fd.get(key(start))||40;
 const starts:Point[]=[start];
 const candidates=[...open].filter(p=>Math.abs((fd.get(key(p))||0)-target)<Math.max(8,target*.15));
 if(candidates.length<12)candidates.push(...[...open].sort((a,b)=>Math.abs((fd.get(key(a))||0)-target)-Math.abs((fd.get(key(b))||0)-target)).slice(0,30));
 while(starts.length<({medium:4,hard:8,extreme:10}[difficulty])){let best:Point|undefined,score=0;for(const p of candidates){const d=Math.min(...starts.map(q=>Math.hypot(q.x-p.x,q.y-p.y)));if(d>score){score=d;best=p;}}if(!best||score<1)break;starts.push(best);}
 // Escape route lengths are measured after the direct root passage opens.
 const escapeGrid=grid.map(r=>[...r]);escapeConnector.forEach(p=>escapeGrid[p.y][p.x]=0);
 escapeGrid[fastRiver.y][fastRiver.x]=1;const safe=route(escapeGrid,fortress,finish);
 escapeGrid[fastRiver.y][fastRiver.x]=0;const fast=route(escapeGrid,fortress,finish);
 grass.push(secret);chests.push({x:oldN+8,y:cy-2});
 const ledges:Ledge[]=[];
 for(const area of areas.filter(a=>[0,3,4].includes(a.zone))){const choices=[{x:area.point.x+1,y:area.point.y+1},{x:area.point.x-1,y:area.point.y+1},{x:area.point.x+1,y:area.point.y-1},{x:area.point.x,y:area.point.y}];const point=choices.find(p=>grid[p.y]?.[p.x]===0&&!used.has(key(p))&&Math.hypot(p.x-start.x,p.y-start.y)>1&&!grass.some(q=>key(q)===key(p)));if(point){ledges.push({id:ledges.length,point,height:1.15});used.add(key(point));}}
 const result={ledges,maze,index,seals,stars,chests,rivers,grass,patrols,bosses,solution,areas,zoneCells,vegetation,starts,fortress,escapeRoutes:[safe,fast],secret,escapeConnector,fastRiver};if(layoutCache.size>40)layoutCache.clear();layoutCache.set(cacheKey,structuredClone(result));return result;
}
export function nextMap(difficulty:Difficulty) {
 const k=`mh-adventure-map:${difficulty}`;let previous=-1;
 try{previous=Number(localStorage.getItem(k)??-1);}catch{}
 const index=previous<0?Math.floor(Math.random()*10):(previous+1+Math.floor(Math.random()*9))%10;
 try{localStorage.setItem(k,String(index));}catch{}return index;
}
