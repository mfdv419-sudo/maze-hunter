import type {Ledge} from './climbing';
import {rockSupport,type RestingRock} from './rock-physics';
import {fieldPose,type FieldObstacle} from './field-obstacles';
import {fits,clearSegment,type Point} from './maze';
export function safeRockPoint(point:Point,grid:number[][]){if(fits(grid,point,.48))return {...point};let best:Point|undefined,d=Infinity;for(let y=Math.floor(point.y)-3;y<=Math.floor(point.y)+3;y++)for(let x=Math.floor(point.x)-3;x<=Math.floor(point.x)+3;x++){const p={x:x+.5,y:y+.5},distance=Math.hypot(p.x-point.x,p.y-point.y);if(distance<d&&fits(grid,p,.48)){best=p;d=distance;}}return best||{...point};}
export const ROCK_LIMIT=72;
export function fallenId(key:string){const [h,c]=key.slice(7).split('-').map(Number);return 100000+h*10000+c;}
/** Prefer free nearby ground. Existing rocks only stack when no safe rolling space exists. */
export function planRockRest(id:string,impact:Point,at:number,grid:number[][]|undefined,rocks:Record<string,RestingRock>,moves:Record<string,Point&{elevation?:number;holder?:string}>={},ledges:readonly Ledge[]=[],protectedPoints:(Point&{radius?:number})[]=[]):RestingRock{
 const origin=grid?safeRockPoint(impact,grid):{...impact},neighbors=Object.entries(rocks).filter(([key])=>key!==id&&!moves[key]?.holder).map(([key,p])=>moves[key]||p),allowed=(p:Point)=>!grid||fits(grid,p,.48)&&clearSegment(grid,origin,p,.48),clear=(p:Point)=>neighbors.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>.83)&&ledges.every(l=>!moves[String(l.id)]?.holder?Math.hypot(p.x-(moves[String(l.id)]?.x??l.point.x+.5),p.y-(moves[String(l.id)]?.y??l.point.y+.5))>1: true)&&protectedPoints.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>(q.radius??1.3));
 let point={...origin};if(!clear(point)){let chosen:Point|undefined;const seed=[...id].reduce((n,c)=>n+c.charCodeAt(0),0);for(const radius of[.9,1.4,1.9,2.4,3]){for(let i=0;i<16;i++){const angle=(i+seed%16)/16*Math.PI*2,p={x:origin.x+Math.sin(angle)*radius,y:origin.y+Math.cos(angle)*radius};if(allowed(p)&&clear(p)){chosen=p;break;}}if(chosen)break;}if(chosen)point=chosen;}
 return{...point,elevation:rockSupport(point,rocks,moves,id,ledges),landedAt:at,impact:origin,impactElevation:rockSupport(origin,rocks,moves,id,ledges)};
}
export function fieldRockPlan(h:FieldObstacle,cycle:number,easy:boolean,grid:number[][]|undefined,rocks:Record<string,RestingRock>,moves:Record<string,Point&{elevation?:number;holder?:string}>={},ledges:readonly Ledge[]=[],protectedPoints:(Point&{radius?:number})[]=[]){
 const period=h.period*(easy?1.5:1),key=`fallen-${h.id}-${cycle}`,existing=rocks[key],end=cycle*period+3.775-h.phase,impact=existing?.impact||fieldPose(h,end,easy,grid).point,contactHeight=existing?.impactElevation??rockSupport(impact,rocks,moves,key,ledges),landedAt=existing?.landedAt??cycle*period+1.6+Math.max(0,(12-.4-contactHeight)/16)*3-h.phase,rest=existing||planRockRest(key,impact,landedAt,grid,rocks,moves,ledges,protectedPoints);
 return{point:{...impact},elevation:contactHeight,landedAt,rest};
}
export function settleRocks(rocks:Record<string,RestingRock>,obstacles:FieldObstacle[],elapsed:number,easy:boolean,grid?:number[][],moves:Record<string,Point&{elevation?:number;holder?:string}>={},ledges:readonly Ledge[]=[],protectedPoints:(Point&{radius?:number})[]=[]){
 if(grid)for(const key of Object.keys(rocks))rocks[key]={...rocks[key],...safeRockPoint(rocks[key],grid)};
 for(const h of obstacles){if(h.kind!=='rock')continue;const period=h.period*(easy?1.5:1),last=Math.floor((elapsed+h.phase-1.6)/period);
  for(let cycle=0;cycle<=Math.min(last,ROCK_LIMIT);cycle++){const key=`fallen-${h.id}-${cycle}`;if(rocks[key])continue;if(Object.keys(rocks).length>=ROCK_LIMIT)return;const plan=fieldRockPlan(h,cycle,easy,grid,rocks,moves,ledges,protectedPoints);if(elapsed<plan.landedAt)continue;rocks[key]=plan.rest;}
 }
}
