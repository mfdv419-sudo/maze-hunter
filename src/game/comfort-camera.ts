import * as T from 'three';
export type CameraComfortMode='comfort'|'dynamic'|'manual';
export const CAMERA_PITCH=18*Math.PI/180;
export function clampPitch(p:number){return Number.isFinite(p)?T.MathUtils.clamp(p,-12*Math.PI/180,50*Math.PI/180):CAMERA_PITCH;}
/** One full-width touch swipe turns 180 degrees, independent of device pixels. */
export function lookDelta(dx:number,dy:number,width:number,height:number,sensitivity=1,touch=true){
 const scale=T.MathUtils.clamp(Number.isFinite(sensitivity)?sensitivity:1,.3,2);
 return {yaw:Number.isFinite(dx)?-dx*(touch?Math.PI/Math.max(320,width):.0035)*scale:0,pitch:Number.isFinite(dy)?dy*(touch?1.15/Math.max(240,height):.0025)*scale:0};
}
export function autoCenter(mode:CameraComfortMode,idle:number,speed:number,turning:boolean){return !turning&&speed>.2&&idle>(mode==='dynamic'?.7:1.3)&&mode!=='manual'?(mode==='dynamic'?1.1:.65):0;}
/** Prefer a nearby clear orbit before allowing the camera inside the avatar. Never raise pitch. */
export function clearOrbit(target:T.Vector3,offset:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3,minimum=2.1){
 const original=resolve(target,target.clone().add(offset));if(original.distanceTo(target)>=minimum)return original;
 let best=original,bestScore=original.distanceTo(target);for(const angle of[.26,-.26,.52,-.52,.79,-.79,1.05,-1.05,1.57,-1.57,2.1,-2.1,Math.PI]){
  const candidate=resolve(target,target.clone().add(offset.clone().applyAxisAngle(new T.Vector3(0,1,0),angle))),length=candidate.distanceTo(target),score=Math.min(length,minimum+1)-Math.abs(angle)*.18;
  if(score>bestScore){best=candidate;bestScore=score;}if(length>=minimum+1&&Math.abs(angle)<.8)break;
 }return best;
}
/** Choose one clear side for a whole cinematic; do not orbit through hills. */
export function sceneAzimuth(target:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3){
 let best=0,score=-Infinity;for(let i=0;i<24;i++){const angle=i*Math.PI/12;let clearance=Infinity;for(const height of[1.2,2.5,4]){const offset=new T.Vector3(Math.sin(angle)*8,height,Math.cos(angle)*8),safe=resolve(target,target.clone().add(offset));clearance=Math.min(clearance,safe.distanceTo(target)/offset.length());}if(clearance>score){score=clearance;best=angle;}}return best;
}
/** Gentle yaw follow couples screen-relative steering into a continuous arc. */
export function travelYaw(from:number,to:number,dt:number,rate=.7){const error=Math.atan2(Math.sin(to-from),Math.cos(to-from)),step=error*(1-Math.exp(-Math.max(0,dt)*rate));return from+T.MathUtils.clamp(step,-dt*.8,dt*.8);}
export function edgePan(x:number,width:number){const margin=Math.min(64,width*.1);return x>width-margin?(x-width+margin)/margin:x<margin?-(margin-x)/margin:0;}
