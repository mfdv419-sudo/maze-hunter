import type {Ledge} from './climbing';
import {settleRocks,fallenId,ROCK_LIMIT} from './fallen-rocks';
import {emptySupplies,inCone,type Supplies,type PropMove,type FireZone,type FoodKind} from './expedition-items';
import {courseDanger,platformCourse} from './platform-course';
import {fieldPose} from './field-obstacles';
import {fits,distances} from './maze';
import {AWAKEN_SECONDS} from './awakening';
import {cascadeSites} from './expedition-landmarks';
import {cakeKinds,type CakeKind} from './cake-powers';
import {fieldObstacles,fieldContact} from './field-obstacles';
import {bridgeFallZone,gorgeLandmarks} from './gorge-terrain';
import {sealEncounters} from './seal-encounters';
import {gorgeRiver} from './gorge-terrain';
import {aquaticSwimming,aquaticGround,aquaticChestDepth} from './aquatic';
import {biomeLayout,biomeElevation} from './biome-layout';
import {areaTime,type AdventureArea} from './areas';
import {forestLayout,forestElevation,inCave} from './forest-layout';
import {teamSealSites,type QuestTeam} from './quest-seals';
import {Climber,type ClimbSave} from './climbing';
import {adventureLayout,adventureRules} from './adventure-layout';
import {center,clearSegment,moveSliding,route,type Point,type Difficulty} from './maze';
export interface Guard {protector?:boolean;attack?:'charge'|'roll'|'bubble'|'spit';icing?:CakeKind;quest?:number;size?:'large'|'small';depth?:number;dash?:{from:Point;to:Point;at:number;until:number};position:Point;patrol:Point[];step:number;direction:number;hp:number;boss:boolean;slowUntil:number;stunUntil:number;hits:number;lastHit:number;nextShot:number;telegraphUntil:number;aim:Point;dead:boolean;vulnerableAt?:number;vulnerableUntil?:number;elite?:boolean;sapling?:boolean}
export interface Cake {style?:'bubble'|'spit'|'seed'|'flame'|'grenade'|'rock';shooter?:string;kind?:CakeKind;depth?:number;position:Point;velocity:Point;owner:'player'|'guard'|'boss';ttl:number}
export interface Hazard {id:number;kind:'slam'|'seed'|'roots'|'spin'|'vine'|'cataclysm'|'branch'|'charge'|'lightning'|'rockfall';point:Point;from:Point;at:number;end:number;radius:number;resolved:boolean}
export interface AdventureSave {fallenRocks?:Record<string,Point>;worldVersion?:number;supplies?:Supplies;strengthUntil?:number;eatingAt?:number;eatingKind?:FoodKind;propMoves?:Record<string,PropMove>;carried?:string|null;fireZones?:FireZone[];courseReward?:boolean;courseSteps?:number[];syncSeq?:number;lastRefillTick?:number;selectedCake?:CakeKind;cakeStock?:Record<Exclude<CakeKind,'normal'>,number>;bossAwakeAt?:number;depth?:number;diving?:boolean;lastDive?:number;lastLoot?:AdventureState['lastLoot'];climb?:ClimbSave;climbed?:number[];visitedZones?:number[];position:Point;checkpoint:Point;elapsed:number;lives:number;ammo:number;seals:number[];stars:number[];chests:number[];broken:string[];harvested:number[];coins:number;keys:number;buffUntil:number;shield:number;guards:Guard[];projectiles:Cake[];hazards:Hazard[];stage:'explore'|'boss'|'escape';escapeAt:number;escapeDuration:number;phase:'playing'|'won'|'lost';reason:'time'|'lives'|'escape'|null;resetFogRevision:number;respawns:number;revision:number;invulnerableUntil:number;slowUntil:number;stunUntil:number;hits:number;lastHit:number;lastThrow:number;lastJump:number;hazardId:number;nextBossSkill:number;nextEscapeHazard:number;message:string;messageAt:number}
export class AdventureState {
 supplies=emptySupplies();strengthUntil=0;eatingAt=-100;eatingKind:FoodKind='chili';propMoves:Record<string,PropMove>={};carried:string|null=null;fireZones:FireZone[]=[];courseReward=false;courseSteps:number[]=[];
 syncSeq=0;lastRefillTick=0;rewardEvents:{player:string;cakes:number}[]=[];
 selectedCake:CakeKind='normal';cakeStock={red:3,yellow:3,green:3};
 selectCake(kind:string){if(!cakeKinds.includes(kind as CakeKind))return false;this.selectedCake=kind as CakeKind;this.revision++;return true;}
 bossAwakeAt=-1;readonly teamSize:number;
 depth=0;diving=false;lastDive=-10;
 get swimming(){return aquaticSwimming(this.area,this.position,this.layout)&&this.climber.elevation<.1;}
 refillCakes(){const tick=Math.floor(this.elapsed/2);if(tick<=this.lastRefillTick)return;this.lastRefillTick=tick;if(this.bossRefilling||Math.hypot(this.position.x-this.checkpoint.x,this.position.y-this.checkpoint.y)<.5||this.expedition&&this.layout.seals.slice(0,3).some(p=>Math.hypot(this.position.x-p.x-.5,this.position.y-p.y-.5)<6))this.ammo=Math.min(8,this.ammo+1);}
 toggleDive(){if(this.phase!=='playing'||!this.swimming||this.elapsed-this.lastDive<.45)return false;this.lastDive=this.elapsed;this.diving=!this.diving;this.revision++;return true;}
 lastLoot?:{id:number;coins:number;keys:number;cakes:number;hearts:number};
 readonly layout;readonly grid;readonly obstacles;guards:Guard[];climber=new Climber();climbed=new Set<number>();visitedZones=new Set<number>();
 fallenRocks:Record<string,Point>={};
 position:Point;checkpoint:Point;elapsed=0;lives=3;ammo=6;seals=new Set<number>();stars=new Set<number>();chests=new Set<number>();broken=new Set<string>();harvested=new Set<number>();projectiles:Cake[]=[];hazards:Hazard[]=[];
 coins=0;keys=0;buffUntil=0;shield=0;stage:'explore'|'boss'|'escape'='explore';escapeAt=-1;escapeDuration=90;nextEscapeHazard=0;nextBossSkill=0;hazardId=0;
 invulnerableUntil=0;slowUntil=0;stunUntil=0;hits=0;lastHit=-100;lastThrow=-100;lastJump=-100;resetFogRevision=0;respawns=0;revision=0;message='';messageAt=-10;
 effectEvents:{id:number;source:'guard'|'boss'|'river'|'cake'|'environment'|'fall';point:Point;cake?:CakeKind}[]=[];effectId=0;
 phase:'playing'|'won'|'lost'='playing';reason:'time'|'lives'|'escape'|null=null;
 constructor(readonly difficulty:Difficulty,readonly mapIndex:number,readonly variation=1,readonly sample=false,team?:QuestTeam,readonly area:AdventureArea='classic') {
  this.teamSize=team?.shared?Math.max(1,team.slots.length):1;
  this.layout=sample?forestLayout():area==='classic'?adventureLayout(difficulty,mapIndex,variation):biomeLayout(area,difficulty,mapIndex,variation);const encounters=this.expedition?sealEncounters(this.layout):[];if(team)this.layout.seals=teamSealSites(this.layout,team,this.area);this.grid=this.layout.maze.grid.map(r=>[...r]);
  this.obstacles=this.expedition?fieldObstacles(this.layout,this.area):[];
  this.position=center(this.layout.maze.start);this.checkpoint={...this.position};
  this.guards=[...this.layout.patrols.map((p,i)=>({patrol:p,boss:false,elite:i>=adventureRules[difficulty].guards})),...this.layout.bosses.map(p=>({patrol:[p],boss:true,elite:false}))].map(({patrol,boss,elite})=>this.makeGuard(patrol,boss,elite));
  if(this.expedition){const keepers=encounters.map(e=>({...this.makeGuard(e.patrol,false,e.size==='large'),quest:e.quest,size:e.size,hp:this.difficulty==='easy'?(e.size==='large'?3:1):e.size==='large'?5:2}));this.guards=[...keepers,...this.guards.slice(3)];if(this.area==='sea')this.guards.filter(g=>g.boss).forEach(g=>g.depth=.8);}
 }
 get physicalLedges():Ledge[]{
 const debris:Ledge[]=Object.entries(this.fallenRocks).filter(([id])=>!this.propMoves[id]?.holder).map(([id,p])=>({id:fallenId(id),point:{x:(this.propMoves[id]||p).x-.5,y:(this.propMoves[id]||p).y-.5},height:.8+(this.propMoves[id]?.elevation||0),width:.8,depth:.8,kind:'rock'}));
 const fixed=this.layout.ledges.filter(l=>this.propMoves[String(l.id)]?.holder===undefined).map(l=>({...l,height:l.height+(this.propMoves[String(l.id)]?.elevation||0),...(l.kind==='log'?{width:3,depth:.8}:{}),point:this.propMoves[String(l.id)]?{x:this.propMoves[String(l.id)].x-.5,y:this.propMoves[String(l.id)].y-.5}:l.point}));
 return [...debris,...fixed,...Object.entries(this.propMoves).filter(([id,p])=>id.startsWith('field-')&&!p.holder).map(([id,p])=>({id:1000+Number(id.slice(6)),point:{x:p.x-.5,y:p.y-.5},height:.8,kind:'rock' as const}))];
 }
 useSupply(kind:string,angle:number){if(this.phase!=='playing'||this.awakening)return false;
  if(kind==='craft-grenade'){if(!this.ammo||!this.supplies.chili)return false;this.ammo--;this.supplies.chili--;this.supplies.grenade++;this.notify('crafted');return true;}
  if(kind==='lift'){if(this.elapsed>=this.strengthUntil||this.carried)return false;const candidates=this.layout.ledges.filter(l=>['tree','log','rock'].includes(l.kind||'')&&!this.layout.stars.some(p=>p.x===l.point.x&&p.y===l.point.y)).map(l=>({id:String(l.id),p:this.propMoves[String(l.id)]||center(l.point)}));for(const[id,p]of Object.entries(this.fallenRocks))candidates.push({id,p:this.propMoves[id]||p});const found=candidates.filter(o=>!o.p.holder&&Math.hypot(o.p.x-this.position.x,o.p.y-this.position.y)<1.6).sort((a,b)=>Math.hypot(a.p.x-this.position.x,a.p.y-this.position.y)-Math.hypot(b.p.x-this.position.x,b.p.y-this.position.y))[0];if(!found)return false;this.carried=found.id;this.propMoves[found.id]={x:found.p.x,y:found.p.y,holder:'local'};this.notify('lifted');return true;}
  if(kind==='place'||kind==='throw-object'){if(!this.carried)return false;const id=this.carried,p={x:this.position.x+Math.sin(angle)*1.25,y:this.position.y+Math.cos(angle)*1.25};let elevation=0;if(kind==='place'){const support=this.physicalLedges.filter(l=>l.kind==='rock'&&l.height<4&&Math.hypot(l.point.x+.5-p.x,l.point.y+.5-p.y)<.7).sort((a,b)=>b.height-a.height)[0];if(support){p.x=support.point.x+.5;p.y=support.point.y+.5;elevation=support.height;}}if(!fits(this.grid,p,.35)||[...this.layout.seals,this.layout.maze.finish].some(q=>Math.hypot(p.x-q.x-.5,p.y-q.y-.5)<1.4))return false;const nav=this.grid.map(r=>[...r]);nav[Math.floor(p.y)][Math.floor(p.x)]=1;const reachable=distances(nav,this.layout.maze.start);if([...this.layout.seals,this.layout.fortress,this.layout.maze.finish].some(q=>!reachable.has(q.x+','+q.y)))return false;this.propMoves[id]={...p,elevation};this.carried=null;if(kind==='throw-object')this.projectiles.push({position:{...this.position},velocity:{x:Math.sin(angle)*5,y:Math.cos(angle)*5},owner:'player',style:'rock',kind:'red',ttl:.5,depth:this.depth});this.notify('placed');return true;}
  if(kind==='food-grenade'){if(!this.supplies.grenade||this.elapsed-this.lastThrow<.65)return false;this.supplies.grenade--;this.lastThrow=this.elapsed;this.projectiles.push({position:{...this.position},velocity:{x:Math.sin(angle)*5,y:Math.cos(angle)*5},owner:'player',style:'grenade',kind:'red',depth:this.depth,ttl:1});return true;}
  const food=kind.slice(5)as FoodKind;if(!['chili','watermelon','spinach'].includes(food)||!this.supplies[food]||this.elapsed-this.eatingAt<1)return false;this.supplies[food]--;this.eatingKind=food;this.eatingAt=this.elapsed;
  if(food==='spinach'){this.strengthUntil=this.elapsed+25;this.notify('strength');return true;}
  const count=food==='chili'?5:7;for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*(food==='chili'?.12:.045);this.projectiles.push({position:{x:this.position.x+Math.sin(a)*.25,y:this.position.y+Math.cos(a)*.25},velocity:{x:Math.sin(a)*(food==='chili'?4:7),y:Math.cos(a)*(food==='chili'?4:7)},owner:'player',style:food==='chili'?'flame':'seed',kind:food==='chili'?'red':'normal',depth:this.depth,ttl:food==='chili'?.6:1.1});}this.notify(food);return true;
 }
 private explode(c:Cake){this.fireZones.push({id:++this.hazardId,point:{...c.position},at:this.elapsed,end:this.elapsed+2.4,lastTick:-1,...(c.shooter?{shooter:c.shooter}:{})});this.effectEvents.push({id:++this.effectId,source:'cake',cake:'red',point:{...c.position}});}
 private makeGuard(patrol:Point[],boss=false,elite=false):Guard{return{attack:this.area==='mountain'?'charge':(this.area==='forest'||this.sample)&&!boss?'roll':this.area==='coast'||this.area==='sea'||this.area==='gorge'&&!boss?'bubble':'spit',position:center(patrol[0]),patrol,step:0,direction:1,hp:boss?this.bossMaxHP:elite?5:3,boss,elite,slowUntil:0,stunUntil:0,hits:0,lastHit:-100,nextShot:this.elapsed+3,telegraphUntil:0,aim:{x:0,y:0},dead:false};}
 get expedition(){return this.sample||this.area!=='classic';}
 get sealGoal(){return Math.max(3,this.layout.seals.length);}
 get arenaRadius(){return this.layout.forest?.arenaRadius??4.2;}
 get bossMaxHP(){return Math.round({easy:8,medium:12,hard:18,extreme:24}[this.difficulty]*(1+.65*(this.teamSize-1)));}
 get bossAwake(){return this.bossAwakeAt>=0;}
 get awakening(){return this.expedition&&this.bossAwake&&this.elapsed<this.bossAwakeAt+AWAKEN_SECONDS;}
 private awakenKing(){if(!this.expedition||this.bossAwake||this.bossCleared||this.seals.size<this.sealGoal)return;this.bossAwakeAt=this.elapsed;this.nextBossSkill=this.elapsed+AWAKEN_SECONDS;this.projectiles=[];this.hazards=[];this.notify('king-awakening');const f=this.layout.fortress;for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const pool=this.layout.areas.filter(a=>a.zone===5).map(a=>a.point);let start={x:Math.round(f.x+Math.sin(a)*5),y:Math.round(f.y+Math.cos(a)*5)};if(this.grid[start.y]?.[start.x]!==0)start=pool[0]||f;const path=route(this.grid,start,f);if(path.length){const guard=this.makeGuard(path);guard.protector=true;this.guards.push(guard);}}this.revision++;}
 get bossPhase(){const g=this.guards.find(g=>g.boss);return !g?1:g.hp/this.bossMaxHP<.3?3:g.hp/this.bossMaxHP<.7?2:1;}
 get zone(){return this.stage==='escape'?6:this.layout.zoneCells[Math.floor(this.position.y)]?.[Math.floor(this.position.x)]??0;}
 get limit(){return this.sample?1500:areaTime(this.area,this.difficulty);}
 sealUnlocked(index:number){return !this.expedition||this.guards.filter(g=>g.quest===index%3).every(g=>g.dead);}
 questRemaining(index:number){return this.guards.filter(g=>g.quest===index%3&&!g.dead);}
 get bossVulnerable(){const g=this.guards.find(g=>g.boss);return !this.expedition||!!g&&this.elapsed>=(g.vulnerableAt??Infinity)&&this.elapsed<(g.vulnerableUntil??0);}
 get bossCleared(){return this.guards.some(g=>g.boss&&g.dead);}
 get bossRefilling(){return this.phase==='playing'&&this.stage!=='escape'&&this.seals.size===this.sealGoal&&this.guards.some(g=>g.boss&&!g.dead)&&Math.hypot(this.position.x-(this.layout.fortress.x+.5),this.position.y-(this.layout.fortress.y+.5))<this.arenaRadius;}
 get gateOpen(){return this.seals.size===this.sealGoal&&this.bossCleared;}
 get remaining(){return this.stage==='escape'?Math.max(0,this.escapeDuration-(this.elapsed-this.escapeAt)):Math.max(0,this.limit-this.elapsed);}
 get speedFactor(){return this.elapsed<this.stunUntil?0:(this.elapsed<this.slowUntil?.55:1)*(this.elapsed<this.buffUntil?1.3:1)*(this.area==='gorge'&&gorgeRiver(this.position.x,this.position.y,this.layout).wet>.55?.72:1)*(this.sample&&inCave(this.position.x,this.position.y)&&forestElevation(this.position.x,this.position.y)<-.15?.68:1);}
 get interaction(){if(this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.6))return'harvest';if(this.layout.grass.some(p=>!this.broken.has(`${p.x},${p.y}`)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.35))return'cut';if(this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.1))return'harvest';return'cake';}
 notify(message:string){this.message=message;this.messageAt=this.elapsed;}
 startEscape(){if(this.stage==='escape')return;this.stage='escape';for(const p of this.layout.escapeConnector){this.grid[p.y][p.x]=0;this.broken.add(`${p.x},${p.y}`);}this.escapeAt=this.elapsed;const safe=this.layout.escapeRoutes[0].length;this.escapeDuration=Math.max(45,Math.min(90,Math.ceil(safe/1.5+22)));this.nextEscapeHazard=this.elapsed+4;this.hazards=[];this.projectiles=[];this.notify('escape');this.revision++;}
 shotClear(from:Point,to:Point){if(!clearSegment(this.grid,from,to,.04))return false;if(!this.expedition)return true;const ledges=this.physicalLedges,forest=this.layout.forest!,staticProps=[...forest.trunks.map(p=>({...p,r:.26})),...forest.pillars.map(p=>({...p,r:.26})),...forest.boulders.map(p=>({...p,r:1.2}))].filter(p=>!this.layout.ledges.some(l=>l.point.x===p.x&&l.point.y===p.y&&this.propMoves[String(l.id)]));const n=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/.08));for(let i=1;i<=n;i++){const x=from.x+(to.x-from.x)*i/n,y=from.y+(to.y-from.y)*i/n;if(staticProps.some(p=>Math.hypot(x-p.x-.5,y-p.y-.5)<p.r)||ledges.some(l=>Math.abs(x-l.point.x-.5)<(l.width?l.width/2:.45)&&Math.abs(y-l.point.y-.5)<(l.depth?l.depth/2:.45)))return false;}return true;}
 throwCake(angle:number) {
  if(this.phase!=='playing'||this.awakening||this.elapsed-this.lastThrow<.65||this.elapsed<this.stunUntil)return false;
  this.lastThrow=this.elapsed;
  const grass=this.layout.grass.find(p=>!this.broken.has(`${p.x},${p.y}`)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.35);
  if(grass&&!this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.6)){if(this.layout.secret&&grass.x===this.layout.secret.x&&grass.y===this.layout.secret.y){if(!this.keys){this.notify('key-needed');return false;}this.keys--;}this.broken.add(`${grass.x},${grass.y}`);this.grid[grass.y][grass.x]=0;this.revision++;this.notify('grass');for(const g of this.guards)if(!g.boss&&!g.dead&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<6){g.patrol=route(this.grid,{x:Math.floor(g.position.x),y:Math.floor(g.position.y)},{x:Math.floor(this.position.x),y:Math.floor(this.position.y)});g.step=0;}return true;}
  const vegetation=this.layout.vegetation.findIndex((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.1);
  if(vegetation>=0){const p=this.layout.vegetation[vegetation];this.harvested.add(vegetation);if(p.kind==='rare')this.supplies.spinach++;else if(p.kind==='tall')this.supplies[(vegetation%2?'chili':'watermelon')]++;this.coins+=p.kind==='rare'?10:p.kind==='danger'?8:2;this.ammo=Math.min(8,this.ammo+2);if(p.kind==='rare'){this.keys++;this.shield=1;this.buffUntil=this.elapsed+12;}if(p.kind==='danger')this.spawnSapling(p);this.revision++;this.notify(p.kind);return true;}
  if(this.selectedCake!=='normal'&&!this.cakeStock[this.selectedCake]){this.notify('super-empty');return false;}
  if(!this.ammo){this.notify('ammo');return false;}this.ammo--;if(this.selectedCake!=='normal')this.cakeStock[this.selectedCake]--;
  let dx=Math.sin(angle),dy=Math.cos(angle);
  const target=this.guards.filter(g=>!g.dead&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<5&&this.shotClear(this.position,g.position)).sort((a,b)=>Math.hypot(a.position.x-this.position.x,a.position.y-this.position.y)-Math.hypot(b.position.x-this.position.x,b.position.y-this.position.y))[0];
  if(target){const n=Math.hypot(target.position.x-this.position.x,target.position.y-this.position.y);if(n){dx=(target.position.x-this.position.x)/n;dy=(target.position.y-this.position.y)/n;}}
  this.projectiles.push({position:{...this.position},velocity:{x:dx*6,y:dy*6},owner:'player',kind:this.selectedCake,depth:this.depth,ttl:1.25});return true;
 }
 damage(source:'guard'|'boss'|'river'|'environment'|'fall') {
  if(this.phase!=='playing'||this.awakening||this.elapsed<this.invulnerableUntil)return;
  this.effectEvents.push({id:++this.effectId,source,point:{...this.position}});this.effectEvents=this.effectEvents.slice(-32);this.invulnerableUntil=this.elapsed+1.4;
  if(this.shield&&source!=='river'&&source!=='fall'){this.shield=0;this.notify('shield');return;}
  if(source==='guard') {if(this.elapsed-this.lastHit>7)this.hits=0;this.lastHit=this.elapsed;this.hits++;
   if(this.hits===1){this.slowUntil=this.elapsed+3;this.notify('slow');return;}
   if(this.hits===2){this.stunUntil=this.elapsed+1;this.notify('stun');return;}}
  if(this.carried){delete this.propMoves[this.carried];this.carried=null;}this.depth=0;this.diving=false;this.climber.reset();this.lives--;this.respawns++;this.hits=0;this.slowUntil=0;this.stunUntil=0;this.projectiles=[];
  const reset=source==='boss'&&this.difficulty!=='medium'&&this.stage!=='escape';
  this.position={...(reset?center(this.layout.maze.start):this.checkpoint)};
  if(reset)this.resetFogRevision++;
  this.notify(reset?'boss-reset':'respawn');if(this.lives<=0){this.phase='lost';this.reason='lives';}
 }
 hitGuard(g:Guard,kind:CakeKind='normal') {
  if(g.dead||this.awakening)return;
  if(g.boss&&this.expedition&&!this.bossAwake){this.notify('king-dormant');return;}
  if(g.boss&&this.expedition&&this.seals.size===this.sealGoal&&(!this.bossVulnerable||this.elapsed-g.lastHit<.5)){if(this.elapsed-this.messageAt>1)this.notify('king-armored');return;}
  if(g.boss&&this.seals.size<this.sealGoal){this.notify('king-seals');return;}
  this.effectEvents.push({id:++this.effectId,source:'cake',cake:kind,point:{...g.position}});this.effectEvents=this.effectEvents.slice(-32);
  if(this.elapsed-g.lastHit>7&&!g.boss){g.hits=0;}
  g.lastHit=this.elapsed;g.hits++;g.icing=kind;g.hp-=kind==='red'?2:1;if(kind==='yellow')g.stunUntil=this.elapsed+(g.boss?.6:3);if(kind==='green')g.slowUntil=this.elapsed+5;
  if(g.hp<=0){g.dead=true;this.ammo=Math.min(8,this.ammo+3);this.notify(g.boss?'boss-win':'guard-win');this.revision++;if(g.boss)this.startEscape();}
  else if(!g.boss){if(g.hits%3===2)g.stunUntil=Math.max(g.stunUntil,this.elapsed+1);else g.slowUntil=Math.max(g.slowUntil,this.elapsed+3);}
 }
 private spawnSapling(p:Point){if(this.guards.filter(g=>!g.dead&&!g.boss).length>=48||this.guards.length>=64)return;const target={x:Math.floor(this.position.x),y:Math.floor(this.position.y)},path=route(this.grid,p,target);if(path.length){const g=this.makeGuard(path);g.sapling=true;this.guards.push(g);}}
 private warn(kind:Hazard['kind'],point:Point,radius:number,delay=1.5,from=point){this.hazards.push({id:++this.hazardId,kind,point:{...point},from:{...from},radius,at:this.elapsed+delay,end:this.elapsed+delay+.55,resolved:false});}
 private bossSkill(g:Guard){if(this.expedition){
  const phase=this.bossPhase,k=Math.floor(this.elapsed/2)%5,delay=phase===3?1.1:1.55;
  g.vulnerableAt=this.elapsed+delay;g.vulnerableUntil=this.elapsed+delay+(phase===3?1.4:1.9);
  if(this.area==='gorge'){
   // Stone monarch: readable slams, a charge and staggered falling rocks, no forest roots or lightning.
   const attack=Math.floor(this.elapsed/4.6)%3;
   if(attack===0)this.warn('slam',g.position,3.5,delay);
   else if(attack===1)this.warn('charge',this.position,.85,delay,g.position);
   else for(let i=0;i<phase+1;i++)this.warn('rockfall',{x:this.position.x+Math.sin(i*2.4)*i*.8,y:this.position.y+Math.cos(i*2.4)*i*.8},.85,delay+i*.3);
   return;
  }
  if(!['forest','classic'].includes(this.area)){const kind=this.area==='mountain'?(['lightning','charge','slam'] as const)[k%3]:this.area==='desert'?(['rockfall','charge','spin'] as const)[k%3]:(['spin','charge','slam'] as const)[k%3];this.warn(kind,kind==='slam'||kind==='spin'?g.position:this.position,kind==='slam'?3.5:kind==='spin'?3:1,delay,g.position);return;}
  if(k===0)this.warn('slam',g.position,3.6,delay);
  else if(k===1){this.warn('lightning',this.position,1.05,delay);if(phase>1)this.warn('lightning',{x:this.position.x-1.6,y:this.position.y+1.2},.9,delay+.35);}
  else if(k===2){for(let i=0;i<3+phase;i++){const a=(this.hazardId+i*2.4)*1.71,r=i?1.4+(i%2)*1.2:0;this.warn('roots',{x:this.position.x+Math.sin(a)*r,y:this.position.y+Math.cos(a)*r},.7,delay+i*.12);}}
  else if(k===3)this.warn('charge',this.position,.85,delay,g.position);
  else {this.warn('spin',g.position,3,delay);if(phase>1)this.spawnSapling({x:Math.floor(g.position.x),y:Math.floor(g.position.y)});}
  return;
 }const phase=this.bossPhase,k=Math.floor(this.elapsed/3)%3;
  if(phase===1){if(k===0)this.warn('slam',g.position,2.8,1.6);else if(k===1)this.warn('seed',this.position,.85,1.5);else this.spawnSapling({x:Math.floor(g.position.x),y:Math.floor(g.position.y)});}
  else if(phase===2){if(k===0)this.warn('roots',this.position,.8,1.6);else if(k===1)this.warn('spin',g.position,2,1.6);else{this.warn('vine',this.position,.55,1.6,g.position);if(this.difficulty!=='medium')this.spawnSapling({x:Math.floor(g.position.x),y:Math.floor(g.position.y)});}}
  else {if(k===0)this.warn('cataclysm',g.position,3.7,2.2);else if(k===1){this.warn('branch',this.position,.8,1.7);this.spawnSapling({x:Math.floor(g.position.x),y:Math.floor(g.position.y)});}else this.warn('charge',this.position,.65,1.9,g.position);}
 }
 private updateHazards(jump:number){for(const h of this.hazards){if(h.resolved||this.elapsed<h.at)continue;h.resolved=true;if(h.kind==='rockfall'&&Object.keys(this.fallenRocks).length<ROCK_LIMIT)this.fallenRocks[`fallen-900-${h.id}`]={...h.point};if(this.expedition&&h.kind==='charge'){const g=this.guards.find(g=>g.boss&&!g.dead);if(g){const dx=h.point.x-g.position.x,dy=h.point.y-g.position.y,d=Math.hypot(dx,dy),k=this.area==='gorge'?Math.max(0,d-1.55)/(d||1):1;if(this.area==='gorge')g.dash={from:{...g.position},to:moveSliding(this.grid,g.position,dx*k,dy*k,.4),at:this.elapsed,until:this.elapsed+.36};else g.position=moveSliding(this.grid,g.position,dx*k,dy*k,.4);}}const d=Math.hypot(this.position.x-h.point.x,this.position.y-h.point.y);let inside=d<h.radius;
   if(h.kind==='charge'||h.kind==='vine'){const vx=h.point.x-h.from.x,vy=h.point.y-h.from.y,l=vx*vx+vy*vy,t=Math.max(0,Math.min(1,((this.position.x-h.from.x)*vx+(this.position.y-h.from.y)*vy)/(l||1)));inside=Math.hypot(this.position.x-h.from.x-vx*t,this.position.y-h.from.y-vy*t)<h.radius;}
   if(inside&&jump<.22&&this.depth<.75){if(h.kind==='roots'){this.slowUntil=this.elapsed+2;this.notify('roots');}else this.damage(this.stage==='escape'?'guard':'boss');}}
  this.hazards=this.hazards.filter(h=>h.end>this.elapsed);
 }
 step(dt:number,raw:number,dx:number,dy:number,jump:number,movementOnly=false,predictOnly=false) {
  if(this.phase!=='playing')return;this.elapsed+=Math.max(0,raw);
  if(this.stage==='escape'&&this.remaining<=0){this.phase='lost';this.reason='escape';return;}
  if(this.stage!=='escape'&&this.elapsed>=this.limit){this.phase='lost';this.reason='time';return;}
  if(this.elapsed-this.lastHit>7)this.hits=0;
  if(this.awakening){dx=0;dy=0;}
  const previous={...this.position},next=moveSliding(this.grid,this.position,dx*dt*this.speedFactor,dy*dt*this.speedFactor,.13);
  const climbing=this.climber.step(previous,next,{x:dx,y:dy},jump,dt,this.physicalLedges);this.position=climbing.position;
  if(this.expedition&&this.climber.elevation<.5)for(const obstacle of [...this.layout.forest!.trunks.map(p=>({...p,r:.34})),...this.layout.forest!.pillars.map(p=>({...p,r:.38})),...this.layout.forest!.boulders.map(p=>({...p,r:1.35}))]){if(this.layout.ledges.some(l=>l.point.x===obstacle.x&&l.point.y===obstacle.y&&this.propMoves[String(l.id)]))continue;const x=this.position.x-obstacle.x-.5,y=this.position.y-obstacle.y-.5,d=Math.hypot(x,y);if(d<obstacle.r){const k=obstacle.r/Math.max(.001,d);this.position={x:obstacle.x+.5+(d?x:.001)*k,y:obstacle.y+.5+y*k};}}
  if(!predictOnly&&climbing.reached!==null&&!this.climbed.has(climbing.reached)){this.climbed.add(climbing.reached);this.coins+=5;this.notify('climb');}
  if(!predictOnly&&!this.visitedZones.has(this.zone)){this.visitedZones.add(this.zone);this.coins+=3;this.revision++;}
  jump=Math.max(jump,this.climber.elevation);
  if(!predictOnly&&jump<.08&&this.layout.rivers.some(p=>Math.floor(this.position.x)===p.x&&Math.floor(this.position.y)===p.y))this.damage('river');
  if(!this.swimming){this.depth=0;this.diving=false;}else{const max=Math.max(0,-aquaticGround(this.area,this.position.x,this.position.y,this.layout)-.72),target=this.diving?Math.min(2.6,max):0;this.depth+=Math.max(-dt*1.8,Math.min(dt*1.8,target-this.depth));}
  if(predictOnly){this.projectiles=this.projectiles.filter(c=>{c.ttl-=dt;const next={x:c.position.x+c.velocity.x*dt,y:c.position.y+c.velocity.y*dt};if(c.ttl<=0||!clearSegment(this.grid,c.position,next,.04))return false;c.position=next;return true;});return;}
  settleRocks(this.fallenRocks,this.obstacles,this.elapsed,this.difficulty==='easy');
  const pickup=(list:Point[],set:Set<number>,kind:string)=>list.forEach((p,i)=>{if((kind!=='star'||!this.expedition||!this.layout.ledges.some(l=>l.point.x===p.x&&l.point.y===p.y&&Math.max(jump,this.climber.elevation)<l.height-.12))&&(kind==='chest'||this.depth<.55)&&(kind!=='chest'||Math.abs(this.depth-aquaticChestDepth(this.area,i,p,this.layout))<.55)&&!set.has(i)&&(kind!=='seal'||this.sealUnlocked(i))&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.48){set.add(i);this.revision++;this.notify(kind);if(kind==='seal'){this.checkpoint=center(p);this.ammo=Math.min(8,this.ammo+2);}if(kind==='chest'){this.lastLoot={id:i,coins:5,keys:1,cakes:8-this.ammo,hearts:Math.min(1,3-this.lives)};this.ammo=8;this.supplies.chili+=2;this.supplies.watermelon+=2;this.supplies.spinach+=1;for(const k of ['red','yellow','green']as const)this.cakeStock[k]=Math.min(5,this.cakeStock[k]+1);this.lives=Math.min(3,this.lives+1);this.coins+=5;this.keys++;}}});
  pickup(this.layout.seals,this.seals,'seal');pickup(this.layout.stars,this.stars,'star');pickup(this.layout.chests,this.chests,'chest');
  if(this.expedition){
   if(this.area==='volcano'&&jump<.4&&cascadeSites(this.layout).some(p=>Math.hypot(this.position.x-p.x-p.dx*.6,this.position.y-p.y-p.dz*.6)<1.3))this.damage('environment');
   if(this.area==='gorge'){const b=gorgeLandmarks(this.layout).bridge;if(Math.abs(this.position.y-b.y)<.4&&Math.abs(this.position.x-b.x)>1.8&&Math.abs(this.position.x-b.x)<2.8)this.checkpoint={...this.position};if(bridgeFallZone(this.position.x,this.position.y,this.layout)&&jump<.6)this.damage('fall');}
   const course=platformCourse(this.layout,this.area);if(course&&jump<.25){course.stones.forEach((p,i)=>{if(Math.hypot(this.position.x-p.x,this.position.y-p.y)<.48&&!this.courseSteps.includes(i))this.courseSteps.push(i);});if(this.courseSteps.length===course.stones.length&&!this.courseReward){this.courseReward=true;this.coins+=10;this.ammo=Math.min(8,this.ammo+2);this.notify('course-win');}}
   if(courseDanger(this.layout,this.area,this.position.x,this.position.y,this.difficulty==='easy')&&jump<.2)this.damage('fall');
   for(const h of this.obstacles)if(!this.propMoves['field-'+h.id]&&!(h.kind==='rock'&&(this.fallenRocks[`fallen-${h.id}-${Math.floor((this.elapsed+h.phase)/(h.period*(this.difficulty==='easy'?1.5:1)))}`]||Object.keys(this.fallenRocks).length>=ROCK_LIMIT))&&fieldContact(h,this.elapsed,this.position,jump,this.depth,this.difficulty==='easy')){this.damage('environment');this.notify(h.kind==='trash'?'trash-hit':'obstacle-hit');}
  }
  this.refillCakes();
  if(movementOnly)return;
  if(this.carried&&this.elapsed>=this.strengthUntil){delete this.propMoves[this.carried];this.carried=null;}
  for(const fire of this.fireZones)if(Math.floor((this.elapsed-fire.at)*3)>fire.lastTick){fire.lastTick=Math.floor((this.elapsed-fire.at)*3);for(const g of this.guards)if(!g.dead&&Math.hypot(g.position.x-fire.point.x,g.position.y-fire.point.y)<1.6&&clearSegment(this.grid,fire.point,g.position,.05)){this.hitGuard(g,'red');if(g.dead&&fire.shooter)this.rewardEvents.push({player:fire.shooter,cakes:3});}}this.fireZones=this.fireZones.filter(f=>f.end>this.elapsed);
  this.awakenKing();
  const king=this.guards.find(g=>g.boss),inArena=Math.hypot(this.position.x-(this.layout.fortress.x+.5),this.position.y-(this.layout.fortress.y+.5))<this.arenaRadius;
  if(king&&inArena&&this.bossRefilling){if(!this.bossAwake){this.bossAwakeAt=this.elapsed;this.nextBossSkill=this.elapsed;this.notify('king-awakening');}if(this.stage!=='boss'){this.stage='boss';this.checkpoint={x:this.layout.fortress.x+2.5,y:this.layout.fortress.y+.5};if(this.grid[Math.floor(this.checkpoint.y)]?.[Math.floor(this.checkpoint.x)]!==0)this.checkpoint={...this.position};this.notify('fortress');}if(this.elapsed>=this.nextBossSkill){this.bossSkill(king);this.nextBossSkill=this.elapsed+(this.expedition?(this.bossPhase===3?3.4:4.6):(this.bossPhase===3?2.8:3.8));}}
  if(this.bossCleared&&this.seals.size===this.sealGoal&&this.stage!=='escape')this.startEscape();
  if(this.stage==='escape'&&this.elapsed>=this.nextEscapeHazard){this.warn('branch',this.position,.65,1.7);this.nextEscapeHazard=this.elapsed+4;}
  this.updateHazards(jump);
  for(const g of this.guards) {
   if(g.dead||this.stage==='escape'||this.awakening&&!g.protector||g.boss&&this.expedition&&(!this.bossAwake||this.elapsed<this.bossAwakeAt+AWAKEN_SECONDS))continue;
   if(this.area==='sea'){const targetDepth=aquaticSwimming(this.area,g.position,this.layout)?Math.min(2.6,this.depth):0;g.depth=(g.depth||0)+Math.max(-dt,Math.min(dt,targetDepth-(g.depth||0)));}
   const dashing=!!g.dash;
   if(g.dash){const dash=g.dash,t=Math.min(1,(this.elapsed-dash.at)/(dash.until-dash.at)),ease=t*t*(3-2*t),target={x:dash.from.x+(dash.to.x-dash.from.x)*ease,y:dash.from.y+(dash.to.y-dash.from.y)*ease};g.position=moveSliding(this.grid,g.position,target.x-g.position.x,target.y-g.position.y,.4);if(t>=1)delete g.dash;}

   if(this.expedition&&!g.boss&&!g.protector&&this.elapsed>=g.stunUntil&&!g.telegraphUntil&&this.elapsed%1<dt&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<5&&clearSegment(this.grid,g.position,this.position,.05)){g.patrol=route(this.grid,{x:Math.floor(g.position.x),y:Math.floor(g.position.y)},{x:Math.floor(this.position.x),y:Math.floor(this.position.y)});g.step=Math.min(1,g.patrol.length-1);g.direction=1;}
   if(!dashing&&!g.boss&&g.patrol.length>1&&this.elapsed>=g.stunUntil&&(!this.expedition||!g.telegraphUntil)) {const target=center(g.patrol[Math.min(g.step,g.patrol.length-1)]),d=Math.hypot(target.x-g.position.x,target.y-g.position.y),speed=this.elapsed<g.slowUntil?.45:g.elite?1.05:.85;
    if(d<.06){if(g.protector&&g.step===g.patrol.length-1){g.direction=0;}else if(g.step===g.patrol.length-1)g.direction=-1;if(g.step===0)g.direction=1;g.step+=g.direction;}else {const next=moveSliding(this.grid,g.position,(target.x-g.position.x)/d*speed*dt,(target.y-g.position.y)/d*speed*dt,.16);if(this.area!=='sea'||!g.boss||aquaticSwimming(this.area,next,this.layout))g.position=next;}}
   if(g.boss&&!dashing&&this.stage==='boss'&&this.seals.size===this.sealGoal&&(!this.expedition||!this.bossVulnerable)){
    const dx=this.position.x-g.position.x,dy=this.position.y-g.position.y,d=Math.hypot(dx,dy),speed=this.expedition?(this.bossPhase===3?1.6:1.2):.65;
    if(d>(this.area==='gorge'?1.65:.8)){const tx=dx/d+(d<2.5?dy/d*.7:0),ty=dy/d-(d<2.5?dx/d*.7:0),next=moveSliding(this.grid,g.position,tx*speed*dt,ty*speed*dt,.4);if(Math.hypot(next.x-this.layout.fortress.x-.5,next.y-this.layout.fortress.y-.5)<this.arenaRadius-.9&&(this.area!=='sea'||aquaticSwimming(this.area,next,this.layout)))g.position=next;}
   }
   const d=Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y);
   if(d<(g.boss?.55:.3)&&jump<.2&&Math.abs(this.depth-(g.depth||0))<.75)this.damage(g.boss?'boss':'guard');
   if(!this.awakening&&!dashing&&this.elapsed>=g.stunUntil&&d<(g.boss?(this.expedition?9:5):4.4)&&d>1&&clearSegment(this.grid,g.position,this.position,.05)&&(!g.boss||this.seals.size===this.sealGoal))if(!g.telegraphUntil&&this.elapsed>=g.nextShot){g.telegraphUntil=this.elapsed+(this.difficulty==='easy'?1.8:g.boss?1:1.2);g.aim={...this.position};}
   if(g.telegraphUntil&&this.elapsed>=g.telegraphUntil) {const vx=g.aim.x-g.position.x,vy=g.aim.y-g.position.y;
    const attack=g.attack||(this.area==='mountain'?'charge':(this.area==='forest'||this.sample)&&!g.boss?'roll':this.area==='coast'||this.area==='sea'||this.area==='gorge'&&!g.boss?'bubble':'spit');
    if(attack==='charge'||attack==='roll'){const distance=Math.hypot(vx,vy),limit=Math.min(distance,attack==='charge'?4.5:3.8),to=moveSliding(this.grid,g.position,vx/(distance||1)*limit,vy/(distance||1)*limit,.2);g.dash={from:{...g.position},to,at:this.elapsed,until:this.elapsed+(attack==='roll'?.8:.55)};}
    else for(const offset of g.boss&&(this.expedition||this.difficulty==='extreme')?[-.22,0,.22]:[0]){const a=Math.atan2(vy,vx)+offset;this.projectiles.push({style:attack==='bubble'?'bubble':'spit',position:{...g.position},velocity:{x:Math.cos(a)*(attack==='bubble'?2.6:3.5),y:Math.sin(a)*(attack==='bubble'?2.6:3.5)},owner:g.boss?'boss':'guard',depth:g.depth||0,ttl:2});}
    g.telegraphUntil=0;g.nextShot=this.elapsed+(g.boss?2.5:3.2);}
  }
  const keep:Cake[]=[];const respawnsBefore=this.respawns;
  for(const cake of this.projectiles) {cake.ttl-=dt;if(cake.ttl<=0){if(cake.style==='grenade')this.explode(cake);continue;}const next={x:cake.position.x+cake.velocity.x*dt,y:cake.position.y+cake.velocity.y*dt};if(!clearSegment(this.grid,cake.position,next,.04)){if(cake.style==='grenade')this.explode(cake);continue;}if(!this.shotClear(cake.position,next))continue;cake.position=next;let hit=false;
   if(cake.owner==='player'){for(const g of this.guards)if(!g.dead&&Math.abs((cake.depth||0)-(g.depth||0))<.75&&Math.hypot(g.position.x-next.x,g.position.y-next.y)<(g.boss?.55:.27)){if(cake.style==='grenade')this.explode(cake);else this.hitGuard(g,cake.kind);if(g.dead&&cake.shooter)this.rewardEvents.push({player:cake.shooter,cakes:3});hit=true;break;}}
   else if(jump<.22&&Math.abs((cake.depth||0)-this.depth)<.75&&Math.hypot(this.position.x-next.x,this.position.y-next.y)<.25){this.damage(cake.owner);hit=true;}
   if(this.respawns!==respawnsBefore){keep.length=0;break;}if(!hit)keep.push(cake);}
  this.projectiles=keep;

  const finish=center(this.layout.maze.finish);
  if(Math.hypot(this.position.x-finish.x,this.position.y-finish.y)<.45){if(this.gateOpen)this.phase='won';else if(this.elapsed-this.messageAt>3)this.notify('gate');}
 }
 acceptPosition(target:Point,jump:number){if(this.awakening)return;const start={...this.position},respawns=this.respawns,steps=Math.max(1,Math.ceil(Math.hypot(target.x-start.x,target.y-start.y)/.08));for(let i=1;i<=steps;i++){const q={x:start.x+(target.x-start.x)*i/steps,y:start.y+(target.y-start.y)*i/steps},input={x:(q.x-this.position.x)*25,y:(q.y-this.position.y)*25};this.position=this.climber.step(this.position,q,input,jump,0,this.physicalLedges).position;this.step(0,0,0,0,jump,true);if(this.respawns!==respawns||this.phase!=='playing'||this.climber.state.phase==='hanging'||this.climber.state.phase==='climbing')break;}}

 save():AdventureSave {const names=['fallenRocks','supplies','strengthUntil','eatingAt','eatingKind','propMoves','carried','fireZones','courseReward','courseSteps','syncSeq','lastRefillTick','selectedCake','cakeStock','bossAwakeAt','depth','diving','lastDive','lastLoot','position','checkpoint','elapsed','lives','ammo','coins','keys','buffUntil','shield','guards','projectiles','hazards','stage','escapeAt','escapeDuration','phase','reason','resetFogRevision','respawns','revision','invulnerableUntil','slowUntil','stunUntil','hits','lastHit','lastThrow','lastJump','hazardId','nextBossSkill','nextEscapeHazard','message','messageAt'] as const;const out:Record<string,unknown>={};for(const k of names)if(this[k]!==undefined)out[k]=this[k];return structuredClone({...out,climb:this.climber.state,climbed:[...this.climbed],visitedZones:[...this.visitedZones],seals:[...this.seals],stars:[...this.stars],chests:[...this.chests],broken:[...this.broken],harvested:[...this.harvested]}) as unknown as AdventureSave;}
 restore(s:AdventureSave){this.lastRefillTick=s.lastRefillTick??Math.floor(s.elapsed/2);const oldGuards=s.guards;const migrated=this.guards;const legacy=this.expedition&&!oldGuards.some(g=>g.quest!==undefined);for(let y=0;y<this.layout.maze.grid.length;y++)this.grid[y]=[...this.layout.maze.grid[y]];const {seals,stars,chests,broken,harvested,climb,climbed,visitedZones,...rest}=s;this.depth=s.depth||0;this.diving=!!s.diving;this.lastDive=s.lastDive??-10;this.climber.reset();if(climb)this.climber.state=structuredClone(climb);this.climbed=new Set(climbed||[]);this.visitedZones=new Set(visitedZones||[]);Object.assign(this,structuredClone(rest));this.supplies={...emptySupplies(),...(s.supplies||{})};this.propMoves=structuredClone(s.propMoves||{});this.fallenRocks=structuredClone(s.fallenRocks||{});this.fireZones=structuredClone(s.fireZones||[]);this.courseSteps=[...(s.courseSteps||[])];this.carried=s.carried??null;this.strengthUntil=s.strengthUntil??0;this.eatingAt=s.eatingAt??-100;this.eatingKind=s.eatingKind??'chili';this.courseReward=!!s.courseReward;if(legacy){this.guards=migrated;for(const g of this.guards)if(g.quest!==undefined&&oldGuards[g.quest]?.dead)g.dead=true;const boss=oldGuards.find(g=>g.boss),newBoss=this.guards.find(g=>g.boss);if(boss&&newBoss)Object.assign(newBoss,structuredClone(boss));}this.bossAwakeAt=s.bossAwakeAt??(s.stage!=='explore'?0:-1);this.seals=new Set(seals||[]);this.stars=new Set(stars||[]);this.chests=new Set(chests||[]);this.broken=new Set(broken||[]);this.projectiles=structuredClone(s.projectiles||[]);this.hazards=structuredClone(s.hazards||[]);this.harvested=new Set(harvested||[]);for(const p of this.layout.grass)this.grid[p.y][p.x]=this.broken.has(`${p.x},${p.y}`)?0:1;for(const k of this.broken){const [x,y]=k.split(',').map(Number);if(this.grid[y])this.grid[y][x]=0;}}
}
