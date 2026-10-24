// Only public fields and known original-byte assets enter an owner-private review.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {build} from 'esbuild';import {clearReviewPersonalValues} from '../review/all/catalog.mjs';
import {fixture} from '../tests/helpers/udtt-private-fixture.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),repo=path.resolve(root,'../..');
const args=process.argv.slice(2),opts=Object.fromEntries(Array.from({length:args.length/2},(_,i)=>[args[i*2],args[i*2+1]]));
if(!opts['--out']||!path.isAbsolute(opts['--out'])||!opts['--udtt-portrait'])throw Error('Use --out <absolute scratch dir> --udtt-portrait <verified public original> [--public-ref <40char SHA>]');
const out=path.resolve(opts['--out']),ref=opts['--public-ref'];if(out===repo||out.startsWith(repo+path.sep)||out===path.parse(out).root)throw Error('Dedicated scratch output required');
if(ref&&!/^[a-f0-9]{40}$/.test(ref))throw Error('Immutable public Git ref required');
if(fs.existsSync(out)&&fs.readdirSync(out).length&&!fs.existsSync(path.join(out,'review-all/build-owner.json')))throw Error('Output directory is not a prior all-review build');
const read=p=>fs.readFileSync(path.join(root,p)),sha=b=>createHash('sha256').update(b).digest('hex'),require=createRequire(path.join(root,'package.json'));
const projection=await build({stdin:{contents:"export {projectCatalog} from './lib/idol/catalog';export {projectPublicCatalog} from './lib/idol/public-catalog';export {projectArtistCatalog} from './lib/idol/artist-catalog';",resolveDir:root,loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'});
const mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+projection.outputFiles[0].text+'\n})')(n=>n==='cloudflare:workers'?{env:{}}:n==='server-only'?{}:require(n),mod,mod.exports);
const snap=JSON.parse(read('data/snapshot.json')),registry=JSON.parse(read('data/artist-timeline-registry.json'));
const all=clearReviewPersonalValues(mod.exports.projectPublicCatalog(mod.exports.projectCatalog(snap.tables,'snapshot',snap.capturedAt)));
const catalogs={all};for(const g of registry)catalogs[g.slug]=mod.exports.projectArtistCatalog(all,g.groupId);
const lu=catalogs.udtt.members.find(m=>m.id==='recvxAPQCF66Sl');lu.photo={table:'members',recordId:lu.id,index:0,fieldId:'',publicBinding:'member-primary-v1'};
fs.mkdirSync(path.join(out,'review-all'),{recursive:true});
fs.writeFileSync(path.join(out,'review-all/build-owner.json'),JSON.stringify({kind:'all-review-output',repository:repo}));
const assetManifest=[];
function copyAsset(source,dest,expected){const bytes=fs.readFileSync(source);if(expected&&sha(bytes)!==expected)throw Error('Original SHA mismatch: '+source);const target=path.join(out,dest);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);assetManifest.push({path:dest,bytes:bytes.length,sha256:sha(bytes)});}
const viewer=fixture();viewer.entries=viewer.entries.filter(e=>e.assetId!=='udtt-woojung');
// Same ten admitted pictures, plus the independently sourced Lu portrait. The
// wrong historical avatar is never copied. These bytes stay in private hosting.
for(const entry of viewer.entries){const ext=entry.mime==='image/webp'?'webp':'jpg';const source='public/design-review/sol15/assets/'+entry.sha256+'.'+ext;const dest='/review-all/udtt/'+entry.sha256+'.'+ext;copyAsset(path.join(root,source),dest,entry.sha256);entry.readUrl='/api/editorial-assets?'+new URLSearchParams({manifest:viewer.manifestHash,asset:entry.assetId,version:'b'.repeat(64)});}
const portrait='/review-all/udtt/lu-historical.jpg';copyAsset(opts['--udtt-portrait'],portrait,'b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9');
// API image URLs are served as exact static files via request-independent HTML
// references in the review adapter; the production viewer service is untouched.
const imageRoutes=Object.fromEntries(viewer.entries.map(e=>[e.readUrl,'/review-all/udtt/'+e.sha256+'.'+(e.mime==='image/webp'?'webp':'jpg')]));
const timelines=Object.fromEntries(registry.map(g=>{const published='data/'+g.slug+'-timeline-public.json';const timeline=JSON.parse(read(fs.existsSync(path.join(root,published))?published:'data/artist-timelines/'+g.slug+'.json'));return [g.groupId,timeline];}));
const payload=JSON.stringify({catalogs,registry,timelines,viewer,nativePortrait:portrait,imageRoutes});
const pages=registry.map((g,i)=>`import P${i} from './app/artists/${g.slug}/page';`).join('\n')+'\nexport default {'+registry.map((g,i)=>JSON.stringify(g.slug)+':P'+i).join(',')+'};';
const assetBase=ref?'https://raw.githubusercontent.com/KAtOReNA7/idol/'+ref+'/apps/idol-site/public':'';
const jsxReal=require.resolve('react/jsx-runtime'),styleFiles=new Map();
const result=await build({entryPoints:[path.join(root,'review/all/entry.tsx')],absWorkingDir:root,outfile:path.join(out,'review-all/app.js'),bundle:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',minify:true,metafile:true,define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'all-review',setup(b){
 b.onResolve({filter:/^all-review-(payload|pages)$/},a=>({path:a.path,namespace:'virtual-review'}));
 b.onLoad({filter:/.*/,namespace:'virtual-review'},a=>({contents:a.path.endsWith('payload')?'export default '+payload:pages,loader:a.path.endsWith('pages')?'tsx':'js',resolveDir:root}));
 b.onLoad({filter:/design-review[/\\]sol15-runtime[/\\]private-images\.mjs$/},a=>{
  const source=fs.readFileSync(a.path,'utf8'),original="image.setAttribute('src',row.entry.readUrl);";
  if(source.split(original).length!==2)throw Error('UDTT transport changed; review required');
  return {loader:'js',contents:'const reviewImageRoutes='+JSON.stringify(imageRoutes)+';\n'+source.replace(original,"image.setAttribute('src',reviewImageRoutes[row.entry.readUrl]??row.entry.readUrl);")};
 });
 b.onLoad({filter:/app[/\\]artists[/\\](billlie|loona|triples)[/\\]page\.tsx$/},a=>({contents:fs.readFileSync(a.path,'utf8').replace('export default async function','export default function').replace('await searchParams','Object.fromEntries(new URLSearchParams(location.search))'),loader:'tsx'}));
 // These two renderers create their own shadow DOM, outside React JSX. Preserve
 // the exact identity and hash fields, changing only public transport addresses.
 b.onLoad({filter:/data[/\\](izna|ifeye)-assets\.json$/},a=>{const rows=JSON.parse(fs.readFileSync(a.path,'utf8'));if(assetBase)for(const row of rows){if(!row.url.startsWith('/artist/'))throw Error('Unexpected native public asset');row.url=assetBase+row.url;}return {loader:'json',contents:JSON.stringify(rows)};});
 b.onResolve({filter:/^react\/jsx-runtime$/},a=>a.namespace==='review-jsx'?{path:jsxReal}:{path:'jsx',namespace:'review-jsx'});
 b.onLoad({filter:/.*/,namespace:'review-jsx'},()=>({loader:'js',contents:`import {jsx as j,jsxs as s,Fragment} from 'react/jsx-runtime';export {Fragment};const base=${JSON.stringify(assetBase)},images=${JSON.stringify(imageRoutes)};function url(v){if(typeof v!=='string')return v;if(images[v])return images[v];return base&&/^\\/(?:artist|fonts|design-review)\\//.test(v)&&!v.split('?')[0].endsWith('.css')?base+v:v;}function props(type,p){if(!p)return p;const q={...p};if(typeof type==='string'){if(q.src)q.src=url(q.src);if(q.poster)q.poster=url(q.poster);if(q.href&&(type==='a'||type==='link'))q.href=url(q.href);}return q;}export const jsx=(t,p,k)=>j(t,props(t,p),k);export const jsxs=(t,p,k)=>s(t,props(t,p),k);`}));
 b.onResolve({filter:/\.css\?url$/},a=>({path:a.path.startsWith('@/')?path.join(root,a.path.slice(2).replace(/\?url$/,'')):path.resolve(path.dirname(a.importer),a.path.replace(/\?url$/,'')),namespace:'review-css-url'}));
 b.onLoad({filter:/.*/,namespace:'review-css-url'},a=>{const url='/review-all/styles/'+path.basename(a.path);styleFiles.set(url,a.path);return {loader:'js',contents:'export default '+JSON.stringify(url)};});
 b.onResolve({filter:/^\/(?:artist|fonts|design-review)\//},a=>a.kind==='url-token'?{path:a.path,external:true}:undefined);
 }}],logLevel:'warning'});
