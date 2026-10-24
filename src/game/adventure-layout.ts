import {carve, distances, route, random, type Maze, type Difficulty, type Point} from './maze';
export const adventureRules={medium:{size:31,seconds:720,guards:3,bosses:1,minPath:80},hard:{size:41,seconds:1080,guards:5,bosses:2,minPath:120},extreme:{size:51,seconds:1500,guards:7,bosses:3,minPath:160}} as const;
export interface AdventureLayout {maze:Maze;index:number;seals:Point[];stars:Point[];chests:Point[];rivers:Point[];grass:Point[];patrols:Point[][];bosses:Point[];solution:Point[]}
const key=(p:Point)=>`${p.x},${p.y}`;
export function adventureLayout(difficulty:Difficulty,index:number,variation=1):AdventureLayout {
 index=((index%10)+10)%10;const rules=adventureRules[difficulty],rng=random(variation+index*9173);
 let maze!:Maze,solution:Point[]=[];
 for(let attempt=0;attempt<200;attempt++) {
  const seed=8053+index*7919+attempt*104729,grid=carve(rules.size,rules.size,seed),start={x:1,y:1};
  // Sparse loops add alternative routes without turning the maze into open space.
  let opened=0;
  for(let y=2;y<grid.length-2;y++)for(let x=2;x<grid.length-2;x++) {
   if(!grid[y][x]||(x+y+index)%17||opened>=rules.size/3)continue;
   const horizontal=!grid[y][x-1]&&!grid[y][x+1]&&grid[y-1][x]&&grid[y+1][x];
   const vertical=!grid[y-1][x]&&!grid[y+1][x]&&grid[y][x-1]&&grid[y][x+1];
   if(horizontal||vertical){grid[y][x]=0;opened++;}
  }
  const ds=distances(grid,start);let finish=start,best=0;
  for(const [k,d] of ds)if(d>best){const [x,y]=k.split(',').map(Number);finish={x,y};best=d;}
  if(best<rules.minPath)continue;
  maze={grid,start,finish,entrances:[start],seed};solution=route(grid,start,finish);break;
 }
 if(!maze)throw Error('Adventure layout validation failed');
 const {grid,start,finish}=maze,ds=distances(grid,start),df=distances(grid,finish);
 const open:Point[]=[],ends:Point[]=[],grass:Point[]=[];
 for(let y=1;y<grid.length-1;y++)for(let x=1;x<grid.length-1;x++) {
  const p={x,y};
  if(!grid[y][x]) {
   if((ds.get(key(p))||0)<12||(df.get(key(p))||0)<8)continue;
   open.push(p);const degree=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>grid[y+b][x+a]===0).length;
   if(degree===1)ends.push(p);
  }else if((x+y)%7===index%7&&grass.length<8) {
   if((!grid[y][x-1]&&!grid[y][x+1])||(!grid[y-1][x]&&!grid[y+1][x]))grass.push(p);
  }
 }
 const pool=[...ends,...open.filter((_,i)=>i%7===0)];
 const used=new Set<string>();
 function pick(count:number,source=pool) {
  const out:Point[]=[];
  const shuffled=[...source].sort((a,b)=>((a.x*71+a.y*131+variation*43)%997)-((b.x*71+b.y*131+variation*43)%997));
  for(let i=0;i<count;i++) {
   let best:Point|undefined,score=-1;
   for(const p of shuffled) {
    if(used.has(key(p)))continue;
    const spread=out.length?Math.min(...out.map(q=>Math.hypot(p.x-q.x,p.y-q.y))):rng()*10;
    if(spread>score){score=spread;best=p;}
   }
   if(best){out.push(best);used.add(key(best));}
  }return out;
 }
 const seals=pick(3),stars=pick(9),chests=pick(3);
 const riverCandidates=solution.filter((p,i)=>i>15&&i<solution.length-20&&(p.x%2===0||p.y%2===0)&&!used.has(key(p)));
 const rivers=riverCandidates.length?[riverCandidates[Math.floor(riverCandidates.length*.45)]]:[];
 for(const p of rivers)used.add(key(p));
 const guardStarts=pick(rules.guards,open.filter(p=>!rivers.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<3)));
 const patrols=guardStarts.map(p=>{
  const nearby=distances(grid,p);let target=p;
  for(const [k,d] of nearby)if(d>=5&&d<=8){const [x,y]=k.split(',').map(Number);target={x,y};}
  return route(grid,p,target);
 });
 const bosses:Point[]=[];
 for(let i=0;i<rules.bosses;i++)bosses.push(solution[Math.max(3,solution.length-7-i*8)]);
 return{maze,index,seals,stars,chests,rivers,grass,patrols,bosses,solution};
}
export function nextMap(difficulty:Difficulty) {
 const k=`mh-adventure-map:${difficulty}`;let previous=-1;
 try{previous=Number(localStorage.getItem(k)??-1);}catch{}
 const index=previous<0?Math.floor(Math.random()*10):(previous+1+Math.floor(Math.random()*9))%10;
 try{localStorage.setItem(k,String(index));}catch{}return index;
}
