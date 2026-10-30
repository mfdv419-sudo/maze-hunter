import type {GamePreferences} from '../services/preferences';
export function bindJoystick(root:HTMLElement,game:{joystick:{x:number;y:number};beginMovement?:()=>void;endMovement?:()=>void},prefs:GamePreferences) {
 const stick=root.querySelector<HTMLElement>('#joystick')!,knob=root.querySelector<HTMLElement>('#stick')!;
 const controller=new AbortController(),signal=controller.signal;
 const size=104*prefs.controlScale;
 const bottom=()=>Math.min(prefs.bottom,root.clientHeight*.18);
 const actions=root.querySelector<HTMLElement>('.action-controls');if(actions){actions.style.transform=`scale(${prefs.controlScale})`;actions.style.transformOrigin='right bottom';actions.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;}
 stick.style.width=`${size}px`;stick.style.height=`${size}px`;
 stick.style.left=`max(${prefs.left}px,env(safe-area-inset-left))`;stick.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;
 let pointer:number|null=null,origin={x:0,y:0};
 const reset=()=>{pointer=null;game.endMovement?.();game.joystick={x:0,y:0};knob.style.transform='';};
 const control=(e:PointerEvent)=>{const dx=(e.clientX-origin.x)/(size*.32),dy=(e.clientY-origin.y)/(size*.32),length=Math.hypot(dx,dy),n=Math.max(1,length);
 game.joystick=length<.12?{x:0,y:0}:{x:dx/n,y:dy/n};knob.style.transform=`translate(${dx/n*size*.26}px,${dy/n*size*.26}px)`;};
 root.addEventListener('pointerdown',e=>{
  if(pointer!==null)return;
  const target=e.target as HTMLElement;
  if(target.closest('button,input,#game-overlay,.minimap-panel'))return;
  const r=root.getBoundingClientRect();
  if(prefs.joystick==='fixed'&&!target.closest('#joystick'))return;
  if(prefs.joystick==='floating'&&(e.clientX>r.left+r.width*.45||e.clientY<r.top+r.height*.42))return;
  e.preventDefault();pointer=e.pointerId;game.beginMovement?.();
  if(prefs.joystick==='floating'){
   const x=Math.max(r.left+size/2+8,Math.min(r.left+r.width*.45-size/2,e.clientX)),y=Math.max(r.top+size/2+8,Math.min(r.bottom-size/2-8,e.clientY));
   stick.style.left=`${x-r.left-size/2}px`;stick.style.top=`${y-r.top-size/2}px`;stick.style.bottom='auto';
  }
  const bounds=stick.getBoundingClientRect();origin={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};
  root.setPointerCapture(pointer);control(e);
 },{signal});
 root.addEventListener('pointermove',e=>{if(pointer===e.pointerId)control(e);},{signal});
 for(const name of ['pointerup','pointercancel','lostpointercapture'] as const)root.addEventListener(name,e=>{if(pointer===e.pointerId)reset();},{signal});
 window.addEventListener('blur',reset,{signal});window.addEventListener('resize',()=>{reset();stick.style.top='';stick.style.left=`max(${prefs.left}px,env(safe-area-inset-left))`;stick.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;if(actions)actions.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;},{signal});
 return()=>{controller.abort();reset();};
}
