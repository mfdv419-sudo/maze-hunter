let serial=0;
/** Routing stays synchronous, preserving popup gestures and event binding. */
export function mazeTransition(root:HTMLElement,previous:string,next:string){
 document.getElementById('maze-transition')?.remove();
 if(!previous||previous===next||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const id=++serial,overlay=document.createElement('div');overlay.id='maze-transition';overlay.className='maze-transition';overlay.setAttribute('aria-hidden','true');overlay.dataset.from=previous;overlay.dataset.to=next;
 const ghost=root.cloneNode(true)as HTMLElement;ghost.removeAttribute('id');ghost.className+=' transition-ghost';ghost.inert=true;
 const originals=root.querySelectorAll('canvas'),copies=ghost.querySelectorAll('canvas');copies.forEach((canvas,i)=>{try{canvas.getContext('2d')?.drawImage(originals[i],0,0);}catch{}});ghost.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));overlay.append(ghost);
 overlay.insertAdjacentHTML('beforeend','<div class="maze-shutter shutter-left"></div><div class="maze-shutter shutter-right"></div><svg class="transition-emblem" viewBox="0 0 100 100"><path class="emblem-wall" d="M10 10h80v80H10V10m16 0v28h30V24h18v38H44v28M10 56h18v18m62 0H62M44 10v12"/><path class="emblem-trail" d="M17 83V47h47V33h18v40H53v10"/></svg>');
 document.body.append(overlay);
 const finish=()=>{if(id!==serial)return;ghost.remove();overlay.classList.add('opening');root.animate([{opacity:.7,transform:'scale(.99)'},{opacity:1,transform:'scale(1)'}],{duration:300,easing:'ease-out'});setTimeout(()=>overlay.remove(),350);};
 const observer=new MutationObserver(()=>{if(root.querySelector('canvas')){observer.disconnect();setTimeout(finish,60);}});
 setTimeout(()=>{ghost.remove();if((next==='modern'||next==='retro')&&!root.querySelector('canvas'))observer.observe(root,{childList:true,subtree:true});else finish();},200);
 setTimeout(()=>{observer.disconnect();if(overlay.isConnected&&!overlay.classList.contains('opening'))finish();},2200);
}
