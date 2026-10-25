"""Build-time exact 90% branching catalogue. Square cells; >=95% occupied rooms.
Templates are packed once; endpoint backbite moves vary walls without changing lengths.
"""
import json,random,time,subprocess,tempfile
from pathlib import Path
USED_TEMPLATES=set()
def packed(count,w,h,cy,L,gy,seed,binary):
 incoming=count==5 and cy>=0
 if incoming and h!=18:raise ValueError("Invalid incoming decision geometry")
 args=[str(binary),str(w),str(h),str(count),str(cy),str(38 if incoming else L),str(gy),str(seed)]+(['incoming']if incoming else[])
 result=subprocess.run(args,capture_output=True,text=True,timeout=120,check=True)
 path=[tuple(p)for p in json.loads(result.stdout)]
 if incoming:
  m=38;root=path[m];arms=[list(reversed(path[:m+1])),path[m:m+35],path[m:m+3]+path[m+35:m+67],[root]+path[m+67:m+101],list(reversed(path[m-2:m+1]))+path[m+101:m+133]];arms=[[(0,cy),(1,cy)]+a for a in arms]
  return dict(w=w,h=h,arms=arms,cy=cy,gy=arms[0][-1][1])
 root=path[L]
 arms=[list(reversed(path[:L+1])),path[L:L+37]]
 if count==3:arms.append([root]+path[L+37:L+73])
 if count>=4:arms += [path[L:L+3]+path[L+37:L+71],[root]+path[L+71:L+107]]
 if count==5:arms.append(list(reversed(path[L-2:L+1]))+path[L+107:L+141])
 print('packed',count,w,h,cy,L,gy,flush=True)
 return dict(w=w,h=h,arms=arms,cy=root[1],gy=arms[0][-1][1])

def plan(level):
 if level<=10:return[2]
 if level<=20:return[3]
 if level<=30:return[3,2]
 if level<=40:return[3,3]
 return [[4,3,4],[5,4,4],[5,4,4,3],[5,5,4,4],[5,5,5,4,4],[5,5,5,5,5]][(level-41)//10]

def build(counts,seed,templates,binary):
 r=random.Random(seed);h=18 if counts==[5,5] else 9 if max(counts)<=3 else 15 if max(counts)==4 else 17;cy=-2;modules=[]
 for i,count in enumerate(counts):
  w={9:{2:9,3:13},15:{3:8,4:10},17:{4:9,5:11},18:{5:10}}[h][count];L=39 if i+1<len(counts)else 40;gy=h//2 if i+1<len(counts)else -2
  key=f'{count}-{w}-{h}-{cy}-{L}-{gy}'
  variant=(seed//100003)%3 if (counts==[3]or counts==[3,2]and i==0 or counts==[4])else 0
  if variant:key+=f'-variant-{variant}'
  USED_TEMPLATES.add(key)
  if key not in templates:
   templates[key]=packed(count,w,h,cy,L,gy,seed+variant*104729,binary);Path('scripts/retro-templates.json').write_text(json.dumps(templates))
  m=json.loads(json.dumps(templates[key]));m['arms']=[[tuple(p)for p in a]for a in m['arms']]
  # Backbite changes the interior of a failed path while preserving its root and exact length.
  for a in m['arms'][1:]:
   for _ in range(150):
    q=a[-1];near=[j for j,p in enumerate(a[:-2])if j>4 and abs(q[0]-p[0])+abs(q[1]-p[1])==1]
    if near:j=r.choice(near);a[j+1:]=reversed(a[j+1:])
  for a in m['arms']:
   for _ in range(200):
    if len(a)<8:continue
    i=r.randrange(5,len(a)-2);p=a[i];near=[j for j in range(i+2,len(a)-1)if abs(p[0]-a[j][0])+abs(p[1]-a[j][1])==1 and abs(a[i+1][0]-a[j+1][0])+abs(a[i+1][1]-a[j+1][1])==1]
    if near:j=r.choice(near);a[i+1:j+1]=reversed(a[i+1:j+1])
  modules.append(m);cy=m['gy']
 width=sum(m['w']for m in modules);edges=set();used=set();ds=[];offset=0
 for i,m in enumerate(modules):
  arms=[[(x+offset,y)for x,y in a]for a in m['arms']]
  if i+1<len(modules):arms[0].append((offset+m['w'],arms[0][-1][1]))
  for a in arms:
   used.update(a)
   for p,q in zip(a,a[1:]):edges.add(tuple(sorted((p,q))))
  point=lambda p:dict(x=p[0],y=p[1]);root=arms[0][0];hall=[root]if counts[i]<=3 else list({p for a in arms for p in a if sum(p in b for b in arms)>1})
  ds.append(dict(point=point(root),next=point(arms[0][-1]),length=40,hall=counts[i]>3,hallCells=list(map(point,hall)),choices=[dict(end=point(a[-1]),length=len(a)-1,correct=j==0)for j,a in enumerate(arms)]));offset+=m['w']
 flipx=r.choice([0,1]);flipy=r.choice([0,1]);rotate=r.choice([0,1])if width==h else 0
 def transform(p):
  x,y=p;x=width-1-x if flipx else x;y=h-1-y if flipy else y
  return(y,x)if rotate else(x,y)
 grid=[[1]*(width*2+1)for _ in range(h*2+1)]
 if rotate:grid=[[1]*(h*2+1)for _ in range(width*2+1)]
 for p in used:
  x,y=transform(p);grid[y*2+1][x*2+1]=0
 for p,q in edges:
  x,y=transform(p);u,v=transform(q);grid[y+v+1][x+u+1]=0
 def pt(p):return dict(zip(['x','y'],transform((p['x'],p['y']))))
 for d in ds:
  d['point']=pt(d['point']);d['next']=pt(d['next']);d['hallCells']=list(map(pt,d['hallCells']))
  for c in d['choices']:c['end']=pt(c['end'])
 tog=lambda p:dict(x=p['x']*2+1,y=p['y']*2+1)
 coverage=len(used)/(width*h)
 if coverage<.95:raise RuntimeError(('Sparse layout',counts,coverage))
 return dict(grid=grid,start=tog(ds[0]['point']),finish=tog(ds[-1]['next']),seed=seed,decisions=ds,metrics=dict(coverage=coverage,cols=width,rows=h))
if __name__=='__main__':
 import os
 os.chdir(Path(__file__).resolve().parent.parent)
 build_dir=tempfile.TemporaryDirectory(prefix='maze-retro-');binary=Path(build_dir.name)/'retro-packing'
 subprocess.run(['g++','-O3','-std=c++17','scripts/retro-packing.cpp','-o',str(binary)],check=True)
 templates=json.loads(Path('scripts/retro-templates.json').read_text())if Path('scripts/retro-templates.json').exists()else{};out=[]
 seen=set()
 for level in range(5,101):
  choices=plan(level);pages=[]
  for i in range(0,len(choices),2):
   for retry in range(300):
    page=build(choices[i:i+2],level*100003+i*9173+retry*100000007,templates,binary);fingerprint=json.dumps(page['grid'])
    if fingerprint not in seen:seen.add(fingerprint);pages.append(page);break
   else:raise RuntimeError(('Duplicate Retro map',level,i))
  out.append(dict(level=level,choices=choices,pages=pages));print('level',level,flush=True)
 Path('src/game/retro-catalog.json').write_text(json.dumps(out,separators=(',',':')))
 Path('scripts/retro-templates.json').write_text(json.dumps({k:templates[k]for k in sorted(USED_TEMPLATES)},separators=(',',':')))
