import {forestIcon} from './forest-icons';
import type {ModernGame} from '../game/modern';
import type {AdventureState} from '../game/adventure-state';

/** Shared four-button Adventure layout. Pilot retains its specialized forest HUD and
 * uses the same CSS geometry; other Adventure areas get the same action palette. */
export function mountAdventureActionPad(root:HTMLElement,game:ModernGame,en:boolean){
 const actions=root.querySelector<HTMLElement>('.action-controls');
 if(!actions)return {update:(_state:AdventureState)=>{},dispose:()=>{}};
 const abort=new AbortController();
 const text=(id:string,english:string)=>en?english:id;
 const hit=actions.querySelector<HTMLButtonElement>('#hit-action');
 const jump=actions.querySelector<HTMLButtonElement>('#jump-action');
 if(hit)hit.innerHTML=forestIcon('cake');
 if(jump)jump.innerHTML=forestIcon('jump');
 const make=(name:string,icon:string,run:()=>void)=>{const b=document.createElement('button');b.type='button';b.className='action-button';b.title=name;b.setAttribute('aria-label',name);b.innerHTML=forestIcon(icon);b.addEventListener('click',run,{signal:abort.signal});actions.append(b);return b;};
 let selected:'cake'|'chili'|'spinach'|'watermelon'='cake';
 const bar=document.createElement('div');bar.className='adventure-action-select';bar.hidden=true;bar.setAttribute('aria-label',text('Pilih kemampuan','Select ability'));root.append(bar);
 const ability=make(text('Pilih kemampuan','Choose ability'),'ability',()=>{bar.hidden=!bar.hidden;ability.setAttribute('aria-expanded',String(!bar.hidden));});ability.classList.add('forest-ability');ability.setAttribute('aria-expanded','false');
 const merge=make(text('Gabung kue dan cabai','Merge cake and chili'),'merge',()=>{if(game.useAction('craft-grenade'))game.selectWeapon('grenade');});merge.classList.add('forest-merge');
 for(const kind of ['cake','chili','spinach','watermelon'] as const){const b=document.createElement('button');b.type='button';b.innerHTML=forestIcon(kind);b.title=kind;b.setAttribute('aria-label',kind);b.dataset.ability=kind;b.addEventListener('click',()=>{if(game.selectWeapon(kind)){selected=kind;bar.hidden=true;ability.setAttribute('aria-expanded','false');}},{signal:abort.signal});bar.append(b);}
 hit?.addEventListener('pointerdown',e=>{const s=game.adventure;if(!s?.swimming)return;e.preventDefault();e.stopImmediatePropagation();game.useAction('dive');},{capture:true,signal:abort.signal});
 window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.repeat||game.paused||(e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable=true]'))return;if(k==='x')merge.click();if(k==='c')ability.click();if(['1','2','3','4'].includes(k))bar.querySelectorAll<HTMLButtonElement>('button')[Number(k)-1]?.click();},{signal:abort.signal});
 return {
  update(s:AdventureState){
   selected=game.equippedWeapon==='grenade'?selected:game.equippedWeapon;
   if(hit){const icon=s.swimming?'dive':selected;if(hit.dataset.icon!==icon){hit.dataset.icon=icon;hit.innerHTML=forestIcon(icon);}hit.setAttribute('aria-label',s.swimming?text('Selam','Dive'):text('Aksi','Action'));}
   jump?.setAttribute('aria-label',s.swimming?text('Ke permukaan','Surface'):text('Lompat','Jump'));
   merge.disabled=s.ammo<1||s.supplies.chili<1;
   for(const b of bar.querySelectorAll<HTMLButtonElement>('[data-ability]')){const kind=b.dataset.ability as typeof selected;b.disabled=kind==='cake'?s.ammo<1:s.supplies[kind]<=0;b.setAttribute('aria-pressed',String(kind===selected));}
  },
  dispose(){abort.abort();bar.remove();merge.remove();ability.remove();}
 };
}
