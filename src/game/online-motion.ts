import type {Point} from './maze';
/** Preserve ordered turns across slow HTTP acknowledgements; never drop the tail of a path. */
export class OnlineMotion {
 sequence:number;ack:number;private lastRespawn:number;private endpoints=new Map<number,Point>();private samples:Point[]=[];private last:Point;private sentAt=0;inFlight=false;private retry:{points:Point[];seq:number}|null=null;private sent:{points:Point[];seq:number}|null=null;
 constructor(position:Point,sequence=0,respawns=0){this.sequence=this.ack=sequence;this.last={...position};this.lastRespawn=respawns;}
 sample(p:Point){const previous=this.last;this.last={...p};if(Math.hypot(previous.x-p.x,previous.y-p.y)<.001)return;
  const a=this.samples.at(-2),b=this.samples.at(-1);if(a&&b){const ux=b.x-a.x,uy=b.y-a.y,vx=p.x-b.x,vy=p.y-b.y;if(ux*vx+uy*vy>=0&&Math.abs(ux*vy-uy*vx)<.00001){this.samples[this.samples.length-1]={...p};return;}}
  if(this.samples.length<160)this.samples.push({...p});
 }
 slow(now:number){return this.inFlight&&now-this.sentAt>1200;}
 blocked(now:number){return this.samples.length>=160||this.inFlight&&now-this.sentAt>8000;}
 packet(now:number){if(this.inFlight)return null;const packet=this.retry||{points:this.samples.length?this.samples.splice(0,24):[{...this.last}],seq:++this.sequence};this.retry=null;this.sent=packet;this.endpoints.set(packet.seq,{...packet.points.at(-1)!});this.sentAt=now;this.inFlight=true;return packet;}
 complete(){this.inFlight=false;this.sent=null;}
 failed(){if(this.sent&&this.sent.seq>this.ack)this.retry=this.sent;this.complete();}
 reconcile(position:Point,sequence:number,respawns:number,playing=true):'keep'|'snap'{
  if(sequence<this.ack)return'keep';
  const endpoint=this.endpoints.get(sequence),newAck=sequence>this.ack;
  const correction=respawns!==this.lastRespawn||!playing||newAck&&!!endpoint&&Math.hypot(endpoint.x-position.x,endpoint.y-position.y)>.25;
  this.ack=Math.max(this.ack,sequence);this.sequence=Math.max(this.sequence,sequence);this.lastRespawn=respawns;
  if(this.retry&&this.retry.seq<=sequence)this.retry=null;
  for(const seq of this.endpoints.keys())if(seq<=sequence)this.endpoints.delete(seq);
  if(correction){this.reset(position);return'snap';}return'keep';
 }
 reset(position:Point){this.samples=[];this.retry=null;this.last={...position};}
}
