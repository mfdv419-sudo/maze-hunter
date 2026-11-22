import {test,expect} from '@playwright/test';

test('Shop supports preview of locked gear, six camera angles and zoom without equip',async({page})=>{
 await page.goto('/');await page.locator('#lab').click();await page.locator('#wardrobe').click();
 await expect(page.locator('#mh-shop-preview canvas')).toBeVisible();
 const first=page.locator('.mh-shop-item[data-owned="false"]').first();
 await expect(first).toBeVisible();await first.click();
 await expect(page.locator('#shop-selected-status')).toContainText('PRATINJAU');
 await expect(page.locator('#shop-equip-action')).toBeDisabled();
 for(const side of ['front','left','right','back','top','bottom'])await expect(page.locator('#shop-'+side)).toBeInViewport();
 await page.locator('#shop-top').click();await page.locator('#shop-back').click();
 await page.locator('#shop-zoom-in').click();await page.locator('#shop-zoom-out').click();
 await page.locator('#shop-reset').click();
 await page.locator('#wardrobe-close').click();
});
