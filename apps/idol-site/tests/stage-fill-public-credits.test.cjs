const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {mvMemberAbsence}=load('lib/idol/mv-member-appearance.ts');
const {memberWorks,memberWorkSummary}=load('lib/idol/member-works.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const credits=require('../data/public-work-credits.json');
const recognition=require('../data/public-work-recognition.json');
const manifest=require('../data/mv-public-media.json');
const delivery=require('../data/production-asset-delivery.json');
const absence=require('../data/mv-member-appearance.json');
const historical=require('../../../docs/codex/evidence/20261028-followup/131-work-resolution-ledger.json');
const evidence=require('../../../docs/codex/evidence/20261028-stage-fill/person-followup.json');
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const bytesDigest=p=>createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',p))).digest('hex');
const hitgs=['recvxAPQCFYx1e','recvxAPQCFxcH2','recvxAPQCFDTXs','recvxAPQCFzCEc','recvxAPQCFQvki'];
const targets=[
 {id:'recvxyH5pzV22X',videoId:'FY9PFBxxKR8',groupId:'recvxyEBDZPbu5',memberIds:['recvxyICzHH702','recvxyICzHbczT','recvxyICzHn6vM','recvxyICzHBiSD','recvxyICzHrdSX','recvxyICzHXzUs']},
 {id:'recvxIZnNLuycR',videoId:'HcJUfVPvU4Y',groupId:'rec28ldfRTiE4q',memberIds:hitgs},
 {id:'recvxIZxXupyDR',videoId:'GGYo0Ya-4xE',groupId:'rec28ldfRTiE4q',memberIds:hitgs},
];
const ids=new Set(targets.map(t=>t.id));
const workFor=t=>({id:t.id,url:`https://www.youtube.com/watch?v=${t.videoId}`,groupIds:[t.groupId],ratingIds:[],score:0,stageScore:8,note:'synthetic private note',watched:'synthetic watched'});

test('three source-backed additions preserve all prior 42 credits, references and metadata',()=>{
 assert.equal(credits.records.length,45);assert.equal(recognition.records.length,45);
 assert.equal(new Set(credits.records.map(r=>r.workId)).size,45);
 assert.equal(new Set(recognition.records.map(r=>r.workId)).size,45);
 assert.equal(digest(credits.records.filter(r=>!ids.has(r.workId))),'b6bda4526142011c1b9c76879cfdd625c3f983ab3b5a3b9c5c5b041775c59921');
 assert.equal(digest(recognition.records.filter(r=>!ids.has(r.workId))),'4342efe08e4cc6f1f8fe3966994b1876e5050e6e7fd79e6e6f05b4480b53dcf1');
 assert.equal(credits.checkedAt,'2026-10-28');assert.equal(recognition.checkedAt,'2026-10-28');
 assert.equal(credits.scope,'Public editorial credits only. Never rating rows, scores, or a complete MV cast inferred from a group roster.');
 assert.equal(recognition.scope,'Recognition references for source-backed public credits only; no inferred MV cast or personal rating relationships. Existing original bytes reused without modifying the original manifest.');
 assert.equal(recognition.schemaVersion,1);
 const slots=recognition.records.reduce((n,r)=>n+r.portraits.length,0);
 assert.equal(slots,279);assert.equal(recognition.records.filter(r=>ids.has(r.workId)).reduce((n,r)=>n+r.portraits.length,0),16);
 const covered=new Set([...credits.records.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);
 assert.equal(covered.size,50);assert.equal(historical.records.length-covered.size,81);
 assert.ok([...covered].every(id=>historical.records.some(r=>r.workId===id)));
});

test('each exact release uses the documented named lineup without upgrading it to a full MV cast',()=>{
 for(const target of targets){
  const row=publicCreditForWork(workFor(target)),research=evidence.items.find(r=>r.workId===target.id);
  assert.ok(research);assert.equal(row.videoId,target.videoId);assert.equal(row.groupId,target.groupId);
  assert.deepEqual(row.memberIds,target.memberIds);assert.deepEqual(row.memberIds,research.memberIds);
  assert.equal(row.kind,'documented_project_lineup');assert.equal(row.sourceUrl,research.sourceUrl);
  assert.match(row.label,/录音|发行/);assert.match(row.note,/MV 出镜/);assert.match(row.note,/不证明/);assert.match(row.note,/同期造型/);
  assert.deepEqual(new Set(publicWorkRecognition(workFor(target)).map(p=>p.memberId)),new Set(target.memberIds));
 }
 assert.equal(evidence.items.find(r=>r.workId===targets[0].id).exactVersionEvidence.targetVideoId,'FY9PFBxxKR8');
 assert.ok(evidence.sources.filter(s=>s.exactTargetLink?.includes('FY9PFBxxKR8')).length>=2);
});

test('all 16 references reuse original bytes, dimensions and reviewed crops without new image files',()=>{
 const prior=recognition.records.find(r=>r.workId==='recvxyH5pzr7Nc');
 for(const target of targets){
  for(const portrait of publicWorkRecognition(workFor(target))){
   const original=target.id===targets[0].id?prior.portraits.find(p=>p.memberId===portrait.memberId):manifest.portraits.find(p=>p.workId==='rec28ldfRTrPKX'&&p.videoId==='y438mzlXS4c'&&p.memberId===portrait.memberId);
   assert.ok(original);
   for(const key of ['src','width','height','objectPosition','sourceCrop','sourceUrl','photoSetId'])assert.deepEqual(portrait[key],original[key]);
   const asset=delivery.assets.find(a=>a.path===portrait.src);assert.ok(asset);
   assert.equal(portrait.sha256,asset.sha256);assert.equal(bytesDigest(portrait.src),portrait.sha256);
   assert.equal(portrait.workAssociation,'recognition_reference');assert.match(portrait.label,/认人参考/);
   assert.match(portrait.note,/不据此证明/);
   for(const key of ['ratingId','ratingIds','score','stylingScore','watched','memory'])assert.equal(Object.hasOwn(portrait,key),false);
  }
 }
 assert.equal(new Set(targets.flatMap(t=>publicWorkRecognition(workFor(t)).map(p=>p.src))).size,11);
});

test('English Stranger is independently bound and cannot inherit another video or Korean absence policy',()=>{
 for(const target of targets){
  const work=workFor(target);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{url:`https://evil.example/watch?v=${target.videoId}`},{placeholder:true}]){
   assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
  }
  assert.equal(mvMemberAbsence(work),null);
 }
 const english=workFor(targets[0]);
 for(const mismatch of [{url:'https://www.youtube.com/watch?v=9qRmlYPJB10'},{id:'recvxyH5pzr7Nc'}])assert.equal(publicCreditForWork({...english,...mismatch}),null);
 assert.equal(absence.entries.length,6);
 assert.equal(digest(absence.entries.filter(r=>r.workId!=='recvxyH5pzr7Nc')),'c6ed6ec61d2db9f82b3a1bd4050ecd3d3e25ea2299e1ed169a3e4032568a68bc');
 assert.ok(mvMemberAbsence({...english,id:'recvxyH5pzr7Nc',url:'https://www.youtube.com/watch?v=9qRmlYPJB10'}));
});

test('public references render read-only and never create private relations or change existing scores',()=>{
 for(const target of targets){
  const work=workFor(target),members=target.memberIds.map(id=>({id,name:`Public ${id}`,stageName:`Singer ${id}`,groupIds:[target.groupId]}));
  const data={works:[work],members,ratings:[]},before=structuredClone(data);
  const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,target.memberIds.length);
  assert.match(html,/不代表已核实其在本视频出镜或同期造型/);
  assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note|synthetic watched/);
  for(const memberId of target.memberIds){
   assert.equal(publicCreditsForMember(data,memberId).length,1);
   assert.deepEqual(memberWorks(data,memberId),[]);assert.equal(memberWorkSummary(memberWorks(data,memberId)).ratedWorks,0);
   const personal={...data,ratings:[{id:'existing-private-relation',memberIds:[memberId],workIds:[work.id],score:0,stylingScore:7,note:'preserve existing'}]},saved=structuredClone(personal);
   assert.deepEqual(publicCreditsForMember(personal,memberId),[]);assert.equal(memberWorks(personal,memberId)[0].performance,0);
   assert.deepEqual(personal,saved);
  }
  assert.deepEqual(data,before);
 }
});
