import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditUnusedEditorialAssets} from '../scripts/audit-unused-editorial-assets.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'scripts/unused-editorial-assets-manifest.json'),'utf8'));
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'editorial-audit-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
 for(const group of ['unis','kep1er']) {
  for(const file of [`data/${group}-figma-editorial.json`,`lib/idol/${group}-editorial.ts`]) write(file,fs.readFileSync(path.join(repo,file)));
  for(const e of manifest[group]) for(const base of ['public','dist/client']) write(base+e.image,fs.readFileSync(path.join(repo,'public',e.image)));
 }
 write('dist/server/index.js','var assets=new Set(`'+Object.values(manifest).flat().map(e=>e.image).join(',')+'`.split(`,`));');
 return {root,write};
}
function apply(root) {
 // Same validate-all-then-delete contract as the integrated pruner.
 const result=auditUnusedEditorialAssets(root);
 for(const {file} of result.plan)fs.unlinkSync(path.join(root,file));
 return result;
}
test('unused exact inventory prunes 10 build copies; public remains; repeated apply is idempotent',t=> {
 const {root}=fixture(t);
 const before=Object.values(manifest).flat().map(e=>fs.readFileSync(path.join(root,'public',e.image)));
 const result=apply(root);
 assert.equal(result.plan.length,10); assert.deepEqual(result.skipped,[]);
 assert.equal(result.plan.reduce((n,e)=>n+e.bytes,0),5882736);
 for(const [i,e] of Object.values(manifest).flat().entries()) {
  assert.deepEqual(fs.readFileSync(path.join(root,'public',e.image)),before[i]);
  assert.equal(fs.existsSync(path.join(root,'dist/client',e.image)),false);
 }
 assert.deepEqual(apply(root),{plan:[],skipped:[]});
});
for(const [name,file,content] of [
 ['alias module import','app/page.tsx',"import {unisEditorialAssets} from '@/lib/idol/unis-editorial';"],
 ['relative dynamic module import','app/page.tsx',"const layer=import('../lib/idol/unis-editorial');"],
 ['JSON import','components/card.tsx',"import data from '@/data/unis-figma-editorial.json';"],
 ['source asset reference','app/page.tsx',JSON.stringify(manifest.unis[0].image)],
 ['built asset reference','dist/client/assets/app.js',JSON.stringify(manifest.unis[0].image)],
 ['escaped built reference','dist/server/render.js',JSON.stringify(manifest.unis[0].image).replaceAll('/',String.raw`\/`)],
 ['constructed batch fragment','app/page.tsx',"const batch='editorial-20261018';"],
 ['asset basename reference','app/page.tsx',JSON.stringify(path.basename(manifest.unis[0].image))],
 ['non-inventory server Set','dist/server/index.js','const urls=new Set(`'+manifest.unis[0].image+'`.split(`,`));'],
]) test(name+' retains affected group',t=> {
 const {root,write}=fixture(t);write(file,content);
 const result=apply(root);
 assert.ok(result.skipped.some(e=>e.group==='unis'));
 assert.ok(result.plan.every(e=>!e.file.includes('/unis/')));
 assert.ok(fs.existsSync(path.join(root,'dist/client',manifest.unis[0].image)));
});
for(const base of ['public','dist/client']) test(base+' hash mismatch fails before deleting any copy',t=> {
 const {root,write}=fixture(t);write(base+manifest.kep1er[0].image,'changed');
 assert.throws(()=>apply(root),/integrity mismatch/);
 assert.ok(fs.existsSync(path.join(root,'dist/client',manifest.unis[0].image)));
});
for(const base of ['public','dist/client']) test(base+' unexpected file fails closed',t=> {
 const {root,write}=fixture(t);write(base+'/artist/kep1er/editorial-20261018/unreviewed.png','new');
 assert.throws(()=>apply(root),/Unexpected/);
 assert.ok(fs.existsSync(path.join(root,'dist/client',manifest.unis[0].image)));
});
test('changed JSON hash list fails closed',t=> {
 const {root,write}=fixture(t); const data=JSON.parse(fs.readFileSync(path.join(root,'data/unis-figma-editorial.json'))); data.assets[0].sha256='0'.repeat(64);write('data/unis-figma-editorial.json',JSON.stringify(data));
 assert.throws(()=>apply(root),/audited SHA list/);
});
test('missing public original fails closed',t=> {
 const {root}=fixture(t);fs.unlinkSync(path.join(root,'public',manifest.unis[0].image));
 assert.throws(()=>apply(root),/missing editorial source/);
});
test('partially pruned build is safe and idempotent',t=> {
 const {root}=fixture(t);fs.unlinkSync(path.join(root,'dist/client',manifest.unis[0].image));
 assert.equal(apply(root).plan.length,9); assert.equal(apply(root).plan.length,0);
});
test('real server reference outside valid inventory is retained',t=> {
 const {root,write}=fixture(t);
 write('dist/server/index.js',fs.readFileSync(path.join(root,'dist/server/index.js'),'utf8')+'const hero='+JSON.stringify(manifest.unis[0].image)+';');
 assert.ok(apply(root).skipped.some(e=>e.group==='unis'));
});
test('symlink build copy fails closed',t=> {
 const {root}=fixture(t);const copy=path.join(root,'dist/client',manifest.unis[0].image);
 fs.unlinkSync(copy);fs.symlinkSync(path.join(root,'public',manifest.unis[0].image),copy);
 assert.throws(()=>apply(root),/symlink/);
});
