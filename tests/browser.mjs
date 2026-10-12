// Run locally with: npm install --no-save playwright@1.62.1 && npx playwright install chromium
// Real browser/RTL/offline suite. Not a substitute for assistive-tech and device testing.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import('playwright');
const server=spawn(process.execPath,['scripts/server.mjs','dist'],{env:{...process.env,PORT:'4178'},stdio:'pipe'});
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error(`server exit ${c}`)));});
 const browser=await chromium.launch();
 try{
 for(const locale of ['en-US','fa-AF'])for(const width of [390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const go=async destination=>{if(width<=700&&await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false')await page.locator('.menu-toggle').click();await page.locator(`.sidebar [data-page="${destination}"]`).click();};
  await page.goto('http://localhost:4178');await page.locator('#locale').selectOption(locale);
  assert.equal(await page.locator('html').getAttribute('dir'),locale==='fa-AF'?'rtl':'ltr');
  await page.locator('[data-action="start-guide"]').click();
  for(let step=0;step<3;step++){assert.equal(await page.locator('.story-scene').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('[data-action="guide-next"]').click();if(step<2)await page.locator('[data-action="resume-guide"]').click();}
  await page.locator('[data-action="guide-home"]').click();
  await page.locator('header [data-action="child"]').click();assert.equal(await page.locator('.picture').count(),12);
  await page.locator('[data-id="water"]').click();assert.equal(await page.locator('[data-id="water"]').getAttribute('aria-pressed'),'true');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-action="parent"]').click();
  await go('privacy');
  await page.locator('[name="passphrase"]').first().fill('caregiver test only 123');await page.locator('[name="confirm"]').fill('caregiver test only 123');await page.locator('[name="consent"]').check();await page.locator('#vault-form [type="submit"]').click();
  await page.locator('.parent-tools').evaluate(el=>el.open=true);await page.locator('[data-complete]').waitFor();await page.locator('[data-complete]').check();
  await go('observe');await page.locator('[name="support"]').selectOption('notObserved');await page.locator('[name="notes"]').fill('<img src=x onerror=alert(1)>');await page.locator('#observation-form [type="submit"]').click();await page.locator('.record').waitFor();assert.equal(await page.locator('.record img').count(),0);
  await go('voice');assert.ok(await page.locator('[data-action="record"]').first().isDisabled());await page.locator('#mic-consent').check();
  await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});await page.locator('[data-action="record"]').first().click();await page.waitForFunction(()=>!document.querySelector('[data-action="stop-record"]'));
  await go('progress');await page.locator('[data-checkpoint="3"] textarea').fill('Caregiver usability note');await page.locator('[data-checkpoint="3"] [type="submit"]').click();
  await page.locator('[data-action="lock"]').click();await page.locator('[name="passphrase"]').first().fill('incorrect phrase 123');await page.locator('#vault-form [type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.length>0);assert.equal(await page.locator('[data-complete]').count(),0);
  await page.locator('[name="passphrase"]').first().fill('caregiver test only 123');await page.locator('#vault-form [type="submit"]').click();await go('today');await page.locator('.parent-tools').evaluate(el=>el.open=true);await page.locator('[data-complete]').waitFor();assert.ok(await page.locator('[data-complete]').isChecked());
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.locator('#locale').waitFor();await context.setOffline(true);await page.reload();await page.locator('#locale').waitFor();await page.locator('header [data-action="child"]').click();assert.equal(await page.locator('.picture').count(),12);
  await mkdir('test-results',{recursive:true});await page.screenshot({path:`test-results/${locale}-${width}.png`,fullPage:true});assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Browser flows passed in both locales at 390/768/1280px, including offline reload.');
 }finally{await browser.close();}
}finally{server.kill();}
