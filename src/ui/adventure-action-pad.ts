import {cakeKinds, cakeNames, type CakeKind} from '../game/cake-powers';
import {weaponLabels, type EquippedWeapon} from '../game/weapon-shots';
import {forestIcon} from './forest-icons';
import type {ModernGame} from '../game/modern';
import type {AdventureState} from '../game/adventure-state';

const abilities = ['cake', 'chili', 'spinach', 'watermelon', 'grenade'] as const;

export function mountAdventureActionPad(root: HTMLElement, game: ModernGame, en: boolean) {
 const actions = root.querySelector<HTMLElement>('.action-controls');
 if (!actions) return {update: (_state: AdventureState) => {}, dispose: () => {}};

 const abort = new AbortController();
 const {signal} = abort;
 const text = (id: string, english: string) => en ? english : id;
 const language = en ? 1 : 0;
 const stage = root.querySelector<HTMLElement>('#game-stage');
 const hit = actions.querySelector<HTMLButtonElement>('#hit-action');
 const jump = actions.querySelector<HTMLButtonElement>('#jump-action');
 if (hit) {
  hit.classList.add('forest-action');
  hit.innerHTML = forestIcon('throw');
 }
 if (jump) {
  jump.classList.add('forest-jump');
  jump.innerHTML = forestIcon('jump');
 }

 const makeButton = (label: string, artwork: string, run: () => void) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.innerHTML = artwork;
  button.addEventListener('click', run, {signal});
  return button;
 };

 const tray = document.createElement('section');
 tray.id = 'adventure-ability-tray';
 tray.className = 'adventure-ability-tray';
 tray.setAttribute('role', 'group');
 tray.setAttribute('aria-label', text('Pilihan kemampuan', 'Ability selection'));
 tray.hidden = true;
 root.append(tray);

 const abilitiesRow = document.createElement('div');
 abilitiesRow.className = 'ability-slots';
 const cakesRow = document.createElement('div');
 cakesRow.className = 'ability-slots';
 cakesRow.hidden = true;
 const objectRow = document.createElement('div');
 objectRow.className = 'ability-object-actions';
 objectRow.hidden = true;
 tray.append(abilitiesRow, cakesRow, objectRow);

 let lastState = game.adventure;
 const blocked = () => game.paused || game.ended || lastState?.phase !== 'playing' ||
  !!lastState.awakening || !!root.querySelector('.minimap-panel.expanded, .forest-dialog') ||
  !!document.getElementById('maze-transition') || stage?.dataset.orientationBlocked === 'true';
 const stock = (state: AdventureState, kind: EquippedWeapon) => kind === 'cake' ? state.ammo : state.supplies[kind];
 const cakeStock = (state: AdventureState, kind: CakeKind) =>
  kind === 'normal' ? state.ammo : Math.min(state.ammo, state.cakeStock[kind]);

 const setCakeRow = (show: boolean) => {
  abilitiesRow.hidden = show;
  cakesRow.hidden = !show;
 };
 const close = (restoreFocus = false) => {
  if (tray.hidden) return;
  tray.hidden = true;
  ability.setAttribute('aria-expanded', 'false');
  setCakeRow(false);
  if (restoreFocus) ability.focus();
 };
 const focusSlot = (row: HTMLElement) => {
  (row.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:enabled') ||
   row.querySelector<HTMLButtonElement>('button:enabled'))?.focus();
 };
 const open = () => {
  if (!lastState || blocked()) return;
  if (stage && document.pointerLockElement === stage) document.exitPointerLock();
  updateTray(lastState);
  tray.hidden = false;
  ability.setAttribute('aria-expanded', 'true');
  focusSlot(abilitiesRow);
 };

 const ability = makeButton(text('Pilih kemampuan', 'Choose ability'), forestIcon('ability'), () => {
  if (tray.hidden) open();
  else close(true);
 });
 ability.classList.add('action-button', 'forest-ability');
 ability.setAttribute('aria-controls', tray.id);
 ability.setAttribute('aria-expanded', 'false');

 const merge = makeButton(text('Gabung kue dan cabai', 'Merge cake and chili'), forestIcon('merge'), () => {
  if (game.useAction('craft-grenade')) game.selectWeapon('grenade');
 });
 merge.classList.add('action-button', 'forest-merge');
 actions.append(ability, merge);

 const makeSlot = (row: HTMLElement, label: string, icon: string, run: () => void) => {
  const button = makeButton(label, forestIcon(icon), run);
  button.className = 'ability-slot';
  const count = document.createElement('span');
  count.className = 'ability-stock';
  count.setAttribute('aria-hidden', 'true');
  button.append(count);
  row.append(button);
  return {button, count, label};
 };
 const abilitySlots = abilities.map(kind => {
  const slot = makeSlot(abilitiesRow, weaponLabels[kind][language], kind, () => {
   if (blocked() || !game.selectWeapon(kind)) return;
   if (kind !== 'cake') {
    close(true);
    return;
   }
   setCakeRow(true);
   focusSlot(cakesRow);
  });
  slot.button.dataset.abilityChoice = kind;
  return {kind, ...slot};
 });

 const areaWeapon=game.adventure?.expeditionWeapon;
 const expeditionSlot=areaWeapon?makeSlot(abilitiesRow,areaWeapon.name[language],'throw',()=>{
  if(!blocked()&&game.fireExpeditionWeapon())close(true);
 }):undefined;
 if(expeditionSlot)expeditionSlot.button.dataset.expeditionWeapon=areaWeapon!.id;

 const back = makeButton(text('Kembali ke kemampuan', 'Back to abilities'), '‹', () => {
  setCakeRow(false);
  abilitySlots[0].button.focus();
 });
 back.className = 'ability-slot';
 cakesRow.append(back);
 const cakeSlots = cakeKinds.map(kind => {
  const slot = makeSlot(cakesRow, cakeNames[kind][language], 'cake', () => {
   if (!blocked() && game.chooseCake(kind)) close(true);
  });
  slot.button.dataset.cake = kind;
  return {kind, ...slot};
 });

 const objectActions = [
  ['lift', text('Angkat', 'Lift')],
  ['place', text('Taruh', 'Place')],
  ['throw-object', text('Lempar objek', 'Throw object')],
 ] as const;
 const [lift, place, throwObject] = objectActions.map(([kind, label]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', () => {
   if (!blocked() && game.useAction(kind)) close(true);
  }, {signal});
  objectRow.append(button);
  return button;
 });

 function updateSlot(slot: ReturnType<typeof makeSlot>, quantity: number, active: boolean) {
  const count = String(quantity);
  if (slot.count.textContent !== count) {
   slot.count.textContent = count;
   slot.button.setAttribute('aria-label', slot.label + ', ' + count);
  }
  slot.button.disabled = quantity <= 0;
  slot.button.setAttribute('aria-pressed', String(active));
 }

 function updateTray(state: AdventureState) {
  for (const slot of abilitySlots) updateSlot(slot, stock(state, slot.kind), game.equippedWeapon === slot.kind);
  if(expeditionSlot)updateSlot(expeditionSlot,state.ammo,false);
  for (const slot of cakeSlots) updateSlot(slot, cakeStock(state, slot.kind), state.selectedCake === slot.kind);
  lift.hidden = !!state.carried || state.elapsed >= state.strengthUntil;
  place.hidden = throwObject.hidden = !state.carried;
  objectRow.hidden = lift.hidden && !state.carried;
 }

 hit?.addEventListener('pointerdown', e => {
  if (!game.adventure?.swimming) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  game.useAction('dive');
 }, {capture: true, signal});

 document.addEventListener('pointerdown', e => {
  if (e.target instanceof Node && !tray.contains(e.target) && !ability.contains(e.target)) close();
 }, {capture: true, signal});
 document.addEventListener('room-chat-open', () => close(), {capture: true, signal});
 window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !tray.hidden) {
   e.preventDefault();
   e.stopImmediatePropagation();
   close(true);
   return;
  }
  if (e.repeat || blocked() || (e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable=true]')) return;
  const key = e.key.toLowerCase();
  if (key === 'c') ability.click();
  if (key === 'x') merge.click();
  if (key === '5' && game.fireExpeditionWeapon()) { e.preventDefault(); close(); }
  const kind = /^[1-4]$/.test(key) ? abilities[Number(key) - 1] : undefined;
  if (kind && lastState && stock(lastState, kind) > 0 && game.selectWeapon(kind)) close();
 }, {capture: true, signal});

 return {
  update(state: AdventureState) {
   lastState = state;
   ability.dataset.ability = game.equippedWeapon;
   ability.disabled = blocked() || !(abilities.some(kind => stock(state, kind) > 0) ||
    state.carried || state.elapsed < state.strengthUntil);
   merge.disabled = blocked() || state.ammo < 1 || state.supplies.chili < 1;
   if (ability.disabled) close();
   if (!tray.hidden) updateTray(state);

   if (hit) {
    const site = state.nearbyForestSite;
    const icon = site?.npc?.role === 'merchant' ? 'shop' : site?.npc ? 'talk' : site ? 'interact' :
     state.swimming && !state.carried ? 'dive' : 'throw';
    if (hit.dataset.icon !== icon) {
     hit.dataset.icon = icon;
     hit.innerHTML = forestIcon(icon);
    }
    hit.setAttribute('aria-label', site?.npc?.role === 'merchant' ? text('Buka toko', 'Open shop') :
     site?.npc ? text('Bicara', 'Talk') : site ? text('Interaksi', 'Interact') : state.swimming && !state.carried ? text('Selam', 'Dive') : text('Lempar', 'Throw'));
   }
   if (jump) {
    const icon = state.swimming ? 'surface' : 'jump';
    if (jump.dataset.icon !== icon) {
     jump.dataset.icon = icon;
     jump.innerHTML = forestIcon(icon);
    }
    jump.setAttribute('aria-label', state.swimming ? text('Ke permukaan', 'Surface') : text('Lompat', 'Jump'));
   }
  },
  dispose() {
   abort.abort();
   tray.remove();
   merge.remove();
   ability.remove();
  },
 };
}
