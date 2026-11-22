import type {AdventureLayout} from './adventure-layout';
import {bridgeFallZone} from './gorge-terrain';
import {courseDanger} from './platform-course';
import type {Point} from './maze';
export function safeGorgePoint(l:AdventureLayout,p:Point){return !bridgeFallZone(p.x,p.y,l)&&!courseDanger(l,'gorge',p.x,p.y);}
/** Reachability includes the continuous death volumes, not only empty maze tiles. */
export function gorgeRewardReachable(l:AdventureLayout){const start={x:l.maze.start.x+.5,y:l.maze.start.y+.5},seen=new Map<string,Point>(),queue=[start];seen.set(`${Math.floor(start.x)},${Math.floor(start.y)}`,start);
 const safe=(p:Point)=>l.maze.grid[Math.floor(p.y)]?.[Math.floor(p.x)]===0&&[[0,0],[.14,0],[-.14,0],[0,.14],[0,-.14]].every(([x,y])=>safeGorgePoint(l,{x:p.x+x,y:p.y+y}))&&!l.ledges.some(q=>Math.abs(p.x-q.point.x-.5)<(q.width||.94)/2+.1&&Math.abs(p.y-q.point.y-.5)<(q.depth||.94)/2+.1);
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx,y:p.y+dy},key=`${Math.floor(q.x)},${Math.floor(q.y)}`;if(seen.has(key)||!safe(q))continue;if(!Array.from({length:10},(_,i)=>({x:p.x+dx*(i+1)/10,y:p.y+dy*(i+1)/10})).every(safe))continue;seen.set(key,q);queue.push(q);}}
 return seen;
}
export function repairGorgeChests(l:AdventureLayout){const reachable=gorgeRewardReachable(l),reserved=[...l.seals,...l.stars,...l.vegetation,...l.chests];l.chests=l.chests.map(p=>{const current={x:p.x+.5,y:p.y+.5};if(reachable.has(`${p.x},${p.y}`)&&safeGorgePoint(l,current)&&(!l.traversal||Math.hypot(current.x-l.traversal.landing.x,current.y-l.traversal.landing.y)>2))return p;const chosen=[...reachable.values()].filter(q=>(!l.traversal||Math.hypot(q.x-l.traversal.landing.x,q.y-l.traversal.landing.y)>2)&&reserved.every(r=>Math.hypot(q.x-r.x-.5,q.y-r.y-.5)>1.1)).sort((a,b)=>Math.hypot(a.x-current.x,a.y-current.y)-Math.hypot(b.x-current.x,b.y-current.y))[0];if(!chosen)throw Error('No safe reachable chest location');const q={x:Math.floor(chosen.x),y:Math.floor(chosen.y)};reserved.push(q);return q;});}
