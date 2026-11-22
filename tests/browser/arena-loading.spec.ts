import {expect, test, type Page} from '@playwright/test';

async function pauseRequest(page: Page, module: RegExp) {
  let resume!: () => void;
  const waiting = new Promise<void>(resolve => { resume = resolve; });
  await page.route(module, async route => {
    await waiting;
    await route.continue();
  }, {times: 1});
  return resume;
}

test('boot and arena loading reflect engine readiness in Adventure and Retro', async ({page}) => {
  await page.setViewportSize({width: 900, height: 490});
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    new MutationObserver(() => {
      const meter = document.querySelector<HTMLProgressElement>('#arena-loading progress');
      if (meter?.value === 100 && document.querySelector('#game-stage canvas')) {
        document.documentElement.dataset.firstFrameLoadComplete = 'true';
      }
    }).observe(document, {subtree: true, childList: true, attributes: true, attributeFilter: ['value']});
  });

  const resumeApp = await pauseRequest(page, /\/src\/main\.ts(?:\?|$)/);
  await page.goto('/', {waitUntil: 'commit'});
  const boot = page.locator('#game .arena-loading');
  await expect(boot).toBeVisible();
  await expect(boot.locator('progress')).not.toHaveAttribute('value');
  resumeApp();
  await page.locator('#lab').click();
  await page.locator('#modern-mode').click();

  const resumeAdventure = await pauseRequest(page, /\/src\/game\/modern\.ts(?:\?|$)/);
  await page.locator('#explore-area').click();
  const loader = page.locator('#arena-loading');
  await expect(loader).toBeVisible();
  await expect(loader.locator('h1')).toHaveText(/Hutan Rimbun|Forest Grove/);
  await expect(loader.locator('progress')).toHaveAttribute('value', '0');
  await expect(loader.locator('canvas')).toBeVisible();
  await expect(page.locator('#game')).toHaveAttribute('inert', '');
  const canvas = loader.locator('canvas');
  const snapshot = await canvas.evaluate((layer: HTMLCanvasElement) => layer.toDataURL());
  await expect.poll(() => canvas.evaluate((layer: HTMLCanvasElement) => layer.toDataURL())).not.toBe(snapshot);
  resumeAdventure();
  await expect(loader).toHaveCount(0);
  await expect(page.locator('#game-stage canvas')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-first-frame-load-complete', 'true');
  await expect(page.locator('#game')).not.toHaveAttribute('inert');
  await page.keyboard.press('Escape');
  await page.locator('#quit').click();

  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.locator('#retro-mode').click();
  await page.locator('#level-1').click();
  await page.locator('.quiz-setup').getByRole('button', {name: /^(MULAI|PLAY)$/}).click();
  await expect(page.locator('#game-stage canvas')).toBeVisible();
  await expect(loader).toHaveCount(0);
  await expect(page.locator('#game')).not.toHaveAttribute('inert');
  expect(errors).toEqual([]);
});

test('failed engine import clears the loading screen and restores the menu', async ({page}) => {
  await page.goto('/');
  await page.locator('#lab').click();
  await page.locator('#modern-mode').click();
  await page.route(/\/src\/game\/modern\.ts(?:\?|$)/, route => route.abort('failed'), {times: 1});
  await page.locator('#explore-area').click();
  await expect(page.locator('#game')).toHaveAttribute('data-screen', 'setup');
  await expect(page.locator('#arena-loading')).toHaveCount(0);
  await expect(page.locator('#game')).not.toHaveAttribute('inert');
  await expect(page.locator('.toast')).toBeVisible();
});
