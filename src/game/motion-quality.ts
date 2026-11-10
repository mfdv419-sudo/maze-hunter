/** Presentation helpers use time, never frame counts, and cannot change rewards or combat. */
export const smooth01=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
export function turnTowards(from:number,to:number,dt:number,maxSpeed=5){const delta=Math.atan2(Math.sin(to-from),Math.cos(to-from)),step=Math.max(0,dt)*maxSpeed;return from+Math.max(-step,Math.min(step,delta));}
export function approachVelocity(current:{x:number;y:number},target:{x:number;y:number},dt:number){const d=Math.hypot(target.x-current.x,target.y-current.y),braking=Math.hypot(target.x,target.y)<.01,amount=Math.min(d,Math.max(0,Math.min(dt,.1))*(braking?24:18));return d>.00001?{x:current.x+(target.x-current.x)/d*amount,y:current.y+(target.y-current.y)/d*amount}:{...target};}
export function airPose(count:number,age:number,base=0){const duration=count===2?(4.1+Math.sqrt(4.1*4.1+23.2*Math.max(0,base)))/11.6:.72,progress=Math.max(0,Math.min(1,age/duration));return{progress,flip:count===2?Math.PI*2*smooth01((progress-.04)/.72):0,tuck:count===2?Math.sin(Math.PI*smooth01(progress/.8)):0};}
export function activeWindup(until:number,elapsed:number){return until>elapsed?Math.min(1,Math.max(0,1-(until-elapsed)/1.2)):0;}

/** Three deliberate grips: lift on the pull, hold while the other hand reaches. */
export function climbLift(progress:number){const p=Math.max(0,Math.min(1,progress)),step=p*3,index=Math.min(2,Math.floor(step));return (index+smooth01(Math.min(1,(step-index)/.65)))/3;}

/** Planar two-bone solve: limbs retain their lengths while a hand reaches a grip. */
export function armGrip(y:number,z:number){const upper=.22,fore=.22,d=Math.max(.06,Math.min(.435,Math.hypot(y,z))),bend=-Math.acos(Math.max(-1,Math.min(1,(d*d-upper*upper-fore*fore)/(2*upper*fore))));return{shoulder:Math.atan2(-z,-y)-Math.atan2(fore*Math.sin(bend),upper+fore*Math.cos(bend)),elbow:bend};}
