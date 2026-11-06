import {voiceNonce,type VoiceTransport,type VoicePeer,type VoiceSignal} from './room-voice';
export function serverVoiceTransport(request:(action:string,payload:Record<string,unknown>)=>Promise<any>):VoiceTransport{
 let generation=0,session='',closed=true,timer:ReturnType<typeof setInterval>|undefined,polling=false;
 let peers:(p:Record<string,VoicePeer>)=>void=()=>{},signal:(from:string,s:VoiceSignal)=>void=()=>{},error:(e:Error)=>void=()=>{};
 const poll=async()=>{if(closed||polling)return;polling=true;const epoch=generation;try{const r=await request('voice-poll',{});if(closed||epoch!==generation)return;peers(r.voice.peers||{});for(const[from,value]of Object.entries(r.voice.inbox||{}))signal(from,value as VoiceSignal);}catch(e){if(!closed)error(e instanceof Error?e:Error(String(e)));}finally{polling=false;}};
 return{
  async join(){generation++;session=voiceNonce();closed=false;await request('voice-join',{session,muted:true,talking:false});},
  async status(peer){await request('voice-status',{...peer,session});},
  async send(to,s){await request('voice-signal',{to,signal:s});},
  listen(p,s,e){peers=p;signal=s;error=e||(()=>{});void poll();timer=setInterval(()=>void poll(),1800);return()=>{if(timer)clearInterval(timer);timer=undefined;};},
  async close(){generation++;closed=true;if(timer)clearInterval(timer);timer=undefined;if(session)await request('voice-leave',{});session='';}
 };
}
const permission=(e:unknown)=>/permission.denied/i.test(e instanceof Error?e.message:String(e));
/** Keep RTDB realtime when allowed; authenticated Function signaling needs no public rule change. */
export function fallbackVoiceTransport(primary:VoiceTransport,fallback:VoiceTransport):VoiceTransport{
 let active=primary,closed=false,switching:Promise<void>|undefined,off=()=>{},callbacks:Parameters<VoiceTransport['listen']>|undefined;
 const listen=()=>{off();if(callbacks)off=active.listen(callbacks[0],callbacks[1],e=>{if(permission(e))void switchToServer().catch(err=>callbacks?.[2]?.(err));else callbacks?.[2]?.(e);});};
 const switchToServer=async()=>{if(active===fallback)return;if(switching)return switching;switching=(async()=>{off();await(primary.suspend?primary.suspend():primary.close()).catch(()=>{});await fallback.join();if(closed){await fallback.close();return;}active=fallback;listen();})();try{await switching;}finally{switching=undefined;}};
 const run=async(method:'join'|'status'|'send',args:any[])=>{try{await (active[method] as (...a:any[])=>Promise<void>)(...args);}catch(e){if(active!==primary||!permission(e))throw e;await switchToServer();if(method!=='join')await(active[method] as (...a:any[])=>Promise<void>)(...args);}};
 return{async join(){closed=false;await run('join',[]);},status:p=>run('status',[p]),send:(to,s)=>run('send',[to,s]),listen(...args){callbacks=args;listen();return()=>{callbacks=undefined;off();};},async close(){closed=true;off();await active.close();}};
}
