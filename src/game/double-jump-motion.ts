/** Animated forward somersault after the SECOND jump. First jump is never rotated.
 * No gameplay velocity, collision or height changes are made here. */
export function doubleJumpSomersault(count:number,age:number,height:number):number {
 if(count!==2||!Number.isFinite(age)||age<0||height<=.015)return 0;
 const phase=Math.min(1,Math.max(0,age/.86));
 if(phase>=1)return 0; // a completed 2π revolution is the rest orientation
 const eased=phase*phase*(3-2*phase);
 return 2*Math.PI*eased;
}
