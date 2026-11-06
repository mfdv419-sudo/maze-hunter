import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const viewport of [{width:844,height:390},{width:740,height:360},{width:640,height:320},{width:390,height:844}]){
 test(`Adventure entry touch targets remain reachable at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await expect(page.locator('#maze-transition')).toHaveCount(0);
  const rects=[];for(const id of ['explore-area','online-menu']){const b=page.locator('#'+id);await expect(b).toBeInViewport({ratio:1});const r=(await b.boundingBox())!;expect(r.height).toBeGreaterThanOrEqual(48);rects.push(r);expect(await b.evaluate(e=>{const r=e.getBoundingClientRect();return e.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;})).toBe(true);}
  expect(rects[0].height).toBe(rects[1].height);expect(Math.abs(rects[0].width-rects[1].width)).toBeLessThan(1);
  await page.locator('#online-menu').tap();await expect(page.getByRole('status')).toContainText('Main online memerlukan');
  await page.locator('#explore-area').tap();await expect(page.locator('#game')).toHaveAttribute('data-screen','modern');
  // Canvas gameplay and actual online membership require separate device/server QA.
 });
}
