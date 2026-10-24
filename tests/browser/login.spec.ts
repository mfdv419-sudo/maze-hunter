import { test, expect } from "@playwright/test";
test("failed Firebase initialization keeps its actual error visible and Play becomes retryable", async ({ page }) => {
  // Simulate the browser denying a new window, never simulate an account.
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto("/");
  await expect(page.locator(".build-label")).toHaveText("24.10.24-M6");
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
test("uncoded JavaScript login failure shows the actual detail safely on a phone", async ({ browser }) => {
  const context = await browser.newContext({ viewport: {width:390, height:844}, hasTouch:true });
  const page = await context.newPage();
  // Test-only fault injection at the login boundary, retaining real configuration
  // and auth observer. No fake successful sign-in or user profile is supplied.
  await page.route("**/src/services/cloud.ts", route => route.fulfill({contentType:"application/javascript",body:`
    export * from "/src/services/cloud.ts?real=1";
    export async function login() {
      throw new TypeError("Cannot read properties of undefined (reading 'open'); access_token=PRIVATE_TEST_VALUE some.user@example.com");
    }
  `}));
  await page.goto("/");
  await page.locator("#play").tap();
  const panel = page.locator("#auth-error");
  await expect(panel.locator("code")).toHaveText("TypeError");
  await expect(panel.locator(".login-detail")).toContainText("reading 'open'");
  await expect(panel).toContainText("Project: maze-hunter-e362b");
  await expect(panel).toContainText("Signed in: no");
  await expect(panel).not.toContainText("PRIVATE_TEST_VALUE");
  await expect(panel).not.toContainText("some.user@example.com");
  await expect(panel).not.toContainText("login/unknown");
  await expect(page.locator("#play")).toBeEnabled();
  await expect(panel.locator("button")).toBeInViewport();
  await page.screenshot({path:"/workspace/scratch/0f24cdd6d8e3/qa/login-m3-phone.png"});
  await context.close();
});
test("a wrapped Firebase failure retains the inner code and cause", async ({ page }) => {
  await page.route("**/src/services/cloud.ts", route => route.fulfill({contentType:"application/javascript",body:`
    export * from "/src/services/cloud.ts?real=1";
    export async function login() {
      throw new Error("Google popup failed", {cause: {code:"auth/popup-closed-by-user",message:"The window closed"}});
    }
  `}));
  await page.goto("/");
  await page.locator("#play").click();
  await expect(page.locator("#auth-error code")).toHaveText("auth/popup-closed-by-user");
  await expect(page.locator(".login-detail")).toContainText("Cause: The window closed");
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
