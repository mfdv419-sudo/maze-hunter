import {expect, test} from '@playwright/test';

test('the Forest picker exposes two expanded modes and keeps a new profile locked', async ({page}) => {
 test.setTimeout(90000);
 await page.setViewportSize({width:844,height:390});
 await page.goto('/');
 await page.locator('#lab').click();
 await page.locator('#modern-mode').click();
 await page.locator('#area-forest').click();
 await expect(page.locator('#maze-transition')).toHaveCount(0);
 const entry = page.locator('#forest-world-open');
 await expect(page.locator('.expedition-difficulty').locator('#forest-world-open')).toBeInViewport();
 await entry.click();
 const options=page.getByRole('region',{name:'Forest Grove · Expanded World'});
 const panorama=page.locator('#adventure-preview');
 await expect(entry).toHaveAttribute('aria-expanded','true');
 await expect(options).toBeVisible();
 await expect(options).toContainText('0/6');
 await expect(page.locator('#explore-area')).toBeDisabled();
 await expect(page.locator('#online-menu')).toBeDisabled();
 await expect(panorama).toHaveAttribute('src','/adventure/forest-expanded-hard.webp');
 await expect.poll(()=>panorama.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(1000);
 await options.locator('#forest-world-extreme').click();
 await expect(options.locator('#forest-world-extreme')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#expanded-status')).toContainText('Expanded Hard');
 await expect(panorama).toHaveAttribute('src','/adventure/forest-expanded-extreme.webp');
 await expect.poll(()=>panorama.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(1000);
 await expect(page.locator('#explore-area')).toBeDisabled();
 await page.keyboard.press('Escape');
 await expect(entry).toHaveAttribute('aria-expanded','false');
 await expect(options).toBeHidden();
 await expect(panorama).toHaveAttribute('src','/adventure/forest-panorama.webp');
 await expect(page.locator('#explore-area')).toBeEnabled();
 await page.locator('#area-gorge').click();
 await expect(entry).toHaveCount(0);
 await page.locator('#area-forest').click();
 await page.locator('#difficulty-easy').click();
 await page.locator('#explore-area').click();
 await expect(page.locator('#game-stage canvas')).toBeVisible();
 await expect(page.locator('.forest-mission-summary')).toContainText(/(Kumpulkan segel|Collect seals).*0\/3/);
 await expect(page.locator('[data-progress="sigil"]')).toBeHidden();
});

for (const difficulty of ['hard','extreme'] as const) {
 test(`renders the ${difficulty} expanded world in the actual 3D engine`, async ({page}) => {
  test.setTimeout(90000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:844,height:390});
  await page.goto('/');
  const world = await page.evaluate(async difficulty => {
   const {ModernGame}=await import('/src/game/modern.ts' as string);
   const host=document.createElement('div');
   host.id='expanded-world-scene';
   host.style.cssText='position:fixed;inset:0;z-index:80';
   document.body.append(host);
   const game=new ModernGame(host,{
    area:'forest',forestWorld:true,difficulty,seed:27,adventureMap:0,entrance:0,outfit:'classic',
    onTick:()=>{},onFinish:()=>{},
   });
   game.setPaused(true);
   (window as any).expandedWorldGame=game;
   const ring=game.adventure.layout.ring;
   const cave=game.world.getObjectByName('cave-boundary-rock');
   const bridge=game.world.getObjectByName('floating-bridge-deck');
   const point=ring.zones.find((zone:{id:string})=>zone.id===(difficulty==='extreme'?'sky-1':'ug-cross')).point;
   game.position={x:point.x+.5,y:point.y+.5};
   game.adventure.position={...game.position};
   game.acc=0;
   return {mode:host.dataset.forestWorld, cave:cave?.count, bridge:bridge?.count??0};
  }, difficulty);
  expect(world.mode).toBe(difficulty);
  expect(world.cave).toBeGreaterThan(0);
  if(difficulty==='extreme')expect(world.bridge).toBeGreaterThan(0);
  else expect(world.bridge).toBe(0);
  await expect(page.locator('#expanded-world-scene canvas')).toBeVisible();
  await page.screenshot({path:`test-results/screenshots/forest-expanded-${difficulty}.png`});
  await page.evaluate(()=>(window as any).expandedWorldGame.dispose());
  expect(errors).toEqual([]);
 });
}
