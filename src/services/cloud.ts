import {coherentRoom} from '../game/room-sync';
import {fallbackVoiceTransport,serverVoiceTransport} from './server-voice-transport';
import {voiceNonce} from './room-voice';
import type {VoiceTransport,VoicePeer,VoiceSignal} from './room-voice';
import {permittedAppearance} from './cosmetics';
import { initializeApp } from "firebase/app";
import { firebaseWebConfig } from "./firebase-web-config";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { getDatabase, ref, onValue, onDisconnect, query, orderByKey, startAt } from "firebase/database";
import { mergeProfile, validProfile, type Profile } from "./local";
// Read only public fields used by this browser client. Do not serialize import.meta.env.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseWebConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseWebConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseWebConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseWebConfig.appId,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};
export const cloudConfigured = !!(
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.appId
);
const app = cloudConfigured
  ? initializeApp({
      apiKey: config.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_SAME_ORIGIN==='true'?location.host:config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
      databaseURL: config.databaseURL,
    })
  : null;
const auth = app ? getAuth(app) : null,
  db = app ? getFirestore(app) : null,
  rtdb = app && config.databaseURL ? getDatabase(app) : null;
export function watchAuth(fn: (u: User | null) => void) {
  if (!auth) {
    queueMicrotask(() => fn(null));
    return () => {};
  }
  return onAuthStateChanged(auth, fn);
}
export async function restoreAuth(){if(!auth)return;await auth.authStateReady();await getRedirectResult(auth);}
export async function loginRedirect(){if(!auth)throw Error('Firebase unavailable');if(import.meta.env.VITE_FIREBASE_AUTH_SAME_ORIGIN!=='true')throw Error('Redirect requires same-origin auth setup. See docs/MOBILE_LOGIN.md');await signInWithRedirect(auth,new GoogleAuthProvider());}
let pendingLogin: Promise<unknown> | null = null;
// Only public identifiers and coarse status; never expose UID, email, API key, or tokens.
export function loginContext() {
  return {
    project: config.projectId,
    authDomain: auth?.config?.authDomain||config.authDomain,
    origin: location.origin,
    method: "Google popup",
    signedIn: !!auth?.currentUser,
  };
}
export async function login() {
  if (!auth)
    throw Error("Firebase belum dikonfigurasi / Firebase is not configured");
  if (pendingLogin) return pendingLogin;
  if(auth.currentUser)return;
  let stop=()=>{};const observed=new Promise<void>(resolve=>{stop=onAuthStateChanged(auth,u=>{if(u)resolve();});});
  let timer:ReturnType<typeof setTimeout>;const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(Error('Google sign-in did not return. Retry or use same-page sign-in.'),{code:'auth/popup-timeout'})),60000);});
  pendingLogin = Promise.race([signInWithPopup(auth, new GoogleAuthProvider()),observed,timeout]);
  try { await pendingLogin; }
  finally { clearTimeout(timer!);stop();pendingLogin = null; }
}
export async function logout() {
  if (auth) await signOut(auth);
}
export async function getProfiles(uid: string) {
  if (!db) throw Error("Cloud unavailable");
  const snaps = await getDocs(collection(db, "families", uid, "profiles"));
  return Promise.all(snaps.docs.map(d=>d.data()).filter(validProfile).map(async p=>{const w=await getDoc(doc(db!,'families',uid,'wardrobes',p.id));if(w.exists())p.wardrobe=w.data() as import('./cosmetics').WardrobeWallet;return p;}));
}
async function serverJSON(response:Response){let data:any;try{data=await response.json();}catch{throw Error(`Layanan online tidak merespons (HTTP ${response.status}).`);}if(!response.ok)throw Error(`${data.error||'Online request failed'} (HTTP ${response.status})`);return data;}
export async function syncProfile(uid: string, p: Profile) {
  if (!db) throw Error("Cloud unavailable");
  const target = doc(db, "families", uid, "profiles", p.id);
  // Initialize the server-owned migration receipt while the old profile still has its original schema.
  const existing=await getDoc(target);
  if(existing.exists()&&auth?.currentUser){
    const init=await fetch('/.netlify/functions/maze-room',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${await auth.currentUser.getIdToken()}`},body:JSON.stringify({action:'wardrobe',profileId:p.id,pending:[]})});
    await serverJSON(init);
  }
  const merged = await runTransaction(db, async (tx) => {
    const snap = await tx.get(target),
      old = snap.data();
    const merged = validProfile(old) ? mergeProfile(p, old) : p;
    const {wardrobe,...publicProfile}=merged;tx.set(target, publicProfile);
    return merged;
  });
  if(auth?.currentUser){const response=await fetch('/.netlify/functions/maze-room',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${await auth.currentUser.getIdToken()}`},body:JSON.stringify({action:'wardrobe',profileId:p.id,pending:merged.wardrobe?.pending||[]})});const result=await serverJSON(response);merged.wardrobe=result.wallet;merged.appearance=permittedAppearance(merged);if(result.rejected?.length)window.dispatchEvent(new CustomEvent('wardrobe-rejected'));}
  return merged;
}
export async function getEntitlement(uid: string) {
  if (!db) return false;
  const s = await getDoc(doc(db, "entitlements", uid));
  const d = s.data();
  return !!(d?.adFreeUntil?.toMillis && d.adFreeUntil.toMillis() > Date.now());
}
export interface RoomPlayer {
  uid: string;
  profileId: string;
  name: string;
  outfit: string;
  appearance?:import('./cosmetics').Appearance;
  ready: boolean;
  online: boolean;
  x: number;
  y: number;
  angle: number;
  lastMove: number;
  seq: number;
  finishedAt: number | null;
  slot: number;
  elevation?:number;
  climb?:import('../game/climbing').ClimbSave['phase'];
  jumpAt?: number;
  jumpBase?:number;
  jumpCount?:number;
  hitAt?: number;
}
export interface Room {chat?:Record<string,import('../game/room-chat').RoomMessage>;chatLast?:Record<string,number>;
  area?:import('../game/areas').AdventureArea;
  adventure?:import('../game/adventure-room').AdventureRoom;
  public?:boolean;
  id: string;
  host: string;
  mode: "race" | "coop";
  difficulty: "easy" | "medium" | "hard" | "extreme";
  seed: number;
  state: "lobby" | "playing" | "finished";
  createdAt: number;
  startsAt: number;
  players: Record<string, RoomPlayer>;
  winner: string | null;
  finishedAt: number | null;
  owners: Record<string, boolean>;
  expiresAt: number;
  revision: number;
  broken?: Record<string, boolean>;
}
export const multiplayerConfigured = () => !!rtdb;
let clockOffset = 0;
export const serverNow = () => Date.now() + clockOffset;
export async function roomAction(
  action: string,
  payload: Record<string, unknown>,
) {
  if (!auth?.currentUser) throw Error("Login required");
  const requestedAt=Date.now();
  const response = await fetch("/.netlify/functions/maze-room", {
    method: "POST",
    signal:AbortSignal.timeout(action==='move'?10000:20000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data=await serverJSON(response);
  if(action==='move'&&Date.now()-requestedAt>1200)console.debug('Movement confirmation timing',{roundTripMs:Date.now()-requestedAt,serverTiming:response.headers.get('Server-Timing')});
  if (typeof data.serverTime === "number")
    clockOffset = data.serverTime - (requestedAt+Date.now())/2;
  if (!response.ok) throw Error(`${data.error || "Room request failed"} (HTTP ${response.status})`);
  return data as { room: Room; playerKey: string;actionAccepted?:boolean;actionError?:string };
}
export function watchRoom(
  code: string,
  fn: (r: Room | null) => void,
  error: (e: Error) => void,
  self?:string,initial?:Room,
) {
  if (!rtdb) throw Error("Realtime Database unavailable");
  if(!self||!initial)return onValue(ref(rtdb, `mazeRooms/${code}`), (s) => fn(s.val()), error);
  // Subscribe to common metadata and our own simulation only. Peer simulations and the duplicate Co-op
  // world are server internals; requesting the root delivered them to every browser unnecessarily.
  let current=structuredClone(initial),closed=false,ready=false,pending:ReturnType<typeof setTimeout>|undefined;
  const emit=()=>{if(pending)clearTimeout(pending);pending=setTimeout(()=>{if(closed||!ready)return;const own=current.adventure?.states?.[self];if(!coherentRoom(current,self)||current.state==='playing'&&current.adventure&&!current.adventure.questSlots)return;fn(structuredClone(current));},0);};
  const off=[onValue(query(ref(rtdb,`mazeRooms/${code}`),orderByKey(),startAt('area')),s=>{const meta=s.val();if(!meta){fn(null);return;}if(meta.revision<(current.revision||0))return;current={...meta,...(current.adventure?{adventure:current.adventure}:{})};ready=true;emit();},error)];
  off.push(onValue(ref(rtdb,`mazeRooms/${code}/adventure/states/${self}`),s=>{if(!current.adventure||!s.val())return;const state=s.val(),old=current.adventure.states[self];if(old&&((state.worldVersion??0)<(old.worldVersion??0)||state.elapsed<old.elapsed||state.syncSeq!==undefined&&old.syncSeq!==undefined&&state.syncSeq<old.syncSeq))return;current.adventure.states={[self]:state};emit();},error));
  for(const field of ['map','questSlots','contributions']as const)off.push(onValue(ref(rtdb,`mazeRooms/${code}/adventure/${field}`),s=>{if(!current.adventure)return;(current.adventure as any)[field]=s.val();emit();},error));
  return()=>{closed=true;if(pending)clearTimeout(pending);off.forEach(stop=>stop());};
}
export async function roomPresence(code: string, key: string) {
  if (!rtdb) return () => Promise.resolve();
  const target = ref(rtdb, `mazePresence/${code}/${key}`);
  const { set } = await import("firebase/database");
  const dc = onDisconnect(target);
  await dc.set(false);
  await set(target, true);
  return async () => {
    await set(target, false);
    await dc.cancel();
  };
}

function realtimeVoiceTransport(code:string,self:string):VoiceTransport{
 if(!rtdb)throw Error('Realtime Database unavailable');const db=rtdb,own=ref(db,`mazeVoice/${code}/peers/${self}`),sent=new Set<string>();let session='';let stopPeers=()=>{},stopInbox=()=>{};return{
 async join(){const {set,remove}=await import('firebase/database');session=voiceNonce();await remove(ref(db,`mazeVoice/${code}/inbox/${self}`));await onDisconnect(own).remove();await set(own,{active:true,muted:true,talking:false,at:Date.now(),session});},
 async status(peer:VoicePeer){const{set}=await import('firebase/database');await set(own,{...peer,session});},
 async send(to:string,signal:VoiceSignal){const{set}=await import('firebase/database'),target=ref(db,`mazeVoice/${code}/inbox/${to}/${self}`);sent.add(to);await onDisconnect(target).remove();await set(target,signal);},
 listen(peers,signal,error){stopPeers=onValue(ref(db,`mazeVoice/${code}/peers`),s=>peers(s.val()||{}),error);stopInbox=onValue(ref(db,`mazeVoice/${code}/inbox/${self}`),s=>{for(const[from,value]of Object.entries(s.val()||{}))signal(from,value as VoiceSignal);},error);return()=>{stopPeers();stopInbox();};},
 async suspend(){stopPeers();stopInbox();await Promise.allSettled([onDisconnect(own).cancel(),...Array.from(sent,to=>onDisconnect(ref(db,`mazeVoice/${code}/inbox/${to}/${self}`)).cancel())]);},
 async close(){stopPeers();stopInbox();const{remove}=await import('firebase/database');await remove(own);await remove(ref(db,`mazeVoice/${code}/inbox/${self}`));for(const to of sent)await remove(ref(db,`mazeVoice/${code}/inbox/${to}/${self}`)).catch(()=>{});sent.clear();await onDisconnect(own).cancel();}
 };}
export async function getVoiceConfig(code:string,profileId:string):Promise<RTCConfiguration>{const value=await roomAction('voice-config',{code,profileId})as unknown as {iceServers:RTCIceServer[]};return{iceServers:value.iceServers};}

export function voiceTransport(code:string,self:string):VoiceTransport{const profileId=self.slice((auth?.currentUser?.uid.length||0)+1);return fallbackVoiceTransport(realtimeVoiceTransport(code,self),serverVoiceTransport((action,payload)=>roomAction(action,{...payload,code,profileId})));}
