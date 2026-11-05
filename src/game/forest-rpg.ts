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
export type ForestNpcRole='merchant'|'clue'|'quest'|'rest';
export interface ForestWorldSite {id:string;arena:ForestArenaId;kind:ForestSiteKind;point:Point;label:[string,string];solid?:{w:number;d:number};reward?:ForestItemId;xp?:number;npc?:{role:ForestNpcRole;name:[string,string];clue?:[string,string]}}
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



/** Extreme-only authored content. This is intentionally denser than the legacy Medium-derived content. */
export function forestExtremeWorldSites(active:ForestArenaId[]):ForestWorldSite[]{
 const enabled=new Set(active),out:ForestWorldSite[]=[];
 const add=(arena:ForestArenaId,id:string,kind:ForestSiteKind,dx:number,dy:number,label:[string,string],solid?:{w:number;d:number},reward?:ForestItemId,xp?:number,npc?:ForestWorldSite['npc'])=>{
  const p=arenaPoint(arena);out.push({id:`ext-${arena}-${id}`,arena,kind,point:{x:p.x+dx,y:p.y+dy},label,solid,reward,xp,npc});
 };
 // Entry hub: visibly populated orientation/rest area.
 add('entrance','guide','camp',-7,-5,['Pos Penjelajah','Explorer Post'],undefined,'spring-water',8,{role:'clue',name:['Raka Penjelajah','Raka the Explorer'],clue:['Kalau ingin menemukan jalan keluar, cari Pohon Raksasa. Puncaknya terlihat dari banyak tempat. Tapi jangan mendekat sebelum mengumpulkan tiga Batu Mfeer biru dan setidaknya satu item rahasia dari reruntuhan.','If you want the way out, find the Giant Tree. Its crown can be seen from many places. Do not approach it before collecting three blue Mfeer Stones and at least one secret item from the ruins.']});
 add('entrance','quartermaster','market',7,-4,['Kios Perbekalan','Supply Stall'],{w:4,d:3},undefined,0,{role:'merchant',name:['Mira','Mira'],clue:['Bawa material kembali untuk dijual atau dirakit.','Bring materials back to sell or craft.']});
 // Waterfall Valley: watermill, market, camp, clue NPC, gathering and underwater reward.
 add('waterfall','watermill','hut',-11,-8,['Kincir Air Tua','Old Water Mill'],{w:5,d:4});
 add('waterfall','merchant','market',10,8,['Pasar Tepian Air','Waterside Market'],{w:4,d:3},undefined,0,{role:'merchant',name:['Nara','Nara']});
 add('waterfall','ranger','camp',9,2,['Camp Ranger','Ranger Camp'],undefined,'spring-water',14,{role:'clue',name:['Bimo Ranger','Ranger Bimo'],clue:['Air yang paling dingin mengalir dari bawah batu tua. Ikuti arusnya; ada reruntuhan terendam dan sesuatu yang berkilau biru di kedalaman.','The coldest water flows from beneath the old stones. Follow the current; submerged ruins and something blue-glowing wait below.']});
 add('waterfall','sunken','activity',-5,11,['Peti Tenggelam','Sunken Cache'],undefined,'crystal-shard',22);
 add('waterfall','herbs','gather',11,-4,['Herba Sungai','River Herbs'],undefined,'river-herb',12);
 // Green Cliffs: village/market/clue and climbing challenge.
 add('green','village','treehouse',7,-8,['Desa Tebing','Cliff Village'],{w:6,d:4});
 add('green','merchant','market',9,-1,['Kios Tebing','Cliff Stall'],{w:4,d:3},undefined,0,{role:'merchant',name:['Tala','Tala']});
 add('green','climber','camp',-8,7,['Pos Pendaki','Climber Camp'],undefined,'camp-meal',16,{role:'clue',name:['Sena','Sena'],clue:['Kalau melihat akar setinggi rumah dan angin terasa lebih kuat, kamu sudah dekat jalur menuju dataran tinggi. Salah satu cabangnya menyimpan jalan rahasia.','When the roots rise as high as a house and the wind grows stronger, you are near the high route. One branch hides a secret path.']});
 add('green','wind','shrine',-7,-9,['Wind Shrine','Wind Shrine'],{w:3,d:3});
 add('green','race','activity',3,10,['Tantangan Panjat','Climb Challenge'],undefined,'dragon-treat',24);
 // Ancient Ruins: scholar, relic merchant, puzzle, archive, tower.
 add('ruins','archive','hut',-9,-4,['Archive Tua','Old Archive'],{w:5,d:4});
 add('ruins','merchant','market',9,7,['Pasar Relik','Relic Market'],{w:4,d:3},undefined,0,{role:'merchant',name:['Ira Kolektor','Ira the Collector']});
 add('ruins','scholar','camp',-7,7,['Camp Arkeolog','Archaeologist Camp'],undefined,'herbal-tonic',18,{role:'clue',name:['Prof. Arga','Professor Arga'],clue:['Reruntuhan yang tenggelam bukan sekadar hiasan. Cari tiga relief yang menghadap danau; salah satunya menunjukkan tempat item rahasia disembunyikan.','The submerged ruins are not decoration. Find the three reliefs facing the lake; one points to where the secret item is hidden.']});
 add('ruins','statues','activity',0,-9,['Puzzle Patung','Statue Puzzle'],undefined,'ancient-coin',26);
 add('ruins','tower','tower',8,-9,['Menara Pengawas','Watchtower'],{w:4,d:4});
 // Chasm: miner market, clue NPC, bridge repair and cave.
 add('chasm','miner-market','market',-10,8,['Camp Penambang','Miner Camp'],{w:5,d:4},undefined,0,{role:'merchant',name:['Dara Miner','Miner Dara']});
 add('chasm','foreman','camp',8,8,['Pos Mandor','Foreman Post'],undefined,'camp-meal',18,{role:'clue',name:['Jati','Jati'],clue:['Di jurang, jalur tercepat bukan selalu yang paling tinggi. Cari lampu tua di dinding; itu menandai pijakan aman dan jalan menuju cache.','In the chasm, the fastest route is not always the highest one. Old lamps mark safe ledges and the route to a hidden cache.']});
 add('chasm','lift','activity',9,-1,['Perbaiki Lift','Repair Lift'],undefined,'iron-ore',26);
 add('chasm','side-cave','cave',9,-9,['Gua Samping','Side Cave'],{w:4,d:3});
 add('chasm','rope-cache','gather',-8,-8,['Cache Tali','Rope Cache'],undefined,'rope-fiber',14);
 // Giant Tree: canopy village, visible merchant, tree spirit clue, nest and root gathering.
 add('giant','canopy-village','treehouse',7,-7,['Desa Kanopi','Canopy Village'],{w:7,d:5});
 add('giant','merchant','market',10,1,['Pasar Kanopi','Canopy Market'],{w:4,d:3},undefined,0,{role:'merchant',name:['Lumi','Lumi']});
 add('giant','spirit','shrine',-8,7,['Shrine Roh Pohon','Tree Spirit Shrine'],{w:3,d:3},undefined,18,{role:'clue',name:['Roh Akar','Root Spirit'],clue:['Pohon Raksasa bukan tujuan biasa. Saat tiga Batu Mfeer dan item rahasia sudah siap, akar di bawahnya akan bereaksi. Cabang tertinggi hanya untuk mereka yang ingin mencari jalur langit.','The Giant Tree is no ordinary destination. When the three Mfeer Stones and the secret item are ready, its roots will react. The highest branch is for those seeking the sky route.']});
 add('giant','nest','activity',-9,-8,['Sarang Tersembunyi','Hidden Nest'],undefined,'dragon-treat',28);
 add('giant','root','gather',-10,10,['Akar Berenergi','Living Root'],undefined,'nature-fiber',16);
 // Underground layer.
 add('ug-flooded','explorer','camp',-8,8,['Camp Penjelajah Gua','Cave Explorer Camp'],undefined,'oxygen-flask',18,{role:'clue',name:['Kiko','Kiko'],clue:['Terowongan kering di sisi timur mengarah ke Cross Tunnel.','The dry eastern tunnel leads to the Cross Tunnel.']});
 add('ug-relic','altar','shrine',7,-7,['Altar Relik','Relic Altar'],{w:4,d:4});
 add('ug-xp','arena','activity',0,8,['Arena XP','XP Arena'],undefined,'guardian-token',40,{role:'quest',name:['Penjaga Arena','Arena Keeper']});
 add('ug-cross','trader','market',-7,-7,['Pedagang Bawah Tanah','Underground Trader'],{w:4,d:3},undefined,0,{role:'merchant',name:['Mako','Mako']});
 // Floating layer.
 add('sky-1','camp','camp',-6,6,['Camp Langit','Sky Camp'],undefined,'spring-water',16,{role:'clue',name:['Awan','Awan'],clue:['Ikuti arus angin yang ditandai vane; jangan melompat ke awan dekoratif.','Follow the currents marked by wind vanes; decorative clouds are not platforms.']});
 add('sky-1','merchant','market',7,4,['Kios Langit','Sky Stall'],{w:4,d:3},undefined,0,{role:'merchant',name:['Sora','Sora']});
 add('sky-2','guardian','activity',0,-8,['Guardian Hub','Guardian Hub'],undefined,'guardian-token',34,{role:'quest',name:['Sky Keeper','Sky Keeper']});
 add('sky-3','shrine','shrine',7,-7,['Sky Shrine','Sky Shrine'],{w:4,d:4});
 add('sky-3','crystal','gather',-7,8,['Kristal Awan','Cloud Crystal'],undefined,'cloud-crystal',22);
 // Final arc.
 add('inner','rest','camp',-7,6,['Camp Gerbang Dalam','Inner Gate Camp'],undefined,'camp-meal',20,{role:'rest',name:['Penjaga Gerbang','Gate Keeper'],clue:['Rakit senjata relic sebelum memasuki Boss Core.','Assemble the relic weapon before entering the Boss Core.']});
 add('inner','forge','shrine',7,5,['Stasiun Perakitan','Relic Assembly Station'],{w:4,d:4});
 add('boss','outer-west','tower',-9,6,['Pilar Outer Ring Barat','West Outer Ring Pillar'],{w:3,d:3});
 add('boss','outer-east','tower',9,6,['Pilar Outer Ring Timur','East Outer Ring Pillar'],{w:3,d:3});
 return out.filter(s=>enabled.has(s.arena));
}

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
