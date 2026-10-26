import {ensureWallet} from './cosmetics';
import type {Appearance} from './cosmetics';
export interface ExpeditionRecord {coins:number;stars:number;chests:number;zones:number[]}
export interface LevelResult {
  seconds: number;
  stars: number;
  errors: number;
}
export interface Profile {wardrobeSchema?:1;wardrobe?:import('./cosmetics').WardrobeWallet;
  id: string;
  name: string;
  language: "id" | "en";
  outfit: string;
  appearance?:Appearance;
  adventures?:Record<string,ExpeditionRecord>;
  retro: Record<string, LevelResult>;
  modernWins: number;
  updatedAt: number;
}
export interface Family {
  active: string;
  profiles: Profile[];
}
const key = (uid: string) => `maze-hunter-family-v2:${uid}`;
export function emptyFamily(): Family {
  return { active: "", profiles: [] };
}
export function readFamily(uid: string): Family {
  try {
    const p = JSON.parse(localStorage.getItem(key(uid)) || "null");
    if (p && Array.isArray(p.profiles))
      return {
        active: typeof p.active === "string" ? p.active : "",
        profiles: p.profiles.filter(validProfile),
      };
  } catch {
    /* Recover corrupt local cache without changing the legacy save. */
  }
  return emptyFamily();
}
export function validProfile(p: unknown): p is Profile {
  if (!p || typeof p !== "object") return false;
  const q = p as Profile;
  return (
    typeof q.id === "string" &&
    typeof q.name === "string" &&
    ["id", "en"].includes(q.language) &&
    !!q.retro &&
    typeof q.retro === "object"
  );
}
export function writeFamily(uid: string, f: Family) {
  localStorage.setItem(key(uid), JSON.stringify(f));
}
export function newProfile(name: string, language: "id" | "en"): Profile {
  return {
    id: typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''),
    name: name.trim().slice(0, 24),
    language,
    outfit: "classic",
    wardrobeSchema:1,wardrobe:{version:1,legacy:[],purchases:[],pending:[],paid:{}},
    retro: {},
    modernWins: 0,
    updatedAt: Date.now(),
  };
}
export function mergeProfile(a: Profile, b: Profile): Profile {
  const out = {
    ...(a.updatedAt >= b.updatedAt ? a : b),
    retro: { ...a.retro },
    modernWins: Math.max(a.modernWins || 0, b.modernWins || 0),
  };
  for (const [id, r] of Object.entries(b.retro || {})) {
    const old = out.retro[id];
    out.retro[id] = old
      ? {
          stars: Math.max(old.stars, r.stars),
          seconds: Math.min(old.seconds, r.seconds),
          errors: Math.min(old.errors, r.errors),
        }
      : r;
  }
  out.adventures={...a.adventures};
  for(const [id,r]of Object.entries(b.adventures||{})){const old=out.adventures[id];out.adventures[id]=old?{coins:Math.max(old.coins,r.coins),stars:Math.max(old.stars,r.stars),chests:Math.max(old.chests,r.chests),zones:[...new Set([...old.zones,...r.zones])].sort()}:r;}
  const wa=ensureWallet(a),wb=ensureWallet(b);out.wardrobe={version:1,legacy:[...new Set([...wa.legacy,...wb.legacy])],purchases:[...new Set([...wa.purchases,...wb.purchases])],pending:[...new Set([...wa.pending,...wb.pending])].filter(k=>!wa.purchases.includes(k)&&!wb.purchases.includes(k)),paid:{...wa.paid,...wb.paid}};out.wardrobeSchema=1;
  return out;
}
export function unlocked(p: Profile) {
  let n = 1;
  while (n < 100 && p.retro[String(n)]) n++;
  return n;
}
export function recordLevel(p: Profile, id: number, r: LevelResult) {
  ensureWallet(p);
  const old = p.retro[String(id)];
  p.retro[String(id)] = old
    ? {
        stars: Math.max(old.stars, r.stars),
        seconds: Math.min(old.seconds, r.seconds),
        errors: Math.min(old.errors, r.errors),
      }
    : r;
  p.updatedAt = Date.now();
}

export function recordExpedition(p:Profile,id:string,r:ExpeditionRecord){const old=p.adventures?.[id];p.adventures??={};p.adventures[id]=old?{coins:Math.max(old.coins,r.coins),stars:Math.max(old.stars,r.stars),chests:Math.max(old.chests,r.chests),zones:[...new Set([...old.zones,...r.zones])].sort()}:r;p.updatedAt=Date.now();}
