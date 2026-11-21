import {describe,expect,it} from 'vitest';
import {newProfile,recordExpeditionWin,expeditionRank} from '../src/services/local';
import {canEnterAdventureArea,isAdventureReviewer} from '../src/game/adventure-access';

describe('Home Adventure unlock progression',()=>{
 it('keeps Classic and Forest playable without clearing previous worlds',()=>{
  const p=newProfile('Explorer','id');
  expect(canEnterAdventureArea(p,'classic')).toBe(true);
  expect(canEnterAdventureArea(p,'forest')).toBe(true);
  expect(canEnterAdventureArea(p,'desert')).toBe(false);
  expect(canEnterAdventureArea(p,'volcano')).toBe(false);
 });
 it('unlocks subsequent worlds only after four ordered Solo completions',()=>{
  const p=newProfile('Explorer','id');
  recordExpeditionWin(p,'forest','medium');
  expect(expeditionRank(p,'forest')).toBe(0);
  for(const stage of ['easy','medium','hard'] as const)recordExpeditionWin(p,'forest',stage);
  expect(canEnterAdventureArea(p,'desert')).toBe(false);
  recordExpeditionWin(p,'forest','extreme');
  expect(canEnterAdventureArea(p,'desert')).toBe(true);
  expect(canEnterAdventureArea(p,'gorge')).toBe(false);
  for(const stage of ['easy','medium','hard','extreme'] as const)recordExpeditionWin(p,'desert',stage);
  expect(canEnterAdventureArea(p,'gorge')).toBe(true);
 });
 it('permits a verified reviewer UID but never grants access by display name alone',()=>{
  const p=newProfile('mf','id');
  expect(isAdventureReviewer('other-uid','approved-uid')).toBe(false);
  expect(isAdventureReviewer('approved-uid','approved-uid')).toBe(true);
  expect(canEnterAdventureArea(p,'volcano',false)).toBe(false);
  expect(canEnterAdventureArea(p,'volcano',true)).toBe(true);
 });
});
