import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {auditDuplicateLoonaBuildAssets} from '../scripts/audit-duplicate-loona-build-assets.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'scripts/duplicate-loona-build-assets-manifest.json'),'utf8'));
const expected=[
 ['chuu.jpg',602688,'34a6b1c12a3d5d97c4e6f979fe5d1349ea60bcc6f80f5f645713722075c83bd6',800,1200],
 ['unit-13.jpg',301918,'fe24139e16f46a56441bd51bb5ffc6a7a1132a4f19a8e43b8175a4b3b850dd47',1000,684],
 ['unit-oec.jpg',289045,'dc35481729546fc58616b5ca2d25a189f16d57c2bc08a6f831ecff9e393d0f9c',1000,667],
 ['unit-yyxy.jpg',248327,'2eeff7fc8f4fccf8f72802d62e89f537d31a1e009facc397039628f50bebaa31',1000,695],
];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function jpegDimensions(bytes) {
 assert.equal(bytes.readUInt16BE(0),0xffd8);
 for(let offset=2;offset<bytes.length;) {
  assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;
  const marker=bytes[offset++];if(marker===0xda||marker===0xd9)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  const length=bytes.readUInt16BE(offset);assert.ok(length>=2&&offset+length<=bytes.length);
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
  offset+=length;
 }
 throw new Error('Missing JPEG frame dimensions');
}
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'loona-dedup-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(file,content)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);};
 for(const entry of manifest.files)for(const base of ['public','dist/client'])for(const file of [entry.path,entry.replacement])write(base+file,fs.readFileSync(path.join(repo,'public',file)));
 const references=JSON.stringify(manifest.files.map(entry=>entry.replacement));
 write('lib/idol/curation.ts','export const images='+references+';');
 write('dist/client/assets/loona.js','const images='+references+';');
 const inventory=manifest.files.flatMap(entry=>[entry.path,entry.replacement]).join(',');
 write('dist/server/index.js','const publicPaths=new Set(`'+inventory+'`.split(`,`));');
 return {root,write,audit:()=>auditDuplicateLoonaBuildAssets(root)};
}
function apply(f) {
 const plan=f.audit();
 for(const {file} of plan)fs.unlinkSync(path.join(f.root,file));
 return plan;
}
test('exact four immutable byte identities and intrinsic JPEG geometry match both retained public sources',()=>{
 assert.equal(manifest.files.length,4);
 for(const [index,[name,bytes,sha256,width,height]] of expected.entries()) {
  const entry=manifest.files[index];
  assert.deepEqual(entry,{path:'/artist/loona/independent-v2/'+name,replacement:'/artist/loona/approved-home/'+name,bytes,sha256,width,height});
  const original=fs.readFileSync(path.join(repo,'public',entry.path));
  const canonical=fs.readFileSync(path.join(repo,'public',entry.replacement));
  assert.deepEqual(original,canonical);assert.equal(original.length,bytes);assert.equal(hash(original),sha256);
  assert.deepEqual(jpegDimensions(original),{width,height});assert.deepEqual(jpegDimensions(canonical),{width,height});
 }
 assert.equal(manifest.files.reduce((sum,entry)=>sum+entry.bytes,0),1441978);
});
test('runtime CHUU identity, provenance and all four dimensions use canonical paths',()=>{
 const source=fs.readFileSync(path.join(repo,'lib/idol/loona-curation.ts'),'utf8');
 assert.ok(!source.includes('independent-v2'));
 const exports={};vm.runInNewContext('(function(exports){'+ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})')(exports);
 const portrait=exports.loonaHistoricalPortraits.recvxyICzHTm4b;
 assert.equal(portrait.image,manifest.files[0].replacement);
 assert.equal(portrait.stageName,'CHUU');assert.equal(portrait.sourceUrl,'https://www.universal-music.co.jp/loona/biography/');assert.equal(portrait.credit,'Universal Music Japan · 历史成员资料照');
 for(const entry of manifest.files) {
  assert.equal(exports.loonaImageDimensions(entry.replacement).width,entry.width);
  assert.equal(exports.loonaImageDimensions(entry.replacement).height,entry.height);
  assert.equal(exports.loonaImageDimensions(entry.path),undefined);
 }
});
test('no remaining old-directory references in runtime source roots',()=>{
 function files(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]):[];}
 for(const file of ['app','components','lib','hooks','data','db'].flatMap(dir=>files(path.join(repo,dir))).filter(file=>/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/.test(file)))assert.ok(!fs.readFileSync(file,'utf8').includes('independent-v2'),file);
});
test('read-only audit then build-only pruning preserves all originals and canonical build bytes; repeat is idempotent',t=>{
 const f=fixture(t),before=manifest.files.flatMap(entry=>[entry.path,entry.replacement]).map(file=>hash(fs.readFileSync(path.join(f.root,'public',file))));
 assert.equal(f.audit().length,4);
 for(const entry of manifest.files)assert.ok(fs.existsSync(path.join(f.root,'dist/client',entry.path)));
 const plan=apply(f);assert.equal(plan.length,4);assert.equal(plan.reduce((sum,entry)=>sum+entry.bytes,0),1441978);
 assert.ok(plan.every(entry=>entry.file.startsWith('dist/client/artist/loona/independent-v2/')));
 assert.deepEqual(manifest.files.flatMap(entry=>[entry.path,entry.replacement]).map(file=>hash(fs.readFileSync(path.join(f.root,'public',file)))),before);
 for(const entry of manifest.files){assert.ok(!fs.existsSync(path.join(f.root,'dist/client',entry.path)));assert.equal(hash(fs.readFileSync(path.join(f.root,'dist/client',entry.replacement))),entry.sha256);}
 assert.deepEqual(apply(f),[]);
});
test('partial prior pruning remains idempotent and ignores unrelated build images',t=>{
 const f=fixture(t);fs.unlinkSync(path.join(f.root,'dist/client',manifest.files[0].path));
 f.write('dist/client/artist/loona/independent-v2/unreviewed.jpg','unrelated');
 assert.equal(apply(f).length,3);assert.equal(fs.readFileSync(path.join(f.root,'dist/client/artist/loona/independent-v2/unreviewed.jpg'),'utf8'),'unrelated');assert.deepEqual(apply(f),[]);
});
for(const base of ['public','dist/client'])for(const key of ['path','replacement']) {
 test(`fails closed before any deletion: changed ${base} ${key}`,t=>{
  const f=fixture(t);f.write(base+manifest.files[3][key],'changed');assert.throws(()=>apply(f),/integrity mismatch/);
  assert.ok(fs.existsSync(path.join(f.root,'dist/client',manifest.files[0].path)));
 });
}
for(const [name,file,text] of [
 ['source reference','app/page.tsx',JSON.stringify(manifest.files[0].path)],
 ['JSON reference','data/new.json',JSON.stringify({image:manifest.files[1].path})],
 ['CSS reference','dist/client/style.css','a{background:url('+manifest.files[2].path+')}'],
 ['built reference','dist/client/new.js',JSON.stringify(manifest.files[3].path)],
 ['escaped built reference','dist/server/new.js',JSON.stringify(manifest.files[0].path).replaceAll('/',String.raw`\/`)],
 ['source-map reference','dist/client/new.js.map',JSON.stringify({sourcesContent:[manifest.files[0].path]})],
 ['public runtime reference','public/worker.js',JSON.stringify(manifest.files[0].path)],
 ['root runtime entrypoint','worker.mjs',JSON.stringify(manifest.files[0].path)],
 ['dynamic directory fragment','components/new.tsx','const directory="independent-v2";'],
 ['non-inventory Set','dist/server/index.js','const urls=new Set(`'+manifest.files[0].path+'`.split(`,`));'],
])test('fails closed before any deletion: '+name,t=>{const f=fixture(t);f.write(file,text);assert.throws(()=>apply(f),/runtime consumer/);assert.ok(fs.existsSync(path.join(f.root,'dist/client',manifest.files[0].path)));});
test('valid full inventory does not hide an additional server consumer',t=>{
 const f=fixture(t);f.write('dist/server/index.js',fs.readFileSync(path.join(f.root,'dist/server/index.js'),'utf8')+'const portrait='+JSON.stringify(manifest.files[0].path));assert.throws(()=>apply(f),/runtime consumer/);
});
test('two matching full inventories are not exempted',t=>{
 const f=fixture(t),source=fs.readFileSync(path.join(f.root,'dist/server/index.js'),'utf8');f.write('dist/server/index.js',source+source.replace('publicPaths','secondPaths'));assert.throws(()=>apply(f),/runtime consumer/);
});
for(const [base,key] of [['public','path'],['public','replacement'],['dist/client','replacement']])test(`missing required ${base} ${key} fails closed`,t=>{
 const f=fixture(t);fs.unlinkSync(path.join(f.root,base,manifest.files[3][key]));assert.throws(()=>apply(f));assert.ok(fs.existsSync(path.join(f.root,'dist/client',manifest.files[0].path)));
});
for(const [file,expectedError] of [['lib/idol/curation.ts',/canonical source no longer referenced/],['dist/client/assets/loona.js',/canonical build no longer referenced/]])test('canonical consumer required: '+file,t=>{
 const f=fixture(t);f.write(file,'');assert.throws(()=>apply(f),expectedError);
});
test('symlinked duplicate build fails closed',t=>{
 const f=fixture(t),entry=manifest.files[0],file=path.join(f.root,'dist/client',entry.path);fs.unlinkSync(file);fs.symlinkSync(path.join(f.root,'public',entry.path),file);assert.throws(()=>apply(f),/symlink/);
});
test('integrated pruner validates all LOONA candidates before its first deletion',()=>{
 const source=fs.readFileSync(path.join(repo,'scripts/prune-unused-build-assets.mjs'),'utf8');
 assert.match(source,/import \{auditDuplicateLoonaBuildAssets\}/);assert.ok(source.indexOf('const duplicateLoonaPlan=auditDuplicateLoonaBuildAssets(root);')<source.indexOf('fs.rmSync('));
 assert.match(source,/const saved=[^;]*duplicateLoonaPlan\.reduce/);assert.match(source,/\.\.\.editorialPlan,\.\.\.duplicateLoonaPlan/);
});
