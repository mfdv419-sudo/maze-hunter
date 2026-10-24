import { test, expect } from "@playwright/test";
import { preview, type PreviewServer } from "vite";
let server: PreviewServer;
test.beforeAll(async () => {
  server = await preview({
    preview: { host: "127.0.0.1", port: 5183, strictPort: true },
  });
});
test.afterAll(async () => {
  await new Promise<void>((resolve) =>
    server.httpServer.close(() => resolve()),
  );
});
test("production excludes control lab and caches the app and Retro assets for offline reload", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5183/");
  await expect(page.locator("#play")).toBeVisible();
  await expect(page.locator("#lab")).toHaveCount(0);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const assets = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(
      names.find((n) => n.startsWith("maze-hunter-"))!,
    );
    return (await cache.keys()).map((r) => r.url);
  });
  expect(assets.some((n) => n.includes("/assets/retro-"))).toBe(true);
  expect(assets.some((n) => n.includes("/assets/phaser-"))).toBe(true);
  expect(assets.some((n) => n.endsWith("/fonts/fredoka-latin.woff"))).toBe(
    true,
  );
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#play")).toContainText("MAIN");
  await expect(page.locator("h1")).toContainText("MAZE");
  await context.close();
});
