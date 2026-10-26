import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {auditUnusedIfeyeOriginalBuildAssets,ifeyeUnusedOriginalPaths} from '../scripts/audit-unused-ifeye-original-build-assets.mjs';
import {auditUnusedDisplayAssets} from '../scripts/audit-unused-display-assets.mjs';
import {fileURLToPath} from 'node:url';
const production=JSON.parse(fs.readFileSync(new URL('../scripts/unused-ifeye-original-build-assets-manifest.json',import.meta.url),'utf8'));
const integrity=s=>({bytes:Buffer.byteLength(s),sha256:createHash('sha256').update(s).digest('hex')});
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ifeye-unused-originals-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{const dest=path.join(root,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,s);};
 const manifest={version:1,runtimeGuards:{},files:production.files.map(e=>({...e,...integrity('original:'+e.path),replacementIntegrity:integrity('display:'+e.replacement)}))};
 const inventory=[];
 for(const e of manifest.files) {
  for(const base of ['public','dist/client']) {
   write(base+e.path,'original:'+e.path);
   write(base+e.path.replace('-original.png','-display.jpg'),'old-display');
   write(base+e.replacement,'display:'+e.replacement);
  }
  inventory.push(e.path,e.path.replace('-original.png','-display.jpg'),e.replacement);
 }
 for(const p of Object.keys(production.runtimeGuards)) {write(p,'reviewed renderer '+p);manifest.runtimeGuards[p]=integrity('reviewed renderer '+p);}
 write('data/ifeye.json',JSON.stringify(manifest.files.map(e=>e.replacement)));
 const index=()=>write('dist/server/index.js','const paths=new Set(`'+inventory.join(',')+'`.split(`,`));');index();
 return {root,write,manifest,index,inventory,audit:()=>auditUnusedIfeyeOriginalBuildAssets(root,manifest)};
}
function apply(f) {const plan=f.audit();for(const {file} of plan)fs.unlinkSync(path.join(f.root,file));return plan;}
test('production scope is exactly seven PNG build copies, totaling 18,205,847 bytes',()=>{
 assert.equal(production.files.length,7);assert.equal(production.files.reduce((n,e)=>n+e.bytes,0),18205847);
 assert.deepEqual(production.files.map(e=>e.path),ifeyeUnusedOriginalPaths);assert.equal(Object.keys(production.runtimeGuards).length,8);
 for(const e of production.files){assert.match(e.sourceGitBlob,/^[a-f0-9]{40}$/);assert.match(e.replacement,/-display\.webp$/);}
});
test('dry-run is read-only; apply retains source and active display bytes; second apply is idempotent',t=>{
 const f=fixture(t),source=f.manifest.files.map(e=>fs.readFileSync(path.join(f.root,'public',e.path)));
 assert.equal(f.audit().length,7);assert.ok(fs.existsSync(path.join(f.root,'dist/client',f.manifest.files[0].path)));
 assert.equal(apply(f).length,7);assert.deepEqual(apply(f),[]);
 for(const [i,e] of f.manifest.files.entries()) {
  assert.deepEqual(fs.readFileSync(path.join(f.root,'public',e.path)),source[i]);
  assert.deepEqual(fs.readFileSync(path.join(f.root,'public',e.replacement)),fs.readFileSync(path.join(f.root,'dist/client',e.replacement)));
 }
});
test('partial prior exclusion is safe and idempotent',t=>{const f=fixture(t);fs.unlinkSync(path.join(f.root,'dist/client',f.manifest.files[0].path));assert.equal(apply(f).length,6);assert.deepEqual(apply(f),[]);});
for(const [name,change] of [
 ['original source changed',f=>f.write('public'+f.manifest.files[6].path,'changed')],
 ['original build changed',f=>f.write('dist/client'+f.manifest.files[6].path,'changed')],
 ['active source changed',f=>f.write('public'+f.manifest.files[6].replacement,'changed')],
 ['active build changed',f=>f.write('dist/client'+f.manifest.files[6].replacement,'changed')],
 ['missing source',f=>fs.unlinkSync(path.join(f.root,'public',f.manifest.files[6].path))],
 ['missing active build',f=>fs.unlinkSync(path.join(f.root,'dist/client',f.manifest.files[6].replacement))],
 ['missing active source',f=>fs.unlinkSync(path.join(f.root,'public',f.manifest.files[6].replacement))],
 ['unexpected public file',f=>f.write('public/artist/ifeye/batch-b-20261016/new.png','new')],
 ['unexpected built file',f=>f.write('dist/client/artist/ifeye/batch-b-20261016/new.png','new')],
 ['exact JSON original reference',f=>f.write('data/new.json',JSON.stringify(f.manifest.files[0].path))],
 ['compiled original reference',f=>f.write('dist/client/chunk.js',JSON.stringify(f.manifest.files[0].path))],
 ['escaped slash reference',f=>f.write('dist/client/chunk.js',JSON.stringify(f.manifest.files[0].path).replaceAll('/',String.raw`\/`))],
 ['CSS original reference',f=>f.write('dist/client/styles.css','a{background:url('+f.manifest.files[0].path+')}')],
 ['root runtime reference',f=>f.write('entry.ts',JSON.stringify(f.manifest.files[0].path))],
 ['public script reference',f=>f.write('public/client.js',JSON.stringify(f.manifest.files[0].path))],
 ['dynamic group prefix',f=>f.write('lib/dynamic.ts','const path="/artist/ifeye/"+batch;')],
 ['dynamic old batch',f=>f.write('lib/dynamic.ts','const path="batch-b-20261016";')],
 ['dynamic built old batch',f=>f.write('dist/client/chunk.js','const path="batch-b-20261016";')],
 ['changed image renderer',f=>f.write('components/reliable-image.tsx','now resolves an original')],
 ['changed member renderer',f=>f.write('components/candidate-artist-experience.tsx','now resolves an original')],
 ['removed active references',f=>f.write('data/ifeye.json','[]')],
 ['missing server inventory',f=>f.write('dist/server/index.js','const paths=new Set();')],
 ['partial server inventory',f=>f.write('dist/server/index.js','const paths=new Set(`'+f.manifest.files[0].path+'`.split(`,`));')],
 ['duplicate full server inventory',f=>f.write('dist/server/index.js',fs.readFileSync(path.join(f.root,'dist/server/index.js'),'utf8').repeat(2))],
 ['reference after valid inventory',f=>fs.appendFileSync(path.join(f.root,'dist/server/index.js'),JSON.stringify(f.manifest.files[0].path))],
 ['missing runtime guard',f=>delete f.manifest.runtimeGuards['components/reliable-image.tsx']],
 ['extra runtime guard',f=>f.manifest.runtimeGuards['../outside']={bytes:1,sha256:'0'.repeat(64)}],
 ['extra original scope',f=>f.manifest.files.push({...f.manifest.files[0]})],
 ['substituted original scope',f=>f.manifest.files[0].path='/artist/other/original.png'],
 ['substituted display scope',f=>f.manifest.files[0].replacement='/artist/other/display.webp'],
 ['invalid hash',f=>f.manifest.files[0].sha256='invalid'],
 ['source symlink',f=>{const p=path.join(f.root,'public',f.manifest.files[0].path);fs.unlinkSync(p);fs.symlinkSync(path.join(f.root,'dist/client',f.manifest.files[0].path),p);}],
 ['build symlink',f=>{const p=path.join(f.root,'dist/client',f.manifest.files[0].path);fs.unlinkSync(p);fs.symlinkSync(path.join(f.root,'public',f.manifest.files[0].path),p);}],
 ['runtime directory symlink',f=>{fs.mkdirSync(path.join(f.root,'lib/unrelated'));fs.symlinkSync(path.join(f.root,'lib/unrelated'),path.join(f.root,'lib/link'));}],
])test('fails before any deletion: '+name,t=>{const f=fixture(t);change(f);assert.throws(()=>apply(f));assert.ok(fs.existsSync(path.join(f.root,'dist/client',f.manifest.files[1].path)));});

