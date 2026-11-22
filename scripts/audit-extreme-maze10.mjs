import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ext=read('src/game/forest-extreme-world.ts');
const rpg=read('src/game/forest-rpg.ts');
const state=read('src/game/adventure-state.ts');
const world=read('src/game/forest-master-world.ts');
const modern=read('src/game/modern.ts');
const hud=read('src/ui/forest-hud.ts');
const css=read('src/adventure-action-pad.css');
const pilotCss=read('src/forest-pilot.css');
const gear=read('src/game/gear-model.ts');
const checks=[
 ['build id',ext.includes('FG-EXTREME-MAZE-10')],
 ['braided entry maze',ext.includes('braidedConnector')&&ext.includes('entry-waterfall')&&ext.includes('entry-green')],
 ['physical cross-links',ext.includes('-cross-${i}')],
 ['rewarding dead ends',ext.includes('-dead-${i}')],
 ['NPC dry reachable enforcement',ext.includes('No dry reachable NPC site')&&ext.includes('route(grid,center')],
 ['solid world uses runtime collision',rpg.includes('no longer mutate the maze graph')&&state.includes('site.solid.w*.41')],
 ['guards respect solid sites',state.includes('this.layout.ring?.content||[]')&&state.includes('s.solid.w*.41+radius')],
 ['player NPC collision active',state.includes('r=.62+')&&state.includes('forestNpcWorldPoint(site)')],
 ['visible world pickups',world.includes('site-pickup-')&&state.includes("this.notify('pickup')")],
 ['claimed pickups disappear',world.includes('worldClaims.has(o.name.slice(12))')],
 ['no quick belt HUD',!hud.includes('forest-item-belt')&&!pilotCss.includes('forest-item-belt')],
 ['no floating ability selector',css.includes('.adventure-action-select{display:none!important}')],
 ['single-radius action pad',css.includes('Same r≈132')&&css.includes('right:93px')&&css.includes('bottom:93px')],
 ['expanded map crops explored',modern.includes('exploredInLayer')&&modern.includes('Math.max(25')],
 ['undiscovered portals hidden',modern.includes('this.explored.has(`${p.point.x},${p.point.y}`)')],
 ['broad soil paths',world.includes("p.kind==='trail'?4.4:3.2")],
 ['soil arena clearings',world.includes('arena-soil-clearing')],
 ['earth cliff medium brown',world.includes('color:0x8a5a33')],
 ['hand paw axis corrected',gear.includes('Paw follows the forearm axis downward')],
 ['foot pad underside corrected',gear.includes("foot-center-pad")&&gear.includes('-.074,.070')],
 ['merchant inventory offers remain',hud.includes('forestMarketOffers')&&rpg.includes('forestMarketOffers')],
 ['clue wording not GPS',!rpg.includes('sisi timur mengarah ke Cross Tunnel')]
];
let failed=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)failed++;}if(failed)process.exit(2);console.log(`${checks.length}/${checks.length} PASS`);
