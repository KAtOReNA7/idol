// Reproducible, isolated review of the real WOOAH and shared record components.
// Usage: node scripts/build-wooah-review.mjs --out /absolute/scratch/output
// This emits an additive overlay: no root index, GENBLUE file or host config.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {createReadOnlyReviewFetch} from '../review/wooah/read-only-fetch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '../..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--out' || !path.isAbsolute(args[1])) throw new Error('Use --out with an absolute scratch output directory');
const out = path.resolve(args[1]);
if (out === '/' || out === '/workspace' || out === repo || out.startsWith(repo + path.sep) || repo.startsWith(out + path.sep)) throw new Error('Output must be a dedicated directory outside the repository');
const sha = value => createHash('sha256').update(value).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative));
const fixturePath = 'handoffs/codex-20261022/combined-integration/tests/fixtures/wooah.synthetic-catalog.json';
const fixtureBytes = fs.readFileSync(path.join(repo, fixturePath));
const catalog = JSON.parse(fixtureBytes);
const archive = JSON.parse(read('data/wooah-editorial.json'));
if (catalog.mode !== 'snapshot' || catalog.groups.length !== 1 || catalog.groups[0].id !== archive.groupId || catalog.ratings.length !== 0) throw new Error('Unexpected synthetic fixture scope');

