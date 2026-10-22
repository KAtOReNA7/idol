import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {youngposseAuditTexts} from '../scripts/audit-youngposse-retained-originals.mjs';
import {resolveAuditedCarriers} from '../scripts/audit-built-carriers.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'scripts/youngposse-original-retention-manifest.json'),'utf8'));
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'youngposse-retention-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const put=(name,body)=>{const p=path.join(dir,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);};
 const carriers=resolveAuditedCarriers(root,manifest.builtCarriers,'youngposse-design',manifest.importNormalizedCarriers);
 for(const name of [...Object.keys(manifest.runtimeGuards),...Object.keys(carriers)])put(name,fs.readFileSync(path.join(root,name)));
 for(const image of manifest.retainedImages)for(const prefix of ['public','dist/client'])put(prefix+image.path,fs.readFileSync(path.join(root,'public',image.path)));
 return {dir,put,carriers,audit:()=>youngposseAuditTexts(dir,manifest)};
}
test('all eighteen retained images survive; only the audited helper is adapted',t=>{
 const f=fixture(t),adapt=f.audit(),source=path.join(f.dir,manifest.component),text=fs.readFileSync(source,'utf8');
 assert.equal(adapt(source,text),text.replace(manifest.exactHelper,''));
 assert.equal(adapt(path.join(f.dir,'components/unknown.tsx'),manifest.exactHelper),manifest.exactHelper);
 assert.equal(manifest.retainedImages.length,18);
 for(const image of manifest.retainedImages)for(const prefix of ['public','dist/client'])assert.ok(fs.existsSync(path.join(f.dir,prefix+image.path)));
});
for(const [name,change]of [
 ['changed source helper',f=>fs.appendFileSync(path.join(f.dir,manifest.component),manifest.exactHelper)],
 ['changed source data',f=>fs.appendFileSync(path.join(f.dir,manifest.data),' ')],
 ['missing original build image',f=>fs.unlinkSync(path.join(f.dir,'dist/client',manifest.retainedImages[12].path))],
 ['changed retained display',f=>fs.appendFileSync(path.join(f.dir,'public',manifest.retainedImages[0].path),'x')],
 ['duplicate compiled helper',f=>fs.appendFileSync(path.join(f.dir,Object.keys(f.carriers)[0]),manifest.compiledHelper)],
])test('fails closed: '+name,t=>{const f=fixture(t);change(f);assert.throws(f.audit,/integrity/);});
