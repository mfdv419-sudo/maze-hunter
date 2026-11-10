import type {AdventureLayout} from './adventure-layout';
import type {AdventureArea} from './areas';
import {platformCourse} from './platform-course';
import type {Point} from './maze';
export interface RoadStrip {from:Point;to:Point;index:number}
/** Biome corridors are carved in 3-cell blocks: their middle is +1.5, never the BFS edge. */
export function abandonedRoad(l:AdventureLayout,area:AdventureArea):RoadStrip[]{
 if(area==='classic'||area==='sea')return[];
 const centers:Point[]=[];for(const p of l.solution){const q={x:Math.floor(p.x/3)*3+1.5,y:Math.floor(p.y/3)*3+1.5};if(centers.at(-1)?.x!==q.x||centers.at(-1)?.y!==q.y)centers.push(q);}
 const c=platformCourse(l,area),out:RoadStrip[]=[];
 const clear=(p:Point)=>{for(let y=Math.floor(p.y)-1;y<=Math.floor(p.y)+1;y++)for(let x=Math.floor(p.x)-1;x<=Math.floor(p.x)+1;x++)if(l.maze.grid[y]?.[x]!==0)return false;return true;};
 for(let i=3;i<centers.length-3;i++){
  // Interrupted stretches prevent road paint from revealing the complete maze solution.
  if(Math.floor(i/9)%3===1)continue;const a=centers[i-1],b=centers[i];if(!clear(a)||!clear(b)||Math.abs(a.x-b.x)+Math.abs(a.y-b.y)!==3)continue;
  if(c&&Math.min(a.x,b.x)<c.x+4&&Math.max(a.x,b.x)>c.x-4&&Math.min(a.y,b.y)<c.y+3&&Math.max(a.y,b.y)>c.y-3)continue;
  out.push({from:a,to:b,index:i});
 }return out;
}
