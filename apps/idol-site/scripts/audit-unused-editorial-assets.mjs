// Narrow read-only audit: only the ten unwired 2026-10-18 editorial build copies.
// Public originals and their data/modules are never edited. Unknown state fails closed.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./unused-editorial-assets-manifest.json', import.meta.url)), 'utf8'));
const extensions = /\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/;
const hash = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function files(dir) {
 if (!fs.existsSync(dir)) return [];
 if (fs.lstatSync(dir).isSymbolicLink()) throw new Error(`Editorial audit rejects symlink: ${dir}`);
 return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
  const p = path.join(dir,e.name);
  if(e.isSymbolicLink()) throw new Error(`Editorial audit rejects symlink: ${p}`);
  return e.isDirectory() ? files(p) : [p];
 });
}
function verify(file, entry) {
 if(!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile() || fs.statSync(file).size !== entry.bytes || hash(file) !== entry.sha256)
  throw new Error(`Editorial integrity mismatch: ${file}`);
}
export function auditUnusedEditorialAssets(root) {
 if(!fs.existsSync(path.join(root,'dist/server/index.js'))) throw new Error('Build dist first');
 const sourceFiles = ['app','components','lib','hooks','data','db','public','vendor'].flatMap(d=>files(path.join(root,d)));
 // Also inspect root-level runtime/config entrypoints, without tooling/test fixtures.
 sourceFiles.push(...fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(root,e.name)));
 const sources = sourceFiles.filter(p=>extensions.test(p));
 const built = files(path.join(root,'dist')).filter(p=>extensions.test(p));
 const inventory=JSON.stringify(files(path.join(root,'public')).map(p=>'/'+path.relative(path.join(root,'public'),p).split(path.sep).join('/')).sort());
 const texts = [...sources,...built].map(p=> {
  let text=fs.readFileSync(p,'utf8');
  if(p===path.join(root,'dist/server/index.js')) {
   const pattern=/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g;
   const matches=[...text.matchAll(pattern)];
   // Exempt only one exact full public inventory, not arbitrary Sets of URLs.
   if(matches.length===1 && JSON.stringify(matches[0][1].split(',').sort())===inventory) text=text.replace(pattern,'new Set()');
  }
  // JSON/JS escaped slashes must not hide a reference.
  return {p,text:text.replaceAll('\\/', '/')};
 });
 const plan=[], skipped=[];
 const knownLayers = new Set(['unis','kep1er'].flatMap(g=>[
  path.join(root,`data/${g}-figma-editorial.json`), path.join(root,`lib/idol/${g}-editorial.ts`)
 ]));
 for(const group of ['unis','kep1er']) {
  const prefix=`/artist/${group}/editorial-20261018/`;
  const entries=manifest[group];
  if(!Array.isArray(entries)||entries.length!==5||new Set(entries.map(e=>e.image)).size!==5||entries.some(e=>!e.image.startsWith(prefix)||!/^[-a-z0-9]+\.(jpg|png)$/.test(e.image.slice(prefix.length))||!/^[a-f0-9]{64}$/.test(e.sha256)||!Number.isSafeInteger(e.bytes)||e.bytes<=0)) throw new Error(`Invalid editorial allowlist: ${group}`);
  const dataPath=path.join(root,`data/${group}-figma-editorial.json`);
  const modulePath=path.join(root,`lib/idol/${group}-editorial.ts`);
  if(!fs.existsSync(modulePath)||fs.lstatSync(modulePath).isSymbolicLink()) throw new Error(`Missing editorial module: ${group}`);
  const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
  const normalize=items=>JSON.stringify(items.map(({image,sha256,bytes})=>({image,sha256,bytes})).sort((a,b)=>a.image.localeCompare(b.image)));
  if(!Array.isArray(data.assets)||normalize(data.assets)!==normalize(entries)) throw new Error(`Editorial JSON differs from audited SHA list: ${group}`);
  const sourceDir=path.join(root,'public',prefix), buildDir=path.join(root,'dist/client',prefix);
  const expected=entries.map(e=>e.image.slice(prefix.length)).sort();
  if(JSON.stringify(files(sourceDir).map(p=>path.relative(sourceDir,p)).sort())!==JSON.stringify(expected)) throw new Error(`Unexpected or missing editorial source file: ${group}`);
  const copies=files(buildDir);
  if(copies.some(p=>!expected.includes(path.relative(buildDir,p)))) throw new Error(`Unexpected editorial build file: ${group}`);
  for(const entry of entries) {
   verify(path.join(root,'public',entry.image),entry);
   const copy=path.join(root,'dist/client',entry.image);
   if(fs.existsSync(copy)) verify(copy,entry);
  }
  const consumers=texts.filter(({p,text})=> {
   if(p===dataPath||p===modulePath) return false;
   return text.includes(prefix.slice(0,-1)) || entries.some(e=>text.includes(path.basename(e.image))) ||
    text.includes(`${group}-editorial`) || text.includes(`${group}-figma-editorial`) ||
    (!knownLayers.has(p) && text.includes('editorial-20261018'));
  }).map(({p})=>path.relative(root,p));
  if(consumers.length) { skipped.push({group,reason:'Potential runtime consumer; retain entire group',consumers}); continue; }
  for(const entry of entries) {
   const file=path.join(root,'dist/client',entry.image);
   if(fs.existsSync(file)) plan.push({file:path.relative(root,file),bytes:entry.bytes});
  }
 }
 return {plan,skipped};
}
