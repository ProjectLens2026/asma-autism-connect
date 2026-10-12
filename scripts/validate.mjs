import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function validateContent(root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),release=false){
 const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
 const errors=[];const assert=(v,m)=>{if(!v)errors.push(m);};
 const locales=['en-US','fa-AF'],cards=await json('content/cards.json'),sources=await json('content/sources.json'),review=await json('content/review.json'),voices=await json('content/voices.json');
 const ui=await Promise.all(locales.map(l=>json(`src/locales/${l}.json`)));
 assert(JSON.stringify(Object.keys(ui[0]).sort())===JSON.stringify(Object.keys(ui[1]).sort()),'UI locale keys differ');
 for(const [i,dict]of ui.entries())for(const [k,v]of Object.entries(dict))assert(typeof v==='string'&&v.trim().length>0,`${locales[i]}: empty ${k}`);
 assert(new Set(cards.map(c=>c.id)).size===cards.length,'Duplicate card IDs');
 for(const c of cards){assert(locales.every(l=>c.labels[l]?.trim()),`Card ${c.id}: missing locale`);assert(/^\.\/public\/icons\/[a-z]+\.svg$/.test(c.image),'Unsafe image path');try{await access(path.join(root,c.image));}catch{errors.push(`Missing image ${c.image}`);}}
 for(const c of cards)if(c.photo){assert(c.photo==='./public/photos/'+c.id+'.webp','Unsafe photo path');try{await access(path.join(root,c.photo));}catch{errors.push('Missing photo '+c.id);}}
 const sourceIds=new Set(sources.map(s=>s.id));for(const s of sources)assert(s.url.startsWith('https://')&&/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)&&locales.every(l=>s.scope[l]),`Incomplete source ${s.id}`);
 let reference={};
 for(const locale of locales)for(const kind of ['lessons','qa']){
  const rows=await json(`content/${kind}.${locale}.json`);assert(rows.length>0,`Empty ${kind}`);assert(new Set(rows.map(r=>r.id)).size===rows.length,`Duplicate ${kind} IDs`);
  if(reference[kind])assert(JSON.stringify(reference[kind])===JSON.stringify(rows.map(r=>r.id)),`Locale ${kind} IDs differ`);else reference[kind]=rows.map(r=>r.id);
  for(const r of rows){assert(r.version===review.version,`Stale version ${r.id}`);assert(['draft','approved'].includes(r.status),`Invalid status ${r.id}`);assert(r.sourceIds.length&&r.sourceIds.every(id=>sourceIds.has(id)),`Unknown source ${r.id}`);for(const k of kind==='qa'?['question','answer']:['title','body'])assert(typeof r[k]==='string'&&r[k].trim(),`Missing text ${r.id}`);if(r.id==='L001'&&kind==='lessons'){assert(Array.isArray(r.steps)&&r.steps.length===3,`Missing Day 1 steps: ${locale}`);for(const step of r.steps||[]){assert(typeof step.title==='string'&&step.title.trim()&&typeof step.body==='string'&&step.body.trim()&&cards.some(c=>c.id===step.image),`Invalid Day 1 step: ${locale}`);assert(step.minutes===3&&Array.isArray(step.demo)&&step.demo.length===3,`Missing demonstration: ${locale}`);for(const frame of step.demo||[])assert(['join','notice','rest','choice','model'].includes(frame.scene)&&['caption','say','accept'].every(k=>typeof frame[k]==='string'&&frame[k].trim()),`Invalid demonstration: ${locale}`);}}if(release)assert(r.status==='approved',`Unreviewed ${locale}/${r.id}`);}
 }
 let weekIds;
 for(const locale of locales){
  const rows=await json(`content/week.${locale}.json`);
  assert(rows.length===7,'Seven week sessions required');
  const ids=rows.map(r=>r.id);if(weekIds)assert(JSON.stringify(ids)===JSON.stringify(weekIds),'Week locale IDs differ');else weekIds=ids;
  for(const [i,r] of rows.entries()){
   assert(r.id===`W${String(i+1).padStart(2,'0')}`&&r.version==='0.1.0'&&r.status==='draft','Week metadata invalid');
   assert(r.clinicalReviewer===null&&r.nativeReviewer===null&&r.reviewedAt===null,'Unexpected week approval');
   assert(r.sourceIds.length&&r.sourceIds.every(id=>sourceIds.has(id)),'Week citation missing');
   assert(['title','revisit','scope','authoredAt'].every(k=>typeof r[k]==='string'&&r[k].trim()),'Week text missing');
   assert(['together','choice','water','break'].includes(r.photo),'Invalid week photo');
   assert(r.steps.length===3&&r.steps.every(s=>['do','say','accept'].every(k=>typeof s[k]==='string'&&s[k].trim())),'Week steps incomplete');
   if(release)assert(false,'Week curriculum requires clinical and native review');
  }
 }
 const touch=await json('content/touch-activities.json');
 assert(touch.length===5,'Five daily touch activities required');
 for(const [i,a] of touch.entries()){
  assert(a.id===`T${String(i+1).padStart(2,'0')}`&&a.status==='draft'&&a.clinicalReviewer===null&&a.nativeDariReviewer===null,'Invalid touch activity metadata');
  assert(['title','prepare','say','try','note'].every(k=>Array.isArray(a[k])&&a[k].length===2&&a[k].every(v=>typeof v==='string'&&v.trim())),'Touch activity needs English and Dari');
  assert(a.sourceIds?.every(id=>sourceIds.has(id))&&a.sourceIds.length,'Touch activity source missing');
  if(release)assert(false,'Touch activities require clinical and native review');
 }
 const voiceKeys=new Set();
 for(const a of voices.assets){
  const key=`${a.locale}:${a.cardId}`;assert(!voiceKeys.has(key),`Duplicate voice ${key}`);voiceKeys.add(key);
  assert(locales.includes(a.locale)&&cards.some(c=>c.id===a.cardId),'Unknown voice locale/card');
  assert(/^\.\/public\/voices\/[a-zA-Z0-9_.-]+\.(mp3|ogg|m4a|webm)$/.test(a.path),'Unsafe voice path');
  assert(a.status==='approved'&&a.reviewer&&a.reviewDate&&a.speakerConsentId&&a.sha256&&a.durationSeconds>0&&a.durationSeconds<=10,'Incomplete voice review');
  assert(a.locale!=='fa-AF'||a.nativeLocale==='fa-AF','Dari recording must be native fa-AF');
  if(/^\.\/public\/voices\/[a-zA-Z0-9_.-]+\.(mp3|ogg|m4a|webm)$/.test(a.path)){try{const bytes=await readFile(path.join(root,a.path));assert(createHash('sha256').update(bytes).digest('hex')===a.sha256,'Voice hash mismatch');assert(bytes.length<=2*1024*1024,'Oversize voice');}catch{errors.push(`Missing voice ${a.path}`);}}
 }
 if(release){assert(review.status==='approved'&&review.clinicalReviewer&&review.clinicalReviewDate&&review.nativeReviewer&&review.nativeReviewDate,'Clinical/native review incomplete');for(const card of cards)assert(voices.assets.some(a=>a.cardId===card.id&&a.locale==='fa-AF'&&a.status==='approved'),`Missing reviewed native Dari voice: ${card.id}`);}
 return errors;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const errors=await validateContent(undefined,process.argv.includes('--release'));if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Content validation passed (draft pilot mode; not clinical approval).');}
