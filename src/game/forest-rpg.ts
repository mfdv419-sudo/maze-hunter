import type {Grid,Point} from './maze';
import {route} from './maze';
import {arenaPoint,type ForestArenaId} from './forest-world-design';

export type ForestItemId=
 |'forest-berry'|'spring-water'|'camp-meal'|'herbal-tonic'|'oxygen-flask'
 |'river-herb'|'wet-wood'|'crystal-shard'|'ancient-coin'|'bronze-fragment'
 |'iron-ore'|'rope-fiber'|'nature-fiber'|'dark-ore'|'cloud-crystal'|'sky-fiber'
 |'dragon-treat'|'guardian-token';
export type ForestInventory=Record<ForestItemId,number>;
export const forestItemInfo:Record<ForestItemId,{name:[string,string];kind:'food'|'drink'|'material'|'pet'|'treasure';hp?:number;stamina?:number;price?:number}>={
 'forest-berry':{name:['Berry Hutan','Forest Berry'],kind:'food',hp:20,price:5},
 'spring-water':{name:['Air Mata Air','Spring Water'],kind:'drink',stamina:45,price:5},
 'camp-meal':{name:['Hidangan Perkemahan','Camp Meal'],kind:'food',hp:45,price:12},
 'herbal-tonic':{name:['Tonik Herbal','Herbal Tonic'],kind:'drink',hp:25,stamina:30,price:14},
 'oxygen-flask':{name:['Flask Oksigen','Oxygen Flask'],kind:'drink',stamina:20,price:10},
 'river-herb':{name:['Herba Sungai','River Herb'],kind:'material',price:4},
 'wet-wood':{name:['Kayu Basah','Wet Wood'],kind:'material',price:3},
 'crystal-shard':{name:['Pecahan Kristal','Crystal Shard'],kind:'material',price:8},
 'ancient-coin':{name:['Koin Kuno','Ancient Coin'],kind:'treasure',price:10},
 'bronze-fragment':{name:['Fragmen Perunggu','Bronze Fragment'],kind:'material',price:7},
 'iron-ore':{name:['Bijih Besi','Iron Ore'],kind:'material',price:7},
 'rope-fiber':{name:['Serat Tali','Rope Fiber'],kind:'material',price:5},
 'nature-fiber':{name:['Serat Alam','Nature Fiber'],kind:'material',price:8},
 'dark-ore':{name:['Bijih Gelap','Dark Ore'],kind:'material',price:11},
 'cloud-crystal':{name:['Kristal Awan','Cloud Crystal'],kind:'material',price:12},
 'sky-fiber':{name:['Serat Langit','Sky Fiber'],kind:'material',price:10},
 'dragon-treat':{name:['Camilan Naga','Dragon Treat'],kind:'pet',price:9},
 'guardian-token':{name:['Token Guardian','Guardian Token'],kind:'treasure',price:15},
};
export function emptyForestInventory():ForestInventory{return Object.fromEntries(Object.keys(forestItemInfo).map(k=>[k,0])) as ForestInventory;}

