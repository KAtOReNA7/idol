const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const load=require('./helpers/public-artist-loader.cjs');
const source=load('lib/idol/stage-source.ts');
const {projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const {approvedStagePoster}=load('lib/idol/approved-video-poster.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const b={platform:'bilibili',sourceClass:'reupload',completeness:'full',videoId:'BV1bo4y1x7LV',bilibili:{cid:'123456789',page:2},url:'https://www.bilibili.com/video/BV1bo4y1x7LV/?p=2'};
const key='bilibili:BV1bo4y1x7LV:cid:123456789:p:2';
b.scoreBinding={videoId:b.videoId,sourceKey:key,initializedAt:'2026-10-29T10:00:00Z',initialScore:null};
test('all 497 legacy keys and current bindings remain valid without metadata migration',()=>{
 const all=require('../data/stage-videos.json');assert.equal(Object.keys(all).length,497);
 for(const s of Object.values(all)){assert.equal(source.stageSourceKey(s),s.clip?`${s.videoId}@${s.clip.startSeconds}-${s.clip.endSeconds}`:s.videoId);assert.ok(source.stageSourceMatchesUrl(s));if(s.scoreBinding)assert.ok(source.stageHasValidBinding(s));}
});
test('BV CID and page jointly identify a source, with safe exact external link and no unverified embed',()=>{
 assert.equal(source.stageSourceKey(b),key);assert.equal(source.stageWatchUrl(b),b.url+'&cid=123456789');assert.equal(source.stageEmbedUrl(b),null);assert.ok(source.stageHasValidBinding(b));
 for(const x of [{bilibili:{cid:'123456790',page:2}},{bilibili:{cid:'123456789',page:3},url:b.url.replace('p=2','p=3')},{scoreBinding:{...b.scoreBinding,sourceKey:undefined}}])assert.equal(source.stageHasValidBinding({...b,...x}),false);
});
test('incomplete identities, injected URLs, mismatched query and unsupported clips fail closed',()=>{
 for(const change of [{bilibili:undefined},{bilibili:{cid:'0',page:2}},{bilibili:{cid:'123456789',page:2,extra:true}},{clip:{startSeconds:0,endSeconds:20,sourceDurationSeconds:20}},{url:b.url+'&p=2'},{url:b.url+'&cid=999'},{url:b.url+'&redirect=https://example.org'},{url:b.url.replace('www.bilibili.com','www.bilibili.com.evil.example')},{url:b.url.replace('https:','http:')},{url:b.url+'#p=1'},{scorePolicy:'view_only'},{completeness:'excerpt'}])assert.equal(source.stageSourceKey({...b,...change}),null,JSON.stringify(change));
});
test('nonofficial YouTube can qualify while legacy key remains exact and URL safety applies',()=>{
 const y={...b,platform:'youtube',videoId:'INV0y_Cig7M',url:'https://www.youtube.com/watch?v=INV0y_Cig7M',bilibili:undefined,scoreBinding:null};assert.equal(source.stageSourceKey(y),y.videoId);assert.match(source.stageEmbedUrl(y),/youtube-nocookie/);assert.equal(source.stageWatchUrl({...y,url:'https://example.org/?v=INV0y_Cig7M'}),'');
});
test('same BV different CID or page cannot hide another supplement or borrow a poster',()=>{
 const a={platform:'bilibili',sourceId:b.videoId,url:b.url,bilibili:b.bilibili};assert.equal(source.stageMatchesAlternative(b,a),true);assert.equal(source.stageMatchesAlternative(b,{...a,bilibili:{...a.bilibili,cid:'999'}}),false);assert.equal(approvedStagePoster('recvxyOz5Xo5fW',b),null);
});
test('public projection retains only bounded Bili identity, never source evidence or private additions',()=>{
 const c={works:[{stage:{...b,sourceEvidence:{note:'private',urls:[]},bilibili:{...b.bilibili,secret:'hidden'}}}],members:[],ratings:[]};const actual=projectPublicCatalog(c).works[0].stage;assert.deepEqual(actual.bilibili,b.bilibili);assert.equal(actual.sourceEvidence,undefined);assert.equal(source.stageSourceKey(actual),key);
});
test('Bili player never requests a YouTube thumbnail, opens only on click and distinguishes multipart sessions',()=>{
 const file=path.join(__dirname,'../components/work-video-player.tsx'),ts=require('typescript'),vm=require('node:vm'),ex={};vm.runInNewContext('(function(exports,require){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText+'})')(ex,require);const {WorkVideoPlayer}=ex;
 const props={workId:'recSYNTHETIC',view:'stage',platform:'bilibili',sourceKey:key,url:source.stageWatchUrl(b),videoId:b.videoId,embedUrl:null,title:'Synthetic Bili'};
 const html=renderToStaticMarkup(React.createElement(WorkVideoPlayer,props));assert.doesNotMatch(html,/<iframe|ytimg|youtube|<img/);assert.match(html,/在 B站观看/);assert.notEqual(WorkVideoPlayer(props).key,WorkVideoPlayer({...props,sourceKey:key+'changed'}).key);
});
// Exercise actual native save, SQL transaction, idempotency and audit against a synthetic source.
const nativeFile=path.join(__dirname,'native-storage.test.cjs');
let prefix=fs.readFileSync(nativeFile,'utf8').split("test('native save changes")[0];
prefix=prefix.replace("const {nativeRevision,saveNativeRecord}=load('lib/idol/native-save.ts');","stubs.set('./stage',{stageForWork:()=>bili,stageScoreIsBound:s=>load('lib/idol/stage-source.ts').stageHasValidBinding(s)});const {nativeRevision,saveNativeRecord}=load('lib/idol/native-save.ts');");
const body=`
const bili=${JSON.stringify(b)};
test('native Bili save requires exact source key; failures never write, exact save retries once and preserves personal fields',async()=>{
 const h=harness(),base=await h.init();const input={...base,stageVideoId:bili.videoId,values:{stageScore:8}};
 for(const stageSourceKey of [undefined,bili.videoId,'bilibili:'+bili.videoId+':cid:999:p:2'])await assert.rejects(h.save('owner',{...input,stageSourceKey}),e=>e.code==='STAGE_SOURCE_CHANGED');
 assert.equal(h.sql.prepare('SELECT count(*) n FROM idol_saves').get().n,0);
 await assert.rejects(h.save('other',{...input,stageSourceKey:bili.scoreBinding.sourceKey}),e=>e.code==='OWNER_ONLY');
 const good={...input,stageSourceKey:bili.scoreBinding.sourceKey},one=await h.save('owner',good),two=await h.save('owner',good);assert.deepEqual(one,two);assert.equal(one.stageSource.sourceKey,bili.scoreBinding.sourceKey);assert.equal(one.stageSource.bilibili.cid,bili.bilibili.cid);
 const f=JSON.parse(h.sql.prepare('SELECT fields_json FROM idol_native_records').get().fields_json);assert.equal(f.fld641ausT,8);assert.equal(f.fld38CJY2U,0);assert.equal(f.fld4yOdHT5,'private synthetic note');assert.equal(f.fld3QKrpLN,'已观看');assert.equal(h.sql.prepare('SELECT count(*) n FROM idol_saves').get().n,1);
});`;
const mod=new Module(nativeFile,module);mod.filename=nativeFile;mod.paths=module.paths;mod._compile(prefix+body,nativeFile);
