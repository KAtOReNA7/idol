const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {validStageSearchReview,stageSupplementForWork}=load('lib/idol/supplements.ts');
const {stageForWork}=load('lib/idol/stage.ts');
const source=require('../data/stages/supplements.json');
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
  assert.equal(hash(fs.readFileSync(path.join(__dirname,'..',relative))),proof.afterSha256,relative);
 }
 const runtime=stageSupplementForWork(id);
 assert.deepEqual(runtime.alternatives,[]);assert.equal(runtime.watchLeads,undefined);
 assert.deepEqual(runtime.searchReview,review);
 assert.equal(stageForWork(id),null,'research metadata cannot initialize a formal stage or score binding');
 assert.equal('scoreBinding' in row,false);assert.equal('completeness' in row,false);assert.equal('versionMatch' in row,false);
 assert.equal(JSON.stringify(source),before);
});
