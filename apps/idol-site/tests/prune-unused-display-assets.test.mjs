import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {auditUnusedDisplayAssets} from '../scripts/audit-unused-display-assets.mjs';
const old='/artist/example/batch-b-20261016/';
const replacement='/artist/example/batch-b-20261016-webp-v1/hero-display.webp';
const integrity=s=>({bytes:Buffer.byteLength(s),sha256:createHash('sha256').update(s).digest('hex')});
test('production manifest is the exact 91-file display-only audited scope',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../scripts/unused-display-assets-manifest.json',import.meta.url),'utf8'));
 assert.equal(m.files.length,91);
 assert.equal(new Set(m.files.map(f=>f.path)).size,91);
 assert.equal(m.files.reduce((sum,f)=>sum+f.bytes,0),20067223);
 assert.equal(Object.keys(m.groups).length,20);
 for(const f of m.files) {
  assert.match(f.path,/[.-]display\.(jpg|webp|png)$/);
  assert.doesNotMatch(f.path,/original|press-group-candidate/);
 }
 assert.equal(Object.values(m.groups).flatMap(g=>Object.keys(g)).filter(n=>n.includes('original')).length,92);
});
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'idol-display-audit-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{const target=path.join(root,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
 for(const base of ['public','dist/client']) {
  write(base+old+'hero-display.jpg','old-display');
  write(base+old+'hero-original.jpg','original-bytes');
  write(base+replacement,'current-webp');
 }
 write('data/example.json',JSON.stringify({image:replacement}));
 write('dist/server/index.js',`const paths = new Set(\`${old}hero-display.jpg,${old}hero-original.jpg\`.split(\`,\`));`);
 const manifest={version:1,groups:{example:{'hero-display.jpg':integrity('old-display'),'hero-original.jpg':integrity('original-bytes')}},files:[{path:old+'hero-display.jpg',...integrity('old-display'),replacement,replacementIntegrity:integrity('current-webp')}]};
 return {root,write,manifest,audit:()=>auditUnusedDisplayAssets(root,manifest)};
}
test('dry-run plans one display, preserves source and original; already pruned is idempotent',t=>{
 const f=fixture(t),before=fs.readFileSync(path.join(f.root,'dist/client'+old+'hero-original.jpg'));
 assert.equal(f.audit().length,1);
 assert.ok(fs.existsSync(path.join(f.root,'dist/client'+old+'hero-display.jpg')));
 assert.deepEqual(fs.readFileSync(path.join(f.root,'dist/client'+old+'hero-original.jpg')),before);
 fs.unlinkSync(path.join(f.root,'dist/client'+old+'hero-display.jpg'));
 assert.deepEqual(f.audit(),[]);
 assert.ok(fs.existsSync(path.join(f.root,'public'+old+'hero-display.jpg')));
});
for(const [name,change] of [
 ['source hash mismatch',f=>f.write('public'+old+'hero-display.jpg','bad-display')],
 ['build hash mismatch',f=>f.write('dist/client'+old+'hero-display.jpg','bad-display')],
 ['replacement hash mismatch',f=>f.write('dist/client'+replacement,'bad-webp')],
 ['new public file',f=>f.write('public'+old+'new.jpg','new')],
 ['new build file',f=>f.write('dist/client'+old+'new.jpg','new')],
 ['new old-path reference',f=>f.write('data/new.json',JSON.stringify({image:old+'hero-display.jpg'}))],
 ['new compiled reference',f=>f.write('dist/client/app.js',JSON.stringify(old+'hero-display.jpg'))],
 ['dynamic old-path construction',f=>f.write('components/dynamic.ts','const batch="batch-b-20261016";')],
 ['removed replacement reference',f=>f.write('data/example.json','{}')],
 ['missing original',f=>fs.unlinkSync(path.join(f.root,'dist/client'+old+'hero-original.jpg'))],
 ['original in allowlist',f=>{f.manifest.files[0].path=old+'hero-original.jpg';}],
 ['symlink',f=>fs.symlinkSync('/tmp',path.join(f.root,'dist/client'+old+'link'))],
]) test(`fails closed: ${name}`,t=>{const f=fixture(t);change(f);assert.throws(f.audit);});