export type ForestSiteKind='market'|'camp'|'activity'|'gather'|'hut'|'shrine'|'tower'|'treehouse'|'cave';
export interface ForestWorldSite {id:string;arena:ForestArenaId;kind:ForestSiteKind;point:Point;label:[string,string];solid?:{w:number;d:number};reward?:ForestItemId;xp?:number}
const site=(arena:ForestArenaId,id:string,kind:ForestSiteKind,dx:number,dy:number,label:[string,string],solid?:{w:number;d:number},reward?:ForestItemId,xp?:number):ForestWorldSite=>{const p=arenaPoint(arena);return{id:`${arena}-${id}`,arena,kind,point:{x:p.x+dx,y:p.y+dy},label,solid,reward,xp};};
export function forestWorldSites(active:ForestArenaId[]):ForestWorldSite[]{const enabled=new Set(active),all:ForestWorldSite[]=[
 site('waterfall','watermill','hut',-10,-7,['Kincir Air Tua','Old Water Mill'],{w:4,d:3}),
 site('waterfall','market','market',8,8,['Pedagang Lembah','Valley Merchant'],{w:3,d:2}),
 site('waterfall','camp','camp',10,3,['Camp Tepian Sungai','Riverside Camp'],undefined,'spring-water',12),
 site('waterfall','dive','activity',-4,10,['Peti Tenggelam','Sunken Cache'],undefined,'crystal-shard',18),
 site('green','village','treehouse',7,-7,['Desa Tebing','Cliff Village'],{w:5,d:3}),
 site('green','market','market',8,-2,['Pedagang Tebing','Cliff Merchant'],{w:3,d:2}),
 site('green','wind','shrine',-7,-8,['Wind Shrine','Wind Shrine'],{w:2,d:2}),
 site('green','herbs','gather',-8,7,['Kebun Herba','Herb Patch'],undefined,'river-herb',14),
 site('ruins','archive','hut',-8,-3,['Archive Tua','Old Archive'],{w:4,d:3}),
 site('ruins','market','market',8,6,['Pedagang Relik','Relic Merchant'],{w:3,d:2}),
 site('ruins','statue','activity',0,-8,['Puzzle Patung','Statue Puzzle'],undefined,'ancient-coin',20),
 site('ruins','tower','tower',7,-8,['Menara Pengawas','Watchtower'],{w:3,d:3}),
 site('chasm','miner','market',-8,7,['Camp Penambang','Miner Camp'],{w:4,d:3}),
 site('chasm','lift','activity',8,7,['Lift Tua','Old Lift'],undefined,'iron-ore',20),
 site('chasm','cave','cave',8,-8,['Gua Samping','Side Cave'],{w:3,d:2}),
 site('chasm','rope','gather',-7,-7,['Persediaan Tali','Rope Cache'],undefined,'rope-fiber',14),
 site('giant','village','treehouse',6,-6,['Desa Kanopi','Canopy Village'],{w:5,d:4}),
 site('giant','market','market',8,1,['Pedagang Kanopi','Canopy Merchant'],{w:3,d:2}),
 site('giant','nest','activity',-8,-7,['Sarang Tersembunyi','Hidden Nest'],undefined,'dragon-treat',22),
 site('giant','root','gather',-8,8,['Akar Berenergi','Living Root'],undefined,'nature-fiber',15),
 site('ug-flooded','camp','camp',-7,7,['Camp Penjelajah','Explorer Camp'],undefined,'oxygen-flask',16),
 site('ug-relic','altar','shrine',7,-6,['Altar Relik','Relic Altar'],{w:3,d:3}),
 site('ug-xp','challenge','activity',0,7,['Arena Tantangan','Challenge Arena'],undefined,'guardian-token',35),
 site('ug-cross','trader','market',-6,-6,['Pedagang Bawah Tanah','Underground Trader'],{w:3,d:2}),
 site('sky-1','camp','camp',-5,5,['Camp Langit','Sky Camp'],undefined,'spring-water',14),
 site('sky-1','market','market',6,3,['Pedagang Langit','Sky Merchant'],{w:3,d:2}),
 site('sky-2','guardian','activity',0,-7,['Guardian Hub','Guardian Hub'],undefined,'guardian-token',30),
 site('sky-3','shrine','shrine',6,-6,['Sky Shrine','Sky Shrine'],{w:3,d:3}),
 site('sky-3','crystal','gather',-6,7,['Kristal Awan','Cloud Crystal'],undefined,'cloud-crystal',20),
 site('inner','rest','camp',-6,5,['Camp Gerbang Dalam','Inner Gate Camp'],undefined,'camp-meal',18),
 site('inner','forge','shrine',6,4,['Stasiun Perakitan Relik','Relic Assembly Station'],{w:3,d:3}),
 site('boss','outer-west','shrine',-8,5,['Pilar Outer Ring','Outer Ring Pillar'],{w:2,d:2}),
 site('boss','outer-east','shrine',8,5,['Pilar Outer Ring','Outer Ring Pillar'],{w:2,d:2}),
 ];return all.filter(s=>enabled.has(s.arena));}

export function applyForestSiteCollision(grid:Grid,sites:ForestWorldSite[],protectedPoints:Point[]):ForestWorldSite[]{
 const accepted:ForestWorldSite[]=[];
 for(const s of sites){if(!s.solid){accepted.push(s);continue;}const cells:Point[]=[];const hw=Math.floor(s.solid.w/2),hd=Math.floor(s.solid.d/2);
  for(let y=s.point.y-hd;y<=s.point.y+hd;y++)for(let x=s.point.x-hw;x<=s.point.x+hw;x++)if(grid[y]?.[x]===0&&!protectedPoints.some(p=>Math.hypot(p.x-x,p.y-y)<2.2))cells.push({x,y});
  if(!cells.length){accepted.push(s);continue;}const old=cells.map(p=>grid[p.y][p.x]);cells.forEach(p=>grid[p.y][p.x]=1);
  const center=arenaPoint(s.arena),targets=protectedPoints.filter(p=>Math.hypot(p.x-center.x,p.y-center.y)<30);const ok=targets.every(p=>route(grid,center,p).length>0);
  if(!ok)cells.forEach((p,i)=>grid[p.y][p.x]=old[i]);accepted.push(s);
 }
 return accepted;
}

export const forestMarketOffers:(ForestItemId)[]=['forest-berry','spring-water','camp-meal','herbal-tonic','oxygen-flask','dragon-treat'];
