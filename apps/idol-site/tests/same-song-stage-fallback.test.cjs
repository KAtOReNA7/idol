const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {root,workId,groupId,now,evidence,base,fallback,normalize,merge,validate}=require('./helpers/stage-fallback-fixture.cjs');
const load=require('./helpers/public-artist-loader.cjs');
const source=load('lib/idol/stage-source.ts'),{projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const {StageSameSongFallback}=load('components/stage-same-song-fallback.tsx');
const {stageKindLabel}=load('lib/idol/stage-display.ts');
const originalVideos=fs.readFileSync(path.join(root,'data/stage-videos.json'));
function normalized(c,all,id=workId){const r=normalize(c,all,id);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function imported(c=fallback(),options={}){const r=merge(normalized(c),options);assert.equal(r.status,0,r.stderr);return r;}

test('explicit partial and different-version same-song fallbacks normalize honestly and import only into empty owner slots',()=>{
 for(const pair of [{completeness:'excerpt',version:'exact'},{completeness:'full',version:'different'},{completeness:'excerpt',version:'different'}]){
  const c=fallback(pair),batch=normalized(c);assert.equal(batch.items[0].selected.versionMatch,false);assert.match(batch.items[0].selected.label,/同曲后备/);
  if(pair.completeness==='excerpt')assert.doesNotMatch(batch.items[0].selected.label,/完整/);
  const r=merge(batch);assert.equal(r.status,0,r.stderr);const s=r.videos[workId];assert.equal(s.completeness,pair.completeness);assert.deepEqual(s.sameSongFallback,c.sameSongFallback);assert.equal(s.scoreBinding.initialScore,null);assert.equal(s.scoreBinding.sourceKey,c.videoId);assert.doesNotMatch(s.selectionNote,/同曲同版本|最高/);assert(source.stageHasValidBinding(s));
 }
});

test('complete corresponding versions outrank any fallback, while unknown song, scope, version or differences are refused',()=>{
 const exact=base({videoId:'exactsource',url:'https://www.youtube.com/watch?v=exactsource',type:'produced_dance_performance',selection:{occasion:'produced_performance',evidence}}),f=fallback();
 assert.equal(normalize(exact,[exact,f]).status,0);assert.notEqual(normalize(f,[exact,f]).status,0);
 for(const patch of [{sameSong:false},{version:'unconfirmed'},{completeness:'full',version:'exact'},{differences:[]},{targetWorkId:'unknown'},{groupId:''},{performerScope:'solo'},{evidence:{note:'',urls:[]}},{evidence:{note:'x',urls:['http://example.org/proof']}}])assert.notEqual(normalize({...f,sameSongFallback:{...f.sameSongFallback,...patch}}).status,0,JSON.stringify(patch));
 for(const patch of [{versionMatch:true},{versionMatch:'exact'},{sameSongFallback:undefined},{selection:{occasion:'concert',evidence}},{sourceClass:'audience_original'}])assert.notEqual(normalize({...f,...patch}).status,0);
 for(const patch of [{targetWorkId:'recOtherWork'},{groupId:'recOtherGroup'},{targetSong:'Different song'}]){
  const tampered=normalized(f);Object.assign(tampered.items[0].selected.sameSongFallback,patch);
  const r=merge(tampered);assert.notEqual(r.status,0);assert(r.before.equals(r.after));assert.equal(r.artifact,false);
 }
});

test('fallback can never replace an existing source or bypass zero scores, save history, fresh owner data or published preimages',()=>{
 const batch=normalized(fallback()),prior=base({scoreBinding:{videoId:'fallsource1',sourceKey:'fallsource1',initializedAt:now,initialScore:null}});
 for(const previous of [prior,{...prior,videoId:'oldsource12',url:'https://www.youtube.com/watch?v=oldsource12'}]){
  const r=merge(batch,{previous});assert.notEqual(r.status,0);assert(r.before.equals(r.after));assert.equal(r.artifact,false);
 }
 for(const options of [{score:0},{score:7},{journal:[{record_id:workId,table_key:'works',status:'done'}]},{journal:[{record_id:workId,table_key:'works',status:'pending'}]}]){const r=merge(batch,options);assert.equal(r.status,0,r.stderr);assert(r.before.equals(r.after));}
 for(const options of [{capturedAt:new Date(Date.now()-901000).toISOString()},{omitSchema:true},{published:{[workId]:prior}}]){const r=merge(batch,options);assert.notEqual(r.status,0);assert(r.before.equals(r.after));assert.equal(r.artifact,false);}
});

test('a later exact full performance can replace an unscored fallback only through the unchanged strict replacement gates',()=>{
 const previous=imported().videos[workId],exact=base({videoId:'exactsource',url:'https://www.youtube.com/watch?v=exactsource'}),batch=normalized(exact);
 const r=merge(batch,{previous});assert.equal(r.status,0,r.stderr);assert.equal(r.videos[workId].videoId,'exactsource');assert.equal(r.videos[workId].sameSongFallback,undefined);
 assert.equal(r.videos[workId].previousSources.at(-1).preference,'higher_policy_priority');assert.deepEqual(r.videos[workId].previousSources.at(-1).sameSongFallback,previous.sameSongFallback);
 for(const options of [{score:0},{journal:[{record_id:workId,table_key:'works',status:'done'}]}]){const held=merge(batch,{previous,...options});assert.equal(held.status,0,held.stderr);assert.equal(held.videos[workId].videoId,previous.videoId);}
});

test('Bilibili fallback retains exact BV CID page and an excerpt without proof still fails closed',()=>{
 const b='BV1234567890',c=fallback({platform:'bilibili',videoId:b,bilibili:{cid:'9876543210',page:2},url:`https://www.bilibili.com/video/${b}/?p=2&cid=9876543210`,likesScope:'whole_video'}),r=imported(c),s=r.videos[workId];
 assert.equal(source.stageSourceKey(s),`bilibili:${b}:cid:9876543210:p:2`);assert.equal(s.scoreBinding.sourceKey,source.stageSourceKey(s));assert.equal(source.stageEmbedUrl(s),null);
 for(const patch of [{bilibili:undefined},{bilibili:{cid:'9876543210',page:1}},{bilibili:{page:2}}])assert.notEqual(normalize({...c,...patch}).status,0);
 assert.equal(source.stageSourceKey({...s,sameSongFallback:undefined}),null);
});

test('reusing a bound alternate-version video requires explicit same-group source-work evidence and never copies its score',()=>{
 const otherId='recActualSource',other=base({scoreBinding:{videoId:'fallsource1',sourceKey:'fallsource1',initializedAt:now,initialScore:null}}),c=fallback();c.sameSongFallback.sourceWorkId=otherId;
 const r=imported(c,{sourceWork:{recordId:otherId,song:'Synthetic Song',stage:other}});assert.deepEqual(r.videos[otherId],other);assert.equal(r.videos[workId].scoreBinding.initialScore,null);
 for(const options of [{sourceWork:{recordId:otherId,song:'Different song',stage:other}},{sourceWork:{recordId:otherId,song:'Synthetic Song',groupIds:['recOtherGroup'],stage:other}},{}]){const bad=merge(normalized(c),options);assert.notEqual(bad.status,0);assert(bad.before.equals(bad.after));}
 const chained={...other,sameSongFallback:{...c.sameSongFallback,targetWorkId:otherId,performedSong:'Synthetic Song (English Ver.)'}};
 const bad=merge(normalized(c),{sourceWork:{recordId:otherId,song:'Synthetic Song',stage:chained}});assert.notEqual(bad.status,0);assert.match(bad.stderr,/must not itself be a same-song fallback/);assert(bad.before.equals(bad.after));
 const result=validate(r.videos[workId],undefined,{recordId:otherId,song:'Synthetic Song',stage:chained});assert.notEqual(result.status,0);assert.match(result.stderr,/must not itself be a same-song fallback/);
});

function siblingSetup(){
 const rootId='recOriginalSongSource',siblingId='recEnglishSongFixture',rootStage=imported(base()).videos[workId];
 const make=(id,song)=>{const c=fallback({completeness:'full'});Object.assign(c.sameSongFallback,{targetWorkId:id,targetSong:song,sourceWorkId:rootId});return normalized(c,undefined,id);};
 const first=make(workId,'Synthetic Song (Japanese Ver.)'),second=make(siblingId,'Synthetic Song (English Ver.)');
 const sourceWork={recordId:rootId,song:'Synthetic Song',stage:rootStage},additionalWorks=[{recordId:siblingId,song:'Synthetic Song (English Ver.)'}];
 return {rootId,siblingId,rootStage,first,second,sourceWork,additionalWorks,options:{sourceWork,additionalWorks,scores:{[rootId]:9}}};
}
function assertNoProtectedWrites(r){
 for(const [name,before] of Object.entries(r.beforeFiles))assert(before.equals(r.afterFiles[name]),`${name} changed after rejected evidence`);
 assert.equal(r.artifact,false);
}

test('different version targets share only their explicit original source root in either batch order and across sequential imports',()=>{
 const x=siblingSetup(),check=r=>{
  assert.equal(r.status,0,r.stderr);assert.deepEqual(r.videos[x.rootId],x.rootStage);
  for(const id of [workId,x.siblingId]){assert.equal(r.videos[id].sameSongFallback.sourceWorkId,x.rootId);assert.equal(r.videos[id].scoreBinding.initialScore,null);assert.equal(r.videos[id].scoreBinding.sourceKey,x.rootStage.videoId);}
  assert(r.beforeFiles['fresh.json'].equals(r.afterFiles['fresh.json']),'owner scores/export changed');
  const owner=JSON.parse(r.afterFiles['fresh.json']);assert.equal(owner.tables.works.records.find(w=>w.recordId===x.rootId).fields.fld641ausT,9);
  const validated=validate(r.videos[workId],undefined,x.sourceWork,{additionalWorks:x.additionalWorks,additionalVideos:{[x.siblingId]:r.videos[x.siblingId]}});assert.equal(validated.status,0,validated.stderr);
 };
 for(const entries of [[...x.first.items,...x.second.items],[...x.second.items,...x.first.items]])check(merge({...x.first,items:entries},x.options));
 const first=merge(x.first,x.options);assert.equal(first.status,0,first.stderr);
 const second=merge(x.second,{...x.options,additionalVideos:first.videos});check(second);assert.deepEqual(JSON.parse(second.stdout).sourceIds,[x.siblingId]);
 assert.deepEqual(second.videos[workId],first.videos[workId]);
});

test('sibling reuse refuses different roots, fallback chains, wrong target or actual songs, groups and performer scopes before any write',()=>{
 const x=siblingSetup(),first=merge(x.first,x.options);assert.equal(first.status,0,first.stderr);
 for(const change of [
  s=>s.sameSongFallback.sourceWorkId='recDifferentOriginalRoot',
  s=>s.sameSongFallback.sourceWorkId=x.siblingId,
  s=>s.sameSongFallback.targetSong='A different Japanese song',
  s=>s.sameSongFallback.performedSong='A different original song',
  s=>s.sameSongFallback.groupId='recDifferentSongGroup',
  s=>{s.sameSongFallback.performerScope='solo';s.sameSongFallback.originalPerformerScope='solo';}
 ]){
  const prior=structuredClone(first.videos);change(prior[workId]);
  const rejected=merge(x.second,{...x.options,additionalVideos:prior});assert.notEqual(rejected.status,0,rejected.stdout);assert.match(rejected.stderr,/Exact source reused/);assertNoProtectedWrites(rejected);
 }
 const chainedRoot={...x.rootStage,sameSongFallback:{...first.videos[workId].sameSongFallback,targetWorkId:x.rootId,sourceWorkId:workId}};
 const rejected=merge(x.second,{...x.options,sourceWork:{...x.sourceWork,stage:chainedRoot},additionalVideos:first.videos});assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/must not itself be a same-song fallback/);assertNoProtectedWrites(rejected);
 const valid=merge(x.second,{...x.options,additionalVideos:first.videos});assert.equal(valid.status,0,valid.stderr);
 const chainedSibling=structuredClone(valid.videos[workId]);chainedSibling.sameSongFallback.sourceWorkId=x.siblingId;
 const validated=validate(chainedSibling,undefined,x.sourceWork,{additionalWorks:x.additionalWorks,additionalVideos:{[x.siblingId]:valid.videos[x.siblingId]}});assert.notEqual(validated.status,0);assert.match(validated.stderr,/must not itself be a same-song fallback/);
});

test('anonymous projection and real notice show the actual differences without raw evidence, research reasons or editable fields',()=>{
 const s=imported().videos[workId];s.sameSongFallback.reason='PRIVATE_RESEARCH';s.sameSongFallback.evidence.note='PRIVATE_OWNER_DATA';s.sameSongFallback.evidence.token='PRIVATE_TOKEN';
 const work={id:workId,groupIds:[groupId],stage:s};const before=structuredClone(work),view=projectPublicCatalog({works:[work],members:[],ratings:[],groups:[],counts:{}}).works[0];
 assert(source.stageHasValidBinding(view.stage));assert.deepEqual(view.stage.sameSongFallback.evidence,{note:'',urls:[]});assert.doesNotMatch(JSON.stringify(view),/PRIVATE/);
 const html=renderToStaticMarkup(React.createElement(StageSameSongFallback,{stage:view.stage}));assert.match(html,/同曲后备 · 节选 · 不同版本/);assert.match(html,/韩语原版，目标为日语版/);assert.match(html,/当前评分仅对应这支视频/);assert.doesNotMatch(html,/<input|<form|PRIVATE|example.org/);
 assert.match(stageKindLabel(view.stage.kind),/同曲后备.*节选.*不同版本/);assert.deepEqual(work,before);
 assert.equal(renderToStaticMarkup(React.createElement(StageSameSongFallback,{stage:{...view.stage,sameSongFallback:{...view.stage.sameSongFallback,sameSong:false}}})), '');
});

test('the complete stage validator accepts explicit fallback evidence and rejects hidden, malformed or replacement-like fallback data',()=>{
 const stage=imported().videos[workId];assert.equal(validate(stage).status,0,validate(stage).stderr);
 for(const change of [s=>delete s.sameSongFallback,s=>s.sameSongFallback.sameSong=false,s=>s.sameSongFallback.targetWorkId='recOtherWork',s=>s.sameSongFallback.groupId='recOtherGroup',s=>s.sameSongFallback.targetSong='Another song',s=>s.verificationNote='No disclosed differences',s=>s.previousSources=[{videoId:'oldsource12'}],s=>s.scoreBinding=null,s=>s.sameSongFallback.evidence.urls=[]]){
  const result=validate(stage,change);assert.notEqual(result.status,0,result.stdout);
 }
});

test.after(()=>assert(fs.readFileSync(path.join(root,'data/stage-videos.json')).equals(originalVideos),'all real source objects and bindings remain byte-exact'));
