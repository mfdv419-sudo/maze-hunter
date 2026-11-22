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
def module(count,main_length,seed,incoming=False,entry_global=3,exit_global=9,page_height=15,in_len=16):
 w=15 if count==3 else 4*count+1;h=(13 if count==3 else 15)if incoming else(11 if count==3 else 13);cx=2*count;cy=h//2;dy=(page_height-h)//2;root=(cx,cy);goal=(w-1,exit_global-dy);r=random.Random(seed)
 hall={(cx-1,cy),(cx,cy),(cx+1,cy),(cx,cy-1)}
 starts=[(cx-1,cy-1),(cx-1,cy+1),(cx+1,cy-1),(cx+1,cy+1),(cx,cy-2)]
 prefixes={q:[root,(q[0],cy),q]if q[0]!=cx else[root,(cx,cy-1),q]for q in starts}
 allowed={(x,y)for y in range(h)for x in range(w)}
 for attempt in range(20000):
  entrance=[]
  if incoming:
   entrance=paths.path_search((0,entry_global-dy),in_len-1,allowed,hall|set(starts),r,(cx,cy+1),budget=2000)
   if not entrance:continue
   entrance=entrance+[root]
   if sum((b[0]-a[0],b[1]-a[1])!=(c[0]-b[0],c[1]-b[1])for a,b,c in zip(entrance,entrance[1:],entrance[2:]))<5:continue
  active=r.sample(starts,count)
  if len(set('L'if q[0]<cx else'R'if q[0]>cx else'U'for q in active))<2:continue
  correct=r.choice(active);active.remove(correct);r.shuffle(active);active=[correct]+active;reserved=hall|set(starts)|set(entrance);used=set(reserved);arms=[]
  for i,q in enumerate(active):
   used.discard(q);path=paths.path_search(q,(main_length if i==0 else 36)-2,allowed,used,r,goal if i==0 else None,budget=2000)
   if not path:break
   arms.append(prefixes[q][:-1]+path);used.update(path)
  if len(arms)==count:return w,h,arms,entrance,reserved
 raise RuntimeError(('Cannot build decision',count,seed))
def inflate(w,h,arms,seed,reserved):
 r=random.Random(seed);base=[[p for p in a]for a in arms]
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
def build_page(counts,seed):
 height=15 if len(counts)>1 else(11 if counts[0]==3 else 13);r=random.Random(seed);link_row=r.choice([3,5,9,11])if height==15 else r.choice([2,4,8]);exit_row=r.choice([3,5,9,11])if height==15 else r.choice([2,4,8]);modules=[];in_len=20 if len(counts)>1 and counts[1]==5 and link_row<7 else 16
 for i,count in enumerate(counts):
  for retry in range(1000):
   try:w,h,arms,entrance,reserved=module(count,40-(in_len+2) if i+1<len(counts)else 40,seed+i*7919+retry*100003,i>0,link_row,link_row if i+1<len(counts)else exit_row,height,in_len)
   except RuntimeError:continue
   expanded=inflate(w,h,arms,seed+retry,reserved)
   if expanded:modules.append((w,h,expanded,entrance));break
  else:raise RuntimeError(('Cannot fill',seed,i))
 width=sum(w for w,_,_,_ in modules)+len(modules)-1;edges=set();used=set();decisions=[];offset=0;all_arms=[];entrances=[]
 def add(path):
  used.update(path)
  for a,b in zip(path,path[1:]):edges.add(tuple(sorted((a,b))))
 for w,h,arms,entrance in modules:
  dy=(height-h)//2;all_arms.append([[(x+offset,y+dy)for x,y in arm]for arm in arms]);entrances.append([(x+offset,y+dy)for x,y in entrance]);offset+=w+1
 for i,arms in enumerate(all_arms):
  if i+1<len(all_arms):
   end=arms[0][-1];entry=entrances[i+1];arms[0]+=[(end[0]+1,end[1])]+entry
  for arm in arms:add(arm)
  root=arms[0][0];hall={root,(root[0]-1,root[1]),(root[0]+1,root[1]),(root[0],root[1]-1)}
  decisions.append(dict(point=root,next=arms[0][-1],length=50,hall=True,hallCells=list(hall),choices=[dict(end=a[-1],length=len(a)-1,correct=j==0)for j,a in enumerate(arms)]))
 flipx=r.choice([0,1]);flipy=r.choice([0,1])
 def transform(p):
  x,y=p;return(width-1-x if flipx else x,height-1-y if flipy else y)
 grid=[[1]*(width*2+1)for _ in range(height*2+1)]
 for p in used:
  x,y=transform(p);grid[y*2+1][x*2+1]=0
 for a,b in edges:
  x,y=transform(a);u,v=transform(b);grid[y+v+1][x+u+1]=0
 point=lambda p:dict(zip(['x','y'],transform(p)))
 for d in decisions:
  d['point']=point(d['point']);d['next']=point(d['next']);d['hallCells']=[point(p)for p in d['hallCells']]
  for c in d['choices']:c['end']=point(c['end'])
 togrid=lambda p:dict(x=p['x']*2+1,y=p['y']*2+1)
 return dict(grid=grid,start=togrid(decisions[0]['point']),finish=togrid(decisions[-1]['next']),seed=seed,decisions=decisions,metrics=dict(coverage=len(used)/(width*height),cols=width,rows=height))
if __name__=='__main__':
 partial=Path('src/game/retro-catalog-v15.partial');out=json.loads(partial.read_text())if partial.exists()else json.loads(Path('src/game/retro-catalog-v11.json').read_text())[:36]
 for level in range(5+len(out),101):
  choices=plan(level);pages=[build_page(choices[i:i+2],level*100003+i*9173+14)for i in range(0,len(choices),2)]
  out.append(dict(level=level,choices=choices,pages=pages));partial.write_text(json.dumps(out,separators=(',',':')));print(level,[(p['metrics']['cols'],p['metrics']['rows'],round(p['metrics']['coverage'],2))for p in pages],flush=True)
 Path('src/game/retro-catalog-v15.json').write_text(json.dumps(out,separators=(',',':')))
 partial.unlink(missing_ok=True)
