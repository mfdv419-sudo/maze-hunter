import {test,expect} from '@playwright/test';
for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]) {
  test(`home maze preview, mode choice and touch target at ${viewport.width}x${viewport.height}`,async({browser})=>{
    const context=await browser.newContext({viewport,hasTouch:true});const page=await context.newPage();
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('#title-world canvas')).toBeVisible();
    await expect(page.locator('#title-world')).toHaveAttribute('data-mode','retro');
    await expect(page.locator('#retro-mode')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#play')).toHaveCount(0);await expect(page.locator('#retro-mode')).toBeInViewport();
    await expect(page.locator('#modern-mode')).toBeInViewport();
    await page.locator('#mascot-touch').tap();
    await expect(page.locator('#mascot-touch')).toHaveAttribute('data-reacting','true');
    await expect(page.locator('#auth-error')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Firebase');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await page.screenshot({path:`test-results/screenshots/home-${viewport.width}.png`});
    expect(errors).toEqual([]);await context.close();
  });
}
