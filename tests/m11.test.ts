import {it,expect} from 'vitest';
import {retroBoard,boardRoute,neighbors} from '../src/game/retro-board';
import {retroPageCount,retroDecisions,center} from '../src/game/maze';
import {RetroState} from '../src/game/retro-state';
const key=(p:{x:number;y:number})=>`${p.x},${p.y}`;
it('audits every visible route, exact choice counts and a 90% failed route per decision on all 176 generated maps',()=>{
 let maps=0;const unique=new Set<string>();
 for(let level=5;level<=100;level++)for(let page=0;page<retroPageCount(level);page++){
  maps++;const b=retroBoard(level,page),decisions=retroDecisions(level,page),claimed=new Set<string>();let failures=0;
  expect(decisions[0].point).toEqual(b.start);expect(decisions.at(-1)!.next).toEqual(b.finish);unique.add(JSON.stringify(b));
  for(const [i,d]of decisions.entries()){
   expect(neighbors(b,d.point).length).toBe(d.choices.length+(i?1:0));expect(d.choices.filter(c=>c.correct)).toHaveLength(1);
   const correct=d.choices.find(c=>c.correct)!;expect(correct.end).toEqual(d.next);
   const actualCorrect=boardRoute(b,d.point,d.next).length-1;expect(actualCorrect).toBe(d.length);
   for(const c of d.choices){const path=boardRoute(b,d.point,c.end);expect(path.length-1).toBe(c.length);for(const p of path)claimed.add(key(p));for(const p of path.slice(1,-1))expect(neighbors(b,p)).toHaveLength(2);
    if(!c.correct){failures++;expect((path.length-1)/actualCorrect).toBeCloseTo(.9,10);expect(neighbors(b,c.end)).toHaveLength(1);}
   }
   if(i<decisions.length-1)expect(d.next).toEqual(decisions[i+1].point);
  }
  let rooms=0,degree=0;for(let y=0;y<b.size;y++)for(let x=0;x<b.size;x++)if(b.walls[y][x]!==15){rooms++;degree+=neighbors(b,{x,y}).length;expect(claimed.has(`${x},${y}`)).toBe(true);}
  expect(degree/2).toBe(rooms-1);expect(claimed.size).toBe(rooms);expect(b.deadEnds).toHaveLength(failures);
 }
 expect(maps).toBe(176);expect(unique.size).toBe(maps);
},30000);
it('keeps a level running through map gates and awards stars only at the final fruit goal',()=>{
 for(const level of [41,51,81,100]){const s=new RetroState(level);s.start();s.tick(4);
  for(let page=0;page<s.boards.length;page++){expect(s.pageIndex).toBe(page);const final=s.finalPage;for(const p of boardRoute(s.board))s.trace(center(p));expect(s.lives).toBe(3);expect(s.elapsed).toBe(4);expect(s.phase).toBe(final?'won':'playing');expect(s.rating).toBe(final?3:0);}
 }
});
it('a later-map dead end returns to the level Start on map 1, preserving elapsed time and charging one life',()=>{
 const s=new RetroState(81);s.start();for(const p of boardRoute(s.board))s.trace(center(p));expect(s.pageIndex).toBe(1);s.tick(7);const wrong=s.board.deadEnds[0];for(const p of boardRoute(s.board,s.board.start,wrong))s.trace(center(p));expect(s.pageIndex).toBe(0);expect(s.position).toEqual(center(s.boards[0].start));expect(s.lives).toBe(2);expect(s.errors).toBe(1);expect(s.elapsed).toBe(7);expect(s.phase).toBe('playing');
});
it('time and pause remain shared across maps and a retry has clean map progression',()=>{
 const s=new RetroState(100);s.start();for(const p of boardRoute(s.board))s.trace(center(p));s.tick(2);s.phase='paused';s.tick(100);expect(s.elapsed).toBe(2);s.phase='playing';s.tick(s.config.seconds);expect(s.phase).toBe('lost');expect(s.reason).toBe('time');expect(new RetroState(100).pageIndex).toBe(0);
});
