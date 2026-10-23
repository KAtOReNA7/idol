// Additive, reproducible review of the real saymyname and shared record components.
// Usage: node scripts/build-saymyname-review.mjs --out /absolute/scratch/output
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {createReadOnlyReviewFetch} from '../review/saymyname/read-only-fetch.mjs';
import {reviewNavigationSource,reviewTimelineSource} from '../review/saymyname/native-navigation.mjs';
import {createSaymynameReviewCatalog} from '../review/saymyname/catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '../..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--out' || !path.isAbsolute(args[1])) throw new Error('Use --out with an absolute scratch output directory');
const out = path.resolve(args[1]);
if (out === path.parse(out).root || out === repo || out.startsWith(repo + path.sep) || repo.startsWith(out + path.sep)) throw new Error('Output must be a dedicated directory outside the repository');
for (let current = out; current !== path.dirname(current); current = path.dirname(current)) {
  if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Output must not traverse symlinks');
}
if (fs.existsSync(out) && fs.readdirSync(out).length && !fs.existsSync(path.join(out,'review-saymyname/manifest.json'))) throw new Error('Use an empty dedicated output directory, not an existing site');
const sha = value => createHash('sha256').update(value).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative));
const archive = JSON.parse(read('data/saymyname-review-editorial.json'));
const assetBindings = JSON.parse(read('data/saymyname-portraits.json'));

