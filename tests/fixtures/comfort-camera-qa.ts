import {ModernGame} from '../../src/game/modern';
import {lookDelta} from '../../src/game/comfort-camera';
const result=document.querySelector('#result')!,stage=document.querySelector('#stage')!;
document.querySelector('#run')!.addEventListener('click',async()=>{
 const output:string[]=[];let count=0;
 const check=(ok:boolean,message:string)=>{if(!ok)throw Error(message);count++;};
 try{for(const [width,height]of[[844,390],[1024,768],[1440,900]])for(const online of[false,true]){
  const host=document.createElement('div');host.style.cssText=`position:relative;width:${width}px;height:${height}px;touch-action:none`;stage.append(host);
  const g:any=new ModernGame(host,{area:'sea',difficulty:'easy',adventureMap:0,seed:52,entrance:0,outfit:'classic',online,selfKey:'qa',onTick:()=>{},onFinish:()=>{}});
  try{g.adventure.invulnerableUntil=10000;g.adventure.guards.forEach((x:any)=>x.dead=true);g.setPaused(true);const render=g.renderer.render.bind(g.renderer);g.renderer.render=()=>{};let tick=performance.now();const frames=(n:number)=>{for(let i=0;i<n;i++)g.frame(tick+=16);};frames(3);
   check(g.camera.fov===60,'FOV');check(Math.abs(g.desiredPitch-18*Math.PI/180)<.001,'default pitch');const old=g.desiredCameraYaw;
   const box=host.getBoundingClientRect(),x=box.left+width*.65,y=box.top+height*.5;
   g.setPaused(false);g.joystick.y=-.7;
   host.dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,pointerType:'touch',clientX:x,clientY:y,bubbles:true,cancelable:true}));
   for(let i=1;i<=6;i++){host.dispatchEvent(new PointerEvent('pointermove',{pointerId:2,pointerType:'touch',clientX:x+i*6,clientY:y+i,bubbles:true,cancelable:true}));frames(1);}
   host.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,pointerType:'touch',bubbles:true}));check(g.lookPointer===2,'joystick release must retain camera pointer');
   check(Math.abs(g.desiredCameraYaw-old-lookDelta(36,6,width,height).yaw)<.001,'touch yaw');check(g.desiredPitch<.5,'touch/render pitch isolation');
   host.dispatchEvent(new PointerEvent('pointerup',{pointerId:2,pointerType:'touch',bubbles:true}));g.joystick.y=0;g.setPaused(true);
   g.desiredPitch=Infinity;g.desiredCameraYaw=NaN;frames(2);check(g.camera.position.toArray().every(Number.isFinite),'finite camera');
   g.resetCamera();frames(50);check(Math.abs(g.cameraPitch-18*Math.PI/180)<.001,'reset camera');render(g.scene,g.camera);check(g.renderer.getContext().getError()===0,'WebGL error');
   output.push(`PASS ${width}×${height} ${online?'ONLINE fixture':'SOLO'}: drag + movement, pointer ownership, reset, finite view, WebGL`);
  }finally{g.dispose();host.remove();}
  result.textContent=output.join('\n');await new Promise(r=>setTimeout(r,0));
 }result.textContent=`PASS ${count} assertions\n`+output.join('\n');}catch(e){result.textContent=`FAIL ${e}\n`+output.join('\n');}
});
