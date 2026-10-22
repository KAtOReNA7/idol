// Reproducible static review of the real GENBLUE and shared record components.
// This is a read-only synthetic preview, not a replacement for the native app.
// Usage: node scripts/build-genblue-review.mjs --out /absolute/scratch/output
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {createReadOnlyReviewFetch} from '../review/genblue/read-only-fetch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '../..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--out' || !path.isAbsolute(args[1])) throw new Error('Use --out with an absolute scratch output directory');
const out = path.resolve(args[1]);
if (out === '/' || out === '/workspace' || out === repo || out.startsWith(repo + path.sep) || repo.startsWith(out + path.sep)) throw new Error('Output must be a dedicated directory outside the repository');
const sha = value => createHash('sha256').update(value).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative));
const fixturePath = 'handoffs/codex-20261022/combined-integration/tests/fixtures/genblue.synthetic-catalog.json';
const fixtureBytes = fs.readFileSync(path.join(repo, fixturePath));
const catalog = JSON.parse(fixtureBytes);
const archive = JSON.parse(read('data/genblue-bluecut.json'));
if (catalog.mode !== 'snapshot' || catalog.groups.length !== 1 || catalog.groups[0].id !== archive.groupId || catalog.ratings.length !== 0) throw new Error('Unexpected synthetic fixture scope');

