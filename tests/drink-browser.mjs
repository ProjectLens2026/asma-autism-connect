import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/index.mjs':'playwright');
const server=spawn(process.execPath,['scripts/server.mjs','dist'],{env:{...process.env,PORT:'4179'},stdio:'pipe'});
let browser;
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',()=>reject(Error('Server stopped')));});
 browser=await chromium.launch({headless:true});
 for(const locale of ['en-US','fa-AF'])for(const width of [390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:950},hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const click=async action=>page.locator(`[data-action="${action}"]`).first().click();
  const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
  await page.goto('http://localhost:4179');await page.locator('#locale').selectOption(locale);await click('drink-open');
  for(let i=0;i<3;i++){await page.locator('.drink-scene').waitFor();await fit();await click('drink-next');}
  await page.locator('.drink-water').waitFor();await page.locator('[data-choice="more"]').click();await fit();
  assert.equal(await page.locator('#parent-navigation').count(),0);
  await page.reload();await click('drink-open');await page.locator('.drink-water').waitFor();
  await click('drink-next');await click('drink-next');await page.locator('[data-outcome="other"]').click();await page.locator('[data-action="drink-repeat"]').waitFor();
  await page.reload();assert.equal(await page.locator('#vault-form').count(),0);
  await page.locator('[data-page="touch-notes"]').click();await page.locator('.drink-notes').waitFor();await fit();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await context.setOffline(true);await page.reload();await click('drink-open');await page.locator('.drink-scene').waitFor();await fit();
  assert.deepEqual(errors,[]);await context.close();console.log(`${locale} ${width}px passed`);
 }
}finally{await browser?.close();server.kill();}
