import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const proof={note:'Synthetic public occasion evidence; not an audio-equivalence assertion.',urls:['https://example.com/verified-program']};
const checkedAt='2026-10-11T10:00:00Z';
const selection=occasion=>({occasion,evidence:structuredClone(proof)});
function alternative(id,overrides={}){
 return {id:`youtube-${id}`,platform:'youtube',sourceId:id,sourceClass:'official',performerScope:'full_group',completeness:'full',url:`https://www.youtube.com/watch?v=${id}`,title:'Synthetic full group performance',channel:'Synthetic official publisher',performanceType:'broadcast_stage',kind:'节目表演，具体场合待核',checkedAt,scorePolicy:'view_only',sourceEvidence:proof,sameSongEvidence:proof,version:{match:'unconfirmed',differences:['实际音轨尚待核对'],evidence:proof},...overrides};
}
function practice(id='Practice001',overrides={}){return alternative(id,{title:'Synthetic Dance Practice (Fix ver.)',kind:'舞蹈练习室；不证明现场人声',performanceType:'practice_room',selection:selection('practice_room'),...overrides});}
function lead(id,overrides={}){
 return {id:`lead-${id}`,platform:'youtube',sourceId:id,sourceClass:'official',performerScope:'full_group',completeness:'unconfirmed',url:`https://www.youtube.com/watch?v=${id}`,title:'Synthetic official program',channel:'Synthetic official publisher',sourceType:'official_television_program',kind:'节目单曲线索',checkedAt,scorePolicy:'view_only',sourceEvidence:proof,sameSongEvidence:proof,reason:'具体音轨与完整首尾待核对。',...overrides};
}
const press=alternative('PressTest01',{id:'naver-61314532',platform:'naver',sourceId:'61314532',url:'https://tv.naver.com/v/61314532',sourceClass:'press_original',title:'Synthetic original reporter recording',performanceType:'press_concert_recording',kind:'原始媒体现场录像',durationSeconds:212,durationScope:'whole_video'});
const rejectedIds=['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg'];
const mixed={alternatives:[
 alternative('Unknown0001'),
 alternative('Concert0001',{performanceType:'concert_stage'}),
 practice(),
 alternative('Regular0001',{title:'Simply K-Pop CON-TOUR',selection:selection('music_program')}),
 alternative('Studio00001',{title:"it's Live Band Concert",performanceType:'studio_performance',selection:selection('studio_live')}),
 alternative('Special0001',{selection:selection('special_program')}),
 alternative('Festival001',{selection:selection('festival')}),
 alternative('FanEvent001',{selection:selection('fan_event')}),
 alternative('OtherEvent1',{selection:selection('other_event')}),
 alternative('Showcase001',{performanceType:'showcase_stage'}),
 press,
 ...rejectedIds.map(id=>alternative(id,{selection:selection('music_program')})),
 ],watchLeads:[
 lead('UnknownLd01'),
 lead('ConcertLd01',{sourceType:'official_concert_full_event'}),
 lead('ShowcaseLd1',{sourceType:'official_showcase_full_event'}),
 lead('FestivalLd1',{selection:selection('festival')}),
 lead('RegularLd01',{title:'Simply K-Pop CON-TOUR',selection:selection('music_program')}),
 lead('StudioLead1',{title:"it's Live Band Concert",selection:selection('studio_live')}),
 ...rejectedIds.map(id=>lead(id,{selection:selection('music_program')})),
 ]};
const metadata={formatVersion:'idol.stage-supplements.v1',works:{recMixed:mixed,recRejected:{alternatives:rejectedIds.map(id=>practice(id))},recConcert:{alternatives:[alternative('OnlyEvent01',{selection:selection('concert')})]}}};
const beforeMetadata=JSON.stringify(metadata);
async function moduleFrom(entry,fixture){
 const bundle=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',alias:{'@':'./'},plugins:fixture?[{name:'synthetic-stage-metadata',setup(b){b.onResolve({filter:/stages\/supplements\.json$/},()=>({path:'synthetic-stage-metadata',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:JSON.stringify(fixture),loader:'json'}));}}]:[]});
 return import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
}
const supplements=await moduleFrom('lib/idol/supplements.ts',metadata);
const {validStageAlternative,validStageWatchLead,stageSupplementForWork}=supplements;
const {stageSourceKey,stageHasValidBinding}=await moduleFrom('lib/idol/stage-source.ts');
const {projectPublicCatalog}=await moduleFrom('lib/idol/public-catalog.ts');
const {stageKindLabel,stageStatusLabel,stageMatches}=await moduleFrom('lib/idol/stage-display.ts');
const current=await moduleFrom('lib/idol/supplements.ts');

