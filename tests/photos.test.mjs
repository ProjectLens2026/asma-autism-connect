import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('six generated photos are locally packaged, declared and small enough for the pilot',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../content/photos.json',import.meta.url),'utf8'));
 assert.equal(manifest.assets.length,6);assert.equal(manifest.status,'draft');assert.equal(manifest.clinicalReviewer,null);
 let total=0;for(const item of manifest.assets){assert.ok(item.prompt.length>30);const bytes=await readFile(new URL('../dist/'+item.path.replace('./',''),import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');total+=bytes.length;}
 assert.ok(total<600000);
});
