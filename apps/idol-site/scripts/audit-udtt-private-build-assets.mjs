// Fixed nine generated copies only. Public/Git originals and the two shared posters stay.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifestPath=fileURLToPath(new URL('./udtt-private-build-assets-manifest.json',import.meta.url));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ext=/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/;
const shared=new Set(['4139391550e96a783d920ff4cbb6563b864684b299089cebbc550f8de44ab0c1','96bec21c388b48ec491b09b40e3b48601fae39df100e85faa6d8079889db5d95']);
const requiredGuards=Object.freeze(["components/design-review/udtt-review.tsx", "components/design-review/udtt-private-review.tsx", "lib/idol/editorial-asset-registry.ts", "lib/idol/design-review/sol15-runtime/private-model.mjs", "lib/idol/design-review/sol15-runtime/host.d.mts", "lib/idol/design-review/sol15-runtime/contract.js", "lib/idol/design-review/sol15-runtime/private-host.d.mts", "lib/idol/design-review/sol15-runtime/model.mjs", "lib/idol/design-review/sol15-runtime/private-images.mjs", "lib/idol/design-review/sol15-runtime/bridge.mjs", "lib/idol/design-review/sol15-runtime/private-host.mjs", "lib/idol/design-review/sol15-runtime/host.mjs", "lib/idol/design-review/sol15-runtime/shared/reconcile.js", "lib/idol/design-review/sol15-runtime/shared/identity.js", "lib/idol/design-review/sol15-runtime/shared/media-viewer.js", "lib/idol/design-review/sol15-runtime/shared/media-geometry.js", "lib/idol/design-review/sol15-runtime/shared/router.js", "lib/idol/design-review/sol15-runtime/shared/media-policy.js", "lib/idol/design-review/sol15-runtime/shared/imagery-manifest.js", "lib/idol/design-review/sol15-runtime/shared/helpers.js", "lib/idol/design-review/sol15-runtime/shared/lifecycle.js", "lib/idol/design-review/sol15-runtime/shared/apply-imagery.js", "lib/idol/design-review/sol15-runtime/shared/imagery-targets.js", "lib/idol/design-review/sol15-runtime/groups/udtt/relations.mjs", "lib/idol/design-review/sol15-runtime/groups/udtt/presentation.js", "lib/idol/design-review/sol15-runtime/groups/udtt/reconciliation.js", "lib/idol/design-review/sol15-runtime/groups/udtt/index.js", "lib/idol/design-review/sol15-runtime/groups/udtt/data.js", "data/udtt-video-posters.json", "lib/idol/udtt-native/host.d.mts", "lib/idol/udtt-native/host.mjs", "lib/idol/udtt-native/image-recovery.mjs", "lib/idol/udtt-native/model.mjs", "lib/idol/udtt-native/presentation.mjs"]);
const contractPath='lib/idol/design-review/sol15-runtime/contract.js';
function files(dir){if(!fs.existsSync(dir))return [];if(fs.lstatSync(dir).isSymbolicLink())throw new Error(`UDTT symlink: ${dir}`);return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw new Error(`UDTT symlink: ${p}`);return e.isDirectory()?files(p):[p];});}
// Conservative textual guard, not a JavaScript reachability proof. Fold only
// adjacent unescaped literal concatenations; unknown namespace assembly fails.
const normalize=text=>{for(let i=0;i<32;i++){const next=text.replace(/(["'`])([^"'`\\\r\n]*)\1\s*\+\s*(["'`])([^"'`\\\r\n]*)\3/g,(_,q,a,r,b)=>'`'+a+b+'`');if(next===text)return text;text=next;}throw new Error('UDTT excessive literal assembly requires review');};
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
function verify(p,e){if(!e||!Number.isSafeInteger(e.bytes)||e.bytes<=0||!/^[a-f0-9]{64}$/.test(e.sha256)||!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink()||!fs.statSync(p).isFile()||fs.statSync(p).size!==e.bytes||hash(p)!==e.sha256)throw new Error(`UDTT integrity mismatch: ${p}`);}
export function auditUdttPrivateBuildAssets(root,manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))){
 root=path.resolve(root);if(fs.lstatSync(root).isSymbolicLink())throw new Error('UDTT symlink root');
 if(manifest.version!==1||manifest.files?.length!==9||manifest.retainedShared?.length!==2)throw new Error('UDTT exact nine-file scope required');
 const contractText=fs.readFileSync(path.join(root,contractPath),'utf8');
 // This source is pinned below; parse its existing JSON literal, never execute an audit input.
 const contract=JSON.parse(contractText.slice(contractText.indexOf('{'),contractText.lastIndexOf('}')+1));
 const eligible=Object.values(contract.assets).filter(e=>!shared.has(e.sha256)),retained=Object.values(contract.assets).filter(e=>shared.has(e.sha256));
 if(!same(manifest.files.map(e=>e.path),eligible.map(e=>e.targetUrl))||!same(manifest.retainedShared.map(e=>e.path),retained.map(e=>e.targetUrl)))throw new Error('UDTT fixed asset scope changed');
 const guardNames=Object.keys(manifest.runtimeGuards??{});
 if(!same(guardNames,requiredGuards))throw new Error('UDTT renderer guard inventory changed');
 for(const dir of ['lib/idol/design-review/sol15-runtime','lib/idol/udtt-native'])if(!same(files(path.join(root,dir)).map(p=>path.relative(root,p)),requiredGuards.filter(p=>p.startsWith(dir+'/'))))throw new Error('UDTT runtime source inventory changed: '+dir);
 if(!guardNames.includes(contractPath)||!guardNames.includes('components/design-review/udtt-review.tsx')||!guardNames.includes('lib/idol/design-review/sol15-runtime/host.mjs')||!guardNames.includes('lib/idol/design-review/sol15-runtime/private-images.mjs'))throw new Error('UDTT required renderer guards missing');
 for(const name of guardNames)verify(path.join(root,name),manifest.runtimeGuards[name]);
 for(const entry of fs.readdirSync(root,{withFileTypes:true}))if(entry.isSymbolicLink()&&ext.test(entry.name))throw new Error('UDTT root runtime symlink: '+entry.name);
 const sourceFiles=[...fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(root,e.name)),...['app','components','lib','hooks','data','db','public','vendor'].flatMap(d=>files(path.join(root,d)))].filter(p=>ext.test(p));
 const urls=eligible.map(e=>e.targetUrl);
 for(const p of sourceFiles){const relative=path.relative(root,p),text=normalize(fs.readFileSync(p,'utf8'));
  if(!guardNames.includes(relative)&&(text.includes('sol15-runtime')||eligible.some(e=>text.includes(e.sha256))||text.includes('/design-review/sol15/assets/'))) {
   // Other reviewed group assets and the two retained poster URLs are unrelated.
   if(text.includes('sol15-runtime')||eligible.some(e=>text.includes(e.sha256))||text.replace(/\/design-review\/sol15\/assets\/[a-f0-9]{64}\.(?:jpg|webp|png)/g,'').includes('/design-review/sol15/assets/'))throw new Error(`UDTT unknown source consumer: ${relative}`);
  }
  if(relative!==contractPath&&urls.some(url=>text.includes(url)))throw new Error(`UDTT active static consumer: ${relative}`);
 }
 const publicPaths=files(path.join(root,'public')).map(p=>'/'+path.relative(path.join(root,'public'),p).split(path.sep).join('/'));
 if(!manifest.builtContractCarriers||Object.keys(manifest.builtContractCarriers).length!==2)throw new Error('UDTT exact built contract carriers required');
 for(const [name,expected] of Object.entries(manifest.builtContractCarriers)){if(!/^dist\/(?:client|server\/ssr)\/_next\/static\/(?:chunks\/)?lifecycle-[A-Za-z0-9_-]+\.js$/.test(name))throw new Error('UDTT unexpected contract carrier');verify(path.join(root,name),expected);}
 const index=path.join(root,'dist/server/index.js');if(!fs.existsSync(index))throw new Error('Build dist first');
 for(const p of files(path.join(root,'dist')).filter(p=>ext.test(p))){let text=normalize(fs.readFileSync(p,'utf8').replaceAll('\\/','/'));
  if(p===index){const re=/new Set\(`([^`]*?\/artist\/[^`]*?)`\.split\(`,`\)\)/g,m=[...text.matchAll(re)];if(m.length!==1||!same(m[0][1].split(','),publicPaths))throw new Error('UDTT unknown public routing inventory');text=text.replace(re,'new Set()');}
  if(text.replace(/\/design-review\/sol15\/assets\/[a-f0-9]{64}\.(?:jpg|webp|png)/g,'').includes('/design-review/sol15/assets/'))throw new Error(`UDTT dynamic built static consumer: ${p}`);
  // Exempt metadata only in the exact audited generated contract carriers. A changed
  // build carrier requires re-audit; no other targetUrl object is exempt.
  const carrier=manifest.builtContractCarriers?.[path.relative(root,p)];
  if(carrier)verify(p,carrier);
  for(const url of urls){const escaped=url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(carrier)text=text.replace(new RegExp('(?:"targetUrl"|targetUrl)\\s*:\\s*(["\'`])'+escaped+'\\1','g'),'targetUrl:null');if(text.includes(url))throw new Error(`UDTT built static consumer: ${p}`);}
 }
 const plan=[];
 for(const e of [...manifest.files,...manifest.retainedShared]){const original=Object.values(contract.assets).find(row=>row.targetUrl===e.path);if(!original||e.sha256!==original.sha256||e.bytes!==original.bytes||e.path!==`/design-review/sol15/assets/${e.sha256}.${e.path.endsWith('.webp')?'webp':'jpg'}`)throw new Error('UDTT hash/path/bytes binding changed');verify(path.join(root,'public',e.path),e);const built=path.join(root,'dist/client',e.path);if(shared.has(e.sha256)){verify(built,e);continue;}if(fs.existsSync(built)){verify(built,e);plan.push({file:path.relative(root,built),bytes:e.bytes});}}
 return plan;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');console.log(JSON.stringify({plan:auditUdttPrivateBuildAssets(root)},null,2));}