test('complete official practice needs explicit occasion evidence and remains a viewing alternative',()=>{
 const p=practice();assert.equal(validStageAlternative(p),true);assert.equal(stageSourceKey({...p,videoId:p.sourceId}),null);assert.equal(stageHasValidBinding({...p,videoId:p.sourceId}),false);
 for(const change of [
  {sourceClass:'audience_original'}, {sourceClass:'press_original'}, {completeness:'excerpt'}, {selection:undefined},
  {selection:selection('music_program')}, {selection:{occasion:'practice_room'}},
  {selection:{occasion:'practice_room',evidence:{note:'',urls:proof.urls}}},
  {selection:{occasion:'practice_room',evidence:{note:'unsafe',urls:['http://127.0.0.1/private']}}},
  {performanceType:'produced_dance_performance'}, {scorePolicy:'score'}, {scoreBinding:{}},
 ])assert.equal(validStageAlternative({...p,...change}),false,JSON.stringify(change));
 for(const title of ['Synthetic Practice Video','Synthetic Choreography Practice','Synthetic 练习室'])assert.equal(validStageAlternative(alternative('Unknown0001',{title})),false,title);
 assert.equal(validStageWatchLead(lead('PracticeLd1',{title:'Dance Practice',selection:selection('practice_room')})),false,'no incomplete practice lead is introduced');
});

test('historical event metadata stays valid while the current queue filters events without mutating evidence',()=>{
 const historical=mixed.alternatives.filter(a=>['concert_stage','showcase_stage','press_concert_recording'].includes(a.performanceType));
 assert.equal(historical.length,3);for(const a of historical)assert.equal(validStageAlternative(a),true,a.id);
 for(const a of mixed.watchLeads.filter(a=>['official_concert_full_event','official_showcase_full_event'].includes(a.sourceType)))assert.equal(validStageWatchLead(a),true,a.id);
 assert.equal(stageSupplementForWork('recConcert'),null);
 const row=stageSupplementForWork('recMixed');
 assert.deepEqual(row.alternatives.map(a=>a.sourceId),['Regular0001','Practice001','Unknown0001','Studio00001','Special0001']);
 assert.deepEqual(row.watchLeads.map(a=>a.sourceId),['RegularLd01','UnknownLd01','StudioLead1']);
 assert.equal(JSON.stringify(metadata),beforeMetadata);
 assert.equal(JSON.stringify(supplements.stageSupplementMetadata),beforeMetadata,'source metadata is not rewritten by sorting/filtering');
});

test('occasion evidence controls priority; Concert and CON-TOUR titles do not imply an excluded event',()=>{
 const row=stageSupplementForWork('recMixed');
 assert.equal(row.alternatives[0].title,'Simply K-Pop CON-TOUR');
 assert.ok(row.alternatives.some(a=>a.title==="it's Live Band Concert"));
 assert.ok(row.watchLeads.some(a=>a.title==="it's Live Band Concert"));
 const oldBroadcast=row.alternatives.find(a=>a.sourceId==='Unknown0001');assert.equal(oldBroadcast.selection,undefined,'legacy broadcast metadata is not silently promoted to confirmed music-program selection');
 for(const bad of [null,[],{occasion:'made_up',evidence:proof},{occasion:'music_program',evidence:{note:'no URLs',urls:[]}}]){
  assert.equal(validStageAlternative(alternative('Regular0001',{selection:bad})),false);
  assert.equal(validStageWatchLead(lead('RegularLd01',{selection:bad})),false);
 }
});

test('explicit concert or showcase type cannot be relabeled as practice or a music program',()=>{
 for(const performanceType of ['concert_stage','showcase_stage','press_concert_recording'])for(const occasion of ['practice_room','music_program'])assert.equal(validStageAlternative(alternative('Conflict001',{performanceType,selection:selection(occasion)})),false);
 for(const sourceType of ['official_concert_full_event','official_showcase_full_event'])assert.equal(validStageWatchLead(lead('ConflictLd1',{sourceType,selection:selection('music_program')})),false);
 assert.equal(validStageWatchLead(lead('ConflictLd1',{selection:selection('practice_room')})),false);
});

test('all three exact user-rejected videos stay excluded even when recategorized as official practice or music programs',()=>{
 assert.equal(stageSupplementForWork('recRejected'),null);
 for(const id of rejectedIds){
  assert.equal(validStageAlternative(practice(id)),true,'historical structure is separate from the exact rejection');
  assert.ok(!stageSupplementForWork('recMixed').alternatives.some(a=>a.sourceId===id));
  assert.ok(!stageSupplementForWork('recMixed').watchLeads.some(a=>a.sourceId===id));
 }
});

test('original press attribution is distinct from artist official and cannot acquire a score-bearing source',()=>{
 assert.equal(validStageAlternative(press),true);
 assert.equal(validStageAlternative({...press,sourceClass:'official'}),false);
 assert.equal(validStageAlternative({...press,sourceClass:'audience_original'}),false);
 assert.equal(validStageAlternative({...press,performanceType:'broadcast_stage'}),false);
 assert.equal(validStageAlternative({...press,completeness:'excerpt'}),false);
 assert.equal(stageSourceKey({...press,videoId:press.sourceId}),null);
 assert.equal(stageHasValidBinding({...press,videoId:press.sourceId,scoreBinding:{videoId:press.sourceId,initializedAt:checkedAt,initialScore:null}}),false);
});

