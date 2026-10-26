// Remove only hashed generated copies that have immutable original delivery.
// Never changes public source files, private storage, bindings or personal data.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {auditUdttPrivateBuildAssets} from './audit-udtt-private-build-assets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),client=path.join(root,'dist/client');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/production-asset-delivery.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const plan=[];
for(const row of manifest.assets){
 const file=path.resolve(client,'.'+row.path);
 if(!file.startsWith(client+path.sep))throw Error('Asset outside generated client output');
 if(!fs.existsSync(file)){if(row.delivery==='local')throw Error('Local original absent: '+row.path);continue;}
 if(fs.lstatSync(file).isSymbolicLink())throw Error('Linked output requires review');
 const bytes=fs.readFileSync(file);if(bytes.length!==row.bytes||hash(bytes)!==row.sha256)throw Error('Output original differs: '+row.path);
 if(row.delivery==='remote')plan.push({file,path:row.path,bytes:row.bytes});
}
const privatePlan=auditUdttPrivateBuildAssets(root);
// One unused legacy alias is byte-identical to a restricted original. It must
// not create a second static/remote route around the existing private viewer.
const privatePolicy=JSON.parse(fs.readFileSync(path.join(root,'scripts/udtt-private-build-assets-manifest.json'),'utf8'));
const alias='/artist/udtt/batch-b-20261016/group.display.jpg',aliasSource=path.join(root,'public',alias);
const aliasBytes=fs.readFileSync(aliasSource),aliasDigest=hash(aliasBytes);
if(!privatePolicy.files.some(r=>r.sha256===aliasDigest&&r.bytes===aliasBytes.length)||manifest.assets.some(r=>r.path===alias||r.sha256===aliasDigest))throw Error('Restricted alias policy changed');
const aliasBuilt=path.join(client,alias);
if(fs.existsSync(aliasBuilt)){const bytes=fs.readFileSync(aliasBuilt);if(hash(bytes)!==aliasDigest||bytes.length!==aliasBytes.length)throw Error('Restricted alias output changed');privatePlan.push({file:path.relative(root,aliasBuilt),bytes:bytes.length});}
// Complete every validation before removing any generated copy.
if(process.argv.includes('--apply')){
 for(const row of plan)fs.unlinkSync(row.file);
 for(const row of privatePlan){const file=path.resolve(root,row.file);if(!file.startsWith(client+path.sep))throw Error('Private generated copy outside output');fs.unlinkSync(file);}
}
console.log(JSON.stringify({status:'passed',mode:process.argv.includes('--apply')?'apply':'dry-run',publicRef:manifest.publicRef,remoteCopies:plan.length,remoteBytes:plan.reduce((n,r)=>n+r.bytes,0),restrictedCopies:privatePlan.length,restrictedAliases:1,localAssets:manifest.summary.local,localBytes:manifest.summary.localBytes},null,2));
