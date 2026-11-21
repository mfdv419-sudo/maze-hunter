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
 step(target:T.Vector3,offset:T.Vector3,resolve:(a:T.Vector3,b:T.Vector3)=>T.Vector3,_dt?:number){
  const radius=offset.length(),direction=offset.clone().normalize();this.length??=radius;
  if(this.target&&this.length<radius-.001)this.length=Math.min(radius,Math.max(.08,this.length-target.clone().sub(this.target).dot(direction)));
  if(this.length>=radius-.001)this.length=radius;
  const desired=target.clone().addScaledVector(direction,this.length),safe=resolve(target,desired);this.length=Math.min(this.length,safe.distanceTo(target));this.target=target.clone();return target.clone().addScaledVector(direction,this.length);
 }
}
export const ADVENTURE_CAMERA_RADIUS=7.2;
export const ADVENTURE_CAMERA_FOV=60;
const CAMERA_MARGIN=.28;
const EPSILON=.035;
const angleBetween=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));

export interface CameraSpace {
 resolve(from:T.Vector3,to:T.Vector3,radius?:number):T.Vector3;
 isClear(point:T.Vector3,radius?:number):boolean;
 recoverEmbedded?(eye:T.Vector3,target:T.Vector3,radius?:number):T.Vector3|null;
}
interface CameraFrame {
 mode:'follow'|'manual'|'reset';
 dt:number;
 heading?:number;
 outOfFrame?:boolean;
}

/** Adventure free view and trailing camera share only physical clearance. */
export class AdventureCamera {
 private eye?:T.Vector3;
 private target?:T.Vector3;
 private heading?:number;
 private turnWindow=0;
 private turnDirection=0;
 private waitingForRoom=false;

 reset(){
  this.eye=this.target=undefined;
  this.heading=undefined;
  this.turnWindow=0;
  this.waitingForRoom=false;
  this.turnDirection=0;
 }

