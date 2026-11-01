/** Shared server timeline, in seconds. Skipping changes only the local camera. */
export const AWAKEN_SECONDS=6;
export function awakeningProgress(elapsed:number,at:number){return at<0?1:Math.max(0,Math.min(1,(elapsed-at)/AWAKEN_SECONDS));}

/** Deliberate orbit and dolly; normalized shared time gives every client the same shot. */
export function awakeningShot(progress:number){const p=Math.max(0,Math.min(1,progress)),ease=p*p*(3-2*p),angle=-.65+ease*1.15,distance=8.6-ease*3.4;return{x:Math.sin(angle)*distance,y:2.7-ease*.9,z:Math.cos(angle)*distance,lookHeight:1.25+Math.sin(p*Math.PI)*.35};}
