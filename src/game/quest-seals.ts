import {distances,type Point} from './maze';
import type {AdventureLayout} from './adventure-layout';
export interface QuestTeam {slots:number[];slot:number;shared:boolean}
/** Fixed roster produces distinct physical sites: three per participant, shared only in co-op. */
export function teamSealSites(layout:AdventureLayout,team:QuestTeam):Point[]{
 const slots=[...team.slots].sort((a,b)=>a-b),goal=slots.length*3;if(goal<=3)return layout.seals;
 const reserved=[...layout.rivers,...layout.chests,...layout.stars,...layout.ledges.map(l=>l.point),layout.maze.start,layout.maze.finish,layout.fortress];
 const reachable=distances(layout.maze.grid,layout.maze.start),pool:Point[]=[];
 for(let y=1;y<layout.maze.grid.length-1;y++)for(let x=1;x<layout.maze.grid[y].length-1;x++)if(reachable.has(`${x},${y}`)&&!reserved.some(p=>Math.hypot(p.x-x,p.y-y)<2))pool.push({x,y});
 const selected=layout.seals.map(p=>({...p}));while(selected.length<goal){let best:Point|undefined,score=-1;for(const p of pool){const d=Math.min(...selected.map(q=>Math.hypot(p.x-q.x,p.y-q.y)));if(d>score){score=d;best=p;}}if(!best||score<1)throw Error('Not enough unique quest sites');selected.push(best);}
 if(team.shared)return selected;const index=slots.indexOf(team.slot);if(index<0)throw Error('Player is outside the quest roster');return selected.slice(index*3,index*3+3);
}