// Exercise the compatibility exception against actual hash-pinned production bytes.
test('the existing display auditor accepts only fully validated absent ifeye originals',t=>{
 const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ifeye-display-compat-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{const dst=path.join(root,p);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,s);};
 const oldManifest=JSON.parse(fs.readFileSync(path.join(repo,'scripts/unused-display-assets-manifest.json'),'utf8'));
 const displayManifest={version:1,groups:{ifeye:oldManifest.groups.ifeye},files:oldManifest.files.filter(e=>e.path.startsWith('/artist/ifeye/'))};
 const inventory=[];
 for(const name of Object.keys(displayManifest.groups.ifeye)) {
  const p='/artist/ifeye/batch-b-20261016/'+name;inventory.push(p);
  write('public'+p,fs.readFileSync(path.join(repo,'public',p)));
  if(!name.includes('-original.'))write('dist/client'+p,fs.readFileSync(path.join(repo,'public',p)));
 }
 for(const e of production.files) {
  inventory.push(e.replacement);
  for(const base of ['public','dist/client'])write(base+e.replacement,fs.readFileSync(path.join(repo,'public',e.replacement)));
 }
 for(const p of Object.keys(production.runtimeGuards))write(p,fs.readFileSync(path.join(repo,p)));
 write('data/ifeye.json',JSON.stringify(production.files.map(e=>e.replacement)));
 write('dist/server/index.js','const paths=new Set(`'+inventory.join(',')+'`.split(`,`));');
 const plan=auditUnusedDisplayAssets(root,displayManifest);assert.equal(plan.length,7);
 for(const {file} of plan)fs.unlinkSync(path.join(root,file));
 assert.deepEqual(auditUnusedDisplayAssets(root,displayManifest),[]);
 assert.deepEqual(auditUnusedIfeyeOriginalBuildAssets(root),[]);
 write('lib/new-consumer.ts',JSON.stringify(production.files[0].path));
 assert.throws(()=>auditUnusedDisplayAssets(root,displayManifest),/referenced|dynamic/);
});
