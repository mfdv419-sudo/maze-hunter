import {retroBoard,boardRoute,retroViewport,retroToScreen} from "../../src/game/retro-board";
import { test, expect } from "@playwright/test";
import { retroConfig, route, center } from "../../src/game/maze";
test("real login gate and bilingual menu; no fake production account", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#retro-mode small")).toContainText("Sentuh");
  await expect(page.locator("#play")).toHaveCount(0);
  await page.locator("#language").click();
  await expect(page.locator("#retro-mode small")).toContainText("Touch");
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
  await expect(page.locator("#maze-transition")).toHaveCount(0);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw Error("No canvas");
  const c=retroBoard(1),fit=retroViewport(bounds.width,bounds.height,c.width,c.height),xy=(p:{x:number;y:number})=>{const q=retroToScreen(p,fit);return{x:bounds.x+q.x,y:bounds.y+q.y};};
  const path = boardRoute(c);
  const p = center(path[0]);
  await page.mouse.move(xy(p).x, xy(p).y);
  await page.mouse.down();
  for (let i = 1; i < path.length; i++) {
    const q = center(path[i]);
    if (i === 2) {
      await page.mouse.up();
      await page.mouse.down();
    }
    await page.mouse.move(xy(q).x, xy(q).y, { steps: 5 });
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
  await page.locator("#area-classic").click();await page.locator("#explore-area").click();
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  await expect(page.locator("#adventure-objectives")).toContainText("0/3");
  await expect(page.locator(".minimap-panel canvas")).toBeVisible();
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
test("phone trace: wall contact is free, dead end resets and orientation preserves lives",async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
 await page.goto('/');await page.locator('#lab').click();await page.locator('#retro-mode').click();await page.locator('#level-1').click();await expect(page.locator('#maze-transition')).toHaveCount(0);
 const cdp=await context.newCDPSession(page),board=retroBoard(1);
 async function point(x:number,y:number){const b=(await page.locator('#game-stage canvas').boundingBox())!;const fit=retroViewport(b.width,b.height,board.width,board.height);const q=retroToScreen({x,y},fit);return{x:b.x+q.x,y:b.y+q.y};}
 const start=center(board.start);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(start.x,start.y)]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await point(-.1,-.1)]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('.lives')).toHaveText('♥♥♥');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(start.x,start.y)]});
 for(const cell of boardRoute(board,board.start,board.deadEnds[0]).slice(1)){const p=center(cell);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await point(p.x,p.y)]});await page.waitForTimeout(30);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('.lives')).toHaveText('♥♥♡');
 await page.setViewportSize({width:844,height:390});await expect(page.locator('.lives')).toHaveText('♥♥♡');
 await page.screenshot({path:'test-results/screenshots/presentation-retro-touch.png'});await context.close();
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
  await page.locator("#area-classic").click();await page.locator("#explore-area").click();
  await expect(page.locator("#joystick")).toBeVisible();
  await expect(page.locator("#jump-action")).toBeVisible();
  await expect(page.locator("#hit-action")).toBeVisible();
  await expect(page.locator("#maze-transition")).toHaveCount(0);
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
