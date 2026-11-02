/** Reading/answer time ends at the last click, before any asynchronous verification. */
export class QuizClock {
 readonly deadline:number;private stopped:number|undefined;
 constructor(readonly budget:number,now=Date.now(),deadline?:number,elapsed?:number){this.deadline=deadline??now+Math.max(0,budget)*1000;if(elapsed!==undefined)this.stopped=Math.max(0,Math.min(budget,elapsed));}
 left(now=Date.now()){return this.stopped===undefined?Math.max(0,Math.min(this.budget,(this.deadline-now)/1000)):Math.max(0,this.budget-this.stopped);}
 stop(now=Date.now()){this.stopped??=this.budget-this.left(now);return this.stopped;}
}
