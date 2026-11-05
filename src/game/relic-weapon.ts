import * as T from 'three';
import {addMesh,satin,disposeModel} from './model-parts';
export type RelicWeaponForm='blade'|'spear'|'staff';
export function relicWeaponModel(form:RelicWeaponForm){
 const g=new T.Group();g.name='relic-weapon-'+form;
 const dark=satin(0x2c3d49),gold=satin(0xe9c86d),crystal=new T.MeshLambertMaterial({color:0x8bd9e8,emissive:0x245b70,emissiveIntensity:.7});
 const grip=addMesh(g,new T.CylinderGeometry(.028,.034,.38,7),dark,0,.2,0);grip.rotation.z=0;
 if(form==='blade'){
  addMesh(g,new T.BoxGeometry(.22,.035,.055),gold,0,.39,0);
  const blade=addMesh(g,new T.ConeGeometry(.085,.68,5),crystal,0,.75,0);blade.scale.x=.52;
 }else if(form==='spear'){
  addMesh(g,new T.CylinderGeometry(.018,.025,.88,7),gold,0,.66,0);
  const tip=addMesh(g,new T.ConeGeometry(.075,.3,5),crystal,0,1.24,0);tip.scale.x=.7;
 }else{
  addMesh(g,new T.CylinderGeometry(.024,.032,.95,7),gold,0,.72,0);
  const core=addMesh(g,new T.OctahedronGeometry(.11),crystal,0,1.24,0);core.rotation.z=Math.PI/4;
  const ring=addMesh(g,new T.TorusGeometry(.16,.018,5,18),gold,0,1.24,0);ring.rotation.x=Math.PI/2;
 }
 g.rotation.z=-.18;g.rotation.x=.1;g.position.set(.02,-.02,.02);
 g.userData.dispose=()=>disposeModel(g);return g;
}
