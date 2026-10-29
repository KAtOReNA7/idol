const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs'),source=load('lib/idol/stage-source.ts'),{projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const key='x:2090845225845747983:video:1';
const xStage={platform:'x',sourceClass:'reupload',completeness:'full',videoId:'2090845225845747983',xMedia:{videoIndex:1},likesScope:'whole_post',url:'https://x.com/ming_baragi/status/2090845225845747983/video/1',scoreBinding:{videoId:'2090845225845747983',sourceKey:key,initializedAt:'2026-10-29T00:00:00Z',initialScore:null}};
test('X media keys bind a single explicit video and survive only the bounded anonymous projection',()=>{
 assert.equal(source.stageSourceKey(xStage),key);assert.ok(source.stageHasValidBinding(xStage));assert.ok(source.stageRequiresSourceKey(xStage));assert.equal(source.stageWatchUrl(xStage),xStage.url);assert.equal(source.stageEmbedUrl(xStage),null);
 const projected=projectPublicCatalog({works:[{stage:{...xStage,xMedia:{videoIndex:1,secret:'hidden'},sourceEvidence:{note:'private',urls:[]}}}],members:[],ratings:[]}).works[0].stage;assert.deepEqual(projected.xMedia,{videoIndex:1});assert.equal(projected.sourceEvidence,undefined);assert.ok(source.stageHasValidBinding(projected));
 for(const change of [{xMedia:{videoIndex:2},url:xStage.url.replace('/video/1','/video/2')},{scoreBinding:{...xStage.scoreBinding,sourceKey:xStage.videoId}},{scoreBinding:{...xStage.scoreBinding,initialScore:0}}])assert.equal(source.stageHasValidBinding({...xStage,...change}),false);
 for(const change of [{xMedia:undefined},{url:xStage.url.replace('/video/1','')},{url:xStage.url+'?redirect=https://evil.example'},{url:xStage.url.replace('x.com','x.com:443')},{bilibili:{cid:'1',page:1}},{clip:{startSeconds:0,endSeconds:10,sourceDurationSeconds:20,evidence:{note:'synthetic',urls:[]}}},{url:xStage.url.replace('x.com','x.com.evil.example')}])assert.equal(source.stageSourceKey({...xStage,...change}),null);
});
test('the actual X player renders an external-only action without inventing YouTube covers or embeddings',()=>{
 const ex={},ts=require('typescript');require('node:vm').runInNewContext('(function(exports,require){'+ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/work-video-player.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText+'})')(ex,require);
 const html=renderToStaticMarkup(React.createElement(ex.WorkVideoPlayer,{workId:'recSynthetic',view:'stage',platform:'x',sourceKey:key,url:xStage.url,videoId:xStage.videoId,embedUrl:null,title:'Synthetic TV performance'}));assert.match(html,/在 X 观看/);assert.doesNotMatch(html,/ytimg|youtube|<iframe|<img/);
});
const nativeFile=path.join(__dirname,'native-storage.test.cjs');
let prefix=fs.readFileSync(nativeFile,'utf8').split("test('native save changes")[0];
prefix=prefix.replace("const {nativeRevision,saveNativeRecord}=load('lib/idol/native-save.ts');","stubs.set('./stage',{stageForWork:()=>xStage,stageScoreIsBound:s=>load('lib/idol/stage-source.ts').stageHasValidBinding(s)});const {nativeRevision,saveNativeRecord}=load('lib/idol/native-save.ts');");
const body=`const xStage=${JSON.stringify(xStage)};
test('native X saves reject post-only or other-video keys, retain owner-only access and audit the exact video index',async()=>{
 const h=harness(),base=await h.init(),input={...base,stageVideoId:xStage.videoId,values:{stageScore:8}};
 for(const stageSourceKey of [undefined,xStage.videoId,'x:'+xStage.videoId+':video:2'])await assert.rejects(h.save('owner',{...input,stageSourceKey}),e=>e.code==='STAGE_SOURCE_CHANGED');
 assert.equal(h.sql.prepare('SELECT count(*) n FROM idol_saves').get().n,0);
 await assert.rejects(h.save('other',{...input,stageSourceKey:xStage.scoreBinding.sourceKey}),e=>e.code==='OWNER_ONLY');
 const good={...input,stageSourceKey:xStage.scoreBinding.sourceKey},one=await h.save('owner',good),two=await h.save('owner',good);assert.deepEqual(one,two);assert.equal(one.stageSource.platform,'x');assert.equal(one.stageSource.xMedia.videoIndex,1);assert.equal(Object.keys(one.stageSource.xMedia).join(','),'videoIndex');
 const f=JSON.parse(h.sql.prepare('SELECT fields_json FROM idol_native_records').get().fields_json);assert.equal(f.fld641ausT,8);assert.equal(f.fld38CJY2U,0);assert.equal(f.fld4yOdHT5,'private synthetic note');assert.equal(f.fld3QKrpLN,'已观看');assert.equal(h.sql.prepare('SELECT count(*) n FROM idol_saves').get().n,1);
});`;
const mod=new Module(nativeFile,module);mod.filename=nativeFile;mod.paths=module.paths;mod._compile(prefix+body,nativeFile);

test('the adopted QWER video uses fresh real protection, preserves every prior source and discloses user-confirmed scope',()=>{
 const {beforeQwer,receipt}=require('./helpers/qwer-formal-baseline.cjs');
 const actual=require('../data/stage-videos.json'),stage=load('lib/idol/stage.ts').stageForWork(receipt.workId);
 assert.equal(Object.keys(actual).length,500);assert.equal(Object.keys(beforeQwer('stageVideos',actual)).length,499);
 assert.deepEqual(stage,receipt.stageVideos.afterRow);assert.equal(source.stageSourceKey(stage),key);assert.ok(source.stageHasValidBinding(stage));
 assert.equal(stage.platform,'x');assert.equal(stage.sourceClass,'reupload');assert.equal(stage.selection.occasion,'music_program');assert.equal(stage.likesScope,'whole_post');assert.equal(stage.likes.precision,'unknown');
 assert.match(stage.verificationNote,/四人参与/);assert.match(stage.verificationNote,/只有一支视频/);assert.match(stage.verificationNote,/未独立全片播放/);assert.match(stage.verificationNote,/完整206条保存日志/);
 assert.equal(load('lib/idol/approved-video-poster.ts').approvedStagePoster(receipt.workId,stage),null);
 assert.ok(receipt.ownerPreimage.usedAgeSeconds<900);assert.equal(receipt.ownerPreimage.targetStageScoreEmpty,true);assert.equal(receipt.ownerPreimage.journalRows,206);assert.equal(receipt.privateWrites,0);assert.equal(receipt.deployments,0);
 const altered=structuredClone(actual);altered[Object.keys(altered)[0]].title+='unreviewed';assert.throws(()=>beforeQwer('stageVideos',altered));
 const supplemental=require('../data/stages/supplements.json');assert.deepEqual(supplemental.works[receipt.workId].searchReview,receipt.supplementChange.after);assert.match(supplemental.works[receipt.workId].searchReview.summary,/已采用X/);
 assert.equal(require('./helpers/qwer-formal-baseline.cjs').beforeQwerSupplements(supplemental).works[receipt.workId].searchReview.summary,receipt.supplementChange.expectedBefore.summary);
});
