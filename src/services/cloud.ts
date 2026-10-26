import {permittedAppearance} from './cosmetics';
import { initializeApp } from "firebase/app";
import { firebaseWebConfig } from "./firebase-web-config";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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
import { getDatabase, ref, onValue, onDisconnect } from "firebase/database";
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
      authDomain: config.authDomain,
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
let pendingLogin: Promise<unknown> | null = null;
// Only public identifiers and coarse status; never expose UID, email, API key, or tokens.
export function loginContext() {
  return {
    project: config.projectId,
    authDomain: config.authDomain,
    origin: location.origin,
    method: "Google popup",
    signedIn: !!auth?.currentUser,
  };
}
export async function login() {
  if (!auth)
    throw Error("Firebase belum dikonfigurasi / Firebase is not configured");
  if (pendingLogin) return pendingLogin;
  pendingLogin = signInWithPopup(auth, new GoogleAuthProvider());
  try { await pendingLogin; }
  finally { pendingLogin = null; }
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
  const response = await fetch("/.netlify/functions/maze-room", {
    method: "POST",
    signal:AbortSignal.timeout(20000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data=await serverJSON(response);
  if (typeof data.serverTime === "number")
    clockOffset = data.serverTime - Date.now();
  if (!response.ok) throw Error(`${data.error || "Room request failed"} (HTTP ${response.status})`);
  return data as { room: Room; playerKey: string };
}
export function watchRoom(
  code: string,
  fn: (r: Room | null) => void,
  error: (e: Error) => void,
) {
  if (!rtdb) throw Error("Realtime Database unavailable");
  return onValue(ref(rtdb, `mazeRooms/${code}`), (s) => fn(s.val()), error);
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
