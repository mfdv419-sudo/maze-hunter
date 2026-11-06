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
 ['build id',ext.includes("FG-EXTREME-MAZE-11-20261106")],
 ['braided entry maze',ext.includes('braidedConnector')&&ext.includes("ext-entry-waterfall")&&ext.includes("ext-entry-green")],
 ['physical cross-links',ext.includes('-cross-${i}')],
 ['rewarding dead ends',ext.includes('-dead-${i}')],
 ['NPC dry reachable enforcement',ext.includes('No dry reachable NPC site')&&ext.includes('pilotWaterDepth(q.x,q.y)>.12')],
 ['solid world uses runtime collision',rpg.includes('no longer mutate the maze graph')&&state.includes('site.solid.w*.41')],
 ['guards respect solid sites',state.includes('this.layout.ring?.content||[]')&&state.includes('s.solid.w*.41+radius')],
 ['player NPC collision active',state.includes('r=.62+')&&state.includes('forestNpcWorldPoint(site)')],
 ['visible world pickups',world.includes('site-pickup-')&&state.includes("this.notify('pickup')")],
 ['claimed pickups disappear',world.includes('worldClaims.has(o.name.slice(12))')],
 ['no quick belt HUD',!hud.includes('forest-item-belt')&&!pilotCss.includes('forest-item-belt')],
 ['no floating ability selector',css.includes('.adventure-action-select')&&css.includes('.forest-item-belt{display:none!important}')],
 ['authoritative four-button action pad',css.includes('one authoritative four-button action pad')&&css.includes('#jump-action')&&css.includes('#hit-action')&&css.includes('.forest-ability')&&css.includes('.forest-merge')],
 ['action pad separated on small screens',css.includes('max-height:560px')&&css.includes('--mh-pad-jump:72px')],
 ['expanded map crops explored',modern.includes('exploredInLayer')&&modern.includes('Math.max(25')],
 ['undiscovered portals hidden',modern.includes('this.explored.has(`${p.point.x},${p.point.y}`)')],
 ['broad soil paths',world.includes("p.kind==='trail'?4.4:3.2")],
 ['soil arena clearings',world.includes('arena-soil-clearing')],
 ['earth cliff natural brown',world.includes('color:0xa06f45')&&world.includes('authoritative-earth-cliff-boundary')],
 ['forest floor soil-first',world.includes('Forest floor is soil-first')],
 ['hand paw axis corrected',gear.includes('Paw follows the forearm axis downward')],
 ['foot pad underside corrected',gear.includes("foot-center-pad")&&gear.includes('-.074,.070')],
 ['merchant inventory offers remain',hud.includes('forestMarketOffers')&&rpg.includes('forestMarketOffers')],
 ['merchant action explicit',hud.includes("merchant?'🛒'")&&hud.includes('Buka toko / jual-beli')],
 ['quest not permanent during dialogue',hud.includes('npcTalk')&&hud.includes('quest')],
 ['clue wording not GPS',!rpg.includes('sisi timur mengarah ke Cross Tunnel')]
];
let failed=0;
for(const [name,ok] of checks){console.log(ok?'PASS':'FAIL',name);if(!ok)failed++;}
if(failed){console.error(`${failed}/${checks.length} checks failed`);process.exit(2);}
console.log(`${checks.length}/${checks.length} PASS`);
