/** Build a localhost-only fixture with the real hook and exact production CSS/font bytes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {build}=require('esbuild');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputDir=path.resolve(process.argv.slice(2).find(arg=>!arg.startsWith('--'))??path.join(root,'../css-http-fixture'));
const clientDir=path.join(root,'dist/client');
const vite=JSON.parse(await fs.readFile(path.join(clientDir,'.vite/manifest.json'),'utf8'));
const main=vite['app/page.tsx'];
if(!main)throw Error('Production build manifest has no app/page.tsx; run the existing build first.');
const cssDir=path.join(clientDir,'_next/static/css');
const globals=(await fs.readdir(cssDir)).filter(name=>/^index\.[^.]+\.css$/.test(name));
if(globals.length!==1)throw Error(`Expected one compiled global index CSS, found ${globals.length}; review the build layout.`);
const baseCss=['/_next/static/css/'+globals[0]];
const visited=new Set();
function collectBase(key){if(visited.has(key))return;visited.add(key);const node=vite[key];if(!node)throw Error('Missing imported manifest module: '+key);for(const dependency of node.imports??[])collectBase(dependency);for(const css of node.css??[])if(!baseCss.includes('/'+css))baseCss.push('/'+css);}
collectBase('virtual:vinext-app-browser-entry');
collectBase('app/page.tsx');
const themes=(main.assets??[]).filter(file=>file.endsWith('.css')).map(file=>{
  const basename=path.basename(file),match=basename.match(/^([a-z0-9]+)-experience\.[^.]+\.css$/);
  if(!match)throw Error('Unexpected candidate asset name: '+file);
  return {slug:match[1],href:'/'+file};
});
if(themes.length!==37||new Set(themes.map(theme=>theme.slug)).size!==37)throw Error(`Expected 37 distinct production theme stylesheets, found ${themes.length}.`);
async function walk(directory,prefix=''){const result=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){const relative=path.posix.join(prefix,entry.name);if(entry.isDirectory())result.push(...await walk(path.join(directory,entry.name),relative));else if(entry.isFile())result.push(relative);}return result.sort();}
const fontFiles=await walk(path.join(root,'public/fonts'));
const fontPaths=fontFiles.filter(name=>/\.(?:woff2?|ttf|otf)$/i.test(name)).map(name=>'/fonts/'+name);
const manifest={baseCss,themes,fontPaths};
await fs.mkdir(outputDir,{recursive:true});
for(const href of [...baseCss,...themes.map(theme=>theme.href)]){
  const source=path.join(clientDir,href.slice(1)),target=path.join(outputDir,href.slice(1));
  await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);
}
for(const file of fontFiles){const target=path.join(outputDir,'fonts',file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(root,'public/fonts',file),target);}
await fs.writeFile(path.join(outputDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
// No source rewriting or mocked hook: esbuild loads the production TypeScript module directly.
const entry=path.join(root,'tests/css-http-fixture.entry.tsx');
try{await fs.access(entry);}catch{throw Error('CSS/font assets and manifest copied, but tests/css-http-fixture.entry.tsx is not ready yet. Rerun after the entry is added.');}
const bundle=await build({absWorkingDir:root,entryPoints:[entry],bundle:true,platform:'browser',format:'esm',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'}});
if(bundle.outputFiles.length!==1)throw Error('HTTP fixture must produce one JS bundle; unexpected additional build output.');
await fs.writeFile(path.join(outputDir,'fixture.js'),bundle.outputFiles[0].contents);
const inline=JSON.stringify(manifest).replaceAll('<','\\u003c');
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CSS HTTP readiness fixture</title>'+baseCss.map(href=>'<link rel="stylesheet" href="'+href+'">').join('')+'<style>.qa-controls{max-width:1100px;width:calc(100% - 32px);margin:24px auto;padding:20px;border:1px solid #aab;background:#fff;color:#222;font:14px/1.5 system-ui,sans-serif;box-sizing:border-box}.qa-controls button{margin:4px;padding:8px 12px;border:1px solid #778;background:#eef;color:#112}.qa-controls select,.qa-controls button{max-width:100%}#http-phase{overflow-wrap:anywhere}#http-results{max-width:100%;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><div id="root"></div><script>window.__cssHttpManifest='+inline+';</script><script type="module" src="/fixture.js"></script></body></html>';
await fs.writeFile(path.join(outputDir,'index.html'),html);
await fs.copyFile(path.join(root,'tests/css-http-fixture-server.py'),path.join(outputDir,'server.py'));
await fs.writeFile(path.join(outputDir,'README.txt'),'Local-only CSS HTTP fixture. Exact compiled global/main CSS, all 37 theme assets, and every public/fonts file are copied without transformation. The JS bundle uses the real production useExperienceStyles hook. Start: python3 server.py --directory . --port 8766. Open http://127.0.0.1:8766/. GET /fixture-log.json reports requests and scenarioCounts. Fault paths: /fault/once404/<theme-basename>?case=<unique>, /fault/timeout/<theme-basename>?case=<unique> (first response delayed 18 seconds), /fault/delay/<theme-basename>?case=<unique> (first response delayed 2 seconds). Subsequent requests in the same case return real CSS immediately. No production API, credentials, external service, or deployment.\n');
console.log(JSON.stringify({outputDir,baseCss,themes:themes.length,fontFiles:fontFiles.length,fontPaths:fontPaths.length,bundleBytes:bundle.outputFiles[0].contents.byteLength},null,2));
