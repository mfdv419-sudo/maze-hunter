import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const hud=read('src/adventure-hud.css');
const pad=read('src/adventure-action-pad.css');
const modern=read('src/game/modern.ts');
const main=read('src/main.ts');
const checks=[
  ['no forbidden important',!/(?:hud|action)[\s\S]*!important/.test(hud+pad)],
  ['responsive HUD variables',/--hud-edge:clamp\(/.test(hud)&&/--hud-map:clamp\(/.test(hud)&&/--hud-tool:clamp\(/.test(hud)],
  ['status panel scales continuously',/width:clamp\(232px,35vmin,372px\)/.test(hud)],
  ['map and utility share responsive geometry',/right:calc\(max\(var\(--hud-edge\)/.test(hud)&&/align-items:center;gap:var\(--hud-gap\)/.test(hud)],
  ['joystick scales with viewport',/width:clamp\(96px,15vmin,142px\)/.test(hud)],
  ['action pad has one responsive owner',/--pad-small:clamp\(/.test(pad)&&/--pad-jump:clamp\(/.test(pad)&&/--pad-radius:clamp\(/.test(pad)],
  ['action pad uses viewport-safe edge',/right:max\(var\(--pad-edge\),env\(safe-area-inset-right\)\)/.test(pad)&&/bottom:max\(var\(--pad-edge\),env\(safe-area-inset-bottom\)\)/.test(pad)],
  ['action pad arc scales continuously',/--pad-r72:clamp\(/.test(pad)&&/--pad-r98:clamp\(/.test(pad)&&/--pad-r116:clamp\(/.test(pad)],
  ['camera distance is viewport driven',/responsiveCameraDistance/.test(modern)&&/const compact=T\.MathUtils\.clamp\(\(short-360\)\/540,0,1\)/.test(modern)],
  ['camera FOV is viewport driven',/responsiveCameraFov/.test(modern)&&/this\.camera\.fov=this\.responsiveCameraFov/.test(modern)],
  ['camera responds on ResizeObserver',/new ResizeObserver\(\(\) => this\.resize\(\)\)/.test(modern)],
  ['gameplay distance uses responsive camera',/const distance=this\.previewMode\?12:\(underwater\?Math\.max\(5\.2,this\.responsiveCameraDistance-\.35\):this\.responsiveCameraDistance\)/.test(modern)],
  ['home remains out of scope',!main.includes("./home-ui.css")],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
if(fail){console.error(`${fail}/${checks.length} checks failed`);process.exit(2)}
console.log(`${checks.length}/${checks.length} responsive UI checks passed`);
