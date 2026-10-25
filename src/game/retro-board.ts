import {retroConfig, type Point} from './maze';
export const directions=[{x:0,y:-1,bit:1},{x:1,y:0,bit:2},{x:0,y:1,bit:4},{x:-1,y:0,bit:8}];
export interface RetroBoard {size:number; walls:number[][];start:Point;finish:Point;deadEnds:Point[]}
export function retroBoard(level:number,page=0):RetroBoard {
 const m=retroConfig(level).maps[page],n=(m.grid.length-1)/2;
 const walls=Array.from({length:n},()=>Array(n).fill(0));
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(const d of directions)
  if(m.grid[y*2+1+d.y]?.[x*2+1+d.x]!==0)walls[y][x]|=d.bit;
 const start={x:(m.start.x-1)/2,y:(m.start.y-1)/2},finish={x:(m.finish.x-1)/2,y:(m.finish.y-1)/2};
 const board:RetroBoard={size:n,walls,start,finish,deadEnds:[]};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(neighbors(board,{x,y}).length===1&&!(x===start.x&&y===start.y)&&!(x===finish.x&&y===finish.y))board.deadEnds.push({x,y});
 return board;
}
export function neighbors(b:RetroBoard,p:Point) {return directions.filter(d=>!(b.walls[p.y]?.[p.x]&d.bit)).map(d=>({x:p.x+d.x,y:p.y+d.y})).filter(q=>q.x>=0&&q.y>=0&&q.x<b.size&&q.y<b.size);}
export function boardRoute(b:RetroBoard,from=b.start,to=b.finish) {
 const q=[from],parent=new Map<string,Point|null>([[`${from.x},${from.y}`,null]]);
 for(let i=0;i<q.length;i++){const p=q[i];if(p.x===to.x&&p.y===to.y)break;for(const n of neighbors(b,p)){const k=`${n.x},${n.y}`;if(!parent.has(k)){parent.set(k,p);q.push(n);}}}
 const out:Point[]=[];let p:Point|null=to;
 if(!parent.has(`${to.x},${to.y}`))return out;
 while(p){out.unshift(p);p=parent.get(`${p.x},${p.y}`)||null;}return out;
}
export function boardSegment(b:RetroBoard,a:Point,c:Point) {
 const steps=Math.max(1,Math.ceil(Math.hypot(c.x-a.x,c.y-a.y)/.035));let prev=a;
 for(let i=1;i<=steps;i++) {
  const next={x:a.x+(c.x-a.x)*i/steps,y:a.y+(c.y-a.y)*i/steps};
  if(next.x<.025||next.y<.025||next.x>b.size-.025||next.y>b.size-.025)return false;
  const x=Math.floor(prev.x),y=Math.floor(prev.y),nx=Math.floor(next.x),ny=Math.floor(next.y);
  if(x!==nx&&y!==ny)return false;
  const bit=nx>x?2:nx<x?8:ny>y?4:ny<y?1:0;
  if(bit&&(b.walls[y]?.[x]&bit))return false;prev=next;
 }return true;
}
export function retroViewport(width:number,height:number,n:number) {
 const top=100,bottom=20,scale=Math.min((width-36)/n,Math.max(80,height-top-bottom)/n);
 return {scale,ox:(width-n*scale)/2,oy:top+(height-top-bottom-n*scale)/2};
}
