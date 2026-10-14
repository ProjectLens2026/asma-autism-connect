import {emptyDrink,renderDrink} from './drink.js';
import {dailyRows,setDaily,touchStatus,renderTouch,TOUCH_OUTCOMES} from './touch-plan.js';
import {emptyWeek,weekStatus,finishSession,renderWeekHome,renderWeek,OUTCOMES} from './week.js';
import {renderGarden,nextPlant,GARDEN_SIZE} from './play.js';
import {renderHome,renderPlan} from './home.js';
import {makeTimer,secondsLeft,pauseTimer,startTimer,clock} from './session-timer.js';
import {renderStart,renderDayOne,nextGuideStep} from './day-one.js';
import {renderDashboard,dashboardTarget} from './dashboard.js';
import {LOCALES,APP_VERSION,CONTENT_VERSION,localeDirection,localDate,addMonths,planDay,lessonForDay,initialData,validateData,validateObservation,progressReport,safeText as e} from './domain.js';
import {deriveKey,seal,openEnvelope,openWithKey,newDeviceKey,encode64} from './crypto.js';
import {readVault,writeVault,eraseVault,readDeviceAccess} from './storage.js';
import {speakCard,playBlob,stopPlayback,cancelRecording,finishRecording,recordClip} from './audio.js';
const root=document.querySelector('#app'),status=document.querySelector('#status');
const state={locale:'fa-AF',page:'dashboard',menuOpen:false,role:'parent',data:null,key:null,salt:null,exists:false,revision:null,storage:true,day:1,guideStep:0,guideFrame:0,guideBreak:null,guideEarly:false,childPractice:false,childGame:false,plants:Array(6).fill(0),returnGuide:false,resumeGuide:false,selected:null,recording:null,micConsent:false,heard:new Set(),busy:false,offlineReady:false};
Object.assign(state,{autoAccess:false,deviceOnly:false,drinkPaused:false,drinkSelected:null,drinkAudio:false,returnDrink:false});
let activityTimer=makeTimer();
let weekContent={},touchItems=[],guestWeek=emptyWeek();
Object.assign(state,{touchDay:1,touchIndex:0,touchFrame:0,touchRepeat:false,touchPaused:'dashboard',returnTouch:null,resumeTouch:null});
Object.assign(state,{weekDay:1,weekFrame:0,weekScreen:'activity',weekRepeat:false,weekOutcome:null,weekPersistent:false,resumeWeek:false,returnWeek:false,weekPreview:false});
const currentWeek=()=>state.data?.week|| (state.data?emptyWeek():guestWeek);
async function ensureProgress(){
 if(state.key)return true;
 if(state.exists&&!state.weekPreview){state.resumeTouch=state.page==='drink'?'drink':'dashboard';state.page='privacy';return false;}
 if(state.exists&&state.weekPreview){if(state.page==='drink'){state.resumeTouch='drink';state.page='privacy';return false;}return true;}
 if(!state.storage)throw Error('STORAGE_UNAVAILABLE');
 // Recheck before creating: another tab may already have initialized a vault.
 if(await readVault()){state.exists=true;state.page='privacy';return false;}
 const key=await newDeviceKey(),salt=crypto.getRandomValues(new Uint8Array(16)),data=initialData(state.locale);
 data.week=structuredClone(guestWeek);
 const envelope=await seal(data,key,salt,true);
 const saved=await writeVault(envelope,null,{key,salt:encode64(salt)});
 state.key=key;state.salt=salt;state.data=data;state.revision=saved.revision;state.exists=true;state.autoAccess=true;state.deviceOnly=true;state.weekPersistent=true;
 return true;
}
function drinkData(){return state.data?.drink||emptyDrink();}
async function saveDrink(change){if(!await ensureProgress())return false;if(!state.key)throw Error('UNSAVED_PREVIEW');await mutate(d=>{d.drink=change(d.drink||emptyDrink());});return true;}
function drinkView(){if(!state.key&&state.exists)return touchView('touch-home');return renderDrink({d:drinkData(),locale:state.locale,e,btn,selected:state.drinkSelected,paused:state.drinkPaused,audioEnabled:state.drinkAudio});}
async function changeWeek(fn){if(state.key)await mutate(d=>{d.week=fn(d.week||emptyWeek());});else if(state.weekPersistent)throw Error('LOCKED');else guestWeek=fn(guestWeek);}
function startWeek(){state.weekPreview=true;const w=currentWeek(),s=weekStatus(w,localDate());state.weekPersistent=!!state.key;state.weekDay=s.day;state.weekFrame=w.cursor?.day===s.day?Math.min(3,w.cursor.frame):0;state.weekRepeat=['rest','finished'].includes(s.kind);const reviewed=w.reviews.some(r=>r.day===s.day-1&&r.date===localDate());state.weekOutcome=w.reviews.at(-1)?.outcome||null;state.weekScreen=!w.profile?'setup':s.kind==='review'&&!reviewed?'review':s.kind==='review'&&!w.cursor?'decision':w.cursor?.frame===4&&!state.weekRepeat?'reflection':'activity';state.page='week';state.menuOpen=false;}
function touchView(page){
 const w=currentWeek(),s=touchStatus(w,localDate());
 if(state.exists&&!state.key&&!state.weekPreview)return `<section class="card"><h1 tabindex="-1">${e(t('weekReturn'))}</h1><p>${e(t('weekLockedHint'))}</p>${btn(t('unlock'),'touch-save')}${btn(t('weekPreview'),'touch-preview','','quiet')}${btn(t('openPictures'),'child','','secondary')}</section>`;
 const day=['touch-home','touch-week','touch-notes'].includes(page)?s.day:state.touchDay;
 return renderTouch({page,w,today:localDate(),locale:state.locale,items:touchItems,week:weekContent[state.locale],e,btn,t,day,index:state.touchIndex,frame:state.touchFrame,repeat:state.touchRepeat,saved:!!state.key});
}
function weekHome(){
 if(state.exists&&!state.key&&!state.weekPreview)return touchView('touch-home');
 const d=drinkData(),T=(a,b)=>state.locale==='fa-AF'?b:a;
 return `<section class="featured-drink"><div><small>${e(T('OUR NEW ACTIVITY','فعالیت جدید ما'))}</small><h1 tabindex="-1">${e(T('My drink','نوشیدنی من'))}</h1><p>${e(T('See it. Explore it. Try it together.','ببینیم، امتحان کنیم، با هم انجام دهیم.'))}</p>${btn(T(d.stage===6?'Revisit activity':d.stage>0?'Continue where we stopped':'Start activity',d.stage===6?'تکرار فعالیت':d.stage>0?'از همان‌جا ادامه دهیم':'شروع فعالیت'),'drink-open')}</div><img src="./public/photos/water.webp" alt=""></section><p class="autosave-note">${e(T(state.key?'Progress saves automatically on this device.':'Starting an activity saves progress on this browser. Anyone using this browser profile can open it. Password protection is in More → Family settings.',state.key?'پیشرفت در این دستگاه خودکار ذخیره می‌شود.':'با شروع فعالیت، پیشرفت در این مرورگر ذخیره می‌شود. هر کسی که از همین مرورگر استفاده کند می‌تواند آن را باز کند. رمزگذاری اختیاری در تنظیمات خانواده است.'))}</p><details><summary>${e(T('Earlier draft activities and daily plan','فعالیت‌های ابتدایی قبلی و برنامۀ روزانه'))}</summary>${touchView('touch-home')}</details>`;
}
function touchTools(){return `<h1 tabindex="-1">${e(t('touchTools'))}</h1><div class="touch-options">${['privacy','voice','library','qa','progress','observe','sources'].map(p=>btn(t(p),'nav',`data-page="${p}"`,'secondary')).join('')}</div>`;}


