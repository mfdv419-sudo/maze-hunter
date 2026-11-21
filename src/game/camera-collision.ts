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
 dispose(){this.meshes=[];this.cache=new WeakMap();}
}
