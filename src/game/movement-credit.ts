/** Server-time movement allowance survives irregular request arrival without accumulating forever. */
export function movementAllowance(previous:number|undefined,lastAt:number,now:number,speed:number){
 const cap=Math.max(0,speed)*10,earned=Math.max(0,Math.min(10,(now-lastAt)/1000))*Math.max(0,speed);
 return Math.min(cap,Math.max(0,previous||0)+earned);
}
