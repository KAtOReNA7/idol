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
function merge(batch,{previous,score=null,native=false,formatOverride,omitSchema=false}={}){return temporary(tmp=>{
 fs.mkdirSync(path.join(tmp,'scripts'),{recursive:true});fs.mkdirSync(path.join(tmp,'data/stages'),{recursive:true});
 for(const f of ['merge-stage-batch.py','stage_selection_policy.py'])fs.copyFileSync(path.join(root,'scripts',f),path.join(tmp,'scripts',f));
 const write=(f,obj)=>fs.writeFileSync(path.join(tmp,f),JSON.stringify(obj));
 write('data/stages/inventory.json',{works:[{recordId:workId,groupIds:['fixture-group'],mv:{videoId:'originalMV1',officialTitle:'Original Official MV'}}]});
 write('data/stages/status.json',{inventoryCount:1,works:{[workId]:{status:previous?'verified':'pending',reason:'Fixture',checkedAt:now}}});
 write('data/stage-videos.json',previous?{[workId]:previous}:{});
 const before=fs.readFileSync(path.join(tmp,'data/stage-videos.json'),'utf8');
 write('batch.json',batch);write('fresh.json',{source:native?'native':'feishu',formatVersion:formatOverride??(native?'idol.native-data-export.v1':'idol.live-backup.v1'),capturedAt:now,tables:{works:{fields:omitSchema?[]:[{field_id:'fld641ausT'}],records:[{recordId:workId,fields:{fld641ausT:score}}]}},...(native?{journal:[],siteMetadata:{stageVideos:previous?{[workId]:previous}:{}}}:{})});
 const r=spawnSync('python',[path.join(tmp,'scripts/merge-stage-batch.py'),path.join(tmp,'batch.json'),path.join(tmp,'fresh.json')],{cwd:tmp,env,encoding:'utf8'});
 const after=fs.readFileSync(path.join(tmp,'data/stage-videos.json'),'utf8');const archived=path.join(tmp,'data/stages/evidence/batch.json');
 return {...r,before,after,videos:JSON.parse(after),artifact:fs.existsSync(archived)?JSON.parse(fs.readFileSync(archived)):null};
});}
test('new formal imports require documented music-program or official complete practice context',()=>{
 assert.equal(check({}).status,0);
 assert.equal(check({type:'broadcast_stage',selection:{occasion:'music_program',evidence}}).status,0);
 for(const occasion of ['concert','festival','showcase','fan_event','studio_live','produced_performance','special_program','unconfirmed'])assert.notEqual(check({selection:{occasion,evidence}}).status,0,occasion);
 for(const override of [{selection:null},{sourceClass:'press_original'},{sourceClass:'audience_original'},{completeness:'excerpt'},{selection:{occasion:'practice_room',evidence:{note:'',urls:[]}}}])assert.notEqual(check(override).status,0);
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
