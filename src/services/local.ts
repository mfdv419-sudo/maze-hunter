export interface LevelResult {
  seconds: number;
  stars: number;
  errors: number;
}
export interface Profile {
  id: string;
  name: string;
  language: "id" | "en";
  outfit: string;
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
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 24),
    language,
    outfit: "classic",
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
  return out;
}
export function unlocked(p: Profile) {
  let n = 1;
  while (n < 100 && p.retro[String(n)]) n++;
  return n;
}
export function recordLevel(p: Profile, id: number, r: LevelResult) {
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
