export type LoginMode='retro'|'modern';
const key='mh-login-intent';
export function rememberLoginIntent(mode:LoginMode,storage:Storage=sessionStorage,now=Date.now()){storage.setItem(key,JSON.stringify({mode,at:now}));}
export function readLoginIntent(storage:Storage=sessionStorage,now=Date.now()):LoginMode|null{try{const v=JSON.parse(storage.getItem(key)||'null');if(!v||!['retro','modern'].includes(v.mode)||!Number.isFinite(v.at)||now-v.at>900000||v.at>now+10000)return null;return v.mode;}catch{return null;}}
export function clearLoginIntent(storage:Storage=sessionStorage){storage.removeItem(key);}
