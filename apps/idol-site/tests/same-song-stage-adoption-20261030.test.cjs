'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {beforeSameSongAdoption,coreTargetIds,targetIds,replacementIds,receipt,hash}=require('./helpers/same-song-adoption-baseline.cjs');
const source=load('lib/idol/stage-source.ts'),{projectPublicCatalog}=load('lib/idol/public-catalog.ts'),{StageSameSongFallback}=load('components/stage-same-song-fallback.tsx');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'../..'),videos=require('../data/stage-videos.json'),statuses=require('../data/stages/status.json');
const inventory=require('../data/stages/inventory.json').works,byId=new Map(inventory.map(w=>[w.recordId,w]));
const oldVideos=receipt.before['data/stage-videos.json'].object,oldStatuses=receipt.before['data/stages/status.json'].object;
const unknownVersionIds=['rec28ldfRTrI8S','recvxyHuKMwrIt','recvxDMFHNzJyr'];
const expectedExtraIds=['recvxyH5pzFAPL','recvxyOz5XkyEY','recvxyHuKMlGJW','recvxyHuKMwjsI',...unknownVersionIds],sha=value=>createHash('sha256').update(value).digest('hex');
function archivedInput(check){
 const reviewedPath=[path.join(repo,'docs/codex/evidence/20261030-same-song-adoption',check.batch),path.join(repo,'docs/codex/evidence/20261030-priority-crosscheck',check.batch)].find(file=>fs.existsSync(file));assert.ok(reviewedPath,'exact reviewed input retained');
 const archived=JSON.parse(fs.readFileSync(path.join(root,'data/stages/evidence',check.batch)));assert.deepEqual(archived,JSON.parse(fs.readFileSync(reviewedPath)));return archived;
}

test('actual adoption restores the complete 501-source and research preimages and refuses partial or unrelated edits',()=>{
 assert.equal(receipt.adopted,true);assert.equal(receipt.totalNewSources,targetIds.length);assert.equal(receipt.currentLocalSources,501+targetIds.length);assert.deepEqual(replacementIds,['recvxyHuKM4BvC']);assert.equal(receipt.totalReplacements,1);
 assert.ok([...coreTargetIds,...expectedExtraIds].every(id=>targetIds.includes(id)));assert.equal(Object.keys(videos).length,receipt.currentLocalSources);assert.equal(Object.keys(oldVideos).length,501);
 for(const [kind,relative,current] of [['stageVideos','data/stage-videos.json',videos],['stageStatuses','data/stages/status.json',statuses]]){
  assert.equal(sha(fs.readFileSync(path.join(root,relative))),receipt.after[relative].sha256);
  const before=beforeSameSongAdoption(kind,current);assert.deepEqual(before,receipt.before[relative].object);assert.deepEqual(beforeSameSongAdoption(kind,before),before);
  const changed=structuredClone(current);if(kind==='stageVideos')changed[Object.keys(oldVideos)[0]].title+=' unreviewed';else changed.works[Object.keys(oldVideos)[0]].reason+=' unreviewed';
  assert.throws(()=>beforeSameSongAdoption(kind,changed),/complete post-same-song/);
  const partial=structuredClone(current);if(kind==='stageVideos')delete partial[targetIds[0]];else partial.works[targetIds[0]]=structuredClone(oldStatuses.works[targetIds[0]]);
  assert.throws(()=>beforeSameSongAdoption(kind,partial),/complete post-same-song/);
 }
 let preserved=0;for(const [id,old] of Object.entries(oldVideos))if(!replacementIds.includes(id)){assert.deepEqual(videos[id],old,'unchanged original video, score binding and history: '+id);preserved++;}
 assert.equal(preserved,500);assert.equal(receipt.all501PreviousObjectsUnchanged,false);
});

