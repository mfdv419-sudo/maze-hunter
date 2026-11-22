import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createBinturong} from '../src/game/character';
import {gloveModel} from '../src/game/gear-model';
import type {Appearance} from '../src/services/cosmetics';

const leaf:Appearance={head:'leaf',face:'goggles',body:'explorer',back:'pack',tail:'bare',palette:'charcoal',hands:'bare',feet:'bare'};

describe('organic avatar rebuild',()=>{
 it('uses a continuous sculpted torso and skull rather than rectangular torso/head blocks',()=>{
  const a=createBinturong('explorer',undefined,leaf);
  const torso=a.root.getObjectByName('continuous-torso') as T.Mesh;
  const head=a.root.getObjectByName('continuous-cheek-cranium') as T.Mesh;
  expect(a.root.userData.modelVersion).toBe('organic-avatar-v1-rebuild');
  expect(torso).toBeInstanceOf(T.Mesh);
  expect(head).toBeInstanceOf(T.Mesh);
  expect(torso.geometry).toBeInstanceOf(T.BufferGeometry);
  expect(torso.geometry.getAttribute('normal').count).toBeGreaterThan(100);
  expect(head.geometry).toBeInstanceOf(T.SphereGeometry);
  expect(head.geometry.getAttribute('normal').count).toBeGreaterThan(200);
  expect(a.root.getObjectByName('jawline')).toBeTruthy();
  a.dispose();
 });
 it('keeps the organic paws turned inward at the idle side seams',()=>{
  for(const side of [-1,1]){
   const hand=gloveModel(new T.Group(),'bare',side);
   expect(hand.rotation.y).toBeCloseTo(side*Math.PI/2);
   expect(hand.getObjectByName('paw-palm-integrated')).toBeTruthy();
   for(let i=1;i<=4;i++)expect(hand.getObjectByName(`paw-finger-${i}`)).toBeTruthy();
  }
 });
 it('retains appearance, animated limb joints, equipment, and the continuous tail',()=>{
  const dressed:Appearance={...leaf,face:'expedition-sea-2',body:'expedition-sea-6',back:'expedition-sea-4',feet:'expedition-sea-1',hands:'expedition-sea-3'};
  const a=createBinturong('explorer',undefined,dressed);
  expect(a.root.getObjectByName('premium-chest-emblem')).toBeTruthy();
  expect(a.root.getObjectByName('diving-tank')).toBeTruthy();
  expect(a.root.getObjectByName('continuous-tail-surface')).toBeTruthy();
  for(const t of [0,.15,.34,.6,.92,1.26,1.5]){
   a.animate(t,t<.6?1:0,false,{hit:0,jump:t===.92?.8:0,swim:t===1.5,climb:'ground'});
  }
  expect(a.root.getObjectsByProperty('name','shoulder')).toHaveLength(2);
  expect(a.root.getObjectsByProperty('name','hip')).toHaveLength(2);
  a.dispose();
 });
});
