/* Load the real extracted library components and pure models for legacy host
 * harnesses. React stays external; only CSS is omitted in this Node runner. */
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');let cached;
function libraryBrowserDependency(name){
 if(!['@/components/personal-insights/PersonalInsights','@/components/library-browser','@/lib/idol/library-browser/paging-model','@/lib/idol/library-browser/query-model'].includes(name))return undefined;
 if(cached)return cached;
 const result=esbuild.buildSync({stdin:{contents:"export * from './components/personal-insights/PersonalInsights';export * from './components/library-browser';export * from './lib/idol/library-browser/query-model';export * from './lib/idol/library-browser/paging-model';",resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'});
 const filename=path.join(root,'tests/helpers/.library-browser-compiled.cjs'),mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,filename);cached=mod.exports;return cached;
}
module.exports={libraryBrowserDependency};
