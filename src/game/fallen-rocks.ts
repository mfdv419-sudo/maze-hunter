import type {Ledge} from './climbing';
import {rockSupport,type RestingRock} from './rock-physics';
import {fieldPose,type FieldObstacle} from './field-obstacles';
import {fits,type Point} from './maze';
export function safeRockPoint(point:Point,grid:number[][]){if(fits(grid,point,.48))return {...point};let best:Point|undefined,d=Infinity;for(let y=Math.floor(point.y)-3;y<=Math.floor(point.y)+3;y++)for(let x=Math.floor(point.x)-3;x<=Math.floor(point.x)+3;x++){const p={x:x+.5,y:y+.5},distance=Math.hypot(p.x-point.x,p.y-point.y);if(distance<d&&fits(grid,p,.48)){best=p;d=distance;}}return best||{...point};}
export const ROCK_LIMIT=72;
export function fallenId(key:string){const [h,c]=key.slice(7).split('-').map(Number);return 100000+h*10000+c;}
/** A stack catches later stones earlier; origins remain stable after pickup or recovery. */
export function fieldRockPlan(h:FieldObstacle,cycle:number,easy:boolean,grid:number[][]|undefined,rocks:Record<string,RestingRock>,moves:Record<string,Point&{elevation?:number;holder?:string}>={},ledges:readonly Ledge[]=[]){
 const period=h.period*(easy?1.5:1),key=`fallen-${h.id}-${cycle}`,existing=rocks[key],end=cycle*period+3.775-h.phase,point=existing||fieldPose(h,end,easy,grid).point,elevation=existing?.elevation??rockSupport(point,rocks,moves,key,ledges),landedAt=existing?.landedAt??cycle*period+1.6+Math.max(0,(12-.4-elevation)/16)*3-h.phase;
 return{point:{x:point.x,y:point.y},elevation,landedAt};
}
export function settleRocks(rocks:Record<string,RestingRock>,obstacles:FieldObstacle[],elapsed:number,easy:boolean,grid?:number[][],moves:Record<string,Point&{elevation?:number;holder?:string}>={},ledges:readonly Ledge[]=[]){
 if(grid)for(const key of Object.keys(rocks))rocks[key]={...rocks[key],...safeRockPoint(rocks[key],grid)};
 for(const h of obstacles){if(h.kind!=='rock')continue;const period=h.period*(easy?1.5:1),last=Math.floor((elapsed+h.phase-1.6)/period);
  for(let cycle=0;cycle<=Math.min(last,ROCK_LIMIT);cycle++){const key=`fallen-${h.id}-${cycle}`;if(rocks[key])continue;if(Object.keys(rocks).length>=ROCK_LIMIT)return;const plan=fieldRockPlan(h,cycle,easy,grid,rocks,moves,ledges);if(elapsed<plan.landedAt)continue;rocks[key]={...plan.point,elevation:plan.elevation,landedAt:plan.landedAt};}
 }
}
