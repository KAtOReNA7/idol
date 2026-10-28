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
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const credits=require('../data/public-work-credits.json');
const recognition=require('../data/public-work-recognition.json');
const base='../../../docs/codex/evidence/20261028-post-v200/people/';
const delta=require(base+'public-work-credits.delta.json').records;
const refs=require(base+'public-work-recognition.delta.json').records;
const research=require(base+'research.json');
const baseline=require(base+'baseline.json');
const adoption=require(base+'adoption.json');
const queue=require('../../../docs/codex/evidence/20261028-v200/remaining-person-statistics.json').remainingPersonWorks;
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fileHash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');

test('continuation preserves all 91 v200 objects, existing original media and absence rules',()=>{
 assert.equal(hash(credits.records.slice(0,91)),baseline.creditsRecordsSemanticSha256);
 assert.equal(hash(recognition.records.slice(0,91)),baseline.recognitionRecordsSemanticSha256);
 for(const [name,sha] of Object.entries(baseline.protectedFiles))assert.equal(fileHash(path.join(__dirname,'../data',name)),sha);
 assert.deepEqual(credits.records.slice(91,102),delta);assert.deepEqual(recognition.records.slice(91,102),refs);
 assert.equal(delta.length,11);assert.equal(refs.reduce((n,r)=>n+r.portraits.length,0),39);
 assert.equal(new Set(credits.records.map(r=>r.workId)).size,credits.records.length);
 assert.equal(adoption.publicCreditWorks,102);assert.equal(adoption.publicRecognitionSlots,527);
 assert.equal(adoption.remainingPersonWorks,24);assert.equal(adoption.privateWrites,0);assert.equal(adoption.newImageFiles,0);
 assert.equal(adoption.privateRelationsAdded,0);assert.equal(adoption.published,false);
});

test('all 35 original unresolved works receive a bounded conclusion and next route without claiming full cast completion',()=>{
 assert.equal(research.records.length,35);assert.equal(new Set(research.records.map(r=>r.workId)).size,35);
 assert.deepEqual(research.records.map(r=>r.workId).sort(),queue.map(r=>r.workId).sort());
 assert.equal(research.records.filter(r=>r.disposition==='adopted_scoped_public_reference').length,11);
 assert.equal(research.records.filter(r=>r.disposition==='not_adopted_evidence_insufficient').length,24);
 for(const r of research.records){
  const q=queue.find(w=>w.workId===r.workId);assert.equal(r.videoId,q.videoId);assert.equal(r.groupId,q.groupId);
  assert.ok(r.nextRoute.length>20);assert.equal(r.fullPlayback,false);assert.equal(r.individualAudioComparison,false);
  if(r.disposition==='not_adopted_evidence_insufficient')assert.equal(delta.some(d=>d.workId===r.workId),false);
 }
 assert.equal(research.fullWebExhaustion,false);
});

for(const expected of delta)test(`scoped public evidence protects exact tuple and saved zero: ${expected.workId}`,()=>{
 const work={id:expected.workId,url:`https://www.youtube.com/watch?v=${expected.videoId}`,groupIds:[expected.groupId],ratingIds:[],score:0,stageScore:8,note:'synthetic private note',watched:true};
 assert.deepEqual(publicCreditForWork(work),expected);assert.equal(mvMemberAbsence(work),null);
 for(const mismatch of [{id:'wrong-work'},{groupIds:['wrong-group']},{url:'https://www.youtube.com/watch?v=other012345'},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
 }
 const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),expected.memberIds);
 assert.equal(new Set(photos.map(p=>p.photoSetId)).size,1);
 for(const p of photos){
  assert.equal(p.workAssociation,'recognition_reference');assert.match(p.note,/不证明本视频出镜/);
  assert.equal(fileHash(path.join(__dirname,'../public',p.src)),p.sha256);
  const c=p.sourceCrop;assert.ok(c&&c.x>=0&&c.y>=0&&c.x+c.width<=p.width&&c.y+c.height<=p.height);
  assert.ok(Math.abs(c.width/c.height-0.75)<0.001);assert.ok(Math.min(c.width,c.height)>=600);
  for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(p,key),false);
 }
 const data={works:[work],members:expected.memberIds.map(id=>({id,stageName:id,groupIds:[expected.groupId]})),ratings:[]},before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,expected.memberIds.length);
 assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
 for(const mid of expected.memberIds){
  assert.deepEqual(memberWorks(data,mid),[]);assert.equal(publicCreditsForMember(data,mid).length,1);
  const personal={...data,ratings:[{id:'saved',workIds:[work.id],memberIds:[mid],score:0,stylingScore:9}]},saved=structuredClone(personal);
  assert.equal(memberWorks(personal,mid)[0].performance,0);assert.deepEqual(publicCreditsForMember(personal,mid),[]);assert.deepEqual(personal,saved);
 }
 assert.deepEqual(data,before);assert.equal(work.score,0);
});

test('writers, interviews, jacket and version-specific promotion keep their narrow evidence scope',()=>{
 const by=id=>delta.find(r=>r.workId===id);
 assert.deepEqual(by('recvxyOz5X6G1q').memberIds,['recvxyICzHsxMe','recvxyICzHcw9e']);
 assert.equal(by('recvxyOz5X6G1q').kind,'named_artist_credit');assert.match(by('recvxyOz5X6G1q').label,/词曲/);
 assert.deepEqual(by('rec28ldfRTrLow').memberIds,['rec28ldbniB9dP','rec28ldbniB9uh']);assert.match(by('rec28ldfRTrLow').label,/作词/);
 for(const id of ['recvxIZnNLkXMl','recvxIZnNLgpyC']){
  assert.deepEqual(by(id).memberIds,['recvxAPQCFYx1e','recvxAPQCFzCEc']);assert.match(by(id).note,/未逐视频区分/);
 }
 assert.match(by('rec28ldfRTrKy2').note,/MOKA/);assert.match(by('rec28ldfRTrMEN').label,/韩文版宣传/);
 assert.match(by('rec28ldfRTrPq2').label,/封套/);assert.match(by('rec28ldfRTrPq2').note,/时期未明/);
 for(const r of delta.filter(r=>!['recvxyOz5X6G1q','rec28ldfRTrLow'].includes(r.workId)))assert.equal(r.kind,'documented_project_lineup');
});
