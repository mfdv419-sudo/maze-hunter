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
  return snaps.docs.map((d) => d.data()).filter(validProfile);
}
export async function syncProfile(uid: string, p: Profile) {
  if (!db) throw Error("Cloud unavailable");
  const target = doc(db, "families", uid, "profiles", p.id);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(target),
      old = snap.data();
    const merged = validProfile(old) ? mergeProfile(p, old) : p;
    tx.set(target, merged);
    return merged;
  });
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
  ready: boolean;
  online: boolean;
  x: number;
  y: number;
  angle: number;
  lastMove: number;
  seq: number;
  finishedAt: number | null;
  slot: number;
  jumpAt?: number;
  hitAt?: number;
}
export interface Room {
  id: string;
  host: string;
  mode: "race" | "coop";
  difficulty: "medium" | "hard" | "extreme";
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (typeof data.serverTime === "number")
    clockOffset = data.serverTime - Date.now();
  if (!response.ok) throw Error(data.error || "Room request failed");
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