 step(target:T.Vector3,offset:T.Vector3,space:CameraSpace,frame:CameraFrame):T.Vector3{
  if(this.target&&this.target.distanceToSquared(target)>20)this.reset();
  const motion=this.target?target.clone().sub(this.target):new T.Vector3();
  const oldDistance=this.eye&&this.target?this.eye.distanceTo(this.target):0;
  this.target=target.clone();
  const radius=offset.length();
  const old=this.eye;
  if(!old||!space.isClear(old,CAMERA_MARGIN)){
   // Distinguish *embedded* (invalid eye) from normal contact with a wall.
   // An embedded eye must be moved clear before rendering: otherwise the
   // wall covers the screen with flickering coplanar triangles.
   const freed=old?space.recoverEmbedded?.(old,target,CAMERA_MARGIN):null;
   let safe=freed&&space.isClear(freed,CAMERA_MARGIN)?freed:
    space.resolve(target,target.clone().add(offset),CAMERA_MARGIN);
   // Handle a spawn/traversal transition with focus inside terrain margin.
   if(!space.isClear(safe,CAMERA_MARGIN)){
    const above=space.resolve(target,target.clone().add(new T.Vector3(0,1,0)),CAMERA_MARGIN);
    if(space.isClear(above,CAMERA_MARGIN))safe=above;
    else if(old&&space.isClear(old,CAMERA_MARGIN))safe=old;
    else{
     // Do not continue normal follow from a non-clear camera pose.
     const near=space.recoverEmbedded?.(safe,target,CAMERA_MARGIN);
     if(near&&space.isClear(near,CAMERA_MARGIN))safe=near;
    }
   }
   this.waitingForRoom=safe.distanceTo(target)<radius-EPSILON;
   this.eye=safe.clone();
   return this.eye.clone();
  }

  const dt=T.MathUtils.clamp(frame.dt,0,.05);
  const relative=old.clone().sub(target);
  const distance=relative.length();
  const yaw=Math.atan2(relative.x,relative.z);
  const pitch=Math.atan2(relative.y,Math.hypot(relative.x,relative.z));
  const desiredYaw=Math.atan2(offset.x,offset.z);
  const desiredPitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));
  const place=(angle:number,elevation:number,length:number)=>{
   const horizontal=length*Math.cos(elevation);
   return new T.Vector3(target.x+Math.sin(angle)*horizontal,target.y+Math.sin(elevation)*length,target.z+Math.cos(angle)*horizontal);
  };
  const move=(destination:T.Vector3)=>{
   const safe=space.resolve(old,destination,CAMERA_MARGIN);
   return space.isClear(safe,CAMERA_MARGIN)?safe:old;
  };

  if(frame.mode!=='follow'){
   this.turnWindow=0;
   if(frame.heading!==undefined)this.heading=frame.heading;
   const turn=angleBetween(desiredYaw,yaw),tilt=desiredPitch-pitch;
   const nextYaw=yaw+T.MathUtils.clamp(turn,-dt*6,dt*6);
   const nextPitch=pitch+T.MathUtils.clamp(tilt,-dt*4,dt*4);
   const orbit=place(nextYaw,nextPitch,radius);
   const clearRadius=space.resolve(target,orbit,CAMERA_MARGIN).distanceTo(target);
   const radiusLimit=Math.min(radius,distance+(Math.abs(turn)>.001||Math.abs(tilt)>.001||frame.mode==='reset'?dt*3:0));
   const nextRadius=Math.min(radiusLimit,clearRadius);
   const wished=place(nextYaw,nextPitch,nextRadius);
   // Move along a swept path. The orbit may compress under the user's hand,
   // with bounded travel so a corner cannot snap the view inward.
   const next=old.clone().add(wished.clone().sub(old).clampLength(0,dt*13));
   this.eye=move(next);
   if(this.eye.distanceToSquared(old)<.000001&&nextRadius<distance-EPSILON){
    const inward=relative.clone().setLength(Math.max(0,distance-dt*9));
    this.eye=move(target.clone().add(inward));
   }
   this.waitingForRoom=this.eye.distanceTo(target)<radius-EPSILON;
   return this.eye.clone();
  }

  this.turnWindow=Math.max(0,this.turnWindow-dt);
  if(frame.heading!==undefined){
   if(this.heading===undefined)this.heading=frame.heading;
   else if(Math.abs(angleBetween(frame.heading,this.heading))>Math.PI/7){
    const delta=angleBetween(frame.heading,this.heading);
    this.turnDirection=Math.sign(delta);
    this.heading=frame.heading;
    this.turnWindow=1.7;
   }
  }

  const turnToClearSight=(from:T.Vector3):T.Vector3|null=>{
   // Turn follow is allowed ONLY after real player heading change, with a
   // blocked camera-to-character sight line. A stationary wall contact is not
   // a reason to spin the camera or force it behind the player.
   if(!this.turnWindow||!this.turnDirection)return null;
   if(space.resolve(target,from,.18).distanceToSquared(from)<=EPSILON**2)return null;
   const sideways=new T.Vector3(Math.cos(yaw)*this.turnDirection,0,-Math.sin(yaw)*this.turnDirection);
   const wish=from.clone().addScaledVector(sideways,dt*2.15);
   const slide=move(wish);
   return slide.distanceToSquared(from)>1e-6&&space.isClear(slide,CAMERA_MARGIN)?slide:null;
  };
  if(this.waitingForRoom){
   // The player can approach a camera held against a wall; do not compress
   // distance or recenter. If the player actually turns and becomes hidden,
   // a tiny lateral tracking move may release the view without a snap.
   if(distance<radius-EPSILON||distance<=oldDistance+.00001){
    const slide=turnToClearSight(old);
    if(slide){this.eye=slide;return slide.clone();}
    return old.clone();
   }
   this.waitingForRoom=false;
   this.eye=move(place(yaw,pitch,radius));
   return this.eye.clone();
  }

  if(motion.lengthSq()<.0000001){
   const slide=turnToClearSight(old);
   if(slide){this.eye=slide;return slide.clone();}
   return old.clone();
  }
  const translated=old.clone().add(motion);
  const follow=move(translated);
  if(follow.distanceToSquared(translated)>EPSILON**2){
   // This is a real wall contact. Keep the eye still unless the player has
   // deliberately turned AND the line of sight is being blocked. No random
   // wall-triggered side search, zoom, oscillation, or teleport behind player.
   const slide=turnToClearSight(follow);
   if(slide){this.eye=slide;this.waitingForRoom=false;return slide.clone();}
   this.waitingForRoom=true;
   this.turnWindow=0;
   this.eye=follow;
   return follow.clone();
  }

  if(this.turnWindow>0&&frame.heading!==undefined&&
    (frame.outOfFrame||space.resolve(target,follow,.18).distanceToSquared(follow)>EPSILON**2)){
   const turn=angleBetween(frame.heading+Math.PI,yaw);
   const adjusted=place(yaw+T.MathUtils.clamp(turn,-dt*.85,dt*.85),pitch,radius);
   // The turn is player-driven. If its next step touches a wall, use the
   // already clear straight follow position and leave the yaw alone.
   const turned=move(adjusted);
   if(turned.distanceToSquared(adjusted)<=EPSILON**2)this.eye=turned;
   else{this.eye=follow;this.turnWindow=0;}
   if(Math.abs(turn)<.04)this.turnWindow=0;
  }else this.eye=follow;
  return this.eye.clone();
 }
}
/** Steering while moving follows a continuous orbit; no idle recenter or scenery-driven rotation. */
export function steerOrbit(yaw:number,x:number,dt:number,manual=false){return manual?yaw:yaw-Math.max(-1,Math.min(1,x))*Math.max(0,Math.min(.05,dt))*1.05;}
