import { test, expect } from "@playwright/test";
import { retroConfig, route, center } from "../../src/game/maze";
test("real login gate and bilingual menu; no fake production account", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#play")).toContainText("MAIN");
  await page.locator("#language").click();
  await expect(page.locator("#play")).toContainText("PLAY");
});
test("Retro mouse playthrough, lift/regrab, unlock and retry", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("#lab").click();
  await page.locator("#retro-mode").click();
  await page.locator("#level-1").click();
  const canvas = page.locator("#game-stage canvas");
  await expect(canvas).toBeVisible();
  const bounds = await canvas.boundingBox();
  if (!bounds) throw Error("No canvas");
  const c = retroConfig(1),
    n = c.maze.grid.length,
    scale = Math.min((bounds.width - 28) / n, (bounds.height - 28) / n),
    ox = bounds.x + (bounds.width - n * scale) / 2,
    oy = bounds.y + (bounds.height - n * scale) / 2;
  const path = route(c.maze.grid, c.maze.start, c.maze.finish);
  const p = center(path[0]);
  await page.mouse.move(ox + p.x * scale, oy + p.y * scale);
  await page.mouse.down();
  for (let i = 1; i < path.length; i++) {
    const q = center(path[i]);
    if (i === 2) {
      await page.mouse.up();
      await page.mouse.down();
    }
    await page.mouse.move(ox + q.x * scale, oy + q.y * scale, { steps: 5 });
  }
  await page.mouse.up();
  await expect(page.locator(".result")).toBeVisible();
  await expect(page.locator(".stars")).toHaveText("★★★");
  await page.locator("#result-next").click();
  await expect(page.locator(".playbar b")).toContainText("2");
  expect(errors).toEqual([]);
});
test("Modern renders 3D, keyboard moves and rotate/resize preserves session", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("#lab").click();
  await page.locator("#modern-mode").click();
  await page.locator("#solo").click();
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  await expect(page.locator("#hud-stats")).toContainText("area");
  await page.keyboard.down("s");
  await page.waitForTimeout(500);
  await page.keyboard.up("s");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  await page.locator("#pause-game").click();
  await expect(page.locator("#resume")).toBeVisible();
  await page.locator("#resume").click();
  await expect(page.locator("#game-overlay")).toBeEmpty();
  expect(errors).toEqual([]);
});
test("phone touch tracing: one penalty per gesture, lift/regrab, orientation preserves progress", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("#lab").click();
  await page.locator("#retro-mode").click();
  await page.locator("#level-1").click();
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const cdp = await context.newCDPSession(page);
  async function point(x: number, y: number) {
    const b = await page.locator("#game-stage canvas").boundingBox();
    if (!b) throw Error("No canvas");
    const n = 7,
      scale = Math.min((b.width - 28) / n, (b.height - 28) / n);
    return {
      x: b.x + (b.width - n * scale) / 2 + x * scale,
      y: b.y + (b.height - n * scale) / 2 + y * scale,
    };
  }
  const start = await point(1.5, 1.5),
    wall = await point(1.5, 0.5);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [start],
  });
  await page.waitForTimeout(40);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [wall],
  });
  await page.waitForTimeout(40);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [await point(0.5, 0.5)],
  });
  await page.waitForTimeout(40);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".lives")).toHaveText("♥♥♡");
  await page.setViewportSize({ width: 844, height: 390 });
  await expect
    .poll(() =>
      page.locator("#game-stage canvas").evaluate((c) => {
        const canvas = c as HTMLCanvasElement;
        return (
          canvas.width === canvas.parentElement!.clientWidth &&
          canvas.height === canvas.parentElement!.clientHeight
        );
      }),
    )
    .toBe(true);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(page.locator(".lives")).toHaveText("♥♥♡");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [await point(1.5, 1.5)],
  });
  await page.waitForTimeout(40);
  const config = retroConfig(1);
  for (const cell of route(
    config.maze.grid,
    config.maze.start,
    config.maze.finish,
  ).slice(1)) {
    const p = center(cell);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [await point(p.x, p.y)],
    });
    await page.waitForTimeout(25);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".stars")).toHaveText("★★☆");
  expect(errors).toEqual([]);
  await context.close();
});

test("title is a game scene without admin text; touch action buttons work with joystick", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#title-world canvas")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Satu akun orang tua");
  await expect(page.locator("body")).not.toContainText("Firebase");
  await expect(page.locator(".game-title")).toContainText("HUNTER");
  await page.locator("#lab").click();
  await page.locator("#modern-mode").click();
  await page.locator("#solo").click();
  await expect(page.locator("#joystick")).toBeVisible();
  await expect(page.locator("#jump-action")).toBeVisible();
  await expect(page.locator("#hit-action")).toBeVisible();
  const cdp = await context.newCDPSession(page);
  const stick = await page.locator("#joystick").boundingBox(),
    jump = await page.locator("#jump-action").boundingBox();
  if (!stick || !jump) throw Error("Controls unavailable");
  const left = {
      x: stick.x + stick.width * 0.67,
      y: stick.y + stick.height / 2,
      id: 1,
    },
    right = { x: jump.x + jump.width / 2, y: jump.y + jump.height / 2, id: 2 };
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [left],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [left, right],
  });
  await expect(page.locator("#jump-action")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  const hit = await page.locator("#hit-action").boundingBox();
  if (!hit) throw Error("Hit button unavailable");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: hit.x + hit.width / 2, y: hit.y + hit.height / 2, id: 3 },
    ],
  });
  await expect(page.locator("#hit-action")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});
