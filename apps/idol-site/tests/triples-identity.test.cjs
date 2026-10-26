const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'triples-identity-'));
require('esbuild').buildSync({ entryPoints: ['lib/idol/triples-identity.ts'], bundle: true, outfile: path.join(dir,'module.cjs'), platform:'node', format:'cjs', logLevel:'silent' });
const { triplesRoster, triplesReleaseEntries, TRIPLES_GROUP_ID } = require(path.join(dir,'module.cjs'));
require('esbuild').buildSync({ entryPoints: ['lib/idol/triples-curated-releases.ts'], bundle: true, outfile: path.join(dir,'curated.cjs'), platform:'node', format:'cjs', logLevel:'silent' });
const { triplesCuratedReleaseEntries } = require(path.join(dir,'curated.cjs'));
fs.rmSync(dir,{recursive:true,force:true});
const members = require('./fixtures/triples-public-identities.json');
const identity = require('../data/triples/identity-evidence.json');
const releases = require('../data/triples/release-evidence.json').entries;
const timeline = require('../data/artist-timelines/triples.json');
const content = require('../data/triples-artist.json');
const works = releases.map(e=>({id:e.workId,groupIds:[TRIPLES_GROUP_ID],url:e.url,song:e.song,officialTitle:e.officialTitle}));
function freeze(v){ if(v && typeof v==='object'){Object.values(v).forEach(freeze); Object.freeze(v);} return v; }
function clone(v){return structuredClone(v);}

