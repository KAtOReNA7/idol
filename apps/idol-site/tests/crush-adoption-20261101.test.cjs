const test=require('node:test'),assert=require('node:assert/strict');
const {beforeCrush,receipt}=require('./helpers/crush-adoption-baseline.cjs');
const stages=require('../data/stage-videos.json'),statuses=require('../data/stages/status.json');
const load=require('./helpers/public-artist-loader.cjs'),id=receipt.workId;
test('CRUSH exact P2 replacement preserves every other source and full previous history',()=>{
 const old=beforeCrush('stageVideos',stages);beforeCrush('stageStatuses',statuses);
 assert.equal(Object.keys(stages).length,527);assert.equal(Object.keys(stages).filter(k=>k!==id&&JSON.stringify(old[k])===JSON.stringify(stages[k])).length,526);
 const s=stages[id];assert.equal(old[id].videoId,'crGAr4NQRa4');assert.equal(s.scoreBinding.sourceKey,'bilibili:BV1JctKeyEgw:cid:25864110751:p:2');assert.equal(s.clip,undefined);assert.equal(s.bilibili.page,2);
 const h=structuredClone(s.previousSources.at(-1));for(const key of ['changedAt','reason','preference','previousOccasionReview'])delete h[key];
 const prev=structuredClone(old[id]);delete prev.previousSources;assert.deepEqual(h,prev);assert.deepEqual(s.previousSources.slice(0,-1),old[id].previousSources||[]);
 const changed=structuredClone(stages);changed[id].bilibili.page=1;assert.throws(()=>beforeCrush('stageVideos',changed),/complete reviewed/);
 const source=load('lib/idol/stage-source.ts');assert.ok(source.stageHasValidBinding(s));assert.equal(source.stageSourceKey(s),s.scoreBinding.sourceKey);
 assert.equal(load('lib/idol/approved-video-poster.ts').approvedVideoPoster(id,s.videoId,'stage'),null,'no old festival image for P2');
});
test('CRUSH genuine receipt and current queue record completed replacement without deployment',()=>{
 const p=receipt.ownerProtection;assert.ok(p.ageSecondsAtCheck>=0&&p.ageSecondsAtCheck<300);assert.equal(p.works,614);assert.equal(p.journal,206);assert.equal(p.journalTargetCount,0);assert.equal(p.targetEmptyScore,true);assert.equal(p.privateWrites,0);assert.equal(receipt.deployment,false);
 const q=require('../../../docs/codex/evidence/20261101-crush-adoption/remaining-stage-ledger.json');assert.equal(q.classifiedRemaining.total,110);assert.equal(q.legacyReplacementsRemaining.length,9);assert.ok(!q.legacyReplacementsRemaining.some(r=>r.workId===id));
});