// Snapshot normalization happens only in this Node process. The browser gets
// a new public catalog with empty personal fields, plus verified relation IDs
// and the existing stage binding identity metadata; never snapshot records.
const projection = await build({stdin:{contents:"export {projectCatalog} from './lib/idol/catalog'; export {projectArtistCatalog} from './lib/idol/artist-catalog';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'});
const normalized = {exports:{}};
const require = createRequire(path.join(root, 'package.json'));
vm.runInThisContext('(function(require,module,exports){' + projection.outputFiles[0].text + '\n})')(
  name => name === 'cloudflare:workers' ? {env:{}} : name === 'server-only' ? {} : require(name), normalized, normalized.exports);
const snapshot = JSON.parse(read('data/snapshot.json'));
const actual = normalized.exports.projectArtistCatalog(normalized.exports.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt),archive.group.id);
const catalog = createSaymynameReviewCatalog(archive, actual);
const catalogText = JSON.stringify(catalog);
const request = createReadOnlyReviewFetch(catalog,'https://review.invalid');
const isolationCases = [
  ['/api/catalog?shape=display-v1',undefined,200],
  ['/api/catalog?artist=saymyname&shape=display-v1',undefined,200],
  ['/api/save',{method:'POST',body:'{}'},405],
  ['/api/save',undefined,404],
  ['/api/records?table=works&id=recExample',undefined,404],
  ['/api/image?token=example',undefined,404],
  ['/api/catalog?artist=wooah&shape=display-v1',undefined,400],
  ['/api/catalog?shape=display-v1&refresh=1',undefined,400],
  ['https://example.com/api/catalog?shape=display-v1',undefined,403]
];
for (const [url,init,expected] of isolationCases) if ((await request(url,init)).status !== expected) throw new Error('Review API isolation check failed: ' + url);

fs.mkdirSync(path.join(out,'review-saymyname'),{recursive:true});
const ignoredStyles = [];
const result = await build({
  entryPoints:[path.join(root,'review/saymyname/entry.tsx')],absWorkingDir:root,
  outfile:path.join(out,'review-saymyname/app.js'),bundle:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',
  minify:true,metafile:true,sourcemap:false,define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{name:'saymyname-review-boundary',setup(builder){
    builder.onLoad({filter:/[/\\]components[/\\](?:artist-timeline-host\.tsx|use-timeline-return\.ts)$/},args=>({contents:reviewTimelineSource(path.basename(args.path),fs.readFileSync(args.path,'utf8')),loader:args.path.endsWith('.tsx')?'tsx':'ts'}));
    builder.onLoad({filter:/[/\\]components[/\\]use-browse-journey\.ts$/},args=>({contents:reviewNavigationSource(fs.readFileSync(args.path,'utf8')),loader:'ts'}));
    builder.onResolve({filter:/^saymyname-review-catalog$/},()=>({path:'catalog',namespace:'review-catalog'}));
    builder.onLoad({filter:/.*/,namespace:'review-catalog'},()=>({contents:'export default '+catalogText,loader:'js'}));
    builder.onResolve({filter:/\.css\?url$/},args=>({path:args.path,namespace:'review-style-url'}));
    builder.onLoad({filter:/.*/,namespace:'review-style-url'},args=>({contents:'export default '+(args.path.endsWith('/saymyname-experience.css?url')?'"/review-saymyname/saymyname-experience.css"':'undefined'),loader:'js'}));
    builder.onLoad({filter:/[/\\]app[/\\][^/\\]+-experience\.css$/},args=>{
      if (['candidate-experience.css','saymyname-experience.css'].includes(path.basename(args.path))) return;
      ignoredStyles.push(path.relative(root,args.path).split(path.sep).join('/'));
      return {contents:'',loader:'css'};
    });
    builder.onResolve({filter:/^\/(?:artist|fonts)\//},args=>args.kind === 'url-token' ? {path:args.path,external:true} : undefined);
  }}],logLevel:'warning'
});
for (const input of Object.keys(result.metafile.inputs)) {
  if (/data\/(?:snapshot|snapshot-import|snapshot-fallback)|lib\/idol\/(?:native-save|public-access|public-reader)|app\/api\/|cloudflare:|server-only/.test(input)) throw new Error('Server or snapshot module entered browser review: ' + input);
}
const recordStyle={source:'app/saymyname-experience.css'};
const recordStyleBytes=read(recordStyle.source);
fs.writeFileSync(path.join(out,'review-saymyname/saymyname-experience.css'),recordStyleBytes);
// Copy only the native Saymyname artwork, original portraits and fonts.
const native = JSON.parse(read('data/saymyname-artist.json'));
const posters=JSON.parse(read('data/saymyname-video-posters.json')).entries.filter(p=>archive.works.some(w=>w.id===p.workId));
const assets = new Set([native.hero.image,'/artist/saymyname/cloud-wordmark.svg','/artist/saymyname/our-vibe-display.jpg','/artist/saymyname/your-scent-display.jpg',...native.releases.map(r=>r.image).filter(Boolean),...posters.map(p=>p.src)]);
const pinned = new Map();
for (const binding of assetBindings) {
  if (!archive.members.some(m=>m.id===binding.memberId) || !/^\/artist\/saymyname\/portraits\/[a-z-]+\.png$/.test(binding.url)) throw new Error('Unexpected Saymyname portrait binding');
  if(pinned.has(binding.url))throw new Error('Duplicate portrait binding');
  pinned.set(binding.url,binding);assets.add(binding.url);
}
function cssReferences(css) {
  for (const match of css.matchAll(/url\(\s*['"]?(\/[^\s)'"?#]+)/g)) {
    if (!/^\/(?:artist\/saymyname\/|fonts\/)/.test(match[1]) || match[1].includes('..')) throw new Error('Unexpected review CSS asset: ' + match[1]);
    assets.add(match[1]);
  }
}
cssReferences(fs.readFileSync(path.join(out,'review-saymyname/app.css'),'utf8'));
cssReferences(recordStyleBytes.toString());
for (const asset of assets) if (asset.endsWith('.css')) cssReferences(read('public'+asset).toString());
const assetManifest = [];
for (const asset of [...assets].sort()) {
  const source = path.join(root,'public',asset);
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid review asset: ' + asset);
  const bytes = fs.readFileSync(source),binding=pinned.get(asset);
  if (binding && (bytes.length !== binding.bytes || sha(bytes) !== binding.sha256)) throw new Error('Original saymyname image changed: '+asset);
  const dest = path.join(out,asset);
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);
  if (sha(fs.readFileSync(dest)) !== sha(bytes)) throw new Error('Review asset copy changed: '+asset);
  assetManifest.push({path:asset,bytes:bytes.length,sha256:sha(bytes)});
}
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://i.ytimg.com data:; font-src 'self'; connect-src 'none'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'none'";
const html = `<!doctype html>
<html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="${csp}"><title>SAY MY NAME · 页面审阅</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/review-saymyname/app.css"><style>#saymyname-review-context{position:relative;z-index:5;padding:8px 16px;background:#faeaf2;color:#3e2946;text-align:center;font:12px/1.5 system-ui,sans-serif}#saymyname-review-context a{text-decoration:underline;margin-left:12px}</style></head><body><aside id="saymyname-review-context" role="note">示例资料 · 评分不写入正式手帐<a href="/artists/saymyname">SAY MY NAME 首页</a></aside><div id="root"></div><script type="module" src="/review-saymyname/app.js"></script></body></html>\n`;
const entries=['artists/saymyname/index.html','review-saymyname/index.html','review-saymyname/records.html'];
for (const entry of entries) {fs.mkdirSync(path.dirname(path.join(out,entry)),{recursive:true});fs.writeFileSync(path.join(out,entry),html);}
const extraInputs=['review/saymyname/native-navigation.mjs','review/saymyname/catalog.mjs','scripts/build-saymyname-review.mjs','data/saymyname-review-editorial.json','data/saymyname-portraits.json',recordStyle.source];
const inputs=[...new Set([...Object.keys(result.metafile.inputs).filter(file=>!file.includes('node_modules/')&&fs.existsSync(path.join(root,file))),...extraInputs])].sort().map(file=>({path:file,sha256:sha(read(file))}));
const sourceFingerprint=sha(JSON.stringify({inputs,assets:assetManifest,catalog:sha(catalogText)}));
const manifest={kind:'saymyname-static-read-only-review',sourceFingerprint,sourceInputs:inputs,catalogSha256:sha(catalogText),sanitizedRelations:catalog.ratings.length,apiIsolationChecks:isolationCases.length,entries,recordsPath:'/review-saymyname/records.html',preservesExistingRoot:true,ignoredOtherGroupStyles:ignoredStyles.sort(),assets:assetManifest,bundleInputs:Object.keys(result.metafile.inputs).sort()};
fs.writeFileSync(path.join(out,'review-saymyname/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output:out,sourceFingerprint,assets:assetManifest.length,assetBytes:assetManifest.reduce((sum,item)=>sum+item.bytes,0),sanitizedRelations:catalog.ratings.length,apiIsolationChecks:isolationCases.length,jsBytes:fs.statSync(path.join(out,'review-saymyname/app.js')).size,cssBytes:fs.statSync(path.join(out,'review-saymyname/app.css')).size},null,2));