// Normalize the approved repository snapshot in memory, then copy only the
// verified singleton relation IDs. Scores, notes, image tokens and other record
// fields from the snapshot are never serialized to the review artifact.
const projection = await build({stdin:{contents:"export {projectCatalog} from './lib/idol/catalog'; export {projectArtistCatalog} from './lib/idol/artist-catalog';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'});
const normalized = {exports:{}};
const require = createRequire(path.join(root, 'package.json'));
vm.runInThisContext('(function(require,module,exports){' + projection.outputFiles[0].text + '\n})')(
  name => name === 'cloudflare:workers' ? {env:{}} : name === 'server-only' ? {} : require(name), normalized, normalized.exports);
const snapshot = JSON.parse(read('data/snapshot.json'));
const actual = normalized.exports.projectArtistCatalog(normalized.exports.projectCatalog(snapshot.tables, 'snapshot', snapshot.capturedAt), archive.groupId);
const memberIds = new Set(archive.members.map(member => member.id));
const verifiedWorkIds = new Set(['rec28ldfRTrCU6','rec28ldfRTrCYg','rec28ldfRTrQJ1']);
const relations = actual.ratings.filter(row => row.memberIds.length === 1 && row.workIds.length === 1 && memberIds.has(row.memberIds[0]) && verifiedWorkIds.has(row.workIds[0]));
if (relations.length !== 18 || new Set(relations.map(row => row.id)).size !== 18 || new Set(relations.map(row => row.memberIds[0] + ':' + row.workIds[0])).size !== 18) throw new Error('Expected exactly 18 verified singleton member/MV relations');
catalog.ratings = relations.map(row => ({id:row.id,name:'',memberIds:[...row.memberIds],workIds:[...row.workIds],score:null,stylingScore:null,note:'',memory:'',recognition:'',source:'',verification:'',photo:null}));
catalog.counts.ratings = catalog.ratings.length;
catalog.works = catalog.works.map(work => ({...work,ratingIds:catalog.ratings.filter(row => row.workIds[0] === work.id).map(row => row.id)}));
catalog.warning = '示例资料 · 评分不写入正式手帐';
const catalogText = JSON.stringify(catalog);

// Fail-closed checks use the same adapter imported by the browser entry.
const request = createReadOnlyReviewFetch(catalog, 'https://review.invalid');
for (const [url, init, expected] of [
  ['/api/catalog?shape=display-v1',undefined,200],
  ['/api/catalog?artist=genblue&shape=display-v1',undefined,200],
  ['/api/save',{method:'POST',body:'{}'},405],
  ['/api/save',undefined,404],
  ['/api/records?table=works&id=recExample',undefined,404],
  ['/api/catalog?artist=wooah&shape=display-v1',undefined,400],
  ['/api/catalog?shape=display-v1&refresh=1',undefined,400],
  ['https://example.com/api/catalog?shape=display-v1',undefined,403]
]) if ((await request(url,init)).status !== expected) throw new Error('Review API isolation check failed: ' + url);

fs.mkdirSync(path.join(out, 'review-genblue'), {recursive:true});
const ignoredStyles = [];
const result = await build({
  entryPoints:[path.join(root,'review/genblue/entry.tsx')],absWorkingDir:root,
  outfile:path.join(out,'review-genblue/app.js'),bundle:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',
  minify:true,metafile:true,sourcemap:false,define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{
    name:'genblue-review-boundary',
    setup(builder){
      builder.onResolve({filter:/^genblue-review-catalog$/},()=>({path:'catalog',namespace:'review-catalog'}));
      builder.onLoad({filter:/.*/,namespace:'review-catalog'},()=>({contents:'export default '+catalogText,loader:'js'}));
      builder.onResolve({filter:/\.css\?url$/},args=>({path:args.path,namespace:'review-style-url'}));
      builder.onLoad({filter:/.*/,namespace:'review-style-url'},args=>({contents:'export default '+(args.path.endsWith('/genblue-experience.css?url')?'"/review-genblue/genblue-experience.css"':'undefined'),loader:'js'}));
      // These imports belong to other group-specific details, absent from the
      // fixture. Their CSS and assets are not part of a one-group review build.
      builder.onLoad({filter:/[/\\]app[/\\][^/\\]+-experience\.css$/},args=>{
        if (['candidate-experience.css','genblue-experience.css'].includes(path.basename(args.path))) return;
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
fs.copyFileSync(path.join(root,'app/genblue-experience.css'),path.join(out,'review-genblue/genblue-experience.css'));

const assets = new Set();
function references(value){
  if (typeof value === 'string' && /^\/artist\/genblue\//.test(value)) assets.add(value);
  else if (Array.isArray(value)) value.forEach(references);
  else if (value && typeof value === 'object') Object.values(value).forEach(references);
}
references(archive);
const evidencePath = path.join(root,'data/genblue-media-evidence.json');
if (fs.existsSync(evidencePath)) references(JSON.parse(fs.readFileSync(evidencePath,'utf8')));
for (const file of ['review-genblue/app.css','review-genblue/genblue-experience.css']) {
  const css = fs.readFileSync(path.join(out,file),'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?(\/[^\s)'"?#]+)/g)) {
    if (!/^\/(?:artist\/genblue|fonts\/(?:genblue|udtt))\//.test(match[1])) throw new Error('Unexpected review CSS asset: ' + match[1]);
    assets.add(match[1]);
  }
}
for (const folder of ['public/fonts/genblue','public/fonts/udtt']) {
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
<html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="${csp}"><title>GENBLUE · 页面验收 · 示例资料</title><link rel="stylesheet" href="/review-genblue/app.css"><style>#genblue-review-context{position:relative;z-index:5;padding:8px 16px;background:#fff4d9;color:#493d24;text-align:center;font:12px/1.5 system-ui,sans-serif}#genblue-review-context a{text-decoration:underline;margin-left:12px}</style></head><body><aside id="genblue-review-context" role="note">示例资料 · 评分不写入正式手帐<a href="/artists/genblue">GENBLUE 首页</a></aside><div id="root"></div><script type="module" src="/review-genblue/app.js"></script></body></html>\n`;
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'review-genblue/index.html'),html);
// Direct navigation must not depend on a host understanding _redirects.
fs.mkdirSync(path.join(out,'artists/genblue'),{recursive:true});
fs.writeFileSync(path.join(out,'artists/genblue/index.html'),html);
fs.writeFileSync(path.join(out,'_redirects'),'/artists/genblue /index.html 200\n');
fs.writeFileSync(path.join(out,'_headers'),`/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n  Content-Security-Policy: ${csp}\n`);
const inputs = Object.keys(result.metafile.inputs).filter(file=>!file.includes('node_modules/')&&!file.startsWith('review-')).sort().map(file=>({path:file,sha256:sha(fs.readFileSync(path.join(root,file)))}));
const sourceFingerprint = sha(JSON.stringify({inputs,assets:assetManifest,fixture:sha(fixtureBytes),catalog:sha(catalogText),builder:sha(read('scripts/build-genblue-review.mjs'))}));
const manifest = {kind:'genblue-static-read-only-review',sourceBaseCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceFingerprint,sourceInputs:inputs,fixture:{path:fixturePath,sha256:sha(fixtureBytes)},catalogSha256:sha(catalogText),sanitizedRelations:18,apiIsolationChecks:8,ignoredOtherGroupStyles:ignoredStyles.sort(),assets:assetManifest,bundleInputs:Object.keys(result.metafile.inputs).sort()};
fs.writeFileSync(path.join(out,'review-genblue/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output:out,sourceBaseCommit:manifest.sourceBaseCommit,sourceFingerprint,assets:assetManifest.length,assetBytes:assetManifest.reduce((sum,item)=>sum+item.bytes,0),sanitizedRelations:18,apiIsolationChecks:8,jsBytes:fs.statSync(path.join(out,'review-genblue/app.js')).size,cssBytes:fs.statSync(path.join(out,'review-genblue/app.css')).size},null,2));
