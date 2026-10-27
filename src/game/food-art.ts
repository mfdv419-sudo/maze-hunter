import * as T from 'three';import type {FoodKind} from './expedition-items';
export function foodArt(kind:FoodKind){const root=new T.Group(),add=(geo:T.BufferGeometry,color:number,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,new T.MeshLambertMaterial({color}));m.position.set(x,y,z);root.add(m);return m;};root.name='food-'+kind;
 if(kind==='chili'){const curve=new T.CatmullRomCurve3([new T.Vector3(-.12,.15,0),new T.Vector3(0,.08,0),new T.Vector3(.14,-.02,0),new T.Vector3(.2,-.12,0)]);add(new T.TubeGeometry(curve,10,.07,7,false),0xe75c48);add(new T.CylinderGeometry(.015,.025,.14,6),0x6d9a52,-.12,.22);}
 if(kind==='watermelon'){add(new T.SphereGeometry(.2,12,8,0,Math.PI),0x6eac5e);const flesh=add(new T.CircleGeometry(.19,20),0xe78079,0,0,.002);for(let i=0;i<5;i++)add(new T.SphereGeometry(.013,5,4),0x433b40,Math.sin(i*2.4)*.12,Math.cos(i*2.4)*.12,.012);flesh.rotation.z=.2;}
 if(kind==='spinach')for(let i=0;i<4;i++){const leaf=add(new T.SphereGeometry(1,8,6),i%2?0x62ac66:0x8acb6c,Math.sin(i*1.6)*.08,i*.035,0);leaf.scale.set(.075,.18,.025);leaf.rotation.z=i*.6;}
 return root;
}
