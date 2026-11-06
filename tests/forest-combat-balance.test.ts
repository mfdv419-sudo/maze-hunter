import {describe,it,expect} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';

describe('Forest Grove boss damage and hit feedback',()=>{
 it('boss hits have a three-step warning before taking one life, like guard hits',()=>{
  const a=new AdventureState('medium',0,1,false,undefined,'forest',false,true,true);
  a.guards.forEach(g=>g.dead=true);
  const lives=a.lives;
  a.elapsed=10;a.damage('boss');
  expect(a.lives).toBe(lives);expect(a.hits).toBe(1);
  a.elapsed=12;a.damage('boss');
  expect(a.lives).toBe(lives);expect(a.hits).toBe(2);
  a.elapsed=14;a.damage('boss');
  expect(a.lives).toBe(lives-1);expect(a.hits).toBe(0);
 });
 it('the boss attack sequence has a visible invulnerability window',()=>{
  const a=new AdventureState('medium',0,1,false,undefined,'forest',false,true,true);
  a.guards.forEach(g=>g.dead=true);
  a.elapsed=10;a.damage('boss');const hits=a.hits;
  a.elapsed=11;a.damage('boss');expect(a.hits).toBe(hits);
 });
});
