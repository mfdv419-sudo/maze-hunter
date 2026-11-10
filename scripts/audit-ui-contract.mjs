import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=['src/style.css','src/presentation.css','src/home-ui.css','src/ui-pages.css','src/retro-ui.css','src/adventure-hud.css','src/adventure-action-pad.css','src/forest-pilot.css'];
let failed=false;
const pass=(name,ok,detail='')=>{console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' · '+detail:''}`);if(!ok)failed=true;};
const text=Object.fromEntries(css.map(f=>[f,read(f)]));
pass('no CSS !important anywhere',css.every(f=>!text[f].includes('!important')));
const owners={
 home:['.title-screen','.mode-selector','.mode-tile','.title-tools','.home-collection'],
 hud:['.minimap-panel','.joystick','.forest-health','.forest-tools','.forest-mission','.forest-world-dialogue'],
 pad:['.action-controls','#jump-action','#hit-action','.forest-ability','.forest-merge'],
 pages:['.collection-page','.wardrobe-page','.scores-page','.adventure-select','.field-guide'],
 retro:['.hud-stats','.zoom-controls']
};
const ownerFile={home:'src/home-ui.css',hud:'src/adventure-hud.css',pad:'src/adventure-action-pad.css',pages:'src/ui-pages.css',retro:'src/retro-ui.css'};
for(const [group,selectors] of Object.entries(owners)){
 const owner=ownerFile[group];
 pass(`${group} owner contains required selectors`,selectors.every(s=>text[owner].includes(s)));
 for(const s of selectors){const offenders=css.filter(f=>f!==owner&&text[f].includes(s));pass(`${s} has one CSS owner`,offenders.length===0,offenders.join(','));}
}
const forest=text['src/forest-pilot.css'];
pass('forest CSS never repositions global HUD',!['.minimap-panel','.joystick','.action-controls','#jump-action','#hit-action','.forest-health','.forest-tools'].some(s=>forest.includes(s)));
const main=read('src/main.ts');
pass('Adventure action pad imported',main.includes("mountAdventureActionPad"));
pass('Adventure action pad mounted',main.includes("adventurePad=mountAdventureActionPad"));
pass('Adventure action pad updated',main.includes("adventurePad?.update(state)"));
pass('Action pad disposed',main.includes("adventurePad?.dispose()"));
pass('no duplicate modern mode click binding',(main.match(/click\("modern-mode"/g)||[]).length===1);
const padTs=read('src/ui/adventure-action-pad.ts');
pass('no floating ability selector is created',!padTs.includes("adventure-action-select"));
pass('four-button controller exists',padTs.includes("forest-ability")&&padTs.includes("forest-merge")&&padTs.includes("#hit-action")&&padTs.includes("#jump-action"));
const hudTs=read('src/ui/forest-hud.ts');
pass('Forest tools reuse existing fullscreen/pause',hudTs.includes("'#game-fullscreen','#pause-game'"));
pass('Forest HUD never positions action buttons',!['forest-merge.style','forest-ability.style','hit.style','jump.style'].some(x=>hudTs.includes(x)));
const imports=['./style.css','./presentation.css','./home-ui.css','./ui-pages.css','./retro-ui.css','./adventure-hud.css','./adventure-action-pad.css','./forest-pilot.css'].map(x=>main.indexOf(x));
pass('CSS ownership import order stable',imports.every((v,i)=>v>=0&&(i===0||v>imports[i-1])));
if(failed)process.exit(2);