test('each real new slot has an independent empty binding, exact stable work/group and honest actual version without fallback chains',()=>{
 for(const id of targetIds){
  const stage=videos[id],f=stage.sameSongFallback,w=byId.get(id);assert.ok(w);assert.deepEqual(stage,receipt.addedSourceRows[id]);assert.equal(oldVideos[id],undefined);
  assert.ok(['music_program','practice_room','produced_performance'].includes(stage.selection.occasion));assert.ok(source.stageHasValidBinding(stage));assert.equal(stage.scoreBinding.initialScore,null);assert.equal(stage.scoreBinding.videoId,stage.videoId);assert.equal(stage.scoreBinding.sourceKey,source.stageSourceKey(stage));const check=receipt.ownerChecks.find(check=>check.targetIDs.includes(id));assert.ok(check);assert.equal(stage.scoreBinding.initializedAt,check.capturedAt);
  assert.deepEqual(stage.previousSources,[]);assert.equal(stage.audioEquivalence,undefined);
  if(!f){const selected=archivedInput(check).items.find(item=>item.recordId===id).selected;assert.ok(selected.versionMatch===true||selected.versionMatch==='exact');assert.equal(selected.sameSongFallback,undefined);assert.equal(stage.completeness,'full');assert.ok(![...coreTargetIds,...expectedExtraIds].includes(id));continue;}
  assert.equal(f.sameSong,true);assert.equal(f.targetWorkId,id);assert.ok(w.groupIds.includes(f.groupId));assert.equal(f.targetSong,w.song);assert.equal(f.performerScope,'full_group');assert.equal(f.originalPerformerScope,'full_group');assert.equal(f.completeness,stage.completeness);assert.equal(stage.likes.precision,'unknown');assert.doesNotMatch(stage.selectionNote,/最高|同曲同版本/);
  assert.equal(statuses.works[id].status,'verified');assert.ok(f.differences.length);for(const difference of f.differences)assert.ok(stage.verificationNote.includes(difference));
  if(f.sourceWorkId){const original=videos[f.sourceWorkId],originalWork=byId.get(f.sourceWorkId);assert.ok(original);assert.equal(original.sameSongFallback,undefined);assert.notEqual(f.sourceWorkId,id);assert.deepEqual(originalWork.groupIds,w.groupIds);assert.equal(f.performedSong,originalWork.song);assert.equal(source.stageSourceKey(stage),source.stageSourceKey(original));assert.deepEqual(original,receipt.replacementRows?.[f.sourceWorkId]?.after||oldVideos[f.sourceWorkId]);}
  else assert.ok(expectedExtraIds.includes(id),'the original nineteen must retain their exact already-bound source work');
 }
 const voltage=videos.recvxyOz5XkyEY;assert.equal(voltage.videoId,'1_sylBku10M');assert.equal(voltage.sameSongFallback.version,'exact');assert.equal(voltage.completeness,'excerpt');assert.match(voltage.verificationNote,/2:49.*3:41/);
 const doremi=videos.recvxyH5pzFAPL;assert.equal(doremi.videoId,'WWvGUnPKeAg');assert.match(doremi.title,/Dance Society/);assert.equal(doremi.completeness,'full');assert.equal(doremi.sameSongFallback.version,'different');assert.equal(doremi.sameSongFallback.sourceWorkId,undefined);assert.notEqual(doremi.videoId,oldVideos.recvxyH5pz2rmf.videoId);
 assert.equal(videos.recvxyOz5X7Tw7,undefined,'FEARLESS historical-roster mismatch remains unresolved');
 const versionCounts=targetIds.map(id=>videos[id].sameSongFallback).filter(Boolean).reduce((counts,f)=>(counts[f.version]=(counts[f.version]||0)+1,counts),{});assert.deepEqual(versionCounts,{different:22,exact:1,unconfirmed:3});
 assert.deepEqual(targetIds.filter(id=>videos[id].sameSongFallback?.version==='unconfirmed').sort(),[...unknownVersionIds].sort());for(const id of unknownVersionIds){assert.match(videos[id].verificationNote,/具体录音版本未核/);assert.match(videos[id].kind,/版本未核/);assert.doesNotMatch(videos[id].kind,/不同版本/);}
 const replacement=receipt.replacementRows.recvxyHuKM4BvC;assert.deepEqual(replacement.before,oldVideos.recvxyHuKM4BvC);assert.deepEqual(replacement.after,videos.recvxyHuKM4BvC);assert.equal(replacement.after.videoId,'HEiiTiLCymg');assert.equal(replacement.after.selection.occasion,'music_program');assert.equal(replacement.after.sameSongFallback,undefined);
 const history=replacement.after.previousSources.at(-1),prior=structuredClone(history);for(const key of ['changedAt','reason','preference','previousOccasionReview'])delete prior[key];const expectedPrior=structuredClone(replacement.before);delete expectedPrior.previousSources;assert.deepEqual(prior,expectedPrior);assert.deepEqual(replacement.after.previousSources.slice(0,-1),replacement.before.previousSources||[]);assert.equal(history.preference,'excluded_historical_occasion');assert.equal(history.previousOccasionReview.occasion,'studio_live');assert.equal(history.previousOccasionReview.previousVideoId,replacement.before.videoId);assert.equal(history.previousOccasionReview.previousSha256,'5c1c21751994bf09686789ffa73399bae4cfb00a3473bebd087ce09f509d95a8');
});

