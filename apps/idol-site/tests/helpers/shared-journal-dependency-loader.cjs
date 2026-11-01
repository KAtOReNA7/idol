// Actual public journal helpers. No record, image or permission behavior mocked.
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const allowed=new Set(['@/components/seven-redesign/journal','@/components/public-work-credits','@/lib/idol/public-work-credits','@/lib/idol/stage-public-research']);const cache=new Map();
module.exports.sharedJournalDependency=function(name){
 if(!allowed.has(name))return undefined;if(cache.has(name))return cache.get(name);
 const root=path.resolve(__dirname,'../..'),stem=path.join(root,name.slice(2));const fs=require('node:fs'),entry=fs.existsSync(stem+'.tsx')?stem+'.tsx':stem+'.ts';
 const result=esbuild.buildSync({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'});
 const mod=new Module(entry,module);mod.filename=entry;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,entry);cache.set(name,mod.exports);return mod.exports;
};
