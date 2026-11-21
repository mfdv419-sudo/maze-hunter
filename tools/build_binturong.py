"""Maze Hunter Binturong master asset, reproducible sculpted/skinned GLB exporter.
No Blender API required: surface implicit modeling -> marching cubes -> glTF skin/animations.
Use: python tools/build_binturong.py (output path controlled by command line).
"""
from __future__ import annotations
import os,sys,json,struct,math
from pathlib import Path
import numpy as np
from skimage.measure import marching_cubes
from scipy.spatial.transform import Rotation
import trimesh

ROOT = Path(sys.argv[1]) if len(sys.argv)>1 else Path('public/models')
ROOT.mkdir(parents=True,exist_ok=True)
A=[]
# bones coordinates, rest joint locations (world coords)
BONES = [
 ('Hips', -1, (0.,.71,0.)),
 ('Spine',0,(0.,1.08,0.)),
 ('Neck',1,(0.,1.38,0.)),
 ('Head',2,(0.,1.65,0.)),
 ('UpperArm_L',1,(-.425,1.23,0.)),
 ('ForeArm_L',4,(-.49,.90,.01)),
 ('UpperArm_R',1,(.425,1.23,0.)),
 ('ForeArm_R',6,(.49,.90,.01)),
 ('Thigh_L',0,(-.206,.62,0.)),
 ('Shin_L',8,(-.205,.34,0.)),
 ('Thigh_R',0,(.206,.62,0.)),
 ('Shin_R',10,(.205,.34,0.)),
 ('TailBase',0,(0.,.76,-.24)),
 ('TailMid',12,(.08,.75,-.64)),
 ('TailTip',13,(.43,.97,-.88)),
]
BI={n:i for i,(n,_,_) in enumerate(BONES)}
BM=np.array([b[2] for b in BONES],dtype=np.float32)

# Material catalogue for discrete readable costume layers.
COLORS={
 'fur':(0.145,.175,.178), 'muzzle':(.285,.333,.325), 'inner_ear':(.405,.43,.394),
 'ivory':(.93,.853,.688), 'vest_edge':(.676,.499,.258),'vest_light':(.986,.928,.764),
 'teal':(.12,.55,.45), 'teal_light':(.31,.72,.54),'leaf':(.39,.64,.25),
 'gold':(.86,.57,.145),'gold_bright':(1.,.775,.268), 'ink':(.042,.06,.064),
 'brown':(.41,.255,.145), 'boot':(.3,.207,.155), 'boot_sole':(.12,.125,.125),
 'pink':(.485,.286,.301), 'eye_white':(1.,.974,.829),'black':(.025,.033,.035),
 'shimmer':(.965,.98,1.), 'gear_cream':(.84,.712,.468),
}
# Vertices, faces (as local per part), weights assigned per vertex, material index
PARTS=[]

def part(name,V,F,mat,bind=None):
 V=np.asarray(V,dtype=np.float32);F=np.asarray(F,dtype=np.int32)
 if len(F)<1:return
 PARTS.append(dict(name=name,V=V,F=F,mat=mat,bind=bind))


def ell_mesh(name,center,radii,mat,bind=None,sub=3,rot=None):
 m=trimesh.creation.icosphere(subdivisions=sub,radius=1.0)
 v=np.asarray(m.vertices)*np.array(radii,dtype=float)
 if rot is not None:v=v@Rotation.from_euler('xyz',rot).as_matrix().T
 v+=np.asarray(center)
 part(name,v,m.faces,mat,bind)


def tube(name,pts,radii,mat,bind=None,sides=10):
 pts=np.asarray(pts,dtype=float);radii=np.asarray(radii if not np.isscalar(radii) else [radii]*len(pts),dtype=float)
 verts=[];faces=[]
 for i,p in enumerate(pts):
  tangent=pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)];tangent/=max(1e-10,np.linalg.norm(tangent))
  ref=np.array([0,0,1.]) if abs(tangent[2])<.90 else np.array([1.,0,0]);n=np.cross(tangent,ref);n/=np.linalg.norm(n)
  b=np.cross(tangent,n)
  for j in range(sides):
   th=2*np.pi*j/sides;verts.append(p+(math.cos(th)*n+math.sin(th)*b)*radii[i])
  if i:
   for j in range(sides):
    a=(i-1)*sides+j;b0=(i-1)*sides+(j+1)%sides;c=i*sides+j;d=i*sides+(j+1)%sides
    faces.extend([[a,b0,c],[b0,d,c]])
 faces.extend([list(reversed(range(sides))),list((len(pts)-1)*sides+j for j in range(sides))])
 # triangulate caps
 faces=[f for tri in faces for f in ([tri] if len(tri)==3 else [[tri[0],tri[i],tri[i+1]] for i in range(1,len(tri)-1)])]
 part(name,verts,faces,mat,bind)


