import {youngposseAuditTexts} from './audit-youngposse-retained-originals.mjs';
// Audited 2026-10-17: five superseded directories, 91 display files, one unused original build copy.
// Also audits four byte-identical LOONA build copies; canonical public/build originals stay intact.
// Also excludes seven unreachable ifeye PNG original build copies; public/Git sources stay intact.
// Default is read-only. Run with --apply after reviewing dry-run output.
// Source originals in public/ are never modified. No general recursive pruning.
import {auditUdttPrivateBuildAssets} from './audit-udtt-private-build-assets.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {auditUnusedDisplayAssets} from './audit-unused-display-assets.mjs';
import {auditUnusedOriginalAssets} from './audit-unused-original-assets.mjs';
import {auditUnusedEditorialAssets} from './audit-unused-editorial-assets.mjs';
import {auditDuplicateLoonaBuildAssets} from './audit-duplicate-loona-build-assets.mjs';
import {auditUnusedUnisFontBuildAssets} from './audit-unused-unis-font-build-assets.mjs';
import {auditUnusedIfeyeOriginalBuildAssets} from './audit-unused-ifeye-original-build-assets.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const groups = ['fromis9', 'atheart', 'izna', 'genblue', 'loona'];
const old = 'batch-b-20261016';
// LOONA's active homepage/member lightboxes use the identical approved-home
// originals. Keep both those deployed originals and every public/ source.
const loonaOriginalPairs = [
 ['hero-original.jpg', 'hero.jpg'],
 ['portrait-heejin-original.jpg', 'heejin.jpg'],
 ['portrait-hyunjin-original.jpg', 'hyunjin.jpg'],
 ['portrait-haseul-original.jpg', 'haseul.jpg'],
 ['portrait-yeojin-original.jpg', 'yeojin.jpg'],
 ['portrait-vivi-original.jpg', 'vivi.jpg'],
 ['portrait-kim-lip-original.jpg', 'kim-lip.jpg'],
 ['portrait-jinsoul-original.jpg', 'jinsoul.jpg'],
 ['portrait-choerry-original.jpg', 'choerry.jpg'],
 ['portrait-yves-original.jpg', 'yves.jpg'],
 ['portrait-gowon-original.jpg', 'gowon.jpg'],
 ['portrait-olivia-hye-original.jpg', 'olivia-hye.jpg'],
];
const loonaExpectedFiles = [
 'hero-display.png', 'hero-original.jpg',
 'portrait-heejin-display.png', 'portrait-heejin-original.jpg',
 'portrait-hyunjin-display.png', 'portrait-hyunjin-original.jpg',
 'portrait-haseul-display.png', 'portrait-haseul-original.jpg',
 'portrait-yeojin-display.png', 'portrait-yeojin-original.jpg',
 'portrait-vivi-display.png', 'portrait-vivi-original.jpg',
 'portrait-kim-lip-display.png', 'portrait-kim-lip-original.jpg',
 'portrait-jinsoul-display.png', 'portrait-jinsoul-original.jpg',
 'portrait-choerry-display.png', 'portrait-choerry-original.jpg',
 'portrait-yves-display.png', 'portrait-yves-original.jpg',
 'portrait-gowon-display.png', 'portrait-gowon-original.jpg',
 'portrait-olivia-hye-display.png', 'portrait-olivia-hye-original.jpg',
].sort();
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const extensions = /\.(?:[cm]?js|jsx|ts|tsx|json|css|html|svg|txt)$/;
function files(dir) {
 if (!fs.existsSync(dir)) return [];
 return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
  const p=path.join(dir,e.name);
  if(e.isSymbolicLink()) throw new Error(`Symlink requires manual review: ${p}`);
  return e.isDirectory()?files(p):[p];
 });
}
const sources = ['app','components','lib','hooks','data','db'].flatMap(d=>files(path.join(root,d))).filter(p=>extensions.test(p));
const built = files(path.join(root,'dist')).filter(p=>extensions.test(p));
if (!fs.existsSync(path.join(root,'dist/server/index.js'))) throw new Error('Build dist first');
const texts = [...sources,...built].map(p=>{
 let text=fs.readFileSync(p,'utf8');
 // vinext enumerates every copied public file for static routing. This is not a
 // UI reference. Exclude only this recognized Set, not other JS/JSON strings.
 if(p===path.join(root,'dist/server/index.js')) text=text.replace(/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g,'new Set()');
 return {p,text};
});
const auditYoungposseText=youngposseAuditTexts(root);
// Fail closed if runtime code begins constructing an old batch path dynamically.
for(const {p,text:originalText} of texts.filter(x=>sources.includes(x.p)&&!x.p.includes('/data/'))) {
 const text=auditYoungposseText(p,originalText);
 // MADEIN originals remain in the archive; its explicitly scoped lightbox is not pruned.
 if(text.replaceAll(`/artist/madein/${old}/`,'').replaceAll(`${old}-webp-v1`,'').includes(old)) throw new Error(`Potential dynamic old batch path: ${p}`);
}
const plan=[];
for(const group of groups) {
 const prefix=`/artist/${group}/${old}/`;
 for(const {p,text} of texts) if(text.includes(prefix)) throw new Error(`Old directory referenced in ${p}: ${prefix}`);
 const data=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,`data/${group}-artist.json`),'utf8')));
 const replacement=`/artist/${group}/${old}-webp-v1/`;
 const refs=[...data.matchAll(/\/artist\/[^"\s]+/g)].map(m=>m[0]);
 if(!refs.some(r=>r.startsWith(replacement))) throw new Error(`No replacement references for ${group}`);
 for(const ref of refs) if(!fs.existsSync(path.join(root,'dist/client',ref))) throw new Error(`Missing active image: ${ref}`);
 const dir=path.join(root,'dist/client',prefix);
 const entries=files(dir); let bytes=0;
 if(group==='loona') {
  const sourceDir=path.join(root,'public',prefix);
  const names=(entries,base)=>entries.map(p=>path.relative(base,p)).sort();
  const expected=JSON.stringify(loonaExpectedFiles);
  if(JSON.stringify(names(files(sourceDir),sourceDir))!==expected) throw new Error('LOONA public source differs from audited 24-file list');
  // An absent/already-pruned directory is idempotent; a partial or expanded
  // nonempty directory fails closed rather than silently pruning new material.
  if(entries.length&&JSON.stringify(names(entries,dir))!==expected) throw new Error('LOONA build differs from audited 24-file list');
  for(const [original,active] of loonaOriginalPairs) {
   const source=path.join(sourceDir,original);
   const retained=path.join(root,'dist/client/artist/loona/approved-home',active);
   if(!fs.existsSync(retained)||hash(source)!==hash(retained)) throw new Error(`LOONA active original missing or different: ${original} -> ${active}`);
  }
 }
 for(const p of entries) {
  const relative=path.relative(path.join(root,'dist/client'),p);
  const source=path.join(root,'public',relative);
  if(!fs.existsSync(source)||hash(source)!==hash(p)) throw new Error(`No identical retained public source: ${relative}`);
  bytes+=fs.statSync(p).size;
 }
 plan.push({dir:path.relative(root,dir),files:entries.length,bytes});
}
const before=files(path.join(root,'dist/client')).reduce((n,p)=>n+fs.statSync(p).size,0);
// Validate all additional file-only candidates BEFORE any deletion occurs.
// The original-only auditor retains public/Git source and pins renderer integrity.
const ifeyeOriginalPlan=auditUnusedIfeyeOriginalBuildAssets(root);
const displayPlan=auditUnusedDisplayAssets(root);
const originalPlan=auditUnusedOriginalAssets(root);
const {plan:editorialPlan,skipped:editorialSkipped}=auditUnusedEditorialAssets(root);
const duplicateLoonaPlan=auditDuplicateLoonaBuildAssets(root);
const unisFontPlan=auditUnusedUnisFontBuildAssets(root);
const udttPrivatePlan=auditUdttPrivateBuildAssets(root);
const saved=udttPrivatePlan.reduce((n,p)=>n+p.bytes,0)+ifeyeOriginalPlan.reduce((n,p)=>n+p.bytes,0)+unisFontPlan.reduce((n,p)=>n+p.bytes,0)+duplicateLoonaPlan.reduce((n,p)=>n+p.bytes,0)+editorialPlan.reduce((n,p)=>n+p.bytes,0)+originalPlan.reduce((n,p)=>n+p.bytes,0)+plan.reduce((n,p)=>n+p.bytes,0)+displayPlan.reduce((n,p)=>n+p.bytes,0);
console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',plan,displayPlan,originalPlan,editorialPlan,editorialSkipped,duplicateLoonaPlan,unisFontPlan,ifeyeOriginalPlan,udttPrivatePlan,savedBytes:saved,clientBeforeBytes:before,clientAfterBytes:before-saved},null,2));
if(process.argv.includes('--apply')) {
 for(const {dir} of plan) fs.rmSync(path.join(root,dir),{recursive:true,force:true});
 for(const {file} of [...displayPlan,...originalPlan,...editorialPlan,...duplicateLoonaPlan,...unisFontPlan,...ifeyeOriginalPlan,...udttPrivatePlan]) fs.unlinkSync(path.join(root,file));
}