// The snapshot is normalized in Node memory only. Browser input is the existing
// synthetic fixture plus exact, unique singleton IDs; no snapshot field except
// those IDs is copied. The three MVs without saved relations remain unresolved.
const projection = await build({stdin:{contents:"export {projectCatalog} from './lib/idol/catalog'; export {projectArtistCatalog} from './lib/idol/artist-catalog';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'});
const normalized = {exports:{}};
const require = createRequire(path.join(root, 'package.json'));
vm.runInThisContext('(function(require,module,exports){' + projection.outputFiles[0].text + '\n})')(
  name => name === 'cloudflare:workers' ? {env:{}} : name === 'server-only' ? {} : require(name), normalized, normalized.exports);
const snapshot = JSON.parse(read('data/snapshot.json'));
const actual = normalized.exports.projectArtistCatalog(normalized.exports.projectCatalog(snapshot.tables, 'snapshot', snapshot.capturedAt), archive.groupId);
const memberIds = new Set(archive.members.map(member => member.id));
const verifiedWorkIds = new Set(archive.videos.filter(video => video.kind === 'mv').map(video => video.workId));
const relations = actual.ratings.filter(row => row.memberIds.length === 1 && row.workIds.length === 1 && memberIds.has(row.memberIds[0]) && verifiedWorkIds.has(row.workIds[0]));
if (relations.length !== 56 || new Set(relations.map(row => row.id)).size !== 56 || new Set(relations.map(row => row.memberIds[0] + ':' + row.workIds[0])).size !== 56) throw new Error('Expected exactly 56 verified singleton member/MV relations');
catalog.ratings = relations.map(row => ({id:row.id,name:'',memberIds:[...row.memberIds],workIds:[...row.workIds],score:null,stylingScore:null,note:'',memory:'',recognition:'',source:'',verification:'',photo:null}));
catalog.counts.ratings = catalog.ratings.length;
catalog.works = catalog.works.map(work => ({...work,ratingIds:catalog.ratings.filter(row => row.workIds[0] === work.id).map(row => row.id)}));
catalog.warning = '示例资料 · 评分不写入正式手帐';
const catalogText = JSON.stringify(catalog);

const request = createReadOnlyReviewFetch(catalog, 'https://review.invalid');
const isolationCases = [
  ['/api/catalog?shape=display-v1',undefined,200],
  ['/api/catalog?artist=wooah&shape=display-v1',undefined,200],
  ['/api/save',{method:'POST',body:'{}'},405],
  ['/api/save',undefined,404],
  ['/api/records?table=works&id=recExample',undefined,404],
  ['/api/image?token=example',undefined,404],
  ['/api/catalog?artist=genblue&shape=display-v1',undefined,400],
  ['/api/catalog?shape=display-v1&refresh=1',undefined,400],
  ['https://example.com/api/catalog?shape=display-v1',undefined,403]
];
for (const [url, init, expected] of isolationCases) if ((await request(url,init)).status !== expected) throw new Error('Review API isolation check failed: ' + url);

fs.mkdirSync(path.join(out, 'review-wooah'), {recursive:true});
const ignoredStyles = [];
const result = await build({
  entryPoints:[path.join(root,'review/wooah/entry.tsx')],absWorkingDir:root,
  outfile:path.join(out,'review-wooah/app.js'),bundle:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',
  minify:true,metafile:true,sourcemap:false,define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{
    name:'wooah-review-boundary',
    setup(builder){
      builder.onResolve({filter:/^wooah-review-catalog$/},()=>({path:'catalog',namespace:'review-catalog'}));
      builder.onLoad({filter:/.*/,namespace:'review-catalog'},()=>({contents:'export default '+catalogText,loader:'js'}));
      builder.onResolve({filter:/\.css\?url$/},args=>({path:args.path,namespace:'review-style-url'}));
      builder.onLoad({filter:/.*/,namespace:'review-style-url'},args=>({contents:'export default '+(args.path.endsWith('/wooah-experience.css?url')?'"/review-wooah/wooah-experience.css"':'undefined'),loader:'js'}));
      builder.onLoad({filter:/[/\\]app[/\\][^/\\]+-experience\.css$/},args=>{
        if (['candidate-experience.css','wooah-experience.css'].includes(path.basename(args.path))) return;
        ignoredStyles.push(path.relative(root,args.path));
        return {contents:'',loader:'css'};
      });
      builder.onResolve({filter:/^\/(?:artist|fonts)\//},args=>args.kind === 'url-token'?{path:args.path,external:true}:undefined);
    }
  }],logLevel:'warning'
});
for (const input of Object.keys(result.metafile.inputs)) {
  if (/data\/(?:snapshot|snapshot-import|snapshot-fallback)|lib\/idol\/(?:native-save|public-access|public-reader)|app\/api\//.test(input)) throw new Error('Server or snapshot module entered browser review: ' + input);
}
fs.copyFileSync(path.join(root,'app/wooah-experience.css'),path.join(out,'review-wooah/wooah-experience.css'));

const assets = new Set(['/fonts/genblue/genblue-text.css','/fonts/wooah/wooah-text.css']);
function references(value){
  if (typeof value === 'string' && /^\/artist\/wooah\//.test(value)) assets.add(value);
  else if (Array.isArray(value)) value.forEach(references);
  else if (value && typeof value === 'object') Object.values(value).forEach(references);
}
references(archive);
function cssReferences(css){
  for (const match of css.matchAll(/url\(\s*['"]?(\/[^\s)'"?#]+)/g)) {
    if (!/^\/(?:artist\/wooah\/|fonts\/(?:genblue|wooah|udtt)\/|fonts\/Syne\.ttf$)/.test(match[1])) throw new Error('Unexpected review CSS asset: ' + match[1]);
    assets.add(match[1]);
  }
}
for (const file of ['review-wooah/app.css','review-wooah/wooah-experience.css']) cssReferences(fs.readFileSync(path.join(out,file),'utf8'));
// Runtime <link> fonts are not imported by the JS bundler. Follow their local
// CSS URLs too; copying only the stylesheet would produce missing glyphs.
for (const asset of assets) if (asset.endsWith('.css')) cssReferences(read('public'+asset).toString());
for (const folder of ['public/fonts/wooah','public/fonts/genblue','public/fonts/udtt']) {
  for (const name of fs.readdirSync(path.join(root,folder))) if (/(?:OFL|LICENSE|PROVENANCE|source|verification|provenance|Apache).*\.(?:txt|json)$/i.test(name)) assets.add('/'+path.relative('public',path.join(folder,name)).split(path.sep).join('/'));
}
const assetManifest = [];
for (const asset of [...assets].sort()) {
  const source = path.join(root,'public',asset);
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid review asset: ' + asset);
  const dest = path.join(out,asset);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(source,dest);
  const bytes = fs.readFileSync(source);
  if (sha(fs.readFileSync(dest)) !== sha(bytes)) throw new Error('Review asset copy changed: ' + asset);
  assetManifest.push({path:asset,bytes:bytes.length,sha256:sha(bytes)});
}
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://i.ytimg.com data:; font-src 'self'; connect-src 'none'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'none'";
const html = `<!doctype html>
<html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="${csp}"><title>WOOAH · 页面验收 · 示例资料</title><link rel="stylesheet" href="/review-wooah/app.css"><style>#wooah-review-context{position:relative;z-index:5;padding:8px 16px;background:#fff4d9;color:#493d24;text-align:center;font:12px/1.5 system-ui,sans-serif}#wooah-review-context a{text-decoration:underline;margin-left:12px}</style></head><body><aside id="wooah-review-context" role="note">示例资料 · 评分不写入正式手帐<a href="/artists/wooah">WOOAH 首页</a></aside><div id="root"></div><script type="module" src="/review-wooah/app.js"></script></body></html>\n`;
const entries = ['artists/wooah/index.html','review-wooah/index.html','review-wooah/records.html'];
for (const entry of entries) { fs.mkdirSync(path.dirname(path.join(out,entry)),{recursive:true}); fs.writeFileSync(path.join(out,entry),html); }
// Integrators copy these files additively, retaining the accepted root HTML,
// GENBLUE bundle and hosting configuration. No root rewrite is required.
const inputs = Object.keys(result.metafile.inputs).filter(file=>!file.includes('node_modules/')&&fs.existsSync(path.join(root,file))).sort().map(file=>({path:file,sha256:sha(read(file))}));
const sourceFingerprint = sha(JSON.stringify({inputs,assets:assetManifest,fixture:sha(fixtureBytes),catalog:sha(catalogText),builder:sha(read('scripts/build-wooah-review.mjs'))}));
const manifest = {kind:'wooah-static-read-only-review',sourceFingerprint,sourceInputs:inputs,fixture:{path:fixturePath,sha256:sha(fixtureBytes)},catalogSha256:sha(catalogText),sanitizedRelations:56,apiIsolationChecks:isolationCases.length,entries,recordsPath:'/review-wooah/records.html',preservesExistingRoot:true,ignoredOtherGroupStyles:ignoredStyles.sort(),assets:assetManifest,bundleInputs:Object.keys(result.metafile.inputs).sort()};
fs.writeFileSync(path.join(out,'review-wooah/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output:out,sourceFingerprint,assets:assetManifest.length,assetBytes:assetManifest.reduce((sum,item)=>sum+item.bytes,0),sanitizedRelations:56,apiIsolationChecks:isolationCases.length,jsBytes:fs.statSync(path.join(out,'review-wooah/app.js')).size,cssBytes:fs.statSync(path.join(out,'review-wooah/app.css')).size},null,2));
