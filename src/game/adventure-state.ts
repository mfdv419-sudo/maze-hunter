import {forestLayout,forestElevation,inCave} from './forest-layout';
import {teamSealSites,type QuestTeam} from './quest-seals';
import {Climber,type ClimbSave} from './climbing';
import {adventureLayout,adventureRules} from './adventure-layout';
import {center,clearSegment,moveSliding,route,type Point,type Difficulty} from './maze';
export interface Guard {position:Point;patrol:Point[];step:number;direction:number;hp:number;boss:boolean;slowUntil:number;stunUntil:number;hits:number;lastHit:number;nextShot:number;telegraphUntil:number;aim:Point;dead:boolean;vulnerableAt?:number;vulnerableUntil?:number;elite?:boolean;sapling?:boolean}
export interface Cake {position:Point;velocity:Point;owner:'player'|'guard'|'boss';ttl:number}
export interface Hazard {id:number;kind:'slam'|'seed'|'roots'|'spin'|'vine'|'cataclysm'|'branch'|'charge'|'lightning';point:Point;from:Point;at:number;end:number;radius:number;resolved:boolean}
export interface AdventureSave {lastLoot?:AdventureState['lastLoot'];climb?:ClimbSave;climbed?:number[];visitedZones?:number[];position:Point;checkpoint:Point;elapsed:number;lives:number;ammo:number;seals:number[];stars:number[];chests:number[];broken:string[];harvested:number[];coins:number;keys:number;buffUntil:number;shield:number;guards:Guard[];projectiles:Cake[];hazards:Hazard[];stage:'explore'|'boss'|'escape';escapeAt:number;escapeDuration:number;phase:'playing'|'won'|'lost';reason:'time'|'lives'|'escape'|null;resetFogRevision:number;respawns:number;revision:number;invulnerableUntil:number;slowUntil:number;stunUntil:number;hits:number;lastHit:number;lastThrow:number;lastJump:number;hazardId:number;nextBossSkill:number;nextEscapeHazard:number;message:string;messageAt:number}
export class AdventureState {
 lastLoot?:{id:number;coins:number;keys:number;cakes:number;hearts:number};
 readonly layout;readonly grid;guards:Guard[];climber=new Climber();climbed=new Set<number>();visitedZones=new Set<number>();
 position:Point;checkpoint:Point;elapsed=0;lives=3;ammo=6;seals=new Set<number>();stars=new Set<number>();chests=new Set<number>();broken=new Set<string>();harvested=new Set<number>();projectiles:Cake[]=[];hazards:Hazard[]=[];
 coins=0;keys=0;buffUntil=0;shield=0;stage:'explore'|'boss'|'escape'='explore';escapeAt=-1;escapeDuration=90;nextEscapeHazard=0;nextBossSkill=0;hazardId=0;
 invulnerableUntil=0;slowUntil=0;stunUntil=0;hits=0;lastHit=-100;lastThrow=-100;lastJump=-100;resetFogRevision=0;respawns=0;revision=0;message='';messageAt=-10;
 effectEvents:{id:number;source:'guard'|'boss'|'river'|'cake';point:Point}[]=[];effectId=0;
 phase:'playing'|'won'|'lost'='playing';reason:'time'|'lives'|'escape'|null=null;
 constructor(readonly difficulty:Difficulty,readonly mapIndex:number,readonly variation=1,readonly sample=false,team?:QuestTeam) {
  this.layout=sample?forestLayout():adventureLayout(difficulty,mapIndex,variation);if(team)this.layout.seals=teamSealSites(this.layout,team);this.grid=this.layout.maze.grid.map(r=>[...r]);
  this.position=center(this.layout.maze.start);this.checkpoint={...this.position};
  this.guards=[...this.layout.patrols.map((p,i)=>({patrol:p,boss:false,elite:i>=adventureRules[difficulty].guards})),...this.layout.bosses.map(p=>({patrol:[p],boss:true,elite:false}))].map(({patrol,boss,elite})=>this.makeGuard(patrol,boss,elite));
 }
 private makeGuard(patrol:Point[],boss=false,elite=false):Guard{return{position:center(patrol[0]),patrol,step:0,direction:1,hp:boss?this.bossMaxHP:elite?5:3,boss,elite,slowUntil:0,stunUntil:0,hits:0,lastHit:-100,nextShot:this.elapsed+3,telegraphUntil:0,aim:{x:0,y:0},dead:false};}
 get sealGoal(){return Math.max(3,this.layout.seals.length);}
 get arenaRadius(){return this.layout.forest?.arenaRadius??4.2;}
 get bossMaxHP(){return{medium:12,hard:18,extreme:24}[this.difficulty];}
 get bossPhase(){const g=this.guards.find(g=>g.boss);return !g?1:g.hp/this.bossMaxHP<.3?3:g.hp/this.bossMaxHP<.7?2:1;}
 get zone(){return this.stage==='escape'?6:this.layout.zoneCells[Math.floor(this.position.y)]?.[Math.floor(this.position.x)]??0;}
 get limit(){return this.sample?1500:adventureRules[this.difficulty].seconds;}
 sealUnlocked(index:number){return !this.sample||!!this.guards[index]?.dead;}
 get bossVulnerable(){const g=this.guards.find(g=>g.boss);return !this.sample||!!g&&this.elapsed>=(g.vulnerableAt??Infinity)&&this.elapsed<(g.vulnerableUntil??0);}
 get bossCleared(){return this.guards.some(g=>g.boss&&g.dead);}
 get bossRefilling(){return this.phase==='playing'&&this.stage!=='escape'&&this.seals.size===this.sealGoal&&this.guards.some(g=>g.boss&&!g.dead)&&Math.hypot(this.position.x-(this.layout.fortress.x+.5),this.position.y-(this.layout.fortress.y+.5))<this.arenaRadius;}
 get gateOpen(){return this.seals.size===this.sealGoal&&this.bossCleared;}
 get remaining(){return this.stage==='escape'?Math.max(0,this.escapeDuration-(this.elapsed-this.escapeAt)):Math.max(0,this.limit-this.elapsed);}
 get speedFactor(){return this.elapsed<this.stunUntil?0:(this.elapsed<this.slowUntil?.55:1)*(this.elapsed<this.buffUntil?1.3:1)*(this.sample&&inCave(this.position.x,this.position.y)&&forestElevation(this.position.x,this.position.y)<-.15?.68:1);}
 get interaction(){if(this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.6))return'harvest';if(this.layout.grass.some(p=>!this.broken.has(`${p.x},${p.y}`)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.35))return'cut';if(this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.1))return'harvest';return'cake';}
 notify(message:string){this.message=message;this.messageAt=this.elapsed;}
 startEscape(){if(this.stage==='escape')return;this.stage='escape';for(const p of this.layout.escapeConnector){this.grid[p.y][p.x]=0;this.broken.add(`${p.x},${p.y}`);}this.escapeAt=this.elapsed;const safe=this.layout.escapeRoutes[0].length;this.escapeDuration=Math.max(45,Math.min(90,Math.ceil(safe/1.5+22)));this.nextEscapeHazard=this.elapsed+4;this.hazards=[];this.projectiles=[];this.notify('escape');this.revision++;}
 throwCake(angle:number) {
  if(this.phase!=='playing'||this.elapsed-this.lastThrow<.65||this.elapsed<this.stunUntil)return false;
  this.lastThrow=this.elapsed;
  const grass=this.layout.grass.find(p=>!this.broken.has(`${p.x},${p.y}`)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.35);
  if(grass&&!this.layout.vegetation.some((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.6)){if(this.layout.secret&&grass.x===this.layout.secret.x&&grass.y===this.layout.secret.y){if(!this.keys){this.notify('key-needed');return false;}this.keys--;}this.broken.add(`${grass.x},${grass.y}`);this.grid[grass.y][grass.x]=0;this.revision++;this.notify('grass');for(const g of this.guards)if(!g.boss&&!g.dead&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<6){g.patrol=route(this.grid,{x:Math.floor(g.position.x),y:Math.floor(g.position.y)},{x:Math.floor(this.position.x),y:Math.floor(this.position.y)});g.step=0;}return true;}
  const vegetation=this.layout.vegetation.findIndex((p,i)=>p.kind!=='normal'&&!this.harvested.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<1.1);
  if(vegetation>=0){const p=this.layout.vegetation[vegetation];this.harvested.add(vegetation);this.coins+=p.kind==='rare'?10:p.kind==='danger'?8:2;this.ammo=Math.min(8,this.ammo+2);if(p.kind==='rare'){this.keys++;this.shield=1;this.buffUntil=this.elapsed+12;}if(p.kind==='danger')this.spawnSapling(p);this.revision++;this.notify(p.kind);return true;}
  if(!this.ammo){this.notify('ammo');return false;}this.ammo--;
  let dx=Math.sin(angle),dy=Math.cos(angle);
  const target=this.guards.filter(g=>!g.dead&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<5&&clearSegment(this.grid,this.position,g.position,.05)).sort((a,b)=>Math.hypot(a.position.x-this.position.x,a.position.y-this.position.y)-Math.hypot(b.position.x-this.position.x,b.position.y-this.position.y))[0];
  if(target){const n=Math.hypot(target.position.x-this.position.x,target.position.y-this.position.y);if(n){dx=(target.position.x-this.position.x)/n;dy=(target.position.y-this.position.y)/n;}}
  this.projectiles.push({position:{...this.position},velocity:{x:dx*6,y:dy*6},owner:'player',ttl:1.25});return true;
 }
 damage(source:'guard'|'boss'|'river') {
  if(this.phase!=='playing'||this.elapsed<this.invulnerableUntil)return;
  this.effectEvents.push({id:++this.effectId,source,point:{...this.position}});this.effectEvents=this.effectEvents.slice(-32);this.invulnerableUntil=this.elapsed+1.4;
  if(this.shield&&source!=='river'){this.shield=0;this.notify('shield');return;}
  if(source==='guard') {if(this.elapsed-this.lastHit>7)this.hits=0;this.lastHit=this.elapsed;this.hits++;
   if(this.hits===1){this.slowUntil=this.elapsed+3;this.notify('slow');return;}
   if(this.hits===2){this.stunUntil=this.elapsed+1;this.notify('stun');return;}}
  this.climber.reset();this.lives--;this.respawns++;this.hits=0;this.slowUntil=0;this.stunUntil=0;this.projectiles=[];
  const reset=source==='boss'&&this.difficulty!=='medium'&&this.stage!=='escape';
  this.position={...(reset?center(this.layout.maze.start):this.checkpoint)};
  if(reset)this.resetFogRevision++;
  this.notify(reset?'boss-reset':'respawn');if(this.lives<=0){this.phase='lost';this.reason='lives';}
 }
 hitGuard(g:Guard) {
  if(g.dead)return;
  if(g.boss&&this.sample&&this.seals.size===this.sealGoal&&(!this.bossVulnerable||this.elapsed-g.lastHit<.5)){if(this.elapsed-this.messageAt>1)this.notify('king-armored');return;}
  if(g.boss&&this.seals.size<this.sealGoal){this.notify('king-seals');return;}
  this.effectEvents.push({id:++this.effectId,source:'cake',point:{...g.position}});this.effectEvents=this.effectEvents.slice(-32);
  if(this.elapsed-g.lastHit>7&&!g.boss){g.hits=0;g.hp=g.elite?5:3;}
  g.lastHit=this.elapsed;g.hits++;g.hp--;
  if(g.hp<=0){g.dead=true;this.ammo=Math.min(8,this.ammo+3);this.notify(g.boss?'boss-win':'guard-win');this.revision++;if(g.boss)this.startEscape();}
  else if(!g.boss){if(g.hits%3===2)g.stunUntil=this.elapsed+1;else g.slowUntil=this.elapsed+3;}
 }
 private spawnSapling(p:Point){if(this.guards.filter(g=>!g.dead&&!g.boss).length>=12||this.guards.length>=30)return;const target={x:Math.floor(this.position.x),y:Math.floor(this.position.y)},path=route(this.grid,p,target);if(path.length){const g=this.makeGuard(path);g.sapling=true;this.guards.push(g);}}
 private warn(kind:Hazard['kind'],point:Point,radius:number,delay=1.5,from=point){this.hazards.push({id:++this.hazardId,kind,point:{...point},from:{...from},radius,at:this.elapsed+delay,end:this.elapsed+delay+.55,resolved:false});}
 private bossSkill(g:Guard){if(this.sample){
  const phase=this.bossPhase,k=(this.hazardId+Math.floor(this.elapsed*13)+this.variation)%5,delay=phase===3?1.1:1.55;
  g.vulnerableAt=this.elapsed+delay;g.vulnerableUntil=this.elapsed+delay+(phase===3?1.4:1.9);
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
 private updateHazards(jump:number){for(const h of this.hazards){if(h.resolved||this.elapsed<h.at)continue;h.resolved=true;if(this.sample&&h.kind==='charge'){const g=this.guards.find(g=>g.boss&&!g.dead);if(g)g.position=moveSliding(this.grid,g.position,h.point.x-g.position.x,h.point.y-g.position.y,.4);}const d=Math.hypot(this.position.x-h.point.x,this.position.y-h.point.y);let inside=d<h.radius;
   if(h.kind==='charge'||h.kind==='vine'){const vx=h.point.x-h.from.x,vy=h.point.y-h.from.y,l=vx*vx+vy*vy,t=Math.max(0,Math.min(1,((this.position.x-h.from.x)*vx+(this.position.y-h.from.y)*vy)/(l||1)));inside=Math.hypot(this.position.x-h.from.x-vx*t,this.position.y-h.from.y-vy*t)<h.radius;}
   if(inside&&jump<.22){if(h.kind==='roots'){this.slowUntil=this.elapsed+2;this.notify('roots');}else this.damage(this.stage==='escape'?'guard':'boss');}}
  this.hazards=this.hazards.filter(h=>h.end>this.elapsed);
 }
 step(dt:number,raw:number,dx:number,dy:number,jump:number,movementOnly=false) {
  if(this.phase!=='playing')return;this.elapsed+=Math.max(0,raw);
  if(this.stage==='escape'&&this.remaining<=0){this.phase='lost';this.reason='escape';return;}
  if(this.stage!=='escape'&&this.elapsed>=this.limit){this.phase='lost';this.reason='time';return;}
  if(this.elapsed-this.lastHit>7)this.hits=0;
  const previous={...this.position},next=moveSliding(this.grid,this.position,dx*dt*this.speedFactor,dy*dt*this.speedFactor,.13);
  const climbing=this.climber.step(previous,next,{x:dx,y:dy},jump,dt,this.layout.ledges);this.position=climbing.position;
  if(this.sample)for(const obstacle of [...this.layout.forest!.trunks.map(p=>({...p,r:.34})),...this.layout.forest!.pillars.map(p=>({...p,r:.38})),...this.layout.forest!.boulders.map(p=>({...p,r:1.35}))]){const x=this.position.x-obstacle.x-.5,y=this.position.y-obstacle.y-.5,d=Math.hypot(x,y);if(d<obstacle.r){const k=obstacle.r/Math.max(.001,d);this.position={x:obstacle.x+.5+(d?x:.001)*k,y:obstacle.y+.5+y*k};}}
  if(climbing.reached!==null&&!this.climbed.has(climbing.reached)){this.climbed.add(climbing.reached);this.coins+=5;this.notify('climb');}
  if(!this.visitedZones.has(this.zone)){this.visitedZones.add(this.zone);this.coins+=3;this.revision++;}
  jump=Math.max(jump,this.climber.elevation);
  if(jump<.08&&this.layout.rivers.some(p=>Math.floor(this.position.x)===p.x&&Math.floor(this.position.y)===p.y))this.damage('river');
  const pickup=(list:Point[],set:Set<number>,kind:string)=>list.forEach((p,i)=>{if(!set.has(i)&&(kind!=='seal'||this.sealUnlocked(i))&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.48){set.add(i);this.revision++;this.notify(kind);if(kind==='seal'){this.checkpoint=center(p);this.ammo=Math.min(8,this.ammo+2);}if(kind==='chest'){this.lastLoot={id:i,coins:5,keys:1,cakes:8-this.ammo,hearts:Math.min(1,3-this.lives)};this.ammo=8;this.lives=Math.min(3,this.lives+1);this.coins+=5;this.keys++;}}});
  pickup(this.layout.seals,this.seals,'seal');pickup(this.layout.stars,this.stars,'star');pickup(this.layout.chests,this.chests,'chest');
  if(movementOnly)return;
  const king=this.guards.find(g=>g.boss),inArena=Math.hypot(this.position.x-(this.layout.fortress.x+.5),this.position.y-(this.layout.fortress.y+.5))<this.arenaRadius;
  if(king&&inArena&&this.bossRefilling){if(this.stage!=='boss'){this.stage='boss';this.checkpoint={x:this.layout.fortress.x+2.5,y:this.layout.fortress.y+.5};if(this.grid[Math.floor(this.checkpoint.y)]?.[Math.floor(this.checkpoint.x)]!==0)this.checkpoint={...this.position};this.notify('fortress');}if(this.elapsed>=this.nextBossSkill){this.bossSkill(king);this.nextBossSkill=this.elapsed+(this.sample?(this.bossPhase===3?3.4:4.6):(this.bossPhase===3?2.8:3.8));}if(this.elapsed%2<dt)this.ammo=Math.min(8,this.ammo+1);}
  if(this.bossCleared&&this.seals.size===this.sealGoal&&this.stage!=='escape')this.startEscape();
  if(this.stage==='escape'&&this.elapsed>=this.nextEscapeHazard){this.warn('branch',this.position,.65,1.7);this.nextEscapeHazard=this.elapsed+4;}
  this.updateHazards(jump);
  for(const g of this.guards) {
   if(g.dead||this.stage==='escape')continue;
   if(this.sample&&!g.boss&&this.elapsed>=g.stunUntil&&!g.telegraphUntil&&this.elapsed%1<dt&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<5&&clearSegment(this.grid,g.position,this.position,.05)){g.patrol=route(this.grid,{x:Math.floor(g.position.x),y:Math.floor(g.position.y)},{x:Math.floor(this.position.x),y:Math.floor(this.position.y)});g.step=Math.min(1,g.patrol.length-1);g.direction=1;}
   if(!g.boss&&g.patrol.length>1&&this.elapsed>=g.stunUntil&&(!this.sample||!g.telegraphUntil)) {const target=center(g.patrol[Math.min(g.step,g.patrol.length-1)]),d=Math.hypot(target.x-g.position.x,target.y-g.position.y),speed=this.elapsed<g.slowUntil?.45:g.elite?1.05:.85;
    if(d<.06){if(g.step===g.patrol.length-1)g.direction=-1;if(g.step===0)g.direction=1;g.step+=g.direction;}else g.position=moveSliding(this.grid,g.position,(target.x-g.position.x)/d*speed*dt,(target.y-g.position.y)/d*speed*dt,.16);}
   if(g.boss&&this.stage==='boss'&&this.seals.size===this.sealGoal&&(!this.sample||!this.bossVulnerable)){
    const dx=this.position.x-g.position.x,dy=this.position.y-g.position.y,d=Math.hypot(dx,dy),speed=this.sample?(this.bossPhase===3?1.6:1.2):.65;
    if(d>.8){const tx=dx/d+(d<2.5?dy/d*.7:0),ty=dy/d-(d<2.5?dx/d*.7:0),next=moveSliding(this.grid,g.position,tx*speed*dt,ty*speed*dt,.4);if(Math.hypot(next.x-this.layout.fortress.x-.5,next.y-this.layout.fortress.y-.5)<this.arenaRadius-.9)g.position=next;}
   }
   const d=Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y);
   if(d<(g.boss?.55:.3)&&jump<.2)this.damage(g.boss?'boss':'guard');
   if(this.elapsed>=g.stunUntil&&d<(g.boss?(this.sample?9:5):4.4)&&d>1&&clearSegment(this.grid,g.position,this.position,.05)&&(!g.boss||this.seals.size===this.sealGoal))if(!g.telegraphUntil&&this.elapsed>=g.nextShot){g.telegraphUntil=this.elapsed+(g.boss?1:1.2);g.aim={...this.position};}
   if(g.telegraphUntil&&this.elapsed>=g.telegraphUntil) {const vx=g.aim.x-g.position.x,vy=g.aim.y-g.position.y;
    for(const offset of g.boss&&(this.sample||this.difficulty==='extreme')?[-.22,0,.22]:[0]){const a=Math.atan2(vy,vx)+offset;this.projectiles.push({position:{...g.position},velocity:{x:Math.cos(a)*3.5,y:Math.sin(a)*3.5},owner:g.boss?'boss':'guard',ttl:2});}
    g.telegraphUntil=0;g.nextShot=this.elapsed+(g.boss?2.5:3.2);}
  }
  const keep:Cake[]=[];const respawnsBefore=this.respawns;
  for(const cake of this.projectiles) {cake.ttl-=dt;if(cake.ttl<=0)continue;const next={x:cake.position.x+cake.velocity.x*dt,y:cake.position.y+cake.velocity.y*dt};if(!clearSegment(this.grid,cake.position,next,.04))continue;if(this.sample&&([...this.layout.forest!.trunks,...this.layout.forest!.pillars].some(p=>Math.hypot(next.x-p.x-.5,next.y-p.y-.5)<.26)||this.layout.forest!.boulders.some(p=>Math.hypot(next.x-p.x-.5,next.y-p.y-.5)<1.2)||this.layout.ledges.some(l=>Math.abs(next.x-l.point.x-.5)<.5&&Math.abs(next.y-l.point.y-.5)<.5)))continue;cake.position=next;let hit=false;
   if(cake.owner==='player'){for(const g of this.guards)if(!g.dead&&Math.hypot(g.position.x-next.x,g.position.y-next.y)<(g.boss?.55:.27)){this.hitGuard(g);hit=true;break;}}
   else if(jump<.22&&Math.hypot(this.position.x-next.x,this.position.y-next.y)<.25){this.damage(cake.owner);hit=true;}
   if(this.respawns!==respawnsBefore){keep.length=0;break;}if(!hit)keep.push(cake);}
  this.projectiles=keep;
  if(Math.hypot(this.position.x-this.checkpoint.x,this.position.y-this.checkpoint.y)<.5&&this.elapsed%2<dt)this.ammo=Math.min(8,this.ammo+1);
  const finish=center(this.layout.maze.finish);
  if(Math.hypot(this.position.x-finish.x,this.position.y-finish.y)<.45){if(this.gateOpen)this.phase='won';else if(this.elapsed-this.messageAt>3)this.notify('gate');}
 }
 acceptPosition(target:Point,jump:number){const start={...this.position},steps=Math.max(1,Math.ceil(Math.hypot(target.x-start.x,target.y-start.y)/.08));for(let i=1;i<=steps;i++){const q={x:start.x+(target.x-start.x)*i/steps,y:start.y+(target.y-start.y)*i/steps},input={x:(q.x-this.position.x)*25,y:(q.y-this.position.y)*25};this.position=this.climber.step(this.position,q,input,jump,0,this.layout.ledges).position;if(this.climber.state.phase==='hanging'||this.climber.state.phase==='climbing')break;}this.step(0,0,0,0,jump,true);}
 save():AdventureSave {const names=['lastLoot','position','checkpoint','elapsed','lives','ammo','coins','keys','buffUntil','shield','guards','projectiles','hazards','stage','escapeAt','escapeDuration','phase','reason','resetFogRevision','respawns','revision','invulnerableUntil','slowUntil','stunUntil','hits','lastHit','lastThrow','lastJump','hazardId','nextBossSkill','nextEscapeHazard','message','messageAt'] as const;const out:Record<string,unknown>={};for(const k of names)if(this[k]!==undefined)out[k]=this[k];return structuredClone({...out,climb:this.climber.state,climbed:[...this.climbed],visitedZones:[...this.visitedZones],seals:[...this.seals],stars:[...this.stars],chests:[...this.chests],broken:[...this.broken],harvested:[...this.harvested]}) as unknown as AdventureSave;}
 restore(s:AdventureSave){for(let y=0;y<this.layout.maze.grid.length;y++)this.grid[y]=[...this.layout.maze.grid[y]];const {seals,stars,chests,broken,harvested,climb,climbed,visitedZones,...rest}=s;this.climber.reset();if(climb)this.climber.state=structuredClone(climb);this.climbed=new Set(climbed||[]);this.visitedZones=new Set(visitedZones||[]);Object.assign(this,structuredClone(rest));this.seals=new Set(seals||[]);this.stars=new Set(stars||[]);this.chests=new Set(chests||[]);this.broken=new Set(broken||[]);this.projectiles=structuredClone(s.projectiles||[]);this.hazards=structuredClone(s.hazards||[]);this.harvested=new Set(harvested||[]);for(const p of this.layout.grass)this.grid[p.y][p.x]=this.broken.has(`${p.x},${p.y}`)?0:1;for(const k of this.broken){const [x,y]=k.split(',').map(Number);if(this.grid[y])this.grid[y][x]=0;}}
}
