import type {GamePreferences} from '../services/preferences';

/** JOB 1B UI15 — movement input only.
 * Adventure always uses a dynamic floating joystick. This module never owns action-pad geometry. */
export function bindJoystick(root:HTMLElement,game:{joystick:{x:number;y:number};beginMovement?:()=>void;endMovement?:()=>void},prefs:GamePreferences) {
 const stick=root.querySelector<HTMLElement>('#joystick')!,knob=root.querySelector<HTMLElement>('#stick')!;
 const controller=new AbortController(),signal=controller.signal;
 const adventure=root.classList.contains('adventure-pad');
 const floating=adventure||prefs.joystick==='floating';
 const size=104*prefs.controlScale;
 const bottom=()=>Math.min(prefs.bottom,root.clientHeight*.18);
 stick.style.width=`${size}px`;stick.style.height=`${size}px`;
 if(!floating){stick.style.left=`max(${prefs.left}px,env(safe-area-inset-left))`;stick.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;}
 let pointer:number|null=null,origin={x:0,y:0};
 const setCenter=(clientX:number,clientY:number)=>{
  const r=root.getBoundingClientRect();
  const minX=r.left+size/2+8,maxX=r.left+r.width*.52-size/2;
  const minY=r.top+r.height*.38+size/2,maxY=r.bottom-size/2-8;
  const x=Math.max(minX,Math.min(maxX,clientX)),y=Math.max(minY,Math.min(maxY,clientY));
  stick.style.left=`${x-r.left-size/2}px`;stick.style.top=`${y-r.top-size/2}px`;stick.style.bottom='auto';
  origin={x,y};
 };
 const reset=()=>{pointer=null;game.endMovement?.();game.joystick={x:0,y:0};knob.style.transform='';stick.classList.remove('active');if(floating){stick.style.left='';stick.style.top='';stick.style.bottom='';}};
 const control=(e:PointerEvent)=>{
  let dx=e.clientX-origin.x,dy=e.clientY-origin.y;const leash=size*.42,d=Math.hypot(dx,dy);
  if(floating&&d>leash){const excess=d-leash,shift=Math.min(size*.18,excess*.45),ux=dx/(d||1),uy=dy/(d||1);setCenter(origin.x+ux*shift,origin.y+uy*shift);dx=e.clientX-origin.x;dy=e.clientY-origin.y;}
  const nx=dx/(size*.32),ny=dy/(size*.32),length=Math.hypot(nx,ny),n=Math.max(1,length);
  game.joystick=length<.12?{x:0,y:0}:{x:nx/n,y:ny/n};
  knob.style.transform=`translate(${nx/n*size*.26}px,${ny/n*size*.26}px)`;
 };
 root.addEventListener('pointerdown',e=>{
  if(pointer!==null)return;const target=e.target as HTMLElement;
  if(target.closest('button,input,#game-overlay,.minimap-panel,[role=dialog]'))return;
  const r=root.getBoundingClientRect();
  if(!floating&&!target.closest('#joystick'))return;
  if(floating&&(e.clientX>r.left+r.width*.52||e.clientY<r.top+r.height*.34))return;
  e.preventDefault();pointer=e.pointerId;game.beginMovement?.();stick.classList.add('active');
  if(floating)setCenter(e.clientX,e.clientY);else{const bounds=stick.getBoundingClientRect();origin={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};}
  root.setPointerCapture(pointer);control(e);
 },{signal});
 root.addEventListener('pointermove',e=>{if(pointer===e.pointerId)control(e);},{signal});
 for(const name of ['pointerup','pointercancel','lostpointercapture'] as const)root.addEventListener(name,e=>{if(pointer===e.pointerId)reset();},{signal});
 window.addEventListener('blur',reset,{signal});
 let lastWidth=root.clientWidth,lastHeight=root.clientHeight;
 window.addEventListener('resize',()=>{const major=Math.abs(root.clientWidth-lastWidth)>4||Math.abs(root.clientHeight-lastHeight)>80;lastWidth=root.clientWidth;lastHeight=root.clientHeight;if(!major)return;reset();if(!floating){stick.style.top='';stick.style.left=`max(${prefs.left}px,env(safe-area-inset-left))`;stick.style.bottom=`max(${bottom()}px,env(safe-area-inset-bottom))`;}},{signal});
 return()=>{controller.abort();reset();};
}
