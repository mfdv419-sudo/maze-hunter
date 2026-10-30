/** Shared server timeline, in seconds. Skipping changes only the local camera. */
export const AWAKEN_SECONDS=6;
export function awakeningProgress(elapsed:number,at:number){return at<0?1:Math.max(0,Math.min(1,(elapsed-at)/AWAKEN_SECONDS));}
