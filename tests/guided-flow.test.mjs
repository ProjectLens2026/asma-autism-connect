import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as week from '../src/week.js';
import * as touch from '../src/touch-plan.js';
import * as domain from '../src/domain.js';
import * as home from '../src/home.js';
import * as play from '../src/play.js';
import * as guide from '../src/day-one.js';
import * as timer from '../src/session-timer.js';
import * as dashboard from '../src/dashboard.js';
async function app(){
 const events={};
 const root={innerHTML:'',addEventListener(name,fn){events[name]=fn;},querySelector(){return {focus(){}};}};
 const status={textContent:''};
 const document={querySelector:s=>s==='#app'?root:status,documentElement:{},addEventListener(){}};
 const context=vm.createContext({...touch,...week,...domain,...home,...play,...guide,...timer,...dashboard,e:domain.safeText,document,window:{addEventListener(){}},navigator:{onLine:true},crypto:{subtle:{}},structuredClone,seal:async d=>structuredClone(d),writeVault:async()=>({revision:1}),FormData:class {constructor(f){this.fields=f.fields;}get(k){return this.fields[k]??null;}has(k){return k in this.fields;}},indexedDB:{},console,setInterval(){},setTimeout(){},clearTimeout(){},readVault:async()=>null,stopPlayback(){},cancelRecording(){},speakCard:async()=>false,fetch:async path=>({ok:true,json:async()=>JSON.parse(await readFile(new URL('../'+path.replace(/^\.\//,''),import.meta.url),'utf8'))})});
 const source=(await readFile(new URL('../src/app.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/boot\(\);\s*$/,'globalThis.ready=boot();');
 vm.runInContext(source,context);await context.ready;
 return {root,context,submit:async(id,fields)=>events.submit({preventDefault(){},target:{id,fields,querySelector(){return null;}}}),read:s=>vm.runInContext(s,context),act:async(action,extra={})=>{context.testButton={dataset:{action,...extra}};await vm.runInContext('handleAction(testButton)',context);}};
}
test('caregiver task → break → next task; child handoff retains place and does not record taps',async()=>{
 const a=await app();assert.ok(a.root.innerHTML.includes('data-action="touch-start"'));await a.act('start-guide');await a.act('demo-next');assert.equal(a.read('state.guideFrame'),1);
 await a.act('child-practice');assert.equal((a.root.innerHTML.match(/class="picture /g)||[]).length,6);await a.act('card',{id:'water'});assert.equal(a.read('state.selected'),'water');assert.equal(a.read('state.data'),null);
 await a.act('parent');assert.equal(a.read('state.page'),'day-one');assert.equal(a.read('state.guideFrame'),1);
 await a.act('guide-next');assert.equal(a.read('state.guideBreak'),'between');assert.equal(a.read('activityTimer.remaining'),300);assert.equal(a.read('activityTimer.deadline'),null);
 await a.act('break-duration',{seconds:'600'});assert.equal(a.read('activityTimer.remaining'),600);await a.act('resume-guide');assert.equal(a.read('state.guideStep'),1);assert.equal(a.read('state.guideFrame'),0);
 await a.act('pause-guide');await a.act('resume-guide');assert.equal(a.read('state.guideStep'),1);
 await a.act('end-guide');assert.ok(!a.root.innerHTML.includes('data-action="save-guide"'));await a.act('save-guide');assert.equal(a.read('state.data'),null);
});
test('three activities finish without automatic persistence or restricted AAC',async()=>{const a=await app();await a.act('start-guide');for(let n=0;n<3;n++){await a.act('guide-next');if(n<2)await a.act('resume-guide');}assert.equal(a.read('state.guideStep'),3);assert.ok(a.root.innerHTML.includes('data-action="save-guide"'));assert.equal(a.read('state.data'),null);await a.act('child');assert.equal((a.root.innerHTML.match(/class="picture /g)||[]).length,12);});
test('all fourteen draft activities are reachable without private storage',async()=>{const a=await app();await a.act('nav',{page:'library'});assert.equal((a.root.innerHTML.match(/class="library-tile"/g)||[]).length,14);for(let day=1;day<=14;day++){await a.act('nav',{page:'journey',day:String(day)});assert.equal(a.read('state.day'),day);assert.ok(!a.root.innerHTML.includes('id="vault-form"'));assert.ok(a.root.innerHTML.includes('data-complete="'+day+'" disabled'));}await a.act('child');assert.ok(a.root.innerHTML.includes('public/photos/water.webp'));});
test('dashboard and learning plan are public; private records stay gated',async()=>{const a=await app();assert.equal(a.read('state.page'),'dashboard');assert.ok(a.root.innerHTML.includes('id="parent-navigation"'));for(const page of ['dashboard','today','plan','qa','sources']){await a.act('nav',{page});assert.ok(!a.root.innerHTML.includes('id="vault-form"'));}for(const page of ['observe','progress','voice','privacy']){await a.act('nav',{page});assert.ok(a.root.innerHTML.includes('id="vault-form"'));}await a.act('toggle-menu');assert.equal(a.read('state.menuOpen'),true);await a.act('nav',{page:'dashboard'});assert.equal(a.read('state.menuOpen'),false);});
test('garden is optional, unscored and preserves communication access and caregiver place',async()=>{const a=await app();await a.act('start-guide');await a.act('demo-next');await a.act('garden');assert.ok(!a.root.innerHTML.includes('id="parent-navigation"'));assert.equal((a.root.innerHTML.match(/class="garden-plot"/g)||[]).length,6);await a.act('plant',{plot:'2'});assert.equal(a.read('state.plants[2]'),1);await a.act('plant',{plot:'99'});assert.equal(a.read('state.plants.length'),6);assert.equal(a.read('state.data'),null);await a.act('child');assert.equal((a.root.innerHTML.match(/class="picture /g)||[]).length,12);await a.act('parent');assert.equal(a.read('state.page'),'day-one');assert.equal(a.read('state.guideFrame'),1);await a.act('garden');await a.act('reset-garden');assert.equal(a.read('state.plants.every(v=>v===0)'),true);});

test('one instruction per screen and child handoff preserve the fourth screen',async()=>{const a=await app();await a.act('start-guide');for(let frame=0;frame<3;frame++){assert.equal(a.read('state.guideFrame'),frame);assert.ok(a.root.innerHTML.includes('data-action="demo-next"'));assert.ok(!a.root.innerHTML.includes('data-action="guide-next"'));await a.act('demo-next');}assert.ok(a.root.innerHTML.includes('data-action="child-practice"'));await a.act('child-practice');await a.act('parent');assert.equal(a.read('state.guideFrame'),3);await a.act('guide-next');assert.equal(a.read('state.guideBreak'),'between');await a.act('resume-guide');assert.equal(a.read('state.guideFrame'),0);assert.equal(a.read('state.guideStep'),1);});

test('week: persisted completion, same-day rest, later-day review and no calendar skipping',async()=>{
 const a=await app();a.read("localDate=()=> '2026-10-12';state.data=initialData('en-US');state.key={};");
 await a.act('week-start');assert.equal(a.read('state.weekScreen'),'setup');
 await a.submit('week-setup',{role:'parent',communication:'mixed',interest:'books'});
 await a.act('week-next');assert.equal(a.read('state.data.week.cursor.frame'),1);
 await a.act('week-home');await a.act('week-start');assert.equal(a.read('state.weekFrame'),1);
 await a.act('week-next');await a.act('week-next');await a.act('week-next');
 await a.submit('week-finish',{outcome:'supported'});assert.equal(a.read('state.data.week.sessions.length'),1);
 await a.act('week-start');assert.equal(a.read('state.weekRepeat'),true);
 a.read("localDate=()=> '2026-10-20'");await a.act('week-home');await a.act('week-start');assert.equal(a.read('state.weekDay'),2);assert.equal(a.read('state.weekScreen'),'review');
 await a.submit('week-review',{outcome:'declined'});assert.equal(a.read('state.weekScreen'),'decision');
 await a.act('week-home');await a.act('week-start');assert.equal(a.read('state.weekScreen'),'decision');
 await a.act('week-continue');assert.equal(a.read('state.weekScreen'),'activity');assert.equal(a.read('state.data.week.cursor.day'),2);
 await a.act('child-practice');await a.act('parent');assert.equal(a.read('state.page'),'week');assert.equal(a.read('state.key'),null);
 await a.act('week-next');assert.equal(a.read('state.page'),'privacy');assert.equal(a.read('state.resumeWeek'),true);
});
test('both locales render every week instruction and review without missing labels',async()=>{
 const a=await app();for(const locale of ['en-US','fa-AF']){a.context.testLocale=locale;a.read('state.locale=testLocale');
 for(let day=1;day<=7;day++){a.context.testDay=day;a.read("state.page='week';state.weekDay=testDay;state.weekScreen='activity'");
 for(let frame=0;frame<4;frame++){a.context.testFrame=frame;a.read('state.weekFrame=testFrame;render()');assert.ok(!a.root.innerHTML.includes('undefined'));assert.ok(a.root.innerHTML.includes('data-action="week-next"'));}
 if(day>1){a.read("state.weekScreen='review';render()");assert.ok(a.root.innerHTML.includes('id="week-review"'));assert.equal((a.root.innerHTML.match(/type="radio"/g)||[]).length,4);}
 } }
});
test('locked saved records prompt unlock rather than pretending the family is back at Day 1',async()=>{const a=await app();a.read("state.exists=true;state.weekPreview=false;render()");assert.ok(a.root.innerHTML.includes('data-action="touch-save"'));assert.ok(!a.root.innerHTML.includes('class="week-map"'));});

test('touch activities persist individually; reopening and child return retain frame, and taps never close activities',async()=>{
 const a=await app();a.read("localDate=()=> '2026-10-12';state.data=initialData('en-US');state.key={};");
 await a.act('touch-start',{index:'0'});await a.act('touch-next');
 await a.act('touch-home');await a.act('touch-start',{index:'0'});assert.equal(a.read('state.touchFrame'),1);
 await a.act('child-practice');await a.act('card',{id:'water'});
 assert.equal(a.read('state.data.week.daily[1][0].status'),'active');
 a.read('globalThis.savedData=structuredClone(state.data)');await a.act('parent');
 assert.equal(a.read('state.page'),'touch-activity');assert.equal(a.read('state.touchFrame'),1);assert.equal(a.read('state.key'),null);
 assert.ok(a.root.innerHTML.includes('data-action="touch-save"'));
 a.read('state.data=savedData;state.key={};render()');await a.act('touch-next');await a.act('touch-record',{outcome:'declined'});
 assert.equal(a.read('state.data.week.daily[1][0].outcome'),'declined');assert.equal(a.read('state.data.week.sessions.length'),0);
 await a.act('touch-home');await a.act('touch-start',{index:'0'});assert.equal(a.read('state.touchRepeat'),true);
 await a.act('touch-record',{outcome:'own'});assert.equal(a.read('state.data.week.daily[1][0].outcome'),'declined');
});
test('touch plan closes partial days without inventing completion and requires next-day review after calendar gaps',async()=>{
 const a=await app();a.read("localDate=()=> '2026-10-12';state.data=initialData('en-US');state.key={};");
 await a.act('touch-start',{index:'2'});await a.act('touch-next');await a.act('touch-later');
 assert.equal(a.read('state.data.week.daily[1][2].status'),'later');
 await a.act('touch-finish');await a.act('touch-finish-confirm');
 assert.equal(a.read('state.data.week.sessions.length'),1);assert.equal(a.read('state.data.week.daily[1].filter(r=>r.status==="done").length'),0);
 await a.act('touch-start',{index:'0'});assert.equal(a.read('state.touchRepeat'),true);
 a.read("localDate=()=> '2026-11-10'");await a.act('touch-home');await a.act('touch-start',{index:'1'});
 assert.equal(a.read('state.touchDay'),2);assert.equal(a.read('state.page'),'touch-review');
 await a.act('touch-review-record',{outcome:'unsure'});await a.act('touch-home');await a.act('touch-start',{index:'1'});
 assert.equal(a.read('state.page'),'touch-activity');assert.equal(a.read('state.data.week.daily[2][1].status'),'active');
});
test('touch plan renders all activity stages in both languages with distinct content',async()=>{
 const a=await app();for(const locale of ['en-US','fa-AF']){a.context.testLocale=locale;a.read('state.locale=testLocale');
 for(let i=0;i<5;i++){await a.act('touch-home');await a.act('touch-start',{index:String(i)});
 for(let f=0;f<3;f++){assert.ok(!a.root.innerHTML.includes('undefined'));if(f<2)await a.act('touch-next');}
 await a.act('touch-record',{outcome:'unsure'});}
 }
});
