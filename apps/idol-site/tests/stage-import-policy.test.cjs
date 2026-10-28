const test=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONIOENCODING:'utf-8'};
const workId='recPolicyFixture',now=new Date().toISOString();
const evidence={note:'Explicit program or artist practice source',urls:['https://example.org/performance']};
function candidate(videoId='abcdefghijk',occasion='practice_room',value=10,override={}){
 return {videoId,sourceClass:'official',platform:'youtube',completeness:'full',type:occasion==='practice_room'?'practice_room':'broadcast_stage',
  selection:{occasion,evidence},eligibility:'eligible',versionMatch:true,scorePolicy:'score',
  title:`Fixture performance ${videoId}`,channel:'Fixture official channel',url:`https://www.youtube.com/watch?v=${videoId}`,
  sourceUrl:'https://example.org/performance',checkedAt:now,publishedAt:'2026-01-01',
  languageVersionEvidence:{basis:'Exact synthetic version'},likes:{value,display:String(value),precision:'exact'},...override};
}
function reviewed(selected,candidates=[selected]){
 return {checkedAt:now,items:[{recordId:workId,status:'verified',selected,candidates,reason:'Synthetic reviewed evidence',checkedAt:now}]};
}
function temporary(fn){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'idol-stage-policy-'));try{return fn(tmp);}finally{fs.rmSync(tmp,{recursive:true,force:true});}}
function check(override){return spawnSync('python',['-c','import sys,json;sys.path.insert(0,"scripts");from stage_selection_policy import checked_selection;checked_selection(json.load(sys.stdin))'],{cwd:root,env,input:JSON.stringify(candidate('abcdefghijk','practice_room',10,override)),encoding:'utf8'});}
function normalize(batch){return temporary(tmp=>{const input=path.join(tmp,'reviewed.json');fs.writeFileSync(input,JSON.stringify(batch));return spawnSync('python',[path.join(root,'scripts/normalize-stage-patch.py'),input],{cwd:root,env,encoding:'utf8'});});}
function normalized(batch){const r=normalize(batch);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function merge(batch,{previous,score=null,native=false,formatOverride,omitSchema=false,journalRows=[],publishedOverride,capturedAt=now,externalJournal=false}={}){return temporary(tmp=>{
 fs.mkdirSync(path.join(tmp,'scripts'),{recursive:true});fs.mkdirSync(path.join(tmp,'data/stages'),{recursive:true});
 for(const f of ['merge-stage-batch.py','stage_selection_policy.py'])fs.copyFileSync(path.join(root,'scripts',f),path.join(tmp,'scripts',f));
 const write=(f,obj)=>fs.writeFileSync(path.join(tmp,f),JSON.stringify(obj));
 write('data/stages/inventory.json',{works:[{recordId:workId,groupIds:['fixture-group'],mv:{videoId:'originalMV1',officialTitle:'Original Official MV'}}]});
 write('data/stages/status.json',{inventoryCount:1,works:{[workId]:{status:previous?'verified':'pending',reason:'Fixture',checkedAt:now}}});
 write('data/stage-videos.json',previous?{[workId]:previous}:{});
 const before=fs.readFileSync(path.join(tmp,'data/stage-videos.json'),'utf8');
 write('batch.json',batch);write('fresh.json',{source:native?'native':'feishu',formatVersion:formatOverride??(native?'idol.native-data-export.v1':'idol.live-backup.v1'),capturedAt,tables:{works:{fields:omitSchema?[]:[{field_id:'fld641ausT'}],records:[{recordId:workId,fields:{fld641ausT:score}}]}},siteMetadata:{stageVideos:publishedOverride??(previous?{[workId]:previous}:{})},...(native?{journal:journalRows}:{})});
 if(externalJournal)write('journal.json',{complete:true,capturedAt,records:[]});
 const r=spawnSync('python',[path.join(tmp,'scripts/merge-stage-batch.py'),path.join(tmp,'batch.json'),path.join(tmp,'fresh.json'),...(externalJournal?[path.join(tmp,'journal.json')]:[])],{cwd:tmp,env,encoding:'utf8'});
 const after=fs.readFileSync(path.join(tmp,'data/stage-videos.json'),'utf8');const archived=path.join(tmp,'data/stages/evidence/batch.json');
 return {...r,before,after,videos:JSON.parse(after),artifact:fs.existsSync(archived)?JSON.parse(fs.readFileSync(archived)):null};
});}
test('new formal imports require documented program, official complete practice or produced-performance context',()=>{
 assert.equal(check({}).status,0);
 assert.equal(check({type:'broadcast_stage',selection:{occasion:'music_program',evidence}}).status,0);
 assert.equal(check({type:'produced_dance_performance',selection:{occasion:'produced_performance',evidence}}).status,0);
 for(const occasion of ['concert','festival','showcase','fan_event','studio_live','special_program','unconfirmed'])assert.notEqual(check({selection:{occasion,evidence}}).status,0,occasion);
 for(const override of [{selection:null},{sourceClass:'press_original'},{sourceClass:'audience_original'},{completeness:'excerpt'},{selection:{occasion:'practice_room',evidence:{note:'',urls:[]}}}])assert.notEqual(check(override).status,0);
});

test('official produced performance is a fallback below programs and practice, never an event exemption',()=>{
 const produced=candidate('produced001','produced_performance',1000,{type:'produced_dance_performance'});
 const practice=candidate('practice123','practice_room',5);
 const program=candidate('program1234','music_program',1);
 const standalone=merge(normalized(reviewed(produced)),{native:true});assert.equal(standalone.status,0,standalone.stderr);
 assert.equal(standalone.videos[workId].selection.occasion,'produced_performance');
 for(const better of [practice,program])assert.notEqual(normalize(reviewed(produced,[produced,better])).status,0);
 assert.equal(normalize(reviewed(practice,[produced,practice])).status,0);
 assert.equal(normalize(reviewed(program,[produced,practice,program])).status,0);
 for(const override of [{type:'concert_stage'},{sourceClass:'audience_original'},{completeness:'excerpt'},{versionMatch:false}])assert.notEqual(normalize(reviewed({...produced,...override})).status,0);
});

test('documented fixed practice wins before likes while unauthenticated camera claims cannot change priority',()=>{
 const fixed=candidate('fixedcam001','practice_room',1,{selection:{occasion:'practice_room',evidence,camera:{mode:'fixed',evidence}}});
 const moving=candidate('movingcam01','practice_room',1000,{selection:{occasion:'practice_room',evidence,camera:{mode:'moving',evidence}}});
 const plain=candidate('plaincam001','practice_room',2000);
 assert.equal(normalize(reviewed(fixed,[fixed,moving,plain])).status,0);
 for(const weaker of [moving,plain])assert.notEqual(normalize(reviewed(weaker,[fixed,moving,plain])).status,0);
 const program=candidate('program1234','music_program',0);
 assert.notEqual(normalize(reviewed(fixed,[fixed,program])).status,0);
 for(const camera of [{mode:'fixed'}, {mode:'automatic',evidence}, {mode:'fixed',evidence:{note:'No source',urls:[]}}])assert.notEqual(check({selection:{occasion:'practice_room',evidence,camera}}).status,0);
 const mismatched=normalize(reviewed(fixed,[{...fixed,selection:{occasion:'practice_room',evidence}}]));assert.notEqual(mismatched.status,0);
 const tampered=normalized(reviewed(fixed));tampered.items[0].selected.selection.camera.mode='moving';
 const refused=merge(tampered,{native:true});assert.notEqual(refused.status,0);assert.equal(refused.before,refused.after);
 const before=previousSource('practice_room');
 const replacement=merge(normalized(reviewed(fixed)),{previous:before,native:true});assert.equal(replacement.status,0,replacement.stderr);
 assert.equal(replacement.videos[workId].previousSources.at(-1).preference,'higher_policy_priority');
 for(const score of [0,5]){const held=merge(normalized(reviewed(fixed)),{previous:before,native:true,score});assert.equal(held.status,0,held.stderr);assert.equal(held.videos[workId].videoId,before.videoId);}
});
test('all three exact user rejections fail even when normalized as practice',()=>{
 for(const videoId of ['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg']){
  assert.notEqual(check({videoId}).status,0);
  const r=normalize(reviewed(candidate(videoId)));assert.notEqual(r.status,0);assert.match(r.stderr,/User-rejected exact source/);
 }
});
test('structured occasion conflicts fail while program title words are not classifications',()=>{
 for(const field of ['type','kind','performanceType'])for(const value of ['concert_stage','festival_stage','showcase_stage']){
  const r=normalize(reviewed(candidate('abcdefghijk','practice_room',10,{[field]:value})));
  assert.notEqual(r.status,0);assert.match(r.stderr,/Structured performance type conflicts/);
 }
 for(const title of ["it's Live Band Concert",'Simply K-Pop CON-TOUR'])assert.equal(normalize(reviewed(candidate('abcdefghijk','music_program',10,{title}))).status,0,title);
});
test('real normalization and merge exclude event likes and preserve the complete research evidence',()=>{
 const selected=candidate(),event=candidate('concert1234','concert',1000,{type:'concert_stage'}),rejected=candidate('l9GLV8Kd-MU','practice_room',2000),wrongVersion=candidate('wrongver123','music_program',3000,{versionMatch:false});
 const input=reviewed(selected,[selected,event,rejected,wrongVersion]);input.items[0].comparisonLimited=false;
 const batch=normalized(input);
 assert.equal(batch.items[0].selectedVideoId,selected.videoId);assert.equal(batch.items[0].comparisonLimited,true);
 assert.deepEqual(batch.items[0].candidates,[selected,event,rejected,wrongVersion]);
 const r=merge(batch);assert.equal(r.status,0,r.stderr);
 const source=r.videos[workId];assert.equal(source.videoId,selected.videoId);assert.equal(source.candidateCount,1);
 assert.equal(source.scoreBinding.sourceKey,selected.videoId);assert.equal(source.scoreBinding.initialScore,null);
 assert.deepEqual(r.artifact.items[0].candidates,batch.items[0].candidates);
});
test('program priority wins before likes, and likes compare only within that priority',()=>{
 const program=candidate('program1234','music_program',10),practice=candidate('practice123','practice_room',1000),programLower=candidate('program5678','music_program',5);
 const batch=normalized(reviewed(program,[program,practice,programLower]));
 const r=merge(batch);assert.equal(r.status,0,r.stderr);assert.equal(r.videos[workId].candidateCount,2);
 assert.deepEqual(r.videos[workId].candidates.map(c=>c.url),[program.url,programLower.url]);
 const worsePriority=normalize(reviewed(practice,[program,practice]));assert.notEqual(worsePriority.status,0);assert.match(worsePriority.stderr,/highest-priority/);
 const lowerLikes=normalize(reviewed(programLower,[program,programLower]));assert.notEqual(lowerLikes.status,0);assert.match(lowerLikes.stderr,/not maximum/);
});
test('merger repeats policy and priority checks even when normalization is bypassed',()=>{
 const practice=candidate(),program=candidate('program1234','music_program',1);
 const priorityBypass=normalized(reviewed(practice));priorityBypass.items[0].candidates.push(program);
 const conflict=structuredClone(priorityBypass);conflict.items[0].selected.type='concert_stage';
 const missing=structuredClone(priorityBypass);delete missing.items[0].selected.selection;
 for(const batch of [priorityBypass,conflict,missing]){const r=merge(batch);assert.notEqual(r.status,0);assert.equal(r.after,r.before);assert.equal(r.artifact,null);}
});
test('new selected source and its comparison evidence must agree',()=>{
 const selected=candidate();
 const wrongOccasion=normalize(reviewed(selected,[candidate(selected.videoId,'music_program',10)]));assert.notEqual(wrongOccasion.status,0);assert.match(wrongOccasion.stderr,/highest-priority/);
 const wrongLikes=normalize(reviewed(selected,[candidate(selected.videoId,'practice_room',20)]));assert.notEqual(wrongLikes.status,0);assert.match(wrongLikes.stderr,/likes differ/);
 const missing=normalize(reviewed({...selected,selection:undefined}));assert.notEqual(missing.status,0);assert.match(missing.stderr,/documented music-program/);
});
test('policy-qualified replacement never moves an existing owner score to another video',()=>{
 const selected=candidate('program1234','music_program',200);
 const previous={videoId:'oldsource12',url:'https://www.youtube.com/watch?v=oldsource12',title:'Frozen historical concert',kind:'concert_stage',likes:{value:10,display:'10',precision:'exact'},scoreBinding:{videoId:'oldsource12',sourceKey:'oldsource12',initializedAt:'2026-01-01T00:00:00Z',initialScore:null}};
 const r=merge(normalized(reviewed(selected)),{previous,score:5});assert.equal(r.status,0,r.stderr);
 assert.equal(r.videos[workId].videoId,previous.videoId);assert.deepEqual(r.videos[workId].scoreBinding,previous.scoreBinding);
 assert.equal(JSON.parse(r.stdout).retainedExistingSources.length,1);
 const unbound=merge(normalized(reviewed(selected)),{score:5});assert.equal(unbound.status,0,unbound.stderr);assert.equal(unbound.videos[workId].scoreBinding,null);
});

test('native owner exports preserve source provenance, zero scores and documentary limits',()=>{
 const note='依据官方单曲资料采用；未完整播放或逐句比对音轨，不据此判断真唱。';
 const batch=normalized(reviewed(candidate('abcdefghijk','practice_room',10,{verificationNote:note})));
 const empty=merge(batch,{native:true});assert.equal(empty.status,0,empty.stderr);
 assert.equal(empty.videos[workId].scoreBinding.sourceKey,'abcdefghijk');
 assert.equal(empty.videos[workId].verificationNote,note);
 const zero=merge(batch,{native:true,score:0});assert.equal(zero.status,0,zero.stderr);assert.equal(zero.videos[workId].scoreBinding,null);
 for(const options of [{native:true,formatOverride:'idol.live-backup.v1'},{native:true,omitSchema:true}]){
  const result=merge(batch,options);assert.notEqual(result.status,0);assert.equal(result.after,result.before);assert.equal(result.artifact,null);
 }
});

const crypto=require('node:crypto');
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function previousSource(occasion='concert'){
 const source=candidate('oldsource12',occasion,1000,{type:occasion==='concert'?'concert_stage':occasion==='practice_room'?'practice_room':'broadcast_stage'});
 source.scoreBinding={videoId:source.videoId,sourceKey:source.videoId,initializedAt:'2026-01-01T00:00:00Z',initialScore:null};
 return source;
}
function replacementBatch(previous,selected,occasion='concert'){
 const batch=normalized(reviewed(selected));batch.items[0].previousOccasionReview={previousVideoId:previous.videoId,previousSha256:crypto.createHash('sha256').update(JSON.stringify(canonical(previous))).digest('hex'),occasion,evidence:{note:'Exact prior uploader describes an excluded concert; preserve its original source and score history.',urls:[previous.url]}};return batch;
}

function memberCandidate(override={}){
 return candidate('memberver01','practice_room',100,{
  versionMatch:false,label:'官方舞蹈练习室 · 成员版',verificationNote:'成员版；客串范围不同，未逐句核对音轨。',
  memberVersionFallback:{sameSong:true,sameLanguage:true,fullGroup:true,sameArrangementExceptGuest:true,differenceType:'guest_scope',groupId:'fixture-group',guestDifference:'客串声部由本团成员承担',evidence},...override,
 });
}

test('documented member fallback preserves the version difference and requires empty owner score and no save history',()=>{
 const selected=memberCandidate(),batch=normalized(reviewed(selected));
 assert.equal(batch.items[0].selected.versionMatch,false);assert.equal(batch.items[0].candidates[0].versionMatch,false);
 const r=merge(batch,{native:true});assert.equal(r.status,0,r.stderr);
 assert.deepEqual(r.videos[workId].memberVersionFallback,selected.memberVersionFallback);
 assert.match(r.videos[workId].kind,/成员版/);assert.match(r.videos[workId].verificationNote,/客串/);
 assert.equal(r.videos[workId].scoreBinding.sourceKey,selected.videoId);
 for(const options of [{native:true,score:0},{native:true,score:5},{native:true,journalRows:[{record_id:workId,table_key:'works',status:'done'}]},{native:true,journalRows:[{record_id:workId,table_key:'works',status:'pending'}]},{}]){
  const held=merge(batch,options);assert.equal(held.status,0,held.stderr);assert.deepEqual(JSON.parse(held.after),JSON.parse(held.before));
  assert.equal(JSON.parse(held.stdout).retainedExistingSources.length,1);
 }
});

test('member fallback refuses unsupported language, arrangement, participation, guest difference and fabricated exactness',()=>{
 const good=memberCandidate();
 for(const changes of [{sameSong:false},{sameLanguage:false},{fullGroup:false},{sameArrangementExceptGuest:false},{differenceType:'remix'},{groupId:''},{guestDifference:''},{evidence:undefined},{evidence:{note:'',urls:[]}},{evidence:{note:'bad',urls:[42]}}]){
  const c={...good,memberVersionFallback:{...good.memberVersionFallback,...changes}};
  assert.notEqual(normalize(reviewed(c)).status,0,JSON.stringify(changes));
 }
 for(const versionMatch of [true,'exact'])assert.notEqual(normalize(reviewed({...good,versionMatch})).status,0);
 for(const change of [{memberVersionFallback:{...good.memberVersionFallback,groupId:'another-group'}},{label:'官方练习室'},{verificationNote:'未说明版本差异'}]){
  const r=merge(normalized(reviewed({...good,...change})),{native:true});assert.notEqual(r.status,0);assert.equal(r.before,r.after);assert.equal(r.artifact,null);
 }
 const tampered=normalized(reviewed(good));tampered.items[0].selected.memberVersionFallback.guestDifference='Another scope';
 const result=merge(tampered,{native:true});assert.notEqual(result.status,0);assert.equal(result.before,result.after);
});

test('corresponding original version wins before member-fallback program priority or likes',()=>{
 const original=candidate('produced001','produced_performance',1,{type:'produced_dance_performance'}),member=memberCandidate({type:'broadcast_stage',selection:{occasion:'music_program',evidence}});
 assert.equal(normalize(reviewed(original,[original,member])).status,0);
 assert.notEqual(normalize(reviewed(member,[original,member])).status,0);
 const previous=previousSource('practice_room');
 const held=merge(normalized(reviewed(member)),{native:true,previous});assert.equal(held.status,0,held.stderr);assert.equal(held.videos[workId].videoId,previous.videoId);
});

test('missing exact likes at a higher eligible priority holds instead of silently selecting a lower tier',()=>{
 const practice=candidate('practice123','practice_room',1000),program=candidate('program1234','music_program',1,{likes:{value:null,display:'1万',precision:'rounded'}});
 assert.notEqual(normalize(reviewed(practice,[program,practice])).status,0);
 const fixed=candidate('fixedcam001','practice_room',1,{selection:{occasion:'practice_room',evidence,camera:{mode:'fixed',evidence}},likes:{value:null,display:'未知',precision:'unknown'}});
 assert.notEqual(normalize(reviewed(practice,[fixed,practice])).status,0);
 const batch=normalized(reviewed(practice));batch.items[0].candidates.push(program);
 const refused=merge(batch,{native:true});assert.notEqual(refused.status,0);assert.equal(refused.before,refused.after);
 for(const field of ['performerScope','originalPerformerScope'])for(const scope of ['solo','subunit','unconfirmed']){
  assert.notEqual(normalize(reviewed(memberCandidate({[field]:scope}))).status,0);
 }
});
test('unscored native event replacement uses policy before likes and archives the complete old source',()=>{
 const previous=previousSource(),selected=candidate('program1234','music_program',5),batch=replacementBatch(previous,selected);
 const r=merge(batch,{previous,native:true});assert.equal(r.status,0,r.stderr);
 const next=r.videos[workId];assert.equal(next.videoId,selected.videoId);assert.equal(next.scoreBinding.sourceKey,selected.videoId);
 const history={...next.previousSources.at(-1)};assert.equal(history.preference,'excluded_historical_occasion');
 for(const k of ['changedAt','reason','preference','previousOccasionReview'])delete history[k];assert.deepEqual(history,previous);
});
test('replacement requires current owner-empty score, no save row and matching published source',()=>{
 const previous=previousSource(),batch=replacementBatch(previous,candidate('program1234','music_program',5));
 for(const options of [{score:0},{score:5},{journalRows:[{record_id:workId,table_key:'works',status:'done'}]},{journalRows:[{record_id:workId,table_key:'works',status:'pending'}]}]){
  const r=merge(batch,{previous,native:true,...options});assert.equal(r.status,0,r.stderr);assert.equal(r.videos[workId].videoId,previous.videoId);assert.deepEqual(r.videos[workId].scoreBinding,previous.scoreBinding);
 }
 for(const options of [{publishedOverride:{}},{publishedOverride:{[workId]:{...previous,title:'Another live preimage'}}},{journalRows:[{recordId:workId}]},{capturedAt:new Date(Date.now()-360000).toISOString()}]){
  const r=merge(batch,{previous,native:true,...options});assert.notEqual(r.status,0);assert.equal(r.after,r.before);assert.equal(r.artifact,null);
 }
 const freshAddition=merge(normalized(reviewed(candidate())),{native:true,capturedAt:new Date(Date.now()-360000).toISOString()});assert.equal(freshAddition.status,0,freshAddition.stderr);
});
test('an unknown legacy type cannot be treated as an excluded event without exact source evidence',()=>{
 const previous=previousSource(),selected=candidate('program1234','music_program',5000);
 const noReview=merge(normalized(reviewed(selected)),{previous,native:true});assert.equal(noReview.status,0,noReview.stderr);assert.equal(noReview.videos[workId].videoId,previous.videoId);
 for(const override of [{previousVideoId:'notcurrent1'},{previousSha256:'0'.repeat(64)},{occasion:'unconfirmed'},{evidence:{note:'No exact old URL',urls:[selected.url]}}]){
  const batch=replacementBatch(previous,selected);Object.assign(batch.items[0].previousOccasionReview,override);const r=merge(batch,{previous,native:true});assert.notEqual(r.status,0);assert.equal(r.after,r.before);
 }
});

test('legacy Feishu replacements also require an exact published source preimage',()=>{
 const previous=previousSource(),batch=replacementBatch(previous,candidate('program1234','music_program',5));
 for(const publishedOverride of [{},{[workId]:{...previous,videoId:'livesource1',url:'https://www.youtube.com/watch?v=livesource1'}}]){
  const r=merge(batch,{previous,externalJournal:true,publishedOverride});assert.notEqual(r.status,0);assert.match(r.stderr,/Published source preimage differs/);assert.equal(r.after,r.before);assert.equal(r.artifact,null);
 }
 const match=merge(batch,{previous,externalJournal:true});assert.equal(match.status,0,match.stderr);assert.equal(match.videos[workId].videoId,'program1234');
});
test('eligible old sources respect priority and same-tier likes while clip scope never silently changes',()=>{
 const practice=previousSource('practice_room'),program=previousSource('music_program');
 const improved=merge(normalized(reviewed(candidate('program1234','music_program',5))),{previous:practice,native:true});assert.equal(improved.status,0,improved.stderr);assert.equal(improved.videos[workId].previousSources.at(-1).preference,'higher_policy_priority');
 for(const [previous,selected] of [[program,candidate('practice123','practice_room',5000)],[program,candidate('program1234','music_program',1000)],[program,candidate('program1234','music_program',999)]]){
  const r=merge(normalized(reviewed(selected)),{previous,native:true});assert.equal(r.status,0,r.stderr);assert.equal(r.videos[workId].videoId,previous.videoId);
 }
 const higher=merge(normalized(reviewed(candidate('program1234','music_program',1001))),{previous:program,native:true});assert.equal(higher.status,0,higher.stderr);assert.equal(higher.videos[workId].previousSources.at(-1).preference,'higher_comparable_likes');
 const clipped={...previousSource(),clip:{startSeconds:10,endSeconds:100}};const held=merge(replacementBatch(clipped,candidate('program1234','music_program',5000)),{previous:clipped,native:true});assert.equal(held.status,0,held.stderr);assert.deepEqual(held.videos[workId],clipped);
});
