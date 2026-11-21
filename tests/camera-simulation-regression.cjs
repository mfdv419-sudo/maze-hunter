// Standalone physics smoke test: executes the actual TypeScript AdventureCamera
// with a minimal Vector3 math shim, without changing any game source.
const fs=require('fs');const vm=require('vm');const ts=require(process.env.MH_TS_MODULE||'typescript');
class Vector3{
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
 clone(){return new Vector3(this.x,this.y,this.z)};
 copy(a){this.x=a.x;this.y=a.y;this.z=a.z;return this;}
 add(a){this.x+=a.x;this.y+=a.y;this.z+=a.z;return this;}
 sub(a){this.x-=a.x;this.y-=a.y;this.z-=a.z;return this;}
 addScaledVector(a,s){this.x+=a.x*s;this.y+=a.y*s;this.z+=a.z*s;return this;}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
 setY(y){this.y=y;return this;}
 lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}
 length(){return Math.sqrt(this.lengthSq())}
 normalize(){const l=this.length();return l?this.multiplyScalar(1/l):this;}
 multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
 distanceToSquared(p){return this.clone().sub(p).lengthSq()}
 distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}
 clampLength(min,max){const l=this.length();return l>0?this.multiplyScalar(Math.max(min,Math.min(max,l))/l):this}
 dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
}
const code=ts.transpileModule(fs.readFileSync(__dirname+'/../src/game/comfort-camera.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleExports={};vm.runInNewContext(code,{exports:moduleExports,require:(id)=>id==='three'?{Vector3,MathUtils:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}}:null,console,Math});
const {AdventureCamera,ADVENTURE_CAMERA_RADIUS:r}=moduleExports;const assert=require('assert');
const dt=1/60;const offset=new Vector3(0,0,-r);const follow={mode:'follow',dt};
const open={resolve:(a,b)=>b.clone(),isClear:()=>true};
const wall={isClear:(p,r=.28)=>p.z>=-8+r,resolve:(a,b,r=.28)=>{
 const l=b.clone().sub(a);if(b.z>=-8+r)return b.clone();if(l.z>=0)return a.clone();const t=(-8+r-a.z)/l.z;return a.clone().addScaledVector(l,Math.max(0,Math.min(1,t)));}}
function smoke(name,fn){fn();console.log('PASS',name);}
smoke('smooth straight track',()=>{const c=new AdventureCamera();let target=new Vector3(0,1,0),eye=c.step(target,offset,open,follow);for(let i=0;i<180;i++){target.z+=.04;const n=c.step(target,offset,open,{...follow,heading:0});assert(n.distanceTo(eye)<.25);eye=n;}assert(Math.abs(eye.distanceTo(target)-r)<.07);});
smoke('wall hold with player approaching',()=>{const c=new AdventureCamera(),target=new Vector3(0,1,0);c.step(target,offset,wall,follow);let hit;for(let i=0;i<70;i++){target.z-=.02;hit=c.step(target,offset,wall,follow);}assert(Math.abs(hit.z+7.72)<.05);for(let i=0;i<70;i++){target.z-=.005;const n=c.step(target,offset,wall,follow);assert(n.distanceTo(hit)<.01,`unexpected movement at ${i}: ${n.z}`);}});
smoke('no oscillation when heading fluctuates without movement',()=>{const c=new AdventureCamera(),target=new Vector3(0,1,0);const first=c.step(target,offset,open,follow);for(let i=0;i<300;i++){const n=c.step(target,offset,open,{...follow,heading:(i%2?1:-1)*.05});assert(n.distanceTo(first)<.02);}});
smoke('turn does not teleport',()=>{const c=new AdventureCamera(),target=new Vector3(0,1,0);let eye=c.step(target,offset,open,follow);for(let i=0;i<120;i++){const heading=Math.min(Math.PI/2,i*.018);target.x+=.027;target.z+=.018;const n=c.step(target,offset,open,{...follow,heading,outOfFrame:i>35});assert(n.distanceTo(eye)<.5,`teleport ${n.distanceTo(eye)}`);eye=n;}});
smoke('manual free view retains last view',()=>{const c=new AdventureCamera(),target=new Vector3(0,1,0),wish=new Vector3(7.2,0,0);let eye=c.step(target,offset,open,follow);for(let i=0;i<130;i++){const n=c.step(target,wish,open,{mode:'manual',dt});assert(n.distanceTo(eye)<.25);eye=n;}for(let i=0;i<50;i++){const n=c.step(target,offset,open,follow);assert(n.distanceTo(eye)<1e-6);}});
smoke('corner turn slides sideways on held wall, without reversing jitter',()=>{
 const c=new AdventureCamera(),target=new Vector3(0,1,0);c.step(target,offset,wall,follow);
 for(let i=0;i<70;i++){target.z-=.02;c.step(target,offset,wall,follow);}
 let eye=c.step(target,offset,wall,follow),steps=[];
 for(let i=0;i<100;i++){
  target.x+=.018;
  const next=c.step(target,offset,wall,{...follow,heading:Math.min(Math.PI/2,i*.026),outOfFrame:true});
  assert(next.distanceTo(eye)<.3,'sudden orbit jump');
  assert(wall.isClear(next,.28),'wall penetration');
  steps.push(next.x-eye.x);eye=next;
 }
 const moved=steps.reduce((n,s)=>n+Math.abs(s),0);
 assert(moved>.15,'camera remained stuck after real turn');
 const largePositive=steps.filter(s=>s>.015).length,largeNegative=steps.filter(s=>s<-.015).length;
 assert(Math.min(largePositive,largeNegative)<6,'alternating left-right jitter');
});
smoke('L-shaped maze corner keeps a clear eye and moves continuously',()=>{
 const corridor={
  isClear:(p,r=.28)=>!(p.z<-8+r||(p.x>1.15-r&&p.z<-.9+r&&p.z>-7.5-r)),
  resolve(a,b,r=.28){const direction=b.clone().sub(a),n=Math.max(1,Math.ceil(direction.length()/.045));let safe=a.clone();for(let i=1;i<=n;i++){const next=a.clone().addScaledVector(direction,i/n);if(!this.isClear(next,r))return safe;safe=next;}return b.clone();}
 };
 const c=new AdventureCamera(),target=new Vector3(0,1,0);let eye=c.step(target,offset,corridor,follow),lateral=0;
 for(let i=0;i<160;i++){
  const heading=Math.min(Math.PI/2,i*Math.PI/180);
  target.x+=.022;target.z+=.012;
  const next=c.step(target,offset,corridor,{...follow,heading,outOfFrame:i>36});
  assert(next.distanceTo(eye)<.35,'teleport inside maze');
  assert(corridor.isClear(next,.28),'camera embedded in maze wall');
  lateral+=Math.abs(next.x-eye.x);
  eye=next;
 }
 assert(lateral>.5,'camera did not slide through maze corner');
});
