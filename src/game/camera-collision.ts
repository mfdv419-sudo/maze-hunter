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
 resolve(target:T.Vector3,desired:T.Vector3,radius=.22){
  const delta=desired.clone().sub(target),length=delta.length();if(length<.0001)return desired.clone();
  const ray=new T.Ray(target,delta.divideScalar(length));let safe=length;
  for(const mesh of this.meshes){if(!mesh.visible)continue;for(const box of this.boxes(mesh)){
   const expanded=box.clone().expandByScalar(radius);
   // Near a wall, reduce only the safety margin rather than ignoring that wall.
   if(expanded.containsPoint(target)){expanded.copy(box).expandByScalar(.025);if(expanded.containsPoint(target)){safe=0;continue;}}
   const hit=ray.intersectBox(expanded,new T.Vector3());if(hit)safe=Math.min(safe,Math.max(0,target.distanceTo(hit)-.025));
  }}
  if(this.solid){
   const offsets=[new T.Vector3(),new T.Vector3(radius,0,0),new T.Vector3(-radius,0,0),new T.Vector3(0,radius,0),new T.Vector3(0,-radius,0),new T.Vector3(0,0,radius),new T.Vector3(0,0,-radius)];
   const blocked=(at:number)=>{const p=target.clone().addScaledVector(ray.direction,at);return offsets.some(o=>this.solid!(p.clone().add(o)));};
   let last=0;for(let at=Math.min(.09,safe);at<=safe+.00001;at=Math.min(safe,at+.09)){
    if(blocked(at)){let lo=last,hi=at;for(let i=0;i<6;i++){const mid=(lo+hi)/2;if(blocked(mid))hi=mid;else lo=mid;}safe=Math.max(0,lo-.025);break;}
    last=at;if(at>=safe)break;
   }
  }
  return target.clone().addScaledVector(ray.direction,safe);
 }
 dispose(){this.meshes=[];this.cache=new WeakMap();}
}
