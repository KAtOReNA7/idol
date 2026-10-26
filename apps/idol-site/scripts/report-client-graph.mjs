// Production build accounting, not a transfer-size or LCP measurement.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const directory=path.resolve(process.argv[2]??'dist/client');
const manifest=JSON.parse(fs.readFileSync(path.join(directory,'.vite/manifest.json'),'utf8'));
function dependencies(keys){
 const seen=new Set();
 function visit(key){if(seen.has(key))return;const chunk=manifest[key];if(!chunk)throw Error('Missing manifest key: '+key);seen.add(key);for(const item of chunk.imports??[])visit(item);}
 for(const key of keys)visit(key);return [...seen];
}
function measure(keys){
 const closure=dependencies(keys);
 const chunks=closure.map(key=>{const item=manifest[key],bytes=fs.readFileSync(path.join(directory,item.file));return {key,file:item.file,bytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length};});
 const css=[...new Set(closure.flatMap(key=>manifest[key].css??[]))].map(file=>{const bytes=fs.readFileSync(path.join(directory,file));return {file,bytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length};});
 return {cssBytes:css.reduce((n,c)=>n+c.bytes,0),cssGzipBytes:css.reduce((n,c)=>n+c.gzipBytes,0),cssFiles:css.length,css,jsBytes:chunks.reduce((n,c)=>n+c.bytes,0),gzipBytes:chunks.reduce((n,c)=>n+c.gzipBytes,0),jsFiles:chunks.length,chunks};
}
const page=measure(['app/page.tsx']);
const initial=measure(['virtual:vinext-app-browser-entry','app/page.tsx']);
const serverManifestPath=path.join(directory,'../server/__vite_rsc_assets_manifest.js');
const serverManifest=fs.existsSync(serverManifestPath)?JSON.parse(fs.readFileSync(serverManifestPath,'utf8').replace(/^export default /,'')):null;
const layoutCss=(serverManifest?.serverResources?.['app/layout.tsx']?.css??[]).map(file=>{const bytes=fs.readFileSync(path.join(directory,file.replace(/^\//,'')));return {file,bytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length};});
const total={jsAndCssBytes:initial.jsBytes+initial.cssBytes+layoutCss.reduce((n,c)=>n+c.bytes,0),gzipBytes:initial.gzipBytes+initial.cssGzipBytes+layoutCss.reduce((n,c)=>n+c.gzipBytes,0),jsFiles:initial.jsFiles,cssFiles:initial.cssFiles+layoutCss.length,layoutCss};
const lazyKeys=Object.keys(manifest).filter(key=>key==='components/catalog-group-views.ts');
const groupViews=lazyKeys.length?measure(lazyKeys):null;
const initialKeys=new Set(initial.chunks.map(chunk=>chunk.key));
const added=groupViews?.chunks.filter(chunk=>!initialKeys.has(chunk.key))??[];
const report={total,note:'Manifest static JS dependencies, deduplicated by emitted chunk; gzip at Node defaults. CSS attached to the static graph is measured separately. Root layout CSS is included in total when the server asset manifest is available. Excludes fonts, images, API bodies, dynamic imports, and transport overhead. Not a browser performance/LCP measurement.',page,initial,groupViews,groupFirstVisit:{additionalCssFiles:groupViews?.css.filter(css=>!initial.css.some(existing=>existing.file===css.file)).length??0,additionalJsFiles:added.length,additionalJsBytes:added.reduce((n,c)=>n+c.bytes,0),additionalGzipBytes:added.reduce((n,c)=>n+c.gzipBytes,0),chunks:added}};
console.log(JSON.stringify(report,null,2));
