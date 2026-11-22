import * as T from 'three';
/** Swept camera volume against cached world bounds, including individual wall instances. */
export class CameraCollision {
 constructor(private solid?:(point:T.Vector3)=>boolean){}
 private meshes:T.Mesh[]=[];
 private cache=new WeakMap<T.Mesh,{version:number;world:number[];boxes:T.Box3[]}>();
 register(root:T.Object3D){root.traverse(o=>{if(o instanceof T.Mesh&&!this.meshes.includes(o))this.meshes.push(o);});}
 private boxes(mesh:T.Mesh){
  mesh.updateWorldMatrix(true,false);
  const version=mesh instanceof T.InstancedMesh?mesh.instanceMatrix.version:-1,world=mesh.matrixWorld.elements,old=this.cache.get(mesh);
  if(old&&old.version===version&&world.every((v,i)=>v===old.world[i]))return old.boxes;
  mesh.geometry.computeBoundingBox();const local=mesh.geometry.boundingBox!,boxes:T.Box3[]=[],m=new T.Matrix4();
  if(mesh instanceof T.InstancedMesh){for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);m.premultiply(mesh.matrixWorld);boxes.push(local.clone().applyMatrix4(m));}}
  else boxes.push(local.clone().applyMatrix4(mesh.matrixWorld));
  this.cache.set(mesh,{version,world:[...world],boxes});return boxes;
 }
 private samples(point:T.Vector3,radius:number){
  if(!this.solid)return false;
  if(this.solid(point))return true;
  if(radius<=0)return false;
  const probe=point.clone();
  for(let axis=0;axis<3;axis++){
   const center=point.getComponent(axis);
   if(this.solid(probe.setComponent(axis,center-radius))||this.solid(probe.setComponent(axis,center+radius)))return true;
   probe.setComponent(axis,center);
  }
  return false;
 }
 isClear(point:T.Vector3,radius=.22){
  if(this.samples(point,radius))return false;
  for(const mesh of this.meshes){
   if(mesh.visible&&this.boxes(mesh).some(box=>box.distanceToPoint(point)<radius||box.containsPoint(point)))return false;
  }
  return true;
 }
 resolve(target:T.Vector3,desired:T.Vector3,radius=.22){
  const delta=desired.clone().sub(target),length=delta.length();if(length<.0001)return desired.clone();
  const ray=new T.Ray(target,delta.divideScalar(length));let safe=length;
  for(const mesh of this.meshes){if(!mesh.visible)continue;for(const box of this.boxes(mesh)){
   const expanded=box.clone().expandByScalar(radius);
   // Near a wall, reduce only the safety margin rather than ignoring that wall.
   if(expanded.containsPoint(target)){expanded.copy(box).expandByScalar(.025);if(expanded.containsPoint(target)){if(!expanded.containsPoint(desired))continue;safe=0;continue;}}
   const hit=ray.intersectBox(expanded,new T.Vector3());if(hit)safe=Math.min(safe,Math.max(0,target.distanceTo(hit)-.025));
  }}
  if(this.solid){
   const probe=new T.Vector3();
   const blocked=(at:number)=>this.samples(probe.copy(target).addScaledVector(ray.direction,at),radius);
   let last=0,exited=!blocked(0);for(let at=Math.min(.09,safe);at<=safe+.00001;at=Math.min(safe,at+.09)){
    if(!exited){exited=!blocked(at);last=at;if(at>=safe)break;continue;}
    if(blocked(at)){let lo=last,hi=at;for(let i=0;i<6;i++){const mid=(lo+hi)/2;if(blocked(mid))hi=mid;else lo=mid;}safe=Math.max(0,lo-.025);break;}
    last=at;if(at>=safe)break;
   }
  }
  return target.clone().addScaledVector(ray.direction,safe);
 }
 /** Recover a camera eye *already embedded* in world geometry. This is not a
  * wall-contact orbit: use the smallest clear displacement, with a fixed
  * candidate order so nearby corners cannot cause left/right oscillation.
  * Ordinary wall contact never calls this method. */
 recoverEmbedded(eye:T.Vector3,target:T.Vector3,radius=.28):T.Vector3|null{
  if(this.isClear(eye,radius))return eye.clone();
  const toward=target.clone().sub(eye).setY(0);
  if(toward.lengthSq()<1e-8)toward.set(0,0,1);
  toward.normalize();
  const sideways=new T.Vector3(-toward.z,0,toward.x);
  for(const step of [.12,.24,.4,.65,.95,1.35,1.9,2.6]){
   // Prefer the player's side of an obstruction; never select a remote orbit.
   for(const [forward,lateral,up] of [[1,0,0],[.7,0,.7],[.7,0,-.7],[.8,.5,0],[.8,-.5,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]] as const){
    const candidate=eye.clone().addScaledVector(toward,step*forward)
     .addScaledVector(sideways,step*lateral).add(new T.Vector3(0,step*up,0));
    if(this.isClear(candidate,radius))return candidate;
   }
  }
  return null;
 }
 dispose(){this.meshes=[];this.cache=new WeakMap();}
}
