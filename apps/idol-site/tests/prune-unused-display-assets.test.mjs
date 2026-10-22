import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {auditUnusedDisplayAssets,wooahRetainedOriginalAuditTexts} from '../scripts/audit-unused-display-assets.mjs';
import {resolveAuditedCarriers} from '../scripts/audit-built-carriers.mjs';
const projectRoot=fileURLToPath(new URL('..',import.meta.url));
const production=JSON.parse(fs.readFileSync(new URL('../scripts/unused-display-assets-manifest.json',import.meta.url),'utf8'));
const youngposse=JSON.parse(fs.readFileSync(new URL('../scripts/youngposse-original-retention-manifest.json',import.meta.url),'utf8'));
const old='/artist/example/batch-b-20261016/';
const replacement='/artist/example/batch-b-20261016-webp-v1/hero-display.webp';
const integrity=s=>({bytes:Buffer.byteLength(s),sha256:createHash('sha256').update(s).digest('hex')});
test('production manifest retains the current 85-file display-only scope, excluding retained YOUNG POSSE',()=>{
 const m=production;
 assert.equal(m.files.length,85);
 assert.equal(new Set(m.files.map(f=>f.path)).size,85);
 assert.equal(m.files.reduce((sum,f)=>sum+f.bytes,0),19708649);
 assert.equal(Object.keys(m.groups).length,19);
 for(const f of m.files) {
  assert.match(f.path,/[.-]display\.(jpg|webp|png)$/);
  assert.doesNotMatch(f.path,/original|press-group-candidate/);
 }
 assert.equal(Object.values(m.groups).flatMap(g=>Object.keys(g)).filter(n=>n.includes('original')).length,86);
 assert.ok(!m.groups.youngposse);
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
 // Exercise the real unconditional YOUNG POSSE prerequisite. A missing guard
 // must not make every negative fixture pass before reaching its target check.
 const carriers=resolveAuditedCarriers(projectRoot,youngposse.builtCarriers,'youngposse-design',youngposse.importNormalizedCarriers);
 for(const name of [...Object.keys(youngposse.runtimeGuards),...Object.keys(carriers)]) write(name,fs.readFileSync(path.join(projectRoot,name)));
 for(const image of youngposse.retainedImages) for(const base of ['public','dist/client']) write(base+image.path,fs.readFileSync(path.join(projectRoot,'public',image.path)));
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

const wooahOriginal='/artist/wooah/batch-b-20261016/group-original.png';
const wooahDisplay='/artist/wooah/batch-b-20261016/group-display.jpg';
const wooahSources=['data/wooah-editorial.json','lib/idol/wooah-editorial.ts','components/wooah/editorial.tsx'];
const syntheticCarriers=['dist/client/_next/static/chunks/editorial-12345678.js','dist/server/ssr/_next/static/editorial-abcdefgh.js'];
function addWooah(f) {
 const image=production.groups.wooah['group-original.png'];
 const hero={runtime:wooahOriginal,bytes:image.bytes,sha256:image.sha256};
 const bodies=[JSON.stringify({hero},null,2),"import design from '../../data/wooah-editorial.json'; export {design};",'const Picture=({asset})=><img src={asset.runtime}/>;'];
 const retention={path:wooahOriginal,runtimeGuards:{},builtCarriers:{}};
 for(const [i,name] of wooahSources.entries()){f.write(name,bodies[i]);retention.runtimeGuards[name]=integrity(bodies[i]);}
 const compiled='const design={hero:{runtime:`'+wooahOriginal+'`,bytes:'+image.bytes+',sha256:`'+image.sha256+'`}};export{design};';
 for(const name of syntheticCarriers){f.write(name,compiled);retention.builtCarriers[name]=integrity(compiled);}
 const display=production.files.find(f=>f.path===wooahDisplay);
 for(const base of ['public','dist/client']) for(const name of [wooahOriginal,wooahDisplay,display.replacement]) f.write(base+name,fs.readFileSync(path.join(projectRoot,'public',name)));
 f.write('data/wooah-replacement.json',JSON.stringify({image:display.replacement}));
 f.manifest.groups.wooah=structuredClone(production.groups.wooah);
 f.manifest.files.push(structuredClone(display));
 f.manifest.wooahRetainedOriginal=retention;
 return {...f,retention,compiled,adapt:()=>wooahRetainedOriginalAuditTexts(f.root,retention)};
}
test('WOOAH exact original literal is retained in public and build; only displays enter the dry-run plan',t=>{
 const f=addWooah(fixture(t));
 const before=['public','dist/client'].map(base=>fs.readFileSync(path.join(f.root,base,wooahOriginal)));
 const plan=f.audit();
 assert.equal(plan.length,2);
 assert.ok(plan.some(p=>p.file==='dist/client'+wooahDisplay));
 assert.ok(plan.every(p=>!p.file.includes('original')));
 for(const [i,base] of ['public','dist/client'].entries()) assert.deepEqual(fs.readFileSync(path.join(f.root,base,wooahOriginal)),before[i]);
 fs.unlinkSync(path.join(f.root,'dist/client',wooahDisplay));
 assert.equal(f.audit().length,1);
 assert.ok(fs.existsSync(path.join(f.root,'dist/client',wooahOriginal)));
});
test('WOOAH adapter only adapts one reviewed data literal and the two pinned carriers',t=>{
 const f=addWooah(fixture(t)),adapt=f.adapt();
 for(const name of [wooahSources[0],...syntheticCarriers]) assert.ok(!adapt(path.join(f.root,name),fs.readFileSync(path.join(f.root,name),'utf8')).includes(wooahOriginal));
 assert.equal(adapt(path.join(f.root,'data/unknown.json'),f.compiled),f.compiled);
 assert.equal(adapt(path.join(f.root,'dist/client/unknown.js'),f.compiled),f.compiled);
 assert.throws(()=>adapt(path.join(f.root,syntheticCarriers[0]),f.compiled+'design.hero.runtime=design.hero.runtime.replace("original.png","display.jpg");'),/differs from reviewed/);
});
for(const [name,change,error] of [
 ['source data descriptor drift',f=>f.write(wooahSources[0],JSON.stringify({hero:{runtime:wooahDisplay}})),/integrity mismatch/],
 ['source consumer transforms runtime',f=>f.write(wooahSources[2],'const Picture=({asset})=><img src={asset.runtime.replace("original.png","display.jpg")}/>;'),/integrity mismatch/],
 ['source data helper mutates runtime',f=>f.write(wooahSources[1],'design.hero.runtime=design.hero.runtime.replace("original.png","display.jpg");'),/integrity mismatch/],
 ['unknown JSON uses exact original',f=>f.write('data/unknown.json',JSON.stringify({runtime:wooahOriginal})),/Old display directory referenced/],
 ['unknown source uses exact original',f=>f.write('components/unknown.ts','const image="'+wooahOriginal+'";'),/Potential dynamic old batch path/],
 ['unknown source transforms exact original',f=>f.write('components/unknown.ts','const image="'+wooahOriginal+'".replace("original.png","display.jpg");'),/Potential dynamic old batch path/],
 ['unknown source builds directory dynamically',f=>f.write('components/unknown.ts','const image="/artist/wooah/"+"batch-b-20261016"+"/group-display.jpg";'),/Potential dynamic old batch path/],
 ['unknown compiled uses exact original',f=>f.write('dist/client/unknown.js',f.compiled),/Old display directory referenced/],
 ['unknown compiled directly references display',f=>f.write('dist/client/unknown.js',JSON.stringify(wooahDisplay)),/Old display directory referenced/],
 ['pinned carrier transforms literal',f=>f.write(syntheticCarriers[0],f.compiled.replace('`'+wooahOriginal+'`','`'+wooahOriginal+'`.replace("original.png","display.jpg")')),/Compiled carrier integrity mismatch/],
 ['pinned carrier concatenates literal',f=>f.write(syntheticCarriers[0],f.compiled.replace('`'+wooahOriginal+'`','`'+wooahOriginal+'`+"?display"')),/Compiled carrier integrity mismatch/],
 ['pinned carrier mutates after valid descriptor',f=>f.write(syntheticCarriers[0],f.compiled+'design.hero.runtime=design.hero.runtime.replace("original.png","display.jpg");'),/Compiled carrier integrity mismatch/],
 ['extra carrier with exact literal',f=>f.write('dist/client/_next/static/chunks/editorial-87654321.js',f.compiled),/missing or ambiguous/],
 ['missing carrier',f=>fs.unlinkSync(path.join(f.root,syntheticCarriers[0])),/missing or ambiguous/],
 ['symlink carrier',f=>{fs.unlinkSync(path.join(f.root,syntheticCarriers[0]));fs.symlinkSync(path.join(f.root,syntheticCarriers[1]),path.join(f.root,syntheticCarriers[0]));},/rejects symlink/],
 ['source original drift',f=>f.write('public'+wooahOriginal,'different original'),/integrity mismatch/],
 ['missing build original',f=>fs.unlinkSync(path.join(f.root,'dist/client',wooahOriginal)),/integrity mismatch/],
 ['original selected for deletion',f=>f.manifest.files.push({path:wooahOriginal,...production.groups.wooah['group-original.png']}),/Invalid display-only allowlist/],
 ['retained inventory scope drift',f=>f.manifest.groups.wooah['group-original.png'].bytes++,/WOOAH retained inventory changed/],
 ['source pin inventory expansion',f=>f.retention.runtimeGuards['data/unknown.json']=integrity('{}'),/WOOAH retained source scope changed/],
 ['path exception expands to display',f=>{f.retention.path=wooahDisplay;},/WOOAH retained source scope changed/],
]) test('WOOAH fails closed: '+name,t=>{const f=addWooah(fixture(t));change(f);assert.throws(f.audit,error);});
