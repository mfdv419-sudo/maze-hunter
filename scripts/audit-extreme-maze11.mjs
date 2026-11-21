import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ext=read('src/game/forest-extreme-world.ts');
const rpg=read('src/game/forest-rpg.ts');
const state=read('src/game/adventure-state.ts');
const world=read('src/game/forest-master-world.ts');
const modern=read('src/game/modern.ts');
const hud=read('src/ui/forest-hud.ts');
const pilotCss=read('src/forest-pilot.css');
const adventureHud=read('src/adventure-hud.css');
const gear=read('src/game/gear-model.ts');
// The Organic Binturong rebuild no longer uses the old box-model comment or
// fixed foot-pad coordinates. Audit the current geometry/orientation instead.
const numeric='(-?(?:\\d+(?:\\.\\d+)?|\\.\\d+))';
const geometryArgs=(name,material)=>{
 const literal=name.includes('${')?`\`${name}\``:`'${name}'`;
 const quoted=literal.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp(`organicOrb\\(root,${material},${quoted},\\s*([^;\\n]+)\\)`);
 const call=gear.match(pattern)?.[1];
 if(!call)return null;
 // Mesh arguments may contain symbolic x coordinates (e.g. dx for toe pads).
 return call.split(',').map(v=>v.trim());
};
const asNumber=value=>value===undefined||!new RegExp(`^${numeric}$`).test(value)?NaN:Number(value);
const palm=geometryArgs('paw-center-pad','pad');
const handAxisCorrect=/root\.rotation\.y\s*=\s*side\s*\*\s*Math\.PI\s*\/\s*2\s*;/.test(gear)
 &&gear.includes("joint(parent,0,-.122,.009,'paw-hand')")
 &&palm!==null&&Number.isFinite(asNumber(palm[1]))&&asNumber(palm[3])>0;
const foot=geometryArgs('continuous-foot-paw','surface');
const centerPad=geometryArgs('foot-center-pad','pad');
const toe=geometryArgs('foot-paw-digit-${i+1}','surface');
const toePad=geometryArgs('foot-toe-pad','pad');
const footPadCorrect=(()=>{
 if(!foot||!centerPad||!toe||!toePad)return false;
 const fy=asNumber(foot[1]),fr=asNumber(foot[4]);
 const py=asNumber(centerPad[1]),pr=asNumber(centerPad[4]);
 const ty=asNumber(toe[1]),tr=asNumber(toe[4]);
 const tpy=asNumber(toePad[1]),tpr=asNumber(toePad[4]);
 if(![fy,fr,py,pr,ty,tr,tpy,tpr].every(Number.isFinite))return false;
 // Pad must lie on the *underside* of the foot, not on the front/top.
 const footBottom=fy-fr,padBottom=py-pr,toeBottom=ty-tr;
 return py<fy&&Math.abs(padBottom-footBottom)<.045
  &&tpy<ty&&tpy+tpr<=toeBottom+.025;
})();
// UI geometry is audited by scripts/audit-job1-gameplay-ui15.mjs.
// This MAZE11 audit intentionally owns world/gameplay checks only.
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
 ['expanded map crops explored',modern.includes('exploredInLayer')&&modern.includes('Math.max(25')],
 ['undiscovered portals hidden',modern.includes('this.explored.has(`${p.point.x},${p.point.y}`)')],
 ['broad soil paths',world.includes("p.kind==='trail'?4.4:3.2")],
 ['soil arena clearings',world.includes('arena-soil-clearing')],
 ['earth cliff natural brown',world.includes('color:0xa06f45')&&world.includes('authoritative-earth-cliff-boundary')],
 ['forest floor soil-first',world.includes('Forest floor is soil-first')],
 ['hand paw axis corrected',handAxisCorrect],
 ['foot pad underside corrected',footPadCorrect],
 ['merchant inventory offers remain',hud.includes('forestMarketOffers')&&rpg.includes('forestMarketOffers')],
 ['quest not permanent during dialogue',hud.includes('npcTalk')&&hud.includes('quest')],
 ['clue wording not GPS',!rpg.includes('sisi timur mengarah ke Cross Tunnel')]
];
let failed=0;
for(const [name,ok] of checks){console.log(ok?'PASS':'FAIL',name);if(!ok)failed++;}
if(failed){console.error(`${failed}/${checks.length} checks failed`);process.exit(2);}
console.log(`${checks.length}/${checks.length} PASS`);
