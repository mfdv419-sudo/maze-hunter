import {test,expect} from '@playwright/test';
for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]) {
 test(`Home artwork is interactive and has no page scroll at ${viewport.width}x${viewport.height}`,async({browser})=>{
  const context=await browser.newContext({viewport,hasTouch:true});const page=await context.newPage();
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.home-scene img')).toBeVisible();
  await expect(page.locator('#retro-mode')).toBeInViewport();
  await expect(page.locator('#modern-mode')).toBeInViewport();
  await expect(page.locator('#home-hero-inspect')).toBeVisible();
  await expect(page.locator('#play')).toHaveCount(0);
  await page.locator('#home-hero-inspect').tap();
  await expect(page.locator('#home-viewer')).toBeVisible();
  await expect(page.locator('#title-world canvas')).toBeVisible({timeout:20000});
  await page.locator('#home-viewer-close').tap();
  await expect(page.locator('#home-viewer')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1)).toBe(false);
  expect(errors).toEqual([]);await context.close();
 });
}