def ell_sdf(X,Y,Z,c,r):
 # approximate true signed distance to ellipsoid (well behaved around zero)
 rx,ry,rz=r;cx,cy,cz=c
 q=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2+((Z-cz)/rz)**2)
 return (q-1.)*min(rx,ry,rz)

def smin(a,b,k):
 h=np.clip(.5+.5*(b-a)/k,0.,1.)
 return b*(1.-h)+a*h-k*h*(1.-h)

# Unified skin: torso, head, cheeks, jaw, entire arms and hindlegs as one manifold surface.
step=.0255
xs=np.arange(-.93,.93+step,step,dtype=np.float32)
ys=np.arange(-.09,2.27+step,step,dtype=np.float32)
zs=np.arange(-.91,.76+step,step,dtype=np.float32)
X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
shapes=[
 ((0,.92,-.002),(.34,.456,.294)),
 ((0,1.338,0),(.242,.210,.221)),
 ((0,1.675,.02),(.435,.360,.348)),
 ((-.255,1.535,.220),(.174,.127,.131)),((.255,1.535,.220),(.174,.127,.131)),
 ((0,1.487,.342),(.184,.113,.144)),
 ((-.339,1.939,-.06),(.107,.143,.078)),((.339,1.939,-.06),(.107,.143,.078)),
]
for s in [-1,1]:
 shapes+= [
 ((s*.416,1.166,-.006),(.114,.167,.115)),
 ((s*.449,.985,.018),(.092,.176,.091)),
 ((s*.478,.806,.067),(.091,.157,.087)),
 ((s*.493,.657,.130),(.111,.109,.110)),
 ((s*.207,.563,-.013),(.140,.229,.137)),
 ((s*.209,.343,.020),(.128,.205,.125)),
 ((s*.210,.167,.131),(.185,.137,.206)),
 ]
# two hands/feet significantly thinner than the old segmented spheres; fingers sculpted as small connected lobes
for side in [-1,1]:
 for f in [-.065,0,.065]:
  shapes.append(((side*.493+f*.70,.631,.216),(.039,.043,.048)))
 for f in [-.112,-.037,.038,.113]:
  shapes.append(((side*.209+f*.85,.112,.291),(.047,.055,.062)))
field=None
for j,(c,r) in enumerate(shapes):
 d=ell_sdf(X,Y,Z,c,r)
 field=d if field is None else smin(field,d,.051 if j<8 else .047)
v,f,n,values=marching_cubes(field,level=0,spacing=(step,step,step),allow_degenerate=False)
v+=np.array([xs[0],ys[0],zs[0]],np.float32)
part('Organic continuous Binturong — sculpted body, shoulders and paws',v,f,'fur')
del field,X,Y,Z

# Charcoal-to-cream face lobe and a short smooth muzzle. Eye glasses have profile rather than cutout triangles.
for side in [-1,1]:
 ell_mesh('Muzzle fur cheek', (side*.132,1.53,.328),(.116,.086,.066),'muzzle',BI['Head'],3)
 ell_mesh('Muzzle side patch', (side*.28,1.47,.224),(.077,.066,.038),'muzzle',BI['Head'],3)
