// Character-relative steering. Camera rotation never enters this calculation.
export function steer(angle:number,x:number,y:number,dt:number) {
 const turn=Math.max(-1,Math.min(1,x)),forward=Math.max(-1,Math.min(1,-y));
 const heading=angle-turn*2.55*Math.max(0,dt);
 const speed=forward*2.3*(forward<0?.7:1);
 return{angle:heading,x:Math.sin(heading)*speed,y:Math.cos(heading)*speed};
}
