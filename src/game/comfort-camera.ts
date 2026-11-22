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
 private turnAge=0;
 private turnSide=0;
 private turnTravel=0;
 private heldAtWall=false;

 reset(){this.eye=undefined;this.target=undefined;this.heading=undefined;this.turnAge=0;this.turnSide=0;this.turnTravel=0;this.heldAtWall=false;}

 step(target:T.Vector3,offset:T.Vector3,space:CameraSpace,frame:CameraFrame):T.Vector3{
  if(this.target&&this.target.distanceToSquared(target)>20)this.reset();
  const oldTarget=this.target?.clone();
  const movement=oldTarget?target.clone().sub(oldTarget):new T.Vector3();
  this.target=target.clone();
  const radius=offset.length();
  const dt=T.MathUtils.clamp(frame.dt,0,.05);
  const clear=(p:T.Vector3)=>space.isClear(p,CAMERA_MARGIN);
  const safeMove=(from:T.Vector3,to:T.Vector3)=>{
   const safe=space.resolve(from,to,CAMERA_MARGIN);
   return clear(safe)?safe:from.clone();
  };
  const place=(angle:number,elevation:number,d:number)=>new T.Vector3(
   target.x+Math.sin(angle)*Math.cos(elevation)*d,
   target.y+Math.sin(elevation)*d,
   target.z+Math.cos(angle)*Math.cos(elevation)*d);

  if(!this.eye){
   this.eye=space.resolve(target,target.clone().add(offset),CAMERA_MARGIN);
   this.heldAtWall=this.eye.distanceTo(target)<radius-EPSILON;
   if(frame.heading!==undefined)this.heading=frame.heading;
   return this.eye.clone();
  }
  // Only a truly embedded camera is recovered; touching a wall is not a
  // trigger to orbit/zoom. Recover deterministically, never oscillate sides.
  if(!clear(this.eye)){
   const recovered=space.recoverEmbedded?.(this.eye,target,CAMERA_MARGIN);
   if(recovered&&clear(recovered))this.eye.copy(recovered);
   else {
    const fallback=space.resolve(target,target.clone().add(offset),CAMERA_MARGIN);
    if(clear(fallback))this.eye.copy(fallback);
   }
   this.heldAtWall=true;
   return this.eye.clone();
  }
  const old=this.eye.clone();
  const rel=old.clone().sub(target),distance=rel.length();
  const yaw=Math.atan2(rel.x,rel.z),pitch=Math.atan2(rel.y,Math.hypot(rel.x,rel.z));

  if(frame.mode!=='follow'){
   this.turnAge=0;this.turnTravel=0;this.turnSide=0;
   if(frame.heading!==undefined)this.heading=frame.heading;
   // Free view is a deliberate orbit: only the wall/ground clips its radius.
   // There is no elastic spring or automatic zoom-out on finger release.
   const desiredYaw=Math.atan2(offset.x,offset.z);
   const desiredPitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));
   const turn=angleBetween(desiredYaw,yaw),tilt=desiredPitch-pitch;
   const nextYaw=yaw+T.MathUtils.clamp(turn,-dt*5,dt*5);
   const nextPitch=pitch+T.MathUtils.clamp(tilt,-dt*4,dt*4);
   const clearDistance=space.resolve(target,place(nextYaw,nextPitch,radius),CAMERA_MARGIN).distanceTo(target);
   const canGrow=Math.abs(turn)>.001||Math.abs(tilt)>.001||frame.mode==='reset';
   const nextDistance=Math.min(radius,clearDistance,distance+(canGrow?dt*4:0));
   const wished=place(nextYaw,nextPitch,nextDistance);
   const step=wished.clone().sub(old).clampLength(0,dt*13);
   this.eye.copy(safeMove(old,old.clone().add(step)));
   // When orbiting into a barrier, permit moving closer to the avatar on the
   // current ray; only the player's requested view has this permission.
   if(this.eye.distanceToSquared(old)<1e-8&&clearDistance<distance-EPSILON){
    const inward=place(yaw,pitch,Math.max(0,distance-dt*9));
    this.eye.copy(safeMove(old,inward));
   }
   this.heldAtWall=this.eye.distanceTo(target)<radius-EPSILON;
   return this.eye.clone();
  }

  // A stable turn intent is owned by the actual player's heading, never by
  // collision ray noise. Hold one chosen direction through a whole corner.
  this.turnAge=Math.max(0,this.turnAge-dt);
  if(frame.heading!==undefined&&Number.isFinite(frame.heading)){
   if(this.heading===undefined)this.heading=frame.heading;
   else{
    const change=angleBetween(frame.heading,this.heading);
    if(Math.abs(change)>.018){
     this.heading=frame.heading;
     if(this.turnAge<=0){this.turnSide=Math.sign(change);this.turnTravel=0;}
     if(Math.sign(change)===this.turnSide)this.turnTravel=Math.min(Math.PI,this.turnTravel+Math.abs(change));
     // Reverse joystick motion starts a new turn only after a substantial
     // deliberate reversal, never on 1-frame camera-relative noise.
     else if(Math.abs(change)>.55){this.turnSide=Math.sign(change);this.turnTravel=Math.abs(change);}
     this.turnAge=.95;
    }
   }
  }
  if(this.turnAge<=0){this.turnSide=0;this.turnTravel=0;}

  // Physical translation first. When the camera hits an obstacle the avatar
  // can approach it. This is NOT an instruction to shrink the camera radius.
  let next=old.clone();
  let contact=false;
  if(movement.lengthSq()>1e-10){
   const delta=movement.clone().clampLength(0,dt*12);
   const intended=old.clone().add(delta);
   const swept=safeMove(old,intended);
   contact=swept.distanceToSquared(intended)>EPSILON*EPSILON;
   if(!this.heldAtWall||distance>=radius-EPSILON){
    next=swept;
   }else if(distance>radius-EPSILON&&distance>=old.distanceTo(oldTarget??target)-EPSILON){
    next=swept;
   }
   if(contact&&next.distanceToSquared(old)<1e-8){
    // Stable wall tangent: resolve X and Z independently, favor whichever
    // moves farther toward the real player translation. No side alternation.
    const x=safeMove(old,old.clone().add(new T.Vector3(delta.x,0,0)));
    const z=safeMove(old,old.clone().add(new T.Vector3(0,0,delta.z)));
    const choices=[x,z].filter(p=>p.distanceToSquared(old)>1e-8);
    if(choices.length&&!this.heldAtWall)
     next=choices.sort((a,b)=>a.distanceToSquared(intended)-b.distanceToSquared(intended))[0];
   }
  }
  const isSightBlocked=(eye:T.Vector3)=>{
   const sight=space.resolve(target,eye,.15);
   return sight.distanceToSquared(eye)>.10*.10;
  };
  const headingBehind=this.heading===undefined?yaw:this.heading+Math.PI;
  const angleError=angleBetween(headingBehind,Math.atan2(next.x-target.x,next.z-target.z));
  const turned=this.turnAge>0&&this.turnTravel>.10&&this.turnSide!==0;
  const occluded=isSightBlocked(next)||!!frame.outOfFrame;

  if(turned&&(occluded||Math.abs(angleError)>.36)){
   // Orbit only because the character ACTUALLY turned and is losing camera
   // framing. Do not orbit on stationary wall contact. Clamp to sub-degree
   // steps and select a fixed turn side, eliminating left-right vibration.
   const currentYaw=Math.atan2(next.x-target.x,next.z-target.z);
   const currentPitch=Math.atan2(next.y-target.y,Math.hypot(next.x-target.x,next.z-target.z));
   const aim=angleBetween(headingBehind,currentYaw);
   const easeIn=Math.min(1,Math.max(0,(this.turnTravel-.10)/.34));
   const angleStep=T.MathUtils.clamp(aim,-dt*.70*easeIn,dt*.70*easeIn);
   const desiredRadius=Math.min(radius,next.distanceTo(target));
   const orbit=place(currentYaw+angleStep,currentPitch,desiredRadius);
   const candidate=safeMove(next,orbit);
   if(candidate.distanceToSquared(next)>1e-7)next=candidate;
   else if(occluded){
    // At a corner the orbit arc may graze a wall. Slide on the already clear
    // wall tangent *in the fixed direction of the player's turn*.
    const tangent=new T.Vector3(Math.cos(currentYaw)*this.turnSide,0,-Math.sin(currentYaw)*this.turnSide);
    const slide=safeMove(next,next.clone().addScaledVector(tangent,dt*2.0*easeIn));
    if(slide.distanceToSquared(next)>1e-7)next=slide;
   }
  }

  // Keep the wall hold until the player makes room again. No dolly zoom,
  // no teleport back behind the character, no idle automatic recenter.
  this.eye.copy(next);
  this.heldAtWall=(contact||this.heldAtWall)&&this.eye.distanceTo(target)<radius-EPSILON;
  return this.eye.clone();
 }
}
/** Steering while moving follows a continuous orbit; no idle recenter or scenery-driven rotation. */
export function steerOrbit(yaw:number,x:number,dt:number,manual=false){return manual?yaw:yaw-Math.max(-1,Math.min(1,x))*Math.max(0,Math.min(.05,dt))*1.05;}
