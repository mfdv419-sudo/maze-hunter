import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const f={
 main:read('src/main.ts'),hud:read('src/adventure-hud.css'),pad:read('src/adventure-action-pad.css'),
 forestHud:read('src/ui/forest-hud.ts'),controller:read('src/ui/adventure-action-pad.ts'),touch:read('src/game/touch-controls.ts'),
 style:read('src/style.css'),presentation:read('src/presentation.css'),forest:read('src/forest-pilot.css')
};
const checks=[];const add=(n,o)=>checks.push([n,!!o]);
add('home remains out of scope',!f.main.includes('home-ui.css')&&!f.main.includes('ui-pages.css')&&!f.main.includes('retro-ui.css'));
add('final HUD mounts for every Adventure',f.main.includes("adventurePad=mountAdventureActionPad(playScreen,modern,lang==='en');forestHud=mountForestHud(playScreen,modern,lang==='en');")&&!f.main.includes('if(modern.adventure.pilot)forestHud'));
add('final HUD root contract',f.forestHud.includes("root.classList.add('adventure-final-hud')")&&f.forestHud.includes("root.classList.remove('adventure-final-hud')"));
add('no pilot-only non-null crash in HUD',!f.forestHud.includes('s.layout.pilot!'));
add('approved character condition HUD exists',f.forestHud.includes('forest-avatar-badge')&&f.forestHud.includes('forest-health-fill')&&f.forestHud.includes('forest-stamina-fill')&&f.forestHud.includes('forest-xp-fill'));
add('top progression counters exist',f.forestHud.includes('data-progress="coin"')&&f.forestHud.includes('data-progress="mfeer"')&&f.forestHud.includes('data-progress="sigil"'));
add('quest compact and collapsible',f.forestHud.includes('forest-mission-toggle')&&f.forestHud.includes('forest-mission-summary')&&f.hud.includes('.forest-mission.expanded'));
add('quest hides during NPC dialogue',f.forestHud.includes('mission.hidden=!!site?.npc'));
add('world anchored NPC dialogue',f.forestHud.includes('projectForestPoint')&&f.hud.includes('.forest-world-dialogue::after'));
add('pickup feedback exists without permanent quick belt',f.forestHud.includes('forest-pickup-feedback')&&!f.forestHud.includes('forest-item-belt'));
add('navigation map and utility rail owned by HUD',f.hud.includes('.minimap-panel')&&f.hud.includes('.forest-tools')&&f.forestHud.includes('game-fullscreen')&&f.forestHud.includes('forest-bag-button'));
add('legacy playbar hidden only in final Adventure HUD',f.hud.includes('.play-screen.adventure-final-hud .playbar'));
add('four action controls only',['forest-ability','forest-merge','#hit-action','#jump-action'].every(x=>f.controller.includes(x))&&!f.controller.includes('adventure-action-select'));
add('approved action-pad single owner',f.pad.includes('Sole owner')&&f.pad.includes('>#hit-action')&&f.pad.includes('.forest-ability')&&f.pad.includes('.forest-merge')&&f.pad.includes('>#jump-action'));
add('action-pad runtime never repositioned',!f.touch.includes('action-controls')&&!f.touch.includes('actions.style'));
add('Adventure joystick dynamic and elastic',f.touch.includes("const floating=adventure||prefs.joystick==='floating'")&&f.touch.includes('setCenter(origin.x+ux*shift'));
add('no forbidden important',![f.hud,f.pad,f.forest].some(x=>/!important\b/.test(x)));
const forbidden=['.joystick','.action-controls','.action-button','.minimap-panel','.forest-health','.forest-mission'];
add('legacy style owns no gameplay geometry',forbidden.every(x=>!f.style.includes(x)));
add('presentation owns no gameplay geometry',forbidden.every(x=>!f.presentation.includes(x)));
let failed=0;for(const [n,o] of checks){console.log(o?'PASS':'FAIL',n);if(!o)failed++;}
if(failed){console.error(`${failed}/${checks.length} checks failed`);process.exit(2);}console.log(`${checks.length}/${checks.length} PASS`);
