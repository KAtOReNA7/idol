// Public originals stay in the application Git repository. This manifest permits
// streaming only reviewed immutable paths when the complete archive exceeds Sites.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref=process.argv[process.argv.indexOf('--public-ref')+1];
if(!process.argv.includes('--public-ref')||!/^[a-f0-9]{40}$/.test(ref))throw Error('Use --public-ref <pushed application commit>');
const check=process.argv.includes('--check');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const privatePolicy=read('scripts/udtt-private-build-assets-manifest.json');
const restricted=new Set(privatePolicy.files.map(r=>r.path));
const restrictedHashes=new Set(privatePolicy.files.map(r=>r.sha256));
let restrictedCopies=0,restrictedAliases=0;
const shared=new Set(privatePolicy.retainedShared.map(r=>r.path));
const local=new Set();
const mv=read('data/mv-public-media.json');
const publicRoot=path.join(root,'public');
// Keep the upload small enough to complete on the current publishing path.
// Every other original is still served at the same URL by the immutable proxy.
// The local archive upload currently times out on the former 24 MiB raster set.
// A smaller local set keeps the same original URLs/bytes through the existing proxy.
const rasterBudgetMiB=4,budget=rasterBudgetMiB*1024*1024;
let used=0;
for(const row of read('data/music-index-artwork.json')){const bytes=fs.statSync(path.join(publicRoot,row.image)).size;if(!local.has(row.image)&&used+bytes<=budget){local.add(row.image);used+=bytes;}}
const covers=mv.covers.map(row=>({src:row.src,bytes:fs.statSync(path.join(publicRoot,row.src)).size})).sort((a,b)=>a.bytes-b.bytes||a.src.localeCompare(b.src));
for(const row of covers)if(!local.has(row.src)&&used+row.bytes<=budget){local.add(row.src);used+=row.bytes;}
const portraits=[...new Set(mv.portraits.map(r=>r.src))].map(src=>({src,bytes:fs.statSync(path.join(publicRoot,src)).size})).sort((a,b)=>a.bytes-b.bytes||a.src.localeCompare(b.src));
for(const r of portraits)if(!local.has(r.src)&&used+r.bytes<=budget){local.add(r.src);used+=r.bytes;}
const gitRoot=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim();
const tree=execFileSync('git',['ls-tree','-r','-z',ref,'--','apps/idol-site/public'],{cwd:gitRoot,encoding:'utf8',maxBuffer:8*1024*1024});
const entries=tree.split('\0').filter(Boolean).map(line=>{const [head,file]=line.split('\t');const [mode,kind,blob]=head.split(' ');if(mode!=='100644'||kind!=='blob')throw Error('Regular public originals required: '+file);return {src:'/'+file.slice('apps/idol-site/public/'.length),blob};});
const assets=[];
for(const {src,blob}of entries){
 const file=path.join(publicRoot,src);if(!fs.existsSync(file)||fs.lstatSync(file).isSymbolicLink())throw Error('Missing or linked public original: '+src);
 const bytes=fs.readFileSync(file),gitHash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(gitHash!==blob)throw Error('Original differs from fixed public commit: '+src);
 const digest=createHash('sha256').update(bytes).digest('hex');
 if(restricted.has(src)||restrictedHashes.has(digest)){restrictedCopies++;if(!restricted.has(src))restrictedAliases++;continue;}
 const ext=path.extname(src).toLowerCase();
 // Keep styles, fonts, metadata, vectors and the shared public posters local.
 const delivery=local.has(src)||shared.has(src)||!['.jpg','.jpeg','.png','.webp'].includes(ext)?'local':'remote';
 const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.json':'application/json','.txt':'text/plain'}[ext];
 if(!mime)throw Error('Unreviewed public file type: '+src);
 assets.push({path:src,bytes:bytes.length,sha256:digest,mime,delivery});
}
for(const src of local)if(!assets.some(r=>r.path===src&&r.delivery==='local'))throw Error('Mandatory local original absent: '+src);
if(assets.length+restrictedCopies!==entries.length)throw Error('Asset inventory is incomplete');
const output=JSON.stringify({schemaVersion:1,publicRef:ref,baseUrl:`https://raw.githubusercontent.com/KAtOReNA7/idol/${ref}/apps/idol-site/public`,
 summary:{rasterBudgetMiB,assets:assets.length,local:assets.filter(r=>r.delivery==='local').length,remote:assets.filter(r=>r.delivery==='remote').length,localBytes:assets.filter(r=>r.delivery==='local').reduce((n,r)=>n+r.bytes,0),remoteBytes:assets.filter(r=>r.delivery==='remote').reduce((n,r)=>n+r.bytes,0),restrictedBuildCopiesExcluded:restrictedCopies,restrictedAliasesExcluded:restrictedAliases},assets},null,2)+'\n';
const destination=path.join(root,'data/production-asset-delivery.json');
if(check){if(fs.readFileSync(destination,'utf8')!==output)throw Error('Stale production asset manifest');}else fs.writeFileSync(destination,output);
console.log(JSON.stringify({status:'passed',...JSON.parse(output).summary,publicRef:ref}));
