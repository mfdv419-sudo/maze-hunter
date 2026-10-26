import {distances,type Point} from './maze';
import type {AdventureLayout} from './adventure-layout';
export interface QuestTeam {slots:number[];slot:number;shared:boolean}
const cache=new Map<string,Point[]>();
/** Fixed roster produces distinct physical sites: three per participant, shared only in co-op. */
export function teamSealSites(layout:AdventureLayout,team:QuestTeam):Point[]{
 const slots=[...team.slots].sort((a,b)=>a-b),goal=slots.length*3;if(goal<=3)return layout.seals;
 const key=JSON.stringify([layout.maze.seed,slots,layout.seals]);let selected=cache.get(key);if(!selected){
 const reserved=[...layout.rivers,...layout.chests,...layout.stars,...layout.ledges.map(l=>l.point),layout.maze.start,layout.maze.finish,layout.fortress];
 const reachable=distances(layout.maze.grid,layout.maze.start),pool:Point[]=[];
 for(let y=1;y<layout.maze.grid.length-1;y++)for(let x=1;x<layout.maze.grid[y].length-1;x++)if(reachable.has(`${x},${y}`)&&!reserved.some(p=>Math.hypot(p.x-x,p.y-y)<2))pool.push({x,y});
 selected=layout.seals.map(p=>({...p}));while(selected.length<goal){let best:Point|undefined,score=-Infinity;for(const p of pool){const anchor=layout.seals[selected.length%3],d=Math.min(...selected.map(q=>Math.hypot(p.x-q.x,p.y-q.y)))*2-Math.hypot(p.x-anchor.x,p.y-anchor.y)*.65;if(d>score){score=d;best=p;}}if(!best||selected.some(p=>p.x===best!.x&&p.y===best!.y))throw Error('Not enough unique quest sites');selected.push(best);}
 if(cache.size>32)cache.clear();cache.set(key,selected);}
 if(team.shared)return structuredClone(selected);const index=slots.indexOf(team.slot);if(index<0)throw Error('Player is outside the quest roster');return selected.slice(index*3,index*3+3);
}
