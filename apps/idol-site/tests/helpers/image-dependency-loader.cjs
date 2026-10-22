/* Actual image components for legacy SSR/host tests. No image behavior is mocked.
 * A single bundle preserves shared React contexts across both import paths. */
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');let cached;
function imageDependency(name){
 if(!['./reliable-image','@/components/reliable-image','@/components/app-image-presentation','./mv-photo-reference','@/components/mv-photo-reference','@/lib/idol/mv-photo-presentation','@/lib/idol/approved-video-poster'].includes(name))return undefined;
 if(cached)return cached;
 const result=esbuild.buildSync({stdin:{contents:"export * from './components/reliable-image';export * from './components/app-image-presentation';export * from './components/mv-photo-reference';export * from './lib/idol/mv-photo-presentation';export * from './lib/idol/approved-video-poster';",resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'});
 const filename=path.join(root,'tests/helpers/.image-compiled.cjs'),mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,filename);cached=mod.exports;return cached;
}
module.exports={imageDependency};