ell_mesh('Soft nose',(0,1.525,.503),(.085,.059,.065),'black',BI['Head'],3)
tube('Smile', [(-.092,1.462,.450),(0,1.452,.480),(.092,1.462,.450)],[.007,.008,.007],'black',BI['Head'],9)
for side in [-1,1]:
 ell_mesh('Inner ear',(side*.336,1.952,.005),(.066,.085,.030),'inner_ear',BI['Head'],3)
 ell_mesh('Eye-mask',(side*.183,1.708,.326),(.144,.151,.058),'muzzle',BI['Head'],3)
 ell_mesh('Eye white',(side*.183,1.697,.381),(.102,.122,.041),'eye_white',BI['Head'],3)
 ell_mesh('Iris',(side*.178,1.687,.416),(.063,.091,.030),'black',BI['Head'],3)
 ell_mesh('Catchlight',(side*.156,1.736,.441),(.016,.024,.010),'shimmer',BI['Head'],3)
 # Thick gold eyewear rim built as toroidal tube with center over eyes
 angles=np.linspace(0,math.tau,72)
 pts=[(side*.183+math.sin(a)*.123,1.705+math.cos(a)*.143,.412+.004*math.cos(a)) for a in angles]
 tube('Golden round goggles',pts,[.023]*len(pts),'gold',BI['Head'],9)
 tube('Goggle temple',[(side*.291,1.728,.407),(side*.355,1.733,.234),(side*.371,1.722,.050)],[.014,.015,.014],'gold',BI['Head'])
 for i in range(3):
  tube('Whisker',[(side*.165,1.480-i*.029,.452),(side*.340,1.486-i*.04,.450),(side*.522,1.495-i*.048,.400)],[.0048,.004,.0025],'ivory',BI['Head'],7)
 # subtle brows 
 tube('Eyebrow',[(side*.11,1.864,.353),(side*.18,1.873,.354),(side*.25,1.855,.330)],[.023,.027,.014],'muzzle',BI['Head'])
tube('Glasses bridge',[(-.07,1.724,.430),(0,1.731,.439),(.07,1.724,.430)],[.017,.017,.017],'gold',BI['Head'])

# Actual tailored jacket shell, goes around front, side AND back. No flat oval decal.
def shell_mesh(name,kind='vest'):
 segments=72;vertical=28;verts=[];faces=[]
 for i in range(segments+1):
  a=2*math.pi*i/segments
  front=max(0,math.cos(a))
  top=1.255-.130*(front**9)
  bottom=.661+.018*math.sin(a)**2
  for j in range(vertical+1):
   s=j/vertical;y=bottom+(top-bottom)*s
   ratio=np.clip((y-.925)/.50,-.90,.90);fade=np.sqrt(1-ratio**2)
   rx=(.344*fade+.016)*1.061;rz=(.295*fade+.016)*1.068
   x=rx*math.sin(a)
   z=rz*math.cos(a)+.008
   # collar creates V shape, no scarf-only torso
   verts.append((x,y,z))
 for i in range(segments):
  for j in range(vertical):
   k=i*(vertical+1)+j;l=(i+1)*(vertical+1)+j
   faces.extend([[k,l,k+1],[k+1,l,l+1]])
 part(name,verts,faces,'ivory',BI['Spine'])
shell_mesh('Tailored adventure vest front and complete back')
# Continuous garment has raised panels; back and sides remain visible at all angles.
# These pieces are rigid on Spine so they do not stretch with the elbow/forearm.
for side in [-1,1]:
 tube('Jacket side piping',[(side*.304,.75,-.052),(side*.351,.91,-.055),(side*.332,1.11,-.071)],[.014,.015,.012],'vest_edge',BI['Spine'])
 tube('Vest lower hem',[(side*.29,.686,-.02),(side*.20,.684,.185),(side*.06,.689,.276)],[.020,.019,.018],'vest_edge',BI['Spine'])
 ell_mesh('Reinforced leather side panel',(side*.321,.93,.040),(.036,.240,.186),'vest_edge',BI['Spine'],3)
# Material edging, asymmetric pockets and neckline have strong garment readability
for side in [-1,1]:
 tube('Front lapel seam',[(side*.09,1.045,.310),(side*.114,.970,.317),(side*.101,.815,.299)],[.014,.012,.010],'vest_edge',BI['Spine'])
 ell_mesh('Expedition pocket',(side*.184,.812,.258),(.075,.060,.027),'gear_cream',BI['Spine'],3)
 ell_mesh('Pocket button',(side*.184,.831,.290),(.014,.014,.009),'gold',BI['Spine'],2)
 # backpack shoulder straps follow front and back shoulder
 tube('Backpack shoulder strap',[(side*.18,1.249,-.176),(side*.246,1.119,-.198),(side*.243,.968,-.238)],[.035,.031,.027],'vest_edge',BI['Spine'])
 tube('Front strap',[(side*.20,1.227,.192),(side*.235,1.109,.264),(side*.229,.969,.286)],[.021,.027,.022],'brown',BI['Spine'])
