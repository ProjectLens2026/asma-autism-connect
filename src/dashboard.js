// Dashboard navigation uses native buttons: touch, pointer and keyboard share one path.
export function dashboardTarget(dataset, currentDay) {
  const requested=Number(dataset.day);
  return {page:dataset.page,day:Number.isInteger(requested)&&requested>=1&&requested<=180?requested:currentDay,checkpoint:['3','6'].includes(dataset.checkpoint)?dataset.checkpoint:null};
}
export function renderDashboard({t,e,btn,day,done,observations,recordings,reviewDate,lessonHTML}) {
  function tile({title,description,icon,page,action='nav',extra='',value='',label='openSection'}) {
    return `<button type="button" class="dashboard-tile" data-action="${action}" ${page?`data-page="${page}"`:''} ${extra}><span class="tile-top"><span class="tile-icon" aria-hidden="true">${icon}</span>${value!==''?`<span class="tile-value">${e(value)}</span>`:''}</span><strong>${e(t(title))}</strong><span class="tile-description">${e(t(description))}</span><span class="tile-link">${e(t(label))}<span aria-hidden="true">↗</span></span></button>`;
  }
  return `<section class="hero"><span class="eyebrow">${e(t('day'))} ${day} · ${e(t('localOnly'))}</span><h1 tabindex="-1">${e(t('welcome'))}</h1><p>${e(t('intro'))}</p><div class="dashboard-hero-actions">${btn(t('openLesson'),'nav',`data-page="journey" data-day="${day}"`)}${btn(t('openBoard'),'child','','secondary')}</div><div class="hero-art" aria-hidden="true">✦<span>✧</span></div></section>
  <section aria-label="${e(t('quickActions'))}"><h2>${e(t('quickActions'))}</h2><div class="dashboard-actions">
  ${tile({title:'journey',description:'lessonActionHint',icon:'▤',page:'journey',extra:`data-day="${day}"`,value:`${t('day')} ${day}`})}
  ${tile({title:'child',description:'boardActionHint',icon:'▦',action:'child',label:'openBoard'})}
  ${tile({title:'observe',description:'observeActionHint',icon:'✎',page:'observe',value:observations})}
  ${tile({title:'voice',description:'voiceActionHint',icon:'♬',page:'voice',value:`${recordings}/12`})}
  ${tile({title:'qa',description:'qaActionHint',icon:'?',page:'qa'})}
  ${tile({title:'progress',description:'progressActionHint',icon:'↗',page:'progress',value:`${done}/180`})}
  </div></section>
  <div class="columns"><div class="stack">${lessonHTML}<section class="card"><h2>${e(t('routine'))}</h2><p>${e(t('promise'))}</p>${btn(t('qa'),'nav','data-page="qa"','secondary')}</section></div><aside class="stack">
  ${tile({title:'review3',description:'checkpointIntro',icon:'◷',page:'progress',extra:'data-checkpoint="3"',value:reviewDate,label:'openReview'})}
  ${tile({title:'review6',description:'checkpointActionHint',icon:'◷',page:'progress',extra:'data-checkpoint="6"',label:'openReview'})}
  ${tile({title:'sources',description:'draft',icon:'⌘',page:'sources',label:'viewReviewStatus'})}
  </aside></div>`;
}
