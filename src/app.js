import {renderDashboard,dashboardTarget} from './dashboard.js';
import {LOCALES,APP_VERSION,CONTENT_VERSION,localeDirection,localDate,addMonths,planDay,lessonForDay,initialData,validateData,validateObservation,progressReport,safeText as e} from './domain.js';
import {deriveKey,seal,openEnvelope} from './crypto.js';
import {readVault,writeVault,eraseVault} from './storage.js';
import {speakCard,playBlob,stopPlayback,cancelRecording,finishRecording,recordClip} from './audio.js';
const root=document.querySelector('#app'),status=document.querySelector('#status');
const state={locale:'fa-AF',page:'today',role:'parent',data:null,key:null,salt:null,exists:false,revision:null,storage:true,day:1,selected:null,recording:null,micConsent:false,heard:new Set(),busy:false,offlineReady:false};
let dictionaries={},lessons={},questions={},cards=[],sources=[],review={},voices={},lockTimer,session=0;
const nav=[['today','◉'],['journey','▤'],['qa','?'],['observe','✎'],['progress','↗'],['voice','♬'],['sources','⌘'],['privacy','◇']];
const t=k=>dictionaries[state.locale]?.[k]||k;
const btn=(label,action,extra='',cls='button')=>`<button class="${cls}" data-action="${action}" ${extra}>${e(label)}</button>`;
const head=(title,description)=>`<div class="pagehead"><span class="eyebrow">${e(t('parent'))}</span><h1 tabindex="-1">${e(title)}</h1><p>${e(description)}</p></div>`;
function announce(message){status.textContent=message;}
function resetTimer(){clearTimeout(lockTimer);if(state.key)lockTimer=setTimeout(()=>lock(),300000);}
function lock(){session++;cancelRecording();stopPlayback();state.recording=null;state.micConsent=false;state.heard.clear();state.data=null;state.key=null;state.salt=null;clearTimeout(lockTimer);render();}
async function commit(next) {
 if(!state.key||!validateData(next))throw Error('INVALID_STATE');
 const token=session,key=state.key,salt=state.salt;
 const envelope=await seal(next,key,salt);const saved=await writeVault(envelope,state.revision);
 if(session===token){state.data=next;state.exists=true;state.revision=saved.revision;}return session===token;
}
async function mutate(change){const next=structuredClone(state.data);change(next);await commit(next);}
function download(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function summaryBadge(){return `<span class="badge warning">${e(t('draft'))}</span>`;}
function render(focus=false){
 document.title=t('brand');document.documentElement.lang=state.locale;document.documentElement.dir=localeDirection(state.locale);
 const child=state.role==='child';
 root.innerHTML=`<div class="shell ${child?'child-shell':''}">${child?'':`<aside class="sidebar"><a class="brand" href="#main"><span class="brandmark">✦</span><span>${e(t('brand'))}<small>${e(t('tagline'))}</small></span></a><nav aria-label="${e(t('parent'))}">${nav.map(([id,icon])=>`<button data-action="nav" data-page="${id}" class="navitem ${state.page===id?'active':''}" ${state.page===id?'aria-current="page"':''}><span aria-hidden="true">${icon}</span>${e(t(id))}</button>`).join('')}</nav><div class="side-note"><b>${e(t('localOnly'))}</b><p>${e(t('promise'))}</p><span>v${APP_VERSION}</span></div></aside>`}
 <div class="workspace"><header><span class="breadcrumb">${e(t('brand'))} <span>/ ${e(t(child?'child':state.page))}</span></span><div class="toolbar"><label class="sr" for="locale">Language / زبان</label><select id="locale" ${state.recording?'disabled':''}>${LOCALES.map(l=>`<option value="${l}" ${l===state.locale?'selected':''}>${l==='fa-AF'?'دری افغانستان':'English (US)'}</option>`).join('')}</select>${child?btn(t('back'),'parent','','secondary'):btn(t('child'),'child','','secondary')}${!child&&state.key?btn(t('lock'),'lock','','quiet'):''}</div></header>
 <main id="main">${child?board():parentContent()}</main><footer>${e(t('pilot'))} · ${e(t(navigator.onLine?'online':'offline'))}<br>${e(t(state.offlineReady?'offlineReady':'offlineWait'))}</footer></div></div>`;
 if(focus)root.querySelector('h1')?.focus();
}
function gate(){return `${head(t('welcome'),t('intro'))}<div class="columns"><section class="card"><h2>${e(t(state.exists?'locked':'setup'))}</h2><p>${e(t('consentInfo'))}</p>${state.storage?`<form id="vault-form"><label>${e(t('passphrase'))}<input name="passphrase" type="password" minlength="12" required autocomplete="${state.exists?'current-password':'new-password'}"></label>${state.exists?'':`<label>${e(t('confirmPass'))}<input name="confirm" type="password" minlength="12" required autocomplete="new-password"></label><label class="check"><input type="checkbox" name="consent" required><span>${e(t('consent'))}</span></label>`}<button class="button" type="submit">${e(t(state.exists?'unlock':'continue'))}</button></form>`:`<p role="alert">${e(t('unsupported'))}</p>`}<p>${e(t('logoutNote'))}</p>${btn(t('demo'),'child','','secondary')}</section><aside class="stack"><section class="card tint"><h2>${e(t('choose'))}</h2><div class="mini-pictures">${cards.slice(0,3).map(c=>`<img src="${c.image}" alt="${e(c.labels[state.locale])}">`).join('')}</div><p>${e(t('promise'))}</p></section><section class="card">${summaryBadge()}<p>${e(t('nativePending'))}</p>${state.storage?restoreForm():''}</section></aside></div>`;}
function parentContent(){if(state.page==='sources')return evidence();if(!state.data)return gate();return ({today:today,journey:journey,qa:qa,observe:observations,progress:progress,voice:voice,privacy:privacy})[state.page]();}
function lessonCard(day){const l=lessonForDay(day,lessons[state.locale]);return `<article class="card lesson"><div class="row"><span class="eyebrow">${e(t('day'))} ${day} / 180</span><span class="badge">${l.minutes} ${e(t('minutes'))}</span></div><h2>${e(l.title)}</h2><p class="lesson-body">${e(l.body)}</p><p class="soft">${e(t('pause'))}</p><label class="check"><input type="checkbox" data-complete="${day}" ${state.data.completed[day]?'checked':''}><span>${e(t('done'))}</span></label><div class="cardfoot"><span>${l.id} · v${l.version} · ${e(t('draft'))}</span><span>${l.sourceIds.join(' / ')}</span></div></article>`;}
function today(){
 const day=planDay(state.data.startDate);
 return renderDashboard({t,e,btn,day,done:Object.values(state.data.completed).filter(Boolean).length,
 observations:state.data.observations.length,
 recordings:Object.entries(state.data.clips).filter(([k,v])=>k.startsWith(state.locale+':')&&v.status==='approved').length,
 reviewDate:addMonths(state.data.startDate,3),lessonHTML:lessonCard(day)});
}
function journey(){return `${head(t('journey'),t('flexible'))}<div class="card"><label for="day-select">${e(t('day'))}</label><select id="day-select">${Array.from({length:180},(_,i)=>`<option value="${i+1}" ${state.day===i+1?'selected':''}>${i+1} · ${e(lessonForDay(i+1,lessons[state.locale]).title)}</option>`).join('')}</select><p>${e(t('repeat'))}</p></div>${lessonCard(state.day)}`;}
function board(){return `${head(t('choose'),t('boardIntro'))}<div class="board-result" aria-live="polite" aria-atomic="true">${state.selected?e(cards.find(c=>c.id===state.selected).labels[state.locale]):e(t('tagline'))}</div><div class="picture-grid">${cards.map(c=>`<button class="picture ${state.selected===c.id?'chosen':''}" data-action="card" data-id="${c.id}" aria-pressed="${state.selected===c.id}"><img src="${c.image}" alt="" draggable="false"><span>${e(c.labels[state.locale])}</span></button>`).join('')}</div><div class="row board-tools">${btn(t('clear'),'clear','','quiet')}${btn(t('printBoard'),'print-board','','quiet')}</div>`;}
function qa(){return `${head(t('qa'),t('qaIntro'))}<div class="notice">${e(t('education'))}</div><div class="stack">${questions[state.locale].map(q=>`<details class="card"><summary><bdi>${q.id}</bdi> · ${e(q.question)}</summary><p>${e(q.answer)}</p><small>v${q.version} · ${q.sourceIds.join(', ')} · ${e(t('draft'))}</small></details>`).join('')}</div>`;}
function options(name,values){return `<label>${e(t(name))}<select name="${name}">${values.map(v=>`<option value="${v}">${e(t(v))}</option>`).join('')}</select></label>`;}
function observationList(){return state.data.observations.length?`<div class="record-list">${[...state.data.observations].reverse().map(o=>`<article class="record"><div><b>${e(t(o.skill))} · ${e(t(o.support))}</b><p><bdi>${e(o.date)}</bdi> · ${e(t(o.context))}</p><p class="user-text" dir="auto">${e(o.notes)}</p></div>${btn(t('delete'),'delete-observation',`data-id="${e(o.id)}"`,'quiet')}</article>`).join('')}</div>`:`<p>${e(t('noRecords'))}</p>`;}
function observations(){return `${head(t('observe'),t('observationsIntro'))}<div class="columns"><section class="card"><form id="observation-form"><label>${e(t('date'))}<input type="date" name="date" value="${localDate()}" max="${localDate()}" required></label>${options('skill',['request','refuse','discomfort'])}${options('context',['home','play','community'])}${options('support',['independent','modelled','notObserved'])}<label>${e(t('notes'))}<textarea name="notes" maxlength="500" rows="3" dir="auto"></textarea></label><button type="submit" class="button">${e(t('save'))}</button></form></section><section class="card"><h2>${e(t('observe'))}</h2>${observationList()}</section></div>`;}
function progress(){return `${head(t('progress'),t('checkpointIntro'))}<div class="row export-tools">${btn(t('export'),'export')}${btn(t('print'),'print-progress','','secondary')}</div><p class="notice export-tools">${e(t('exportWarn'))}</p><div class="columns">${[3,6].map(m=>`<section class="card"><h2>${e(t('review'+m))}</h2><p>${e(t('due'))}: <bdi>${addMonths(state.data.startDate,m)}</bdi></p><form data-checkpoint="${m}"><label>${e(t('reviewPrompt'))}<textarea name="notes" maxlength="1000" rows="5" dir="auto">${e(state.data.checkpoints[m]?.notes||'')}</textarea></label><button type="submit" class="button">${e(t('save'))}</button></form>${state.data.checkpoints[m]?`<p>${e(t('date'))}: ${e(state.data.checkpoints[m].date)}</p>`:''}</section>`).join('')}</div><section class="card"><h2>${e(t('observe'))}</h2>${observationList()}</section><p>${e(t('notScore'))} · v${CONTENT_VERSION} · ${e(t('draft'))}</p>`;}
function voice(){return `${head(t('voice'),t('voiceIntro'))}<p class="notice">${e(t('nativePending'))}</p><section class="card"><label class="check"><input id="mic-consent" type="checkbox" ${state.micConsent?'checked':''} ${state.recording?'disabled':''}><span>${e(t('micConsent'))}</span></label><div class="voice-list">${cards.map(c=>{const clip=state.data.clips[`${state.locale}:${c.id}`];return `<article class="voice-row"><img src="${c.image}" alt=""><div><b>${e(c.labels[state.locale])}</b><small>${e(t(clip?(clip.status==='approved'?'approved':'pending'):'missing'))}</small></div><div class="voice-actions">${state.recording===c.id?btn(t('stopRecord'),'stop-record'):btn(t('record'),'record',`data-id="${c.id}" ${!state.micConsent||state.recording?'disabled':''}`,'secondary')}${clip?`${btn(t('listen'),'listen',`data-id="${c.id}"`,'quiet')}${clip.status==='draft'?btn(t('approve'),'approve',`data-id="${c.id}" ${state.heard.has(`${state.locale}:${c.id}`)?'':'disabled'}`,'quiet'):''}${btn(t('delete'),'delete-clip',`data-id="${c.id}"`,'quiet')}`:''}</div></article>`;}).join('')}</div></section>`;}
function evidence(){return `${head(t('sources'),t('scopeNote'))}<section class="card">${summaryBadge()}<dl><dt>${e(t('version'))}</dt><dd>${e(review.version)}</dd><dt>${e(t('reviewer'))}</dt><dd>${e(review.clinicalReviewer||t('none'))}</dd><dt>${e(t('checked'))}</dt><dd>${e(review.updated)}</dd></dl><p class="notice">${e(t('ageNote'))}</p></section><div class="stack">${sources.map(s=>`<article class="card"><h2><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a></h2><p>${e(s.scope[state.locale])}</p><p>${e(t('checked'))}: ${s.accessed} · ${e(t('reviewer'))}: ${e(t('none'))}</p></article>`).join('')}</div>`;}
function restoreForm(){return `<details><summary>${e(t('restore'))}</summary><p>${e(t('restoreWarn'))}</p><form id="restore-form"><label>${e(t('restore'))}<input type="file" name="backup" accept=".json,application/json" required></label><label>${e(t('passphrase'))}<input name="passphrase" type="password" required autocomplete="off"></label><button class="secondary" type="submit">${e(t('restore'))}</button></form></details>`;}
function privacy(){return `${head(t('privacyTitle'),t('consentInfo'))}<div class="columns"><section class="card"><form id="settings-form"><label>${e(t('startDate'))}<input name="startDate" type="date" value="${state.data.startDate}" max="${localDate()}" required></label><label class="check"><input name="tts" type="checkbox" ${state.data.settings.tts?'checked':''}><span>${e(t('tts'))}</span></label><p>${e(t('ttsInfo'))}</p><label class="check"><input name="analytics" type="checkbox" ${state.data.settings.analytics?'checked':''}><span>${e(t('analytics'))}</span></label><p>${e(t('analyticsInfo'))}</p><button class="button" type="submit">${e(t('save'))}</button></form><p>${e(t('logoutNote'))}</p>${btn(t('lock'),'lock','','quiet')}</section><section class="card stack"><h2>${e(t('privacy'))}</h2>${btn(t('backup'),'backup','','secondary')}${restoreForm()}${btn(t('storage'),'storage','','secondary')}<p>${e(t('install'))}</p><hr>${btn(t('erase'),'erase','','danger')}</section></div>`;}
async function handleAction(button){const action=button.dataset.action,id=button.dataset.id;
 if(action==='lock'){lock();return;}
 if(action==='child'){announce('');cancelRecording();state.recording=null;state.role='child';state.selected=null;render(true);return;}
 if(action==='parent'){state.role='parent';state.page='today';lock();return;}
 if(action==='nav'){announce('');stopPlayback();cancelRecording();state.recording=null;const target=dashboardTarget(button.dataset,state.data?planDay(state.data.startDate):1);state.page=target.page;state.day=target.day;render(true);if(target.checkpoint)root.querySelector(`[data-checkpoint="${target.checkpoint}"] textarea`)?.focus();return;}
 if(action==='card'){state.selected=id;const token=session;const locale=state.locale;render();root.querySelector(`[data-action="card"][data-id="${id}"]`)?.focus();try{const played=await speakCard(cards.find(c=>c.id===id),locale,state.data,voices.assets);if(!played&&token===session&&state.selected===id)announce(t('noAudio'));}catch{announce(t('audioFail'));}return;}
 if(action==='clear'){state.selected=null;stopPlayback();render();return;}
 if(action==='print-board'){window.print();return;}
 if(!state.key){announce(t('returnUnlock'));return;}
 if(action==='export'){if(confirm(t('exportConfirm')))download('asma-progress.json',progressReport(state.data));}
 if(action==='print-progress'){if(confirm(t('exportConfirm')))window.print();}
 if(action==='backup')download('asma.vault.json',await readVault());
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
 if(action==='erase'&&confirm(t('eraseConfirm'))){await eraseVault(state.revision);state.exists=false;state.revision=null;lock();}
}
root.addEventListener('click',async event=>{const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;const nonmutating=['card','clear','child','parent','nav','lock','stop-record','print-board'];if(state.busy&&!nonmutating.includes(b.dataset.action))return;const mutateAction=!nonmutating.includes(b.dataset.action);if(mutateAction){state.busy=true;b.disabled=true;}try{await handleAction(b);}catch{announce(t('saveFail'));}finally{if(mutateAction){state.busy=false;b.disabled=false;}}});
root.addEventListener('change',async event=>{const target=event.target;
 if(target.id==='locale'){stopPlayback();cancelRecording();state.recording=null;state.locale=target.value;state.selected=null;announce('');render();return;}
 if(target.id==='day-select'){state.day=Number(target.value);render();return;}
 if(target.id==='mic-consent'){state.micConsent=target.checked;render();return;}
 if(target.dataset.complete&&state.data){if(state.busy){render();return;}state.busy=true;try{await mutate(d=>{d.completed[target.dataset.complete]=target.checked;});render();announce(t('saved'));}catch{render();announce(t('saveFail'));}finally{state.busy=false;}}
});
root.addEventListener('submit',async event=>{
 event.preventDefault();if(state.busy)return;state.busy=true;const form=event.target;const f=new FormData(form);const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=true;
 try{
 if(form.id==='vault-form'){
  const authSession=session;const pass=String(f.get('passphrase'));if(!state.exists&&(pass.length<12||pass!==f.get('confirm')||!f.get('consent'))){announce(t('passMismatch'));return;}
  let opened;if(state.exists){try{const envelope=await readVault();opened=await openEnvelope(envelope,pass);opened.revision=envelope.revision;if(!validateData(opened.data))throw Error();}catch{announce(t('badPass'));return;}}
  else{const salt=crypto.getRandomValues(new Uint8Array(16));opened={data:initialData(state.locale),key:await deriveKey(pass,salt),salt};const saved=await writeVault(await seal(opened.data,opened.key,salt));opened.revision=saved.revision;}
  state.exists=true;if(authSession!==session){render();return;}session++;state.revision=opened.revision;state.data=opened.data;state.key=opened.key;state.salt=opened.salt;state.exists=true;state.day=planDay(state.data.startDate);resetTimer();if(state.data.settings.analytics)await mutate(d=>d.metrics.opens++);render(true);
 }else if(form.id==='restore-form'){
  const file=f.get('backup');if(!file||file.size>100*1024*1024){announce(t('restoreFail'));return;}
  try{const existing=await readVault();const envelope=JSON.parse(await file.text());const restored=await openEnvelope(envelope,String(f.get('passphrase')));if(!validateData(restored.data))throw Error();if(!confirm(t('restoreWarn')))return;const saved=await writeVault(envelope,existing?.revision??null);state.revision=saved.revision;state.exists=true;lock();announce(t('saved'));}catch{announce(t('restoreFail'));}
 }else if(!state.key){announce(t('returnUnlock'));return;}
 else if(form.id==='observation-form'){const o={id:crypto.randomUUID(),date:f.get('date'),skill:f.get('skill'),context:f.get('context'),support:f.get('support'),notes:String(f.get('notes')).trim(),createdAt:new Date().toISOString(),contentVersion:CONTENT_VERSION};if(!validateObservation(o)||o.date>localDate())throw Error();await mutate(d=>d.observations.push(o));render();announce(t('saved'));}
 else if(form.dataset.checkpoint){await mutate(d=>{d.checkpoints[form.dataset.checkpoint]={date:localDate(),notes:String(f.get('notes')).trim(),contentVersion:CONTENT_VERSION};});render();announce(t('reviewSaved'));}
 else if(form.id==='settings-form'){await mutate(d=>{d.startDate=String(f.get('startDate'));d.locale=state.locale;d.settings={tts:f.has('tts'),analytics:f.has('analytics')};if(!d.settings.analytics)d.metrics={opens:0,errors:0};});render();announce(t('saved'));}
 }catch{announce(t('saveFail'));}finally{state.busy=false;if(submit)submit.disabled=false;}
});
for(const event of ['pointerdown','keydown'])document.addEventListener(event,resetTimer,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock();});
window.addEventListener('pagehide',()=>lock());
window.addEventListener('online',()=>render());window.addEventListener('offline',()=>render());
async function fetchJSON(path){const r=await fetch(path);if(!r.ok)throw Error('LOAD_FAILED');return r.json();}
async function boot(){
 try{
 const all=await Promise.all([fetchJSON('./src/locales/en-US.json'),fetchJSON('./src/locales/fa-AF.json'),fetchJSON('./content/lessons.en-US.json'),fetchJSON('./content/lessons.fa-AF.json'),fetchJSON('./content/qa.en-US.json'),fetchJSON('./content/qa.fa-AF.json'),fetchJSON('./content/cards.json'),fetchJSON('./content/sources.json'),fetchJSON('./content/review.json'),fetchJSON('./content/voices.json')]);
 [dictionaries['en-US'],dictionaries['fa-AF'],lessons['en-US'],lessons['fa-AF'],questions['en-US'],questions['fa-AF'],cards,sources,review,voices]=all;
 try{if(!crypto.subtle||!globalThis.indexedDB)throw Error();state.exists=Boolean(await readVault());}catch{state.storage=false;}
 render();if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;state.offlineReady=true;render();}catch{announce(t('offlineWait'));}}
 }catch{root.textContent='Unable to load. Connect once and reload. / برنامه باز نشد. به اینترنت وصل شوید و دوباره کوشش کنید.';}
}
boot();
