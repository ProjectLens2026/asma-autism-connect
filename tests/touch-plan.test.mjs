import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWeek,finishSession} from '../src/week.js';
import {dailyRows,setDaily,touchStatus} from '../src/touch-plan.js';
import {initialData,validateData,progressReport} from '../src/domain.js';
import {deriveKey,seal,openEnvelope} from '../src/crypto.js';
test('daily activity validation rejects malformed backups while legacy vaults still load',()=>{
 const d=initialData('en-US');assert.ok(validateData(d));
 d.week=setDaily(emptyWeek(),1,0,{status:'active',frame:1},'2026-10-12');assert.ok(validateData(d));
 d.week.daily[1][0].frame=20;assert.ok(!validateData(d));d.week.daily[1][0].frame=1;
 d.week.daily[1][0].status='done';assert.ok(!validateData(d));
 d.week.daily[1][0].outcome='own';d.week.daily[1][0].date='2026-02-30';assert.ok(!validateData(d));
});
test('revisit is immutable and new daily mutations require prior-day review',()=>{
 let w=setDaily(emptyWeek(),1,0,{status:'done',frame:2,outcome:'declined',date:'2026-10-12'},'2026-10-12');
 w=setDaily(w,1,0,{outcome:'own'},'2026-10-12');assert.equal(dailyRows(w,1)[0].outcome,'declined');
 w=finishSession(w,1,'2026-10-12','unsure');assert.equal(touchStatus(w,'2026-10-12').closed,true);
 assert.throws(()=>setDaily(w,2,0,{status:'active'},'2026-10-12'),/WAIT_NEXT_DAY/);
 assert.throws(()=>setDaily(w,2,0,{status:'active'},'2026-11-12'),/REVIEW_REQUIRED/);
 assert.equal(touchStatus(w,'2026-11-12').day,2);
});
test('encrypted backup round trip and report preserve individual activities without changing existing records',async()=>{
 const d=initialData('fa-AF');d.completed[3]=true;
 d.week=setDaily(emptyWeek(),1,2,{status:'later',frame:1},'2026-10-12');
 const salt=crypto.getRandomValues(new Uint8Array(16)),pass='private test passphrase',key=await deriveKey(pass,salt);
 const envelope=await seal(d,key,salt);assert.ok(!JSON.stringify(envelope).includes('later'));
 const restored=await openEnvelope(envelope,pass);assert.deepEqual(restored.data,d);assert.ok(validateData(restored.data));
 assert.equal(progressReport(d).learningWeek.daily[1][2].frame,1);assert.equal(d.completed[3],true);
});
