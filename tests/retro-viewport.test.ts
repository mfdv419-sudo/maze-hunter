import {it,expect} from 'vitest';
import {retroBoard,retroViewport,retroToScreen,retroFromScreen,boardSegment,boardRoute} from '../src/game/retro-board';
import {retroPageCount,center} from '../src/game/maze';
it('Retro boards retain valid bounds while square and rectangular layouts retain their natural proportions',()=>{
 for(let level=1;level<=100;level++)for(let page=0;page<retroPageCount(level);page++){
  const b=retroBoard(level,page);expect(b.width).toBeGreaterThan(0);expect(b.width).toBeLessThanOrEqual(31);expect(b.height).toBeLessThanOrEqual(19);expect(b.walls).toHaveLength(b.height);expect(b.walls.every(row=>row.length===b.width)).toBe(true);
  const open=b.walls.flat().filter(w=>w!==15).length;if(level>=41)expect(open/(b.width*b.height)).toBeGreaterThan(.6);expect(boardRoute(b).length).toBeGreaterThan(2);
 }
});
it('uses a consistent square cell size across levels without stretching to fill the viewport',()=>{
 for(const [width,height]of [[844,390],[1920,900],[390,844]]){const baseline=retroViewport(width,height,9,9).scale;for(const level of [1,6,11,21,31,41,51,71,91,100]){const b=retroBoard(level),v=retroViewport(width,height,b.width,b.height);expect(v.sx).toBe(v.sy);expect(v.scale).toBe(baseline);expect(v.ox).toBeGreaterThanOrEqual(17);expect(v.oy).toBeGreaterThanOrEqual(78);expect(v.oy+v.rows*v.sy).toBeLessThanOrEqual(height-17);}}
});
it('drawing and touch coordinates round-trip on rectangular cells, portrait rotation and resized canvases',()=>{
 for(const level of [1,5,11,31,51,91]){const b=retroBoard(level);for(const [width,height]of [[844,390],[1280,720],[390,844],[1024,768]]){const v=retroViewport(width,height,b.width,b.height);for(const p of boardRoute(b)){const a=center(p),pixel=retroToScreen(a,v),back=retroFromScreen(pixel,v);expect(back.x).toBeCloseTo(a.x,9);expect(back.y).toBeCloseTo(a.y,9);}const start=center(b.start);expect(boardSegment(b,start,{x:b.width+.1,y:start.y})).toBe(false);expect(boardSegment(b,start,{x:start.x,y:b.height+.1})).toBe(false);}}
});
