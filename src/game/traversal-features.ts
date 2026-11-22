import type {AdventureLayout} from './adventure-layout';
import type {AdventureArea} from './areas';
import type {Point} from './maze';
/** Authored optional side bay; generated outside objectives and existing route. */
export function jumpPads(l:AdventureLayout,area:AdventureArea):Point[]{if(l.training)return[{x:17.5,y:17.5}];return area==='gorge'&&l.traversal?[l.traversal.pad]:[];}
export function jumpPower(l:AdventureLayout,area:AdventureArea,p:Point){return jumpPads(l,area).some(q=>Math.hypot(q.x-p.x,q.y-p.y)<.65)?4:1;}