# front closure and collar
for z in [.305]:
 tube('Vest seam and zipper',[(0,1.026,z),(0,.933,.326),(0,.821,.319),(0,.709,.282)],[.010,.010,.009,.008],'vest_edge',BI['Spine'])
ell_mesh('Belt buckle',(0,.742,.314),(.042,.031,.019),'gold',BI['Spine'],3)
# neck scarf raised above shell
pts=[(.0,1.31,.277),(.076,1.242,.305),(.124,1.169,.318)]
tube('Green scarf tail',pts,[.057,.055,.021],'teal',BI['Neck'],12)
# Wrap collar as curved ribbon/ring, not a disk
angles=np.linspace(0,2*math.pi,42)
tube('Scarf ring',[(.23*np.sin(a),1.33+.004*np.cos(a),.21*np.cos(a)) for a in angles],.045,'teal',BI['Neck'],12)

# Main backpack, rounded conforming shell and real folded flap/ties behind character.
ell_mesh('Backpack shell',(0,.973,-.363),(.238,.275,.174),'gear_cream',BI['Spine'],3)
ell_mesh('Backpack flap',(0,1.137,-.503),(.218,.082,.068),'teal',BI['Spine'],3)
for side in [-1,1]:
 ell_mesh('Backpack loop',(side*.151,.985,-.524),(.039,.045,.018),'gold',BI['Spine'],3)
# sleeping roll and ties
tube('Sleeping roll',[(-.18,1.256,-.415),(.18,1.256,-.415)],.071,'teal',BI['Spine'],16)
for side in [-1,1]:
 ell_mesh('Backpack gold rivet',(side*.16,1.252,-.468),(.022,.025,.011),'gold',BI['Spine'],2)

# Explorer hat, compact brim with ring and slightly domed crown, not huge flat hovering disk
ell_mesh('Explorer hat crown',(0,2.055,-.016),(.292,.139,.250),'gear_cream',BI['Head'],3)
# brim ellipse mesh from torus-like bands
angles=np.linspace(0,2*math.pi,60)
verts=[];faces=[]
for r,h in [(.273,2.017),(.412,1.997),(.415,1.982),(.275,1.994)]:
 for a in angles:verts.append((r*np.cos(a),h+.012*np.cos(a)*np.sin(a),r*.77*np.sin(a)-.005))
for ring in range(3):
 for j in range(len(angles)-1):
  p=ring*len(angles)+j;q=(ring+1)*len(angles)+j;faces.extend([[p,q,p+1],[p+1,q,q+1]])
part('Hat with rolled brim',verts,faces,'gold',BI['Head'])
tube('Hat green band',[(.295*math.sin(a),2.071,.253*math.cos(a)-.015) for a in np.linspace(0,math.tau,60)],[.020]*60,'teal',BI['Head'],10)
# Leafy crown accents behind brim
for side in [-1,1]:
 for i in range(2):
  ell_mesh('Leaf feather',(side*(.24+i*.06),2.102+i*.038,-.092),(.030,.100,.027),'leaf',BI['Head'],2,rot=(0,0,side*.3))

# Feet: actual hiking boots with rounded toe caps and leg cuffs, no visible underside pads in front
for side in [-1,1]:
 ell_mesh('Leather hiking boot toe',(side*.206,.135,.265),(.209,.105,.207),'boot',BI['Shin_L'] if side==-1 else BI['Shin_R'],3)
 # boot shaft follows actual leg instead of blob at end
 ell_mesh('Boot upper',(side*.207,.235,.048),(.132,.132,.142),'boot',BI['Shin_L'] if side==-1 else BI['Shin_R'],3)
 tube('Boot cuff',[(side*.12,.339,-.03),(side*.20,.340,.11),(side*.27,.340,.07)],[.027,.028,.025],'vest_edge',BI['Shin_L'] if side==-1 else BI['Shin_R'])
 for lace in range(2):
  tube('Boot lace',[(side*.143,.242-lace*.04,.179),(side*.208,.235-lace*.04,.215),(side*.271,.242-lace*.04,.174)],[.009,.009,.009],'gold',BI['Shin_L'] if side==-1 else BI['Shin_R'])