test('all 24 stable official identities agree with existing portrait catalog and remain correct after permutations',()=>{
 assert.equal(members.length,24); assert.equal(new Set(identity.entries.map(e=>e.sNumber)).size,24);
 for(const list of [members,[...members].reverse(),[...members.slice(7),...members.slice(0,7)]]){
  const rows=triplesRoster(list); assert.equal(rows.length,24);
  rows.forEach((row,i)=>{const e=identity.entries.find(e=>e.memberId===row.member.id);assert.equal(row.member,list[i]);assert.equal(row.identity.sNumber,e.sNumber);assert.equal(row.identity.officialStageName,e.officialStageName);assert.equal(content.portraits[row.member.id].stageName,e.officialStageName);assert.equal(row.identity.sourceUrl,identity.sourceUrl);});
 }
});
test('identity drift, wrong affiliation, unknown IDs and duplicate IDs never acquire S numbers',()=>{
 const original=members[0];
 for(const changed of [{...original,id:'unknown'},{...original,stageName:'Other'},{...original,stageName:original.stageName.toLowerCase()},{...original,groupIds:['other']},{...original,groupIds:[]}]){
  const row=triplesRoster([changed])[0];assert.equal(row.identity,null);assert.equal(row.member,changed);
 }
 const duplicate={...original,stageName:'Other'};
 const rows=triplesRoster([original,duplicate,...members.slice(1)]);
 assert.equal(rows.length,25);assert.equal(rows[0].identity,null);assert.equal(rows[1].identity,null);assert.equal(rows[1].member,duplicate);
 assert.equal(triplesRoster([]).length,0);
});
test('all current members retain shared Chinese display names without a group-specific S22 override',()=>{
 const rows=triplesRoster(members);
 for(const row of rows){assert.match(row.chineseName,/[\u3400-\u9fff]/);assert.ok(row.displayName.startsWith(row.chineseName));assert.doesNotMatch(row.displayName,/待核|未核|音译|转写/);}
 const s22=rows.find(r=>r.identity.sNumber===22);assert.equal(s22.displayName,'索琳 · Sullin');assert.equal(s22.displayKind,'existingMemberDisplayName');assert.deepEqual(s22.chineseSourceUrls,[]);
 for(const changed of [{...s22.member,id:'unknown'},{...s22.member,stageName:'Other'},{...s22.member,groupIds:[]}]){const r=triplesRoster([changed])[0];assert.equal(r.identity,null);assert.notEqual(r.displayKind,'translatedStageName');assert.ok(!r.displayName.includes('雪琳'));}
 const duplicated=triplesRoster([s22.member,s22.member]);assert.ok(duplicated.every(r=>r.identity===null && r.displayKind!=='translatedStageName'));
});
test('exact reviewed release/video associations survive reordering and preserve original work objects',()=>{
 const entries=triplesReleaseEntries([...works].reverse(),[...timeline.events].reverse());assert.equal(entries.length,4);
 entries.forEach((e,i)=>{assert.equal(e.title,releases[i].title);assert.equal(e.work,works[i]);assert.deepEqual(e.sourceUrls,timeline.events.find(t=>t.id===e.eventId).sources.map(s=>s.url));});
 assert.deepEqual(triplesReleaseEntries(works,[]),[]);
});
test('release work identity drift, missing or duplicate records fail closed without filtering the caller catalog',()=>{
 for(const change of [{id:'other'},{groupIds:[]},{url:'https://www.youtube.com/watch?v=other'},{song:'Other'},{officialTitle:'Other'}]){const input=works.map((w,i)=>i===0?{...w,...change}:w);assert.equal(triplesReleaseEntries(input,timeline.events).length,3);assert.equal(input.length,4);}
 assert.equal(triplesReleaseEntries([...works,works[0]],timeline.events).length,3);
 assert.equal(triplesReleaseEntries(works.slice(1),timeline.events).length,3);
});
test('held, ambiguous, altered or source-less events cannot authorize release entries',()=>{
 const first=timeline.events.find(e=>e.id===releases[0].eventId);
 for(const change of [{id:'other'},{releaseKey:'other'},{groupId:'other'},{eventType:'notice'},{reviewStatus:'hold'},{holdReasons:['review']},{status:'planned'},{workIds:[]},{workIds:['other']},{workIds:[works[0].id,works[1].id]},{sources:[]}]){
  const events=timeline.events.map(e=>e===first?{...e,...change}:e);assert.equal(triplesReleaseEntries(works,events).length,3,JSON.stringify(change));
 }
 assert.equal(triplesReleaseEntries(works,[...timeline.events,first]).length,3);
 assert.equal(triplesReleaseEntries(works,[...timeline.events,{...first,id:'duplicate-key'}]).length,3);
});
test('deeply frozen inputs stay byte-identical, dates and arbitrary private fields are neither inspected nor rewritten',()=>{
 const ms=clone(members), ws=clone(works), events=clone(timeline.events);
 for(const m of ms) Object.defineProperty(m,'note',{get(){throw Error('private read');}});
 for(const w of ws) Object.defineProperty(w,'score',{get(){throw Error('private read');}});
 const before=JSON.stringify({ms,ws,events});freeze(ms);freeze(ws);freeze(events);
 triplesRoster(ms);triplesReleaseEntries(ws,events);assert.equal(JSON.stringify({ms,ws,events}),before);
 assert.ok(Object.isFrozen(triplesRoster(ms)));assert.ok(Object.isFrozen(triplesRoster(ms)[0]));
});

test('S22 existing Chinese wins; English and old unverified suffixes use the shared reviewed name',()=>{
 const member=members.find(m=>m.id===identity.translatedStageName.memberId);
 for(const cnName of ['用户维护中文名','雪琳','真实中文名（艺名音译）']){
  const changed={...member,cnName};const before=JSON.stringify(changed),row=triplesRoster([changed])[0];
  assert.equal(row.displayKind,'existingMemberDisplayName');assert.deepEqual(row.chineseSourceUrls,[]);
  assert.ok(row.displayName.startsWith(cnName.split('（')[0]));assert.equal(JSON.stringify(changed),before);
 }
 for(const cnName of ['Pirada Bunraksa','Pirada Bunraksa（中文本名未核）','']){
  const changed={...member,cnName};const before=JSON.stringify(changed),row=triplesRoster([changed])[0];
  assert.equal(row.displayName,'索琳 · Sullin');assert.equal(row.displayKind,'existingMemberDisplayName');assert.deepEqual(row.chineseSourceUrls,[]);assert.equal(JSON.stringify(changed),before);
  for(const drift of [{id:'unknown'},{stageName:'Other'},{groupIds:[]}]){
   const invalid=triplesRoster([{...changed,...drift}])[0];assert.equal(invalid.identity,null);assert.equal(invalid.displayKind,'existingMemberDisplayName');assert.deepEqual(invalid.chineseSourceUrls,[]);assert.ok(!invalid.displayName.includes('雪琳'));
  }
 }
});

