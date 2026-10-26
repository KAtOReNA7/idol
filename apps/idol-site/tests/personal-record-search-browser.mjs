import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=require('esbuild');
const out=process.argv[2]??'/tmp/personal-record-search-browser';await fs.mkdir(out,{recursive:true});
const result=await build({entryPoints:['tests/personal-record-search-browser.entry.jsx'],bundle:true,platform:'browser',format:'iife',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'synthetic-css',setup(b){b.onResolve({filter:/\.css(?:\?url)?$/},a=>({path:a.path,namespace:'css-stub'}));b.onLoad({filter:/.*/,namespace:'css-stub'},()=>({contents:'export default undefined',loader:'js'}));}}]});
await fs.writeFile(out+'/fixture.js',result.outputFiles[0].contents);await fs.writeFile(out+'/index.html','<!doctype html><html><meta charset="utf-8"><style>article{min-height:260px}button,input{padding:8px}body{font-family:sans-serif}</style><pre id="results">running</pre><div id="fixture"></div><script src="/fixture.js"></script></html>');
console.log(out);
