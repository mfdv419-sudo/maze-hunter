import type {Point} from './maze';
/** Track our own acknowledgements. A teammate's room update is not a correction of our predicted path. */
export class OnlineMotion {
 sequence:number;ack:number;private lastRespawn:number;private endpoints=new Map<number,Point>();private samples:Point[]=[];private last:Point;private sentAt=0;inFlight=false;
 constructor(position:Point,sequence=0,respawns=0){this.sequence=this.ack=sequence;this.last={...position};this.lastRespawn=respawns;}
 sample(p:Point){this.last={...p};const last=this.samples.at(-1);if(this.samples.length<24&&(!last||Math.hypot(last.x-p.x,last.y-p.y)>.001))this.samples.push({...p});}
 blocked(now:number){return this.samples.length>=24||this.inFlight&&now-this.sentAt>1200;}
 packet(now:number){if(this.inFlight)return null;const points=this.samples.length?this.samples.splice(0,24):[{...this.last}],seq=++this.sequence;this.endpoints.set(seq,{...points.at(-1)!});this.sentAt=now;this.inFlight=true;return{points,seq};}
 complete(){this.inFlight=false;}
 reconcile(position:Point,sequence:number,respawns:number,playing=true):'keep'|'snap'{
  const endpoint=this.endpoints.get(sequence),newAck=sequence>this.ack;
  const correction=respawns!==this.lastRespawn||!playing||newAck&&!!endpoint&&Math.hypot(endpoint.x-position.x,endpoint.y-position.y)>.25;
  this.ack=Math.max(this.ack,sequence);this.sequence=Math.max(this.sequence,sequence);this.lastRespawn=respawns;
  for(const seq of this.endpoints.keys())if(seq<=sequence)this.endpoints.delete(seq);
  if(correction){this.samples=[];this.last={...position};return'snap';}return'keep';
 }
 reset(position:Point){this.samples=[];this.last={...position};}
}
