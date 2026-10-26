import * as T from 'three';
import type {AdventureArea} from './areas';
import {biomeGuardian} from './biome-guardian';
import {joint,addMesh as add,satin} from './model-parts';
/** Owner controls dormant/awake stage; this asset never infers it from a local seal count. */
export function dormantBoss(area:AdventureArea){
 const root=new T.Group();root.name=`dormant-${area}`;const stone=satin(area==='desert'?0xc4a97c:area==='sea'?0x7d9d9c:0x87918a),moss=satin(0x60875c),wood=satin(0x81634b),glow=new T.MeshBasicMaterial({color:area==='desert'?0xffd790:0x9be6c9,transparent:true,opacity:0});
 if(area==='forest'||area==='classic'){
  const tree=joint(root,0,0,0,'sleeping-tree');tree.scale.setScalar(1.65);add(tree,new T.CylinderGeometry(.28,.45,1.65,9),wood,0,.82,0);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,q=add(tree,new T.ConeGeometry(.12,.85,7),wood,Math.sin(a)*.35,.16,Math.cos(a)*.35);q.rotation.z=Math.cos(a)*1.05;q.rotation.x=Math.sin(a)*1.05;}
  for(const s of[-1,1]){const b=add(tree,new T.CylinderGeometry(.08,.14,.95,7),wood,s*.4,1.25,0);b.rotation.z=-s*.9;const shut=add(tree,new T.TorusGeometry(.075,.012,4,10,Math.PI),wood,s*.13,1.05,.28);shut.rotation.z=Math.PI;}
  for(const[x,y,z,r]of [[0,1.95,0,.74],[-.55,1.73,0,.54],[.5,1.77,.04,.58],[0,1.71,.42,.5]])add(tree,new T.IcosahedronGeometry(r,1),moss,x,y,z).scale.y=.75;
  add(tree,new T.OctahedronGeometry(.11),glow,0,.86,.32);
 }else{
  const statue=biomeGuardian(area,true);statue.name='sleeping-monument';statue.userData.animate?.(0,0,0,false,100,1);const clones=new Map<T.Material,T.Material>();
  statue.traverse(o=>{if(!(o instanceof T.Mesh))return;if(o.name==='held-poison-fruit'){o.visible=false;return;}const recolor=(mat:T.Material)=>{let clone=clones.get(mat);if(!clone){clone=mat.clone();if('color'in clone)(clone as T.MeshLambertMaterial).color.copy(stone.color);if('emissive'in clone)(clone as T.MeshLambertMaterial).emissive?.set(0);clones.set(mat,clone);}return clone;};o.material=Array.isArray(o.material)?o.material.map(recolor):recolor(o.material);});
  const armor=statue.getObjectByName('king-armor');if(armor)armor.visible=false;root.add(statue);
  const retained=new Set<T.Material>();statue.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])retained.add(m);});for(const original of clones.keys())if(!retained.has(original))original.dispose();
  if(area!=='sea')for(let i=0;i<5;i++){const a=i*Math.PI*2/5;add(root,new T.IcosahedronGeometry(.16,0),area==='desert'?stone:moss,Math.sin(a)*.35,.12,Math.cos(a)*.35).scale.y=.2;}
  add(root,new T.OctahedronGeometry(.12),glow,0,area==='sea'?1.4:1.25,.5);
 }
 const ring=add(root,new T.TorusGeometry(.7,.025,5,32),glow,0,.055,0);ring.rotation.x=-Math.PI/2;ring.name='awakening-ring';root.userData.awaken=(progress:number)=>{const p=Math.max(0,Math.min(1,progress));glow.opacity=p*.8;ring.scale.setScalar(.8+p*.6);root.rotation.z=Math.sin(p*Math.PI*10)*Math.sin(p*Math.PI)*.012;};return root;
}
