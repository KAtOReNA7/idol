/* Actual image components for legacy SSR/host tests. No image behavior is mocked.
 * A single bundle preserves shared React contexts across both import paths. */
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');let cached;
function imageDependency(name){
 if(!['./original-photo-link','@/components/original-photo-link','./reliable-image','@/components/reliable-image','@/components/app-image-presentation','./mv-photo-reference','@/components/mv-photo-reference','@/components/mv-identity-photo','@/components/member-work-identity-photo','@/components/member-recognition-provider','@/lib/idol/member-work-photo','@/lib/idol/mv-member-appearance','@/lib/idol/member-works','@/lib/idol/mv-photo-presentation','@/lib/idol/approved-video-poster','@/lib/idol/mv-public-media','@/lib/idol/mv-recognition-edition','@/lib/idol/historical-member-visual'].includes(name))return undefined;
 if(cached)return cached;
 const result=esbuild.buildSync({stdin:{contents:"export * from './components/original-photo-link';export * from './components/reliable-image';export * from './components/app-image-presentation';export * from './components/mv-photo-reference';export * from './components/mv-identity-photo';export * from './components/member-work-identity-photo';export * from './components/member-recognition-provider';export * from './lib/idol/member-work-photo';export * from './lib/idol/mv-member-appearance';export * from './lib/idol/member-works';export * from './lib/idol/mv-photo-presentation';export * from './lib/idol/approved-video-poster';export * from './lib/idol/mv-public-media';export * from './lib/idol/mv-recognition-edition';export * from './lib/idol/historical-member-visual';",resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'});
 const filename=path.join(root,'tests/helpers/.image-compiled.cjs'),mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,filename);cached=mod.exports;return cached;
}
const publishedLabels=new Map([
 ['官方具名 MV 拍摄视频原生帧','官方 MV 拍摄花絮截图'],
 ['具名成员MV章节；原版场景已核','原版 MV 的具名成员章节'],
]);
const expectedPortraitLabel=label=>publishedLabels.get(label)??label;
module.exports={imageDependency,expectedPortraitLabel};
