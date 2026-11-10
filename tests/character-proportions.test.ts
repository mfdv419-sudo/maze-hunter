import {describe,it,expect} from 'vitest';
import {createBinturong} from '../src/game/character';
import {gloveModel} from '../src/game/gear-model';
import * as T from 'three';

describe('Binturong model geometry',()=>{
 it('renders four separate digits and a thumb in bare and outfitted hands',()=>{
  for(const kind of ['bare','trail','climber','diver']){
   const base=new T.Group();const hand=gloveModel(base,kind,1,0x343c45);
   for(let finger=1;finger<=4;finger++)expect(hand.getObjectByName(`paw-finger-${finger}`)).toBeTruthy();
   expect(hand.getObjectByName('paw-thumb')).toBeTruthy();
   const fingers=Array.from({length:4},(_,i)=>hand.getObjectByName(`paw-finger-${i+1}`)!);
   expect(fingers.every(f=>f.position.y<0)).toBe(true);
  }
 });
 it('attaches the tail root to the body and keeps it across animation poses',()=>{
  const avatar=createBinturong();
  const root=avatar.root.getObjectByName('prehensile-tail');
  const blend=avatar.root.getObjectByName('tail-root-blend');
  const surface=avatar.root.getObjectByName('continuous-tail-surface') as T.Mesh;
  expect(root).toBeTruthy();expect(blend?.parent).toBe(root);
  expect(surface?.parent).toBe(root);
  for(const t of [0,.1,1]){
   avatar.animate(t,.5,false,{hit:0,swim:t===1});
   const xyz=surface.geometry.getAttribute('position') as T.BufferAttribute;
   const mean=(axis:'X'|'Y'|'Z')=>Array.from({length:8},(_,i)=>axis==='X'?xyz.getX(i):axis==='Y'?xyz.getY(i):xyz.getZ(i)).reduce((a,b)=>a+b,0)/8;
   expect(Math.abs(mean('X'))).toBeLessThan(.04);
   expect(mean('Y')).toBeGreaterThan(.29);
   expect(mean('Z')).toBeGreaterThan(-.2);
  }
  avatar.dispose();
 });
});
