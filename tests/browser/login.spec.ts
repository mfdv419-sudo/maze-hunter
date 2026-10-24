import { test, expect } from "@playwright/test";
test("denied popup keeps Firebase's actual error visible and Play becomes retryable", async ({ page }) => {
  // Simulate the browser denying a new window, never simulate an account.
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto("/");
  await expect(page.locator(".build-label")).toHaveText("24.10.24-M2");
  await page.locator("#play").click();
  const error = page.locator("#auth-error");
  // SDK versions may reject a null popup as internal-error or popup-blocked.
  await expect(error.locator("code")).toHaveText(/^auth\/(popup-blocked|internal-error)$/);
  await expect(error).toContainText("Masuk belum selesai");
  await expect(page.locator("#play")).toBeEnabled();
  await error.locator("button").click();
  await expect(error).toHaveCount(0);
  await page.locator("#language").click();
  await page.locator("#play").click();
  await expect(error).toContainText("Sign-in incomplete");
});
test("binturong responds to touch and keyboard on the title screen", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  const mascot = page.locator("#mascot-touch");
  await expect(mascot).toHaveAccessibleName("Sapa binturong");
  await mascot.tap();
  await expect(mascot).toHaveAttribute("data-reacting", "true");
  await expect(mascot).toHaveAttribute("data-reactions", "1");
  await expect(mascot).toHaveAttribute("data-reacting", "false", { timeout: 3000 });
  await mascot.focus();
  await page.keyboard.press("Enter");
  await expect(mascot).toHaveAttribute("data-reactions", "2");
  await page.setViewportSize({ width: 390, height: 844 });
  await mascot.tap();
  await expect(mascot).toHaveAttribute("data-reactions", "3");
  await page.screenshot({path:"/workspace/scratch/0f24cdd6d8e3/qa/mascot-touch-phone.png"});
  await context.close();
});
