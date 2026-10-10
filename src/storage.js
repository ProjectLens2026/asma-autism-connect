// One authenticated ciphertext. Keys and passphrases are never persisted.
let dbPromise;
function db() { return dbPromise ||= new Promise((resolve,reject)=>{
 const r=indexedDB.open('brighter-steps-secure',1);
 r.onupgradeneeded=()=>r.result.createObjectStore('vault');
 r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};
 r.onerror=()=>{dbPromise=null;reject(r.error);};
 r.onblocked=()=>reject(Error('STORAGE_BLOCKED'));
});}
export async function readVault() {const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('vault','readonly');const r=tx.objectStore('vault').get('current');let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);});}
// Atomic compare-and-swap prevents a second tab overwriting newer records.
export async function writeVault(envelope,expectedRevision=null) {
 const database=await db();return new Promise((resolve,reject)=>{
 const tx=database.transaction('vault','readwrite'),store=tx.objectStore('vault');let saved,conflict=false;
 const r=store.get('current');r.onsuccess=()=>{const current=r.result?.revision??null;if(current!==expectedRevision){conflict=true;tx.abort();return;}saved={...envelope,revision:(current??0)+1};store.put(saved,'current');};
 tx.oncomplete=()=>resolve(saved);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(Error(conflict?'STALE_VAULT':'STORAGE_ABORTED'));
 });
}
export async function eraseVault(expectedRevision) {
 const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('vault','readwrite');const store=tx.objectStore('vault');const r=store.get('current');r.onsuccess=()=>{if((r.result?.revision??null)!==expectedRevision){tx.abort();return;}store.clear();};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(Error('STALE_VAULT'));});
}
