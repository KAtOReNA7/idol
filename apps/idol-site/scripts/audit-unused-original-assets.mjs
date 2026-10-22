// Read-only, hash-pinned build exclusion audit. Never removes public originals.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifestPath=fileURLToPath(new URL('./unused-original-assets-manifest.json',import.meta.url));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function files(dir){
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  if(e.isSymbolicLink())throw new Error(`Original audit rejects symlink: ${p}`);
  return e.isDirectory()?files(p):[p];
 });
}
function verify(p,expected){
 if(!fs.existsSync(p)||!fs.lstatSync(p).isFile()||fs.lstatSync(p).isSymbolicLink()||fs.statSync(p).size!==expected.bytes||sha(p)!==expected.sha256)
  throw new Error(`Original audit integrity mismatch: ${p}`);
}
export function auditUnusedOriginalAssets(root,manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))){
 const original='/artist/tracer/dot-three-hero-20261016/group.original.jpg';
 const display='/artist/tracer/dot-three-hero-20261016/group.display.jpg';
 if(manifest.files?.length!==1||manifest.files[0].path!==original||manifest.files[0].replacement!==display)
  throw new Error('Original audit only permits the single audited TRACER asset');
 const entry=manifest.files[0];
 // Rendering/URL-construction changes invalidate the audit, even when they use
 // string fragments and therefore evade exact-reference searches.
 if(!manifest.runtimeGuards||!Object.keys(manifest.runtimeGuards).length)throw new Error('Missing runtime guards');
 for(const [file,integrity] of Object.entries(manifest.runtimeGuards)){
  if(file.startsWith('/')||file.split('/').includes('..'))throw new Error('Invalid runtime guard');
  verify(path.join(root,file),integrity);
 }
 if(!fs.existsSync(path.join(root,'dist/server/index.js')))throw new Error('Build dist first');
 const ext=/\.(?:[cm]?js|jsx|ts|tsx|json|css|html|svg|txt|map)$/;
 const sources=['app','components','lib','hooks','data','db','public'].flatMap(d=>files(path.join(root,d))).filter(p=>ext.test(p));
 const texts=[...sources,...files(path.join(root,'dist')).filter(p=>ext.test(p))].map(p=>{
  let text=fs.readFileSync(p,'utf8');
  // Only vinext's recognized copied-public-file routing inventory is exempt.
  if(p===path.join(root,'dist/server/index.js'))text=text.replace(/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g,'new Set()');
  return {p,text};
 });
 for(const {p,text} of texts){
  if(text.includes(original))throw new Error(`Original referenced in ${p}`);
  if(text.replaceAll(display,'').includes('/artist/tracer/'))throw new Error(`New TRACER path or dynamic construction in ${p}`);
  if(sources.includes(p)&&!p.startsWith(path.join(root,'data')+path.sep)){
   // Other groups legitimately use this batch. Remove only complete literal
   // asset paths, then reject remaining batch fragments requiring manual review.
   const remainder=text.replace(/\/artist\/[a-z0-9]+\/dot-three-hero-20261016\/[a-z0-9.-]+/g,'');
   if(remainder.includes('dot-three-hero-20261016'))throw new Error(`Dynamic hero batch construction in ${p}`);
  }
 }
 if(!texts.some(({p,text})=>sources.includes(p)&&text.includes(display)))throw new Error('Active display no longer referenced');
 verify(path.join(root,'public',original),entry);
 verify(path.join(root,'public',display),entry.replacementIntegrity);
 verify(path.join(root,'dist/client',display),entry.replacementIntegrity);
 const built=path.join(root,'dist/client',original);
 if(!fs.existsSync(built))return [];
 verify(built,entry);
 return [{file:path.relative(root,built),bytes:entry.bytes}];
}
