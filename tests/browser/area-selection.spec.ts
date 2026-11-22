import {test,expect} from '@playwright/test';
const qa='test-results/screenshots/';
test('Adventure picker keeps its eight worlds, difficulty, guide and illustrated actions usable across viewports',async({page})=>{
 test.setTimeout(65000);
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 await page.locator('#lab').click();
 await page.locator('#modern-mode').click();
 await expect(page.locator('#maze-transition')).toHaveCount(0);
 await expect(page.locator('.area-option')).toHaveCount(8);
 const panorama=page.locator('#adventure-preview');
 await expect(panorama).toHaveAttribute('src','/adventure/forest-panorama.webp');
 await expect.poll(()=>panorama.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
 await expect(page.locator('#area-forest')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#area-forest .area-mark svg')).toBeVisible();
 await page.screenshot({path:qa+'area-selection-adventure-picker.png'});
 await page.locator('#setup-guide').click();
 await expect(page.locator('.adventure-help')).toContainText('Joystick');
 await page.locator('#setup-guide-close').click();
 for(const id of ['explore-area','online-menu','practice-area','forest-world-open']) {
  await expect(page.locator('#'+id)).toBeVisible();
  await expect(page.locator('#'+id+' svg').first()).toBeVisible();
 }
 await page.locator('#area-desert').click();
 await expect(panorama).toHaveAttribute('src','/adventure/desert.webp');
 await page.locator('#difficulty-hard').click();
 await expect(page.locator('#difficulty-hard')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.poster-chip')).toContainText('105');
 await expect(page.locator('.difficulty-heading')).toContainText('8');
 await expect(page.locator('#forest-world-open')).toHaveCount(0);
 await page.screenshot({path:qa+'area-selection-desert-picker.png'});
 for(const viewport of [{width:844,height:390},{width:640,height:320}]) {
  await page.setViewportSize(viewport);
  for(const id of ['explore-area','online-menu','setup-guide'])await expect(page.locator('#'+id)).toBeInViewport();
 }
 await page.screenshot({path:qa+'area-selection-picker-phone.png'});
 await page.setViewportSize({width:390,height:844});
 await page.locator('#explore-area').scrollIntoViewIfNeeded();
 await expect(page.locator('#explore-area')).toBeInViewport();
 const hasHorizontalOverflow=await page.locator('.adventure-select').evaluate(e=>e.scrollWidth>e.clientWidth);
 expect(hasHorizontalOverflow).toBe(false);
 expect(errors).toEqual([]);
});
test('Original Solo and Forest remain selectable and each area launches at the chosen difficulty',async({page})=>{
 test.setTimeout(65000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await page.locator('#area-classic').click();await page.locator('#explore-area').click();await expect(page.locator('#game-stage')).toHaveAttribute('data-area','classic');await page.locator('#exit-game').click();await page.locator('#quit').click();await page.locator('#modern-mode').click();await page.locator('#area-forest').click();await page.locator('#explore-area').click();await expect(page.locator('#game-stage')).toHaveAttribute('data-area','forest');await page.locator('#exit-game').click();await page.locator('#quit').click();await page.locator('#modern-mode').click();await page.locator('#area-desert').click();await page.locator('#difficulty-hard').click();await page.locator('#explore-area').click();await expect(page.locator('#game-stage')).toHaveAttribute('data-area','desert');await expect(page.locator('.playbar small')).toHaveText('HARD');await page.locator('#quest-log').click();await expect(page.locator('.expedition-task')).toHaveCount(3);await expect(page.locator('.expedition-journal')).toContainText('Oasis');await page.locator('#journal-close').click();await page.screenshot({path:qa+'area-selection-desert-play.png'});expect(errors).toEqual([]);
});
test('portrait blocks Adventure input and its Solo clock, then landscape resumes the same run',async({page})=>{
 test.setTimeout(50000);await page.setViewportSize({width:844,height:390});await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await page.locator('#area-forest').click();await page.locator('#explore-area').click();await expect(page.locator('#maze-transition')).toHaveCount(0);await expect(page.locator('#game-stage')).toHaveAttribute('data-orientation-blocked','false');await page.setViewportSize({width:390,height:844});await expect(page.locator('.adventure-rotation')).toBeVisible();await expect(page.locator('#game-stage')).toHaveAttribute('data-orientation-blocked','true');const time=await page.locator('#hud-stats').textContent(),y=await page.locator('#game-stage').getAttribute('data-y');await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');expect(await page.locator('#hud-stats').textContent()).toBe(time);expect(await page.locator('#game-stage').getAttribute('data-y')).toBe(y);await page.screenshot({path:qa+'area-selection-rotate.png'});await page.setViewportSize({width:844,height:390});await expect(page.locator('.adventure-rotation')).not.toBeVisible();await expect(page.locator('#game-stage')).toHaveAttribute('data-orientation-blocked','false');expect(await page.locator('#game-stage').getAttribute('data-y')).toBe(y);
});
test('all additional biomes render real 3D scenes and the sea has animated aquatic guardians',async({page})=>{
 test.setTimeout(75000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');for(const area of ['forest','desert','gorge','mountain','coast','sea']){await page.evaluate(async(area:string)=>{const{ModernGame}=await import('/src/game/modern.ts' as string);const host=document.createElement('div');host.id='biome-qa';host.style.cssText='position:fixed;inset:0;z-index:50';document.body.append(host);const g=new ModernGame(host,{area,difficulty:'medium',seed:15025,adventureMap:0,entrance:0,outfit:'explorer',onTick:()=>{},onFinish:()=>{}});g.setPaused(true);(window as any).biomeQA=g;},area);await expect(page.locator('#biome-qa')).toHaveAttribute('data-area',area);await page.waitForTimeout(200);await page.screenshot({path:qa+`area-selection-world-${area}.png`});if(area==='sea')expect(await page.evaluate(()=>(window as any).biomeQA.guardModels[0].name)).toBe('reef-guardian');await page.evaluate(()=>{(window as any).biomeQA.dispose();document.querySelector('#biome-qa')?.remove();});}expect(errors).toEqual([]);
});
test('menu pages have distinct illustrated scene backgrounds and the Retro remains usable in both orientations',async({page})=>{
 await page.goto('/');await page.locator('#lab').click();await page.locator('#collection-open').click();const collection=await page.locator('#game').getAttribute('style');await page.locator('#collection-close').click();await page.locator('#scores').click();const scores=await page.locator('#game').getAttribute('style');expect(collection).not.toBe(scores);await page.locator('#scores-close').click();await page.locator('#retro-mode').click();await page.locator('#level-1').click();await page.locator('.quiz-setup').getByRole('button',{name:/^(MULAI|PLAY)$/}).click();await expect(page.locator('#maze-transition')).toHaveCount(0);await page.setViewportSize({width:390,height:844});await expect(page.locator('.adventure-rotation')).toHaveCount(0);await expect(page.locator('#game-stage canvas')).toBeVisible();await page.screenshot({path:qa+'area-selection-retro-portrait.png'});await page.setViewportSize({width:844,height:390});await expect(page.locator('#game-stage canvas')).toBeVisible();
});

test('accepted Retro level 21 keeps the earlier branch geometry and visible full-map presentation',async({page})=>{
 await page.goto('/');await page.evaluate(async()=>{const{RetroGame}=await import('/src/game/retro.ts' as string);const host=document.createElement('div');host.id='retro-preserved';host.style.cssText='position:fixed;inset:0;z-index:50';document.body.append(host);(window as any).preservedRetro=new RetroGame(host,{level:21,onTick:()=>{},onFinish:()=>{}});});await expect(page.locator('#retro-preserved canvas')).toHaveAttribute('data-goal-revealed','true');await page.evaluate(()=>(window as any).preservedRetro.setPaused(true));await page.screenshot({path:qa+'area-selection-retro-21-restored.png'});await page.evaluate(()=>(window as any).preservedRetro.dispose());
});