# Curved prehensile tail, skinned progressively over three bones, starts inside body rear.
tail=[(0,.761,-.259),(.065,.700,-.449),(.14,.644,-.608),(.283,.665,-.748),(.474,.743,-.789),(.581,.875,-.747),(.593,1.025,-.699)]
from scipy.interpolate import CubicSpline
_tt=np.linspace(0,1,len(tail));_spline=CubicSpline(_tt,np.asarray(tail),axis=0,bc_type='natural');_tt2=np.linspace(0,1,34);_tailpts=_spline(_tt2)
tube('One continuous prehensile tail',_tailpts,np.interp(_tt2,_tt,[.102,.095,.087,.075,.065,.054,.045]),'fur',None,12)

# Automated weights: use a smooth primary-to-secondary bone interpolation and no hard rigid seam.
def skin_weights(V,bind):
 n=len(V);ids=np.zeros((n,4),dtype=np.uint16);ww=np.zeros((n,4),dtype=np.float32)
 if bind is not None:ids[:,0]=bind;ww[:,0]=1.;return ids,ww
 x,y,z=V[:,0],V[:,1],V[:,2]
 # Anatomically localized bone weights. Limb influence is radial, strongest away
 # from torso; prevents skinning spikes across waist and neck during actions.
 score=np.zeros((n,len(BONES)),np.float32)
 core=np.clip((.47-np.abs(x))/.25,0,1)
 score[:,BI['Hips']]=np.exp(-((y-.70)/.23)**2)*.8*core
 score[:,BI['Spine']]=np.exp(-((y-1.04)/.34)**2)*1.8*core
 score[:,BI['Neck']]=np.exp(-((y-1.37)/.12)**2)*1.0*core
 score[:,BI['Head']]=np.exp(-((y-1.7)/.28)**2)*2.8*np.clip((y-1.23)/.27,0,1)
 for side,names in [(-1,('UpperArm_L','ForeArm_L','Thigh_L','Shin_L')),(1,('UpperArm_R','ForeArm_R','Thigh_R','Shin_R'))]:
  armRad=np.exp(-((x-side*.47)/.145)**2)*np.exp(-((y-.98)/.35)**2)
  # Soft shoulder transition; upper arm moves without pulling the vest/cheek.
  armRad*=np.clip((abs(x)-.28)/.13,0,1)
  score[:,BI[names[0]]]+=armRad*(np.clip((y-.78)/.34,0,1)**1.4)*2.8
  score[:,BI[names[1]]]+=armRad*(np.clip((1.20-y)/.45,0,1)**1.2)*3.1
  legRad=np.exp(-((x-side*.21)/.17)**2)*np.exp(-((y-.31)/.35)**2)
  legRad*=np.clip((.77-y)/.18,0,1)
  score[:,BI[names[2]]]+=legRad*np.clip(y/.42,0,1)*2.8
  score[:,BI[names[3]]]+=legRad*np.clip((.62-y)/.37,0,1)*3.0
 score[:,BI['Spine']]*=np.clip((y-.57)/.13,0,1)
 if 'tail' in current_part_name.lower():
  score*=0
  score[:,BI['TailBase']]=np.exp(-((z+.36)/.28)**2)
  score[:,BI['TailMid']]=np.exp(-((z+.69)/.16)**2)
  score[:,BI['TailTip']]=np.exp(-((x-.56)/.24)**2)*np.clip(y-.64,0,1)+.0001
 score+=1e-8
 top=np.argsort(score,axis=1)[:,-4:][:,::-1]
 v=np.take_along_axis(score,top,axis=1)
 ids[:]=top.astype(np.uint16);ww[:]=v/np.maximum(1e-10,v.sum(axis=1,keepdims=True))
 return ids,ww

