import {youngposseAuditTexts} from './audit-youngposse-retained-originals.mjs';
// Fixed, audited build-only allowlist. This module never deletes files.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolveAuditedCarriers} from './audit-built-carriers.mjs';
import {auditUnusedIfeyeOriginalBuildAssets,ifeyeUnusedOriginalPaths} from './audit-unused-ifeye-original-build-assets.mjs';
const manifestPath = fileURLToPath(new URL('./unused-display-assets-manifest.json', import.meta.url));
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wooahOriginal='/artist/wooah/batch-b-20261016/group-original.png';
const wooahIntegrity={bytes:761234,sha256:'b499e3fde0e51cf12cd069675d7a10442a7e4e3656f2edb0ffd04de62cf5e189'};
const wooahSources=['data/wooah-editorial.json','lib/idol/wooah-editorial.ts','components/wooah/editorial.tsx'];
function files(dir) {
 if (!fs.existsSync(dir)) return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  if(e.isSymbolicLink()) throw new Error(`Display audit rejects symlink: ${p}`);
  return e.isDirectory()?files(p):[p];
 });
}
function verify(p, expected) {
 if(!expected||!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink()||!fs.lstatSync(p).isFile()||fs.statSync(p).size!==expected.bytes||sha(p)!==expected.sha256)
  throw new Error(`Display audit integrity mismatch: ${p}`);
}
// One retained original is now consumed by WOOAH's native page. A literal-only
// exception is insufficient: later code could transform it into group-display.
// Pin the three reviewed source files and two whole carriers before adapting
// only their one exact runtime property. This is a local retention guard, not a
// general proof of arbitrary runtime URL construction. No other text is exempt.
export function wooahRetainedOriginalAuditTexts(root, retention) {
 root=path.resolve(root);
 const names=Object.keys(retention?.runtimeGuards??{}).sort();
 if(retention?.path!==wooahOriginal||JSON.stringify(names)!==JSON.stringify([...wooahSources].sort())) throw new Error('WOOAH retained source scope changed');
 for(const name of wooahSources) verify(path.join(root,name),retention.runtimeGuards[name]);
 for(const base of ['public','dist/client']) verify(path.join(root,base,wooahOriginal),wooahIntegrity);
 const data=JSON.parse(fs.readFileSync(path.join(root,wooahSources[0]),'utf8'));
 if(data.hero?.runtime!==wooahOriginal||data.hero.bytes!==wooahIntegrity.bytes||data.hero.sha256!==wooahIntegrity.sha256) throw new Error('WOOAH retained hero descriptor changed');
 const carriers=Object.keys(resolveAuditedCarriers(root,retention.builtCarriers,'editorial'));
 const permitted=new Set([wooahSources[0],...carriers]);
 const reviewedTexts=new Map([...permitted].map(name=>[name,fs.readFileSync(path.join(root,name),'utf8')]));
 const adapt=(file,text)=>{
  const relative=path.relative(root,file).split(path.sep).join('/');
  if(!permitted.has(relative)) return text;
  if(text!==reviewedTexts.get(relative)) throw new Error('WOOAH retained text differs from reviewed file: '+relative);
  const literal=relative===wooahSources[0]?`"runtime": "${wooahOriginal}"`:'runtime:`'+wooahOriginal+'`';
  if(text.split(wooahOriginal).length!==2||text.split(literal).length!==2) throw new Error('WOOAH exact retained literal changed: '+relative);
  return text.replace(literal,relative===wooahSources[0]?'"runtime": ""':'runtime:``');
 };
 // Require both emitted copies to contain the reviewed literal exactly once.
 for(const [name,text] of reviewedTexts) adapt(path.join(root,name),text);
 return adapt;
}
export function auditUnusedDisplayAssets(root, manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))) {
 const ext=/\.(?:[cm]?js|jsx|ts|tsx|json|css|html|svg|txt)$/;
 const sources=['app','components','lib','hooks','data','db'].flatMap(d=>files(path.join(root,d))).filter(p=>ext.test(p));
 const built=files(path.join(root,'dist')).filter(p=>ext.test(p));
 const texts=[...sources,...built].map(p=>{
  let text=fs.readFileSync(p,'utf8');
  if(p===path.join(root,'dist/server/index.js')) text=text.replace(/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g,'new Set()');
  return {p,text};
 });
 if(!fs.existsSync(path.join(root,'dist/server/index.js'))) throw new Error('Build dist first');
 const batch='batch-b-20261016';
 const auditYoungposseText=youngposseAuditTexts(root);
 const auditWooahText=manifest.wooahRetainedOriginal?wooahRetainedOriginalAuditTexts(root,manifest.wooahRetainedOriginal):(_file,text)=>text;
 if(manifest.wooahRetainedOriginal) {
  const retained=manifest.groups?.wooah?.['group-original.png'];
  if(retained?.bytes!==wooahIntegrity.bytes||retained?.sha256!==wooahIntegrity.sha256) throw new Error('WOOAH retained inventory changed');
 }
 // Any newly introduced dynamic old-batch construction requires manual audit.
 for(const {p,text:originalText} of texts.filter(x=>sources.includes(x.p)&&!x.p.startsWith(path.join(root,'data')+path.sep))) {
  const text=auditYoungposseText(p,originalText);
  if(text.replaceAll(`/artist/madein/${batch}/`,'').replaceAll(`${batch}-webp-v1`,'').includes(batch))
   throw new Error(`Potential dynamic old batch path: ${p}`);
 }
 const selected=new Map();
 for(const entry of manifest.files) {
  if(!/^\/artist\/[a-z0-9]+\/batch-b-20261016\/[^/]+[.-]display\.(?:jpg|png|webp)$/.test(entry.path)||entry.path.includes('original')||selected.has(entry.path))
   throw new Error(`Invalid display-only allowlist entry: ${entry.path}`);
  selected.set(entry.path,entry);
 }
 const plan=[];
 let verifiedIfeyeExclusion=false;
 for(const [group,inventory] of Object.entries(manifest.groups)) {
  if(!/^[a-z0-9]+$/.test(group)) throw new Error('Invalid audited group');
  const prefix=`/artist/${group}/${batch}/`, sourceDir=path.join(root,'public',prefix), buildDir=path.join(root,'dist/client',prefix);
  for(const {p,text} of texts) if(auditWooahText(p,text).includes(prefix)) throw new Error(`Old display directory referenced in ${p}: ${prefix}`);
  const actual=files(sourceDir).map(p=>path.relative(sourceDir,p)).sort();
  if(JSON.stringify(actual)!==JSON.stringify(Object.keys(inventory).sort())) throw new Error(`Public inventory changed: ${group}`);
  for(const [name,expected] of Object.entries(inventory)) {
   if(name!==path.basename(name)) throw new Error('Invalid inventory filename');
   verify(path.join(sourceDir,name),expected);
   const deployed=path.join(buildDir,name),entry=selected.get(prefix+name);
   // Missing displays are an idempotent prior prune. Originals remain mandatory,
   // except the seven separately hash/reference/renderer-audited ifeye exclusions.
   if(!entry&&!fs.existsSync(deployed)&&ifeyeUnusedOriginalPaths.includes(prefix+name)) {
    if(!verifiedIfeyeExclusion) {auditUnusedIfeyeOriginalBuildAssets(root);verifiedIfeyeExclusion=true;}
   } else if(!entry||fs.existsSync(deployed)) verify(deployed,expected);
  }
  for(const p of files(buildDir)) if(!Object.hasOwn(inventory,path.relative(buildDir,p))) throw new Error(`Unknown build asset: ${p}`);
 }
 for(const entry of selected.values()) {
  const parts=entry.path.split('/'),group=parts[2],name=parts[4],expected=manifest.groups[group]?.[name];
  if(!expected||expected.bytes!==entry.bytes||expected.sha256!==entry.sha256) throw new Error(`Display not in audited inventory: ${entry.path}`);
  if(!entry.replacement.startsWith(`/artist/${group}/${batch}-webp-v1/`)||entry.replacement.includes('..')) throw new Error('Invalid replacement path');
  if(!texts.some(({p,text})=>sources.includes(p)&&text.includes(entry.replacement))) throw new Error(`Replacement not referenced: ${entry.replacement}`);
  verify(path.join(root,'public',entry.replacement),entry.replacementIntegrity);
  verify(path.join(root,'dist/client',entry.replacement),entry.replacementIntegrity);
  const p=path.join(root,'dist/client',entry.path);
  if(fs.existsSync(p)) {
   verify(p,entry);
   plan.push({file:path.relative(root,p),bytes:entry.bytes});
  }
 }
 return plan;
}
