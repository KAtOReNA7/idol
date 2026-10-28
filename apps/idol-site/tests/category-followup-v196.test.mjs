import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire,Module} from 'node:module';
import {buildSync} from 'esbuild';

const require=createRequire(import.meta.url);
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {mvMemberAbsence}=load('lib/idol/mv-member-appearance.ts');
const {F}=load('lib/idol/fields.ts');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
// This release test owns the immutable v196 cohort, not later additions.
const v196Ledger=read('../../docs/codex/evidence/20261028-followup/131-work-resolution-ledger.json');
const v196CreditIds=new Set(v196Ledger.records.filter(r=>r.status.startsWith('public_credit_')).map(r=>r.workId));
const credits=read('data/public-work-credits.json').records.filter(r=>v196CreditIds.has(r.workId));
const recognition=read('data/public-work-recognition.json').records.filter(r=>v196CreditIds.has(r.workId));
const absence=read('data/mv-member-appearance.json');
const tuples=[
 ['recvxyOz5XRfn5','zrYC3LEpc6w','recvxyEBDZOpTf',6,'documented_project_lineup'],
 ['rec28ldfRTrEsc','jKdANBLxj2U','rec28ldfRTiD0h',1,'partial_mv_participation'],
 ['recvxyH5pzr7Nc','9qRmlYPJB10','recvxyEBDZPbu5',6,'documented_project_lineup'],
 ['recvxyH5pzA9lj','SLYos3_m3_A','recvxyEBDZB3pz',6,'documented_project_lineup'],
];
const ids=new Set(tuples.map(t=>t[0]));
const workFor=t=>({id:t[0],url:`https://www.youtube.com/watch?v=${t[1]}`,groupIds:[t[2]],ratingIds:[],score:8,note:'preserve-private-canary',watched:true});

test('v196 adds exactly four scoped public credits and 19 references without changing the prior 38 records',()=>{
 assert.equal(credits.length,42);assert.equal(recognition.length,42);
 assert.equal(new Set(credits.map(r=>r.workId)).size,42);
 assert.equal(new Set(recognition.map(r=>r.workId)).size,42);
 assert.equal(hash(credits.filter(r=>!ids.has(r.workId))),'31820d70bb6c053203e85aa9c73180955d21c2601872e0784756645d763f28d5');
 assert.equal(hash(recognition.filter(r=>!ids.has(r.workId))),'84bbfd2f24be323ffb527bd1dff17f5e9f2b5c3517d3a1af6a103af8816a8e7a');
 assert.equal(credits.filter(r=>ids.has(r.workId)).reduce((n,r)=>n+r.memberIds.length,0),19);
 assert.equal(recognition.reduce((n,r)=>n+r.portraits.length,0),263);
 for(const tuple of tuples){
  const work=workFor(tuple),credit=publicCreditForWork(work),portraits=publicWorkRecognition(work);
  assert.equal(credit.kind,tuple[4]);assert.equal(credit.memberIds.length,tuple[3]);assert.equal(portraits.length,tuple[3]);
  assert.equal(credit.groupId,tuple[2]);assert.equal(credit.videoId,tuple[1]);
  assert.deepEqual(new Set(portraits.map(p=>p.memberId)),new Set(credit.memberIds));
  assert.equal(new Set(portraits.map(p=>p.photoSetId)).size,1);
  for(const p of portraits){
   assert.equal(p.workAssociation,'recognition_reference');assert.match(p.label,/认人参考/);
   assert.equal(createHash('sha256').update(fs.readFileSync(path.join('public',p.src))).digest('hex'),p.sha256);
   for(const key of ['score','stylingScore','ratingId','ratingIds','watched'])assert.equal(Object.hasOwn(p,key),false);
  }
 }
});

test('recording and release lineups remain distinct from camera appearance and partial Emma credit is not expanded',()=>{
 const nmixx=publicCreditForWork(workFor(tuples[0]));
 assert.match(nmixx.label,/录音/);assert.match(nmixx.note,/不等于逐人MV出镜/);
 const emma=publicCreditForWork(workFor(tuples[1]));
 assert.deepEqual(emma.memberIds,['recvxAPQCFnOAE']);assert.match(emma.label,/部分名单/);
 const stranger=publicCreditForWork(workFor(tuples[2]));
 assert.match(stranger.label,/录音/);assert.match(stranger.note,/没有成员真人出镜/);
 const rocket=publicCreditForWork(workFor(tuples[3]));
 assert.match(rocket.note,/JURI/);assert.match(rocket.note,/不改变其现已离团/);assert.match(rocket.note,/不表示逐人 MV 出镜/);
 assert.ok(rocket.memberIds.includes('recvxyICzHhNwL'));
});

