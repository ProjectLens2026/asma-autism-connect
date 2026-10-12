// Illustrated caregiver demonstration. Public content; no child performance score.
export function nextGuideStep(step, delta, count){return Math.max(0,Math.min(count,step+delta));}
export function sceneSVG(scene, note=''){
 const name=scene==='choice'?'choice':scene==='rest'||scene==='model'?'break':'together';
 return `<figure class="lesson-photo"><img class="story-scene" src="./public/photos/${name}.webp" alt=""><figcaption>${note}</figcaption></figure>`;
}

function review({t,e,btn,lesson}){return `<p class="start-review">${lesson.id} · v${e(lesson.version)} · ${e(t('draft'))} · ${btn(t('sources'),'nav','data-page="sources"','quiet')}</p>`;}
export function renderStart({t,e,btn,lesson}){
 return `<section class="start-intro"><span class="eyebrow">${e(t('parent'))} · Autism Connect</span><h1 tabindex="-1">${e(t('startWelcome'))}</h1><p>${e(t('startIntro'))}</p></section>
 <section class="today-path"><div class="today-banner"><div><span class="activity-number">${e(t('day'))} 1</span><h2>${e(t('todayPlan'))}</h2><p>${e(t('dayOneHint'))}</p></div>${btn(t('startActivity'),'start-guide')}</div>
 <ol class="task-path">${lesson.steps.map((s,i)=>`<li><button class="task-entry" data-action="open-task" data-task="${i}"><span class="task-number">${i+1}</span><img src="./public/icons/${e(s.image)}.svg" alt=""><span><strong>${e(s.title)}</strong><small>${s.minutes} ${e(t('minutes'))} · ${e(t('demoTitle'))}</small></span><span aria-hidden="true">↗</span></button>${i<2?`<div class="path-break">☁ ${e(t('breakShort'))}</div>`:''}</li>`).join('')}</ol><p class="timing-note">${e(t('timeNote'))}</p></section>
 <div class="start-shortcuts">${btn(t('childTurn'),'child-practice','','secondary')}${btn(t('openPictures'),'child','','secondary')}${btn(t('privateProgress'),'nav','data-page="privacy"','quiet')}${btn(t('qa'),'nav','data-page="qa"','quiet')}</div><p class="start-review">${e(t('draft'))} · ${btn(t('sources'),'nav','data-page="sources"','quiet')}</p>`;
}
export function renderDayOne({t,e,btn,lesson,step,saved=false,frame=0,breakKind=null,early=false,timerHTML=''}){
 const done=step>=lesson.steps.length,item=lesson.steps[Math.min(step,lesson.steps.length-1)];
 const top=`<div class="guide-top">${btn(t('homeActivity'),'guide-home','','quiet')}<span class="eyebrow">${e(t('day'))} 1 · ${e(t('taskLabel'))} ${Math.min(step+1,3)} / 3</span></div>`;
 if(done)return `<section class="guide">${top}<article class="guide-card">${sceneSVG('rest',e(t('photoNote')))}<h1 tabindex="-1">${e(t('finishTitle'))}</h1><p>${e(t(early?'earlyBody':'finishBody'))}</p><div class="guide-controls">${early?'':saved?`<p role="status">${e(t('savedActivity'))}</p>`:btn(t('saveActivity'),'save-guide')}${btn(t('repeatActivity'),'start-guide','','secondary')}${btn(t('openPictures'),'child','','secondary')}</div><p>${e(t('saveOptional'))}</p></article>${review({t,e,btn,lesson})}</section>`;
 if(breakKind)return `<section class="guide">${top}<article class="guide-card break-card">${sceneSVG('rest',e(t('photoNote')))}<h1 tabindex="-1">${e(t('breakTitle'))}</h1><p>${e(t('breakBody'))}</p><div class="guide-controls">${btn(t('breakShort'),'break-duration','data-seconds="300"','secondary')}${btn(t('breakLong'),'break-duration','data-seconds="600"','secondary')}</div>${timerHTML}<div class="guide-controls">${btn(t('continueReady'),'resume-guide')}${btn(t('endToday'),'end-guide','','secondary')}${btn(t('openPictures'),'child','','quiet')}</div></article></section>`;
 const handoff=frame>=item.demo.length;
 const demo=item.demo[Math.min(frame,item.demo.length-1)];
 return `<section class="guide task-guide focused-guide">${top}<ol class="wizard-track" aria-label="${e(t('todayPlan'))}">${lesson.steps.map((s,i)=>`<li ${i===step?'aria-current="step"':''}><span>${i+1}</span>${e(s.title)}</li>`).join('')}</ol><article class="guide-card"><div class="wizard-kicker">${e(t(handoff?'yourTurn':'followAlong'))} · ${frame+1} / ${item.demo.length+1}</div><h1 tabindex="-1">${e(handoff?t('childTurn'):demo.caption)}</h1>
 ${sceneSVG(handoff?'choice':demo.scene,e(t('photoNote')))}
 ${handoff?`<p class="guide-instruction">${e(t('tryTogether'))}</p>${btn(t('childTurn'),'child-practice')}<p>${e(t('returnHint'))}</p>`:`<div class="caregiver-script"><div><b>${e(t('sayLabel'))}</b><p>${e(demo.say)}</p></div><div><b>${e(t('acceptLabel'))}</b><p>${e(demo.accept)}</p></div></div>`}
 <div class="wizard-next">${handoff?btn(t(step===2?'finishActivity':'readyBreak'),'guide-next'):btn(t('nextInstruction'),'demo-next')}</div>
 <div class="guide-controls session-exits">${frame>0?btn(t('demoBack'),'demo-back','','quiet'):step?btn(t('stepBack'),'guide-back','','quiet'):''}${btn(t('pauseNow'),'pause-guide','','quiet')}${btn(t('endToday'),'end-guide','','quiet')}</div>
 <details class="demo-scope"><summary>${e(t('preparation'))}</summary><p>${e(item.body)}</p><p>${e(t('guideNote'))}</p>${timerHTML}${btn(t('openPictures'),'child','','secondary')}</details></article>${review({t,e,btn,lesson})}</section>`;
}
