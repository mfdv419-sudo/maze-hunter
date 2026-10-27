import {fieldPose,type FieldObstacle} from './field-obstacles';
import type {Point} from './maze';
export const ROCK_LIMIT=72;
export function fallenId(key:string){const [h,c]=key.slice(7).split('-').map(Number);return 100000+h*10000+c;}
/** Immutable landing origins survive carrying, expiry, death and RTDB serialization. */
export function settleRocks(rocks:Record<string,Point>,obstacles:FieldObstacle[],elapsed:number,easy:boolean,grid?:number[][]){
 for(const h of obstacles){if(h.kind!=='rock')continue;const period=h.period*(easy?1.5:1),land=1.6+(12-.4)/16*3,last=Math.floor((elapsed+h.phase-land)/period);
  for(let cycle=0;cycle<=Math.min(last,ROCK_LIMIT);cycle++){const key=`fallen-${h.id}-${cycle}`;if(rocks[key])continue;if(Object.keys(rocks).length>=ROCK_LIMIT)return;const p=fieldPose(h,cycle*period+land-h.phase,easy,grid).point;rocks[key]={...p};}
 }
}
