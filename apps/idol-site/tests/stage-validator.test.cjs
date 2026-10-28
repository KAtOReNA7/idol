const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),validator=path.join(root,'scripts/validate-stages.mjs');
function run(edit){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'idol-stage-validate-'));try{fs.mkdirSync(path.join(tmp,'data/stages'),{recursive:true});for(const f of ['data/stage-videos.json','data/stages/inventory.json','data/stages/status.json','data/stages/selection-policy-baseline-20261028.json'])fs.copyFileSync(path.join(root,f),path.join(tmp,f));const videos=JSON.parse(fs.readFileSync(path.join(tmp,'data/stage-videos.json'))),status=JSON.parse(fs.readFileSync(path.join(tmp,'data/stages/status.json'))),baseline=JSON.parse(fs.readFileSync(path.join(tmp,'data/stages/selection-policy-baseline-20261028.json')));edit?.(videos,status,baseline);fs.writeFileSync(path.join(tmp,'data/stage-videos.json'),JSON.stringify(videos));fs.writeFileSync(path.join(tmp,'data/stages/status.json'),JSON.stringify(status));fs.writeFileSync(path.join(tmp,'data/stages/selection-policy-baseline-20261028.json'),JSON.stringify(baseline));return cp.spawnSync(process.execPath,[validator],{cwd:tmp,encoding:'utf8'});}finally{fs.rmSync(tmp,{recursive:true,force:true});}}
const id='rec28ldfRTrArg';
test('current stage catalog validates',()=>assert.equal(run().status,0));
test('validator rejects rounded likes masquerading as exact',()=>{const r=run(v=>v[id].likes.precision='rounded');assert.notEqual(r.status,0);assert.match(r.stderr,/nonexact likes/)});
test('validator rejects future timestamps',()=>{const r=run(v=>v[id].checkedAt='2099-01-01T00:00:00Z');assert.notEqual(r.status,0);assert.match(r.stderr,/invalid source time/)});
test('validator rejects original MV used as stage',()=>{const r=run(v=>{v[id].videoId='olDWm2veCrM';v[id].url='https://www.youtube.com/watch?v=olDWm2veCrM'});assert.notEqual(r.status,0);assert.match(r.stderr,/original MV/)});
test('validator rejects empty verified status',()=>{const r=run((v,s)=>{const other=Object.keys(s.works).find(k=>!v[k]);s.works[other].status='verified'});assert.notEqual(r.status,0);assert.match(r.stderr,/verified without playable source/)});
test('validator protects original selected video binding',()=>{const r=run(v=>v[id].scoreBinding.initializedAt='2026-10-11T12:00:00Z');assert.notEqual(r.status,0);assert.match(r.stderr,/BATTER UP source\/binding changed/)});

test('validator rejects source reuse across different songs',()=>{const r=run((v,s)=>{const other=Object.keys(s.works).find(k=>!v[k]);v[other]=structuredClone(v[id]);s.works[other].status='verified'});assert.notEqual(r.status,0);assert.match(r.stderr,/different group\/song/)});
test('validator rejects clip scope without matching score key or boundary evidence',()=>{const r=run(v=>{const s=v.rec28ldfRTrArg;s.clip={startSeconds:100,endSeconds:200,sourceDurationSeconds:1000,evidence:{note:'test',urls:['https://www.youtube.com/watch?v=B17yoLxkbPA']}};s.likesScope='whole_video';s.selectionNote='已核整场内对应片段';});assert.notEqual(r.status,0);assert.match(r.stderr,/clip score binding/);});
test('validator rejects whole-concert likes labelled as a single-song maximum',()=>{const r=run(v=>{const s=v.rec28ldfRTrArg;s.clip={startSeconds:100,endSeconds:200,sourceDurationSeconds:1000,evidence:{note:'test',urls:['https://www.youtube.com/watch?v=B17yoLxkbPA']}};s.scoreBinding.sourceKey='B17yoLxkbPA@100-200';s.likesScope='whole_video';s.selectionNote='已核同曲候选中点赞最高';});assert.notEqual(r.status,0);assert.match(r.stderr,/concert likes/);});

test('validator rejects clip endpoint beyond verified whole-video duration',()=>{const r=run(v=>{const s=v.rec28ldfRTrArg;s.clip={startSeconds:100,endSeconds:200,sourceDurationSeconds:199,evidence:{note:'test',urls:['https://www.youtube.com/watch?v=B17yoLxkbPA']}};s.scoreBinding.sourceKey='B17yoLxkbPA@100-200';s.likesScope='whole_video';s.selectionNote='已核整场内对应片段';});assert.notEqual(r.status,0);assert.match(r.stderr,/invalid clip boundaries/);});

