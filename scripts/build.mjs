import {mkdir,cp,rm,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const p of ['index.html','src','content','public','manifest.webmanifest','_headers'])await cp(p,path.join('dist',p),{recursive:true});
async function files(dir){let out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await files(p));else out.push(p);}return out;}
const all=(await files('dist')).filter(f=>!f.endsWith('_headers'));const hash=createHash('sha256');for(const f of all.sort())hash.update(await readFile(f));const version=hash.digest('hex').slice(0,16);
const precache=all.map(f=>'./'+path.relative('dist',f).split(path.sep).join('/'));precache.push('./');
const sw=`// Generated from exact build assets. Only public app/content assets are cached.\nconst CACHE='brighter-steps-${version}';\nconst ASSETS=${JSON.stringify(precache)};\nconst URLS=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).href));\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));\nself.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('brighter-steps-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!URLS.has(event.request.url))return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));});\n`;
await writeFile('dist/sw.js',sw);await writeFile('sw.js',sw);
console.log(`Built ${all.length} public assets; cache ${version}.`);
