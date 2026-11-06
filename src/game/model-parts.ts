import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function roundBox(w:number,h:number,d:number,r=.06){return new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.4,h*.4,d*.4));}
export function satin(color:number){return new T.MeshLambertMaterial({color});}
export function addMesh(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
export function joint(parent:T.Object3D,x:number,y:number,z=0,name=''){const g=new T.Group();g.position.set(x,y,z);g.name=name;parent.add(g);return g;}
export function disposeModel(root:T.Object3D){const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});for(const g of gs)g.dispose();for(const m of ms){(m as T.MeshLambertMaterial).map?.dispose();m.dispose();}}
