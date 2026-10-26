import type {Point} from './maze';
export interface Ledge {kind?:'palm'|'rock'|'tree'|'log'|'cart'|'plane'|'wreck';point:Point;height:number;id:number}
export interface ClimbSave {phase:'ground'|'hanging'|'climbing'|'top'|'falling';ledge:number;elapsed:number;elevation:number;anchor:Point;edge:Point;cooldown:number}
export class Climber {
 state:ClimbSave={phase:'ground',ledge:-1,elapsed:0,elevation:0,anchor:{x:0,y:0},edge:{x:0,y:0},cooldown:0};
 get elevation(){return this.state.elevation;}
 reset(){this.state={phase:'ground',ledge:-1,elapsed:0,elevation:0,anchor:{x:0,y:0},edge:{x:0,y:0},cooldown:.3};}
 up(){if(this.state.phase==='hanging'){this.state.phase='climbing';this.state.elapsed=0;return true;}return false;}
 step(previous:Point,next:Point,input:Point,jump:number,dt:number,ledges:Ledge[]){
  const s=this.state;s.cooldown=Math.max(0,s.cooldown-dt);let reached:number|null=null;
  const ledge=ledges.find(l=>l.id===s.ledge);
  if(s.phase==='hanging'&&ledge){const to={x:s.anchor.x-previous.x,y:s.anchor.y-previous.y},dot=input.x*to.x+input.y*to.y;if(dot>.12)this.up();else if(dot<-.15){s.phase='falling';s.cooldown=.7;}return{position:{...s.edge},reached};}
  if(s.phase==='climbing'&&ledge){s.elapsed+=dt;const p=Math.min(1,s.elapsed/((ledge.kind==='palm'||ledge.kind==='tree')?1.4:.55)),ease=p*p*(3-2*p);const base=(ledge.kind==='palm'||ledge.kind==='tree')?.18:Math.max(.12,ledge.height-.93);s.elevation=base+(ledge.height-base)*ease;
   if(p===1){s.phase='top';reached=ledge.id;}return{position:{x:s.edge.x+(s.anchor.x-s.edge.x)*ease,y:s.edge.y+(s.anchor.y-s.edge.y)*ease},reached};}
  if(s.phase==='top'&&ledge){if(Math.abs(next.x-s.anchor.x)<.55&&Math.abs(next.y-s.anchor.y)<.55){s.elevation=ledge.height;return{position:next,reached};}s.phase='falling';s.elapsed=0;s.cooldown=.45;}
  if(s.phase==='falling'){s.elapsed+=dt;s.elevation=Math.max(0,s.elevation-(.6+s.elapsed*5)*dt);if(!s.elevation)s.phase='ground';}
  for(const l of ledges){const c={x:l.point.x+.5,y:l.point.y+.5},vx=next.x-c.x,vy=next.y-c.y;
   if(s.cooldown===0&&jump>((l.kind==='palm'||l.kind==='tree')?.15:Math.max(.15,l.height-.93))&&s.phase==='ground'&&Math.hypot(vx,vy)<.99&&(input.x*(c.x-previous.x)+input.y*(c.y-previous.y))>.05){const horizontal=Math.abs(vx)>Math.abs(vy);s.phase='hanging';s.ledge=l.id;s.elapsed=0;s.anchor=c;s.edge=horizontal?{x:c.x+Math.sign(vx||1)*.65,y:Math.max(c.y-.55,Math.min(c.y+.55,next.y))}:{x:Math.max(c.x-.55,Math.min(c.x+.55,next.x)),y:c.y+Math.sign(vy||1)*.65};s.elevation=(l.kind==='palm'||l.kind==='tree')?.18:Math.max(.12,l.height-.93);return{position:{...s.edge},reached};}
   if(Math.abs(vx)<.63&&Math.abs(vy)<.63&&s.elevation<l.height-.1){
    // Slide along a climbable rock; maze hedges remain ordinary solid walls.
    if(Math.abs(previous.x-c.x)>=.63)next={x:previous.x,y:next.y};else if(Math.abs(previous.y-c.y)>=.63)next={x:next.x,y:previous.y};else next={...previous};
   }
  }
  return{position:next,reached};
 }
}
