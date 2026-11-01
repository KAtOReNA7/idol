const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const policy=require('../../../docs/codex/evidence/20261101-closeout/closure.json');
const receipt=require('../../../docs/codex/evidence/20261101-closeout/public-adoption.json');
const {beforeCloseoutPublic,beforeCloseoutGuard}=require('./helpers/closeout-baseline.cjs');
test('closed zero policy preserves observed unknowns and actual date semantics across shared and native projections',()=>{
 const stats=load('lib/idol/group-information.mjs'),reports=load('lib/idol/timeline/reported-records.mjs');
 const canonical=require('../data/timeline-reported-records.json');
 for(const c of policy.statistics){assert.equal(stats.groupInformationModel(c.group).sales.observedValue,null);assert.match(stats.renderGroupInformation(c.group),/0<em>张/);assert.equal(c.taskStatus,'closed-user-fallback');}
 for(const c of policy.dates){
  const old=canonical.records.find(r=>r.eventId===c.eventId),out=reports.reportedTimelineRecords(c.slug,old.groupId).find(r=>r.eventId===c.eventId);
  assert.equal(out.eventDate,null);assert.equal(out.recordDate,c.recordDate);assert.equal(out.dateResolution,'closed-display-zero');assert.match(out.boundary,/日期：0（未查得）/);
  assert.equal(reports.reportedTimelineRecords(c.slug,'wrong-group').length,0);assert.equal(old.dateResolution,undefined);
 }
 assert.equal(stats.groupInformationModel('triples').sales.observedValue,2118570);
});
test('only exact appended promotional rows changed; originals, private fields, stats and 527 stage bindings unchanged',()=>{
 for(const [name,c] of Object.entries(receipt.collections)){
  const now=require('../data/'+name);assert.equal(now.records.length,108);assert.equal(beforeCloseoutPublic(name,now).records.length,107);
  const bad=structuredClone(now);bad.records[0].note+='tamper';assert.throws(()=>beforeCloseoutPublic(name,bad),/complete reviewed closeout/);
 }
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const [name,sha] of Object.entries(receipt.protectedFiles)){
  let bytes=fs.readFileSync(path.join(__dirname,'..',name));
  if(name==='data/stage-videos.json')bytes=Buffer.from(JSON.stringify(require('./helpers/gnarly-adoption-baseline.cjs').beforeGnarly('stageVideos',JSON.parse(bytes)),null,2)+'\n');
  assert.equal(hash(bytes),sha,name);
 }
 for(const p of receipt.addedRecognition.portraits)assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);
 beforeCloseoutGuard(require('../scripts/udtt-private-build-assets-manifest.json'));
});
test('four named promotional appearances never imply full MV cast, recording, or editable ratings',()=>{
 const api=load('lib/idol/public-work-credits.ts'),photos=load('lib/idol/public-work-recognition.ts');
 const c=receipt.addedCredit,w={id:c.workId,groupIds:[c.groupId],url:'https://www.youtube.com/watch?v='+c.videoId};
 assert.deepEqual(api.publicCreditForWork(w),c);assert.match(c.note,/9秒宣传短片/);assert.match(c.note,/不等同完整MV演员表/);assert.match(c.note,/未核实逐人录音/);
 assert.equal(photos.publicWorkRecognition(w).length,4);
 assert.equal(api.publicCreditForWork({...w,url:'https://www.youtube.com/watch?v=wrongvideo1'}),null);
 assert.equal(api.publicCreditsForMember({works:[w],ratings:[{memberIds:[c.memberIds[0]],workIds:[w.id],score:0}]},c.memberIds[0]).length,0);
 const ledger=require('../../../docs/codex/evidence/20261101-closeout/remaining-stage-ledger.json');assert.deepEqual(ledger.classifiedRemaining,{newStages:78,legacyReplacements:11,personFacts:23,unknownMetrics:0,effectiveDates:0,salesDifference:0,photoItems:0,total:112});
});
