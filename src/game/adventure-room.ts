import {areaTime} from './areas';
import {AdventureState,type AdventureSave} from './adventure-state';
import {adventureRules} from './adventure-layout';
import {center,clearSegment,visibleCells,route,type Point} from './maze';
import {airborneHeight,nextJump} from './actions';
import type {Match} from './room-state';
export interface AdventureRoom {version:2;map:number;states:Record<string,AdventureSave>;tickAt:number;escapeAt:number;escapeDuration:number;bossHP:number;questSlots?:number[];broken?:string[];sharedWorld?:AdventureSave;sharedSeals?:number[];contributions?:Record<string,number[]>}
export const roomCapacity={easy:4,medium:4,hard:8,extreme:10} as const;
export function loadAdventure(room:Match,key:string){const a=room.adventure!;const state=new AdventureState(room.difficulty,a.map,room.seed,false,a.questSlots?{slots:a.questSlots,slot:room.players[key].slot,shared:room.mode==='coop'}:undefined,room.area||'classic');if(a.states[key])state.restore(a.states[key]);if(room.mode==='coop'&&a.sharedWorld){Object.assign(state,worldValues(a.sharedWorld));state.seals=new Set(a.sharedSeals||[]);}for(const k of a.broken||[]){state.broken.add(k);const [x,y]=k.split(',').map(Number);if(state.grid[y])state.grid[y][x]=0;}return state;}
export function startAdventureRoom(room:Match,now:number){const a=room.adventure!,base=new AdventureState(room.difficulty,a.map,room.seed,false,undefined,room.area||'classic');a.questSlots=Object.values(room.players).map(p=>p.slot);a.states={};a.bossHP=base.bossMaxHP;a.sharedSeals=[];a.contributions={};delete a.sharedWorld;a.escapeAt=-1;a.tickAt=room.startsAt;a.escapeDuration=90;
 for(const [k,p]of Object.entries(room.players)){const s=new AdventureState(room.difficulty,a.map,room.seed,false,{slots:a.questSlots!,slot:p.slot,shared:room.mode==='coop'},room.area||'classic');const start=s.layout.starts[p.slot];if(!start)throw Error('Map does not have enough distinct starts');s.position=center(start);s.checkpoint={...s.position};Object.assign(p,s.position,{seq:0,lastMove:room.startsAt,finishedAt:null});a.states[k]=s.save();}
 if(room.mode==='coop'){a.sharedWorld=structuredClone(Object.values(a.states)[0]);a.bossHP=a.sharedWorld.guards.find(g=>g.boss)!.hp;}
 room.expiresAt=now+(areaTime(room.area||'classic',room.difficulty)+180)*1000;
}
const sharedFields=['guards','projectiles','hazards','stage','escapeAt','escapeDuration','bossAwakeAt','nextBossSkill','nextEscapeHazard','hazardId'] as const;
function worldValues(save:AdventureSave){return Object.fromEntries(sharedFields.filter(k=>save[k]!==undefined).map(k=>[k,structuredClone(save[k])])) as Partial<AdventureSave>;}
function tickCoop(room:Match,now:number){
 const a=room.adventure!,raw=Math.max(0,(now-a.tickAt)/1000);if(!raw)return;a.tickAt=now;
 const entries=Object.entries(room.players);if(!entries.length)return;
 const states=new Map(entries.map(([key])=>[key,loadAdventure(room,key)]));
 const seals=new Set(a.sharedSeals||[]);a.contributions??={};
 const credit=(key:string,seal:number)=>{if(!seals.has(seal)){seals.add(seal);(a.contributions![key]??=[]).push(seal);}};
 const collect=()=>{for(const [key,s]of states)for(const seal of s.seals)credit(key,seal);a.sharedSeals=[...seals];for(const s of states.values())s.seals=new Set(seals);};
 for(const [key]of entries)for(const seal of a.states[key]?.seals||[])credit(key,seal);collect();
 const first=states.values().next().value!,world=new AdventureState(room.difficulty,a.map,room.seed,false,{slots:a.questSlots!,slot:entries[0][1].slot,shared:true},room.area||'classic');world.restore(a.sharedWorld||first.save());world.phase='playing';world.seals=new Set(seals);world.damage=()=>{};
 const frames=Math.ceil(Math.min(raw,3)/.04),dt=Math.min(raw,3)/frames;
 for(let i=0;i<frames;i++){
  for(const [key,p]of entries){const s=states.get(key)!;Object.assign(s,worldValues(world.save()));if(s.phase==='playing')s.step(dt,raw/frames,0,0,airborneHeight({at:(p.jumpAt??-1000000)/1000,base:p.jumpBase||0,count:p.jumpCount||1},now/1000),true);}
  collect();world.seals=new Set(seals);
  const active=[...states.values()].filter(s=>s.phase==='playing');if(!active.length)break;
  const king=world.guards.find(g=>g.boss)!,target=active.filter(s=>Math.hypot(s.position.x-world.layout.fortress.x-.5,s.position.y-world.layout.fortress.y-.5)<world.arenaRadius).sort((a,b)=>Math.hypot(a.position.x-king.position.x,a.position.y-king.position.y)-Math.hypot(b.position.x-king.position.x,b.position.y-king.position.y))[0]||active[0];
  world.position={...target.position};world.depth=target.depth;world.checkpoint={...target.checkpoint};world.step(dt,raw/frames,0,0,1);
  for(const [key,p]of entries){const s=states.get(key)!;if(s.phase!=='playing')continue;const jump=airborneHeight({at:(p.jumpAt??-1000000)/1000,base:p.jumpBase||0,count:p.jumpCount||1},now/1000);
   for(const cake of world.projectiles){if(cake.ttl<=0||cake.owner==='player'||jump>=.22||Math.abs((cake.depth||0)-s.depth)>=.75)continue;const from={x:cake.position.x-cake.velocity.x*dt,y:cake.position.y-cake.velocity.y*dt},vx=cake.position.x-from.x,vy=cake.position.y-from.y,t=Math.max(0,Math.min(1,((s.position.x-from.x)*vx+(s.position.y-from.y)*vy)/(vx*vx+vy*vy||1)));if(Math.hypot(s.position.x-from.x-vx*t,s.position.y-from.y-vy*t)<.26){s.damage(cake.owner);cake.ttl=0;}}
   for(const g of world.guards)if(!g.dead&&(!g.boss||world.bossAwake&&world.elapsed>=world.bossAwakeAt+1.8)&&jump<.22&&Math.abs(s.depth-(g.depth||0))<.75&&Math.hypot(g.position.x-s.position.x,g.position.y-s.position.y)<(g.boss?.55:.3))s.damage(g.boss?'boss':'guard');
   for(const h of world.hazards)if(h.resolved&&h.at>world.elapsed-dt-.0001&&jump<.22&&s.depth<.75){let inside=Math.hypot(s.position.x-h.point.x,s.position.y-h.point.y)<h.radius;if(h.kind==='charge'||h.kind==='vine'){const vx=h.point.x-h.from.x,vy=h.point.y-h.from.y,t=Math.max(0,Math.min(1,((s.position.x-h.from.x)*vx+(s.position.y-h.from.y)*vy)/(vx*vx+vy*vy||1)));inside=Math.hypot(s.position.x-h.from.x-vx*t,s.position.y-h.from.y-vy*t)<h.radius;}if(inside){if(h.kind==='roots')s.slowUntil=s.elapsed+2;else s.damage(world.stage==='escape'?'guard':'boss');}}
  }
  world.projectiles=world.projectiles.filter(c=>c.ttl>0);
 }
 if(world.stage==='escape'&&a.escapeAt<0){a.escapeAt=now;const farthest=Math.max(...[...states.values()].map(s=>route(s.grid,{x:Math.floor(s.position.x),y:Math.floor(s.position.y)},s.layout.maze.finish).length));world.escapeDuration=Math.max(world.escapeDuration,Math.min(900,Math.ceil(farthest/1.8+45)));}
 a.escapeDuration=world.escapeDuration;a.bossHP=world.guards.find(g=>g.boss)!.hp;a.sharedWorld=world.save();
 for(const [key,p]of entries){const s=states.get(key)!;Object.assign(s,worldValues(a.sharedWorld));s.seals=new Set(seals);for(const q of world.layout.escapeConnector)if(world.stage==='escape'){s.grid[q.y][q.x]=0;s.broken.add(`${q.x},${q.y}`);}if(s.gateOpen&&Math.hypot(s.position.x-s.layout.maze.finish.x-.5,s.position.y-s.layout.maze.finish.y-.5)<.45&&s.phase==='playing')s.phase='won';if(s.phase==='won'&&!p.finishedAt)p.finishedAt=now;
  room.explored??={};for(const k of visibleCells(s.grid,s.position,4))room.explored[k.replace(',','_')]=true;Object.assign(p,s.position,{elevation:s.climber.elevation,depth:s.depth,swimming:s.swimming,climb:s.climber.state.phase});a.states[key]=s.save();
 }
 if([...states.values()].every(s=>s.phase!=='playing')||a.escapeAt>=0&&now-a.escapeAt>=a.escapeDuration*1000){room.state='finished';room.finishedAt=now;}
}
export function tickAdventureRoom(room:Match,now:number){if(!room.adventure||room.state!=='playing'||now<room.startsAt)return;
 if(room.mode==='coop'){tickCoop(room,now);return;}
 const a=room.adventure,raw=Math.max(0,(now-a.tickAt)/1000);if(!raw)return;a.tickAt=now;

 for(const [key,p]of Object.entries(room.players)){const s=loadAdventure(room,key);if(s.phase!=='playing')continue;

  const boss=s.guards.find(g=>g.boss)!;
  
  const frames=Math.ceil(Math.min(raw,3)/.04),step=frames?Math.min(raw,3)/frames:0;
  for(let i=0;i<frames;i++)s.step(step,raw/frames,0,0,airborneHeight({at:(p.jumpAt??-1000000)/1000,base:p.jumpBase||0,count:p.jumpCount||1},now/1000));
  // Race health belongs only to this player's saved state. Shared bossHP is Co-op only.


  Object.assign(p,s.position,{elevation:s.climber.elevation,depth:s.depth,swimming:s.swimming,climb:s.climber.state.phase});if((s.phase as string)==='won'&&!p.finishedAt)p.finishedAt=now;
  if(room.mode==='race'){for(const cake of s.projectiles){if(cake.owner!=='player')continue;for(const [other,otherPlayer]of Object.entries(room.players)){if(other===key||otherPlayer.finishedAt)continue;const otherState=loadAdventure(room,other);if(otherState.phase!=='playing')continue;const sx=cake.position.x-cake.velocity.x*Math.min(raw,3),sy=cake.position.y-cake.velocity.y*Math.min(raw,3),vx=cake.position.x-sx,vy=cake.position.y-sy,l=vx*vx+vy*vy,t=Math.max(0,Math.min(1,((otherState.position.x-sx)*vx+(otherState.position.y-sy)*vy)/(l||1)));if(Math.abs((cake.depth||0)-otherState.depth)<.75&&Math.hypot(sx+vx*t-otherState.position.x,sy+vy*t-otherState.position.y)<.3&&clearSegment(s.grid,{x:sx,y:sy},otherState.position,.04)&&airborneHeight({at:(otherPlayer.jumpAt??-1000000)/1000,base:otherPlayer.jumpBase||0,count:otherPlayer.jumpCount||1},now/1000)<.22){otherState.damage('guard');a.states[other]=otherState.save();Object.assign(otherPlayer,otherState.position,{elevation:otherState.climber.elevation,climb:otherState.climber.state.phase});cake.ttl=0;break;}}}s.projectiles=s.projectiles.filter(c=>c.ttl>0);}
  a.states[key]=s.save();
 }
 if(room.mode==='race'){const winners=Object.entries(room.players).filter(([,p])=>p.finishedAt).sort((a,b)=>a[1].finishedAt!-b[1].finishedAt!);if(winners.length){room.winner=winners[0][0];room.state='finished';room.finishedAt=now;}}
 else if(Object.values(room.players).every(p=>p.finishedAt)){room.state='finished';room.finishedAt=now;}
 if(Object.values(a.states).every(s=>s.phase!=='playing')||(a.escapeAt>=0&&now-a.escapeAt>=a.escapeDuration*1000)){room.state='finished';room.finishedAt=now;}
}
export function moveAdventurePlayer(room:Match,key:string,points:Point[],angle:number,seq:number,now:number){const p=room.players[key];if(!p)throw Error('Not a room member');
 if(!Number.isSafeInteger(seq)||seq<1||!Number.isFinite(angle)||!Array.isArray(points)||!points.length||points.length>24)throw Error('Invalid movement');
 tickAdventureRoom(room,now);if(room.state!=='playing'||now<room.startsAt||p.finishedAt||seq<=p.seq)return room;
 const s=loadAdventure(room,key);if(s.phase!=='playing')return room;let position={...s.position},length=0;
 for(const q of points){if(!Number.isFinite(q.x)||!Number.isFinite(q.y)||!clearSegment(s.grid,position,q,.13))throw Error('Movement crosses a wall');length+=Math.hypot(q.x-position.x,q.y-position.y);position=q;}
 const seconds=Math.min(1.5,Math.max(0,(now-p.lastMove)/1000)),budget=seconds*2.7*s.speedFactor+.12;
 // Respawns are authoritative and discard stale prediction instead of accepting a teleport.
 if(length>budget){p.lastMove=now;p.seq=seq;room.revision++;return room;}
 for(const q of points){s.acceptPosition(q,airborneHeight({at:(p.jumpAt??-1000000)/1000,base:p.jumpBase||0,count:p.jumpCount||1},now/1000));if(s.phase!=='playing')break;}
 Object.assign(p,s.position,{elevation:s.climber.elevation,depth:s.depth,swimming:s.swimming,climb:s.climber.state.phase,angle,lastMove:now,seq,online:true});room.adventure!.states[key]=s.save();
 if(room.mode==='coop'){room.explored??={};/* Discovery is merged by the server below. */}
 tickAdventureRoom(room,now+1);room.revision++;return room;
}
export function adventureAbility(room:Match,key:string,kind:import('./actions').ActionKind,now:number){tickAdventureRoom(room,now);const p=room.players[key];if(!p||room.state!=='playing'||now<room.startsAt||p.finishedAt)throw Error('Match not active');
 const s=loadAdventure(room,key);if(s.phase!=='playing')throw Error('No lives left');if(kind.startsWith('cake-')){if(!s.selectCake(kind.slice(5)))throw Error('Unknown cake');room.adventure!.states[key]=s.save();room.revision++;return room;}if(kind==='dive'){if(!s.toggleDive())throw Error('Action unavailable');room.adventure!.states[key]=s.save();room.revision++;return room;}const field=kind==='jump'?'jumpAt':'hitAt';if(kind==='hit'&&now-(p[field]||0)<650)throw Error('Action cooling down');
 if(kind==='jump'&&s.swimming){s.diving=false;room.adventure!.states[key]=s.save();room.revision++;return room;}if(kind==='jump'){if(!s.climber.up()){const j=nextJump({at:(p.jumpAt??-1000000)/1000,base:p.jumpBase||0,count:p.jumpCount||1},now/1000);if(!j)throw Error('Action cooling down');p.jumpBase=j.base;p.jumpCount=j.count;}else{p.jumpBase=0;p.jumpCount=0;}}
 if(kind==='hit'&&!s.throwCake(p.angle))throw Error('Action unavailable');p[field]=now;if(room.mode==='coop'){room.adventure!.broken=[...new Set([...(room.adventure!.broken||[]),...s.broken])];if(kind==='hit'&&room.adventure!.sharedWorld){const cake=s.projectiles.at(-1);if(cake?.owner==='player'&&s.ammo<(room.adventure!.states[key]?.ammo??0))room.adventure!.sharedWorld!.projectiles.push(structuredClone(cake));}}room.adventure!.states[key]=s.save();room.revision++;return room;
}
