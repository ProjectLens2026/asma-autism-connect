const ITERATIONS=600000;
const encoder=new TextEncoder();
export function encode64(bytes) { let s=''; for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b); return btoa(s); }
export function decode64(s) { return Uint8Array.from(atob(s), c=>c.charCodeAt(0)); }
export async function deriveKey(passphrase,salt) {
 const material=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(data,key,salt) {
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('brighter-steps:v1')},key,encoder.encode(JSON.stringify(data)));
 return {format:'brighter-steps-vault',schema:1,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:encode64(salt),iv:encode64(iv),ciphertext:encode64(ciphertext)};
}
export function validEnvelope(e) {
 try {return e?.format==='brighter-steps-vault' && e.schema===1 && e.kdf==='PBKDF2-SHA256' && e.iterations===ITERATIONS && decode64(e.salt).length===16 && decode64(e.iv).length===12 && typeof e.ciphertext==='string' && e.ciphertext.length<100*1024*1024 && decode64(e.ciphertext).length>=16;} catch{return false;}
}
export async function openEnvelope(e,passphrase) {
 if(!validEnvelope(e))throw Error('INVALID_ENVELOPE');
 const salt=decode64(e.salt),key=await deriveKey(passphrase,salt);
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode64(e.iv),additionalData:encoder.encode('brighter-steps:v1')},key,decode64(e.ciphertext));
 return {data:JSON.parse(new TextDecoder().decode(bytes)),key,salt};
}
