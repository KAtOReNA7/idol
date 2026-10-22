// Existing browser runtime only; all network requests stay on this synthetic host.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=require('esbuild');
const out=path.resolve(process.argv[2]??'/tmp/catalog-name-search-browser');await fs.mkdir(out,{recursive:true});
const result=await build({entryPoints:['tests/catalog-name-search-browser.entry.jsx'],bundle:true,platform:'browser',format:'iife',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'synthetic-css',setup(b){b.onResolve({filter:/\.css(?:\?url)?$/},a=>({path:a.path,namespace:'css-stub'}));b.onLoad({filter:/.*/,namespace:'css-stub'},()=>({contents:'export default undefined',loader:'js'}));}}]});
await fs.writeFile(out+'/fixture.js',result.outputFiles[0].contents);
await fs.writeFile(out+'/index.html','<!doctype html><html><meta charset="utf-8"><style>.work-card,.member-tile{display:block;min-height:140px}.group-index-card{display:block;min-height:250px}button,input,select{padding:8px}body{font-family:sans-serif}svg{width:16px;height:16px}</style><pre id="results">running</pre><div id="fixture"></div><script src="/fixture.js"></script></html>');
if(process.argv.includes('--build-only')){console.log(out);process.exit(0);}
let playwright;for(const candidate of [process.env.PLAYWRIGHT_MODULE,'playwright',process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES&&path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright')].filter(Boolean)){try{playwright=require(candidate);break;}catch{}}
if(!playwright)throw Error('BROWSER_NOT_RUN: existing Playwright unavailable; no dependency installed');
const server=http.createServer(async(req,res)=>{const file=req.url==='/fixture.js'?'fixture.js':'index.html';res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(await fs.readFile(path.join(out,file)));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;let browser;
try{
 browser=await playwright.chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',error=>errors.push(String(error)));await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());await page.goto(base);
  await page.waitForFunction(()=>document.querySelector('#results').textContent!=='running',null,{timeout:60000});const report=JSON.parse(await page.locator('#results').textContent());report.pageErrors=errors;await page.screenshot({path:path.join(out,`search-${width}.png`),fullPage:true});await fs.writeFile(path.join(out,`results-${width}.json`),JSON.stringify(report,null,2));
  console.log(JSON.stringify({width,...report}));await page.close();if(report.status!=='passed'||errors.length)throw Error(`Browser regression failed at ${width}`);
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
