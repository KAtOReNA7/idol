// Final build-only step. Never delete or rewrite public/source originals.
import fs from 'node:fs';import path from 'node:path';import {createHash}from'node:crypto';import {fileURLToPath}from'node:url';
const manifest=JSON.parse(fs.readFileSync(new URL('./candyshop-unused-group-original-manifest.json',import.meta.url),'utf8'));
const original='/artist/candyshop/batch-b-20261016/group-original.jpg',display='/artist/candyshop/batch-b-20261016-webp-v1/group-display.webp';
const exactGuards=["app/artists/candyshop/page.tsx", "components/candidate-artist-experience.tsx", "components/candidate-index-card.tsx", "components/candidate/candyshop-design.tsx", "components/group-detail.tsx", "components/photo-lightbox.tsx", "components/reliable-image.tsx", "data/candidate-index-visuals.json", "data/candyshop-artist.json", "dist/client/_next/static/chunks/candidate-artist-experience-Cuc-PrOK.js", "dist/client/_next/static/chunks/candyshop-design-DKOLwvwe.js", "dist/client/_next/static/chunks/catalog-group-views-2X1FOLPM.js", "dist/server/_next/static/page-COOl0hhP.js", "dist/server/index.js", "dist/server/ssr/_next/static/candidate-artist-experience-Ca9nVyky.js", "dist/server/ssr/_next/static/candyshop-design-DS6Q9DIw.js", "dist/server/ssr/_next/static/catalog-group-views-BTalh9pe.js", "lib/idol/image-lightbox-session.ts", "lib/idol/image-presentation.ts"];
function verify(file,row){if(!fs.existsSync(file)||fs.lstatSync(file).isSymbolicLink()||!fs.statSync(file).isFile()||fs.statSync(file).size!==row.bytes||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==row.sha256)throw new Error('Candyshop integrity mismatch: '+file);}
function files(dir){if(!fs.existsSync(dir))return[];if(fs.lstatSync(dir).isSymbolicLink())throw new Error('Candyshop audit rejects symlink: '+dir);return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw new Error('Candyshop audit rejects symlink: '+p);return e.isDirectory()?files(p):[p];});}
export function auditCandyshopUnusedOriginal(root){
 root=path.resolve(root);
 if(manifest.original.path!==original||manifest.display.path!==display||JSON.stringify(Object.keys(manifest.runtimeGuards).sort())!==JSON.stringify(exactGuards))throw new Error('Candyshop exact single-original scope changed');
 for(const[p,row]of Object.entries(manifest.runtimeGuards))verify(path.join(root,p),row);
 verify(path.join(root,'public',original),manifest.original);for(const d of ['public','dist/client'])verify(path.join(root,d,display),manifest.display);
 const content=JSON.parse(fs.readFileSync(path.join(root,'data/candyshop-artist.json'),'utf8'));if(content.hero.image!==display)throw new Error('Candyshop live hero changed');
 const inventory=files(path.join(root,'public')).map(p=>'/'+path.relative(path.join(root,'public'),p).split(path.sep).join('/')).sort();
 const scan=['app','components','lib','hooks','data','db','public','vendor','dist'].flatMap(d=>files(path.join(root,d)));
 for(const file of scan){if(!/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/.test(file))continue;let text=fs.readFileSync(file,'utf8').replaceAll('\\/','/');
  if(file===path.join(root,'dist/server/index.js')){const matches=[...text.matchAll(/new Set\(`([^`]*?)`\.split\(`,`\)\)/g)].filter(m=>m[1].includes(original));if(matches.length!==1||JSON.stringify(matches[0][1].split(',').sort())!==JSON.stringify(inventory))throw new Error('Candyshop public inventory changed');text=text.replace(matches[0][0],'new Set()');}
  if(text.includes(original))throw new Error('Candyshop original still referenced: '+file);
  // Reject newly introduced relative/dynamic Candyshop image construction; exact
  // source and compiled renderer guards protect the existing shared callers.
  const rest=text.replace(/\/artist\/candyshop\/[A-Za-z0-9_.\/-]+\.(?:webp|jpg|png)/g,'');if(rest.includes('/artist/candyshop/'))throw new Error('Unreviewed Candyshop path construction: '+file);
 }
 const file=path.join(root,'dist/client',original);if(!fs.existsSync(file))return[];verify(file,manifest.original);if(fs.statSync(file).nlink!==1)throw new Error('Candyshop target shares inode');return[{file:path.relative(root,file),bytes:manifest.original.bytes,sha256:manifest.original.sha256}];
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.slice(2).some(x=>x!=='--apply'))throw new Error('Only --apply is accepted');const plan=auditCandyshopUnusedOriginal(process.cwd());if(process.argv.includes('--apply'))for(const row of plan)fs.unlinkSync(path.join(process.cwd(),row.file));console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',plan,savedBytes:plan.reduce((n,x)=>n+x.bytes,0),sourceOriginalRetained:true,currentDisplayRetained:true},null,2));}
