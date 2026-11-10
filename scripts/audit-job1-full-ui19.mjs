import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const hud=read('src/adventure-hud.css');
const pad=read('src/adventure-action-pad.css');
const panels=read('src/forest-pilot.css');
const controller=read('src/ui/adventure-action-pad.ts');
const forest=read('src/ui/forest-hud.ts');
const main=read('src/main.ts');
const checks=[
 ['no forbidden important', !/!important/.test(hud+pad+panels)],
 ['HUD final mounted globally', /mountForestHud/.test(main)&&!/modern\.adventure\.pilot\s*&&\s*mountForestHud/.test(main)],
 ['one action pad owner', /sole owner/i.test(pad)&&!/\.action-controls/.test(panels)],
 ['utility rail right of map', /right:max\(var\(--ui-edge\)/.test(hud)&&/grid-template-rows:repeat\(4,var\(--tool-size\)\)/.test(hud)],
 ['map offsets for rail', /right:calc\(max\(var\(--ui-edge\)/.test(hud)],
 ['quest compact hierarchy', /forest-mission-summary/.test(hud)&&/font-weight:500/.test(hud)],
 ['context note below quest', /forest-context-note/.test(hud)&&/left:max\(var\(--ui-edge\)/.test(hud)],
 ['dynamic joystick owned by HUD', /dynamic joystick/i.test(hud)&&/\.joystick\.active/.test(hud)],
 ['three support buttons plus jump', (pad.match(/>#hit-action|>\.forest-ability|>\.forest-merge|>#jump-action/g)||[]).length===4],
 ['ability icon not duplicate consumable', /forestIcon\('ability'\)/.test(controller)&&!/ability\.innerHTML=forestIcon\(selected\)/.test(controller)],
 ['settings modal styled', /\/\* Settings \*\//.test(panels)&&/forest-setting-row/.test(panels)],
 ['bag modal styled', /\/\* Bag \/ market \*\//.test(panels)&&/forest-bag-grid/.test(panels)],
 ['guide modal styled', /\/\* Guide \/ loadout \*\//.test(panels)&&/forest-tabs/.test(panels)],
 ['modal tool functions exist', /const settings=button/.test(forest)&&/const openBag=/.test(forest)&&/const guide=button/.test(forest)],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
if(fail){console.error(`${fail}/${checks.length} checks failed`);process.exit(2)}
console.log(`${checks.length}/${checks.length} checks passed`);
