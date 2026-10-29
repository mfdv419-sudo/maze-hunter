import {randomBytes,randomUUID} from 'node:crypto';
import {createMatch,addPlayer,startMatch,movePlayer,performAction,leaveMatch,type Match,type Player} from '../src/game/room-state';
import {tickAdventureRoom,retainRoomSimulation} from '../src/game/adventure-room';import {postRoomMessage} from '../src/game/room-chat';import {stampRoom} from '../src/game/room-sync';import {clientRoom} from '../src/game/room-view';import {validArea} from '../src/game/areas';
export interface Identity {uid:string;profileId:string;player:Player;expiresAt:number}
export interface RoomStore {create(room:Match,owner:string,now:number):Promise<boolean>;claim(code:string,owner:string,now:number,key:string,joining:boolean):Promise<Match>;save(room:Match,owner:string,now:number,release?:boolean):Promise<void>}
export class RealtimeEngine {
 readonly storageStatus={healthy:true,failures:0,lastError:null as string|null};private checkpointErrors=new Map<string,string>();
 readonly rooms=new Map<string,Match>();readonly owner=randomUUID();private loads=new Map<string,Promise<Match>>();private writes=new Map<string,Promise<void>>();private leases=new Map<string,number>();private settling=new Set<string>();private lastCheckpoint=0;private creating=new Map<string,number>();private pendingCreates=0;draining=false;tickMs=0;
 constructor(readonly store:RoomStore,readonly maxRooms=1,private now=()=>Date.now()){}
 private async load(code:string,key:string,joining:boolean){if(this.rooms.has(code))return this.rooms.get(code)!;if(this.loads.has(code))return this.loads.get(code)!;if([...this.rooms.values()].filter(r=>r.state!=='finished').length+this.loads.size+this.pendingCreates>=this.maxRooms)throw Error('Realtime server is full');const pending=this.store.claim(code,this.owner,this.now(),key,joining).then(room=>{for(const p of Object.values(room.players))p.online=false;retainRoomSimulation(room);this.rooms.set(code,room);stampRoom(room);this.leases.set(code,room.rtLease?.until||this.now()+12000);return room;}).finally(()=>this.loads.delete(code));this.loads.set(code,pending);return pending;}
 private persist(room:Match,release=false){
  const old=this.writes.get(room.id)||Promise.resolve();
  const job=old.catch(()=>{}).then(async()=>{
   const at=this.now();
   try{
    await this.store.save(structuredClone(room),this.owner,at,release);
    if(!release)this.leases.set(room.id,at+12000);
    this.checkpointErrors.delete(room.id);this.storageStatus.healthy=this.checkpointErrors.size===0;
    if(this.storageStatus.healthy)this.storageStatus.lastError=null;
   }catch(error){
    const message=error instanceof Error?error.message:String(error),raw=(error as {code?:unknown})?.code;
    const code=typeof raw==='string'&&/^[a-zA-Z0-9_/-]{1,64}$/.test(raw)?raw:message==='Room lease lost'?'ROOM_LEASE_LOST':'CHECKPOINT_FAILED';
    this.storageStatus.healthy=false;this.storageStatus.failures++;this.storageStatus.lastError=code;
    if(this.checkpointErrors.get(room.id)!==code)console.error('Realtime checkpoint failed',{room:room.id,code,message});
    if(this.rooms.has(room.id))this.checkpointErrors.set(room.id,code);throw error;
   }
  });
  this.writes.set(room.id,job);void job.finally(()=>{if(this.writes.get(room.id)===job)this.writes.delete(room.id);}).catch(()=>{});return job;
 }
 private membership(room:Match,key:string){if(!room.players[key]||room.expiresAt<this.now())throw Error('Not a current room member');if((this.leases.get(room.id)||0)<=this.now())throw Error('Room lease expired; reconnect');}
 view(code:string,key:string){const r=this.rooms.get(code);if(!r)return null;this.membership(r,key);return clientRoom(r,key);}
 async command(identity:Identity,action:string,body:Record<string,any>){if(this.draining)throw Error('Server restarting; reconnect');if(identity.expiresAt<=this.now())throw Error('Authentication expired');const key=`${identity.uid}_${identity.profileId}`,now=this.now();let code=String(body.code||'').toUpperCase(),r:Match|undefined,accepted:boolean|undefined,error:string|undefined;
  if(['create','random','join'].includes(action)&&[...this.rooms.values()].some(r=>r.id!==code&&r.state!=='finished'&&r.players[key]))throw Error('Leave your current room first');
  if(action==='create'||action==='random'){
   if(!validArea(body.area||'classic'))throw Error('Invalid adventure area');const difficulty=['easy','medium','hard','extreme'].includes(body.difficulty)?body.difficulty:'medium',mode=body.mode==='coop'?'coop':'race';
   if(action==='random')r=[...this.rooms.values()].find(r=>r.public&&r.state==='lobby'&&r.area===(body.area||'classic')&&r.difficulty===difficulty&&r.mode===mode&&r.expiresAt>now&&Object.keys(r.players).length<({easy:4,medium:4,hard:8,extreme:10}[difficulty as 'easy']));
   if(r){addPlayer(r,key,{...identity.player},now);await this.persist(r);}else{
    if(now-(this.creating.get(identity.uid)??-Infinity)<5000)throw Error('Wait before creating another room');if([...this.rooms.values()].filter(r=>r.state!=='finished').length+this.loads.size+this.pendingCreates>=this.maxRooms)throw Error('Realtime server is full');this.creating.set(identity.uid,now);this.pendingCreates++;
    try{for(let i=0;i<5;i++){code=Array.from(randomBytes(6),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');const candidate=createMatch(code,key,{...identity.player},mode,difficulty,now,randomBytes(4).readUInt32LE());candidate.area=body.area||'classic';candidate.transport='ws-v1';candidate.rtEpoch=1;candidate.public=action==='random';candidate.adventure={version:2,map:candidate.seed%10,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};if(await this.store.create(candidate,this.owner,now)){r=candidate;retainRoomSimulation(r);this.rooms.set(r.id,r);this.leases.set(r.id,now+12000);break;}}
    if(!r)throw Error('Could not allocate a room');}finally{this.pendingCreates--;}
   }
  }else{
   if(!/^[A-Z2-9]{6}$/.test(code))throw Error('Invalid room code');r=await this.load(code,key,action==='join');
   if(action==='join'){addPlayer(r,key,{...identity.player},now);await this.persist(r);}else{this.membership(r,key);const p=r.players[key];
    if(action==='ready'){if(r.state!=='lobby')throw Error('Match already started');p.ready=body.ready===true;r.revision++;}
    else if(action==='start'){if(Object.values(r.players).some(p=>!p.online))throw Error('All players must be online');startMatch(r,key,now);}
    else if(action==='reconnect'){p.online=true;r.revision++;}
    else if(action==='chat')postRoomMessage(r,key,body.text,body.messageId,now);
    else if(action==='move')movePlayer(r,key,body.points,Number(body.angle),Number(body.seq),now);
    else if(action==='ability'){
     const m=body.movement,seq=Number(m?.seq);if(m&&(!Number.isSafeInteger(seq)||seq<1))throw Error('Invalid movement sequence');
     if(m&&seq<=(p.lastActionSeq||0)){accepted=p.lastActionAccepted===true;error=p.lastActionError;}else{
      if(m)movePlayer(r,key,m.points,Number(m.angle),seq,now);
      accepted=false;if(m){p.lastActionSeq=seq;p.lastActionAccepted=false;delete p.lastActionError;}
      try{if(m&&p.seq!==seq)throw Error('Movement not accepted');if(r.adventure&&body.kind==='hit'&&body.cake!==undefined){if(!['normal','red','yellow','green'].includes(body.cake))throw Error('Invalid cake');r.adventure.states[key].selectedCake=body.cake;}performAction(r,key,body.kind,now);accepted=true;}catch(e){error=e instanceof Error?e.message:'Action unavailable';r.revision++;}if(m){p.lastActionAccepted=accepted;if(error)p.lastActionError=error;}
     }
    }else if(action==='leave'){leaveMatch(r,key,now);await this.persist(r,!Object.keys(r.players).length);if(!Object.keys(r.players).length)this.rooms.delete(r.id);}else throw Error('Unknown realtime action');
   }
  }
  stampRoom(r);return{room:clientRoom(r,key),playerKey:key,serverTime:now,...(accepted!==undefined?{actionAccepted:accepted,...(error?{actionError:error}:{})}:{})};
 }
 disconnect(code:string,key:string){const r=this.rooms.get(code);if(r?.players[key]){r.players[key].online=false;r.revision++;stampRoom(r);}}
 tick(){const now=this.now(),started=performance.now();for(const[code,r]of this.rooms){if((this.leases.get(code)||0)<=now){console.error('Realtime room lease expired; reconnect required',{room:code,storageError:this.storageStatus.lastError});this.rooms.delete(code);this.checkpointErrors.delete(code);continue;}if(r.expiresAt<now){r.state='finished';r.finishedAt??=now;void this.persist(r,true).finally(()=>this.rooms.delete(code)).catch(()=>{});continue;}if(Object.values(r.players).some(p=>p.online))delete r.rtIdleAt;else{r.rtIdleAt??=now;if(now-r.rtIdleAt>60000&&r.state!=='finished'){r.state='finished';r.finishedAt=now;for(const s of Object.values(r.adventure?.states||{})){s.phase='lost';s.reason='time';}r.revision++;stampRoom(r);}}if(r.state==='playing'){tickAdventureRoom(r,now);r.revision++;stampRoom(r);}if(r.state==='finished'&&!r.rtSettled&&!this.settling.has(code)){this.settling.add(code);void this.persist(r).then(()=>{r.rtSettled=true;r.revision++;stampRoom(r);}).catch(()=>{}).finally(()=>this.settling.delete(code));}}
  if(now-this.lastCheckpoint>=2000){this.lastCheckpoint=now;for(const r of this.rooms.values())if(!this.writes.has(r.id))void this.persist(r).catch(()=>{/* persist records the failure; the lease deadline still fences this instance. */});}
  this.tickMs=performance.now()-started;
 }
 async shutdown(){this.draining=true;await Promise.allSettled([...this.rooms.values()].map(r=>this.persist(r,true)));}
}
