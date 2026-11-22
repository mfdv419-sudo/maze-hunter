import {distances,route,type Point} from './maze';
import type {AdventureLayout} from './adventure-layout';
const cache=new Map<string,ReturnType<typeof makeEncounters>>();
function makeEncounters(layout:AdventureLayout){
 const regions=layout.seals.slice(0,3).map((anchor,quest)=>{
  const distance=distances(layout.maze.grid,anchor),pool:Point[]=[];
  for(const [key,n]of distance)if(n>=1&&n<=6){const [x,y]=key.split(',').map(Number);if(!layout.ledges.some(l=>l.point.x===x&&l.point.y===y))pool.push({x,y});}
  pool.sort((a,b)=>a.y-b.y||a.x-b.x);const chosen:Point[]=[];
  for(let i=0;i<5;i++){const candidates=pool.filter(p=>!chosen.some(q=>q.x===p.x&&q.y===p.y));const score=(p:Point)=>chosen.length?Math.min(...chosen.map(q=>Math.hypot(q.x-p.x,q.y-p.y))):-Math.hypot(p.x-anchor.x,p.y-anchor.y);candidates.sort((a,b)=>score(b)-score(a));chosen.push(candidates[0]||anchor);}
  return chosen.map((p,i)=>({quest,size:(i<3?'large':'small') as 'large'|'small',patrol:route(layout.maze.grid,p,anchor)}));
 });
 return [...regions.map(r=>r[0]),...regions.flatMap(r=>r.slice(1))];
}
/** Three regions, each with 3 large and 2 small keepers; extra team seals reuse these encounters. */
export function sealEncounters(layout:AdventureLayout){const key=JSON.stringify([layout.maze.seed,layout.seals.slice(0,3)]);if(!cache.has(key)){if(cache.size>32)cache.clear();cache.set(key,makeEncounters(layout));}return structuredClone(cache.get(key)!);}