test('public credit tuples match existing catalog IDs and historical membership without changing JURI to current membership',()=>{
 const snapshot=read('data/snapshot.json'),members=snapshot.tables.members.records,works=snapshot.tables.works.records;
 for(const tuple of tuples){
  const raw=works.find(r=>r.recordId===tuple[0]);assert.ok(raw);
  assert.ok(raw.fields[F.works.url].some(link=>link.url===`https://www.youtube.com/watch?v=${tuple[1]}`));
  assert.ok(raw.fields[F.works.groups].some(link=>link.recordId===tuple[2]));
  for(const id of publicCreditForWork(workFor(tuple)).memberIds){
   const member=members.find(r=>r.recordId===id);assert.ok(member);
   assert.ok([...(member.fields[F.members.groups]??[]),...(member.fields[F.members.formerGroups]??[])].some(g=>g.recordId===tuple[2]));
  }
 }
 const juri=members.find(r=>r.recordId==='recvxyICzHhNwL').fields;
 assert.equal(juri[F.members.name],'Rocket Punch · JURI');assert.deepEqual(juri[F.members.groups],[]);
 assert.ok(juri[F.members.formerGroups].some(g=>g.recordId==='recvxyEBDZB3pz'));
});

test('all four credits and images require exact IDs and remain read-only when personal relations already exist',()=>{
 for(const tuple of tuples){
  const work=workFor(tuple),before=structuredClone(work),memberId=publicCreditForWork(work).memberIds[0];
  const rating={id:'existing-private-rating',memberIds:[memberId],workIds:[work.id],score:9,note:'do not rewrite'};
  const catalog={works:[work],ratings:[rating]},snapshot=structuredClone(catalog);
  assert.equal(publicCreditsForMember({works:[work],ratings:[]},memberId).length,1);
  assert.deepEqual(publicCreditsForMember(catalog,memberId),[]);assert.deepEqual(catalog,snapshot);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{placeholder:true}]){
   assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
  }
  assert.deepEqual(work,before);
 }
});

test('Stranger source-confirmed absence applies only to the Korean exact upload, without rewriting the original five rules',()=>{
 assert.equal(absence.entries.length,6);
 assert.equal(hash(absence.entries.filter(r=>r.workId!=='recvxyH5pzr7Nc')),'c6ed6ec61d2db9f82b3a1bd4050ecd3d3e25ea2299e1ed169a3e4032568a68bc');
 const work=workFor(tuples[2]),rule=mvMemberAbsence(work);
 assert.equal(rule.verificationBasis,'source-confirmed');assert.equal(rule.fullVideoWatched,false);
 assert.match(rule.sources[0],/^https:\/\/kpopconcerts\.com\/exclusives\/interview-weeekly/);
 assert.equal(mvMemberAbsence({...work,url:'https://www.youtube.com/watch?v=FY9PFBxxKR8'}),null);
 assert.equal(mvMemberAbsence({...work,id:'different-Stranger-work'}),null);
 for(const tuple of [tuples[0],tuples[1],tuples[3]])assert.equal(mvMemberAbsence(workFor(tuple)),null);
});

test('the 131-work ledger counts public credits and absence as an overlapping union, not new private relations',()=>{
 const ledger=read('../../docs/codex/evidence/20261028-followup/131-work-resolution-ledger.json');
 const workIds=new Set(ledger.records.map(r=>r.workId)),creditIds=new Set(credits.map(r=>r.workId)),absenceIds=new Set(absence.entries.map(r=>r.workId));
 assert.equal(ledger.records.length,131);assert.equal(workIds.size,131);
 const overlap=[...creditIds].filter(id=>absenceIds.has(id)),union=new Set([...creditIds,...absenceIds]);
 assert.deepEqual(overlap,['recvxyH5pzr7Nc']);assert.equal(union.size,47);
 assert.ok([...union].every(id=>workIds.has(id)));
 assert.equal(workIds.size-union.size,84);
 assert.equal(ledger.creditAbsenceOverlap,overlap.length);assert.equal(ledger.coveredUnion,union.size);
 assert.equal(ledger.remainingWithoutAdoptedPersonCreditOrAbsence,84);
 assert.equal(new Set(recognition.flatMap(r=>r.portraits.map(p=>p.src))).size,123);
 assert.equal(Object.values(ledger.statusCounts).reduce((n,value)=>n+value,0),131);
 assert.ok(ledger.records.every(r=>r.privateRelationshipsAdded===0&&r.fullVideoWatched===false));
});

test('Stranger rejects only member score writes and keeps existing records and unconfirmed works available',async()=>{
 const out=buildSync({entryPoints:['lib/idol/member-score-policy.ts'],bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers'],logLevel:'silent'});
 const mod=new Module(path.resolve('tests/category-followup-policy.cjs'));
 mod.filename=path.resolve('tests/category-followup-policy.cjs');mod.paths=Module._nodeModulePaths(path.resolve('tests'));
 mod.require=name=>name==='cloudflare:workers'?{env:{}}:require(name);mod._compile(out.outputFiles[0].text,mod.filename);
 const {assertMemberScoreAllowed}=mod.exports,work=workFor(tuples[2]),before=structuredClone(work);
 for(const values of [{score:5},{stylingScore:4},{score:null},{score:5,memberAppears:true}]){
  await assert.rejects(assertMemberScoreAllowed(values,[work.id],async()=>work),e=>e.code==='MV_HAS_NO_MEMBERS');
 }
 await assertMemberScoreAllowed({note:'existing-note-edit'},[work.id],()=>{throw new Error('no score lookup needed');});
 for(const tuple of [tuples[0],tuples[1],tuples[3]])await assertMemberScoreAllowed({score:5},[tuple[0]],async()=>workFor(tuple));
 assert.deepEqual(work,before);
});
