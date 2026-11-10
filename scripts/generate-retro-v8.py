import random,json,time
from pathlib import Path
out=[]
def build(n,seed):
 r=random.Random(seed);adj={};stack=[(r.randrange(1,n-1),r.randrange(1,n-1))];adj[stack[0]]=set()
 while stack:
  x,y=stack[-1];opts=[(x+a,y+b)for a,b in[(1,0),(-1,0),(0,1),(0,-1)]if 0<=x+a<n and 0<=y+b<n and (x+a,y+b)not in adj]
  if not opts:stack.pop();continue
  q=r.choice(opts);adj[q]={(x,y)};adj[x,y].add(q);stack.append(q)
 # Use an interior start; choose distant interior goal so borders don't reveal either.
 start=next(iter(adj));parents={start:None};q=[start]
 for p in q:
  for z in adj[p]:
   if z not in parents:parents[z]=p;q.append(z)
 ends=[p for p in q if len(adj[p])==1 and 1<=p[0]<n-1 and 1<=p[1]<n-1]
 if not ends:return
 finish=r.choice(sorted(ends,key=lambda p:q.index(p))[-min(8,len(ends)):]);path=[];p=finish
 while p is not None:path.append(p);p=parents[p]
 path=path[::-1];ps=set(path)
 # Remove short terminal twigs, including newly exposed short branches.
 while True:
  removed=False
  for p in list(adj):
   if p in ps or len(adj[p])!=1:continue
   branch=[p];prev=None;c=p
   while True:
    opts=adj[c]-({prev}if prev else set())
    if not opts:break
    z=next(iter(opts))
    if z in ps or len(adj[z])!=2:break
    branch.append(z);prev,c=c,z
   if len(branch)<4:
    for z in branch:
     for a in adj[z]:adj[a].discard(z)
     del adj[z]
    removed=True;break
  if not removed:break
 lengths=[];near=0;promising=0;approaches=0
 for p in adj:
  if p in ps or len(adj[p])!=1:continue
  branch=[p];prev=None;c=p
  while True:
   opts=adj[c]-({prev}if prev else set())
   if not opts:break
   z=next(iter(opts))
   if z in ps or len(adj[z])!=2:break
   branch.append(z);prev,c=c,z
  lengths.append(len(branch))
 # Measure misleading off-solution components, not merely terminal twigs.
 for p in path:
  for z in adj[p]-ps:
   seen={p};pending=[z];steps=[]
   for a in pending:
    if a in seen:continue
    seen.add(a);steps.append(a)
    pending.extend(adj[a]-seen)
   if any(abs(a[0]-finish[0])+abs(a[1]-finish[1])<=2 for a in steps):near+=1
   d0=abs(p[0]-finish[0])+abs(p[1]-finish[1])
   if sum(abs(a[0]-finish[0])+abs(a[1]-finish[1])<=d0 for a in steps)>=len(steps)*.5:promising+=1
   if min((abs(a[0]-finish[0])+abs(a[1]-finish[1]) for a in steps),default=d0)<=d0-2:approaches+=1
 forks=sum(len(adj[p])>=3 for p in path);border=sum(x in(0,n-1)or y in(0,n-1)for x,y in path)/len(path)
 ratio=len(path)/len(adj)
 metrics=dict(solution=len(path),available=len(adj),ratio=round(ratio,3),forks=forks,minDead=min(lengths,default=0),averageDead=round(sum(lengths)/max(1,len(lengths)),2),near=near,promising=promising,border=round(border,3),deadEnds=len(lengths),approaches=approaches)
 grid=[[1]*(n*2+1)for _ in range(n*2+1)]
 for (x,y),ns in adj.items():
  grid[y*2+1][x*2+1]=0
  for a,b in ns:grid[y+b+1][x+a+1]=0
 return dict(grid=grid,start=dict(x=start[0]*2+1,y=start[1]*2+1),finish=dict(x=finish[0]*2+1,y=finish[1]*2+1),seed=seed,metrics=metrics)

# Build time catalog, never a random search on the player's phone.
for level in range(6,101):
 n=13 if level<=10 else 15 if level<=20 else 17+((level-21)//10)*2
 for attempt in range(20000):
  m=build(n,level*101003+attempt*7919)
  if not m:continue
  v=m['metrics']
  if v['forks']>=8 and v['minDead']>=4 and v['averageDead']>=4 and v['ratio']>=.6 and v['border']<=.3 and v['promising']>=3 and v['approaches']>=2:break
 else:raise RuntimeError(('No qualifying maze',level))
 out.append(m);print(level,attempt,v,flush=True)
 Path('src/game/retro-catalog-v8.json').write_text(json.dumps(out,separators=(',',':')))
