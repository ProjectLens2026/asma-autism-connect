import {validDrink} from './drink.js';
import {validWeek} from './week.js';
export const LOCALES = ['en-US', 'fa-AF'];
export const APP_VERSION = '0.1.10';
export const CONTENT_VERSION = '0.1.2';
export const CONSENT_VERSION = '1.0';
export const CARD_IDS=['water','food','help','stop','toilet','pain','more','yes','no','break','happy','together'];
export const MAX_CLIP_BYTES = 2 * 1024 * 1024;
export function localeDirection(locale) { return locale === 'fa-AF' ? 'rtl' : 'ltr'; }
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function addMonths(date, count) {
  const [y,m,d] = date.split('-').map(Number);
  const end = new Date(Date.UTC(y,m-1+count+1,0)).getUTCDate();
  return new Date(Date.UTC(y,m-1+count,Math.min(d,end))).toISOString().slice(0,10);
}
export function planDay(start, today = localDate()) {
  return Math.max(1, Math.min(180, Math.floor((Date.parse(today)-Date.parse(start))/86400000)+1));
}
export function lessonForDay(day, lessons) { return lessons[(Math.max(1,Math.min(180,day))-1)%lessons.length]; }
export function initialData(locale) {
  return {schema:1,locale,startDate:localDate(),consent:{version:CONSENT_VERSION,acceptedAt:new Date().toISOString()},completed:{},observations:[],checkpoints:{},clips:{},settings:{tts:false,analytics:false},metrics:{opens:0,errors:0}};
}
export function validDate(v) { return typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v; }
export function validateObservation(o) {
  return o && validDate(o.date) && ['request','refuse','discomfort'].includes(o.skill) && ['home','play','community'].includes(o.context) && ['independent','modelled','notObserved'].includes(o.support) && typeof o.notes==='string' && o.notes.length<=500;
}
export function validateData(d) {
  if (!d || Array.isArray(d) || d.schema!==1 || !LOCALES.includes(d.locale) || !validDate(d.startDate) || d.consent?.version!==CONSENT_VERSION || !d.consent.acceptedAt) return false;
  if (!Array.isArray(d.observations) || !d.observations.every(validateObservation) || !d.completed || !d.checkpoints || !d.clips || !d.settings || !d.metrics) return false;
  if ([d.completed,d.checkpoints,d.clips,d.settings,d.metrics].some(v=>Array.isArray(v)||typeof v!=='object')) return false;
  if (Object.keys(d.clips).length>24 || !['opens','errors'].every(k=>Number.isSafeInteger(d.metrics[k])&&d.metrics[k]>=0)) return false;
  if (!Object.entries(d.completed).every(([k,v])=>/^\d{1,3}$/.test(k)&&Number(k)>=1&&Number(k)<=180&&typeof v==='boolean')) return false;
  if (!Object.entries(d.checkpoints).every(([k,v])=>['3','6'].includes(k)&&typeof v.notes==='string'&&v.notes.length<=1000&&validDate(v.date))) return false;
  if (!Object.entries(d.clips).every(([k,v])=>/^(fa-AF|en-US):[a-z]+$/.test(k)&&CARD_IDS.includes(k.split(':')[1])&&['draft','approved'].includes(v.status)&&typeof v.base64==='string'&&v.base64.length<MAX_CLIP_BYTES*1.4&&/^audio\/(webm|mp4|ogg|mpeg|wav)(;.*)?$/.test(v.mime))) return false;
  if(!validDrink(d.drink,validDate))return false;
  if(d.week!==undefined&&!validWeek(d.week,validDate))return false;
  return ['tts','analytics'].every(k=>typeof d.settings[k]==='boolean');
}
export function progressReport(d) {
  return {reportType:'caregiver-functional-observations-not-clinical-assessment',appVersion:APP_VERSION,contentVersion:CONTENT_VERSION,contentReview:'draft-unreviewed',exportedAt:new Date().toISOString(),locale:d.locale,startDate:d.startDate,caregiverActivities:d.completed,learningWeek:d.week||null,myDrink:d.drink||null,observations:d.observations,checkpoints:d.checkpoints};
}
export function englishVoice(voices) { return voices.find(v=>v.lang.toLowerCase()==='en-us' && v.localService) || null; }
export function playableClip(clips,locale,id) { const c=clips?.[`${locale}:${id}`]; return c?.status==='approved'?c:null; }
export function safeText(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
