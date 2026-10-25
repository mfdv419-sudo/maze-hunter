import {AdventureState,type AdventureSave} from './adventure-state';
import {adventureRules} from './adventure-layout';
import {center,clearSegment,visibleCells,type Point} from './maze';
import {jumpHeight,JUMP_SECONDS} from './actions';
import type {Match} from './room-state';
export interface AdventureRoom {version:2;map:number;states:Record<string,AdventureSave>;tickAt:number;escapeAt:number;escapeDuration:number;bossHP:number;broken?:string[]}
export const roomCapacity={medium:4,hard:8,extreme:10} as const;
export function loadAdventure(room:Match,key:string){const a=room.adventure!;const state=new AdventureState(room.difficulty,a.map,room.seed);if(a.states[key])state.restore(a.states[key]);for(const k of a.broken||[]){state.broken.add(k);const [x,y]=k.split(',').map(Number);if(state.grid[y])state.grid[y][x]=0;}return state;}
export function startAdventureRoom(room:Match,now:number){const a=room.adventure!,base=new AdventureState(room.difficulty,a.map,room.seed);a.states={};a.bossHP=base.bossMaxHP;a.escapeAt=-1;a.tickAt=room.startsAt;a.escapeDuration=90;
 for(const [k,p]of Object.entries(room.players)){const s=new AdventureState(room.difficulty,a.map,room.seed);const start=s.layout.starts[p.slot];if(!start)throw Error('Map does not have enough distinct starts');s.position=center(start);s.checkpoint={...s.position};Object.assign(p,s.position,{seq:0,lastMove:room.startsAt,finishedAt:null});a.states[k]=s.save();}
 room.expiresAt=now+(adventureRules[room.difficulty].seconds+180)*1000;
}
export function tickAdventureRoom(room:Match,now:number){if(!room.adventure||room.state!=='playing'||now<room.startsAt)return;
 const a=room.adventure,raw=Math.max(0,(now-a.tickAt)/1000);if(!raw)return;a.tickAt=now;
 let sharedSeals=new Set<number>();if(room.mode==='coop')for(const s of Object.values(a.states))for(const n of s.seals||[])sharedSeals.add(n);
 for(const [key,p]of Object.entries(room.players)){const s=loadAdventure(room,key);if(s.phase!=='playing')continue;
  if(room.mode==='coop')s.seals=new Set(sharedSeals);
  const boss=s.guards.find(g=>g.boss)!;boss.hp=a.bossHP;boss.dead=a.bossHP<=0;
  if(a.escapeAt>=0){s.stage='escape';s.escapeAt=(a.escapeAt-room.startsAt)/1000;s.escapeDuration=a.escapeDuration;}
  const frames=Math.ceil(Math.min(raw,3)/.04),step=frames?Math.min(raw,3)/frames:0;
  for(let i=0;i<frames;i++)s.step(step,raw/frames,0,0,jumpHeight((now-(p.jumpAt||0))/1000/JUMP_SECONDS));
  // A single authoritative health pool for the shared King.
  a.bossHP=Math.min(a.bossHP,boss.hp);if(a.bossHP<=0&&a.escapeAt<0){a.escapeAt=now;a.escapeDuration=s.escapeDuration;}
  if(room.mode==='coop'){room.explored??={};for(const k of visibleCells(s.grid,s.position,4))room.explored[k.replace(',','_')]=true;}
  if(room.mode==='coop')s.resetFogRevision=a.states[key].resetFogRevision;
  Object.assign(p,s.position,{elevation:s.climber.elevation,climb:s.climber.state.phase});if((s.phase as string)==='won'&&!p.finishedAt)p.finishedAt=now;
  if(room.mode==='race'){for(const cake of s.projectiles){if(cake.owner!=='player')continue;for(const [other,otherPlayer]of Object.entries(room.players)){if(other===key||otherPlayer.finishedAt)continue;const otherState=loadAdventure(room,other);if(otherState.phase!=='playing')continue;const sx=cake.position.x-cake.velocity.x*Math.min(raw,3),sy=cake.position.y-cake.velocity.y*Math.min(raw,3),vx=cake.position.x-sx,vy=cake.position.y-sy,l=vx*vx+vy*vy,t=Math.max(0,Math.min(1,((otherState.position.x-sx)*vx+(otherState.position.y-sy)*vy)/(l||1)));if(Math.hypot(sx+vx*t-otherState.position.x,sy+vy*t-otherState.position.y)<.3&&clearSegment(s.grid,{x:sx,y:sy},otherState.position,.04)&&jumpHeight((now-(otherPlayer.jumpAt||0))/1000/JUMP_SECONDS)<.22){otherState.damage('guard');a.states[other]=otherState.save();Object.assign(otherPlayer,otherState.position,{elevation:otherState.climber.elevation,climb:otherState.climber.state.phase});cake.ttl=0;break;}}}s.projectiles=s.projectiles.filter(c=>c.ttl>0);}
  a.broken=[...new Set([...(a.broken||[]),...s.broken])];a.states[key]=s.save();
 }
 if(room.mode==='race'){const winners=Object.entries(room.players).filter(([,p])=>p.finishedAt).sort((a,b)=>a[1].finishedAt!-b[1].finishedAt!);if(winners.length){room.winner=winners[0][0];if(Object.values(a.states).every(s=>s.phase!=='playing')){room.state='finished';room.finishedAt=now;}}}
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
 for(const q of points){s.acceptPosition(q,jumpHeight((now-(p.jumpAt||0))/1000/JUMP_SECONDS));if(s.phase!=='playing')break;}
 Object.assign(p,s.position,{elevation:s.climber.elevation,climb:s.climber.state.phase,angle,lastMove:now,seq,online:true});room.adventure!.states[key]=s.save();
 if(room.mode==='coop'){room.explored??={};/* Discovery is merged by the server below. */}
 tickAdventureRoom(room,now+1);room.revision++;return room;
}
export function adventureAbility(room:Match,key:string,kind:'jump'|'hit',now:number){tickAdventureRoom(room,now);const p=room.players[key];if(!p||room.state!=='playing'||now<room.startsAt||p.finishedAt)throw Error('Match not active');
 const s=loadAdventure(room,key);if(s.phase!=='playing')throw Error('No lives left');const field=kind==='jump'?'jumpAt':'hitAt';if(now-(p[field]||0)<(kind==='jump'?800:650))throw Error('Action cooling down');
 if(kind==='jump')s.climber.up();
 if(kind==='hit'&&!s.throwCake(p.angle))throw Error('Action unavailable');p[field]=now;room.adventure!.broken=[...new Set([...(room.adventure!.broken||[]),...s.broken])];room.adventure!.states[key]=s.save();room.revision++;return room;
}
