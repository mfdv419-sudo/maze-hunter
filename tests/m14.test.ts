import {it,expect} from 'vitest';
import {retroBoard,retroViewport,retroToScreen,retroFromScreen,boardSegment,boardRoute} from '../src/game/retro-board';
import {retroPageCount,center} from '../src/game/maze';
it('Retro boards retain valid bounds while accepted legacy layouts may remain square',()=>{
 for(let level=1;level<=100;level++)for(let page=0;page<retroPageCount(level);page++){
  const b=retroBoard(level,page);expect(b.width).toBeGreaterThan(0);expect(b.width).toBeLessThanOrEqual(43);expect(b.height).toBeLessThanOrEqual(19);expect(b.walls).toHaveLength(b.height);expect(b.walls.every(row=>row.length===b.width)).toBe(true);
  const open=b.walls.flat().filter(w=>w!==15).length;if(level>=41)expect(open/(b.width*b.height)).toBeGreaterThan(.6);expect(boardRoute(b).length).toBeGreaterThan(2);
 }
});
it('phone landscape renders accepted layouts at least 15px wide and uses the available width',()=>{
 for(const level of [1,6,11,21,31,41,51,71,91,100]){
  const b=retroBoard(level),v=retroViewport(844,390,b.width,b.height);expect(v.sx).toBeGreaterThanOrEqual(15);expect(v.sy).toBeGreaterThanOrEqual(15);expect(v.cols*v.sx).toBeGreaterThan(844*.75);expect(v.ox).toBeGreaterThanOrEqual(17);expect(v.oy).toBeGreaterThanOrEqual(78);expect(v.oy+v.rows*v.sy).toBeLessThanOrEqual(373);
 }
});
it('drawing and touch coordinates round-trip on rectangular cells, portrait rotation and resized canvases',()=>{
 for(const level of [1,5,11,31,51,91]){const b=retroBoard(level);for(const [width,height]of [[844,390],[1280,720],[390,844],[1024,768]]){const v=retroViewport(width,height,b.width,b.height);for(const p of boardRoute(b)){const a=center(p),pixel=retroToScreen(a,v),back=retroFromScreen(pixel,v);expect(back.x).toBeCloseTo(a.x,9);expect(back.y).toBeCloseTo(a.y,9);}const start=center(b.start);expect(boardSegment(b,start,{x:b.width+.1,y:start.y})).toBe(false);expect(boardSegment(b,start,{x:start.x,y:b.height+.1})).toBe(false);}}
});
