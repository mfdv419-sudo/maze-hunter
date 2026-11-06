import * as T from 'three';
export type CameraComfortMode='comfort'|'dynamic'|'manual';
export const CAMERA_PITCH=18*Math.PI/180;
export function clampPitch(p:number){return Number.isFinite(p)?T.MathUtils.clamp(p,-55*Math.PI/180,60*Math.PI/180):CAMERA_PITCH;}
/** One full-width touch swipe turns 180 degrees, independent of device pixels. */
export function lookDelta(dx:number,dy:number,width:number,height:number,sensitivity=1,touch=true){
 const scale=T.MathUtils.clamp(Number.isFinite(sensitivity)?sensitivity:1,.3,2);
 return {yaw:Number.isFinite(dx)?-dx*(touch?Math.PI/Math.max(320,width):.0035)*scale:0,pitch:Number.isFinite(dy)?dy*(touch?1.15/Math.max(240,height):.0025)*scale:0};
}
export function autoCenter(mode:CameraComfortMode,idle:number,speed:number,turning:boolean){return 0;} // Gameplay yaw is owned by player input/reset.
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

/** Fixed spherical orbit: no world-space height anchor and no alternative-side search. */
export class RadiusOrbitCamera {
 private target:T.Vector3|undefined;private length:number|undefined;
 reset(){this.target=undefined;this.length=undefined;}
 resetView(){}
 step(target:T.Vector3,offset:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3){
  const radius=offset.length(),direction=offset.clone().normalize();this.length??=radius;
  if(this.target&&this.length<radius-.001)this.length=Math.min(radius,Math.max(.08,this.length-target.clone().sub(this.target).dot(direction)));
  if(this.length>=radius-.001)this.length=radius;
  const desired=target.clone().addScaledVector(direction,this.length),safe=resolve(target,desired);this.length=Math.min(this.length,safe.distanceTo(target));this.target=target.clone();return target.clone().addScaledVector(direction,this.length);
 }
}
/** Steering while moving follows a continuous orbit; no idle recenter or scenery-driven rotation. */
export function steerOrbit(yaw:number,x:number,dt:number,manual=false){return manual?yaw:yaw-Math.max(-1,Math.min(1,x))*Math.max(0,Math.min(.05,dt))*1.05;}
