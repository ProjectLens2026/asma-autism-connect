import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderStart,renderDayOne,nextGuideStep} from '../src/day-one.js';
import {safeText as e} from '../src/domain.js';
const btn=(s,a)=>`<button data-action="${a}">${e(s)}</button>`;
for(const locale of ['en-US','fa-AF']){
 const dictionary=JSON.parse(await readFile(new URL(`../src/locales/${locale}.json`,import.meta.url)));
 const lesson=JSON.parse(await readFile(new URL(`../content/lessons.${locale}.json`,import.meta.url)))[0];
 const t=k=>dictionary[k];
 test(`${locale}: public entry offers activity and pictures without a password`,()=>{const html=renderStart({t,e,btn,lesson});assert.ok(html.includes('data-action="start-guide"'));assert.ok(html.includes('data-action="child"'));assert.ok(!html.includes('type="password"'));});
 test(`${locale}: each step shows only its own instruction with correct navigation`,()=>{for(let step=0;step<lesson.steps.length;step++){const html=renderDayOne({t,e,btn,lesson,step});assert.ok(html.includes(e(lesson.steps[step].body)));for(let other=0;other<lesson.steps.length;other++)if(other!==step)assert.ok(!html.includes(e(lesson.steps[other].body)));assert.equal(html.includes('data-action="guide-back"'),step>0);assert.ok(html.includes('data-action="demo-next"'));assert.ok(!html.includes('data-action="guide-next"'));assert.ok(!html.includes('data-action="save-guide"'));}});
 test(`${locale}: demonstrations have scripts and an interactive child handoff`,()=>{for(let step=0;step<3;step++)for(let frame=0;frame<3;frame++){const html=renderDayOne({t,e,btn,lesson,step,frame});assert.ok(html.includes(e(lesson.steps[step].demo[frame].caption)));assert.ok(html.includes(e(lesson.steps[step].demo[frame].say)));assert.ok(!html.includes('data-action="child-practice"'));const handoff=renderDayOne({t,e,btn,lesson,step,frame:3});assert.ok(handoff.includes('data-action="child-practice"'));assert.ok(handoff.includes('data-action="guide-next"'));}const early=renderDayOne({t,e,btn,lesson,step:3,early:true});assert.ok(!early.includes('data-action="save-guide"'));});
 test(`${locale}: completion offers optional saving and repeat, never a child score`,()=>{const html=renderDayOne({t,e,btn,lesson,step:3});assert.ok(html.includes('data-action="save-guide"'));assert.ok(html.includes('data-action="start-guide"'));assert.ok(!renderDayOne({t,e,btn,lesson,step:3,saved:true}).includes('data-action="save-guide"'));});
}
test('step navigation cannot leave the activity bounds',()=>{assert.equal(nextGuideStep(0,-1,3),0);assert.equal(nextGuideStep(3,1,3),3);assert.equal(nextGuideStep(1,-1,3),0);});
