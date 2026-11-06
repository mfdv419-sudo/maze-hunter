"""Dense rectangular staged mazes. Compact decision halls share one connected labyrinth, not isolated sector gardens."""
import json,random,math,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('paths',Path(__file__).with_name('generate-retro-v11.py'));paths=importlib.util.module_from_spec(spec);spec.loader.exec_module(paths)
def plan(level):
 if level<=10:return[2]
 if level<=20:return[3]
 if level<=30:return[3,2]
 if level<=40:return[3,3]
 return [[4,3,4],[5,4,4],[5,4,4,3],[5,5,4,4],[5,5,5,4,4],[5,5,5,5,5]][(level-41)//10]
def module(count,main_length,seed):
 w=15 if count==3 else 4*count+1;h=11 if count in [2,3] else 13;cx=2*count;cy=h//2;root=(cx,cy);goal=(w-1,cy);r=random.Random(seed)
 hall={(x,cy)for x in range(cx+2)}|{(cx,cy-1)}
 starts=[(cx-1,cy-1),(cx-1,cy+1),(cx+1,cy-1),(cx+1,cy+1),(cx,cy-2)]
 prefixes={q:[root,(q[0],cy),q]if q[0]!=cx else[root,(cx,cy-1),q]for q in starts}
 allowed={(x,y)for y in range(h)for x in range(w)}
 for attempt in range(12000):
  active=r.sample(starts,count)
  if len(set('L'if q[0]<cx else'R'if q[0]>cx else'U'for q in active))<2:continue
  correct=r.choice([q for q in active if q[0]>=cx]or active);active.remove(correct);r.shuffle(active);active=[correct]+active;used=hall|set(starts);arms=[]
  for i,q in enumerate(active):
   used.discard(q);prefix=prefixes[q];path=paths.path_search(q,(main_length if i==0 else 36)-2,allowed,used,r,goal if i==0 else None,budget=1500)
   if not path:break
   arms.append(prefix[:-1]+path);used.update(path)
  if len(arms)==count:
   # Vary orientation within a stage, without rotating the whole arena into a square.
   if r.choice([False,True]):arms=[[(x,h-1-y)for x,y in arm]for arm in arms]
   return w,h,arms
 raise RuntimeError(('Cannot build dense decision',count,main_length,seed))
def inflate(w,h,arms,seed):
 r=random.Random(seed);base=[[p for p in a]for a in arms];cx=arms[0][0][0];cy=h//2;reserved={(x,cy)for x in range(cx+2)}|{(cx,cy-1)}
 for attempt in range(150):
  out=[a[:] if i==0 else a[:-1]for i,a in enumerate(base)];used=set(p for a in out for p in a)|reserved;needs=[5]*len(arms)
  for step in range(sum(needs)):
   options=[]
   for i,arm in enumerate(out):
    if not needs[i]:continue
    for j,(a,b)in enumerate(zip(arm,arm[1:])):
     if j<2 or a in reserved or b in reserved:continue
     dx=b[0]-a[0];dy=b[1]-a[1]
     for sign in [-1,1]:
      u=(a[0]-dy*sign,a[1]+dx*sign);v=(b[0]-dy*sign,b[1]+dx*sign)
      if u not in used and v not in used and 0<=u[0]<w and 0<=u[1]<h and 0<=v[0]<w and 0<=v[1]<h:options.append((i,j,u,v))
   if not options:break
   # Prefer arms with fewer remaining opportunities.
   totals={i:sum(o[0]==i for o in options)for i in range(len(out))if needs[i]};few=min(totals,key=lambda i:totals[i]/needs[i]);opts=[o for o in options if o[0]==few]
   if not opts:break
   i,j,u,v=r.choice(opts);out[i][j+1:j+1]=[u,v];used.update([u,v]);needs[i]-=1
  if not any(needs):return out
 return None
def dense_module(count,main_length,seed):
 if count==2:return module(count,main_length,seed)
 for retry in range(300):
  w,h,arms=module(count,main_length,seed+retry*100003)
  expanded=inflate(w,h,arms,seed+retry)
  if expanded:return w,h,expanded
 raise RuntimeError(('Cannot compact maze',count,seed))
def build_page(counts,seed):
 modules=[]
 for i,count in enumerate(counts):
  connector=(2*counts[i+1]+2)if i+1<len(counts)else 0
  modules.append(dense_module(count,40-connector,seed+i*7919))
 height=max(h for _,h,_ in modules);width=sum(w for w,_,_ in modules)+len(modules)-1;edges=set();used=set();decisions=[];offset=0;all_arms=[]
 def add(path):
  used.update(path)
  for a,b in zip(path,path[1:]):edges.add(tuple(sorted((a,b))))
 for i,(w,h,arms)in enumerate(modules):
  dy=(height-h)//2;arms=[[(x+offset,y+dy)for x,y in arm]for arm in arms];all_arms.append(arms);offset+=w+1
 for i,arms in enumerate(all_arms):
  if i+1<len(all_arms):
   end=arms[0][-1];target=all_arms[i+1][0][0];assert end[1]==target[1]
   arms[0]+= [(x,end[1])for x in range(end[0]+1,target[0]+1)]
  for arm in arms:add(arm)
  root=arms[0][0];hall_cells={root,(root[0]-1,root[1]),(root[0]+1,root[1]),(root[0],root[1]-1)}
  decisions.append(dict(point=root,next=arms[0][-1],length=50 if counts[i]>=3 else 40,hall=True,hallCells=list(hall_cells),choices=[dict(end=a[-1],length=len(a)-1,correct=j==0)for j,a in enumerate(arms)]))
 # A single decision can be taller than wide; rotate those compact pages to landscape.
 rotate=width<height;flip=random.Random(seed+3).choice([0,1])
 def transform(p):
  x,y=p
  if flip:y=height-1-y
  return (height-1-y,x)if rotate else(x,y)
 cols,rows=(height,width)if rotate else(width,height)
 grid=[[1]*(cols*2+1)for _ in range(rows*2+1)]
 for p in used:
  x,y=transform(p);grid[y*2+1][x*2+1]=0
 for a,b in edges:
  x,y=transform(a);u,v=transform(b);grid[y+v+1][x+u+1]=0
 point=lambda p:dict(zip(['x','y'],transform(p)))
 for d in decisions:
  d['point']=point(d['point']);d['next']=point(d['next']);d['hallCells']=[point(p)for p in d['hallCells']]
  for c in d['choices']:c['end']=point(c['end'])
 togrid=lambda p:dict(x=p['x']*2+1,y=p['y']*2+1)
 return dict(grid=grid,start=togrid(decisions[0]['point']),finish=togrid(decisions[-1]['next']),seed=seed,decisions=decisions,metrics=dict(coverage=len(used)/(cols*rows),rooms=len(used),cols=cols,rows=rows,solution=sum(50 if c>=3 else 40 for c in counts)))
if __name__=='__main__':
 out=[]
 for level in range(5,101):
  choices=plan(level);pages=[build_page(choices[i:i+2],level*100003+i*9173+14)for i in range(0,len(choices),2)]
  out.append(dict(level=level,choices=choices,pages=pages));print(level,[(p['metrics']['cols'],p['metrics']['rows'],round(p['metrics']['coverage'],2))for p in pages],flush=True)
 Path('src/game/retro-catalog-v14.json').write_text(json.dumps(out,separators=(',',':')))
