import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const data={cards:await json('content/cards.json'),icons:{},lessons:{},qa:{}};
for(const card of data.cards)data.icons[card.id]=await readFile(card.image,'utf8');
for(const locale of ['fa-AF','en-US']){data.lessons[locale]=await json(`content/lessons.${locale}.json`);data.qa[locale]=await json(`content/qa.${locale}.json`);}
const app=await readFile('preview/app.js','utf8');
const script='const DATA='+JSON.stringify(data).replace(/</g,'\\u003c')+';\n'+app+'\ndocument.getElementById("static-pages")?.remove?.();';
const css=await readFile('src/style.css','utf8')+'\n'+await readFile('preview/extra.css','utf8')+'\n.static-page{padding:30px 20px;max-width:1100px;margin:25px auto;border-top:2px solid #dce5de}.static-intro{padding:16px;background:#fff4d9;color:#55451f;border-radius:12px}.static-links{display:flex;gap:20px;flex-wrap:wrap}a.navitem,a.secondary{ text-decoration:none; }';
// Prerender actual application markup: viewers that block JavaScript must never be blank.
const root={innerHTML:'',addEventListener(){},querySelector(){return null;}};
const context=vm.createContext({document:{documentElement:{},getElementById:id=>id==='app'?root:null,addEventListener(){}},window:{addEventListener(){}},console});
vm.runInContext('const DATA='+JSON.stringify(data)+';\n'+app,context);
const anchorize=html=>html.replace(/<button([^>]*data-action="nav"[^>]*)>([\s\S]*?)<\/button>/g,(_,attrs,label)=>{const page=attrs.match(/data-page="([^"]+)"/)?.[1]||'today';return `<a ${attrs.replace(/data-action="nav"/,'')} href="#static-${page}">${label}</a>`;}).replace(/<button/g,'<button disabled');
const initial=anchorize(root.innerHTML);
let pages='<section class="static-page static-intro"><p>اگر دکمه‌ها کار نمی‌کنند، فایل را دانلود کرده در مرورگر باز کنید. / If controls are inactive, download this HTML and open it in your browser.</p><div class="static-links"><a href="#static-child">صفحهٔ کودک / Child board</a><a href="#static-en">English dashboard</a></div></section>';
for(const [page,fn] of [['child','board'],['lessons','lessonPage'],['qa','questions'],['voice','voicePage'],['progress','progressPage']]){pages+=`<section class="static-page" id="static-${page}">${anchorize(vm.runInContext(fn+'()',context))}</section>`;}
vm.runInContext("locale='en-US'",context);
pages+=`<section class="static-page" id="static-en" lang="en-US" dir="ltr">${anchorize(vm.runInContext('dashboard()',context))}</section>`;
const hash=s=>createHash('sha256').update(s).digest('base64');
const html=`<!doctype html><html lang="fa-AF" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#166860"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash(script)}'; style-src 'sha256-${hash(css)}'; media-src blob:; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>Asma — Local Design Preview</title><style>${css}</style></head><body id="static-today"><a class="skip" href="#main">Skip to content / رفتن به محتوا</a><div id="app">${initial}</div><div id="static-pages">${pages}</div><div id="notice" role="status" aria-live="polite"></div><script>${script}</script></body></html>`;
await writeFile('Asma_Local_Preview.html',html);
console.log(`Standalone preview: ${Buffer.byteLength(html)} bytes; prerendered dashboard and picture board.`);
