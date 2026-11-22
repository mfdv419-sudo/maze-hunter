import {test,expect} from '@playwright/test';
for(const viewport of [{width:1024,height:768},{width:844,height:390},{width:640,height:320}])test(`Ability tray and four-button arc fit at ${viewport.width}x${viewport.height}`,async({browser})=>{
 test.setTimeout(120000);const context=await browser.newContext({viewport,hasTouch:true}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await page.locator('#area-coast').click();await page.locator('#explore-area').click();await expect(page.locator('#game-stage canvas')).toBeVisible({timeout:60000});await expect(page.locator('#maze-transition')).toHaveCount(0);
 const check=async(selector:string)=>{const r=(await page.locator(selector).boundingBox())!;expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height);for(const id of ['#hit-action','#jump-action','.forest-ability','.forest-merge','#joystick']){const b=await page.locator(id).boundingBox();if(b)expect(r.x+r.width<=b.x||b.x+b.width<=r.x||r.y+r.height<=b.y||b.y+b.height<=r.y).toBe(true);}};
 if(viewport.width===1024){const pitch=Number(await page.locator('#game-stage').getAttribute('data-camera-pitch'));await page.keyboard.down('q');await page.waitForTimeout(1400);await page.keyboard.up('q');expect(Number(await page.locator('#game-stage').getAttribute('data-camera-pitch'))).toBeCloseTo(pitch,1);await page.waitForTimeout(200);expect(Number(await page.locator('#game-stage').getAttribute('data-camera-distance'))).toBeGreaterThan(0);}
 const pad=page.locator('.action-controls');
 const ability=pad.locator('.forest-ability');
 const tray=page.locator('#adventure-ability-tray');
 await expect(pad.locator('button')).toHaveCount(4);
 await expect(page.locator('.supply-belt')).toHaveCount(0);
 await expect(tray).toBeHidden();
 const rectangles=await pad.locator('button').evaluateAll(buttons=>Object.fromEntries(
   buttons.map(b=>[b.id||b.classList[1], {x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width}]),
 ));
 const jump=rectangles['jump-action'],action=rectangles['hit-action'];
 const merge=rectangles['forest-merge'],abilityRect=rectangles['forest-ability'];
 expect(jump.width).toBeGreaterThan(merge.width*1.5);
 expect(merge.x).toBeGreaterThan(action.x);
 expect(action.x).toBeGreaterThan(abilityRect.x);
 expect(merge.y).toBeLessThan(action.y);
 expect(action.y).toBeLessThan(abilityRect.y);
 await ability.tap();
 await expect(ability).toHaveAttribute('aria-expanded','true');
 await expect(tray).toBeVisible();
 await check('#adventure-ability-tray');
 const rect=(await tray.boundingBox())!;
 expect(rect.x+rect.width/2).toBeCloseTo(viewport.width/2,0);
 await page.screenshot({path:`test-results/screenshots/camera-controls-${viewport.width}.png`});
 await expect(tray.locator('[data-ability-choice="watermelon"]')).toBeDisabled();
 await tray.locator('[data-ability-choice="cake"]').tap();
 await expect(tray.locator('[data-cake="green"]')).toBeVisible();
 await tray.locator('[data-cake="green"]').tap();
 await expect(tray).toBeHidden();
 await expect(ability).toHaveAttribute('aria-expanded','false');
 await ability.tap();
 await expect(tray.locator('[data-ability-choice="cake"]')).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Escape');
 await expect(tray).toBeHidden();
 await expect(page.locator('#resume')).toHaveCount(0);
 await page.evaluate(()=>{Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:()=>Promise.reject(new Error('Denied'))});});await page.locator('#game-fullscreen').tap();await expect(page.locator('.toast')).toContainText('Layar penuh dibatasi');expect(errors).toEqual([]);await context.close();
});
