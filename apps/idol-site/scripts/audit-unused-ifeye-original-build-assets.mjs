import {youngposseAuditTexts} from './audit-youngposse-retained-originals.mjs';
// Read-only, fixed seven-file deployment exclusion. Never changes source or image bytes.
// Re-audit after a renderer/hash/reference change; absence in a text search alone is insufficient.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifestPath=fileURLToPath(new URL('./unused-ifeye-original-build-assets-manifest.json',import.meta.url));
const oldPrefix='/artist/ifeye/batch-b-20261016/';
const activePrefix='/artist/ifeye/batch-b-20261016-webp-v1/';
const stems=Object.freeze(['group','kasia','meu','rahee','sasha','taerin','won-hwayeon']);
export const ifeyeUnusedOriginalPaths=Object.freeze(stems.map(name=>`${oldPrefix}${name}-original.png`));
const guardPaths=Object.freeze([
 'app/artists/ifeye/page.tsx','components/candidate/ifeye-design.tsx',
 'components/candidate-artist-experience.tsx','components/candidate-index-card.tsx',
 'lib/idol/candidate/portrait.ts','components/reliable-image.tsx',
 'components/photo-lightbox.tsx','lib/idol/image-presentation.ts',
]);
const ext=/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/;
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function files(dir) {
 if(!fs.existsSync(dir))return [];
 if(fs.lstatSync(dir).isSymbolicLink())throw new Error(`ifeye audit rejects symlink: ${dir}`);
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  if(e.isSymbolicLink())throw new Error(`ifeye audit rejects symlink: ${p}`);
  return e.isDirectory()?files(p):[p];
 });
}
function verify(p,expected) {
 if(!expected||!Number.isSafeInteger(expected.bytes)||expected.bytes<=0||!/^[a-f0-9]{64}$/.test(expected.sha256)||
  !fs.existsSync(p)||!fs.lstatSync(p).isFile()||fs.lstatSync(p).isSymbolicLink()||fs.statSync(p).size!==expected.bytes||hash(p)!==expected.sha256)
  throw new Error(`ifeye integrity mismatch: ${p}`);
}
const sameSet=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
export function auditUnusedIfeyeOriginalBuildAssets(root,manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))) {
 root=path.resolve(root);
 const auditYoungposseText=youngposseAuditTexts(root);
 if(fs.lstatSync(root).isSymbolicLink())throw new Error('ifeye audit rejects symlink root');
 if(!manifest||manifest.version!==1||!Array.isArray(manifest.files)||!sameSet(manifest.files.map(e=>e.path),ifeyeUnusedOriginalPaths))
  throw new Error('ifeye audit only permits the exact seven reviewed originals');
 if(!manifest.runtimeGuards||!sameSet(Object.keys(manifest.runtimeGuards),guardPaths))throw new Error('ifeye runtime guard list changed');
 // Guard all known URL-selection/rendering code, including the shared member/index paths.
 for(const p of guardPaths)verify(path.join(root,p),manifest.runtimeGuards[p]);
 const index=path.join(root,'dist/server/index.js');
 if(!fs.existsSync(index))throw new Error('Build dist first');
 const sourceFiles=['app','components','lib','hooks','data','db','public','vendor'].flatMap(d=>files(path.join(root,d)));
 sourceFiles.push(...fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(root,e.name)));
 const sources=sourceFiles.filter(p=>ext.test(p));
 const publicFiles=files(path.join(root,'public'));
 const inventory=publicFiles.map(p=>'/'+path.relative(path.join(root,'public'),p).split(path.sep).join('/'));
 const expectedOld=stems.flatMap(n=>[`${n}-original.png`,`${n}-display.jpg`]);
 const sourceOld=path.join(root,'public',oldPrefix),buildOld=path.join(root,'dist/client',oldPrefix);
 if(!sameSet(files(sourceOld).map(p=>path.relative(sourceOld,p)),expectedOld))throw new Error('ifeye source inventory changed');
 if(files(buildOld).some(p=>!expectedOld.includes(path.relative(buildOld,p))))throw new Error('ifeye build inventory changed');
 const texts=[...sources,...files(path.join(root,'dist')).filter(p=>ext.test(p))].map(p=>{
  let text=fs.readFileSync(p,'utf8').replaceAll('\\/','/');
  if(p===index) {
   const pattern=/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g;
   const matches=[...text.matchAll(pattern)];
   // Exempt exactly one full copied-public routing inventory, never a partial/custom Set.
   if(matches.length!==1||!sameSet(matches[0][1].split(','),inventory))throw new Error('ifeye unrecognized public routing inventory');
   text=text.replace(pattern,'new Set()');
  }
  return {p,text};
 });
 for(const {p,text:originalText} of texts) {
  const text=auditYoungposseText(p,originalText);
  if(text.includes(oldPrefix))throw new Error(`ifeye unused original directory referenced: ${p}`);
  // A dynamically assembled group/batch URL is not proven unreachable.
  // Exempt only complete current asset literals and MADEIN's existing original scope.
  const remainder=text.replaceAll(activePrefix,'').replaceAll('/artist/madein/batch-b-20261016/','').replaceAll('batch-b-20261016-webp-v1','').replace(/\/artist\/(?!ifeye\/)[a-z0-9]+\/batch-b-20261016\/[a-z0-9.-]+/g,'');
  if(remainder.includes('/artist/ifeye/')||remainder.includes('batch-b-20261016'))throw new Error(`ifeye possible dynamic old image path: ${p}`);
 }
 const plan=[];
 for(const entry of manifest.files) {
  const stem=stems[ifeyeUnusedOriginalPaths.indexOf(entry.path)];
  if(entry.replacement!==`${activePrefix}${stem}-display.webp`)throw new Error('ifeye replacement scope changed');
  if(!texts.some(({p,text})=>sources.includes(p)&&text.includes(entry.replacement)))throw new Error(`ifeye active display unreferenced: ${entry.replacement}`);
  verify(path.join(root,'public',entry.path),entry);
  verify(path.join(root,'public',entry.replacement),entry.replacementIntegrity);
  verify(path.join(root,'dist/client',entry.replacement),entry.replacementIntegrity);
  const built=path.join(root,'dist/client',entry.path);
  if(fs.existsSync(built)) {verify(built,entry);plan.push({file:path.relative(root,built),bytes:entry.bytes});}
 }
 return plan;
}
