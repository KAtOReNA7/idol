// Rebuild original-byte static assets from the immutable review manifest.
// Generated images stay out of the Sites source Git upload, but enter its archive.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=path.resolve(process.argv[2]??'dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'review-all/manifest.json'),'utf8'));
if(!/^[a-f0-9]{40}$/.test(manifest.publicRef))throw Error('An immutable public source commit is required');
const assets=manifest.assets.filter(a=>a.path.startsWith('/artist/')&&!a.path.endsWith('.css'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
let cursor=0,downloaded=0;
async function worker(){
 while(cursor<assets.length){
  const asset=assets[cursor++],destination=path.resolve(root,'.'+asset.path);
  if(!destination.startsWith(root+path.sep)||asset.path.includes('..')||!Number.isSafeInteger(asset.bytes)||asset.bytes<=0||!/^[a-f0-9]{64}$/.test(asset.sha256))throw Error('Invalid original asset descriptor');
  if(fs.existsSync(destination)&&digest(fs.readFileSync(destination))===asset.sha256)continue;
  const url=`https://raw.githubusercontent.com/KAtOReNA7/idol/${manifest.publicRef}/apps/idol-site/public${asset.path}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`Original asset request failed (${response.status}): ${asset.path}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length!==asset.bytes||digest(bytes)!==asset.sha256)throw Error('Original asset bytes changed: '+asset.path);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);downloaded++;
 }
}
await Promise.all(Array.from({length:Math.min(4,assets.length)},()=>worker()));
console.log(JSON.stringify({verifiedOriginals:assets.length,downloaded,publicRef:manifest.publicRef}));