const selection=occasion=>({occasion,evidence:{note:'Explicit synthetic program/practice source',urls:['https://example.org/performance']}});
function editableId(v){const referenced=new Set(Object.values(v).map(s=>s.audioEquivalence?.originalBoundWorkId));return Object.keys(v).find(k=>k!==id&&!v[k].clip&&!v[k].audioEquivalence&&!referenced.has(k));}
function adopt(v,videoId='newsource01'){
 const key=editableId(v),s=v[key];
 Object.assign(s,{sourceClass:'official',platform:'youtube',completeness:'full',videoId,url:`https://www.youtube.com/watch?v=${videoId}`,title:'Synthetic full performance',kind:'broadcast_stage',scoreBinding:null,reusesOriginalVideo:false,candidateCount:1,candidates:[{title:'Synthetic full performance',url:`https://www.youtube.com/watch?v=${videoId}`,likesDisplay:'1',kind:'broadcast_stage'}]});
 delete s.selection;return s;
}
test('frozen 482 work/source/selection triples survive the new occasion policy unchanged',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'data/stages/selection-policy-baseline-20261028.json')));
 assert.equal(Object.keys(baseline).length,482);
 for(const entry of Object.values(baseline)){assert.deepEqual(Object.keys(entry).sort(),['selectionSha256','sourceKey']);assert.match(entry.selectionSha256,/^[a-f0-9]{64}$/);}
 const r=run(v=>{const s=v[editableId(v)];s.kind='concert_stage';s.title='Frozen historical concert';});assert.equal(r.status,0,r.stderr);
});
test('new and changed sources require explicit selection; a copied historical work is not exempt',()=>{
 const changed=run(v=>adopt(v));assert.notEqual(changed.status,0);assert.match(changed.stderr,/new or changed source requires/);
 const added=run((v,s)=>{const source=structuredClone(v[editableId(v)]),key=Object.keys(s.works).find(k=>!v[k]);v[key]=source;s.works[key].status='verified';});
 assert.notEqual(added.status,0);assert.match(added.stderr,/new or changed source requires/);
});
test('documented new music-program and practice sources validate',()=>{
 for(const occasion of ['music_program','practice_room']){
  const r=run(v=>{const s=adopt(v);s.kind=occasion==='practice_room'?'practice_room':'broadcast_stage';s.selection=selection(occasion);});assert.equal(r.status,0,r.stderr);
 }
});
test('changed historical selection or clip bounds cannot inherit the frozen exemption',()=>{
 const changedSelection=run(v=>{v[editableId(v)].selection=selection('concert');});assert.notEqual(changedSelection.status,0);assert.match(changedSelection.stderr,/new or changed source requires/);
 const changedClip=run(v=>{const s=Object.values(v).find(s=>s.clip);assert.ok(s);s.clip.startSeconds+=1;if(s.scoreBinding)s.scoreBinding.sourceKey=`${s.videoId}@${s.clip.startSeconds}-${s.clip.endSeconds}`;});
 assert.notEqual(changedClip.status,0);assert.match(changedClip.stderr,/new or changed source requires/);
});
test('exact user-rejected IDs fail globally even with a documented practice label',()=>{
 for(const videoId of ['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg'])for(const explicit of [false,true]){
  const r=run(v=>{const s=adopt(v,videoId);if(explicit){s.selection=selection('practice_room');s.kind='practice_room';}});
  assert.notEqual(r.status,0);assert.match(r.stderr,/user-rejected exact source/);
 }
 for(const videoId of ['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg']){
  const r=run(v=>{const s=adopt(v);s.selection=selection('music_program');s.candidates.push({...s.candidates[0],url:`https://www.youtube.com/watch?v=${videoId}`});s.candidateCount+=1;});
  assert.notEqual(r.status,0);assert.match(r.stderr,/user-rejected exact source in runtime candidates/);
 }
});
test('new structured event classifications cannot masquerade as practice',()=>{
 for(const field of ['type','kind','performanceType'])for(const value of ['concert_stage','festival_stage','showcase_stage']){
  const r=run(v=>{const s=adopt(v);s.selection=selection('practice_room');s[field]=value;});assert.notEqual(r.status,0);assert.match(r.stderr,/structured performance type conflicts/);
 }
});
test('Concert and CON-TOUR in program titles do not trigger event rejection',()=>{
 for(const title of ["it's Live Band Concert",'Simply K-Pop CON-TOUR']){
  const r=run(v=>{const s=adopt(v);s.selection=selection('music_program');s.title=title;});assert.equal(r.status,0,r.stderr);
 }
});
test('historical exemption baseline cannot be extended or silently altered',()=>{
 const r=run((v,s,baseline)=>{const key=editableId(v);baseline[key].sourceKey='newsource01';adopt(v);});assert.notEqual(r.status,0);assert.match(r.stderr,/Historical selection baseline changed/);
});
