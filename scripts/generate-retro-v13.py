"""Build five-exit decision halls on a four-neighbour grid; wrong routes measure 90% from the hall centre. Runtime uses only the catalog."""
import json, random, importlib.util, math
from pathlib import Path
spec=importlib.util.spec_from_file_location('v11',Path(__file__).with_name('generate-retro-v11.py'));v11=importlib.util.module_from_spec(spec);spec.loader.exec_module(v11)
PLANS=[[4,3,4],[5,4,4],[5,4,4,3],[5,5,4,4],[5,5,5,4,4],[5,5,5,5,5]]
def page(counts,seed):
 r=random.Random(seed);width=51;h=23;used=set();edges=set();decisions=[]
 def add(path):
  used.update(path)
  for a,b in zip(path,path[1:]):edges.add(tuple(sorted((a,b))))
 def line(a,b):
  out=[a];x,y=a
  while (x,y)!=b:
   if x!=b[0]:x+=1 if x<b[0] else -1
   else:y+=1 if y<b[1] else -1
   out.append((x,y))
  return out
 for stage,count in enumerate(counts):
  dy=(len(counts)-1-stage)*(h+1);root=(25,dy+22);goal=(25,dy-2);ports=[5+i*10 for i in range(5)]
  # Symmetric five-door hall; inactive doors remain closed. No door marks its solution.
  active=sorted(r.sample(ports,count));correct=r.choice(active);paths=[]
  for x in active:
   prefix=line(root,(x,dy+22))+[(x,dy+21)]
   suffix=line((x,dy+1),(x,dy))+line((x,dy),(25,dy))[1:]+line((25,dy),goal)[1:] if x==correct else []
   needed=(80 if x==correct else 72)-(len(prefix)-1)-(len(suffix)-1 if suffix else 0)
   allowed={(a,b+dy)for a in range(x-4,x+5)for b in range(1 if x==correct else 2,22)}
   for attempt in range(500):
    path=v11.path_search(prefix[-1],needed,allowed,set(prefix[:-1]),r,(x,dy+1)if x==correct else None,budget=10000)
    if path:break
   else:raise RuntimeError((seed,stage,x,needed))
   whole=prefix[:-1]+path+(suffix[1:]if suffix else []);add(whole);paths.append((x==correct,whole))
  point=lambda p:dict(x=p[0]+1,y=p[1]+3)
  decisions.append(dict(point=point(root),next=point(goal),length=80,hall=True,hallCells=[point((x,dy+22))for x in range(min(active),max(active)+1)],choices=[dict(end=point(path[-1]),length=len(path)-1,correct=ok)for ok,path in paths]))
 # Rotation and reflection hide repeated vertical layout. Explicit edges never create accidental shortcuts.
 size=53;turn=r.randrange(4);mirror=r.choice([0,1])
 def transform(p):
  x,y=p
  if mirror:x=size-1-x
  for _ in range(turn):x,y=size-1-y,x
  return x,y
 grid=[[1]*(size*2+1)for _ in range(size*2+1)]
 for x,y in used:
  a,b=transform((x+1,y+3));grid[b*2+1][a*2+1]=0
 for a,b in edges:
  x,y=transform((a[0]+1,a[1]+3));u,v=transform((b[0]+1,b[1]+3));grid[y+v+1][x+u+1]=0
 for d in decisions:
  for name in ['point','next']:d[name]=dict(zip(['x','y'],transform((d[name]['x'],d[name]['y']))))
  d['hallCells']=[dict(zip(['x','y'],transform((q['x'],q['y']))))for q in d['hallCells']]
  for c in d['choices']:c['end']=dict(zip(['x','y'],transform((c['end']['x'],c['end']['y']))))
 togrid=lambda p:dict(x=p['x']*2+1,y=p['y']*2+1)
 return dict(grid=grid,start=togrid(decisions[0]['point']),finish=togrid(decisions[-1]['next']),seed=seed,decisions=decisions,metrics=dict(solution=len(counts)*80,decisions=len(counts)))
if __name__=='__main__':
 old=json.loads(Path('src/game/retro-catalog-v11.json').read_text());out=old[:36]
 for level in range(41,101):
  choices=PLANS[(level-41)//10];pages=[page(choices[i:i+2],level*100003+i*7919)for i in range(0,len(choices),2)];out.append(dict(level=level,choices=choices,pages=pages));print(level,flush=True)
 Path('src/game/retro-catalog-v13.json').write_text(json.dumps(out,separators=(',',':')))
