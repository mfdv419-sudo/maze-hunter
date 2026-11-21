import {describe,expect,it} from 'vitest';
import {doubleJumpSomersault} from '../src/game/double-jump-motion';

describe('Binturong jump presentation',()=>{
 it('keeps the first jump upright and makes the second jump a full forward somersault',()=>{
  expect(doubleJumpSomersault(1,.34,1)).toBe(0);
  expect(doubleJumpSomersault(2,0,1)).toBe(0);
  expect(doubleJumpSomersault(2,.34,1)).toBeCloseTo(-Math.PI);
  expect(doubleJumpSomersault(2,.68,1)).toBe(0);
  expect(doubleJumpSomersault(2,.8,0)).toBe(0);
 });
 it('does not rotate an idle or landed avatar',()=>{
  expect(doubleJumpSomersault(2,.2,0)).toBe(0);
  expect(doubleJumpSomersault(2,-1,1)).toBe(0);
  expect(doubleJumpSomersault(2,NaN,1)).toBe(0);
 });
});
