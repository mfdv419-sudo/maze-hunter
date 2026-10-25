export interface GamePreferences {fur:'charcoal'|'brown'|'silver';joystick:'fixed'|'floating';controlScale:number;left:number;bottom:number;camera:'follow'|'overview'|'level'}
export const furColors={charcoal:0x343c45,brown:0x756052,silver:0x6b7c80};
const defaults:GamePreferences={fur:'charcoal',joystick:'fixed',controlScale:1,left:44,bottom:140,camera:'follow'};
export function readPreferences():GamePreferences {
 try{const p=JSON.parse(localStorage.getItem('mh-game-preferences')||'null');if(!p)return{...defaults};return{fur:['charcoal','brown','silver'].includes(p.fur)?p.fur:'charcoal',joystick:p.joystick==='floating'?'floating':'fixed',controlScale:Math.max(.8,Math.min(1.25,Number(p.controlScale)||1)),left:Math.max(10,Math.min(90,Number(p.left)||44)),bottom:Math.max(35,Math.min(180,(p.controlsVersion!==2&&p.bottom===24?140:Number(p.bottom))||140)),camera:p.camera==='overview'?'overview':p.camera==='level'?'level':'follow'};}catch{return{...defaults};}
}
export function writePreferences(p:GamePreferences){localStorage.setItem('mh-game-preferences',JSON.stringify({...p,controlsVersion:2}));}
