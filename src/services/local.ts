import type {EquipmentArea} from '../game/expedition-equipment';
import {forestRankAfterWin, forestStages, type ForestStage,type ForestWorldDifficulty} from '../game/forest-progression';
import {ensureWallet} from './cosmetics';
import type {Appearance} from './cosmetics';
interface ExpeditionResult {coins:number;stars:number;chests:number;zones:number[];guardStars?:number}
export interface ExpeditionRecord extends ExpeditionResult {forestRank?:number;worlds?:Partial<Record<ForestWorldDifficulty,ExpeditionResult>>}
export interface LevelResult {
  seconds: number;
  stars: number;
  errors: number;
}
export interface Profile {knowledge?:{version:1;bestRewards:Record<string,number>;bonusByLevel:Record<string,number>};wardrobeSchema?:1;wardrobe?:import('./cosmetics').WardrobeWallet;
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
  out.knowledge=a.knowledge||b.knowledge;
  out.adventures={...a.adventures};
  for(const [id,r]of Object.entries(b.adventures||{})){const old=out.adventures[id];out.adventures[id]=old?mergeExpedition(old,r):r;}
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

const rankRecord=(area:EquipmentArea)=>`${area}-extreme-0`;

function validForestRank(rank?: number) {
 return Number.isInteger(rank) && rank! >= 0 && rank! <= forestStages.length ? rank! : 0;
}

function mergeExpeditionResult(old:ExpeditionResult,result:ExpeditionResult):ExpeditionResult{
 return {
  coins:Math.max(old.coins,result.coins),
  stars:Math.max(old.stars,result.stars),
  guardStars:Math.max(old.guardStars||0,result.guardStars||0),
  chests:Math.max(old.chests,result.chests),
  zones:[...new Set([...old.zones,...result.zones])].sort(),
 };
}

function mergeExpedition(old:ExpeditionRecord,result:ExpeditionRecord):ExpeditionRecord{
 const forestRank=Math.max(validForestRank(old.forestRank),validForestRank(result.forestRank));
 const worlds={...old.worlds};
 for(const mode of ['hard','extreme'] as const){
  const next=result.worlds?.[mode],previous=worlds[mode];
  if(next)worlds[mode]=previous?mergeExpeditionResult(previous,next):next;
 }
 return {...mergeExpeditionResult(old,result),...(forestRank?{forestRank}:{}),
  ...(Object.keys(worlds).length?{worlds}:{})};
}

export function recordExpandedExpedition(profile:Profile,area:EquipmentArea,mode:ForestWorldDifficulty,result:ExpeditionResult){
 recordExpedition(profile,rankRecord(area),{coins:0,stars:0,chests:0,zones:[],worlds:{[mode]:result}});
}

export function expeditionRank(profile: Profile,area:EquipmentArea) {
 return validForestRank(profile.adventures?.[rankRecord(area)]?.forestRank);
}
export function forestRank(profile: Profile) {
 return expeditionRank(profile,'forest');
}

export function recordExpeditionWin(profile: Profile, area:EquipmentArea,stage: ForestStage) {
 const rank = expeditionRank(profile,area), next = forestRankAfterWin(rank,stage);
 if(next === rank)return false;
 recordExpedition(profile,rankRecord(area),{coins:0,stars:0,chests:0,zones:[],forestRank:next});
 return true;
}

export function recordForestWin(profile:Profile,stage:ForestStage){
 return recordExpeditionWin(profile,'forest',stage);
}

export function recordExpedition(p:Profile,id:string,r:ExpeditionRecord){
 const old=p.adventures?.[id];
 p.adventures??={};
 p.adventures[id]=old?mergeExpedition(old,r):r;
 p.updatedAt=Date.now();
}

export function retroTotalStars(p:Profile){return Object.values(p.retro).reduce((n,r)=>n+Math.max(0,Math.min(3,r.stars||0)),0)+Object.entries(p.knowledge?.bestRewards||{}).reduce((n,[id,v])=>n+Math.max(0,Math.min(6,v||0)-Math.max(0,Math.min(3,p.retro[id]?.stars||0))),0);}
