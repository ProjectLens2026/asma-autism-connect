// Optional cause-and-effect play, not an assessment. Session-only state.
export const GARDEN_SIZE=6;
export function nextPlant(value){return (value+1)%3;}
export function renderGarden({t,e,btn,plants}){
 const shapes=['🌱','🌷','🌻'];
 return `<section class="garden"><div class="pagehead"><h1 tabindex="-1">${e(t('gardenTitle'))}</h1><p>${e(t('gardenHint'))}</p></div><div class="garden-grid">${Array.from({length:GARDEN_SIZE},(_,i)=>{const value=plants[i]||0;return `<button class="garden-plot" data-action="plant" data-plot="${i}" aria-label="${e(t('gardenSpot'))} ${i+1}: ${e(t('plant'+value))}"><span aria-hidden="true">${shapes[value]}</span><small>${e(t('plant'+value))}</small></button>`;}).join('')}</div><div class="garden-tools">${btn(t('openPictures'),'child','','button')}${btn(t('gardenReset'),'reset-garden','','secondary')}${btn(t('back'),'parent','','quiet')}</div><p class="garden-note">${e(t('gardenNote'))}</p></section>`;
}
