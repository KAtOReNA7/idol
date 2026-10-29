const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {validStageSearchReview}=load('lib/idol/supplements.ts');
const {beforeFormalStageForWork:stageForWork,beforeHeyGabbyFormalBytes}=require('./helpers/heygabby-formal-baseline.cjs');
const currentSource=require('../data/stages/supplements.json');
const {beforeHeyGabbyViewing,historicalHeyGabbySupplement}=require('./helpers/heygabby-viewing-baseline.cjs');
const participationSource=beforeHeyGabbyViewing(currentSource);
const {beforeHeyGabbyHuman,beforeHeyGabbyHumanBytes,heyGabbyHumanAdoption}=require('./helpers/heygabby-human-baseline.cjs');
const source=beforeHeyGabbyHuman(currentSource);
const receipt=require('../../../docs/codex/evidence/20261029-group-followup/heygabby-review-update.json');
const id='recvxyOz5Xo5fW',candidate='https://www.youtube.com/watch?v=XSpYaEdpKxY';
const row=source.works[id],review=row.searchReview;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
const objectHash=value=>hash(JSON.stringify(sorted(value)));

test('Hey Gabby reopens official Performance research without asserting video completeness or an exact version',()=>{
 assert.equal(validStageSearchReview(review),true);
 assert.equal(review.outcome,'verification_limited');assert.equal(review.accessLimited,true);
 assert.equal(review.reviewComplete,undefined);assert.equal(review.reopenRequirement,undefined);
 assert.ok(review.scope.some(entry=>entry.url===candidate&&entry.label.includes(receipt.candidateTitle)));
 for(const url of ['https://music.bugs.co.kr/album/20465227','https://www.newsis.com/view/NISX20220518_0001876354'])assert.ok(review.scope.some(entry=>entry.url===url),url);
 assert.ok(!review.excluded.some(entry=>entry.url===candidate),'an MV title alone no longer excludes this produced-performance candidate');
 assert.deepEqual(review.excluded,receipt.beforeSearchReview.excluded.filter(entry=>entry.url!==candidate),'the original MV and processed reupload exclusions stay intact');
 assert.match(review.summary,/待核候选/);assert.match(review.summary,/完整首尾/);
 assert.match(review.limitations.join('\n'),/目录时长.*不能据此填写completeness=full或versionMatch=true/);
 assert.match(review.limitations.join('\n'),/完整分页保存日志/);
 assert.match(review.limitations.join('\n'),/区分空分与0分/);
});

test('the review edit preserves target alternatives, formal stage bindings and the recorded update boundary',()=>{
 const before=JSON.stringify(source);
 const targetFields=Object.fromEntries(Object.entries(row).filter(([key])=>key!=='searchReview'));
 assert.deepEqual(targetFields,receipt.preservedTargetFields);
 assert.deepEqual(review,receipt.afterSearchReview);
 assert.equal(objectHash(row),receipt.afterWorkSha256);
 assert.equal(objectHash({...targetFields,searchReview:receipt.beforeSearchReview}),receipt.beforeWorkSha256);
 assert.equal(receipt.preservation.otherWorksBeforeSha256,receipt.preservation.otherWorksAfterSha256);
 assert.equal(receipt.preservation.outsideTargetReviewBytesUnchanged,true);
 assert.equal(receipt.preservation.targetOtherFieldsUnchanged,true);
 assert.equal(receipt.preservation.stageBindingsChanged,0);
 for(const [relative,proof] of Object.entries(receipt.preservation.protectedFiles)){
  assert.equal(proof.beforeSha256,proof.afterSha256,relative);
  assert.equal(hash(beforeHeyGabbyFormalBytes(relative,fs.readFileSync(path.join(__dirname,'..',relative)))),proof.afterSha256,relative);
 }
 const runtime=historicalHeyGabbySupplement(id);
 assert.deepEqual(runtime.alternatives,[]);assert.equal(runtime.watchLeads,undefined);
 assert.deepEqual(runtime.searchReview,participationSource.works[id].searchReview);
 assert.equal(stageForWork(id),null,'research metadata cannot initialize a formal stage or score binding');
 assert.equal('scoreBinding' in row,false);assert.equal('completeness' in row,false);assert.equal('versionMatch' in row,false);
 assert.equal(JSON.stringify(source),before);
});

test('human observation confirms only seven-member participation in the exact Performance candidate',()=>{
 const current=participationSource.works[id],r=current.searchReview,h=heyGabbyHumanAdoption;
 assert.equal(h.workId,id);assert.equal(h.candidateVideoId,'XSpYaEdpKxY');
 assert.equal(validStageSearchReview(r),true);assert.equal(r.outcome,'verification_limited');
 assert.match(r.summary,/人工看片确认片中7名成员均参与/);
 assert.match(r.publicNote.summary,/人工看片已确认.*7名成员均参与/);
 assert.match(r.limitations.join('\n'),/未独立逐帧复核/);
 assert.match(r.publicNote.summary,/视频首尾是否完整、语言和音轨是否与原曲一致仍待核验/);
 assert.doesNotMatch(r.publicNote.summary,/成员[^。；]*仍待核|独立[^。；]*确认[^。；]*7名/);
 assert.equal(h.humanObservation.independentlyRewatched,false);
 assert.equal(h.humanObservation.completenessConfirmed,false);assert.equal(h.humanObservation.audioVersionConfirmed,false);
 assert.equal(h.memberRelationshipsChanged,0);assert.equal(h.stageBindingsChanged,0);assert.equal(h.fullFactClosures,0);
 assert.deepEqual(current.alternatives,[]);assert.equal(current.watchLeads,undefined);
 for(const key of ['memberIds','performerNames','scoreBinding','completeness','versionMatch'])assert.equal(key in current,false,key);
 assert.equal(r.reviewComplete,undefined);assert.equal(stageForWork(id),null);
 assert.deepEqual(r.excluded,review.excluded);
});

test('exact human-review preimages preserve every other supplement byte and reject unreviewed changes',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../data/stages/supplements.json'),'utf8');
 const historical=beforeHeyGabbyHumanBytes(bytes);
 assert.equal(hash(historical),'0ea798e6e9bfe21de5ebeb583d15b9a83e0002b621682ffbcef0fc1bd6ae2512');
 const snapshot=structuredClone(currentSource);assert.deepEqual(beforeHeyGabbyHuman(currentSource),JSON.parse(historical));assert.deepEqual(currentSource,snapshot);
 const wrongScope=structuredClone(currentSource);wrongScope.works[id].searchReview.outcome='not_found_in_scope';
 assert.throws(()=>beforeHeyGabbyHuman(wrongScope),/complete current Hey Gabby formal supplementsUpdate row/);
 const unrelated=structuredClone(currentSource);unrelated.works.rec28ldfRTrNsK.watchLeads[0].leadTimeSeconds++;
 assert.throws(()=>beforeHeyGabbyHuman(unrelated),/all other supplements and metadata preserved/);
 assert.throws(()=>beforeHeyGabbyHumanBytes(bytes+' '),/complete current supplements bytes/);
});
