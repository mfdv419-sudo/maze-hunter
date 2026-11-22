/** Character-only source contract. Complements, does not replace, WebGL visual review. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const character=readFileSync(new URL('../src/game/character.ts',import.meta.url),'utf8');
const gear=readFileSync(new URL('../src/game/gear-model.ts',import.meta.url),'utf8');
const checks={
  'Binturong identity stays explicit': character.includes("root.userData.species='Arctictis binturong'"),
  'Mascot skull uses updated sculpted proportions':character.includes("'soft-binturong-cranium',0,.017,0,.418,.349,.324"),
  'Continuous compact torso':character.includes("'continuous-mascot-torso'")&&character.includes('loftBody(body,fur'),
  'Outfit covers front and back':character.includes("'full-wrap-expedition-vest'")&&character.includes("'vest-back-yoke'"),
  'Paw digits are explicit geometry':gear.includes('paw-finger-${i+1}')&&gear.includes('foot-paw-digit-${i+1}'),
  'Palm orientation remains sideways':gear.includes('root.rotation.y=side*Math.PI/2'),
  'Tail is preserved':character.includes("'continuous-tail-surface'"),
  'Core animation contract retained':character.includes('function animate(time:number,speed:number')&&character.includes('airPose(')&&character.includes('action?.swim'),
  'Reward gear still supported':character.includes('equippedExpeditionDetails(')&&character.includes('expeditionWeaponModel('),
  'No preview ownership or payments changed':!character.includes('wallet')&&!gear.includes('purchase'),
  'No forbidden style workarounds':!character.includes('!important')&&!gear.includes('!important')&&!character.includes('@ts-ignore'),
};
for(const [label,passed] of Object.entries(checks)){
  assert.ok(passed,label);
  console.log(`PASS ${label}`);
}
