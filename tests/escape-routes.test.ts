import {it,expect} from 'vitest';
import {adventureLayout} from '../src/game/adventure-layout';
import {route} from '../src/game/maze';
it('all thirty maps offer an actual faster route and a key-gated hidden route',()=>{
 for(const d of ['medium','hard','extreme'] as const)for(let i=0;i<10;i++){
  const a=adventureLayout(d,i,52);expect(a.escapeRoutes[1].length,`${d}/${i}: fast`).toBeLessThan(a.escapeRoutes[0].length);expect(a.secret,`${d}/${i}: secret`).toBeDefined();
  const g=a.maze.grid.map(r=>[...r]);a.grass.forEach(p=>g[p.y][p.x]=0);a.escapeConnector.forEach(p=>g[p.y][p.x]=0);g[a.fastRiver.y][a.fastRiver.x]=1;const hidden=route(g,a.fortress,a.maze.finish);expect(hidden.length,`${d}/${i}: hidden`).toBeLessThan(a.escapeRoutes[0].length);
 }
},30000);
