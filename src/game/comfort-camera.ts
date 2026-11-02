import * as T from 'three';
export type CameraComfortMode='comfort'|'dynamic'|'manual';
export const CAMERA_PITCH=18*Math.PI/180;
export function clampPitch(p:number){return Number.isFinite(p)?T.MathUtils.clamp(p,-55*Math.PI/180,60*Math.PI/180):CAMERA_PITCH;}
/** One full-width touch swipe turns 180 degrees, independent of device pixels. */
export function lookDelta(dx:number,dy:number,width:number,height:number,sensitivity=1,touch=true){
 const scale=T.MathUtils.clamp(Number.isFinite(sensitivity)?sensitivity:1,.3,2);
 return {yaw:Number.isFinite(dx)?-dx*(touch?Math.PI/Math.max(320,width):.0035)*scale:0,pitch:Number.isFinite(dy)?dy*(touch?1.15/Math.max(240,height):.0025)*scale:0};
}
export function autoCenter(mode:CameraComfortMode,idle:number,speed:number,turning:boolean){return !turning&&speed>.2&&idle>(mode==='dynamic'?.7:1.3)&&mode!=='manual'?(mode==='dynamic'?1.1:.65):0;}
/** Resolve only the player's requested ray. Side switching is intentionally forbidden. */
export function clearOrbit(target:T.Vector3,offset:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3,_minimum=0){return resolve(target,target.clone().add(offset));}
export function cameraOrbit(pitch:number,radius:number){const p=Math.max(0,clampPitch(pitch));return{horizontal:radius*Math.cos(p),height:radius*Math.sin(p)};}
/** Choose one clear side for a whole cinematic; do not orbit through hills. */
export function sceneAzimuth(target:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3){
 let best=0,score=-Infinity;for(let i=0;i<24;i++){const angle=i*Math.PI/12;let clearance=Infinity;for(const height of[1.2,2.5,4]){const offset=new T.Vector3(Math.sin(angle)*8,height,Math.cos(angle)*8),safe=resolve(target,target.clone().add(offset));clearance=Math.min(clearance,safe.distanceTo(target)/offset.length());}if(clearance>score){score=clearance;best=angle;}}return best;
}
/** Gentle yaw follow couples screen-relative steering into a continuous arc. */
export function travelYaw(from:number,to:number,dt:number,rate=.7){const error=Math.atan2(Math.sin(to-from),Math.cos(to-from)),step=error*(1-Math.exp(-Math.max(0,dt)*rate));return from+T.MathUtils.clamp(step,-dt*.8,dt*.8);}
export function edgePan(x:number,width:number){const margin=Math.min(64,width*.1);return x>width-margin?(x-width+margin)/margin:x<margin?-(margin-x)/margin:0;}

/** Keep collision on the requested camera ray; never search another orbit. */
export function cameraFocus(pitch:number,distance:number){return pitch<0?distance*Math.tan(-clampPitch(pitch)):.2;}

/** Persistent side selection. Probe ahead before contact; never jump to a new azimuth. */
export class StableCameraOrbit {
 private yaw:number|undefined;private side=0;private until=0;private nextProbe=0;private avoidance:number|undefined;
 reset(){this.yaw=undefined;this.side=0;this.until=0;this.nextProbe=0;this.avoidance=undefined;}
 step(target:T.Vector3,requestedYaw:number,horizontal:number,height:number,dt:number,time:number,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3){
  if(this.yaw===undefined)this.yaw=requestedYaw;
  const point=(yaw:number)=>target.clone().add(new T.Vector3(-Math.sin(yaw)*horizontal,height,-Math.cos(yaw)*horizontal));
  const wanted=Math.hypot(horizontal,height),clear=(yaw:number)=>resolve(target,point(yaw)).distanceTo(target);
  const previous=this.yaw,requested=clear(requestedYaw),current=clear(previous),threshold=wanted*.94;
  let goal=requestedYaw;
  if(requested<threshold&&time<this.nextProbe&&this.avoidance!==undefined)goal=this.avoidance;
  else if(requested<threshold){
   this.nextProbe=time+.15;
   let best=previous,bestScore=-Infinity;
   // Hold one direction for a full second. Small nearby changes cannot flip sides.
   for(const side of[-1,1]){if(this.side&&time<this.until&&side!==this.side)continue;
    for(let i=1;i<=8;i++){const angle=previous+side*i*Math.PI/16,space=clear(angle),score=Math.min(space,wanted)-i*.035;
     if(score>bestScore){bestScore=score;best=angle;}
     if(space>=threshold)break;
    }
   }
   if(clear(best)>current+.12){goal=best;const side=Math.sign(Math.atan2(Math.sin(best-previous),Math.cos(best-previous)));if(side!==this.side){this.side=side;this.until=time+1.2;}}
   else goal=previous;
   this.avoidance=goal;
  }else {this.avoidance=undefined;if(time>=this.until)this.side=0;}
  const error=Math.atan2(Math.sin(goal-previous),Math.cos(goal-previous)),limit=Math.max(0,Math.min(dt,.05))*(requested>=threshold?3.2:.85);
  let next=previous+T.MathUtils.clamp(error,-limit,limit);
  // Manual turn into a wall stops at the clear boundary instead of zooming inward.
  if(current>=wanted*.8&&clear(next)<Math.min(current,wanted*.8)){
   let lo=0,hi=1;for(let i=0;i<8;i++){const mid=(lo+hi)/2;if(clear(previous+(next-previous)*mid)>=Math.min(current,wanted*.8))lo=mid;else hi=mid;}next=previous+(next-previous)*lo;
  }
  this.yaw=next;return point(next);
 }
}