test('release overlay exposes only its reviewed sources, not newly appended timeline sources',()=>{
 const events=clone(timeline.events);
 for(const e of events)e.sources.push({id:'unreviewed-extra',url:'https://example.com/new',publisher:'New',title:'Extra',sourcePublishedAt:null,checkedAt:'2026-10-16',scopeNote:'',evidenceRef:null});
 const entries=triplesReleaseEntries(works,events);assert.equal(entries.length,4);
 entries.forEach((entry,i)=>assert.deepEqual(entry.sourceUrls,releases[i].sourceUrls));
});

const curatedEvidence=require('../data/triples/curated-release-evidence.json').entries[0];
const curatedWork={id:'rec28ldfRTrCjG',groupIds:[TRIPLES_GROUP_ID],url:'https://www.youtube.com/watch?v=2tda_TCjz8w',song:'Girls Never Die',officialTitle:"tripleS(트리플에스) 'Girls Never Die' Official MV"};
test('ASSEMBLE24 is separately reviewed public curation with original work identity, never a fabricated timeline event',()=>{
 const entry=triplesCuratedReleaseEntries([...works,curatedWork])[0];assert.ok(entry);assert.equal(entry.work,curatedWork);
 assert.equal(entry.title,'ASSEMBLE24');assert.equal(entry.sourceKind,'curated-public-evidence');assert.equal(entry.displayScope,'24人完整体');assert.equal(entry.sourceScope,curatedEvidence.sourceScope);assert.deepEqual(entry.sourceUrls,[curatedEvidence.sourceUrl]);
 for(const key of ['eventId','eventDate','releaseDate','memberIds','performerMemberIds'])assert.equal(key in entry,false);
 assert.deepEqual(triplesCuratedReleaseEntries([curatedWork,...works].reverse()),[entry]);
 const timelineEntry=timeline.events.find(e=>e.releaseKey==='triples-assemble24');
 // The separate sourced successor now binds the timeline; the curated resolver still does not write it.
 const correction=require('../HANDOFF/timeline-corrections/triples-assemble24.json');
 assert.deepEqual(correction.before.workIds,[]);assert.deepEqual(timelineEntry,correction.after);
 const timelineBefore=JSON.stringify(timeline);triplesCuratedReleaseEntries([...works,curatedWork]);assert.equal(JSON.stringify(timeline),timelineBefore);
 assert.equal(triplesReleaseEntries([...works,curatedWork],timeline.events).length,4);
 assert.ok(!triplesReleaseEntries([...works,curatedWork],timeline.events).some(e=>e.releaseKey==='triples-assemble24'));
});
test('curated release rejects all identity drift, missing and duplicate works without replacing catalog records',()=>{
 for(const change of [{id:'other'},{groupIds:[]},{groupIds:['other']},{url:'https://www.youtube.com/watch?v=other'},{song:'Other'},{officialTitle:'Other'}]){
  const changed={...curatedWork,...change},catalog=[...works,changed];assert.deepEqual(triplesCuratedReleaseEntries(catalog),[]);assert.equal(catalog.at(-1),changed);assert.equal(catalog.length,5);
 }
 assert.deepEqual(triplesCuratedReleaseEntries(works),[]);assert.deepEqual(triplesCuratedReleaseEntries([curatedWork,curatedWork]),[]);
 const work=clone(curatedWork);Object.defineProperty(work,'note',{get(){throw Error('private read');}});const before=JSON.stringify(work);freeze(work);
 const result=triplesCuratedReleaseEntries(Object.freeze([work]));assert.equal(result[0].work,work);assert.equal(JSON.stringify(work),before);assert.ok(Object.isFrozen(result));assert.ok(Object.isFrozen(result[0]));assert.ok(Object.isFrozen(result[0].sourceUrls));
});
