import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const hud=read('src/adventure-hud.css');
const pad=read('src/adventure-action-pad.css');
const forest=read('src/ui/forest-hud.ts');
const action=read('src/ui/adventure-action-pad.ts');
const main=read('src/main.ts');
const checks=[
 ['Adventure toast suppressed when final HUD mounted',main.includes("if(!forestHud&&state.message!=='chest'")],
 ['context note exists below quest',forest.includes("className='forest-context-note'")&&hud.includes('.forest-context-note')],
 ['context note includes ammo guidance',forest.includes("ammo:['Kue habis. Cari peti atau kembali ke checkpoint.'")],
 ['forest HUD no longer owns ability icon geometry',!forest.includes("const merge=root.querySelector<HTMLButtonElement>('.forest-merge')")&&!forest.includes("jump.setAttribute('aria-label'")],
 ['action pad has sole controller',action.includes('mountAdventureActionPad')&&action.includes("ability.classList.add('forest-ability')")&&action.includes("merge.classList.add('forest-merge')")],
 ['utility rail matches minimap height',hud.includes('height:var(--hud-map);')&&hud.includes('justify-content:space-between')],
 ['utility buttons are centered',hud.includes('display:grid;place-items:center;width:var(--hud-tool);height:var(--hud-tool)')],
 ['lighter typography',hud.includes('font-weight:650')&&hud.includes('font-weight:450')],
 ['approved arc action position',pad.includes('--pad-action-x:')&&pad.includes('--pad-ability-x:')&&pad.includes('--pad-merge-x:')],
 ['jump remains the large anchor',pad.includes('>#jump-action')&&pad.includes('width:var(--pad-jump);height:var(--pad-jump)')],
 ['no important in owned UI CSS',!hud.includes('!important')&&!pad.includes('!important')],
 ['map remains proportional',hud.includes('--hud-map:clamp(104px,16.5vmin,174px)')],
 ['pickup feedback not centered',hud.includes('.forest-pickup-feedback')&&hud.includes('transform:none')],
];
let fail=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok)fail++;}
if(fail){console.error(`${fail}/${checks.length} checks failed`);process.exit(2)}
console.log(`${checks.length}/${checks.length} checks passed`);