# glTF2 builder: multiple mesh primitives, one shared skin/bones, embedded PBR materials and 8 anim clips.
class Writer:
 def __init__(self):
  self.data=bytearray();self.views=[];self.access=[];self.parts=[]
 def acc(self,data,componentType,target=None,minmax=False):
  a=np.ascontiguousarray(data);pad=(-len(self.data))%4;self.data.extend(b'\x00'*pad)
  offset=len(self.data);self.data.extend(a.tobytes());length=a.nbytes
  v={'buffer':0,'byteOffset':offset,'byteLength':length};
  if target:v['target']=target
  self.views.append(v);viewId=len(self.views)-1
  if a.ndim==1:t='SCALAR';count=len(a)
  else:
   types={2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'};t=types[a.shape[1]];count=len(a)
  out={'bufferView':viewId,'componentType':componentType,'count':count,'type':t}
  if minmax:
   out['min']=[float(x) for x in a.reshape(count,-1).min(axis=0)]
   out['max']=[float(x) for x in a.reshape(count,-1).max(axis=0)]
  self.access.append(out);return len(self.access)-1
writer=Writer()
materials=[]
for name,rgb in COLORS.items():
 materials.append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':[float(x) for x in rgb]+[1.],
  'metallicFactor': .23 if 'gold' in name else .02,'roughnessFactor': .33 if 'gold' in name else .81},'doubleSided':False})
mat_index={k:i for i,k in enumerate(COLORS)}

# Node hierarchy: joints in local coords relative to parent bind position; mesh skin joints use inverse bind matrices.
nodes=[]
for i,(name,parent,p) in enumerate(BONES):
 tr=np.asarray(p)-(np.asarray(BONES[parent][2]) if parent>=0 else np.array([0,0,0]))
 nodes.append({'name':name,'translation':tr.astype(float).tolist(),'children':[]})
for i,(_,parent,_) in enumerate(BONES):
 if parent>=0:nodes[parent]['children'].append(i)
rootNode=len(nodes);nodes.append({'name':'BinturongMasterRoot','children':[0]})
IBM=np.array([np.eye(4,dtype=np.float32) for _ in BONES]);
for i,(_,_,p) in enumerate(BONES): IBM[i,:3,3]=-np.asarray(p)
# glTF matrices stored column-major
ibmIdx=writer.acc(np.asarray([x.T.reshape(16) for x in IBM],dtype=np.float32),5126)
# Aggregate geometry by visual/wardrobe slot + material. About 25 draw calls rather
# than one per decorative part; joint weights are preserved from each source mesh.

def slot_for(name):
 n=name.lower()
 if 'hat' in n and 'backpack' not in n:return 'headwear_hat'
 if 'leaf feather' in n:return 'headwear_leaf'
 if 'goggle' in n or 'glasses bridge' in n:return 'eyewear'
 if 'backpack' in n or 'sleeping roll' in n:return 'backpack'
 if 'boot' in n:return 'shoes'
 if 'scarf' in n:return 'scarf'
 if 'prehensile tail' in n:return 'tail'
 if any(k in n for k in ['vest','pocket','lapel','suspender','zipper','belt','front strap']):return 'outfit'
 return 'base'

import collections
BATCH=collections.defaultdict(list)
for p in PARTS:
 current_part_name=p['name']
 ids,weights=skin_weights(p['V'],p['bind'])
 BATCH[(slot_for(p['name']),p['mat'])].append((p,ids,weights))
meshdefs=[]
for (slot,mat),pieces in BATCH.items():
 V=[];F=[];N=[];I=[];W=[];offset=0
 for p,ids,weights in pieces:
  v,f=p['V'],p['F'];normals=np.asarray(trimesh.Trimesh(vertices=v,faces=f,process=False).vertex_normals,dtype=np.float32)
  V.append(v);F.append(f+offset);N.append(normals);I.append(ids);W.append(weights)
  offset+=len(v)
 V=np.vstack(V).astype(np.float32);F=np.vstack(F).astype(np.uint32)
 N=np.vstack(N).astype(np.float32);I=np.vstack(I).astype(np.uint16);W=np.vstack(W).astype(np.float32)
 attrib={'POSITION':writer.acc(V,5126,34962,True),
         'NORMAL':writer.acc(N,5126,34962),
         'JOINTS_0':writer.acc(I,5123,34962),
         'WEIGHTS_0':writer.acc(W,5126,34962)}
 idx=writer.acc(F.ravel(),5125,34963)
 meshname=f'Slot::{slot}::{mat}'
 meshId=len(meshdefs)
 meshdefs.append({'name':meshname,'primitives':[{'attributes':attrib,'indices':idx,'material':mat_index[mat],'mode':4}]})
 meshNode=len(nodes);nodes.append({'name':meshname,'mesh':meshId,'skin':0})
 nodes[rootNode]['children'].append(meshNode)

