const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits,MemberPublicCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const receipt=require('../../../docs/codex/evidence/20261030-sprinkle-human/sprinkle-public-adoption.json');
const {beforeSprinkle}=require('./helpers/sprinkle-public-baseline.cjs');
const credits=require('../data/public-work-credits.json'),recognition=require('../data/public-work-recognition.json');
const snapshot=require('../data/snapshot.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const mids=['recvxyICzHsxMe','recvxyICzHcw9e','recvxyICzH9IoY','recvxyICzHKyEb','recvxyICzHbCfX','recvxyICzHwrX4','recvxyICzHyM9P'];
const work={id:receipt.workId,groupIds:[receipt.groupId],url:`https://www.youtube.com/watch?v=${receipt.videoId}`,ratingIds:[],score:0,stageScore:0,note:'PRIVATE_SYNTHETIC',watched:true,song:'Sprinkle Party'};
const members=mids.map(id=>{const raw=snapshot.tables.members.records.find(r=>r.recordId===id).fields;return {id,stageName:raw.fld1jPwSAP,groupIds:id===mids[6]?[]:[receipt.groupId],formerGroupIds:id===mids[6]?[receipt.groupId]:[]};});
const data={works:[work],members,ratings:[]};

test('complete public collection preimages and every protected private/source/original file stay exact',()=>{
 for(const name of ['public-work-credits.json','public-work-recognition.json']){
  const current=name==='public-work-credits.json'?credits:recognition;
  assert.equal(beforeSprinkle(name,current).records.length,106);assert.equal(current.records.length,107);
  const changed=structuredClone(current);changed.records[0].note+='tampered';
  assert.throws(()=>beforeSprinkle(name,changed),/complete reviewed post-Sprinkle/);
 }
 assert.equal(recognition.records.reduce((n,r)=>n+r.portraits.length,0),553);
 for(const [name,sha] of Object.entries(receipt.protectedFiles))assert.equal(hash(fs.readFileSync(path.join(__dirname,'..',name))),sha,name);
 assert.equal(receipt.newPrivateRelations,0);assert.equal(receipt.newImageFiles,0);assert.equal(receipt.newFormalStages,0);
});

test('human appearance evidence uses exactly seven historical IDs and never becomes official recording credits or current membership',()=>{
 const c=publicCreditForWork(work);assert.deepEqual(c.memberIds,mids);assert.equal(c.kind,'human_verified_mv_appearance');
 assert.match(c.note,/人工观看观察/);assert.match(c.note,/不称官方逐名演员表/);assert.match(c.note,/不证明逐人录音/);
 assert.equal(publicGroupRecognitionForWork(work),null);
 for(const mismatch of [{id:'other'},{groupIds:['other']},{url:'https://www.youtube.com/watch?v=XSpYaEdpKxY'},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
 }
 const jinni=snapshot.tables.members.records.find(r=>r.recordId===mids[6]).fields;
 assert.equal(jinni.fld3U12Dow.text,'已离团');assert.deepEqual(jinni.fld6bhQOdO,[]);
});

test('seven O.O named originals retain original bytes, dimensions and view framing, without claiming Sprinkle Party screenshots',()=>{
 const old=require('../data/mv-public-media.json').portraits,portraits=publicWorkRecognition(work);
 assert.deepEqual(portraits.map(p=>p.memberId),mids);assert.equal(new Set(portraits.map(p=>p.photoSetId)).size,1);
 for(const p of portraits){
  const prior=old.find(q=>q.workId==='recvxyOz5Xv1vV'&&q.videoId==='3GWscde8rM8'&&q.memberId===p.memberId);
  for(const k of ['src','width','height','sourceUrl','objectPosition'])assert.deepEqual(p[k],prior[k]);
  assert.equal(p.sourceCrop,undefined);assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);
  assert.equal(p.workAssociation,'recognition_reference');assert.match(p.note,/不是Sprinkle Party画面/);assert.match(p.label,/O.O.*认人参考/);
 }
});

test('actual artist projection exposes historical JINNI public reference without changing affiliation or adding private rows',()=>{
 const code=require('esbuild').buildSync({entryPoints:['lib/idol/artist-catalog.ts'],bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
 const mod={exports:{}};require('node:vm').runInThisContext('(function(require,module,exports){'+code+'\n})')(n=>n==='cloudflare:workers'?{env:{}}:n==='server-only'?{}:require(n),mod,mod.exports);
 const {projectArtistCatalog}=mod.exports;
 const input={...data,groups:[{id:receipt.groupId}],counts:{}},before=structuredClone(input);
 const projected=projectArtistCatalog(input,receipt.groupId);
 assert.deepEqual(projected.members.map(m=>m.id),mids);assert.deepEqual(projected.ratings,[]);
 const jinni=projected.members.find(m=>m.id===mids[6]);assert.deepEqual(jinni.groupIds,[]);assert.deepEqual(jinni.formerGroupIds,[receipt.groupId]);
 assert.equal(publicCreditsForMember(projected,jinni.id).length,1);assert.deepEqual(input,before);
});

test('real public SSR shows seven names and qualified reference photos; saved zero/private relations are never replaced or duplicated',()=>{
 const before=structuredClone(data),html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.match(html,/人工看片确认的MV出镜成员/);assert.match(html,/本MV出镜范围依据人工看片/);assert.match(html,/JINNI/);
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,7);assert.doesNotMatch(html,/<input|<form|cast-scores|PRIVATE_SYNTHETIC/);
 for(const id of mids){
  assert.equal(publicCreditsForMember(data,id).length,1);assert.deepEqual(memberWorks(data,id),[]);
  const saved={...data,ratings:[{id:'existing-zero',memberIds:[id],workIds:[work.id],score:0,stylingScore:9,memory:'SAVED_PRIVATE'}]},prior=structuredClone(saved);
  assert.deepEqual(publicCreditsForMember(saved,id),[]);assert.equal(memberWorks(saved,id)[0].performance,0);
  assert.equal(renderToStaticMarkup(React.createElement(MemberPublicCredits,{memberId:id,data:saved,onWork(){}})),'');
  renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:saved,onMember(){}}));assert.deepEqual(saved,prior);
 }
 assert.deepEqual(data,before);
});

test('remaining queues close only Sprinkle appearance, retain every other frozen person/stage and preserve previous pointers',()=>{
 const people=require('../../../docs/codex/evidence/20261030-sprinkle-human/remaining-person-facts.json'),oldPeople=require('../../../docs/codex/evidence/20261028-post-v200/remaining-person-statistics.json');
 assert.equal(people.remaining,23);assert.deepEqual(people.remainingPersonWorks,oldPeople.remainingPersonWorks.filter(r=>r.workId!==work.id));
 const queue=require('../../../docs/codex/evidence/20261030-sprinkle-human/remaining-stage-ledger.json'),previous=require('../../../docs/codex/evidence/20261030-evidence-advance/remaining-stage-ledger.json');
 assert.deepEqual(queue.records,previous.records);assert.deepEqual(queue.legacyReplacementsRemaining,previous.legacyReplacementsRemaining);
 assert.deepEqual(queue.classifiedRemaining,{...previous.classifiedRemaining,personFacts:23,total:153});
 assert.equal(queue.resolvedPersonFactsThisPass.length,1);assert.equal(queue.resolvedPersonFactsThisPass[0].workId,work.id);
 assert.equal(queue.adoptedThisPass[0].receipt,'docs/codex/evidence/20261030-evidence-advance/ive-eleven-adoption.json');
 assert.ok(fs.existsSync(path.join(__dirname,'../../..',queue.adoptedThisPass[0].receipt)));
});
