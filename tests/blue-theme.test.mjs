import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderHome,renderPlan} from '../src/home.js';
import {renderGarden,nextPlant} from '../src/play.js';
import {safeText as e} from '../src/domain.js';
const json=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
const btn=(label,action,attrs='')=>`<button data-action="${action}" ${attrs}>${e(label)}</button>`;
for(const locale of ['en-US','fa-AF']){
 const copy=await json(`../src/locales/${locale}.json`),lessons=await json(`../content/lessons.${locale}.json`),t=k=>copy[k];
 test(`${locale}: home, plan and garden use complete locale strings`,()=>{for(const html of [renderHome({t,e,btn,lesson:lessons[0]}),renderPlan({t,e,btn}),renderGarden({t,e,btn,plants:[0,1,2,0,1,2]})]){assert.ok(!html.includes('undefined'));assert.ok(html.includes('<h1'));}assert.ok(renderPlan({t,e,btn}).includes(e(copy.planDraft)));});
}
test('blue theme is local, included in public build and leaves child navigation separate',async()=>{const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('./src/blue-theme.css'));const css=await readFile(new URL('../dist/src/blue-theme.css',import.meta.url),'utf8');assert.ok(css.includes('--navy:#102e50'));assert.ok(css.includes('.menu-open .sidebar nav'));assert.ok(css.includes('@media print'));});
test('garden cycles without reward conditions or score',()=>{assert.equal(nextPlant(0),1);assert.equal(nextPlant(1),2);assert.equal(nextPlant(2),0);});
