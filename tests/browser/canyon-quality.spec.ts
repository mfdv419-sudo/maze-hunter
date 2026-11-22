import {test,expect} from '@playwright/test';
const qa='test-results/screenshots/';
test('Ngarai renders continuous cliffs, river, bridge, cave, terraces and its original enemies',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{const{ModernGame}=await import('/src/game/modern.ts' as string);const host=document.createElement('div');host.id='canyon-qa';host.style.cssText='position:fixed;inset:0;z-index:50';document.body.append(host);const g=new ModernGame(host,{area:'gorge',difficulty:'medium',seed:15025,adventureMap:0,entrance:0,outfit:'explorer',onTick:()=>{},onFinish:()=>{}});g.setPaused(true);(window as any).canyon=g;});
 await expect(page.locator('#canyon-qa')).toHaveAttribute('data-visual-identity','layered-canyon');
 expect(await page.evaluate(()=>{const g=(window as any).canyon;return['stratified-canyon-cliffs','canyon-contoured-ground','gorge-shallow-river','gorge-walkable-bridge','gorge-cave-roof','canyon-wispy-sky'].every(n=>!!g.scene.getObjectByName(n));})).toBe(true);
 expect(await page.evaluate(()=>(window as any).canyon.guardModels.map((g:any)=>g.name))).toContain('ketam-tebing');
 expect(await page.evaluate(()=>(window as any).canyon.guardModels.map((g:any)=>g.name))).toContain('raja-batu-retak');
 for(const spot of ['entry','river','terrace','boss']){
  await page.evaluate(spot=>{const g=(window as any).canyon,a=g.adventure,c=a.layout.forest.cave,h=a.layout.forest.highland,f=a.layout.fortress;const p=spot==='entry'?a.layout.maze.start:spot==='river'?c:spot==='terrace'?h:f;g.position=a.position={x:p.x+.5,y:p.y+(spot==='river'?2.5:spot==='boss'?5.5:.5)};g.cameraPitch=g.desiredPitch=spot==='terrace'?.28:.12;g.cameraYaw=g.desiredCameraYaw=spot==='river'?Math.PI:spot==='boss'?Math.PI:spot==='entry'?g.cameraYaw:0;g.acc=0;g.updateVision();},spot);
  await page.waitForTimeout(700);await page.screenshot({path:qa+`canyon-${spot}.png`});
  expect(await page.evaluate(()=>{const g=(window as any).canyon;return !g.cameraBlocked(g.camera.position);})).toBe(true);
 }
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(400);await page.screenshot({path:qa+'canyon-boss-phone.png'});expect(errors).toEqual([]);await page.evaluate(()=>(window as any).canyon.dispose());
});
test('stone boss has visible attack warnings, moves and remains visible in its arena',async({page})=>{
 test.setTimeout(65000);await page.goto('/');await page.evaluate(async()=>{const{ModernGame}=await import('/src/game/modern.ts' as string);const host=document.createElement('div');host.id='canyon-qa';host.style.cssText='position:fixed;inset:0;z-index:50';document.body.append(host);const g=new ModernGame(host,{area:'gorge',difficulty:'hard',seed:52,adventureMap:0,entrance:0,outfit:'explorer',onTick:()=>{},onFinish:()=>{}}),a=g.adventure!;a.guards.filter((q:any)=>!q.boss).forEach((q:any)=>q.dead=true);a.layout.seals.forEach((_:any,i:number)=>a.seals.add(i));const k=a.guards.find((q:any)=>q.boss)!;g.position=a.position={x:k.position.x+3,y:k.position.y};a.invulnerableUntil=10000;a.elapsed=10;a.nextBossSkill=0;g.cameraYaw=g.desiredCameraYaw=-Math.PI/2;g.cameraPitch=g.desiredPitch=.12;(window as any).canyon=g;(window as any).kingOrigin={...k.position};});
 await expect.poll(()=>page.evaluate(()=>(window as any).canyon.adventure.hazards.some((h:any)=>h.kind==='rockfall'))).toBe(true);await page.screenshot({path:qa+'canyon-rockfall-warning.png'});
 await expect.poll(()=>page.evaluate(()=>{const g=(window as any).canyon,k=g.adventure.guards.find((q:any)=>q.boss),o=(window as any).kingOrigin;return Math.hypot(k.position.x-o.x,k.position.y-o.y);})).toBeGreaterThan(.2);
 expect(await page.evaluate(()=>(window as any).canyon.guardModels.at(-1).visible)).toBe(true);await page.evaluate(()=>(window as any).canyon.dispose());
});
test('Retro phone cells and icons enlarge proportionally and tracing works at automatic zoom',async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.evaluate(async()=>{const{RetroGame}=await import('/src/game/retro.ts' as string);const host=document.createElement('div');host.id='retro-qa';host.style.cssText='position:fixed;inset:0;z-index:50';document.body.append(host);(window as any).retroQA=new RetroGame(host,{level:91,onTick:()=>{},onFinish:()=>{}});});
 const canvas=page.locator('#retro-qa canvas');await expect.poll(async()=>Number(await canvas.getAttribute('data-effective-cell'))).toBeGreaterThanOrEqual(27.99);
 expect(Number(await canvas.getAttribute('data-cell-width'))).toBeCloseTo(Number(await canvas.getAttribute('data-cell-height')),8);
 await page.screenshot({path:qa+'retro-readable-phone.png'});
 const points=await page.evaluate(async()=>{const{boardRoute,retroToScreen}=await import('/src/game/retro-board.ts' as string),g=(window as any).retroQA,cam=g.scene.cameras.main,ps=boardRoute(g.state.board).slice(0,3);return ps.map((p:any)=>{const w=retroToScreen({x:p.x+.5,y:p.y+.5},g.layout);return{x:(w.x-cam.worldView.x)*cam.zoom,y:(w.y-cam.worldView.y)*cam.zoom};});});
 await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y,{steps:8});await page.mouse.up();expect(await page.evaluate(()=>(window as any).retroQA.state.path.length)).toBeGreaterThan(1);expect(await page.evaluate(()=>(window as any).retroQA.state.lives)).toBe(3);
 await page.evaluate(()=>(window as any).retroQA.overview());await expect(canvas).toHaveAttribute('data-zoom','1');await page.screenshot({path:qa+'retro-phone-overview.png'});await page.evaluate(()=>(window as any).retroQA.dispose());
});

test('Ngarai launches through the real menu with its guide, boss identity and usable phone HUD',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:844,height:390});await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await page.locator('#area-gorge').click();await expect(page.locator('.poster-chip')).toContainText(/Ngarai|Gorge/);await page.screenshot({path:qa+'canyon-picker-phone.png'});await page.locator('#explore-area').click();await expect(page.locator('#game-stage')).toHaveAttribute('data-visual-identity','layered-canyon');await expect(page.locator('#maze-transition')).toHaveCount(0);await page.locator('#quest-log').click();await expect(page.locator('.expedition-journal')).toContainText(/Ketam Tebing|Rock Crab/);await page.locator('#journal-close').click();for(const id of ['hit-action','jump-action','camera-angle','quest-log'])await expect(page.locator('#'+id)).toBeInViewport();await page.screenshot({path:qa+'canyon-live-phone.png'});expect(errors).toEqual([]);
});
