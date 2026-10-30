/** Bounded FIFO: never silently discard an accepted button press during an HTTP request. */
export class ActionQueue {
 private jobs:{run:()=>Promise<boolean>;resolve:(v:boolean)=>void}[]=[];private running=false;private closed=false;
 get pending(){return this.jobs.length+(this.running?1:0);}
 constructor(private limit=2,private changed:(pending:number)=>void=()=>{}){}
 add(run:()=>Promise<boolean>){if(this.closed||this.pending>=this.limit)return Promise.resolve(false);return new Promise<boolean>(resolve=>{this.jobs.push({run,resolve});this.changed(this.pending);void this.pump();});}
 private async pump(){if(this.running||this.closed)return;const job=this.jobs.shift();if(!job)return;this.running=true;this.changed(this.pending);try{const accepted=await job.run();job.resolve(!this.closed&&accepted);}catch{job.resolve(false);}finally{this.running=false;this.changed(this.pending);void this.pump();}}
 close(){this.closed=true;for(const j of this.jobs.splice(0))j.resolve(false);this.changed(this.pending);}
}
