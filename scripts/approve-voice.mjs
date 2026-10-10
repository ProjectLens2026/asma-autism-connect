// Human approval import, NOT automatic linguistic review.
// Pass a JSON approval file; see docs/VOICE_PIPELINE.md. Never include a child's voice.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {CARD_IDS,LOCALES,validDate,MAX_CLIP_BYTES} from '../src/domain.js';
const approvalPath=process.argv[2];if(!approvalPath)throw Error('Usage: node scripts/approve-voice.mjs /absolute/approval.json');
const approval=JSON.parse(await readFile(approvalPath,'utf8'));
const required=['sourceFile','locale','cardId','reviewer','reviewDate','speakerConsentId','nativeLocale','durationSeconds'];
for(const key of required)if(!approval[key])throw Error(`Missing ${key}`);
if(!LOCALES.includes(approval.locale)||!CARD_IDS.includes(approval.cardId)||!validDate(approval.reviewDate)||approval.durationSeconds>10||approval.durationSeconds<=0)throw Error('Invalid locale/card/date/duration');
if(approval.locale==='fa-AF'&&approval.nativeLocale!=='fa-AF')throw Error('Native Afghan Dari recording required');
const extension=path.extname(approval.sourceFile).toLowerCase();if(!['.mp3','.ogg','.m4a','.webm'].includes(extension))throw Error('Unsupported audio extension');
const bytes=await readFile(approval.sourceFile);if(!bytes.length||bytes.length>MAX_CLIP_BYTES)throw Error('Invalid audio size');
const hash=createHash('sha256').update(bytes).digest('hex');
const assetPath=`./public/voices/${approval.locale}-${approval.cardId}-${hash.slice(0,12)}${extension}`;
const manifest=JSON.parse(await readFile('content/voices.json','utf8'));
await mkdir('public/voices',{recursive:true});await copyFile(approval.sourceFile,assetPath);
const {sourceFile,...metadata}=approval;manifest.assets=manifest.assets.filter(a=>!(a.locale===approval.locale&&a.cardId===approval.cardId));
manifest.assets.push({...metadata,path:assetPath,sha256:hash,status:'approved'});
await writeFile('content/voices.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Imported ${approval.locale}/${approval.cardId}; run npm run validate and listen on target devices.`);
