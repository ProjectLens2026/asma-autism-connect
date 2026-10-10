import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg','.m4a':'audio/mp4','.webm':'audio/webm','.ogg':'audio/ogg'};
const server=createServer(async(req,res)=>{
 try{if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(url==='/'||url.endsWith('/'))url+='index.html';
 const relative=url.replace(/^\//,'');if(relative.split('/').some(p=>p.startsWith('.'))||!(/^(index\.html|sw\.js|manifest\.webmanifest|src\/|content\/|public\/)/.test(relative))){res.writeHead(404);return res.end();}
 const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||(await stat(file)).isDirectory()){res.writeHead(404);return res.end();}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'microphone=(self), camera=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
});server.listen(port,'127.0.0.1',()=>console.log(`Asma: http://localhost:${port}`));
