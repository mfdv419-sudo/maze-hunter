import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {gloveModel} from '../src/game/gear-model';
import {createBinturong} from '../src/game/character';
import {Climber} from '../src/game/climbing';
import type {Appearance} from '../src/services/cosmetics';

const defaultLook:Appearance={head:'leaf',face:'goggles',body:'classic',back:'bare',tail:'bare',palette:'charcoal',hands:'bare',feet:'bare'};

describe('Character Revision Pass',()=>{
 it('orients each palm inward toward the trouser seam',()=>{
  const right=gloveModel(new T.Group(),'bare',-1);
  const left=gloveModel(new T.Group(),'bare',1);
  expect(right.rotation.y).toBeCloseTo(-Math.PI/2);
  expect(left.rotation.y).toBeCloseTo(Math.PI/2);
  expect(right.userData.handModel).toContain('palms-inward');
  expect(left.userData.handModel).toContain('palms-inward');
 });
 it('shows equipped shop garments on the animated avatar without making default gear appear',()=>{
  const empty=createBinturong('classic',undefined,defaultLook);
  expect(empty.root.getObjectByName('equipment-sea-6')).toBeUndefined();
  const outfit:Appearance={...defaultLook,face:'expedition-sea-2',body:'expedition-sea-6',back:'expedition-sea-4',feet:'expedition-sea-1'};
  const equipped=createBinturong('classic',undefined,outfit);
  expect(equipped.root.getObjectByName('premium-chest-emblem')).toBeTruthy();
  expect(equipped.root.getObjectByName('equipment-sea-6')).toBeTruthy();
  expect(equipped.root.getObjectByName('diving-tank')).toBeTruthy();
  expect(equipped.root.getObjectByName('snorkel-tube')).toBeTruthy();
  for(const t of [0,.25,.7,1.1,1.9])equipped.animate(t, t<1?1:0,false,{hit:0,jump:t===1.1?.7:0,swim:t===1.9});
  expect(equipped.root.getObjectByName('premium-chest-emblem')).toBeTruthy();
  empty.dispose();equipped.dispose();
 });
 it('does not grab a rock ledge while already above the rim or falling off the top',()=>{
  const c=new Climber();const ledges=[{id:5,point:{x:2,y:2},height:1,width:1,depth:1,kind:'rock' as const}];
  const near={x:1.9,y:2.5},next={x:2.01,y:2.5};
  const result=c.step(near,next,{x:1,y:0},.94,.016,ledges);
  expect(c.state.phase).toBe('ground');
  expect(result.reached).toBeNull();
 });
 it('allows an intentional jump toward a higher rim to begin ledge hang',()=>{
  const c=new Climber();const ledges=[{id:5,point:{x:2,y:2},height:1.2,width:1,depth:1,kind:'rock' as const}];
  c.step({x:1.9,y:2.5},{x:2.0,y:2.5},{x:1,y:0},.40,.016,ledges);
  expect(c.state.phase).toBe('hanging');
 });
});
