import {once} from 'node:events';
import {afterEach,it,expect,vi} from 'vitest';
import type {Match} from '../src/game/room-state';
import {RealtimeEngine,type Identity} from '../realtime/engine';
import {FirebaseRoomStore} from '../realtime/firebase-store';
// Simulate Firebase's initially empty transaction cache and remote comparison/retry.
class ColdDatabase {
 data=new Map<string,Match>();attempts=0;fail?:Error;
 ref(path:string){return{transaction:async(update:(v:Match|null)=>Match|null|undefined)=>{
  this.attempts++;if(this.fail)throw this.fail;
  const first=update(null),current=this.data.get(path)??null;
  if(first===undefined)return{committed:false,snapshot:{val:()=>structuredClone(current)}};
  const result=current?update(structuredClone(current)):first;
  if(result===undefined)return{committed:false,snapshot:{val:()=>structuredClone(current)}};
  if(result)this.data.set(path,structuredClone(result));else this.data.delete(path);
  return{committed:true,snapshot:{val:()=>structuredClone(result)}};
 }};}
}
const player=(uid:string,now:number):Identity=>({uid,profileId:'p',expiresAt:now+3600000,player:{uid,profileId:'p',name:uid,outfit:'classic',ready:false,online:true,x:1.5,y:1.5,angle:0,lastMove:now,seq:0,finishedAt:null,slot:0}});
const flush=()=>new Promise<void>(resolve=>setImmediate(resolve));
afterEach(()=>vi.restoreAllMocks());
it('keeps a lobby through cold-cache checkpoints beyond 12 seconds and accepts a second player',async()=>{
 let now=Date.now();const db=new ColdDatabase(),store=new FirebaseRoomStore(db as any),engine=new RealtimeEngine(store,1,()=>now),a=player('a',now),b=player('b',now);
 const created=await engine.command(a,'create',{area:'forest',difficulty:'easy',mode:'coop'}),code=created.room!.id;
 for(let i=0;i<15;i++){now+=2000;engine.tick();await flush();expect(engine.rooms.size).toBe(1);expect(engine.storageStatus.healthy).toBe(true);}
 const joined=await engine.command(b,'join',{code});expect(Object.keys(joined.room!.players)).toHaveLength(2);expect(db.data.get('mazeRooms/'+code)!.rtLease!.until).toBe(now+12000);expect(db.attempts).toBeGreaterThan(15);await engine.shutdown();
});
it('cold-cache recovery fences another live owner and increments the epoch only after expiry',async()=>{
 let now=Date.now();const db=new ColdDatabase(),store=new FirebaseRoomStore(db as any),engine=new RealtimeEngine(store,1,()=>now),a=player('a',now),created=await engine.command(a,'create',{area:'forest',difficulty:'easy'}),code=created.room!.id;
 await expect(store.claim(code,'other',now,'a_p',false)).rejects.toThrow('another active instance');
 const current=db.data.get('mazeRooms/'+code)!;await expect(store.save(current,'other',now)).rejects.toThrow('lease lost');
 now+=13000;const recovered=await store.claim(code,'other',now,'a_p',false);expect(recovered.rtEpoch).toBe(2);expect(recovered.rtLease!.owner).toBe('other');await expect(store.save(current,engine.owner,now)).rejects.toThrow('lease lost');
});
it('a deleted checkpoint is never recreated or reported as a renewed lease',async()=>{
 const now=Date.now(),db=new ColdDatabase(),store=new FirebaseRoomStore(db as any),engine=new RealtimeEngine(store,1,()=>now),created=await engine.command(player('a',now),'create',{area:'forest',difficulty:'easy'}),r=engine.rooms.get(created.room!.id)!;
 db.data.clear();await expect(store.save(r,engine.owner,now)).rejects.toThrow('lease lost');await expect(store.claim(r.id,engine.owner,now,'a_p',true)).rejects.toThrow('Room unavailable');expect(db.data.size).toBe(0);
});
it('reports checkpoint errors, recovers after a transient failure, and fences sustained storage loss',async()=>{
 const log=vi.spyOn(console,'error').mockImplementation(()=>{});let now=Date.now();const db=new ColdDatabase(),store=new FirebaseRoomStore(db as any),engine=new RealtimeEngine(store,1,()=>now),created=await engine.command(player('a',now),'create',{area:'forest',difficulty:'easy'});
 db.fail=Object.assign(Error('Test permission failure'),{code:'PERMISSION_DENIED'});now+=2000;engine.tick();await flush();expect(engine.storageStatus).toEqual({healthy:false,failures:1,lastError:'PERMISSION_DENIED'});expect(engine.rooms.size).toBe(1);
 db.fail=undefined;now+=2000;engine.tick();await flush();expect(engine.storageStatus.healthy).toBe(true);expect(engine.storageStatus.lastError).toBeNull();
 db.fail=Object.assign(Error('Test permission failure'),{code:'PERMISSION_DENIED'});for(let i=0;i<7;i++){now+=2000;engine.tick();await flush();}
 expect(engine.rooms.has(created.room!.id)).toBe(false);expect(log).toHaveBeenCalledWith('Realtime room lease expired; reconnect required',expect.any(Object));
});
it('two real WebSocket clients can create, wait thirty simulated seconds, then join with healthy storage',async()=>{
 const {createGateway}=await import('../realtime/gateway'),{default:WS}=await import('ws');
 let now=Date.now();const db=new ColdDatabase(),engine=new RealtimeEngine(new FirebaseRoomStore(db as any),1,()=>now),gateway=createGateway(engine,{origins:['http://localhost:5173'],authenticate:async token=>player(token,now)});
 gateway.http.listen(0,'127.0.0.1');await once(gateway.http,'listening');const port=(gateway.http.address()as any).port,sockets:InstanceType<typeof WS>[]=[];
 const connect=async(name:string)=>{const ws=new WS(`ws://127.0.0.1:${port}/game`,{origin:'http://localhost:5173'});sockets.push(ws);ws.on('error',()=>{});await once(ws,'open');const next=once(ws,'message');ws.send(JSON.stringify({type:'auth',token:name,profileId:'p'}));expect(JSON.parse(String((await next)[0])).type).toBe('authenticated');return ws;};
 const command=async(ws:InstanceType<typeof WS>,id:number,action:string,body:any)=>{
  const reply=new Promise<any>((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Reply timed out')),3000);const on=(raw:any)=>{const m=JSON.parse(String(raw));if(m.type==='reply'&&m.id===id){clearTimeout(timer);ws.off('message',on);resolve(m);}};ws.on('message',on);});
  ws.send(JSON.stringify({type:'command',id,action,body}));return reply;
 };
 try{
  const a=await connect('host'),b=await connect('guest'),created=await command(a,1,'create',{area:'forest',difficulty:'easy',mode:'coop'});expect(created.error).toBeUndefined();
  for(let i=0;i<15;i++){now+=2000;engine.tick();await flush();}
  const joined=await command(b,1,'join',{code:created.code});expect(joined.error).toBeUndefined();expect(Object.keys(engine.rooms.get(created.code)!.players)).toHaveLength(2);
  const health=await fetch(`http://127.0.0.1:${port}/health`).then(r=>r.json());expect(health.rooms).toBe(1);expect(health.storage).toEqual({healthy:true,failures:0,lastError:null});
 }finally{for(const ws of sockets)ws.close();await gateway.close();}
},15000);
