const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {applyReviewedWorkMetadata}=load('lib/idol/reviewed-work-metadata.ts');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {memberWorks,memberWorkSummary}=load('lib/idol/member-works.ts');
const {sevenDesigns}=load('components/seven-redesign/catalog.ts');
const credits=require('../data/public-work-credits.json').records;
const hurricane=()=>({id:'rec28ldfRTrEng',groupIds:['rec28ldfRTiD0h'],song:'HURRICANE',url:'',score:0,stageScore:null,note:'synthetic private note',watched:'synthetic',ratingIds:[],version:'unconfirmed',stage:null});
const credited=row=>({id:row.workId,groupIds:[row.groupId],url:'https://www.youtube.com/watch?v='+row.videoId,score:null,stageScore:null,ratingIds:[],song:'synthetic',name:'synthetic'});

test('official timeline corrections preserve historical bytes, exact identities and date precision',()=>{
 const evidence=require('../../../docs/codex/evidence/20261025-data-completion/timeline-evidence.json');
 const {validateTimeline}=load('lib/idol/timeline/validate.ts');
 const {F}=load('lib/idol/fields.ts'),{asIds}=load('lib/idol/values.ts'),raw=require('../data/snapshot.json').tables;
 const context={groups:require('../data/artist-timeline-registry.json'),members:raw.members.records.map(r=>({id:r.recordId,groupIds:asIds(r.fields[F.members.groups])})),works:raw.works.records.map(r=>({id:r.recordId,groupIds:asIds(r.fields[F.works.groups])}))};
 for(const [slug,date,precision] of [['idle','2024-12','month'],['newjeans','2022-07-22','day']]){
  const bytes=fs.readFileSync('data/artist-timelines/'+slug+'.json'),doc=JSON.parse(bytes),correction=evidence[slug];
  const validation=validateTimeline(doc,context);assert.equal(validation.ok,true,JSON.stringify(validation.issues));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),correction.afterDocumentSha256);
  const event=doc.events.find(e=>e.id===correction.eventId);
  assert.equal(event.reviewStatus,'ready');assert.equal(event.status,'confirmed');
  assert.deepEqual(event.eventDate,{value:date,precision});assert.equal(event.announcementDate,null);assert.equal(event.plannedDate,null);
  assert.deepEqual(event.workIds,correction.before.workIds);assert.deepEqual(event.memberIds,correction.before.memberIds);
  assert.deepEqual(event.sources.slice(0,-1),correction.before.sources);assert.equal(event.sources.at(-1).checkedAt,'2026-10-25');
  const restored={...doc,events:doc.events.map(e=>e.id===event.id?correction.before:e),gaps:correction.beforeGaps};
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(restored,null,2)+'\n').digest('hex'),correction.beforeDocumentSha256);
 }
});

test('owner-confirmed HURRICANE gets its exact MV without mutating original rows or personal values',()=>{
 const original=hurricane(),before=JSON.stringify(original),result=applyReviewedWorkMetadata(original);
 assert.equal(result.url,'https://www.youtube.com/watch?v=00tUzCOPI6g');assert.equal(result.version,'Music Video');
 for(const field of ['id','score','stageScore','note','watched','ratingIds','stage'])assert.strictEqual(result[field],original[field]);
 assert.equal(JSON.stringify(original),before);assert.strictEqual(applyReviewedWorkMetadata(result),result);
});
test('HURRICANE correction does not replace newer bindings, another group, or changed song identity',()=>{
 for(const delta of [{id:'other'},{groupIds:['other']},{groupIds:['rec28ldfRTiD0h','other']},{song:'HURRICANE remix'},{url:'https://www.youtube.com/watch?v=feXJQ71Xl7A'},{url:'https://example.com/new-binding'}]){const row={...hurricane(),...delta};assert.strictEqual(applyReviewedWorkMetadata(row),row);}
});
test('every public credit requires matching stable work, group and exact video, never a same-song guess',()=>{
 for(const row of credits){const work=credited(row);assert.equal(publicCreditForWork(work).workId,row.workId);
  for(const delta of [{id:'foreign'},{groupIds:['foreign']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{url:'https://evil.test/watch?v='+row.videoId},{placeholder:{reason:'unknown'}}])assert.equal(publicCreditForWork({...work,...delta}),null);
 }
});
test('public evidence has no personal IDs or scores and preserves its limited credit kind',()=>{
 assert.deepEqual(credits.map(c=>[c.kind,c.memberIds.length]),[['partial_mv_participation',3],['official_recording_lineup',8],['named_artist_credit',2],['named_artist_credit',2]]);
 for(const row of credits){assert.equal(new Set(row.memberIds).size,row.memberIds.length);assert.ok(row.sourceUrl.startsWith('https://'));for(const key of ['ratingId','score','stylingScore','memory','notePrivate','photo'])assert.ok(!(key in row));}
});
test('public member works do not create editable ratings, duplicate existing relations or affect score means',()=>{
 for(const row of credits){const work=credited(row),memberId=row.memberIds[0],data={works:[work],ratings:[]},before=JSON.stringify(data);
  assert.equal(publicCreditsForMember(data,memberId).length,1);assert.equal(publicCreditsForMember(data,'unrelated').length,0);
  assert.deepEqual(memberWorks(data,memberId),[]);assert.equal(memberWorkSummary(memberWorks(data,memberId)).ratedWorks,0);assert.equal(JSON.stringify(data),before);
  const personal={...data,ratings:[{id:'synthetic-real-row',memberIds:[memberId],workIds:[work.id],score:0,stylingScore:null,photo:null}]};
  assert.equal(publicCreditsForMember(personal,memberId).length,0);assert.equal(memberWorks(personal,memberId)[0].performance,0);
 }
});
test('new BLUE cover is original bytes and maps only to its stable MADEIN S release',()=>{
 const manifest=require('../public/artist/madein/data-completion-20261025/manifest.json').assets[0],bytes=fs.readFileSync('public'+manifest.path);
 assert.equal(bytes.length,manifest.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
 const release=sevenDesigns.madein.releases.find(r=>r.id===manifest.releaseId);assert.equal(release.image,manifest.path);assert.equal(release.sourceUrl,manifest.sourceUrl);assert.deepEqual(release.workIds,[manifest.workId]);
 assert.ok(sevenDesigns.madein.releases.every(r=>r.image));
});

test('HURRICANE catalogue, exact native work and original thumbnail agree without confusing audio release and MV date',()=>{
 const manifest=require('../public/artist/badvillain/data-completion-20261025/manifest.json'),asset=manifest.assets[0],data=require('../data/badvillain-figma-public.json');
 const media=data.media.find(r=>r.id==='badvillain-mv-hurricane');assert.equal(media.youtubeId,manifest.videoId);assert.equal(media.watchUrl,applyReviewedWorkMetadata(hurricane()).url);assert.equal(media.image,asset.path);
 assert.equal(media.date,'2024-07-10');assert.equal(data.releases.find(r=>r.id===media.releaseId).date,'2024-06-24');
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+asset.path)).digest('hex'),asset.sha256);
 assert.ok(load('lib/idol/artist-navigation.ts').safeArtistReturn('/artists/badvillain?section=works&media=badvillain-mv-hurricane'));
});
