import type {Ledge} from './climbing';
import type {Point} from './maze';
/** Saved support height is authoritative; bounce is deterministic presentation only. */
export interface RestingRock extends Point {elevation?:number;landedAt?:number}
export function rockBounce(age:number){if(age<0||age>=.9)return 0;return Math.abs(Math.sin(age/.3*Math.PI))*.28*Math.exp(-age*3.6);}
export function rockSurface(sample:(x:number,y:number)=>number,p:Point){let top=-Infinity;for(const dx of[-.45,0,.45])for(const dy of[-.45,0,.45])top=Math.max(top,sample(p.x+dx,p.y+dy));return top+.025;}
export function rockSupport(p:Point,rocks:Record<string,RestingRock>,moves:Record<string,Point&{elevation?:number;holder?:string}>={},ignore?:string,ledges:readonly Ledge[]=[]){let top=0;for(const l of ledges){const moved=moves[String(l.id)];if(moved?.holder)continue;const center=moved||{x:l.point.x+.5,y:l.point.y+.5};if(Math.abs(p.x-center.x)<(l.width||.94)/2+.25&&Math.abs(p.y-center.y)<(l.depth||.94)/2+.25)top=Math.max(top,l.height+(moved?.elevation||0));}for(const[id,origin]of Object.entries(rocks)){if(id===ignore||moves[id]?.holder)continue;const q=moves[id]||origin;if(Math.hypot(p.x-q.x,p.y-q.y)<.65)top=Math.max(top,(q.elevation||0)+.8);}return top;}
