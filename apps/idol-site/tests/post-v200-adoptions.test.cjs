const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=require('node:path').resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));
const baseline=p=>JSON.parse(execFileSync('git',['show','c02315392c4b2912883d63745eba876221c43b34:apps/idol-site/'+p],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024}));
const receipt=read('../../docs/codex/evidence/20261028-post-v200/stages-b/adoption.json');
const {beforePostV200Stages,beforePostV200StageStatuses}=require('./helpers/post-v200-stages.cjs');
const {beforeGroupAdvanceTimelineRecords}=require('./helpers/group-advance-evidence.cjs');

test('four documented stage changes preserve all other sources and statuses through exact preimages',()=>{
 const sources=read('data/stage-videos.json'),status=read('data/stages/status.json');
 assert.deepEqual(beforePostV200Stages(sources),baseline('data/stage-videos.json'));
 assert.deepEqual(beforePostV200StageStatuses(status),baseline('data/stages/status.json'));
 const memberReceipt=read('../../docs/codex/evidence/20261028-post-v200/stages-a/member-version-adoption.json');
 assert.equal(memberReceipt.newSources,1);assert.equal(memberReceipt.sourceCount,496);
 assert.equal(memberReceipt.changes[0].ownerStageScoreEmpty,true);assert.equal(memberReceipt.changes[0].ownerSaveJournalHasRecord,false);
 const member=sources.recvxyOz5XJWXT;assert.equal(member.videoId,'OsPt0BY1_Wk');assert.equal(member.memberVersionFallback.differenceType,'guest_scope');assert.match(member.kind,/成员版/);assert.match(member.verificationNote,/客串/);
 assert.equal(member.scoreBinding.initializedAt,memberReceipt.freshPreimageAt);
 assert.equal(receipt.newSources,2);assert.equal(receipt.replacementSources,1);assert.equal(receipt.privateWrites,0);
 const fixed=sources.recvxyOz5XHEju,old=receipt.changes.find(r=>r.recordId==='recvxyOz5XHEju').before;
 assert.equal(fixed.videoId,'y4Tr8LE5yV4');assert.equal(fixed.selection.camera.mode,'fixed');
 const archived={...fixed.previousSources.at(-1)};for(const key of ['changedAt','reason','preference','previousOccasionReview'])delete archived[key];
 const expectedOld={...old};delete expectedOld.previousSources;assert.deepEqual(archived,expectedOld);
});

test('new exact-video posters preserve original bytes and all previous posters',()=>{
 const data=read('data/stage-selection-posters-20261027.json'),old=baseline('data/stage-selection-posters-20261027.json');
 assert.deepEqual(data.entries.slice(0,old.entries.length),old.entries);
 const added=data.entries.slice(old.entries.length);assert.equal(added.length,4);
 for(const row of added){const bytes=fs.readFileSync(root+'/public'+row.src);assert.equal(bytes.length,row.byteLength);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.equal(row.originalBytesPreserved,true);assert.deepEqual(row.intrinsicSize,{width:1280,height:720});assert.equal(read('data/stage-videos.json')[row.workId].videoId,row.videoId);}
});

test('UDTT earlier interview adjusts only reporting evidence without inventing effective dates or identities',()=>{
 const current=beforeGroupAdvanceTimelineRecords(read('data/timeline-reported-records.json')),before=baseline('data/timeline-reported-records.json');
 const change=read('../../docs/codex/evidence/20261028-post-v200/statistics/udtt-source-adoption.json'),row=current.records.find(r=>r.eventId===change.after.eventId);
 assert.deepEqual(row,change.after);assert.equal(row.recordDate,'2025-04-30');assert.equal(row.eventDate,null);assert.deepEqual(row.memberIds,change.expectedBefore.memberIds);
 assert.match(row.boundary,/生效日期未确认/);assert.match(row.summary,/不证明临时或永久合同/);
 const restored=structuredClone(current);restored.records[restored.records.findIndex(r=>r.eventId===row.eventId)]=change.expectedBefore;
 assert.deepEqual(restored,before);
});
