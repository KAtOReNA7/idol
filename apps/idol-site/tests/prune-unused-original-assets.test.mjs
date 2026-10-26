import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {auditUnusedOriginalAssets} from '../scripts/audit-unused-original-assets.mjs';
const original='/artist/tracer/dot-three-hero-20261016/group.original.jpg';
const display='/artist/tracer/dot-three-hero-20261016/group.display.jpg';
const integrity=s=>({bytes:Buffer.byteLength(s),sha256:createHash('sha256').update(s).digest('hex')});
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'idol-original-audit-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{p=path.join(root,p);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
 for(const base of ['public','dist/client']){write(base+original,'original');write(base+display,'display');}
 write('data/tracer.json',JSON.stringify({image:display}));
 write('components/hero.tsx','safe renderer');
 write('dist/server/index.js',`const paths=new Set(\`${original},${display}\`.split(\`,\`));`);
 const manifest={runtimeGuards:{'components/hero.tsx':integrity('safe renderer')},files:[{path:original,...integrity('original'),replacement:display,replacementIntegrity:integrity('display')}]};
 return {root,write,manifest,audit:()=>auditUnusedOriginalAssets(root,manifest)};
}
test('production manifest pins exactly the audited 25,354,489-byte original',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../scripts/unused-original-assets-manifest.json',import.meta.url),'utf8'));
 assert.equal(m.files.length,1);assert.equal(m.files[0].path,original);assert.equal(m.files[0].bytes,25354489);
 assert.equal(m.files[0].sha256,'050000ba29ab64d13ecec793c49f24dc2f214cc7bb74868e47b9f1f834e8da47');
 assert.equal(Object.keys(m.runtimeGuards).length,7);
});
test('read-only plan retains both files, then handles already-pruned build idempotently',t=>{
 const f=fixture(t);assert.equal(f.audit()[0].bytes,8);
 assert.equal(fs.readFileSync(path.join(f.root,'public'+original),'utf8'),'original');
 assert.ok(fs.existsSync(path.join(f.root,'dist/client'+original)));
 fs.unlinkSync(path.join(f.root,'dist/client'+original));assert.deepEqual(f.audit(),[]);
 assert.ok(fs.existsSync(path.join(f.root,'public'+original)));
});
for(const [name,change] of [
 ['original source changed',f=>f.write('public'+original,'changed!')],
 ['original build changed',f=>f.write('dist/client'+original,'changed!')],
 ['source display changed',f=>f.write('public'+display,'changed')],
 ['built display changed',f=>f.write('dist/client'+display,'changed')],
 ['source removed',f=>fs.unlinkSync(path.join(f.root,'public'+original))],
 ['display removed',f=>fs.unlinkSync(path.join(f.root,'dist/client'+display))],
 ['new JSON original reference',f=>f.write('data/new.json',JSON.stringify({original}))],
 ['new compiled original reference',f=>f.write('dist/client/chunk.js',JSON.stringify(original))],
 ['new CSS original reference',f=>f.write('dist/client/styles.css',`a{background:url(${original})}`)],
 ['server non-inventory original reference',f=>f.write('dist/server/index.js',JSON.stringify(original))],
 ['dynamic scoped path',f=>f.write('components/dynamic.ts','const base="/artist/tracer/";')],
 ['dynamic batch fragment',f=>f.write('components/dynamic.ts','const batch="dot-three-hero-20261016";')],
 ['changed renderer requiring re-audit',f=>f.write('components/hero.tsx','new generic original conversion')],
 ['missing runtime guards',f=>{f.manifest.runtimeGuards={};}],
 ['runtime guard traversal',f=>{f.manifest.runtimeGuards['../outside']={};}],
 ['new explicit original outside audited scope',f=>{f.manifest.files[0].path='/artist/other/original.jpg';}],
 ['expanded manifest',f=>{f.manifest.files.push({...f.manifest.files[0]});}],
 ['display no longer referenced',f=>f.write('data/tracer.json','{}')],
 ['symlink',f=>fs.symlinkSync('/tmp',path.join(f.root,'dist/client/link'))],
])test(`fails closed: ${name}`,t=>{const f=fixture(t);change(f);assert.throws(f.audit);});
