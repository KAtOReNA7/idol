// Load actual public portrait bindings so new artist modules cannot silently
// disable the shared member/editor regression suites.
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const allowed=new Set(['katseye','tracer','witchx','spia','atheart','hitgs','vcha','idle','izone','fromis9','everglow','rocketpunch','cherrybullet','weeekly']);
const cache=new Map();
function portraitDependency(name){
 const match=/^@\/lib\/idol\/([a-z0-9]+)-photos$/.exec(name);
 if(!match||!allowed.has(match[1]))return undefined;
 if(cache.has(name))return cache.get(name);
 const root=path.resolve(__dirname,'../..'),entry=path.join(root,'lib/idol',match[1]+'-photos.ts');
 const result=esbuild.buildSync({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
 const mod=new Module(entry,module);mod.filename=entry;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,entry);cache.set(name,mod.exports);return mod.exports;
}
module.exports={portraitDependency};
