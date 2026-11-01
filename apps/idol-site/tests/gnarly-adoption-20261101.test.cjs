const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {beforeGnarly,receipt,hash}=require('./helpers/gnarly-adoption-baseline.cjs');
const load=require('./helpers/public-artist-loader.cjs'),root=path.resolve(__dirname,'..');
const stages=require('../data/stage-videos.json'),statuses=require('../data/stages/status.json');
const source=load('lib/idol/stage-source.ts'),rid=receipt.workId;

test('Gnarly replacement restores complete prior 527-source collections and rejects any unrelated edit',()=>{
 assert.equal(Object.keys(stages).length,527);
 for(const [kind,current] of [['stageVideos',stages],['stageStatuses',statuses]]){
  const before=beforeGnarly(kind,current);assert.deepEqual(beforeGnarly(kind,before),before);
  const changed=structuredClone(current),key=Object.keys(stages).find(k=>k!==rid);
  if(kind==='stageVideos')changed[key].title+='changed';else changed.works[key].reason+='changed';
  assert.throws(()=>beforeGnarly(kind,changed),/complete reviewed post-Gnarly/);
 }
 const old=beforeGnarly('stageVideos',stages);assert.equal(old[rid].videoId,'Rz47IBr1GXM');
 assert.equal(hash(old),require('../../../docs/codex/evidence/20261101-closeout/public-adoption.json').protectedFiles['data/stage-videos.json']);
 assert.equal(Object.keys(stages).filter(k=>k!==rid&&JSON.stringify(stages[k])===JSON.stringify(old[k])).length,526);
 const history=stages[rid].previousSources.at(-1),restored=structuredClone(history);
 for(const key of ['changedAt','reason','preference','previousOccasionReview'])delete restored[key];
 const previous=structuredClone(receipt.previousSource);delete previous.previousSources;assert.deepEqual(restored,previous);
 assert.deepEqual(stages[rid].previousSources.slice(0,-1),receipt.previousSource.previousSources||[]);
 assert.equal(history.previousOccasionReview.occasion,'festival');
});

test('real receipt records fresh owner protection and exact confirmed practice scope without score transfer',()=>{
 const check=receipt.ownerProtection,s=stages[rid];assert.ok(check.ageSecondsAtCheck>=0&&check.ageSecondsAtCheck<300);
 assert.equal(check.works,614);assert.equal(check.journal,206);assert.equal(check.journalTargetCount,0);assert.equal(check.targetEmptyScore,true);
 assert.equal(check.publishedSources,500);assert.equal(check.publishedMatchesReviewedPreimage,true);assert.equal(check.privateWrites,0);
 assert.deepEqual(receipt.importerResult.replacedUnscoredSources,[rid]);assert.deepEqual(receipt.importerResult.retainedExistingSources,[]);
 assert.equal(s.videoId,'xrm7PP1mbtI');assert.equal(s.selection.occasion,'practice_room');assert.equal(s.completeness,'full');assert.equal(s.sameSongFallback,undefined);
 assert.equal(s.scoreBinding.initialScore,null);assert.equal(s.scoreBinding.initializedAt,check.capturedAt);assert.equal(source.stageSourceKey(s),'xrm7PP1mbtI');assert.ok(source.stageHasValidBinding(s));
 assert.match(s.verificationNote,/首尾完整、六人参与、音轨版本一致/);assert.match(s.selection.evidence.note,/代理未独立全程播放/);assert.equal(s.likes.precision,'unknown');assert.doesNotMatch(s.selectionNote,/最高/);
 const q=require('../../../docs/codex/evidence/20261101-gnarly-adoption/remaining-stage-ledger.json');assert.equal(q.legacyReplacementsRemaining.length,10);assert.equal(q.classifiedRemaining.total,111);assert.ok(!q.legacyReplacementsRemaining.some(r=>r.workId===rid));
});

test('new original poster matches only the exact practice tuple and preserves the old editorial art',()=>{
 const api=load('lib/idol/approved-video-poster.ts'),p=require('../data/stage-gnarly-poster-20261101.json').entries[0];
 assert.equal(p.workId,rid);assert.equal(p.videoId,stages[rid].videoId);assert.deepEqual(p.intrinsicSize,{width:1280,height:720});
 const bytes=fs.readFileSync(path.join(root,'public',p.src));assert.equal(bytes.length,p.byteLength);assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);
 assert.equal(api.approvedVideoPoster(rid,p.videoId,'stage').src,p.src);assert.equal(api.approvedVideoPoster(rid,p.videoId,'stage').fit,'contain');
 assert.equal(api.approvedVideoPoster(rid,p.videoId,'mv'),null);assert.equal(api.approvedVideoPoster('wrong-work',p.videoId,'stage'),null);
 assert.equal(api.approvedVideoPoster(rid,'Rz47IBr1GXM','stage'),null);
 assert.ok(fs.readFileSync(path.join(root,'lib/idol/katseye-editorial.ts'),'utf8').includes('Rz47IBr1GXM'));
});