# Explicit skeletal actions as native GLTF clips.
def qrot(x=0,y=0,z=0):
 return Rotation.from_euler('xyz',[x,y,z]).as_quat().astype(np.float32)

CLIPS={}
def clip(name,duration,keys):
 # keys: dict bone => transform(time): quaternion list
 tracks={}
 for bone,fn in keys.items():
  times=np.linspace(0,duration,17,dtype=np.float32)
  tracks[bone]=(times,np.asarray([fn(t/duration) for t in times],dtype=np.float32))
 CLIPS[name]=tracks
clip('Idle',2.2,{
 'Spine':lambda t:qrot(0,0,.020*math.sin(t*2*math.pi)),
 'Head':lambda t:qrot(.014*math.sin(t*2*math.pi),.035*math.sin(t*2*math.pi),.009*math.sin(t*2*math.pi)),
 'UpperArm_R':lambda t:qrot(.040*math.sin(t*2*math.pi),0,-.09),
 'UpperArm_L':lambda t:qrot(-.040*math.sin(t*2*math.pi),0,.09),
 'TailBase':lambda t:qrot(0,.16*math.sin(t*2*math.pi),0)
 })
for name,dur,stride in [('Walk',.92,.46),('Run',.65,.76)]:
 clip(name,dur,{
  'Spine':lambda t:qrot((.075 if name=='Run' else .035)+.022*math.cos(4*math.pi*t),.035*math.sin(2*math.pi*t),.055*math.sin(2*math.pi*t)),
  'Head':lambda t:qrot(-.03+.025*math.cos(4*math.pi*t),-.030*math.sin(2*math.pi*t),-.015*math.sin(2*math.pi*t)),
  'UpperArm_L':lambda t:qrot(-stride*.64*math.sin(t*math.tau),0,.11),
  'UpperArm_R':lambda t:qrot(stride*.64*math.sin(t*math.tau),0,-.11),
  'ForeArm_L':lambda t:qrot(-.14-.21*max(0,math.sin(t*math.tau))),
  'ForeArm_R':lambda t:qrot(-.14-.21*max(0,-math.sin(t*math.tau))),
  'Thigh_L':lambda t:qrot(stride*math.sin(t*math.tau),0,.025*math.cos(t*math.tau)),
  'Thigh_R':lambda t:qrot(-stride*math.sin(t*math.tau),0,-.025*math.cos(t*math.tau)),
  'Shin_L':lambda t:qrot(-.14-max(0,math.sin(t*math.tau))*.55),
  'Shin_R':lambda t:qrot(-.14-max(0,-math.sin(t*math.tau))*.55),
  'TailBase':lambda t:qrot(0,.14*math.sin(t*math.tau))
 })
clip('Jump',.90,{
 'UpperArm_L':lambda t:qrot(-.82*math.sin(math.pi*t),0,.2),
 'UpperArm_R':lambda t:qrot(-.82*math.sin(math.pi*t),0,-.2),
 'Thigh_L':lambda t:qrot(-.3*math.sin(math.pi*t)),
 'Thigh_R':lambda t:qrot(-.3*math.sin(math.pi*t)),
 'Shin_L':lambda t:qrot(.50*math.sin(math.pi*t)),
 'Shin_R':lambda t:qrot(.50*math.sin(math.pi*t)),
 'Head':lambda t:qrot(-.04*math.sin(math.pi*t))
 })
clip('Climb',1.0,{
 'UpperArm_L':lambda t:qrot(-1.2+.24*math.sin(t*math.tau),0,.12),
 'UpperArm_R':lambda t:qrot(-1.2-.24*math.sin(t*math.tau),0,-.12),
 'ForeArm_L':lambda t:qrot(-.6),
 'ForeArm_R':lambda t:qrot(-.6),
 'Thigh_L':lambda t:qrot(-.27-.2*math.sin(t*math.tau)),
 'Thigh_R':lambda t:qrot(-.27+.2*math.sin(t*math.tau)),
 })
