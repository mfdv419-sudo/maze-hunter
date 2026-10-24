import {test,expect} from '@playwright/test';
for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}])test(`game panels stay inside viewport at ${viewport.width}x${viewport.height}`,async({browser})=>{
 const context=await browser.newContext({viewport,hasTouch:true});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#lab').click();
 async function noPageScroll(){expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.body.scrollHeight>innerHeight+1)).toBe(false);}
 await noPageScroll();await page.locator('#wardrobe').click();await expect(page.locator('#outfit-preview canvas')).toBeVisible();await noPageScroll();
 await expect(page.locator('#wardrobe-close')).toBeInViewport();await page.screenshot({path:`/workspace/scratch/0f24cdd6d8e3/qa/m6-wardrobe-${viewport.width}.png`});
 await page.locator('#wardrobe-close').click();await page.locator('#scores').click();await expect(page.locator('.score-list')).toContainText('Belum ada kemenangan');await noPageScroll();
 await page.locator('#scores-close').click();await page.locator('#modern-mode').click();await noPageScroll();for(const mode of ['hard','extreme','medium']){await page.locator('#difficulty-'+mode).click();await expect(page.locator('#solo')).toBeInViewport({ratio:1});}
 await page.locator('#solo').click();await expect(page.locator('.minimap-panel')).toBeVisible();await noPageScroll();await page.screenshot({path:`/workspace/scratch/0f24cdd6d8e3/qa/m6-adventure-${viewport.width}.png`});
 expect(errors).toEqual([]);await context.close();
});
test('camera and independent music/effects controls persist',async({page})=>{
 await page.goto('/');await page.locator('#settings').click();await page.locator('#camera-choice').selectOption('overview');
 await page.locator('#music-volume').fill('0.35');await page.locator('#effects-volume').fill('0.7');await page.locator('#save-settings').click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('mh-game-preferences')!).camera)).toBe('overview');
 expect(await page.evaluate(()=>localStorage.getItem('mh-music-volume'))).toBe('0.35');
 await page.reload();await page.locator('#settings').click();await expect(page.locator('#camera-choice')).toHaveValue('overview');await expect(page.locator('#music-volume')).toHaveValue('0.35');
});
