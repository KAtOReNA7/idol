const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {approvedStagePoster,approvedVideoPoster}=load('lib/idol/approved-video-poster.ts');
const {stageForWork}=load('lib/idol/stage.ts');
const {stageWatchUrl,stageSourceKey}=load('lib/idol/stage-source.ts');
const componentExports={},ts=require('typescript');
require('node:vm').runInNewContext('(function(exports,require){'+ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/work-video-player.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText+'})')(componentExports,require);
const {WorkVideoPlayer}=componentExports;
const receipt=require('../../../docs/codex/evidence/20261029-next-followup/password-poster-adoption.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const id='rec28ldfRTrOnV',stage=stageForWork(id),entry=receipt.entry;
test('the observed Password thumbnail retains its actual decoded dimensions and all original bytes',()=>{
 const poster=approvedStagePoster(id,stage);assert.equal(poster.src,entry.src);assert.deepEqual(poster.intrinsicSize,{width:1024,height:576});assert.equal(poster.fit,'contain');
 const bytes=fs.readFileSync(path.join(__dirname,'../public',poster.src));assert.equal(bytes.length,41986);assert.equal(hash(bytes),entry.sha256);
 assert.equal(receipt.browserObservation.declaredOgSize[0],1200);assert.equal(receipt.browserObservation.actualDecodedSize[0],1024);assert.match(poster.label,/B站转载/);assert.doesNotMatch(poster.label,/官方/);
 for(const [file,sha] of Object.entries(receipt.protectedFileSha256)){
  let bytes=fs.readFileSync(path.join(__dirname,'..',file));
  const qwer=require('./helpers/qwer-formal-baseline.cjs');
  if(file==='data/stage-videos.json'||file==='data/stages/status.json')bytes=Buffer.from(JSON.stringify(qwer.beforeQwer(file==='data/stage-videos.json'?'stageVideos':'stageStatuses',JSON.parse(bytes)),null,2)+'\n');
  if(file==='data/stages/supplements.json')bytes=Buffer.from(JSON.stringify(qwer.beforeQwerSupplements(JSON.parse(bytes)),null,2)+'\n');
  assert.equal(hash(bytes),sha,file);
 }
});
test('a poster cannot follow another part, range, work or platform despite a shared BV',()=>{
 assert.equal(approvedVideoPoster(id,stage.videoId,'stage'),null);
 for(const change of [{videoId:'BV1bo4y1x7LV'},{bilibili:{cid:'34265369311',page:1}},{bilibili:{cid:'34265369310',page:2},url:stage.url.replace('p=1','p=2')},{clip:{startSeconds:0,endSeconds:20,sourceDurationSeconds:174,evidence:{note:'synthetic scope',urls:['https://example.org']}}},{platform:'youtube',bilibili:undefined}])assert.equal(approvedStagePoster(id,{...stage,...change}),null);
 assert.equal(approvedStagePoster('wrong',stage),null);assert.equal(approvedStagePoster('recvxyH5pzoMAf',stageForWork('recvxyH5pzoMAf')),null);
 assert.equal(receipt.staycPosterReview.decision,'rejected_wrong_song_scope');
});
test('actual Bili player SSR shows the local poster without a YouTube thumbnail or automatic third-party embed',()=>{
 const p=approvedStagePoster(id,stage),html=renderToStaticMarkup(React.createElement(WorkVideoPlayer,{workId:id,view:'stage',platform:stage.platform,sourceKey:stageSourceKey(stage),url:stageWatchUrl(stage),videoId:stage.videoId,embedUrl:null,title:stage.title,posterSrc:p.src,posterLabel:p.label,posterFit:p.fit,posterSize:p.intrinsicSize}));
 assert.ok(html.includes(entry.src));assert.match(html,/object-fit:contain/);assert.match(html,/max-width:1024px/);assert.match(html,/在 B站观看/);assert.doesNotMatch(html,/ytimg|youtube|<iframe/);
});
