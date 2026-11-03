import {Climber,climbDuration,type Ledge} from './climbing';
import {smooth01} from './motion-quality';
import {pilotGround,pilotWallHeight,pilotTreeSites} from './forest-pilot';
import type {AdventureLayout} from './adventure-layout';
import type {Point,Grid} from './maze';
import {forestRules} from './forest-rules';
export function cliffSurfaces(l:AdventureLayout,p:Point,depth=0):Ledge[]{
 const gates=new Set([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].map(q=>`${q.x},${q.y}`)),out:Ledge[]=[];
 for(let z=Math.floor(p.y)-3;z<=Math.floor(p.y)+3;z++)for(let x=Math.floor(p.x)-3;x<=Math.floor(p.x)+3;x++)if(x>0&&z>0&&x<l.maze.grid.length-1&&z<l.maze.grid.length-1&&l.maze.grid[z][x]===1&&!gates.has(`${x},${z}`))out.push({id:900000+z*l.maze.grid.length+x,point:{x,y:z},height:pilotWallHeight(x+.5,z+.5)-pilotGround(x+.5,z+.5),width:1,depth:1,kind:'rock'});
 for(const [i,q]of l.forest!.pillars.entries())if(Math.hypot(q.x+.5-p.x,q.y+.5-p.y)<5)out.push({id:880000+i,point:{...q},width:.76,depth:.76,height:(i<4?2.26:.7),kind:'rock'});
 for(const [i,q]of pilotTreeSites(l).entries())if(Math.hypot(q.x-p.x,q.z-p.y)<5)out.push({id:800000+i,point:{x:q.x-.5,y:q.z-.5},height:pilotWallHeight(q.x,q.z)-pilotGround(q.x,q.z)+q.scale*2.42,width:.34*q.scale,depth:.34*q.scale,kind:'tree'});
 if(Math.hypot(54-p.x,27-p.y)<7)out.push({id:880010,point:{x:53.5,y:26.5},width:8.6,depth:.7,height:2.54,kind:'rock'});
 const lipTop=pilotWallHeight(66.5,40.5)+.21;for(const side of[-1,1])if(Math.hypot(66.4-p.x,40.5+side*1.2-p.y)<5)out.push({id:880020+(side+1)/2,point:{x:65.9,y:40+side*1.2},height:lipTop-pilotGround(66.4,40.5+side*1.2),width:1.2,depth:1.1,kind:'rock'});
 for(const [i,[x,z,w,d]]of [[31.5,32.5,7,2],[32.5,38.5,5,2],[61.5,37.5,3.6,1]].entries())if(Math.hypot(x-p.x,z-p.y)<7&&(i!==2||depth<.7))out.push({id:870000+i,point:{x:x-.5,y:z-.5},height:(i===0?.1:i===1?pilotGround(x,z)+.1:.375)-pilotGround(x,z),width:w,depth:d,kind:'rock'});
 return out;
}
/** Open only surfaces physically below the feet or within ledge reach, never alter the saved maze. */
export function traversalGrid(grid:Grid,ledges:Ledge[],p:Point,elevation:number,jump:number){
 const nav=grid.map(r=>r),feet=pilotGround(p.x,p.y)+elevation+jump;
 for(const l of ledges)if(l.id>=900000&&feet>=pilotGround(l.point.x+.5,l.point.y+.5)+l.height-.85){const z=l.point.y,x=l.point.x;if(nav[z]===grid[z])nav[z]=[...grid[z]];nav[z][x]=0;}
 return nav;
}
/** Pilot-only solid surface resolver. Small steps and descending landings do not trigger a climb. */
export class ForestClimber extends Climber {
 landed=false;private lastAir=0;
 step(previous:Point,next:Point,input:Point,jump:number,dt:number,ledges:Ledge[]){
  this.landed=false;const s=this.state,base=pilotGround(previous.x,previous.y),feet=base+s.elevation,previousAir=this.lastAir,descending=jump<previousAir;this.lastAir=jump;s.cooldown=Math.max(0,s.cooldown-dt);let reached:number|null=null;
  const top=(l:Ledge)=>l.id>=900000?pilotWallHeight(next.x,next.y):pilotGround(l.point.x+.5,l.point.y+.5)+l.height;
  const inside=(l:Ledge,q:Point,pad=0)=>Math.abs(q.x-l.point.x-.5)<(l.width||1)/2+pad&&Math.abs(q.y-l.point.y-.5)<(l.depth||1)/2+pad;
  const active=ledges.find(l=>l.id===s.ledge);
  if((s.phase==='hanging'||s.phase==='climbing')&&active){
   if(s.phase==='hanging'){if(input.x*(s.anchor.x-previous.x)+input.y*(s.anchor.y-previous.y)<-.15){s.phase='falling';s.elapsed=0;s.cooldown=.4;}else if(input.x*(s.anchor.x-previous.x)+input.y*(s.anchor.y-previous.y)>.12)this.up();return{position:{...s.edge},reached};}
   s.elapsed+=dt;const duration=climbDuration(active.kind==='tree'),t=Math.min(1,s.elapsed/duration),u=smooth01(Math.min(1,t/.7)),travel=smooth01((t-.7)/.3),position={x:s.edge.x+(s.anchor.x-s.edge.x)*travel,y:s.edge.y+(s.anchor.y-s.edge.y)*travel};
   const start=s.fromHeight??top(active)-Math.min(.85,active.height);s.elevation=Math.max(0,start+(top(active)-start)*u-pilotGround(position.x,position.y));if(t===1){s.phase='top';reached=active.id;this.landed=true;}return{position,reached};
  }
  // Resolve the highest surface at the destination that the feet can actually reach.
  const blocked=ledges.some(l=>inside(l,next,.13)&&top(l)>feet+jump+.03&&top(l)-feet>forestRules.stepHeight);
  const candidates=ledges.filter(l=>!blocked&&inside(l,next,.14)).sort((a,b)=>top(b)-top(a));
  for(const l of candidates){const h=top(l),rise=h-feet;
   if(jump<.03&&rise<=forestRules.stepHeight&&rise>=-.5||descending&&inside(l,next,-.025)&&feet+jump<=h+.08&&feet+previousAir>=h-.08&&rise>=0&&rise<=jump+.12){s.phase='top';s.ledge=l.id;s.elevation=Math.max(0,h-pilotGround(next.x,next.y));s.anchor={x:l.point.x+.5,y:l.point.y+.5};reached=l.id;this.landed=jump>.01;return{position:next,reached};}
  }
  if(s.phase==='top'&&active&&inside(active,next)){s.elevation=Math.max(0,top(active)-pilotGround(next.x,next.y));return{position:next,reached};}
  if(s.phase==='top'){s.phase='falling';s.elapsed=0;}
  for(const l of ledges){const h=top(l),tree=l.kind==='tree'||l.kind==='palm';if(feet+jump>=h-.03)continue;
   const c={x:l.point.x+.5,y:l.point.y+.5},rX=(l.width||1)/2+.16,rY=(l.depth||1)/2+.16,near=inside(l,next,.3),toward=input.x*(c.x-previous.x)+input.y*(c.y-previous.y)>0;
   if(near&&toward&&s.cooldown===0&&jump>.12&&(tree?feet>=(l.id>=800000&&l.id<880000?pilotWallHeight(c.x,c.y):pilotGround(c.x,c.y))-.2:feet+jump>=h-1.3)){const side=Math.abs(previous.x-c.x)>Math.abs(previous.y-c.y);s.phase='hanging';s.ledge=l.id;s.elapsed=0;s.anchor={x:Math.max(c.x-(l.width||1)/2+.1,Math.min(c.x+(l.width||1)/2-.1,next.x)),y:Math.max(c.y-(l.depth||1)/2+.1,Math.min(c.y+(l.depth||1)/2-.1,next.y))};s.edge=side?{x:c.x+Math.sign(previous.x-c.x||1)*rX,y:next.y}:{x:next.x,y:c.y+Math.sign(previous.y-c.y||1)*rY};s.fromHeight=tree?feet+.18:Math.max(feet,h-1.1);s.elevation=Math.max(0,s.fromHeight-pilotGround(s.edge.x,s.edge.y));return{position:{...s.edge},reached};}
   if(inside(l,next,.14)){if(Math.abs(previous.x-c.x)>=(l.width||1)/2+.12)next={x:previous.x,y:next.y};else next={x:next.x,y:previous.y};}
  }
  if(s.phase==='falling'){s.elapsed+=dt;s.elevation=Math.max(0,feet-(.5+s.elapsed*3.8)*dt-pilotGround(next.x,next.y));if(s.elevation===0)s.phase='ground';}else s.elevation=0;
  return{position:next,reached};
 }
}
