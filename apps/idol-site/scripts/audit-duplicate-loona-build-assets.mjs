// Read-only, exact-byte deduplication audit. Only four BUILD copies may be pruned.
// Both public originals and every canonical approved-home build copy are retained.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./duplicate-loona-build-assets-manifest.json', import.meta.url)), 'utf8'));
const names = ['chuu.jpg','unit-13.jpg','unit-oec.jpg','unit-yyxy.jpg'];
const oldPrefix = '/artist/loona/independent-v2/';
const canonicalPrefix = '/artist/loona/approved-home/';
const extensions = /\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/;
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function files(dir) {
 if (!fs.existsSync(dir)) return [];
 if (fs.lstatSync(dir).isSymbolicLink()) throw new Error(`LOONA dedup rejects symlink: ${dir}`);
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const file=path.join(dir,entry.name);
  if(entry.isSymbolicLink()) throw new Error(`LOONA dedup rejects symlink: ${file}`);
  return entry.isDirectory()?files(file):[file];
 });
}
function verify(file,entry) {
 if(!fs.existsSync(file)||fs.lstatSync(file).isSymbolicLink()||!fs.statSync(file).isFile()||fs.statSync(file).size!==entry.bytes||sha(file)!==entry.sha256)
  throw new Error(`LOONA dedup integrity mismatch: ${file}`);
}
export function auditDuplicateLoonaBuildAssets(root) {
 root=path.resolve(root);
 if(!fs.existsSync(path.join(root,'dist/server/index.js'))) throw new Error('Build dist first');
 if(manifest.files.length!==names.length || manifest.files.some((entry,index)=>
  entry.path!==oldPrefix+names[index] || entry.replacement!==canonicalPrefix+names[index] ||
  !/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isSafeInteger(entry.bytes) || entry.bytes<=0 ||
  !Number.isSafeInteger(entry.width) || entry.width<=0 || !Number.isSafeInteger(entry.height) || entry.height<=0))
  throw new Error('Invalid four-file LOONA duplicate allowlist');
 const sourceFiles=['app','components','lib','hooks','data','db','public','vendor'].flatMap(dir=>files(path.join(root,dir)));
 sourceFiles.push(...fs.readdirSync(root,{withFileTypes:true}).filter(entry=>entry.isFile()).map(entry=>path.join(root,entry.name)));
 const sources=sourceFiles.filter(file=>extensions.test(file));
 const built=files(path.join(root,'dist')).filter(file=>extensions.test(file));
 const inventory=JSON.stringify(files(path.join(root,'public')).map(file=>'/'+path.relative(path.join(root,'public'),file).split(path.sep).join('/')).sort());
 const texts=[...sources,...built].map(file=>{
  let text=fs.readFileSync(file,'utf8');
  if(file===path.join(root,'dist/server/index.js')) {
   const pattern=/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g;
   const matches=[...text.matchAll(pattern)];
   // Exempt only the one exact full public inventory. A partial Set, second Set,
   // or any reference outside that inventory remains a consumer and blocks pruning.
   if(matches.length===1 && JSON.stringify(matches[0][1].split(',').sort())===inventory) text=text.replace(pattern,'new Set()');
  }
  return {file,text:text.replaceAll('\\/','/')};
 });
 for(const {file,text} of texts) {
  // Also reject a standalone directory fragment used in dynamic construction.
  if(text.includes('independent-v2')) throw new Error(`LOONA duplicate runtime consumer: ${path.relative(root,file)}`);
 }
 const plan=[];
 for(const entry of manifest.files) {
  // Verify all four copies against one immutable byte/hash identity; missing old
  // build copies alone are permitted for repeatable, already-pruned builds.
  verify(path.join(root,'public',entry.path),entry);
  verify(path.join(root,'public',entry.replacement),entry);
  verify(path.join(root,'dist/client',entry.replacement),entry);
  if(!texts.some(({file,text})=>sources.includes(file)&&text.includes(entry.replacement)))
   throw new Error(`LOONA canonical source no longer referenced: ${entry.replacement}`);
  if(!texts.some(({file,text})=>built.includes(file)&&text.includes(entry.replacement)))
   throw new Error(`LOONA canonical build no longer referenced: ${entry.replacement}`);
  const file=path.join(root,'dist/client',entry.path);
  if(fs.existsSync(file)) {
   verify(file,entry);
   plan.push({file:path.relative(root,file),bytes:entry.bytes});
  }
 }
 return plan;
}
