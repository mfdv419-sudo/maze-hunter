import {adventureLayout,adventureRules} from './adventure-layout';
import {center,clearSegment,moveSliding,route,type Point,type Difficulty} from './maze';
export interface Guard {position:Point;patrol:Point[];step:number;direction:number;hp:number;boss:boolean;slowUntil:number;stunUntil:number;hits:number;lastHit:number;nextShot:number;telegraphUntil:number;aim:Point;dead:boolean}
export interface Cake {position:Point;velocity:Point;owner:'player'|'guard'|'boss';ttl:number}
export class AdventureState {
 readonly layout; readonly grid; readonly guards:Guard[];
 position:Point;checkpoint:Point;elapsed=0;lives=3;ammo=6;seals=new Set<number>();stars=new Set<number>();chests=new Set<number>();broken=new Set<string>();projectiles:Cake[]=[];
 invulnerableUntil=0;slowUntil=0;stunUntil=0;hits=0;lastHit=-100;lastThrow=-100;lastJump=-100;resetFogRevision=0;respawns=0;revision=0;message='';messageAt=-10;
 phase:'playing'|'won'|'lost'='playing';reason:'time'|'lives'|null=null;
 constructor(readonly difficulty:Difficulty,readonly mapIndex:number,variation=1) {
  this.layout=adventureLayout(difficulty,mapIndex,variation);this.grid=this.layout.maze.grid.map(r=>[...r]);
  this.position=center(this.layout.maze.start);this.checkpoint={...this.position};
  this.guards=[...this.layout.patrols.map(p=>({patrol:p,boss:false})),...this.layout.bosses.map(p=>({patrol:[p],boss:true}))].map(({patrol,boss})=>({position:center(patrol[0]),patrol,step:0,direction:1,hp:boss?8:3,boss,slowUntil:0,stunUntil:0,hits:0,lastHit:-100,nextShot:3,telegraphUntil:0,aim:{x:0,y:0},dead:false}));
 }
 get limit(){return adventureRules[this.difficulty].seconds;}
 get bossCleared(){return this.guards.some(g=>g.boss&&g.dead);}
 get gateOpen(){return this.seals.size===3&&this.bossCleared;}
 get speedFactor(){return this.elapsed<this.stunUntil?0:this.elapsed<this.slowUntil?.55:1;}
 notify(message:string){this.message=message;this.messageAt=this.elapsed;}
 throwCake(angle:number) {
  if(this.phase!=='playing'||this.elapsed-this.lastThrow<.65||this.elapsed<this.stunUntil)return false;
  this.lastThrow=this.elapsed;
  // Nearby marked grass is cut by the same B action, before throwing a cake.
  const grass=this.layout.grass.find(p=>!this.broken.has(`${p.x},${p.y}`)&&Math.abs(p.x-Math.floor(this.position.x))+Math.abs(p.y-Math.floor(this.position.y))===1);
  if(grass){this.broken.add(`${grass.x},${grass.y}`);this.grid[grass.y][grass.x]=0;this.revision++;this.notify('grass');for(const g of this.guards)if(!g.boss&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<6){const p={x:Math.floor(this.position.x),y:Math.floor(this.position.y)};g.patrol=route(this.grid,{x:Math.floor(g.position.x),y:Math.floor(g.position.y)},p);g.step=0;}return true;}
  if(!this.ammo){this.notify('ammo');return false;}this.ammo--;
  let dx=Math.sin(angle),dy=Math.cos(angle);
  const target=this.guards.filter(g=>!g.dead&&Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y)<5&&clearSegment(this.grid,this.position,g.position,.05)).sort((a,b)=>Math.hypot(a.position.x-this.position.x,a.position.y-this.position.y)-Math.hypot(b.position.x-this.position.x,b.position.y-this.position.y))[0];
  if(target){const n=Math.hypot(target.position.x-this.position.x,target.position.y-this.position.y);if(n){dx=(target.position.x-this.position.x)/n;dy=(target.position.y-this.position.y)/n;}}
  this.projectiles.push({position:{...this.position},velocity:{x:dx*6,y:dy*6},owner:'player',ttl:1.25});return true;
 }
 damage(source:'guard'|'boss'|'river') {
  if(this.phase!=='playing'||this.elapsed<this.invulnerableUntil)return;
  this.invulnerableUntil=this.elapsed+1.4;
  if(source==='guard') {
   if(this.elapsed-this.lastHit>7)this.hits=0;this.lastHit=this.elapsed;this.hits++;
   if(this.hits===1){this.slowUntil=this.elapsed+3;this.notify('slow');return;}
   if(this.hits===2){this.stunUntil=this.elapsed+1;this.notify('stun');return;}
  }
  this.lives--;this.respawns++;this.hits=0;this.slowUntil=0;this.stunUntil=0;this.projectiles=[];
  const reset=source==='boss'&&this.difficulty!=='medium';
  this.position={...(reset?center(this.layout.maze.start):this.checkpoint)};
  if(reset)this.resetFogRevision++;
  this.notify(reset?'boss-reset':'respawn');
  if(this.lives<=0){this.phase='lost';this.reason='lives';}
 }
 hitGuard(g:Guard) {
  if(g.dead)return;
  if(this.elapsed-g.lastHit>7&&!g.boss){g.hits=0;g.hp=3;}
  g.lastHit=this.elapsed;g.hits++;g.hp--;
  if(g.hp<=0){g.dead=true;this.ammo=Math.min(8,this.ammo+3);this.notify(g.boss?'boss-win':'guard-win');this.revision++;}
  else if(g.hits%3===2)g.stunUntil=this.elapsed+1;else g.slowUntil=this.elapsed+3;
 }
 step(dt:number,raw:number,dx:number,dy:number,jump:number) {
  if(this.phase!=='playing')return;
  this.elapsed+=Math.max(0,raw);
  if(this.elapsed>=this.limit){this.phase='lost';this.reason='time';return;}
  if(this.elapsed-this.lastHit>7)this.hits=0;
  this.position=moveSliding(this.grid,this.position,dx*dt*this.speedFactor,dy*dt*this.speedFactor);
  if(jump<.08&&this.layout.rivers.some(p=>Math.floor(this.position.x)===p.x&&Math.floor(this.position.y)===p.y))this.damage('river');
  const pickup=(list:Point[],set:Set<number>,kind:string)=>list.forEach((p,i)=>{if(!set.has(i)&&Math.hypot(p.x+.5-this.position.x,p.y+.5-this.position.y)<.48){set.add(i);this.revision++;this.notify(kind);if(kind==='seal'){this.checkpoint=center(p);this.ammo=Math.min(8,this.ammo+2);}if(kind==='chest'){this.ammo=8;this.lives=Math.min(3,this.lives+1);}}});
  pickup(this.layout.seals,this.seals,'seal');pickup(this.layout.stars,this.stars,'star');pickup(this.layout.chests,this.chests,'chest');
  for(const g of this.guards) {
   if(g.dead)continue;
   if(!g.boss&&g.patrol.length>1&&this.elapsed>=g.stunUntil) {
    const target=center(g.patrol[g.step]),d=Math.hypot(target.x-g.position.x,target.y-g.position.y),speed=this.elapsed<g.slowUntil?.45:.85;
    if(d<.06){if(g.step===g.patrol.length-1)g.direction=-1;if(g.step===0)g.direction=1;g.step+=g.direction;}
    else g.position=moveSliding(this.grid,g.position,(target.x-g.position.x)/d*speed*dt,(target.y-g.position.y)/d*speed*dt,.16);
   }
   const d=Math.hypot(g.position.x-this.position.x,g.position.y-this.position.y);
   if(d<.5&&jump<.2)this.damage(g.boss?'boss':'guard');
   if(this.elapsed>=g.stunUntil&&d<(g.boss?6:4.4)&&d>1&&clearSegment(this.grid,g.position,this.position,.05)) {
    if(!g.telegraphUntil&&this.elapsed>=g.nextShot){g.telegraphUntil=this.elapsed+(g.boss?.85:1);g.aim={...this.position};}
   }
   if(g.telegraphUntil&&this.elapsed>=g.telegraphUntil) {
    const vx=g.aim.x-g.position.x,vy=g.aim.y-g.position.y,n=Math.hypot(vx,vy)||1;
    for(const offset of g.boss&&this.difficulty==='extreme'?[-.2,0,.2]:[0]){const a=Math.atan2(vy,vx)+offset;this.projectiles.push({position:{...g.position},velocity:{x:Math.cos(a)*3.5,y:Math.sin(a)*3.5},owner:g.boss?'boss':'guard',ttl:2});}
    g.telegraphUntil=0;g.nextShot=this.elapsed+(g.boss?2.1:3.2);
   }
  }
  const keep:Cake[]=[];const respawnsBefore=this.respawns;
  for(const cake of this.projectiles) {
   cake.ttl-=dt;if(cake.ttl<=0)continue;
   const next={x:cake.position.x+cake.velocity.x*dt,y:cake.position.y+cake.velocity.y*dt};
   if(!clearSegment(this.grid,cake.position,next,.04))continue;
   cake.position=next;let hit=false;
   if(cake.owner==='player') {for(const g of this.guards)if(!g.dead&&Math.hypot(g.position.x-next.x,g.position.y-next.y)<.37){this.hitGuard(g);hit=true;break;}}
   else if(jump<.22&&Math.hypot(this.position.x-next.x,this.position.y-next.y)<.33){this.damage(cake.owner);hit=true;}
   if(this.respawns!==respawnsBefore){keep.length=0;break;}
   if(!hit)keep.push(cake);
  }
  this.projectiles=keep;
  if(Math.hypot(this.position.x-this.checkpoint.x,this.position.y-this.checkpoint.y)<.5&&this.elapsed%2<dt)this.ammo=Math.min(8,this.ammo+1);
  const finish=center(this.layout.maze.finish);
  if(Math.hypot(this.position.x-finish.x,this.position.y-finish.y)<.45) {
   if(this.gateOpen)this.phase='won';else if(this.elapsed-this.messageAt>3)this.notify('gate');
  }
 }
}
