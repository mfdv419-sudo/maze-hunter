import * as T from 'three';
/** Sigils have distinct three-dimensional emblems; main Diamonds keep their blue crystal silhouette. */
export function forestSigil(index:number){
 const g=new T.Group(),light=new T.MeshBasicMaterial({color:0xe4fff0}),gold=new T.MeshLambertMaterial({color:0xe4c67c}),central=new T.Mesh(new T.OctahedronGeometry(.13),new T.MeshLambertMaterial({color:0x63e8d1,emissive:0x176c61}));central.name='seal-crystal';central.position.y=1.05;g.add(central);
 const emblem=new T.Group();emblem.position.y=1.05;g.add(emblem);const ring=new T.Mesh(new T.TorusGeometry(.32,.032,6,28),gold);emblem.add(ring);
 if(index===0)for(let i=0;i<3;i++){const a=new T.Mesh(new T.TorusGeometry(.11,.018,4,16,Math.PI*1.7),light);a.position.set((i-1)*.065,(i-1)*.09,.07);a.rotation.z=i*.7;emblem.add(a);}
 else if(index===1){const curve=new T.CatmullRomCurve3([new T.Vector3(0,.22,.07),new T.Vector3(.17,0,.07),new T.Vector3(0,-.22,.07),new T.Vector3(-.17,0,.07),new T.Vector3(0,.22,.07)],false,'catmullrom',0);emblem.add(new T.Mesh(new T.TubeGeometry(curve,8,.021,4,false),light));}
 else {const drop=new T.Mesh(new T.SphereGeometry(.12,9,7),light);drop.position.set(0,-.05,.07);emblem.add(drop);const tip=new T.Mesh(new T.ConeGeometry(.11,.23,9),light);tip.position.set(0,.09,.07);emblem.add(tip);}
 return g;
}
