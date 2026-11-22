import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Batch rigid vegetation by material. Named interactive parts remain separate. */
export function batchStatic(root:T.Group){
 root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),groups=new Map<T.Material,T.Mesh[]>();
 root.traverse(o=>{if(o instanceof T.Mesh&&!o.name&&!Array.isArray(o.material)){const list=groups.get(o.material)||[];list.push(o);groups.set(o.material,list);}});
 for(const [material,meshes]of groups){if(meshes.length<2)continue;const sources=new Set<T.BufferGeometry>(),copies=meshes.map(m=>{sources.add(m.geometry);const copy=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();copy.applyMatrix4(inverse.clone().multiply(m.matrixWorld));return copy;});const geometry=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!geometry)continue;meshes.forEach(m=>m.removeFromParent());sources.forEach(g=>g.dispose());const mesh=new T.Mesh(geometry,material);mesh.name='batched-foliage';root.add(mesh);}
 return root;
}
