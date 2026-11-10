import {courseDanger} from './platform-course';
import type {AdventureLayout} from './adventure-layout';
const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
/** Shared by renderer and authoritative movement: no decorative floating bridge. */
export function gorgeLandmarks(layout:AdventureLayout){
 const c=layout.forest!.cave;
 return {river:{x:c.x+.5,y:c.y+.5},bridge:{x:c.x+.5,y:c.y+2.5},terrace:layout.forest!.highland,arch:layout.forest!.cabin};
}
export function gorgeBank(x:number,z:number,layout:AdventureLayout){
 const h=layout.forest!.highland,f=layout.fortress,s=layout.maze.start;
 const d=Math.hypot(x-h.x-.5,z-h.y-.5),terrace=(1-smooth(4,7,d))*.42+(1-smooth(9,12,d))*.29+(1-smooth(14,17,d))*.29;
 const arena=1-smooth(7,15,Math.hypot(x-f.x-.5,z-f.y-.5));
 const entry=1-smooth(2,9,Math.hypot(x-s.x-.5,z-s.y-.5));
 return terrace*3.1+arena*1.5+entry*.8+Math.sin(x*.085)*Math.cos(z*.075)*.18;
}
export function gorgeRiver(x:number,z:number,layout:AdventureLayout){
 const {river:r,bridge:b}=gorgeLandmarks(layout);
 const along=1-smooth(2.4,3.15,Math.abs(z-r.y)),across=1-smooth(.42,1.15,Math.abs(x-r.x-Math.sin((z-r.y)*.9)*.18));
 const bridge=1-smooth(.43,.68,Math.abs(z-b.y));
 return {wet:along*across*(1-bridge),bridge:along*across*bridge};
}
export function bridgeFallZone(x:number,z:number,layout:AdventureLayout){const b=gorgeLandmarks(layout).bridge;return Math.abs(x-b.x)<1.65&&Math.abs(z-b.y)>.47&&Math.abs(z-b.y)<1.4;}
export function gorgeElevation(x:number,z:number,layout:AdventureLayout){return gorgeBank(x,z,layout)-(courseDanger(layout,'gorge',x,z)?6:0)-gorgeRiver(x,z,layout).wet*.74-(bridgeFallZone(x,z,layout)?4.5:0);}
/** Continuous summit silhouette; neighboring wall faces use exactly the same corner height. */
export function gorgeCliffTop(x:number,z:number,layout:AdventureLayout){return gorgeBank(x,z,layout)+7.7+Math.sin(x*.24+z*.12)*1.0+Math.cos(z*.31-x*.08)*.7;}
