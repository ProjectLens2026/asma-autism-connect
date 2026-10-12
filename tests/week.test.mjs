import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWeek,weekStatus,finishSession,validWeek} from '../src/week.js';
import {validDate,initialData,validateData,progressReport} from '../src/domain.js';
test('seven sessions advance only after completion, a later date and a review',()=>{
 let w=emptyWeek();assert.equal(weekStatus(w,'2026-10-12').kind,'start');
 for(let day=1;day<=7;day++){
  const date=`2026-10-${11+day}`;
  if(day>1){assert.throws(()=>finishSession(w,day,date,'supported'),/REVIEW_REQUIRED/);w.reviews.push({day:day-1,date,outcome:'unsure'});}
  assert.throws(()=>finishSession(w,day+1,date,'supported'));
  w=finishSession(w,day,date,'supported');assert.ok(validWeek(w,validDate));
  if(day<7){assert.equal(weekStatus(w,date).kind,'rest');assert.throws(()=>finishSession(w,day+1,date,'supported'),/WAIT_NEXT_DAY/);assert.equal(weekStatus(w,'2027-01-01').day,day+1);}
 }
 assert.equal(weekStatus(w,'2027-01-01').kind,'finished');assert.throws(()=>finishSession(w,8,'2027-01-01','independent'));
});
test('legacy vaults remain valid and invalid session records are rejected',()=>{
 const d=initialData('fa-AF');assert.ok(validateData(d));d.week=emptyWeek();assert.ok(validateData(d));
 d.week.sessions=[{day:2,date:'2026-10-12',outcome:'independent'}];assert.ok(!validateData(d));
 d.week.sessions=[{day:1,date:'2026-02-30',outcome:'independent'}];assert.ok(!validateData(d));
 d.week=emptyWeek();d.week.cursor={day:1,frame:4};assert.ok(validateData(d));d.week.cursor.frame=5;assert.ok(!validateData(d));
});
test('functional export includes session observations without voice clips or a mastery score',()=>{const d=initialData('en-US');d.week=finishSession(emptyWeek(),1,'2026-10-12','declined');const r=progressReport(d);assert.equal(r.learningWeek.sessions[0].outcome,'declined');assert.ok(!('clips' in r));assert.ok(!('score' in r));});

test('encrypted backup round-trip retains setup, review and unfinished place',async()=>{
 const {deriveKey,seal,openEnvelope}=await import('../src/crypto.js');
 const d=initialData('fa-AF');d.week=finishSession(emptyWeek(),1,'2026-10-12','supported');
 d.week.profile={role:'parent',communication:'mixed',interest:'books'};
 d.week.reviews=[{day:1,date:'2026-10-13',outcome:'unsure'}];d.week.cursor={day:2,frame:2};
 const salt=crypto.getRandomValues(new Uint8Array(16));const pass='test-only-passphrase';const key=await deriveKey(pass,salt);
 const backup=JSON.parse(JSON.stringify(await seal(d,key,salt)));assert.ok(!JSON.stringify(backup).includes('books'));
 const restored=await openEnvelope(backup,pass);assert.deepEqual(restored.data.week,d.week);assert.ok(validateData(restored.data));
});
