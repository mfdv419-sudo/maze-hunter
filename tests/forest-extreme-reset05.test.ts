import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {forestRing} from '../src/game/forest-ring';
import {FOREST_EXTREME_BUILD} from '../src/game/forest-extreme-world';

describe('Forest Grove RESET05 architecture',()=>{
 it('Extreme uses the independent new world while Medium does not',()=>{
  const extreme=forestRing('extreme',0,1),medium=forestRing('medium',0,1);
  expect(FOREST_EXTREME_BUILD).toBe('FG-EXTREME-RESET-05-20261105');
  expect(extreme.version).toBe(FOREST_EXTREME_BUILD);
  expect(medium.version).not.toBe(FOREST_EXTREME_BUILD);
  expect(extreme.activeZones).toContain('sky-3');
  expect(extreme.activeZones).toContain('ug-xp');
  expect(medium.activeZones).not.toContain('sky-3');
 });
 it('runtime only activates Forest pilot/ring for Extreme Map 0',()=>{
  const modern=readFileSync(new URL('../src/game/modern.ts',import.meta.url),'utf8');
  expect(modern).toContain("options.area==='forest'&&options.difficulty==='extreme'&&options.adventureMap===0");
  expect(modern).not.toContain("options.area==='forest'&&options.adventureMap===0,options.area==='forest'&&options.adventureMap===0");
 });
 it('Forest selection cannot silently force Medium into Map 0',()=>{
  const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
  expect(main).toContain("activeArea==='forest'&&difficulty==='extreme'?0:nextMap(difficulty)");
  expect(main).not.toContain("activeArea==='forest'&&difficulty==='medium'?0:nextMap(difficulty)");
 });
 it('paw has a single stylized volume and no explicit finger meshes',()=>{
  const gear=readFileSync(new URL('../src/game/gear-model.ts',import.meta.url),'utf8');
  const character=readFileSync(new URL('../src/game/character.ts',import.meta.url),'utf8');
  expect(gear).toContain("handModel='single-paw-v5'");
  expect(gear).not.toContain('paw-finger-');
  expect(gear).not.toContain('paw-thumb');
  expect(character).not.toContain("ell(elbow,fur,0,-.12");
 });
 it('legacy Forest CSS no longer owns action-button geometry',()=>{
  const css=readFileSync(new URL('../src/forest-pilot.css',import.meta.url),'utf8');
  expect(css).not.toContain('#game[data-screen=modern] .forest-pilot .forest-merge{');
  expect(css).not.toContain('#game[data-screen=modern] .forest-pilot .forest-ability{');
 });
});