clip('Swim',1.10,{
 'Spine':lambda t:qrot(.22),
 'UpperArm_L':lambda t:qrot(-.23+.49*math.sin(t*math.tau),0,.22),
 'UpperArm_R':lambda t:qrot(-.23-.49*math.sin(t*math.tau),0,-.22),
 'Thigh_L':lambda t:qrot(.28*math.sin(t*math.tau)),
 'Thigh_R':lambda t:qrot(-.28*math.sin(t*math.tau)),
 'TailBase':lambda t:qrot(0,.23*math.sin(t*math.tau))
 })
clip('Attack',.72,{
 'Spine':lambda t:qrot(0,.18*math.sin(math.pi*t)),
 'UpperArm_R':lambda t:qrot(-1.7*math.sin(math.pi*t),-.16,0),
 'ForeArm_R':lambda t:qrot(-.65*math.sin(math.pi*t)),
 'Head':lambda t:qrot(-.07*math.sin(math.pi*t))
 })
clip('Wave',1.40,{
 'UpperArm_R':lambda t:qrot(-1.05*math.sin(math.pi*t),0,-.55*math.sin(math.pi*t)),
 'ForeArm_R':lambda t:qrot(-.75*math.sin(math.pi*t)),
 'Head':lambda t:qrot(0,.12*math.sin(math.pi*t),-.07*math.sin(math.pi*t))
 })
animations=[]
for name,tracks in CLIPS.items():
 sams=[];channels=[]
 for bone,(times,rots) in tracks.items():
  in_idx=writer.acc(times.astype(np.float32),5126,minmax=True)
  out_idx=writer.acc(rots.astype(np.float32),5126)
  si=len(sams);sams.append({'input':in_idx,'output':out_idx,'interpolation':'LINEAR'});
  channels.append({'sampler':si,'target':{'node':BI[bone],'path':'rotation'}})
 animations.append({'name':name,'samplers':sams,'channels':channels})

j={'asset':{'version':'2.0','generator':'Maze Hunter Character Rebuild / skin weights and integrated vest v2'},
 'scene':0,'scenes':[{'name':'Maze Hunter Binturong','nodes':[rootNode]}],
 'nodes':nodes,'skins':[{'name':'BinturongRig','joints':list(range(len(BONES))),'skeleton':0,'inverseBindMatrices':ibmIdx}],
 'meshes':meshdefs,
 'materials':materials,'buffers':[{'byteLength':len(writer.data)}],
 'bufferViews':writer.views,'accessors':writer.access,
 'animations':animations,
 'extras':{'version':2,'wardrobeSlots':['headwear','eyewear','scarf','outfit','backpack','gloves','shoes'],
           'modelMeters':2.2,'authoring':'Implicit sculpt with blended segments, detachable skinned outfit shell',
           'readme':'Import GLB to Blender; bones and eight animation tracks are editable. Anatomy is not a scan or literal image reconstruction.'}}
# GLB chunks
js=json.dumps(j,separators=(',',':')).encode('utf8');js+=b' ' * (-len(js)%4)
binData=bytes(writer.data);binData+=b'\0' * (-len(binData)%4)
out=ROOT/'binturong_master_rigged.glb'
with open(out,'wb') as fp:
 fp.write(struct.pack('<4sII',b'glTF',2,12+8+len(js)+8+len(binData)))
 fp.write(struct.pack('<I4s',len(js),b'JSON'));fp.write(js)
 fp.write(struct.pack('<I4s',len(binData),b'BIN\0'));fp.write(binData)
print('Wrote',out,'size',out.stat().st_size,'parts',len(PARTS),'triangles',sum(len(p['F']) for p in PARTS),'largest',[(p['name'],len(p['F'])) for p in sorted(PARTS,key=lambda p:-len(p['F']))[:6]],'bones',len(BONES),'clips',list(CLIPS))
# OBJ for preview via VTK (not delivered in delta)
if os.environ.get('EXPORT_PREVIEW_OBJ'):
 scene=trimesh.Scene()
 for p in PARTS:
  m=trimesh.Trimesh(vertices=p['V'],faces=p['F'],process=False); m.visual.vertex_colors=np.array(list(COLORS[p['mat']])+[1])*255
  scene.add_geometry(m)
 scene.export(ROOT/'binturong_master_preview.glb')
