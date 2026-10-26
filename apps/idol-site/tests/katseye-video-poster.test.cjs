const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {katseyeVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const workId='rec28ldfRTrPC7',mv='bYg6aMDQ_TA',stage='FkhlaDkbbas';
test('KATSEYE local images require exact work/video/view and missing Gameboy stage stays absent',()=>{
 for(const [id,view,prefix] of [[mv,'mv','mv'],[stage,'stage','stage']]){const p=katseyeVideoPoster(workId,id,view);assert.equal(p.src,`/artist/katseye/native/${prefix}-${workId}.jpg`);assert.ok(fs.statSync('public'+p.src).size>1000);assert.doesNotMatch(p.label,/原图|YouTube|缩略图/);assert.equal(katseyeVideoPoster('wrong',id,view),null);assert.equal(katseyeVideoPoster(workId,null,view),null);assert.equal(katseyeVideoPoster(workId,'wrong',view),null);assert.equal(katseyeVideoPoster(workId,id,view==='mv'?'stage':'mv'),null);}
 assert.equal(katseyeVideoPoster('recvxIZnIaGCNq','-bC4iak3kxg','stage'),null);
});
// Current shared card/player precedence is covered by mv-public-media.test.cjs.
