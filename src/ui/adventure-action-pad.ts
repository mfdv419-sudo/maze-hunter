import {forestIcon} from './forest-icons';
import type {ModernGame} from '../game/modern';
import type {AdventureState} from '../game/adventure-state';

type AbilityKind='cake'|'chili'|'spinach'|'watermelon';
const abilities:AbilityKind[]=['cake','chili','spinach','watermelon'];

/** JOB 1 UI13: the only Adventure action-pad controller.
 * Four buttons only: Jump, Context Action, Ability, Merge. No floating selector. */
export function mountAdventureActionPad(root:HTMLElement,game:ModernGame,en:boolean){
 const actions=root.querySelector<HTMLElement>('.action-controls');
 if(!actions)return {update:(_state:AdventureState)=>{},dispose:()=>{}};
 const abort=new AbortController();
 const text=(id:string,english:string)=>en?english:id;
 const hit=actions.querySelector<HTMLButtonElement>('#hit-action');
 const jump=actions.querySelector<HTMLButtonElement>('#jump-action');
 if(hit){hit.classList.add('forest-action');hit.innerHTML=forestIcon('throw');}
 if(jump){jump.classList.add('forest-jump');jump.innerHTML=forestIcon('jump');}
 const make=(name:string,icon:string,run:()=>void)=>{const b=document.createElement('button');b.type='button';b.className='action-button';b.title=name;b.setAttribute('aria-label',name);b.innerHTML=forestIcon(icon);b.addEventListener('click',run,{signal:abort.signal});actions.append(b);return b;};
 let selected:AbilityKind='cake',lastState:AdventureState|undefined;
 const available=(s:AdventureState,k:AbilityKind)=>k==='cake'?s.ammo>0:s.supplies[k]>0;
 const select=(kind:AbilityKind)=>{if(game.selectWeapon(kind)){selected=kind;ability.dataset.ability=kind;ability.innerHTML=forestIcon('ability');ability.title=text('Kemampuan aktif: ','Active ability: ')+kind;ability.setAttribute('aria-label',ability.title);return true;}return false;};
 const ability=make(text('Ganti kemampuan','Cycle ability'),'ability',()=>{const s=lastState||game.adventure;if(!s)return;const from=Math.max(0,abilities.indexOf(selected));for(let step=1;step<=abilities.length;step++){const k=abilities[(from+step)%abilities.length];if(available(s,k)&&select(k))break;}});ability.classList.add('forest-ability');ability.dataset.ability=selected;
 const merge=make(text('Gabung kue dan cabai','Merge cake and chili'),'merge',()=>{if(game.useAction('craft-grenade'))game.selectWeapon('grenade');});merge.classList.add('forest-merge');
 hit?.addEventListener('pointerdown',e=>{const s=game.adventure;if(!s?.swimming)return;e.preventDefault();e.stopImmediatePropagation();game.useAction('dive');},{capture:true,signal:abort.signal});
 window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.repeat||game.paused||(e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable=true]'))return;if(k==='x')merge.click();if(k==='c')ability.click();if(['1','2','3','4'].includes(k)){const next=abilities[Number(k)-1];if(lastState&&available(lastState,next))select(next);}},{signal:abort.signal});
 return {
  update(s:AdventureState){
   lastState=s;
   if(game.equippedWeapon!=='grenade'&&abilities.includes(game.equippedWeapon as AbilityKind))selected=game.equippedWeapon as AbilityKind;
   ability.dataset.ability=selected;ability.innerHTML=forestIcon('ability');ability.disabled=!abilities.some(k=>available(s,k));
   if(hit){const site=s.nearbyForestSite,icon=site?.npc?.role==='merchant'?'shop':site?.npc?'talk':site?'ability':s.carried?'throw':s.swimming?'dive':'throw';if(hit.dataset.icon!==icon){hit.dataset.icon=icon;hit.innerHTML=forestIcon(icon);}hit.setAttribute('aria-label',site?.npc?.role==='merchant'?text('Buka toko','Open shop'):site?.npc?text('Bicara','Talk'):s.swimming?text('Selam','Dive'):text('Aksi / lempar','Action / throw'));}
   jump?.setAttribute('aria-label',s.swimming?text('Ke permukaan','Surface'):text('Lompat','Jump'));
   merge.disabled=s.ammo<1||s.supplies.chili<1;
  },
  dispose(){abort.abort();merge.remove();ability.remove();}
 };
}
