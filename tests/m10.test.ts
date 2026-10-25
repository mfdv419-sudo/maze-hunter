import {it,expect} from 'vitest';
import {retroBoard,boardRoute,neighbors} from '../src/game/retro-board';
import {fieldGuideContent} from '../src/game/field-guide';
it('audits genuine early alternatives, long deceptive branches, branch decisions and board use for all 95 hard Retro boards',()=>{
 for(let level=6;level<=100;level++){
  const b=retroBoard(level),route=boardRoute(b),solution=new Set(route.map(p=>`${p.x},${p.y}`)),L=route.length-1,decoys:{at:number;length:number;forks:number}[]=[];
  expect(neighbors(b,b.start).length).toBeGreaterThanOrEqual(2);
  let used=0;for(let y=0;y<b.size;y++)for(let x=0;x<b.size;x++)if(b.walls[y][x]!==15)used++;
  expect(used/(b.size*b.size)).toBeGreaterThanOrEqual(.9);
  for(const [at,p]of route.entries())for(const q of neighbors(b,p)){
   if(solution.has(`${q.x},${q.y}`))continue;
   const queue=[{point:q,depth:1}],seen=new Set([`${p.x},${p.y}`]);let length=0,forks=0;
   for(const item of queue){const key=`${item.point.x},${item.point.y}`;if(seen.has(key))continue;seen.add(key);length=Math.max(length,item.depth);const next=neighbors(b,item.point);if(next.length>=3)forks++;for(const nextPoint of next)if(!seen.has(`${nextPoint.x},${nextPoint.y}`))queue.push({point:nextPoint,depth:item.depth+1});}
   if(length>=Math.max(8,(L-at)*.5))decoys.push({at,length,forks});
  }
  expect(decoys.length).toBeGreaterThanOrEqual(3);
  expect(decoys.some(d=>d.at===0&&d.length>=L*.5)).toBe(true);
  expect(decoys.filter(d=>d.at<=L*.5&&d.length>=L*.5).length).toBeGreaterThanOrEqual(2);
  expect(decoys.some(d=>d.length/(L-d.at)>=.5&&d.length/(L-d.at)<=.7)).toBe(true);
  expect(decoys.some(d=>d.forks>=2)).toBe(true);
  // Every open room is reachable; each undirected edge appears twice, and E=V-1 guarantees a tree.
  const queue=[b.start],seen=new Set<string>();let degree=0;
  for(const p of queue){const key=`${p.x},${p.y}`;if(seen.has(key))continue;seen.add(key);const ns=neighbors(b,p);degree+=ns.length;queue.push(...ns.filter(q=>!seen.has(`${q.x},${q.y}`)));}
  expect(seen.size).toBe(used);expect(degree/2).toBe(used-1);
 }
},30000);
it('distinguishes real collection effects and currencies in the illustrated ID and EN handbook',()=>{for(const lang of ['id','en']as const){const html=fieldGuideContent(lang);expect(html.match(/class="guide-card"/g)).toHaveLength(8);expect(html.match(/<svg/g)).toHaveLength(8);expect(html).toContain('Adventure');expect(html).toContain('Retro');expect(html).toContain('diamond');}expect(fieldGuideContent('id')).toContain('belum tersedia');expect(fieldGuideContent('en')).toContain('currently do not unlock');});
