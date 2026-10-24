import { test, expect } from "@playwright/test";
test("denied popup keeps Firebase's actual error visible and Play becomes retryable", async ({ page }) => {
  // Simulate the browser denying a new window, never simulate an account.
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto("/");
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