test('every actual merge batch has fresh owner empty-score, complete-journal and exact published preimage receipts with no private write or deployment',()=>{
 assert.equal(receipt.privateWrites,0);assert.equal(receipt.deployments,0);
 const results=Object.entries(receipt).filter(([key,value])=>(key==='mergeResult'||key.endsWith('MergeResult'))&&value&&Array.isArray(value.sourceIds)).map(([,value])=>value);
 assert.ok(Array.isArray(receipt.ownerChecks));assert.ok(receipt.ownerChecks.length>=4);assert.equal(results.length,receipt.ownerChecks.length);
 const mergedIds=[],replacedIds=[];
 for(const result of results){assert.equal(result.newSources,result.sourceIds.length);mergedIds.push(...result.sourceIds);replacedIds.push(...result.replacedUnscoredSources);assert.deepEqual(result.retainedExistingSources,[]);assert.deepEqual(result.retiredUnpublishedUnverifiedSources,[]);assert.deepEqual(result.updatedSameVideoMetadata,[]);assert.equal(result.updatedOtherStates,0);const check=receipt.ownerChecks.find(check=>check.batch===result.batch);assert.ok(check);assert.equal(result.freshPreimageAt,check.capturedAt);assert.deepEqual([...result.sourceIds,...result.replacedUnscoredSources].sort(),[...check.targetIDs].sort());}
 assert.deepEqual(mergedIds.sort(),[...targetIds].sort());assert.deepEqual(replacedIds.sort(),[...replacementIds].sort());
 const covered=[],captures=new Map();
 for(const check of receipt.ownerChecks){
  const replaces=check.targetIDs.some(id=>replacementIds.includes(id));assert.ok(check.ageSeconds>=0&&check.ageSeconds<check.freshnessLimitSeconds);assert.equal(check.freshnessLimitSeconds,replaces?300:900);assert.match(check.sha256,/^[a-f0-9]{64}$/);assert.equal(check.targetScoresAllNull,true);assert.equal(check.zeroNotEmpty,true);assert.equal(check.targetJournalRows,0);assert.equal(check.allPublishedPreimagesMatch,true);assert.equal(check.publishedSourceCount,500);assert.equal(check.completeJournalRows,206);assert.equal(check.privateWrites,0);covered.push(...check.targetIDs);
  if(captures.has(check.capturedAt))assert.equal(check.sha256,captures.get(check.capturedAt),'the same captured export cannot change identities');else captures.set(check.capturedAt,check.sha256);
  if(replaces){assert.equal(check.replacementExactPublishedPreimage,true);assert.equal(check.newTargetPublishedPreimagesAbsent,true);assert.equal(check.privateBackupOutsideRepository,true);assert.equal(videos.recvxyHuKM4BvC.scoreBinding.initializedAt,check.capturedAt);assert.equal(videos.recvxyHuKM4BvC.scoreBinding.initialScore,null);}else{assert.equal(check.targetPublishedPreimagesAbsent,true);if(check.capturedAt===receipt.owner.capturedAt)assert.equal(check.sha256,receipt.owner.sha256);}
  if(check.priorUnpublishedReplacementSeparatelyReconciled)assert.deepEqual(check.priorUnpublishedReplacementSeparatelyReconciled,replacementIds);
  const archived=archivedInput(check);assert.deepEqual(archived.items.map(item=>item.recordId).sort(),[...check.targetIDs].sort());for(const item of archived.items){assert.equal(item.selected.videoId,videos[item.recordId].videoId);assert.deepEqual(item.selected.sameSongFallback,videos[item.recordId].sameSongFallback);if(item.selected.sameSongFallback?.version==='unconfirmed')assert.equal(item.selected.versionMatch,false);}
 }
 assert.deepEqual(covered.sort(),[...targetIds,...replacementIds].sort());assert.equal(new Set(covered).size,targetIds.length+replacementIds.length);assert.equal(receipt.owner.storedOutsideRepository,true);assert.equal(receipt.owner.completeWorks,614);assert.equal(receipt.owner.publishedSources,500);assert.deepEqual(receipt.owner.journalStatuses,{done:206});assert.equal(receipt.owner.localOnlyPreserved,'recvxyHuKM2Gwu');assert.equal(receipt.owner.targetEmptyScoresExcludingZero,21);
 assert.equal(sha(fs.readFileSync(path.join(repo,receipt.preparedBatch))),receipt.preparedBatchSha256);
});