test('public selection exposes only occasion, while original source binding and synthetic personal fields are preserved',()=>{
 const stage={videoId:'BoundStage1',url:'https://www.youtube.com/watch?v=BoundStage1',title:'Existing exact formal source',kind:'演唱会现场',sourceClass:'official',platform:'youtube',completeness:'full',selection:selection('unconfirmed'),scoreBinding:{videoId:'BoundStage1',sourceKey:'BoundStage1',initializedAt:checkedAt,initialScore:null}};
 const row=stageSupplementForWork('recMixed');
 const work={id:'recSynthetic',name:'Synthetic work',song:'Synthetic song',groupIds:['groupSynthetic'],ratingIds:['ratingSynthetic'],score:7.25,stageScore:8.5,note:'Synthetic private note, never production',watched:'已观看',stage,stageSupplement:row};
 const catalog={mode:'snapshot',groups:[],members:[],ratings:[],works:[work],counts:{groups:0,members:0,works:1,ratings:0,ratedWorks:1,scoreSum:7.25}};
 const original=JSON.stringify(catalog);const view=projectPublicCatalog(catalog);const actual=view.works[0];
 assert.deepEqual(actual.stageSupplement.alternatives[0].selection,{occasion:'music_program'});
 assert.deepEqual(actual.stageSupplement.watchLeads[0].selection,{occasion:'music_program'});
 assert.deepEqual(actual.stage.selection,{occasion:'unconfirmed'});
 assert.equal(JSON.stringify(view).includes(proof.note),false);
 assert.equal(JSON.stringify(view).includes(proof.urls[0]),false);
 for(const field of ['id','song','groupIds','ratingIds','score','stageScore','note','watched'])assert.deepEqual(actual[field],work[field],field);
 assert.deepEqual(actual.stage.scoreBinding,stage.scoreBinding);assert.equal(actual.stage.videoId,stage.videoId);assert.equal(actual.stage.url,stage.url);
 assert.equal(stageSourceKey(actual.stage),'BoundStage1');assert.equal(stageHasValidBinding(actual.stage),true);
 assert.equal(stageStatusLabel(actual),'有舞台');assert.equal(stageMatches(actual,'ready'),true,'old selected sources are not silently unbound by candidate policy');
 assert.equal(JSON.stringify(catalog),original);
});

test('current public practice and press corrections validate without promoting a research candidate to a formal binding',()=>{
 const original=JSON.stringify(current.stageSupplementMetadata);
 const all=current.stageSupplementMetadata.works;
 const rightNow=all.recvxyOz5XHEju.alternatives.find(a=>a.sourceId==='y4Tr8LE5yV4');
 assert.ok(rightNow);assert.equal(current.validStageAlternative(rightNow),true);
 assert.equal(rightNow.performanceType,'practice_room');assert.equal(rightNow.selection.occasion,'practice_room');
 assert.equal(rightNow.completeness,'full');assert.equal(rightNow.version.match,'unconfirmed');
 assert.equal(rightNow.scorePolicy,'view_only');assert.equal('scoreBinding' in rightNow,false);
 assert.ok(current.stageSupplementForWork('recvxyOz5XHEju').alternatives.some(a=>a.sourceId===rightNow.sourceId));
 const correctedPress=all.recvxyHuKMh5bM.alternatives.find(a=>a.sourceId==='61314532');
 assert.equal(correctedPress.sourceClass,'press_original');assert.equal(current.validStageAlternative(correctedPress),true);
 assert.ok(!current.stageSupplementForWork('recvxyHuKMh5bM')?.alternatives.some(a=>a.sourceId==='61314532'));
 for(const [id,stored]of Object.entries(all)){
  for(const a of stored.alternatives)assert.equal(current.validStageAlternative(a),true,`${id}/${a.id}`);
  for(const a of stored.watchLeads??[])assert.equal(current.validStageWatchLead(a),true,`${id}/${a.id}`);
  const visible=current.stageSupplementForWork(id);
  for(const a of [...visible?.alternatives??[],...visible?.watchLeads??[]]){
   assert.ok(!rejectedIds.includes(a.sourceId));
   assert.ok(!['concert','festival','fan_event','other_event','showcase'].includes(a.selection?.occasion));
   assert.equal(a.scorePolicy,'view_only');assert.equal('scoreBinding' in a,false);
  }
 }
 assert.equal(JSON.stringify(current.stageSupplementMetadata),original);
});

test('practice labels identify actual practice kind without claiming live vocals',()=>{
 assert.equal(stageKindLabel('官方 Dance Practice'),'舞蹈练习室');
 assert.equal(stageKindLabel('Vocal practice'),'合奏／演唱练习');
 assert.equal(stageKindLabel('合奏练习室'),'合奏／演唱练习');
 assert.equal(stageKindLabel('官方练习室'),'练习室','an unspecified practice kind is not assumed to be dance or live vocals');
 assert.doesNotMatch(stageKindLabel('官方舞蹈练习室'),/现场|演唱/);
});
