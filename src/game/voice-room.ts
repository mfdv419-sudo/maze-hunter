import type {Database} from 'firebase-admin/database';
import type {Match} from './room-state';
/** Admin transport fallback: all paths derive from the verified profile and room membership. */
export async function voiceRoomAction(db:Database,room:Match,self:string,action:string,body:Record<string,any>,now:number){
 const base=`mazeVoice/${room.id}`,own=db.ref(`${base}/peers/${self}`);
 if(action==='voice-join'||action==='voice-status'){
  const session=String(body.session||'');if(!/^[a-zA-Z0-9-]{8,60}$/.test(session))throw Error('Invalid voice session');
  if(action==='voice-join')await db.ref(`${base}/inbox/${self}`).remove();
  await own.set({active:true,muted:body.muted!==false,talking:body.talking===true,session,at:now});
 }else if(action==='voice-signal'){
  const to=String(body.to||''),s=body.signal;if(to===self||!room.players[to])throw Error('Not a voice recipient');
  if(!s||!['offer','answer'].includes(s.type)||typeof s.sdp!=='string'||s.sdp.length>48000||typeof s.nonce!=='string'||!/^[a-zA-Z0-9-]{8,60}$/.test(s.nonce))throw Error('Invalid voice signal');
  await db.ref(`${base}/inbox/${to}/${self}`).set({type:s.type,sdp:s.sdp,nonce:s.nonce,at:now});
 }else if(action==='voice-leave'){
  await Promise.all([own.remove(),db.ref(`${base}/inbox/${self}`).remove(),...Object.keys(room.players).filter(k=>k!==self).map(to=>db.ref(`${base}/inbox/${to}/${self}`).remove())]);return{peers:{},inbox:{}};
 }else if(action!=='voice-poll')throw Error('Unknown voice action');
 if(action!=='voice-poll')return{ok:true};
 const [peers,inbox]=await Promise.all([db.ref(`${base}/peers`).get(),db.ref(`${base}/inbox/${self}`).get()]);
 return{peers:Object.fromEntries(Object.entries(peers.val()||{}).filter(([k])=>room.players[k])),inbox:Object.fromEntries(Object.entries(inbox.val()||{}).filter(([k])=>room.players[k]))};
}