test('actual adoption preserves all snapshot identities, personal fields and owner save/access implementations from its immutable baseline',()=>{
 for(const relative of ['data/snapshot.json','data/stages/inventory.json']){
  const prior=cp.execFileSync('git',['show',`${receipt.baselineCommit}:apps/idol-site/${relative}`],{cwd:repo,maxBuffer:32*1024*1024});assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,relative))),JSON.parse(prior),relative+' stable IDs, original images, relations and saved fields');
 }
 for(const relative of ['lib/idol/native-save.ts','lib/idol/save.ts','lib/idol/public-access.ts']){
  const prior=cp.execFileSync('git',['show',`${receipt.baselineCommit}:apps/idol-site/${relative}`],{cwd:repo});assert.equal(sha(fs.readFileSync(path.join(root,relative))),sha(prior),relative+' owner authorization and save behavior');
 }
 assert.equal(inventory.length,614);assert.equal(new Set(inventory.map(w=>w.recordId)).size,614);
});

test('every actual adopted source survives anonymous projection and renders its real differences and source-bound score notice without private evidence',()=>{
 for(const id of targetIds){
  const stage=structuredClone(videos[id]);if(stage.sameSongFallback){stage.sameSongFallback.reason='PRIVATE_RESEARCH';stage.sameSongFallback.evidence.note='PRIVATE_OWNER';stage.sameSongFallback.evidence.token='PRIVATE_TOKEN';}
  const work={id,groupIds:byId.get(id).groupIds,stage,score:0,stageScore:0,note:'PRIVATE_NOTE',watched:'已观看',ratingIds:['recPRIVATE_RELATION']},before=structuredClone(work);
  const view=projectPublicCatalog({works:[work],members:[],ratings:[],groups:[],counts:{}}).works[0];assert.deepEqual(work,before);assert.equal(source.stageSourceKey(view.stage),source.stageSourceKey(stage));assert.ok(source.stageHasValidBinding(view.stage));assert.doesNotMatch(JSON.stringify(view.stage),/PRIVATE/);assert.equal(view.note,work.note);assert.deepEqual(view.ratingIds,work.ratingIds);
  const html=renderToStaticMarkup(React.createElement(StageSameSongFallback,{stage:view.stage}));assert.doesNotMatch(html,/<form|<input|PRIVATE/);
  if(stage.sameSongFallback){assert.deepEqual(view.stage.sameSongFallback.evidence,{note:'',urls:[]});assert.match(html,/同曲后备/);assert.match(html,/当前评分仅对应这支视频/);for(const difference of stage.sameSongFallback.differences)assert.ok(html.includes(difference.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')));if(stage.completeness==='excerpt')assert.match(html,/节选/);if(stage.sameSongFallback.version==='different')assert.match(html,/不同版本/);if(stage.sameSongFallback.version==='unconfirmed'){assert.equal(view.stage.sameSongFallback.version,'unconfirmed');assert.match(html,/版本未核/);assert.match(html,/具体录音版本未核/);assert.match(html,/是否使用同一录音尚未核实/);assert.doesNotMatch(html,/不同版本|精确匹配/);}}
  else assert.equal(html,'');
  assert.equal(source.stageHasValidBinding({...view.stage,scoreBinding:{...view.stage.scoreBinding,sourceKey:'changed-source-key'}}),false);
 }
});
