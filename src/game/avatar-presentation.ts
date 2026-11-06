import type {AdventureArea} from './areas';
import type {ClimbSave} from './climbing';
/** One rule for the local avatar and remote peers; appearance does not gate this tool. */
export function explorerPole(expedition:boolean,area:AdventureArea,phase:ClimbSave['phase']|undefined,swimming:boolean|undefined,hitAge:number,jump:number,carrying=false){return expedition&&area!=='sea'&&(phase??'ground')==='ground'&&!swimming&&hitAge>=.5&&jump<.015&&!carrying;}
/** Slower, wider footfall: one leg advances while the other supports the body. */
export function walkingLeg(phase:number,speed:number,index:number){const strength=Math.max(0,Math.min(1,speed)),p=phase+index*Math.PI,swing=Math.sin(p),lift=Math.max(0,Math.cos(p));return{hip:swing*.82*strength,knee:lift*lift*1.05*strength,lift:lift*.035*strength};}
/** Short wall contacts contract immediately; recovery waits, then extends at a bounded rate. */
export class CameraBoom {
 distance=0;private blockedAt=-100;private initialized=false;
 step(wanted:number,safe:number,dt:number,time:number){const limit=Math.max(0,Math.min(wanted,safe));if(!this.initialized){this.distance=limit;this.initialized=true;}
 if(limit<this.distance){this.distance=limit;this.blockedAt=time;}else if(limit<this.distance+.04&&limit<wanted-.08)this.blockedAt=time;
 if(time-this.blockedAt>.22)this.distance=Math.min(limit,this.distance+Math.max(0,dt)*1.8);
 return this.distance;
 }
 reset(){this.initialized=false;this.blockedAt=-100;}
}
