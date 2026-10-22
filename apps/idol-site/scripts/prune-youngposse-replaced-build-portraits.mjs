// Build-only final step, after prune-unused-build-assets.mjs. Public/source never mutated.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifest=JSON.parse(fs.readFileSync(new URL('./youngposse-replaced-portrait-build-manifest.json',import.meta.url),'utf8'));
const prefix='/artist/youngposse/batch-b-20261016-webp-v1/';
const names=['doeun','jiana','jieun','sunhye','yeonjung'];
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function verify(p,row){if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink()||!fs.statSync(p).isFile()||fs.statSync(p).size!==row.bytes||hash(p)!==row.sha256)throw new Error('YP portrait integrity mismatch: '+p);}
function files(dir){if(!fs.existsSync(dir))return [];if(fs.lstatSync(dir).isSymbolicLink())throw new Error('YP portrait audit rejects symlink: '+dir);return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw new Error('YP portrait audit rejects symlink: '+p);return e.isDirectory()?files(p):[p];});}
export function auditReplacedYoungpossePortraits(root){
 root=path.resolve(root);
 const exactGuards=["app/artists/youngposse/page.tsx", "components/candidate-index-card.tsx", "components/candidate/youngposse-design.tsx", "components/group-detail.tsx", "data/candidate-index-visuals.json", "data/youngposse-artist.json", "dist/client/_next/static/chunks/catalog-group-views-2X1FOLPM.js", "dist/client/_next/static/chunks/youngposse-design-CJvfgQ_F.js", "dist/server/_next/static/page-BAQMDTuJ.js", "dist/server/index.js", "dist/server/ssr/_next/static/catalog-group-views-BTalh9pe.js", "dist/server/ssr/_next/static/youngposse-design-CIkyENua.js"];
 if(JSON.stringify(Object.keys(manifest.runtimeGuards).sort())!==JSON.stringify(exactGuards))throw new Error('YP exact consumer inventory changed');
 const exactRetained=["/artist/youngposse/batch-b-20261016-webp-v1/group-display.webp", "/artist/youngposse/batch-b-20261016/doeun-display.webp", "/artist/youngposse/batch-b-20261016/doeun-original.jpg", "/artist/youngposse/batch-b-20261016/group-display.webp", "/artist/youngposse/batch-b-20261016/group-original.png", "/artist/youngposse/batch-b-20261016/jiana-display.webp", "/artist/youngposse/batch-b-20261016/jiana-original.jpg", "/artist/youngposse/batch-b-20261016/jieun-display.webp", "/artist/youngposse/batch-b-20261016/jieun-original.jpg", "/artist/youngposse/batch-b-20261016/sunhye-display.webp", "/artist/youngposse/batch-b-20261016/sunhye-original.jpg", "/artist/youngposse/batch-b-20261016/yeonjung-display.webp", "/artist/youngposse/batch-b-20261016/yeonjung-original.jpg"];
 if(JSON.stringify(manifest.retainedImages.map(x=>x.path).sort())!==JSON.stringify(exactRetained))throw new Error('YP retained image inventory changed');
 if(JSON.stringify(manifest.files.map(x=>x.path).sort())!==JSON.stringify(names.map(n=>prefix+n+'-display.webp').sort())||manifest.retainedImages.length!==13)throw new Error('YP exact five portrait scope changed');
 for(const [p,row]of Object.entries(manifest.runtimeGuards))verify(path.join(root,p),row);
 const data=JSON.parse(fs.readFileSync(path.join(root,'data/candidate-index-visuals.json'),'utf8'));
 // Exact guarded bytes preserve the already-reviewed truthy hero branch. Keep it physically.
 const hero=prefix+'group-display.webp';if(!JSON.stringify(data).includes(hero)||!manifest.retainedImages.some(x=>x.path===hero))throw new Error('YP live index hero missing');
 for(const row of [...manifest.files,...manifest.retainedImages])verify(path.join(root,'public',row.path),row);
 for(const row of manifest.retainedImages)verify(path.join(root,'dist/client',row.path),row);
 const scan=['app','components','lib','hooks','data','db','public','vendor','dist'].flatMap(d=>files(path.join(root,d)));
 for(const p of scan){if(!/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/.test(p))continue;const text=fs.readFileSync(p,'utf8').replaceAll('\\/','/');if((text.includes(prefix)||text.includes('youngposse-artist'))&&!Object.hasOwn(manifest.runtimeGuards,path.relative(root,p)))throw new Error('Unreviewed YP portrait consumer: '+path.relative(root,p));}
 const plan=[];for(const row of manifest.files){const p=path.join(root,'dist/client',row.path);if(fs.existsSync(p)){verify(p,row);if(fs.statSync(p).nlink!==1)throw new Error('YP target shares inode: '+p);plan.push({file:path.relative(root,p),bytes:row.bytes,sha256:row.sha256});}}
 return plan;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=process.cwd(),args=process.argv.slice(2);if(args.some(x=>x!=='--apply'))throw new Error('Only --apply is accepted');
 const plan=auditReplacedYoungpossePortraits(root);if(args.includes('--apply'))for(const row of plan)fs.unlinkSync(path.join(root,row.file));
 console.log(JSON.stringify({mode:args.includes('--apply')?'apply':'dry-run',plan,savedBytes:plan.reduce((n,x)=>n+x.bytes,0),publicUnchanged:true,retainedImages:13},null,2));
}
