import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditUdttPrivateBuildAssets} from '../scripts/audit-udtt-private-build-assets.mjs';
import {verifiedContractCarriers,workerEntry} from '../scripts/audit-built-carriers.mjs';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),manifest=JSON.parse(fs.readFileSync(path.join(root,'scripts/udtt-private-build-assets-manifest.json')));
const currentPins=JSON.parse(fs.readFileSync(path.join(root,'scripts/vinext14-contract-carriers.json'),'utf8'));
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'udtt-prune-'));
 function put(name,body){
  const file=path.join(dir,name);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,body);
 }
 function copy(name){put(name,fs.readFileSync(path.join(root,name)));}
 const carriers=verifiedContractCarriers(root,currentPins);
 for(const name of [...Object.keys(manifest.runtimeGuards),...Object.keys(carriers)])copy(name);
 for(const entry of [...manifest.files,...manifest.retainedShared]){
  for(const prefix of ['public','dist/client'])put(prefix+entry.path,fs.readFileSync(path.join(root,'public',entry.path)));
 }
 const chunkManifest=JSON.parse(fs.readFileSync(path.join(root,'dist/client/.vite/manifest.json'),'utf8'));
 const lifecycle=Object.entries(chunkManifest).filter(([,row])=>row.name==='lifecycle');
 assert.equal(lifecycle.length,1);
 put('dist/client/.vite/manifest.json',JSON.stringify(Object.fromEntries(lifecycle)));
 copy('dist/server/index.js');
 const inventory=[...manifest.files,...manifest.retainedShared].map(e=>e.path).concat('/artist/test.txt');
 put(path.relative(root,workerEntry(root)),'const assets=new Set(`'+inventory.join(',')+'`.split(`,`));');
 put('public/artist/test.txt','fixture');
 return {dir,put,dispose:()=>fs.rmSync(dir,{recursive:true,force:true})};
}

test('fixed nine only; retained originals/shared posters; idempotent generated-output plan',()=>{const f=fixture();try{const plan=auditUdttPrivateBuildAssets(f.dir);assert.equal(plan.length,9);assert.equal(plan.reduce((n,e)=>n+e.bytes,0),1587928);for(const e of plan)fs.unlinkSync(path.join(f.dir,e.file));assert.deepEqual(auditUdttPrivateBuildAssets(f.dir),[]);for(const e of [...manifest.files,...manifest.retainedShared])assert.ok(fs.existsSync(path.join(f.dir,'public',e.path)));for(const e of manifest.retainedShared)assert.ok(fs.existsSync(path.join(f.dir,'dist/client',e.path)));}finally{f.dispose();}});
test('unknown source/built consumers, altered renderer, inventory, source bytes and shared absence fail closed',()=>{for(const mutate of [f=>f.put('lib/new-consumer.js',"img.src='/design-review/sol15/' +\n 'assets/' + asset.sha256 + '.jpg'"),f=>f.put('dist/client/new.js',"img.src='/design-review/sol15/' +\n 'assets/' + asset.sha256 + '.jpg'"),f=>f.put('dist/client/new.js',"img.src='/design-review/sol15/assets/'+asset.sha256+'.jpg'"),f=>fs.symlinkSync(os.tmpdir(),path.join(f.dir,'entry.ts'),process.platform==='win32'?'junction':'dir'),f=>f.put('dist/client/new.js',`const asset={targetUrl:'${manifest.files[0].path}'};new Image().src=asset.targetUrl;`),f=>f.put('lib/new-consumer.js',"img.src='/design-review/sol15/assets/'+asset.sha256+'.jpg'"),f=>f.put('entry.ts',`const asset='${manifest.files[0].path}'`),f=>f.put('components/new.tsx',`const image='${manifest.files[0].path}'`),f=>f.put('components/new.tsx',`import {helpers} from '../lib/idol/design-review/sol15-runtime/model.mjs'`),f=>f.put('dist/client/new.js',`const image='${manifest.files[0].path}'`),f=>f.put('lib/idol/design-review/sol15-runtime/new.mjs',"export {helpers} from './model.mjs'"),f=>f.put('lib/idol/design-review/sol15-runtime/host.mjs','changed'),f=>f.put('dist/server/index.js','const assets=new Set()'),f=>f.put('public'+manifest.files[0].path,'changed'),f=>fs.unlinkSync(path.join(f.dir,'dist/client',manifest.retainedShared[0].path))]){const f=fixture();try{mutate(f);assert.throws(()=>auditUdttPrivateBuildAssets(f.dir));}finally{f.dispose();}}});
test('scope and guard omissions cannot expand/relax fixed manifest',()=>{const f=fixture();try{for(const edit of [m=>m.files.push(m.retainedShared[0]),m=>m.files[0]=m.retainedShared[0],m=>delete m.runtimeGuards['lib/idol/design-review/sol15-runtime/model.mjs']]){const m=structuredClone(manifest);edit(m);assert.throws(()=>auditUdttPrivateBuildAssets(f.dir,m));}}finally{f.dispose();}});

test('reporting source identity dependencies remain mandatory, byte pinned and fail closed',()=>{const f=fixture();try{for(const name of ['lib/idol/timeline/reported-records.mjs','data/timeline-reported-records.json']){const m=structuredClone(manifest);delete m.runtimeGuards[name];assert.throws(()=>auditUdttPrivateBuildAssets(f.dir,m),/guard inventory/);const original=fs.readFileSync(path.join(f.dir,name));f.put(name,Buffer.concat([original,Buffer.from(" ")]));assert.throws(()=>auditUdttPrivateBuildAssets(f.dir),/integrity mismatch/);f.put(name,original);}assert.equal(auditUdttPrivateBuildAssets(f.dir).length,9);}finally{f.dispose();}});

test('statistics identity and every model dependency are mandatory, exact and fail closed',()=>{const f=fixture();try{
 const dependencies=['lib/idol/udtt-native/information-identity.mjs','lib/idol/group-information.mjs','lib/idol/follower-count.mjs','data/music-index-artwork.json','data/artist-home-introductions.json','data/group-information-facts.json','data/group-statistics-completion-evidence.json'];
 for(const name of dependencies){
  const omitted=structuredClone(manifest);delete omitted.runtimeGuards[name];assert.throws(()=>auditUdttPrivateBuildAssets(f.dir,omitted),/guard inventory/);
  const original=fs.readFileSync(path.join(f.dir,name));f.put(name,Buffer.concat([original,Buffer.from(' ')]));assert.throws(()=>auditUdttPrivateBuildAssets(f.dir),/integrity mismatch/);f.put(name,original);
  fs.unlinkSync(path.join(f.dir,name));assert.throws(()=>auditUdttPrivateBuildAssets(f.dir),/integrity mismatch|source inventory/);f.put(name,original);
 }
 assert.equal(auditUdttPrivateBuildAssets(f.dir).length,9);
}finally{f.dispose();}});

test('a changed compiled lifecycle or a redirected manifest entry is rejected',()=>{
 const f=fixture();
 try{
  const [client,server]=Object.keys(currentPins);
  for(const file of [client,server]){
   const original=fs.readFileSync(path.join(f.dir,file));
   f.put(file,Buffer.concat([original,Buffer.from(' ')]));
   assert.throws(()=>auditUdttPrivateBuildAssets(f.dir),/integrity mismatch/);
   f.put(file,original);
  }
  f.put('dist/client/.vite/manifest.json',JSON.stringify({unexpected:{name:'lifecycle',file:'_next/static/chunks/00000000.js'}}));
  assert.throws(()=>auditUdttPrivateBuildAssets(f.dir),/pinned client module/);
 }finally{f.dispose();}
});
