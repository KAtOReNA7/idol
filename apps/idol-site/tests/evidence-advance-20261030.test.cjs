const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Module=require('node:module');
const load=require('./helpers/public-artist-loader.cjs');
const {stageResearchFollowup,applyStageResearchFollowups}=load('lib/idol/stage-research-followups.ts');
const {projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const rows=require('../data/stages/research-followups-20261030.json').records;
const fixture=r=>({id:r.workId,groupIds:[r.groupId],url:'https://www.youtube.com/watch?v='+r.videoId,stage:null,placeholder:null,stageSupplement:{alternatives:[],watchLeads:[]},ratingIds:['recPRIVATE_RELATION'],score:0,stageScore:0,note:'PRIVATE_SYNTHETIC',watched:'已观看'});
test('four reviewed notes require exact persistent work, group and MV; newly adopted stages do not receive stale holds',()=>{
 assert.equal(rows.length,4);for(const row of rows){const w=fixture(row);assert.deepEqual(stageResearchFollowup(w),row.note);
 for(const patch of [{id:'recOTHER'},{groupIds:['recOTHER']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{placeholder:{reason:'placeholder'}},{stage:{videoId:'abcdefghijk'}}]){const wrong={...w,...patch};assert.equal(stageResearchFollowup(wrong),null);assert.equal(applyStageResearchFollowups(wrong),wrong);}}
});
test('notes append without changing personal fields, relations or source identities, and applying twice is idempotent',()=>{
 for(const row of rows){const w=fixture(row),before=structuredClone(w),out=applyStageResearchFollowups(w);assert.deepEqual(w,before);assert.deepEqual({...out,stageSupplement:w.stageSupplement},w);assert.deepEqual(out.stageSupplement.alternatives,w.stageSupplement.alternatives);assert.equal(applyStageResearchFollowups(out),out);assert.equal(out.stageScore,0);}
});
test('existing evidence is preserved, safe sources are deduplicated and invalid merged disclosures are withheld',()=>{
 const w=fixture(rows[0]),old={summary:'原有待核说明。',sources:rows[0].note.sources};w.stageSupplement.researchNote=old;const out=applyStageResearchFollowups(w);assert.ok(out.stageSupplement.researchNote.summary.startsWith(old.summary));assert.equal(out.stageSupplement.researchNote.sources.length,1);assert.equal(w.stageSupplement.researchNote,old);
 const oversized={...w,stageSupplement:{alternatives:[],researchNote:{summary:'x'.repeat(1200),sources:old.sources}}};assert.equal(applyStageResearchFollowups(oversized),oversized);
});
test('program schedules, reported performances and limited recording roles remain distinct from full-video verification',()=>{
 assert.match(rows[0].note.summary,/预告/);assert.match(rows[1].note.summary,/官网公告本身未列曲名/);assert.match(rows[2].note.summary,/有限录音资料/);assert.match(rows[2].note.summary,/不是完整MV出镜名单/);assert.doesNotMatch(rows[2].note.summary,/JUNHWI|SHUIE|七人完整/);
});
test('real anonymous projection and StageSupplements SSR render collapsed source notes without a player, editable fields or private text',()=>{
 const src=fs.readFileSync('app/page.tsx','utf8'),start=src.indexOf('function StageSupplements('),end=src.indexOf('function PageTitle(',start),out={};const code=ts.transpileModule('export '+src.slice(start,end),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext('(function(exports){'+code+'})',{React,ArrowUpRight:()=>null,platformLabel:{youtube:'YouTube'},...load('lib/idol/stage-source.ts'),...load('lib/idol/stage-public-research.ts'),...load('lib/idol/product-copy.ts')})(out);
 for(const row of rows){const work=applyStageResearchFollowups(fixture(row));const projected=projectPublicCatalog({works:[work],members:[],ratings:[]}).works[0];const html=renderToStaticMarkup(React.createElement(out.StageSupplements,{work:projected}));assert.match(html,/<details class="caption-help stage-research-note">/);assert.doesNotMatch(html,/<details[^>]* open|<iframe|<input|<form|PRIVATE_SYNTHETIC/);assert.match(html,/不用于本条舞台评分/);for(const s of row.note.sources)assert.ok(html.includes(s.url.replaceAll('&','&amp;')));}
});
// Actual catalog harness, without substituting its projection or source records.
const file=path.join(__dirname,'core.test.cjs'),prefix=fs.readFileSync(file,'utf8').split("test('snapshot counts")[0];
const body=`
test('actual projectCatalog hides disclosures for formally adopted works while preserving remaining prepared notes, sources and original relations',()=>{
 const newRows=require('../data/stages/research-followups-20261030.json').records,stages=load('lib/idol/stage.ts'),recent=require('./helpers/same-song-adoption-baseline.cjs');assert.equal(cat.works.filter(w=>w.stage).length,501+recent.targetIds.length);assert.equal(cat.groups.length,51);
 for(const row of newRows){const w=cat.works.find(w=>w.id===row.workId);if(w.id==='recvxyHuKM2Gwu'||recent.targetIds.includes(w.id)){assert.deepEqual(w.stage,stages.stageForWork(w.id));assert.equal(w.stageSupplement.researchNote,undefined);}else{assert.equal(w.stage,null);assert.equal(w.stageSupplement.researchNote.summary,row.note.summary);}const raw=snapshot.tables.works.records.find(r=>r.recordId===w.id).fields;assert.equal(w.score,asNumber(raw[F.works.score]));assert.equal(w.stageScore,asNumber(raw[F.works.stageScore]));assert.deepEqual(Array.from(w.ratingIds),snapshot.tables.ratings.records.filter(r=>asIds(r.fields[F.ratings.works]).includes(w.id)).map(r=>r.recordId));}
 for(const w of cat.works)if(w.stage)assert.deepEqual(w.stage,stages.stageForWork(w.id));
});`;
const m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(prefix+body,file);

test('historical status restoration is idempotent only for the complete reviewed preimage; tampering still fails',()=>{
 const {beforePassword,receipt}=require('./helpers/password-formal-baseline.cjs'),crypto=require('node:crypto');const current=require('../data/stages/status.json'),before=beforePassword('stageStatuses',current);assert.equal(crypto.createHash('sha256').update(JSON.stringify(before,null,2)+'\n').digest('hex'),receipt.stageStatuses.beforeFileSha256);assert.deepEqual(beforePassword('stageStatuses',before),before);const changed=structuredClone(before);changed.updatedAt='2026-10-30T00:00:00Z';assert.throws(()=>beforePassword('stageStatuses',changed),/post-QWER status/);
});

test('Touchdown adds only the exact OST/making distinction and preserves all earlier disclosure bytes without inferring absence or participants',()=>{
 const current=require('../data/stages/research-followups-20261030.json'),receipt=require('../../../docs/codex/evidence/20261030-touchdown-form/read-only-disclosure.json'),crypto=require('node:crypto');
 const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x,null,2)+'\n').digest('hex');
 assert.equal(hash(current),receipt.afterSha256);const before=structuredClone(current);assert.deepEqual(before.records.pop(),receipt.addedRow);assert.equal(hash(before),receipt.beforeSha256);
 const note=receipt.addedRow.note;assert.match(note.summary,/出镜范围尚未核实/);assert.match(note.summary,/不能据花絮反推原MV出镜/);assert.match(note.summary,/不能将其当作完整舞台/);
 assert.equal(note.sources[1].url,'https://www.youtube.com/watch?v=7ioDkpjgZbo');assert.doesNotMatch(JSON.stringify(note),/confirmed-no-members|五名成员全部|LILY|JINNI/);
 for(const key of ['memberIds','ratingIds','score','sourceKey','versionMatch'])assert.equal(key in receipt.addedRow,false);
 assert.equal(receipt.publicParticipantRowsAdded,0);assert.equal(receipt.memberAbsenceRulesAdded,0);assert.equal(receipt.formalStageAdoptions,0);
});

test('IVE adoption preserves the full 500-source preimage and rejects changed P1 identities or histories',()=>{
 const {beforeIveEleven,receipt}=require('./helpers/ive-eleven-formal-baseline.cjs'),beforeSameSong=require('./helpers/same-song-adoption-baseline.cjs').beforeSameSongAdoption,videos=beforeSameSong('stageVideos',require('../data/stage-videos.json')),statuses=beforeSameSong('stageStatuses',require('../data/stages/status.json')),source=load('lib/idol/stage-source.ts');assert.equal(Object.keys(videos).length,501);assert.equal(Object.keys(beforeIveEleven('stageVideos',videos)).length,500);beforeIveEleven('stageStatuses',statuses);const stage=videos[receipt.workId];assert.ok(source.stageHasValidBinding(stage));assert.equal(source.stageSourceKey(stage),'bilibili:BV19D4y1r7c6:cid:867429881:p:1');assert.equal(source.stageHasValidBinding({...stage,bilibili:{cid:'1362461313',page:2},url:'https://www.bilibili.com/video/BV19D4y1r7c6/?p=2&cid=1362461313'}),false);const changed=structuredClone(videos);changed[receipt.workId].title+=' changed';assert.throws(()=>beforeIveEleven('stageVideos',changed),/complete post-IVE/);assert.equal(receipt.owner.targetJournalRows,0);assert.ok(receipt.owner.ageSeconds<900);assert.equal(receipt.privateWrites,0);
});

test('every unresolved work points back to the same work in the immutable previous queue',()=>{
 const q=require('../../../docs/codex/evidence/20261030-evidence-advance/remaining-stage-ledger.json'),previous=require('../../../docs/codex/evidence/20261029-next-followup/remaining-stage-ledger.json');assert.equal(q.records.length,104);assert.equal(q.classifiedRemaining.total,154);assert.equal(q.legacyReplacementsRemaining.length,11);for(const r of q.records)assert.equal(previous.records[r.previousRecordIndex].workId,r.workId);
});

test('Sprinkle Party exact-MV crew credits preserve previous rows and never become member or director credits',()=>{
 const data=require('../data/public-production-credits.json'),receipt=require('../../../docs/codex/evidence/20261030-evidence-advance/sprinkle-production-adoption.json'),crypto=require('node:crypto'),project=load('lib/idol/public-production-credits.ts').publicProductionForWork;const before=structuredClone(data);assert.deepEqual(before.records.pop(),receipt.addedRow);before.checkedAt=receipt.beforeCheckedAt;assert.equal(crypto.createHash('sha256').update(JSON.stringify(before,null,2)+'\n').digest('hex'),receipt.beforeFileSha256);const w={id:receipt.workId,groupIds:['recvxyEBDZOpTf'],url:receipt.sourceUrl};const row=project(w);assert.equal(row.credits.length,3);assert.ok(row.credits.some(x=>x.name.includes('STUDIO T.A.M')));assert.doesNotMatch(JSON.stringify(row.credits),/导演|LILY|JINNI/);assert.equal(project({...w,url:'https://www.youtube.com/watch?v=XSpYaEdpKxY'}),null);assert.equal(row.memberIds,undefined);
});
