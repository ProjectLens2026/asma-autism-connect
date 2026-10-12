import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/index.mjs':'playwright');
const server=spawn(process.execPath,['scripts/server.mjs','dist'],{env:{...process.env,PORT:'4179'},stdio:'pipe'});
let browser;
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',()=>reject(Error('Server stopped')));});
 browser=await chromium.launch({headless:true});await mkdir('test-results',{recursive:true});
 for(const locale of ['en-US','fa-AF'])for(const width of [390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:950},hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const click=async(action)=>page.locator(`[data-action="${action}"]`).first().click();
  const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
  await page.goto('http://localhost:4179');await page.locator('#locale').selectOption(locale);await page.locator('.touch-tile').first().waitFor();assert.equal(await page.locator('.touch-tile').count(),5);await fit();
  await page.screenshot({path:`test-results/touch-home-${locale}-${width}.png`,fullPage:true});
  await click('touch-start');await page.locator('.touch-photo').waitFor();await fit();await page.screenshot({path:`test-results/touch-activity-${locale}-${width}.png`,fullPage:true});
  await click('touch-next');await click('child-practice');assert.equal(await page.locator('.picture').count(),6);await page.locator('[data-id="water"]').click();await click('parent');
  assert.ok(await page.locator('[data-action="child-practice"]').isVisible());await click('touch-next');await page.locator('[data-action="touch-record"][data-outcome="declined"]').click();await click('touch-home');assert.equal(await page.locator('.touch-tile.done').count(),1);
  await click('touch-save');await page.locator('[name="passphrase"]').fill('touch testing password');await page.locator('[name="confirm"]').fill('touch testing password');await page.locator('[name="consent"]').check();await page.locator('#vault-form [type="submit"]').click();await page.locator('.touch-tile.done').waitFor();
  await page.locator('.touch-tile[data-index="1"]').click();await click('touch-next');await click('touch-pause');await fit();await click('touch-resume');assert.ok(await page.locator('[data-action="child-practice"]').isVisible());
  await page.reload();await page.locator('#locale').selectOption(locale);await click('touch-save');await page.locator('[name="passphrase"]').fill('touch testing password');await page.locator('#vault-form [type="submit"]').click();await page.locator('.touch-tile.done').waitFor();
  assert.equal(await page.locator('.touch-tile.done').count(),1);await page.locator('.touch-tile[data-index="1"]').click();assert.ok(await page.locator('[data-action="child-practice"]').isVisible());
  await click('touch-later');await click('touch-finish');await click('touch-finish-confirm');assert.equal(await page.locator('.touch-tile.done').count(),1);assert.equal(await page.locator('[data-action="touch-finish"]').count(),0);
  // Previously saved day closes; moving the device clock ahead must offer Day 2 review, not skip lessons.
  await page.clock.install({time:new Date()});await page.clock.setSystemTime(new Date(Date.now()+3*86400000));await page.reload();await page.locator('#locale').selectOption(locale);await click('touch-save');await page.locator('[name="passphrase"]').fill('touch testing password');await page.locator('#vault-form [type="submit"]').click();await page.locator('[data-action="touch-review"]').waitFor();
  await click('touch-review');await page.locator('[data-action="touch-review-record"][data-outcome="unsure"]').click();await click('touch-home');assert.equal(await page.locator('.touch-tile.done').count(),0);await click('touch-start');await page.locator('.touch-photo').waitFor();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await context.setOffline(true);await page.reload();await page.locator('#locale').waitFor();await page.locator('header [data-action="child"]').click();assert.equal(await page.locator('.picture').count(),12);await fit();
  assert.deepEqual(errors,[]);await context.close();console.log(`${locale} ${width}px: activity, child return, encrypted reopen, next-day review and offline passed`);
 }
}finally{await browser?.close();server.kill();}
