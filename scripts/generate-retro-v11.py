"""Generate exact staged choices. Each failed arm is 90% of the corresponding correct arm. Build-time only."""
import json,math
from pathlib import Path
import random,time
DIRS=[(-1,0),(1,0),(0,-1),(0,1)]

def path_search(start,length,allowed,used,r,target=None,budget=8000):
 path=[start];local={start};nodes=0
 def visit(p,left):
  nonlocal nodes
  nodes+=1
  if nodes>budget:return False
  if not left:return target is None or p==target
  if target is not None:
   d=abs(p[0]-target[0])+abs(p[1]-target[1])
   if d>left or (left-d)%2:return False
  opts=[(p[0]+a,p[1]+b)for a,b in DIRS];r.shuffle(opts)
  # Randomness plus a mild onward-degree bias prevents short trapped arms.
  opts.sort(key=lambda q:r.random()*4+sum((q[0]+a,q[1]+b)in allowed and (q[0]+a,q[1]+b)not in used and (q[0]+a,q[1]+b)not in local for a,b in DIRS)*.35,reverse=True)
  for q in opts:
   if q not in allowed or q in used or q in local:continue
   if target is not None and q==target and left!=1:continue
   local.add(q);path.append(q)
   if visit(q,left-1):return True
   local.remove(q);path.pop()
  return False
 return path if visit(start,length)else None

def module(n,h,choices,L,r):
 root=(n//2,h-1);goal=(n//2,0);neighbors=[(root[0]-1,root[1]),(root[0]+1,root[1]),(root[0],root[1]-1)];r.shuffle(neighbors)
 active=neighbors[:choices];r.shuffle(active);correct=active[0];reserve=set(neighbors)-{correct}
 allowed={(x,y)for y in range(1,h)for x in range(n)}|{goal}
 used={root}|reserve
 main=path_search(correct,L-1,allowed,used,r,goal)
 if not main:return
 main=[root]+main;used=set(main)|set(neighbors)
 arms=[main]
 # Fail fast if a wrong arm cannot attain its full 90% length.
 for first in active[1:]:
  used.remove(first);bad=path_search(first,round(L*.9)-1,allowed,used,r)
  if not bad:return
  arm=[root]+bad;arms.append(arm);used.update(bad)
 return arms


def plan(level):
 if level<=10:return [2]
 band=(level-11)//10
 return [3]*(band//2+1)+([2]if band%2 else [])

def build_page(choices,seed):
 r=random.Random(seed);double=len(choices)==2;n=17 if double else 9 if choices[0]==2 else 11;h=9 if double else n;L=40 if double else 30
 modules=[]
 for count in choices:
  for attempt in range(5000):
   arms=module(n,h,count,L,r)
   if arms:modules.append(arms);break
  else:raise RuntimeError(('No module',choices,seed))
 # One rotation/mirror for the complete connected page, not independent rotations at a shared junction.
 turns=r.randrange(4);mirror=r.choice([False,True])
 def transform(p):
  x,y=p
  if mirror:x=n-1-x
  for _ in range(turns):x,y=n-1-y,x
  return (x+1,y+1)
 edges=set();used=set();decisions=[]
 for i,arms in enumerate(modules):
  dy=(len(modules)-1-i)*(h-1)
  paths=[[transform((x,y+dy))for x,y in a]for a in arms]
  for path in paths:
   used.update(path)
   for a,b in zip(path,path[1:]):edges.add(tuple(sorted((a,b))))
  ordered=sorted(enumerate(paths),key=lambda z:math.atan2(z[1][1][1]-z[1][0][1],z[1][1][0]-z[1][0][0]))
  point=lambda p:dict(x=p[0],y=p[1])
  decisions.append(dict(point=point(paths[0][0]),next=point(paths[0][-1]),length=L,choices=[dict(end=point(path[-1]),length=len(path)-1,correct=index==0)for index,path in ordered]))
 rooms=n+2;grid=[[1]*(rooms*2+1)for _ in range(rooms*2+1)]
 for x,y in used:grid[y*2+1][x*2+1]=0
 for (x,y),(a,b)in edges:grid[y+b+1][x+a+1]=0
 start=decisions[0]['point'];finish=decisions[-1]['next'];to_grid=lambda p:dict(x=p['x']*2+1,y=p['y']*2+1)
 return dict(grid=grid,start=to_grid(start),finish=to_grid(finish),seed=seed,decisions=decisions,metrics=dict(rooms=len(used),coverage=len(used)/(rooms*rooms),solution=len(choices)*L,decisions=len(choices)))

if __name__=='__main__':
 out=[]
 for level in range(5,101):
  choices=plan(level);pages=[]
  for index in range(0,len(choices),2):pages.append(build_page(choices[index:index+2],level*100003+index*7919))
  out.append(dict(level=level,choices=choices,pages=pages));print(level,choices,len(pages),flush=True)
 target=Path('src/game/retro-catalog-v11.json');temporary=target.with_suffix('.tmp');temporary.write_text(json.dumps(out,separators=(',',':')));temporary.replace(target)
