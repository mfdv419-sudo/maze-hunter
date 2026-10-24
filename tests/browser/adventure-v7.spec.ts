import {test,expect} from '@playwright/test';
test('steering keeps its left/right meaning when the camera is rotated',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('#lab').click();await page.locator('#modern-mode').click();await page.locator('#solo').click();
 const stage=page.locator('#game-stage');await expect(stage).toHaveAttribute('data-heading',/.+/);const read=async(k:string)=>Number(await stage.getAttribute('data-'+k));
 const h=await read('heading');await page.keyboard.down('d');await expect.poll(()=>read('heading')).toBeLessThan(h-.2);await page.keyboard.up('d');expect(await read('heading')).toBeLessThan(h-.2);
 const turned=await read('heading'),camera=await read('camera-yaw');await page.keyboard.down('q');await expect.poll(()=>read('camera-yaw')).toBeGreaterThan(camera+.2);await page.keyboard.up('q');expect(await read('heading')).toBeCloseTo(turned,3);expect(await read('camera-yaw')).toBeGreaterThan(camera+.2);
 await page.keyboard.down('a');await expect.poll(()=>read('heading')).toBeGreaterThan(turned+.2);await page.keyboard.up('a');expect(await read('heading')).toBeGreaterThan(turned+.2);
 await page.locator('#pause-game').click();await expect(page.locator('#resume')).toBeVisible();expect(errors).toEqual([]);
});
test('Adventure arena renders King, telegraphs and final escape without runtime errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const {ModernGame}=await import('/src/game/modern.ts' as string);
  const host=document.createElement('div');host.id='qa-world';host.style.cssText='position:fixed;inset:0;z-index:10000';document.body.append(host);
  const game=new ModernGame(host,{difficulty:'extreme',seed:52,entrance:0,outfit:'explorer',adventureMap:0,onTick:()=>{},onFinish:()=>{}});
  const s=game.adventure;s.seals=new Set([0,1,2]);s.position={x:s.layout.fortress.x+2.5,y:s.layout.fortress.y+.5};game.position={...s.position};game.cameraYaw=-Math.PI/2;game.movementHeading=-Math.PI/2;game.angle=-Math.PI/2;s.elapsed=9;s.step(.01,.01,0,0,.5);game.setPaused(true);game.updateVision();
  (window as any).qaGame=game;
 });
 await expect(page.locator('#qa-world canvas')).toBeVisible();await page.waitForTimeout(800);await page.screenshot({path:'/workspace/scratch/0f24cdd6d8e3/qa/m7-king-arena.png'});
 const state=await page.evaluate(()=>{const game=(window as any).qaGame,s=game.adventure;const king=s.guards.find((g:any)=>g.boss);while(!king.dead)s.hitGuard(king);return{stage:s.stage,phase:s.phase,remaining:s.remaining};});
 expect(state.stage).toBe('escape');expect(state.phase).toBe('playing');expect(state.remaining).toBeGreaterThanOrEqual(45);await page.waitForTimeout(200);expect(errors).toEqual([]);
 await page.evaluate(()=>{(window as any).qaGame.dispose();document.querySelector('#qa-world')?.remove();});
});