for(const input of Object.keys(result.metafile.inputs))if(/data\/(?:snapshot|snapshot-import|snapshot-fallback)|lib\/idol\/(?:native-save|public-access|public-reader)|app\/api\/|cloudflare:|server-only/.test(input))throw Error('Private/server module in review: '+input);
const rewriteCss=s=>assetBase?s.replace(/url\((['"]?)(\/(?:artist|fonts|design-review)\/[^)'"\s]+)\1\)/g,(_,q,url)=>'url('+JSON.stringify(assetBase+url)+')'):s;
for(const [dest,source]of styleFiles){fs.mkdirSync(path.dirname(path.join(out,dest)),{recursive:true});fs.writeFileSync(path.join(out,dest),rewriteCss(fs.readFileSync(source,'utf8')));}
fs.writeFileSync(path.join(out,'review-all/app.css'),rewriteCss(fs.readFileSync(path.join(out,'review-all/app.css'),'utf8')));
function publicFiles(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const source=path.join(dir,item.name);if(item.isDirectory())publicFiles(source);else if(item.isFile()){const rel='/'+path.relative(path.join(root,'public'),source).split(path.sep).join('/');if(!ref||rel.endsWith('.css')){if(rel.startsWith('/design-review/sol15/assets/'))continue;copyAsset(source,rel);if(ref&&rel.endsWith('.css'))fs.writeFileSync(path.join(out,rel),rewriteCss(fs.readFileSync(source,'utf8')));}}}}
publicFiles(path.join(root,'public'));
// Keep each route's styles separate: several independently designed pages use
// the same short class prefix. Loading every artist's CSS together changes them.
const inputs=result.metafile.inputs;
function routeCss(entry){const seen=new Set(),css=[];function visit(key){if(seen.has(key))return;seen.add(key);const row=inputs[key];if(!row)return;for(const item of row.imports)if(!item.external)visit(item.path);if(key.endsWith('.css')&&fs.existsSync(path.join(root,key)))css.push(key);}visit(entry);return [...new Set(['app/globals.css','components/artist-timeline.css',...css])];}
for(const item of [{slug:'index',entry:'app/page.tsx'},...registry.map(g=>({slug:g.slug,entry:'app/artists/'+g.slug+'/page.tsx'}))]){
 const dest=path.join(out,'review-all/routes/'+item.slug+'.css');fs.mkdirSync(path.dirname(dest),{recursive:true});
 await build({stdin:{contents:routeCss(item.entry).map(f=>'@import '+JSON.stringify('./'+f)+';').join('\n'),loader:'css',resolveDir:root},bundle:true,outfile:dest,minify:true,external:['/artist/*','/fonts/*','/design-review/*'],logLevel:'silent'});
 fs.writeFileSync(dest,rewriteCss(fs.readFileSync(dest,'utf8')));
}
const version=sha(fs.readFileSync(path.join(out,'review-all/app.js'))).slice(0,16);
const html=`<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>全团只读审阅</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/review-all/app.css?v=${version}"><style>#review-context{padding:8px 16px;text-align:center;background:#161616;color:#fff;font:12px/1.5 system-ui}#review-context a{color:inherit;text-decoration:underline;margin-left:16px}</style></head><body><aside id="review-context">只读审阅 · 个人评分与备注未载入<a href="/?view=groups">全部团体</a></aside><div id="root"></div><script type="module" src="/review-all/app.js?v=${version}"></script></body></html>`;
for(const dest of ['index.html',...registry.map(g=>'artists/'+g.slug+'/index.html')]){fs.mkdirSync(path.dirname(path.join(out,dest)),{recursive:true});const slug=dest==='index.html'?'index':dest.split('/')[1];fs.writeFileSync(path.join(out,dest),html.replace('/review-all/app.css','/review-all/routes/'+slug+'.css')); }
fs.writeFileSync(path.join(out,'review-all/manifest.json'),JSON.stringify({kind:'all-groups-read-only',publicRef:ref??null,groups:registry.length,catalogSha256:sha(payload),assets:assetManifest,bundleInputs:Object.keys(result.metafile.inputs)},null,2)+'\n');
console.log(JSON.stringify({output:out,groups:registry.length,assets:assetManifest.length,jsBytes:fs.statSync(path.join(out,'review-all/app.js')).size,publicRef:ref??null}));
