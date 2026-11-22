/** Shared server timeline, in seconds. Skipping changes only the local camera. */
export const AWAKEN_SECONDS=6;
export function awakeningProgress(elapsed:number,at:number){return at<0?1:Math.max(0,Math.min(1,(elapsed-at)/AWAKEN_SECONDS));}

/** Deliberate orbit and dolly; normalized shared time gives every client the same shot. */
export function awakeningShot(progress:number){
 const p=Math.max(0,Math.min(1,progress)),smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
 const dolly=smooth(p/.4),orbit=smooth((p-.28)/.55),angle=-1.25+orbit*1.25,distance=3.2+dolly*4.8;
 return{x:Math.sin(angle)*distance,y:.28+dolly*1.65,z:Math.cos(angle)*distance,lookHeight:1.35,angle};
}
