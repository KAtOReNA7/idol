/**
 * Builds a standalone static fixture. No installs, API, secrets or production data.
 *   node tests/css-readiness-browser.mjs --build-only /tmp/css-readiness-fixture
 * Serve that directory with any static HTTP server, then open its index.html.
 * Result: visible JSON and window.__cssReadinessResults (pass/fail with assertions).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {build}=require('esbuild');
const ts=require('typescript');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv.slice(2).find(arg=>!arg.startsWith('--'))??'/tmp/css-readiness-fixture';
const outputDir=path.resolve(output);
await fs.mkdir(outputDir,{recursive:true});
const result=await build({
  absWorkingDir:root,entryPoints:['tests/css-readiness-browser.entry.tsx'],bundle:true,platform:'browser',format:'iife',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},
  plugins:[{
    name:'synthetic-browser-fixture',
    setup(builder){
      builder.onResolve({filter:/\.css(?:\?url)?$/},args=>({path:args.path,namespace:'fixture-css'}));
      builder.onLoad({filter:/.*/,namespace:'fixture-css'},args=>({contents:args.path.endsWith('?url')?`export default ${JSON.stringify('/controlled-styles/app/'+path.basename(args.path.replace(/\?url$/,'')))}`:'export {};',loader:'js'}));
      builder.onLoad({filter:/[/\\]app[/\\]page\.tsx$/},async args=>{
        const source=await fs.readFile(args.path,'utf8');
        const ast=ts.createSourceFile(args.path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
        const editor=ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='Editor');
        if(!editor?.body)throw Error('Production Editor function missing; fixture instrumentation requires review.');
        const offset=editor.body.getStart(ast)+1;
        const instrumentation='\nuseEffect(()=>{const metrics=(window as any).__editorLifecycle;metrics.mounts++;return()=>{metrics.unmounts++;};},[]);\n';
        return {contents:source.slice(0,offset)+instrumentation+source.slice(offset),loader:'tsx',resolveDir:path.dirname(args.path)};
      });
    },
  }],
});
await fs.writeFile(path.join(outputDir,'fixture.js'),result.outputFiles[0].contents);
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RUNNING: React CSS readiness</title><style>html,body{margin:0;padding:0;scroll-behavior:auto}body{font-family:Arial,sans-serif}#results{position:fixed;right:8px;top:8px;z-index:9999;width:480px;max-height:80vh;overflow:auto;background:#fff;border:2px solid #334;padding:12px;font-size:11px;white-space:pre-wrap;pointer-events:none}#fixture{margin:0;padding:0}</style></head><body><button onclick="location.reload()" style="position:fixed;right:12px;bottom:12px;z-index:10000">Run checks again</button><pre id="results">Running real React DOM checks…</pre><div id="fixture"></div><script src="./fixture.js"></script></body></html>';
await fs.writeFile(path.join(outputDir,'index.html'),html);
await fs.writeFile(path.join(outputDir,'README.txt'),'Synthetic browser fixture; real React DOM, production useBrowseJourney/useExperienceStyles and App/Editor. All fetches are local synthetic responses. CSS transport is delayed by withholding href on real DOM link nodes; success uses native Blob stylesheet load. No source API, external network or production writes. Serve this directory via HTTP and inspect window.__cssReadinessResults or visible JSON.\n');
console.log('Built standalone real React DOM fixture: '+outputDir+' ('+result.outputFiles[0].contents.byteLength+' JS bytes).');
