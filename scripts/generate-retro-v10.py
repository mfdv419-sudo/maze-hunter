"""Build-time search: meaningful long decoys and dense use of the board. No search runs on a phone."""
import json
from pathlib import Path
import random,collections,time
D=[(1,0),(-1,0),(0,1),(0,-1)]
def tree(n,r):
 adj=[[] for _ in range(n*n)];seen={r.randrange(n*n)};stack=list(seen)
 while stack:
  p=stack[-1];x,y=p%n,p//n;opts=[(y+b)*n+x+a for a,b in D if 0<=x+a<n and 0<=y+b<n and (y+b)*n+x+a not in seen]
  if not opts:stack.pop();continue
  q=r.choice(opts);adj[p].append(q);adj[q].append(p);seen.add(q);stack.append(q)
 return adj

def short_leaves(adj):
 out=[]
 for a in range(len(adj)):
  if len(adj[a])!=1:continue
  prev=-1;p=a;length=0
  while True:
   nxt=[q for q in adj[p]if q!=prev]
   if not nxt:break
   length+=1;prev,p=p,nxt[0]
   if len(adj[p])!=2:break
  if length<6:out.append(a)
 return out

def repair(adj,n,r):
 bad=short_leaves(adj)
 for _ in range(n*n):
  if not bad:return True
  improved=False;r.shuffle(bad)
  for leaf in bad:
   x,y=leaf%n,leaf//n;opts=[(y+b)*n+x+a for a,b in D if 0<=x+a<n and 0<=y+b<n and (y+b)*n+x+a not in adj[leaf]];r.shuffle(opts)
   for target in opts:
    parent={leaf:-1};queue=[leaf]
    for p in queue:
     if p==target:break
     for q in adj[p]:
      if q not in parent:parent[q]=p;queue.append(q)
    edges=[];p=target
    while parent[p]!=-1:edges.append((p,parent[p]));p=parent[p]
    r.shuffle(edges);adj[leaf].append(target);adj[target].append(leaf)
    for a,b in edges:
     adj[a].remove(b);adj[b].remove(a);nextbad=short_leaves(adj)
     if len(nextbad)<len(bad):bad=nextbad;improved=True;break
     adj[a].append(b);adj[b].append(a)
    if improved:break
    adj[leaf].remove(target);adj[target].remove(leaf)
   if improved:break
  if not improved:return False
 return False

def choose(n,seed):
 r=random.Random(seed);adj=tree(n,r);
 repair(adj,n,r)
 while True:
  bad=short_leaves(adj)
  if not bad:break
  for leaf in bad:
   if len(adj[leaf])!=1:continue
   p=leaf;prev=-1
   while len(adj[p])<=2:
    nxt=[q for q in adj[p]if q!=prev]
    if not nxt:break
    q=nxt[0];adj[q].remove(p);adj[p]=[];prev=-1;p=q
    if len(adj[p])!=1:break
 if sum(bool(a) for a in adj)<n*n*.9:return
 starts=[p for p in range(n*n)if len(adj[p])>=2 and 0<p%n<n-1 and 0<p//n<n-1];r.shuffle(starts)
 for start in starts[:12]:
  parent={start:-1};order=[start]
  for p in order:
   for q in adj[p]:
    if q not in parent:parent[q]=p;order.append(q)
  ends=[p for p in order if len(adj[p])==1 and 0<p%n<n-1 and 0<p//n<n-1];r.shuffle(ends)
  for finish in ends[:12]:
   path=[];p=finish
   while p!=-1:path.append(p);p=parent[p]
   path.reverse();L=len(path)-1
   if not n*2.3<=L<=n*n*.48:continue
   if sum(len(adj[p])>=3 for p in path)<8:continue
   ps=set(path);branches=[]
   for i,p in enumerate(path[:-1]):
    for q in adj[p]:
     if q in ps:continue
     queue=[(q,p,1)];far=q;depth=0;branching=0
     for a,prev,d in queue:
      if d>depth:depth=d;far=a
      branching+=len(adj[a])>=3
      queue.extend((b,a,d+1) for b in adj[a]if b!=prev)
     branches.append(dict(at=i,length=depth,end=far,cells=len(queue),forks=branching,ratio=depth/max(1,L-i)))
   majors=[b for b in branches if b['length']>=max(8,(L-b['at'])*.5)]
   if len(majors)<3:continue
   if not any(b['at']==0 and b['length']>=L*.5 for b in majors):continue
   if sum(b['at']<=L*.5 and b['length']>=L*.5 for b in majors)<2:continue
   if not any(.5<=b['ratio']<=.7 for b in majors):continue
   if not any(b['forks']>=2 for b in majors):continue
   return adj,start,finish,path,branches

if __name__=='__main__':
 out=[]
 for level in range(6,101):
  n=13 if level<=10 else 15 if level<=20 else 17+((level-21)//10)*2
  for attempt in range(10000):
   seed=level*101003+attempt*7919;found=choose(n,seed)
   if found:break
  else:raise RuntimeError(('No qualifying maze',level))
  adj,start,finish,path,branches=found
  grid=[[1]*(n*2+1)for _ in range(n*2+1)]
  for p,ns in enumerate(adj):
   if not ns:continue
   x,y=p%n,p//n;grid[y*2+1][x*2+1]=0
   for q in ns:grid[y+q//n+1][x+q%n+1]=0
  point=lambda p:dict(x=(p%n)*2+1,y=(p//n)*2+1)
  L=len(path)-1;majors=[b for b in branches if b['length']>=max(8,(L-b['at'])*.5)]
  leaves=[]
  for p,ns in enumerate(adj):
   if len(ns)!=1:continue
   prev=-1;c=p;d=0
   while True:
    opts=[q for q in adj[c]if q!=prev]
    if not opts:break
    prev,c=c,opts[0];d+=1
    if len(adj[c])!=2:break
   leaves.append(d)
  metrics=dict(solution=len(path),available=sum(bool(a)for a in adj),coverage=sum(bool(a)for a in adj)/(n*n),forks=sum(len(adj[p])>=3 for p in path),minDead=min(leaves),averageDead=sum(leaves)/len(leaves),majorDecoys=len(majors),earlyLongDecoys=sum(b['at']<=L*.5 and b['length']>=L*.5 for b in majors),startChoices=len(adj[start]),branches=branches)
  out.append(dict(grid=grid,start=point(start),finish=point(finish),seed=seed,metrics=metrics))
  print(level,attempt,'route',len(path),'coverage',round(metrics['coverage'],3),'decoys',len(majors),flush=True)
 Path('src/game/retro-catalog-v10.json').write_text(json.dumps(out,separators=(',',':')))
