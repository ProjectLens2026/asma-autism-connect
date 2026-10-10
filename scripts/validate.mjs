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
 const sourceIds=new Set(sources.map(s=>s.id));for(const s of sources)assert(s.url.startsWith('https://')&&/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)&&locales.every(l=>s.scope[l]),`Incomplete source ${s.id}`);
 let reference={};
 for(const locale of locales)for(const kind of ['lessons','qa']){
  const rows=await json(`content/${kind}.${locale}.json`);assert(rows.length>0,`Empty ${kind}`);assert(new Set(rows.map(r=>r.id)).size===rows.length,`Duplicate ${kind} IDs`);
  if(reference[kind])assert(JSON.stringify(reference[kind])===JSON.stringify(rows.map(r=>r.id)),`Locale ${kind} IDs differ`);else reference[kind]=rows.map(r=>r.id);
  for(const r of rows){assert(r.version===review.version,`Stale version ${r.id}`);assert(['draft','approved'].includes(r.status),`Invalid status ${r.id}`);assert(r.sourceIds.length&&r.sourceIds.every(id=>sourceIds.has(id)),`Unknown source ${r.id}`);for(const k of kind==='qa'?['question','answer']:['title','body'])assert(typeof r[k]==='string'&&r[k].trim(),`Missing text ${r.id}`);if(release)assert(r.status==='approved',`Unreviewed ${locale}/${r.id}`);}
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
