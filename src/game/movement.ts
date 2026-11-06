// A camera behind world -Z looking toward +Z has screen-right along world -X.
// Re-evaluate the basis every frame, using the *rendered* camera direction.
export function screenMotion(x:number,y:number,cameraYaw:number,speed=2.3){
 const length=Math.hypot(x,y),n=Math.max(1,length);x/=n;y/=n;
 const vx=-x*Math.cos(cameraYaw)-y*Math.sin(cameraYaw),vy=x*Math.sin(cameraYaw)-y*Math.cos(cameraYaw);
 return{x:vx*speed,y:vy*speed,angle:length>.02?Math.atan2(vx,vy):null};
}
export function dampAngle(from:number,to:number,dt:number,rate=22){return from+Math.atan2(Math.sin(to-from),Math.cos(to-from))*(1-Math.exp(-Math.max(0,dt)*rate));}