let dictionaries={},lessons={},questions={},cards=[],sources=[],review={},voices={},lockTimer,session=0;
const nav=[['dashboard','▦'],['touch-notes','✎'],['touch-week','▤'],['touch-tools','⚙']];
const cardImage=c=>c.photo||c.image;
const t=k=>dictionaries[state.locale]?.[k]||k;
const btn=(label,action,extra='',cls='button')=>`<button class="${cls}" data-action="${action}" ${extra}>${e(label)}</button>`;
const head=(title,description)=>`<div class="pagehead"><span class="eyebrow">${e(t('parent'))}</span><h1 tabindex="-1">${e(title)}</h1><p>${e(description)}</p></div>`;
function announce(message){status.textContent=message;}
function resetTimer(){clearTimeout(lockTimer);if(state.key&&!state.autoAccess)lockTimer=setTimeout(()=>lock(),300000);}
function lock(){state.weekPreview=false;state.weekOutcome=null;activityTimer=pauseTimer(activityTimer);session++;cancelRecording();stopPlayback();state.recording=null;state.micConsent=false;state.heard.clear();state.data=null;state.key=null;state.salt=null;clearTimeout(lockTimer);render();}
async function commit(next) {
 if(!state.key||!validateData(next))throw Error('INVALID_STATE');
 const token=session,key=state.key,salt=state.salt;
 const envelope=await seal(next,key,salt,state.deviceOnly);const saved=await writeVault(envelope,state.revision);
 if(session===token){state.data=next;state.exists=true;state.revision=saved.revision;}return session===token;
}
async function mutate(change){const next=structuredClone(state.data);change(next);await commit(next);}
function download(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function summaryBadge(){return `<span class="badge warning">${e(t('draft'))}</span>`;}
function render(focus=false){
 document.title=t('brand');document.documentElement.lang=state.locale;document.documentElement.dir=localeDirection(state.locale);
 const child=state.role==='child'||(state.page==='drink'&&drinkData().stage===3&&!state.drinkPaused);
 root.innerHTML=`<div class="shell ${child?'child-shell':state.menuOpen?'menu-open':''}">${child?'':`<aside class="sidebar"><a class="brand" href="#main"><span class="brandmark" aria-hidden="true">∞</span><span>${e(t('brand'))}<small>${e(t('touchTogether'))}</small></span></a>${btn(t('menu'),'toggle-menu',`aria-expanded="${!!state.menuOpen}" aria-controls="parent-navigation"`,'secondary menu-toggle')}<nav id="parent-navigation" aria-label="${e(t('parent'))}">${nav.map(([id,icon])=>`<button data-action="${id==='child'?'child':'nav'}" data-page="${id}" class="navitem ${(state.page===id||(['day-one','week'].includes(state.page)&&id==='today'))?'active':''}" ${state.page===id?'aria-current="page"':''}><span aria-hidden="true">${icon}</span>${e(t(id))}</button>`).join('')}</nav><div class="side-note"><b>${e(t('localOnly'))}</b><p>${e(t('promise'))}</p><span>v${APP_VERSION}</span></div></aside>`}
 <div class="workspace"><header><span class="breadcrumb">${e(t('brand'))} <span>/ ${e(t(child?'child':state.page))}</span></span><div class="toolbar"><label class="sr" for="locale">Language / زبان</label><select id="locale" ${state.recording?'disabled':''}>${LOCALES.map(l=>`<option value="${l}" ${l===state.locale?'selected':''}>${l==='fa-AF'?'دری افغانستان':'English (US)'}</option>`).join('')}</select>${child?btn(t('back'),'parent','','secondary'):btn(t('child'),'child','','secondary')}${!child&&!state.data&&state.page==='sources'?btn(t('homeActivity'),'guide-home','','quiet'):''}${!child&&state.key&&!state.autoAccess?btn(t('lock'),'lock','','quiet'):''}</div></header>
 <main id="main">${state.page==='drink'&&state.role!=='child'?drinkView():child?(state.childGame?renderGarden({t,e,btn,plants:state.plants}):board()):parentContent()}</main><footer>${e(t('pilot'))} · ${e(t(navigator.onLine?'online':'offline'))}<br>${e(t(state.offlineReady?'offlineReady':'offlineWait'))}</footer></div></div>`;
 if(focus)root.querySelector('h1')?.focus();
}
function gate(){if(state.deviceKeyMissing)return `<section class="card"><h1>${e(t('accessTitle'))}</h1><p>${e(t('deviceKeyMissing'))}</p>${restoreForm()}${btn(t('demo'),'child','','secondary')}</section>`;return `${btn(t('homeActivity'),'guide-home','','quiet')}${head(t('welcome'),t('intro'))}<div class="columns"><section class="card"><h2>${e(t(state.exists?'locked':'setup'))}</h2><p>${e(t('consentInfo'))}</p>${state.storage?`<form id="vault-form"><label>${e(t('passphrase'))}<input name="passphrase" type="password" minlength="12" required autocomplete="${state.exists?'current-password':'new-password'}"></label>${state.exists?'':`<label>${e(t('confirmPass'))}<input name="confirm" type="password" minlength="12" required autocomplete="new-password"></label><label class="check"><input type="checkbox" name="consent" required><span>${e(t('consent'))}</span></label>`}<label class="check"><input type="checkbox" name="rememberDevice" checked><span>${e(t('rememberDevice'))}</span></label><button class="button" type="submit">${e(t(state.exists?'unlock':'continue'))}</button></form>`:`<p role="alert">${e(t('unsupported'))}</p>`}<p>${e(t('logoutNote'))}</p>${btn(t('demo'),'child','','secondary')}</section><aside class="stack"><section class="card tint"><h2>${e(t('choose'))}</h2><div class="mini-pictures">${cards.slice(0,3).map(c=>`<img src="${cardImage(c)}" alt="${e(c.labels[state.locale])}">`).join('')}</div><p>${e(t('promise'))}</p></section><section class="card">${summaryBadge()}<p>${e(t('nativePending'))}</p>${state.storage?restoreForm():''}</section></aside></div>`;}
function parentContent(){if(state.page==='drink')return drinkView();if(state.page==='touch-tools')return touchTools();if(state.page.startsWith('touch-'))return (state.page==='touch-notes'?drinkNotes():'')+touchView(state.page);if(state.page==='week')return renderWeek({t,e,btn,w:currentWeek(),content:weekContent[state.locale],day:state.weekDay,screen:state.weekScreen,frame:state.weekFrame,repeat:state.weekRepeat,reviewOutcome:state.weekOutcome});if(['dashboard','today','plan'].includes(state.page))return weekHome();if(state.page==='library')return library();if(state.page==='journey')return journey();if(state.page==='dashboard')return renderHome({t,e,btn,lesson:lessons[state.locale][0]});if(state.page==='plan')return renderPlan({t,e,btn});if(state.page==='day-one')return renderDayOne({t,e,btn,lesson:lessons[state.locale][0],step:state.guideStep,saved:!!state.data?.completed[1],frame:state.guideFrame,breakKind:state.guideBreak,early:state.guideEarly,timerHTML:timerMarkup()});if(state.page==='today'&&!state.data)return renderStart({t,e,btn,lesson:lessons[state.locale][0]});if(state.page==='qa')return qa();if(state.page==='sources')return evidence();if(!state.data)return gate();return ({today:today,journey:journey,qa:qa,observe:observations,progress:progress,voice:voice,privacy:privacy})[state.page]();}
function lessonCard(day){const l=lessonForDay(day,lessons[state.locale]);return `<article class="card lesson"><div class="row"><span class="eyebrow">${e(t('day'))} ${day} / 180</span><span class="badge">${l.minutes} ${e(t('minutes'))}</span></div><h2>${e(l.title)}</h2><p class="lesson-body">${e(l.body)}</p><p class="soft">${e(t('pause'))}</p><label class="check"><input type="checkbox" data-complete="${day}" ${state.data?'':'disabled'} ${state.data?.completed[day]?'checked':''}><span>${e(t('done'))}</span></label><div class="cardfoot"><span>${l.id} · v${l.version} · ${e(t('draft'))}</span><span>${l.sourceIds.join(' / ')}</span></div></article>`;}
function today(){
 const day=planDay(state.data.startDate);
 return renderStart({t,e,btn,lesson:lessons[state.locale][0]})+`<details class="parent-tools"><summary>${e(t('parentTools'))}</summary>`+renderDashboard({t,e,btn,day,done:Object.values(state.data.completed).filter(Boolean).length,
 observations:state.data.observations.length,
 recordings:Object.entries(state.data.clips).filter(([k,v])=>k.startsWith(state.locale+':')&&v.status==='approved').length,
 reviewDate:addMonths(state.data.startDate,3),lessonHTML:btn(t('guidedDayOne'),'start-guide')+lessonCard(day)})+'</details>';
}
function journey(){return `${btn(t('guidedDayOne'),'start-guide')}${head(t('journey'),t('flexible'))}<div class="card"><label for="day-select">${e(t('day'))}</label><select id="day-select">${Array.from({length:180},(_,i)=>`<option value="${i+1}" ${state.day===i+1?'selected':''}>${i+1} · ${e(lessonForDay(i+1,lessons[state.locale]).title)}</option>`).join('')}</select><p>${e(t('repeat'))}</p></div>${lessonCard(state.day)}<div class="start-shortcuts">${btn(t('openPictures'),'child','','secondary')}${btn(t('library'),'nav','data-page="library"','quiet')}${!state.data?btn(t('privateProgress'),'nav','data-page="privacy"','quiet'):''}</div>`;}
function board(){const shown=state.childPractice?cards.filter(c=>['water','food','toilet','help','no','break'].includes(c.id)):cards;const selected=cards.find(c=>c.id===state.selected);return `<div class="pagehead"><h1 tabindex="-1">${e(t(state.childPractice?'childExplore':'choose'))}</h1><p>${e(t(state.childPractice?'childExploreHint':'boardIntro'))}</p></div><div class="board-result ${selected?'has-picture':''}" aria-live="polite" aria-atomic="true">${selected?`<img src="${cardImage(selected)}" alt=""><span>${e(selected.labels[state.locale])}</span>`:e(t('tagline'))}</div><div class="picture-grid">${shown.map(c=>`<button class="picture ${state.selected===c.id?'chosen':''}" data-action="card" data-id="${c.id}" aria-pressed="${state.selected===c.id}"><img src="${cardImage(c)}" alt="" draggable="false"><span>${e(c.labels[state.locale])}</span></button>`).join('')}</div><div class="row board-tools">${btn(t('gardenOpen'),'garden','','secondary')}${state.childPractice?btn(t('openPictures'),'child','','secondary'):''}${btn(t('clear'),'clear','','quiet')}${btn(t('printBoard'),'print-board','','quiet')}</div>`;}
function timerMarkup(){return `<section class="activity-timer" aria-label="${e(t('timerLabel'))}"><span>${e(t('timerLabel'))}</span><output id="activity-clock" aria-live="off">${clock(secondsLeft(activityTimer))}</output><div>${btn(t(activityTimer.deadline===null?'timerStart':'timerPause'),'toggle-timer','','secondary')}${btn(t('timerReset'),'reset-timer','','quiet')}</div></section>`;}
function resetActivityTimer(seconds=180){activityTimer=makeTimer(seconds);}
function library(){
 return head(t('library'),t('libraryIntro'))+'<div class="activity-library">'+lessons[state.locale].map((lesson,index)=>'<button class="library-tile" data-action="nav" data-page="journey" data-day="'+(index+1)+'"><span class="activity-number">'+(index+1)+'</span><h2>'+e(lesson.title)+'</h2><p>'+e(lesson.body)+'</p><span class="tile-link">'+e(t('openActivity'))+' ↗</span></button>').join('')+'</div>';
}
setInterval(()=>{const out=document.querySelector('#activity-clock');if(!out||activityTimer.deadline===null)return;const seconds=secondsLeft(activityTimer);out.textContent=clock(seconds);if(seconds===0){activityTimer=pauseTimer(activityTimer);render();announce(t('timerDone'));}},1000);

function qa(){return `${head(t('qa'),t('qaIntro'))}<div class="notice">${e(t('education'))}</div><div class="stack">${questions[state.locale].map(q=>`<details class="card"><summary><bdi>${q.id}</bdi> · ${e(q.question)}</summary><p>${e(q.answer)}</p><small>v${q.version} · ${q.sourceIds.join(', ')} · ${e(t('draft'))}</small></details>`).join('')}</div>`;}
function options(name,values){return `<label>${e(t(name))}<select name="${name}">${values.map(v=>`<option value="${v}">${e(t(v))}</option>`).join('')}</select></label>`;}
function observationList(){return state.data.observations.length?`<div class="record-list">${[...state.data.observations].reverse().map(o=>`<article class="record"><div><b>${e(t(o.skill))} · ${e(t(o.support))}</b><p><bdi>${e(o.date)}</bdi> · ${e(t(o.context))}</p><p class="user-text" dir="auto">${e(o.notes)}</p></div>${btn(t('delete'),'delete-observation',`data-id="${e(o.id)}"`,'quiet')}</article>`).join('')}</div>`:`<p>${e(t('noRecords'))}</p>`;}
function observations(){return `${head(t('observe'),t('observationsIntro'))}<div class="columns"><section class="card"><form id="observation-form"><label>${e(t('date'))}<input type="date" name="date" value="${localDate()}" max="${localDate()}" required></label>${options('skill',['request','refuse','discomfort'])}${options('context',['home','play','community'])}${options('support',['independent','modelled','notObserved'])}<label>${e(t('notes'))}<textarea name="notes" maxlength="500" rows="3" dir="auto"></textarea></label><button type="submit" class="button">${e(t('save'))}</button></form></section><section class="card"><h2>${e(t('observe'))}</h2>${observationList()}</section></div>`;}
function progress(){return `${drinkNotes()}`+ `${state.data.week?`<section class="card"><h2>${e(t('weekTitle'))}</h2><p>${state.data.week.sessions.length} / 7 · ${e(t('weekSessionDone'))}</p>${state.data.week.sessions.map(r=>`<p>${e(t('day'))} ${r.day} · <bdi>${e(r.date)}</bdi> · ${e(t('weekOutcome_'+r.outcome))}</p>`).join('')}<p>${e(t('weekNoScore'))}</p></section>`:''}${head(t('progress'),t('checkpointIntro'))}<div class="row export-tools">${btn(t('export'),'export')}${btn(t('print'),'print-progress','','secondary')}</div><p class="notice export-tools">${e(t('exportWarn'))}</p><div class="columns">${[3,6].map(m=>`<section class="card"><h2>${e(t('review'+m))}</h2><p>${e(t('due'))}: <bdi>${addMonths(state.data.startDate,m)}</bdi></p><form data-checkpoint="${m}"><label>${e(t('reviewPrompt'))}<textarea name="notes" maxlength="1000" rows="5" dir="auto">${e(state.data.checkpoints[m]?.notes||'')}</textarea></label><button type="submit" class="button">${e(t('save'))}</button></form>${state.data.checkpoints[m]?`<p>${e(t('date'))}: ${e(state.data.checkpoints[m].date)}</p>`:''}</section>`).join('')}</div><section class="card"><h2>${e(t('observe'))}</h2>${observationList()}</section><p>${e(t('notScore'))} · v${CONTENT_VERSION} · ${e(t('draft'))}</p>`;}
function voice(){return `${head(t('voice'),t('voiceIntro'))}<p class="notice">${e(t('nativePending'))}</p><section class="card"><label class="check"><input id="mic-consent" type="checkbox" ${state.micConsent?'checked':''} ${state.recording?'disabled':''}><span>${e(t('micConsent'))}</span></label><div class="voice-list">${cards.map(c=>{const clip=state.data.clips[`${state.locale}:${c.id}`];return `<article class="voice-row"><img src="${cardImage(c)}" alt=""><div><b>${e(c.labels[state.locale])}</b><small>${e(t(clip?(clip.status==='approved'?'approved':'pending'):'missing'))}</small></div><div class="voice-actions">${state.recording===c.id?btn(t('stopRecord'),'stop-record'):btn(t('record'),'record',`data-id="${c.id}" ${!state.micConsent||state.recording?'disabled':''}`,'secondary')}${clip?`${btn(t('listen'),'listen',`data-id="${c.id}"`,'quiet')}${clip.status==='draft'?btn(t('approve'),'approve',`data-id="${c.id}" ${state.heard.has(`${state.locale}:${c.id}`)?'':'disabled'}`,'quiet'):''}${btn(t('delete'),'delete-clip',`data-id="${c.id}"`,'quiet')}`:''}</div></article>`;}).join('')}</div></section>`;}
function evidence(){return `${head(t('sources'),t('scopeNote'))}<section class="card">${summaryBadge()}<dl><dt>${e(t('version'))}</dt><dd>${e(review.version)}</dd><dt>${e(t('reviewer'))}</dt><dd>${e(review.clinicalReviewer||t('none'))}</dd><dt>${e(t('checked'))}</dt><dd>${e(review.updated)}</dd></dl><p class="notice">${e(t('ageNote'))}</p></section><div class="stack">${sources.map(s=>`<article class="card"><h2><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a></h2><p>${e(s.scope[state.locale])}</p><p>${e(t('checked'))}: ${s.accessed} · ${e(t('reviewer'))}: ${e(t('none'))}</p></article>`).join('')}</div>`;}
function restoreForm(){return `<details><summary>${e(t('restore'))}</summary><p>${e(t('restoreWarn'))}</p><form id="restore-form"><label>${e(t('restore'))}<input type="file" name="backup" accept=".json,application/json" required></label><label>${e(t('passphrase'))}<input name="passphrase" type="password" required autocomplete="off"></label><button class="secondary" type="submit">${e(t('restore'))}</button></form></details>`;}
function drinkNotes(){const d=state.data?.drink;if(!d?.observations.length)return '';const T=(a,b)=>state.locale==='fa-AF'?b:a;const labels={picture:T('Used a picture','از تصویر استفاده کرد'),other:T('Communicated another way','به روش دیگری پیامش را رساند'),stop:T('Wanted to stop','خواست تمام شود'),unsure:T('Not sure / not tried','مطمئن نیستم / امتحان نکردیم')};return `<section class="card drink-notes"><h2>${e(T('My drink · observations','نوشیدنی من · یادداشت‌ها'))}</h2>${d.observations.map(o=>`<p><bdi>${e(o.date)}</bdi> · ${e(labels[o.outcome])}</p>`).join('')}</section>`;}
function accessSettings(){return `<section class="card storage-options"><h2>${e(t('accessTitle'))}</h2><p>${e(t(state.autoAccess?'accessAutomatic':'accessProtected'))}</p><details><summary>${e(t('setProtection'))}</summary><form id="protection-form"><label>${e(t('passphrase'))}<input name="passphrase" type="password" minlength="12" required autocomplete="new-password"></label><label>${e(t('confirmPass'))}<input name="confirm" type="password" minlength="12" required autocomplete="new-password"></label><button class="button" type="submit">${e(t('setProtection'))}</button></form></details>${!state.autoAccess?btn(t('enableAutomatic'),'enable-auto','','secondary'):''}<details><summary>${e(t('portableBackup'))}</summary><form id="portable-backup-form"><p>${e(t('backupPasswordInfo'))}</p><label>${e(t('passphrase'))}<input name="passphrase" type="password" minlength="12" required autocomplete="new-password"></label><label>${e(t('confirmPass'))}<input name="confirm" type="password" minlength="12" required autocomplete="new-password"></label><button type="submit" class="button">${e(t('portableBackup'))}</button></form></details></section>`;}
function privacy(){return `${accessSettings()}${head(t('privacyTitle'),t('consentInfo'))}<div class="columns"><section class="card"><form id="settings-form"><label>${e(t('startDate'))}<input name="startDate" type="date" value="${state.data.startDate}" max="${localDate()}" required></label><label class="check"><input name="tts" type="checkbox" ${state.data.settings.tts?'checked':''}><span>${e(t('tts'))}</span></label><p>${e(t('ttsInfo'))}</p><label class="check"><input name="analytics" type="checkbox" ${state.data.settings.analytics?'checked':''}><span>${e(t('analytics'))}</span></label><p>${e(t('analyticsInfo'))}</p><button class="button" type="submit">${e(t('save'))}</button></form><p>${e(t('logoutNote'))}</p>${!state.autoAccess?btn(t('lock'),'lock','','quiet'):''}</section><section class="card stack"><h2>${e(t('privacy'))}</h2>${!state.deviceOnly?btn(t('backup'),'backup','','secondary'):''}${restoreForm()}${btn(t('storage'),'storage','','secondary')}<p>${e(t('install'))}</p><hr>${btn(t('erase'),'erase','','danger')}</section></div>`;}
async function handleAction(button){const action=button.dataset.action,id=button.dataset.id;
 if(action.startsWith('drink-')){
  if(action==='drink-choice'){
   const choice=button.dataset.choice;if(!['water','more','finished','no','break'].includes(choice))return;
   state.drinkSelected=choice;render();
   const card=choice==='finished'?{id:'finished',labels:{'en-US':'Finished','fa-AF':'تمام شد'}}:cards.find(c=>c.id===choice);
   const data=state.data?{...state.data,settings:{...state.data.settings,tts:state.drinkAudio}}:null;
   const played=await speakCard(card,state.locale,data,voices.assets);
   if(!played&&state.drinkAudio)announce(t('noAudio'));return;
  }
  if(action==='drink-open')state.page='drink';
  if(!await ensureProgress()){render(true);return;}
  state.menuOpen=false;
  if(action==='drink-open'){state.page='drink';state.drinkPaused=false;if(drinkData().stage===6)await saveDrink(d=>({...d,stage:0}));}
  if(action==='drink-next'||action==='drink-back'){const stage=Math.max(0,Math.min(5,drinkData().stage+(action==='drink-next'?1:-1)));if(!await saveDrink(d=>({...d,stage})))return;state.page='drink';state.drinkSelected=null;}
  if(action==='drink-explore'){if(!await saveDrink(d=>({...d,stage:3})))return;state.drinkSelected=null;}
  if(action==='drink-repeat'){if(!await saveDrink(d=>({...d,stage:0})))return;state.page='drink';}
  if(action==='drink-record'){const outcome=button.dataset.outcome;if(!['picture','other','stop','unsure'].includes(outcome)||drinkData().stage!==5)return;if(!await saveDrink(d=>({...d,stage:6,observations:[...d.observations,{date:localDate(),outcome}]})))return;}
  if(action==='drink-home'){state.page='dashboard';state.drinkPaused=false;}
  if(action==='drink-pause'){state.drinkPaused=true;stopPlayback();}
  if(action==='drink-resume')state.drinkPaused=false;
  render(true);return;
 }
 if(action==='enable-auto'){const envelope=await seal(state.data,state.key,state.salt,state.deviceOnly);const saved=await writeVault(envelope,state.revision,{key:state.key,salt:encode64(state.salt)});state.revision=saved.revision;state.autoAccess=true;clearTimeout(lockTimer);render();return;}
 if(action.startsWith('touch-')){
  if(action==='touch-save'){state.resumeTouch=state.page.startsWith('touch-')?state.page:'dashboard';state.page='privacy';render(true);return;}
  if(action==='touch-preview'){state.weekPreview=true;state.weekPersistent=false;state.page='dashboard';render(true);return;}
  if(state.exists&&!state.key&&!state.weekPreview){state.resumeTouch=state.page.startsWith('touch-')?state.page:'dashboard';state.page='privacy';render(true);return;}
  if(['touch-start','touch-finish','touch-review'].includes(action)&&!await ensureProgress()){render(true);return;}const w=currentWeek(),s=touchStatus(w,localDate());state.weekPersistent=!!state.key;
  if(action==='touch-home'){state.page='dashboard';}
  if(action==='touch-start'){
   state.touchDay=s.day;state.touchIndex=Number(button.dataset.index);if(!Number.isInteger(state.touchIndex)||state.touchIndex<0||state.touchIndex>4)return;
   if(s.review){state.page='touch-review';}
   else {const r=dailyRows(w,s.day)[state.touchIndex];state.touchRepeat=s.closed||r.status==='done';state.touchFrame=state.touchRepeat?0:r.frame;
    if(!state.touchRepeat)await changeWeek(w=>setDaily(w,state.touchDay,state.touchIndex,{status:'active',frame:state.touchFrame},localDate()));state.page='touch-activity';}
  }
  if(action==='touch-next'||action==='touch-back'){
   const frame=Math.max(0,Math.min(2,state.touchFrame+(action==='touch-next'?1:-1)));
   if(!state.touchRepeat)await changeWeek(w=>setDaily(w,state.touchDay,state.touchIndex,{status:'active',frame},localDate()));state.touchFrame=frame;
  }
  if(action==='touch-later'){await changeWeek(w=>setDaily(w,state.touchDay,state.touchIndex,{status:'later',frame:state.touchFrame},localDate()));state.page='dashboard';}
  if(action==='touch-record'){
   const outcome=button.dataset.outcome;if(!TOUCH_OUTCOMES.includes(outcome))return;
   if(!state.touchRepeat)await changeWeek(w=>setDaily(w,state.touchDay,state.touchIndex,{status:'done',frame:2,outcome,date:localDate()},localDate()));state.page='touch-closed';
  }
  if(action==='touch-pause'){if(['dashboard','today','plan','touch-week','touch-notes'].includes(state.page))state.touchDay=s.day;state.touchPaused=state.page;state.page='touch-pause';}
  if(action==='touch-resume'){state.page=state.touchPaused;}
  if(action==='touch-finish'){state.touchDay=s.day;state.page=s.review?'touch-review':s.closed?'dashboard':'touch-finish';}
  if(action==='touch-finish-confirm'){
   await changeWeek(w=>finishSession(w,state.touchDay,localDate(),'unsure'));state.page='dashboard';
  }
  if(action==='touch-review'){state.touchDay=s.day;state.page=s.review?'touch-review':'dashboard';}
  if(action==='touch-review-record'){
   const outcome=button.dataset.outcome;if(!TOUCH_OUTCOMES.includes(outcome)||!s.review)return;
   await changeWeek(w=>({...w,reviews:[...w.reviews,{day:state.touchDay-1,date:localDate(),outcome:({own:'independent',supported:'supported',declined:'declined',unsure:'unsure'})[outcome]}]}));state.page='touch-decision';
  }
  if(action==='touch-repeat'){state.touchDay=Math.max(1,s.day-1);state.touchIndex=0;state.touchFrame=0;state.touchRepeat=true;state.page='touch-activity';}
  render(true);return;
 }
 if(action==='week-unlock'){state.resumeTouch=state.page.startsWith('touch-')?state.page:null;state.resumeWeek=state.page==='week';state.page='privacy';render(true);return;}
 if(action==='week-start'){startWeek();render(true);return;}
 if(action==='week-home'){state.page='dashboard';render(true);return;}
 if(action==='week-next'){if(state.weekPersistent&&!state.key){state.resumeWeek=true;state.page='privacy';render(true);return;}const next=state.weekFrame+1;if(!state.weekRepeat)await changeWeek(w=>({...w,cursor:{day:state.weekDay,frame:next}}));if(next<4)state.weekFrame=next;else state.weekScreen='reflection';render(true);return;}
 if(action==='week-back'){state.weekFrame=Math.max(0,state.weekFrame-1);render(true);return;}
 if(action==='week-pause'){state.weekScreen='break';render(true);return;}
 if(action==='week-resume'){state.weekScreen='activity';render(true);return;}
 if(action==='week-continue'||action==='week-repeat'){if(state.weekPersistent&&!state.key){state.resumeWeek=true;state.page='privacy';render(true);return;}if(action==='week-repeat'){state.weekDay=Math.max(1,state.weekDay-1);state.weekRepeat=true;state.weekFrame=0;}else{state.weekFrame=currentWeek().cursor?.frame||0;await changeWeek(w=>({...w,cursor:{day:state.weekDay,frame:state.weekFrame}}));}state.weekScreen=state.weekFrame===4?'reflection':'activity';state.weekFrame=Math.min(3,state.weekFrame);render(true);return;}

 if(action==='toggle-menu'){state.menuOpen=!state.menuOpen;render();root.querySelector('.menu-toggle')?.focus();return;}
 if(action==='start-guide'||action==='open-task'){state.menuOpen=false;state.page='day-one';state.guideStep=action==='open-task'?Math.max(0,Math.min(2,Number(button.dataset.task)||0)):0;state.guideFrame=0;state.guideBreak=null;state.guideEarly=false;resetActivityTimer();render(true);return;}
 if(action==='demo-next'||action==='demo-back'){state.guideFrame=nextGuideStep(state.guideFrame,action==='demo-next'?1:-1,3);render(true);return;}
 if(action==='pause-guide'){state.guideBreak='pause';resetActivityTimer(300);render(true);return;}
 if(action==='resume-guide'){if(state.guideBreak==='between'){state.guideStep++;state.guideFrame=0;}state.guideBreak=null;resetActivityTimer();render(true);return;}
 if(action==='end-guide'){state.guideEarly=true;state.guideStep=3;state.guideBreak=null;activityTimer=pauseTimer(activityTimer);render(true);return;}
 if(action==='break-duration'){resetActivityTimer(Number(button.dataset.seconds)===600?600:300);render();return;}
 if(action==='toggle-timer'){activityTimer=activityTimer.deadline===null?startTimer(activityTimer):pauseTimer(activityTimer);render();return;}
 if(action==='reset-timer'){resetActivityTimer(activityTimer.seconds);render();return;}
 if(action==='guide-next'||action==='guide-back'){if(action==='guide-next'&&state.guideStep<2){state.guideBreak='between';resetActivityTimer(300);}else{state.guideStep=nextGuideStep(state.guideStep,action==='guide-next'?1:-1,3);state.guideFrame=0;state.guideBreak=null;resetActivityTimer();}render(true);return;}
 if(action==='guide-home'){activityTimer=pauseTimer(activityTimer);state.page='dashboard';render(true);return;}
 if(action==='save-guide'){if(state.guideEarly)return;if(!state.key){state.resumeGuide=true;state.page='privacy';render(true);return;}await mutate(d=>{d.completed[1]=true;});render();announce(t('savedActivity'));return;}
 if(action==='lock'){lock();return;}
 if(action==='child'||action==='child-practice'||action==='garden'){activityTimer=pauseTimer(activityTimer);if(state.role!=='child'){state.returnDrink=state.page==='drink';state.returnTouch=state.page.startsWith('touch-')?state.page:null;state.returnGuide=state.page==='day-one';state.returnWeek=state.page==='week';}state.childPractice=action==='child-practice';state.childGame=action==='garden';announce('');cancelRecording();state.recording=null;state.role='child';state.selected=null;render(true);return;}
 if(action==='parent'){if(state.page==='drink'&&state.role!=='child'){if(await saveDrink(d=>({...d,stage:4})))render(true);return;}state.role='parent';state.page=state.returnDrink?'drink':state.returnTouch|| (state.returnWeek?'week':state.returnGuide?'day-one':'dashboard');state.childPractice=false;if(state.autoAccess)render(true);else lock();return;}
 if(action==='nav'){if(button.dataset.page==='privacy'&&!state.exists&&!await ensureProgress()){render(true);return;}state.menuOpen=false;activityTimer=pauseTimer(activityTimer);announce('');stopPlayback();cancelRecording();state.recording=null;const target=dashboardTarget(button.dataset,state.data?planDay(state.data.startDate):1);state.page=target.page;state.day=target.day;render(true);if(target.checkpoint)root.querySelector(`[data-checkpoint="${target.checkpoint}"] textarea`)?.focus();return;}
 if(action==='card'){state.selected=id;const token=session;const locale=state.locale;render();root.querySelector(`[data-action="card"][data-id="${id}"]`)?.focus();try{const played=await speakCard(cards.find(c=>c.id===id),locale,state.data,voices.assets);if(!played&&token===session&&state.selected===id)announce(t('noAudio'));}catch{announce(t('audioFail'));}return;}
 if(action==='plant'){const i=Number(button.dataset.plot);if(Number.isInteger(i)&&i>=0&&i<GARDEN_SIZE){state.plants[i]=nextPlant(state.plants[i]);render();root.querySelector(`[data-plot="${i}"]`)?.focus();announce(t('plant'+state.plants[i]));}return;}
 if(action==='reset-garden'){state.plants=Array(GARDEN_SIZE).fill(0);render();return;}
 if(action==='clear'){state.selected=null;stopPlayback();render();return;}
 if(action==='print-board'){window.print();return;}
 if(!state.key){announce(t('returnUnlock'));return;}
 if(action==='export'){if(confirm(t('exportConfirm')))download('asma-progress.json',progressReport(state.data));}
 if(action==='print-progress'){if(confirm(t('exportConfirm')))window.print();}
 if(action==='backup'&&!state.deviceOnly)download('asma.vault.json',await readVault());
 if(action==='delete-observation'){await mutate(d=>{d.observations=d.observations.filter(o=>o.id!==id);});render();}
 if(action==='record'){
  if(!state.micConsent)return;
  const locale=state.locale,token=session;state.recording=id;render();
  try{await recordClip(async clip=>{if(token!==session)return;await mutate(d=>{d.clips[`${locale}:${id}`]=clip;});state.heard.delete(`${locale}:${id}`);state.recording=null;render();announce(t('saved'));},()=>announce(t('recording')),key=>{state.recording=null;render();announce(t(key));});}catch{state.recording=null;if(state.data?.settings.analytics){try{await mutate(d=>d.metrics.errors++);}catch{}}render();announce(t('micFail'));}
 }
 if(action==='stop-record')finishRecording();
 if(action==='listen'){const key=`${state.locale}:${id}`,token=session;const heard=await playBlob(state.data.clips[key]);if(heard&&token===session&&state.data){state.heard.add(key);render();}}
 if(action==='approve'){const k=`${state.locale}:${id}`;if(!state.heard.has(k))return;await mutate(d=>{d.clips[k].status='approved';d.clips[k].reviewedAt=new Date().toISOString();});render();}
 if(action==='delete-clip'){stopPlayback();await mutate(d=>{delete d.clips[`${state.locale}:${id}`];});state.heard.delete(`${state.locale}:${id}`);render();}
 if(action==='storage'){announce(t(await navigator.storage?.persist?.()?'storageYes':'storageNo'));}
 if(action==='erase'&&confirm(t('eraseConfirm'))){await eraseVault(state.revision);state.exists=false;state.revision=null;state.autoAccess=false;state.deviceOnly=false;state.deviceKeyMissing=false;lock();}
}
root.addEventListener('click',async event=>{const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;const nonmutating=['week-start','week-home','week-back','week-pause','week-resume','week-unlock','card','drink-choice','clear','child','parent','nav','lock','stop-record','print-board','start-guide','guide-next','guide-back','guide-home','open-task','demo-next','demo-back','pause-guide','resume-guide','end-guide','break-duration','toggle-timer','reset-timer','child-practice','toggle-menu','garden','plant','reset-garden'];if(state.busy&&!nonmutating.includes(b.dataset.action))return;const mutateAction=!nonmutating.includes(b.dataset.action);if(mutateAction){state.busy=true;b.disabled=true;}try{await handleAction(b);}catch{announce(t('saveFail'));}finally{if(mutateAction){state.busy=false;b.disabled=false;}}});
root.addEventListener('change',async event=>{const target=event.target;if(target.id==='drink-audio'){state.drinkAudio=target.checked;if(!target.checked)stopPlayback();return;}
 if(target.id==='locale'){stopPlayback();cancelRecording();state.recording=null;state.locale=target.value;state.selected=null;announce('');render();return;}
 if(target.id==='day-select'){state.day=Number(target.value);render();return;}
 if(target.id==='mic-consent'){state.micConsent=target.checked;render();return;}
 if(target.dataset.complete&&state.data){if(state.busy){render();return;}state.busy=true;try{await mutate(d=>{d.completed[target.dataset.complete]=target.checked;});render();announce(t('saved'));}catch{render();announce(t('saveFail'));}finally{state.busy=false;}}
});
root.addEventListener('submit',async event=>{
 event.preventDefault();if(state.busy)return;state.busy=true;const form=event.target;const f=new FormData(form);const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=true;
 try{
 if(form.id==='protection-form'||form.id==='portable-backup-form'){
  if(!state.key)throw Error('LOCKED');const pass=String(f.get('passphrase'));if(pass.length<12||pass!==f.get('confirm')){announce(t('passMismatch'));return;}
  const salt=crypto.getRandomValues(new Uint8Array(16)),key=await deriveKey(pass,salt),envelope=await seal(state.data,key,salt);
  if(form.id==='portable-backup-form'){download('asma.vault.json',envelope);form.reset?.();announce(t('saved'));}
  else{const saved=await writeVault(envelope,state.revision,null);state.revision=saved.revision;state.key=key;state.salt=salt;state.autoAccess=false;state.deviceOnly=false;resetTimer();render(true);}
 }else if(form.id.startsWith('week-')){
  if(state.weekPersistent&&!state.key){state.resumeWeek=true;state.page='privacy';render(true);announce(t('returnUnlock'));return;}
  if(form.id==='week-setup'){await changeWeek(w=>({...w,profile:{role:String(f.get('role')),communication:String(f.get('communication')),interest:String(f.get('interest'))}}));state.weekScreen=weekStatus(currentWeek(),localDate()).kind==='review'?'review':'activity';}
  else {const outcome=String(f.get('outcome'));if(!OUTCOMES.includes(outcome))throw Error('OUTCOME');
   if(form.id==='week-review'){await changeWeek(w=>({...w,reviews:[...w.reviews,{day:state.weekDay-1,date:localDate(),outcome}]}));state.weekOutcome=outcome;state.weekScreen='decision';}
   else if(form.id==='week-finish'){await changeWeek(w=>finishSession(w,state.weekDay,localDate(),outcome));state.page='dashboard';}
  }render(true);
 }else if(form.id==='vault-form'){
  const authSession=session;const pass=String(f.get('passphrase'));if(!state.exists&&(pass.length<12||pass!==f.get('confirm')||!f.get('consent'))){announce(t('passMismatch'));return;}
  let opened;if(state.exists){try{const envelope=await readVault();opened=await openEnvelope(envelope,pass);opened.revision=envelope.revision;opened.deviceOnly=false;if(!validateData(opened.data))throw Error();}catch{announce(t('badPass'));return;}}
  else{const salt=crypto.getRandomValues(new Uint8Array(16));opened={data:initialData(state.locale),key:await deriveKey(pass,salt),salt};if(guestWeek.profile||guestWeek.daily||guestWeek.sessions.length)opened.data.week=structuredClone(guestWeek);const saved=await writeVault(await seal(opened.data,opened.key,salt));opened.revision=saved.revision;}
  if(authSession!==session){render();return;}
  const access=f.has('rememberDevice')?{key:opened.key,salt:encode64(opened.salt)}:null;
  const remembered=await writeVault(await seal(opened.data,opened.key,opened.salt),opened.revision,access);opened.revision=remembered.revision;
  state.autoAccess=!!access;state.deviceOnly=false;
  guestWeek=emptyWeek();state.weekPreview=false;state.exists=true;if(authSession!==session){render();return;}session++;state.revision=opened.revision;state.data=opened.data;state.key=opened.key;state.salt=opened.salt;state.exists=true;state.day=planDay(state.data.startDate);if(state.resumeTouch){state.page=state.resumeTouch;state.resumeTouch=null;state.weekPersistent=true;}else if(state.resumeWeek){state.page='week';state.resumeWeek=false;state.weekPersistent=true;}else if(state.resumeGuide){state.page='day-one';state.guideStep=lessons[state.locale][0].steps.length;state.resumeGuide=false;}else if(state.page==='privacy'){state.page='today';}resetTimer();if(state.data.settings.analytics)await mutate(d=>d.metrics.opens++);render(true);
 }else if(form.id==='restore-form'){
  const file=f.get('backup');if(!file||file.size>100*1024*1024){announce(t('restoreFail'));return;}
  try{const existing=await readVault();const envelope=JSON.parse(await file.text());const restored=await openEnvelope(envelope,String(f.get('passphrase')));if(!validateData(restored.data))throw Error();if(!confirm(t('restoreWarn')))return;const saved=await writeVault(envelope,existing?.revision??null,null);state.revision=saved.revision;state.exists=true;state.autoAccess=false;state.deviceOnly=false;state.deviceKeyMissing=false;lock();announce(t('saved'));}catch{announce(t('restoreFail'));}
 }else if(!state.key){announce(t('returnUnlock'));return;}
 else if(form.id==='observation-form'){const o={id:crypto.randomUUID(),date:f.get('date'),skill:f.get('skill'),context:f.get('context'),support:f.get('support'),notes:String(f.get('notes')).trim(),createdAt:new Date().toISOString(),contentVersion:CONTENT_VERSION};if(!validateObservation(o)||o.date>localDate())throw Error();await mutate(d=>d.observations.push(o));render();announce(t('saved'));}
 else if(form.dataset.checkpoint){await mutate(d=>{d.checkpoints[form.dataset.checkpoint]={date:localDate(),notes:String(f.get('notes')).trim(),contentVersion:CONTENT_VERSION};});render();announce(t('reviewSaved'));}
 else if(form.id==='settings-form'){await mutate(d=>{d.startDate=String(f.get('startDate'));d.locale=state.locale;d.settings={tts:f.has('tts'),analytics:f.has('analytics')};if(!d.settings.analytics)d.metrics={opens:0,errors:0};});render();announce(t('saved'));}
 }catch{announce(t('saveFail'));}finally{state.busy=false;if(submit)submit.disabled=false;}
});
for(const event of ['pointerdown','keydown'])document.addEventListener(event,resetTimer,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelRecording();stopPlayback();if(!state.autoAccess)lock();}});
let dashboardDate=localDate();
setInterval(()=>{const date=localDate();if(date!==dashboardDate){dashboardDate=date;if(weekContent[state.locale]&&state.role==='parent'&&['dashboard','today'].includes(state.page))render();}},30000);
window.addEventListener('pagehide',()=>{cancelRecording();stopPlayback();if(!state.autoAccess)lock();});
window.addEventListener('online',()=>render());window.addEventListener('offline',()=>render());
async function fetchJSON(path){const r=await fetch(path);if(!r.ok)throw Error('LOAD_FAILED');return r.json();}
async function boot(){
 try{
 const all=await Promise.all([fetchJSON('./src/locales/en-US.json'),fetchJSON('./src/locales/fa-AF.json'),fetchJSON('./content/lessons.en-US.json'),fetchJSON('./content/lessons.fa-AF.json'),fetchJSON('./content/qa.en-US.json'),fetchJSON('./content/qa.fa-AF.json'),fetchJSON('./content/cards.json'),fetchJSON('./content/sources.json'),fetchJSON('./content/review.json'),fetchJSON('./content/voices.json'),fetchJSON('./content/week.en-US.json'),fetchJSON('./content/week.fa-AF.json'),fetchJSON('./content/touch-activities.json')]);
 [dictionaries['en-US'],dictionaries['fa-AF'],lessons['en-US'],lessons['fa-AF'],questions['en-US'],questions['fa-AF'],cards,sources,review,voices,weekContent['en-US'],weekContent['fa-AF'],touchItems]=all;
 try{if(!crypto.subtle||!globalThis.indexedDB)throw Error();const envelope=await readVault();state.exists=!!envelope;
  if(envelope){state.deviceKeyMissing=envelope.kdf==='device-key';const access=await readDeviceAccess();if(access?.salt===envelope.salt){try{const opened=await openWithKey(envelope,access.key);if(!validateData(opened.data))throw Error('INVALID_STATE');Object.assign(state,{data:opened.data,key:opened.key,salt:opened.salt,revision:envelope.revision,autoAccess:true,deviceKeyMissing:false,deviceOnly:envelope.kdf==='device-key',locale:opened.data.locale});}catch{announce(t('badPass'));}}}}catch{state.storage=false;}
 render();if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;state.offlineReady=true;render();}catch{announce(t('offlineWait'));}}
 }catch{root.textContent='Unable to load. Connect once and reload. / برنامه باز نشد. به اینترنت وصل شوید و دوباره کوشش کنید.';}
}
boot();
