import {shipSurface} from './expedition-landmarks';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureArea} from './areas';
import type {Point} from './maze';
export const aquaticArea=(area:AdventureArea)=>area==='sea'||area==='coast';
/** Shared terrain and depth rules: renderer, pickups and authoritative room simulation. */
export function aquaticGround(area:AdventureArea,x:number,y:number,layout:AdventureLayout):number{
 const f=layout.forest!;
 if(area==='sea'){
  const deck=shipSurface(x,y,layout);if(deck!==null)return deck;
  const islands=[layout.maze.start,f.cabin,layout.maze.finish];
  if(Math.hypot(x-layout.fortress.x-.5,y-layout.fortress.y-.5)<4.5)return -3.4;
  const d=Math.min(...islands.map(p=>Math.hypot(x-p.x-.5,y-p.y-.5)));
  return d<2.5?.25:d<5?.25-(d-2.5)/2.5*3.65:-3.4+Math.sin(x*.12)*Math.cos(y*.1)*.15;
 }
 const d=Math.hypot(x-f.cave.x-.5,y-f.cave.y-.5);
 return Math.sin(x*.07)*.12-Math.max(0,1-d/5.2)*3.6;
}
export function aquaticSwimming(area:AdventureArea,p:Point,layout:AdventureLayout){return aquaticArea(area)&&aquaticGround(area,p.x,p.y,layout)<-1.05;}
export function aquaticChestDepth(area:AdventureArea,index:number,p:Point,layout:AdventureLayout){return aquaticArea(area)?Math.max(0,-aquaticGround(area,p.x+.5,p.y+.5,layout)-.6):0;}
