'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const ledger=require('../HANDOFF/batch-f/integration-ledger.json');
const sources=require('../HANDOFF/batch-f/source-index.json');
const supplement=require('../HANDOFF/batch-f/root-supplement-ledger.json');
const manifest=require('../HANDOFF/batch-f/original-manifest.json');
const expected=require('./fixtures/timeline/batch-f-expected-events.json');
const registry=require('../data/artist-timeline-registry.json');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const digest=v=>hash(JSON.stringify(stable(v)));
const docs=new Map(registry.map(g=>[g.slug,read(`data/artist-timelines/${g.slug}.json`)]));
const events=new Map([...docs.values()].flatMap(d=>d.events.map(e=>[e.id,e])));
const files=new Map(manifest.files.map(f=>[f.path,f]));
const {validateCorrectionChain}=require('./helpers/timeline-correction-chain.cjs');
const correction=require('../HANDOFF/timeline-corrections/triples-assemble24.json');
const historicalEvents=validateCorrectionChain({corrections:[correction,require('../evidence/approved-visual-repairs/badvillain-overstep-correction.json'),require('../evidence/approved-visual-repairs/madein-rise-correction.json')],events,ledger,
 readBytes:p=>fs.readFileSync(path.join(root,p)),snapshot:read('data/snapshot.json')});

test('Batch F eventId overlay preserves all 154 noops and exactly adopts 97 updates plus 345 inserts',()=>{
 assert.equal(ledger.baseCommit,'f2797657a5dc0f62eac609d83d9eccc85a1a5bd5');
 assert.equal(ledger.originalLibraryFileId,'libfile_c57a1723cc108191a964cf82ad0cb86b');
 assert.equal(ledger.originalManifestSha256,hash(fs.readFileSync(path.join(root,'HANDOFF/batch-f/original-manifest.json'))));
 assert.deepEqual(ledger.operationCounts,{update:97,insert:345,noop:154});
 assert.equal(ledger.events.length,596);assert.equal(new Set(ledger.events.map(e=>e.eventId)).size,596);
 for(const row of ledger.events){
  const event=events.get(row.eventId);assert.ok(event,row.eventId);assert.equal(digest(historicalEvents.get(row.eventId)),row.adoptedEventSha256,row.eventId);
  assert.equal(row.beforeGuardPassed,true);assert.equal(event.groupId,docs.get(row.slug).groupId);
  if(row.operation==='noop')assert.equal(row.adoptedEventSha256,row.liveBeforeSha256,'noop must preserve the exact live object');
  if(row.operation==='insert'){assert.equal(row.liveBeforeSha256,null);assert.equal(row.packageBeforeSha256,null);}
 }
 assert.equal(events.size,623);assert.equal([...docs.values()].reduce((n,d)=>n+d.events.length,0),623,'event IDs must be globally unique');
});

test('every prior reference difference has a specific prior merge-ledger proof and matching original archive hash',()=>{
 assert.equal(ledger.priorEvidenceRefProofs.length,359);
 assert.equal(new Set(ledger.priorEvidenceRefProofs.map(x=>x.eventId+'\0'+x.sourceId)).size,359);
 for(const proof of ledger.priorEvidenceRefProofs){
  assert.ok(['E','E01','E02'].includes(proof.originBatch));
  assert.equal(proof.candidateRef,`evidence/${proof.originBatch}/${proof.originalRef}`);
  assert.equal(files.get(proof.batchFPortableRef.split('#')[0])?.sha256,proof.fileSha256,proof.eventId);
 }
});

test('canonical group identities and previous gaps survive; empty incoming gaps cannot erase them',()=>{
 assert.equal(ledger.groups.length,50);
 for(const group of ledger.groups){
  const doc=docs.get(group.slug);assert.equal(doc.schemaVersion,1);assert.equal(doc.groupId,group.groupId);
  const gaps=['badvillain','madein'].includes(group.slug)?require('../evidence/approved-visual-repairs/'+(group.slug==='madein'?'madein-rise':'badvillain-overstep')+'-correction.json').beforeGaps:doc.gaps;
  assert.deepEqual(gaps,group.adoptedGaps);
  assert.deepEqual(gaps,[...new Set([...group.baselineGaps,...group.incomingGaps])]);
 }
 const lsf=fs.readFileSync(path.join(root,ledger.lesserafim.path));
 assert.equal(hash(lsf),'65548bd618024c5fe1adb51c1b57e0b91cfb27a28a92b00909708b7c773611fb');
 assert.equal(JSON.parse(lsf).events.length,25);
});

test('all 51 accepted ready/hold ID sets are independently frozen rather than count-only assertions',()=>{
 assert.deepEqual(Object.keys(expected.groups).sort(),registry.map(g=>g.slug).sort());
 for(const [slug,doc] of docs){
  const accepted=expected.groups[slug];assert.equal(doc.groupId,accepted.groupId);
  assert.deepEqual(doc.events.map(e=>historicalEvents.get(e.id)).filter(e=>e.reviewStatus==='ready').map(e=>e.id).sort(),accepted.ready,slug);
  assert.deepEqual(doc.events.map(e=>historicalEvents.get(e.id)).filter(e=>e.reviewStatus==='hold').map(e=>e.id).sort(),accepted.hold,slug);
 }
 assert.equal(Object.values(expected.groups).reduce((n,g)=>n+g.ready.length,0),608);
 assert.equal(Object.values(expected.groups).reduce((n,g)=>n+g.hold.length,0),15);
});

test('all canonical source references resolve through the original Library manifest or existing LSF source index',()=>{
 assert.equal(files.size,994);assert.equal(manifest.files.filter(f=>f.path.startsWith('evidence/')).length,830);
 assert.equal(sources.evidenceFilesInOriginalArchive,830);assert.equal(sources.runtimeEvidenceFilesAdded,0);
 const index=new Map(sources.sources.map(s=>[s.eventId+'\0'+s.sourceId,s]));
 assert.equal(index.size,sources.sources.length);assert.equal(index.size,864);
 const oldSources=new Map(read('HANDOFF/lesserafim-timeline-source-index.json').evidence.map(e=>[e.path,e.sha256]));
 for(const [slug,doc] of docs){if(slug==='lesserafim')continue;for(const currentEvent of doc.events){const event=historicalEvents.get(currentEvent.id);for(const source of event.sources){
  const row=index.get(event.id+'\0'+source.id);assert.ok(row,event.id);assert.equal(row.canonicalRef,source.evidenceRef);
  if(row.libraryFileId){assert.equal(row.libraryFileId,ledger.originalLibraryFileId);assert.equal(files.get(row.packageRef.split('#')[0])?.sha256,row.sha256);}
  else{assert.equal(row.existingSourceIndex,'HANDOFF/lesserafim-timeline-source-index.json');assert.equal(oldSources.get(row.researchRef),row.sha256);}
 }}}
 for(const f of manifest.files.filter(f=>f.path.startsWith('evidence/'))){
  assert.equal(fs.existsSync(path.join(root,'public',f.path)),false);
  assert.equal(fs.existsSync(path.join(root,'data/artist-timelines',f.path)),false);
 }
});

test('two root collaboration additions reuse the unchanged LSF factual source with only local identity links',()=>{
 const original=events.get('e-lesserafim-iconic-by-mistake');assert.equal(supplement.supplements.length,2);
 for(const row of supplement.supplements){
  const event=events.get(row.eventId);assert.equal(row.newIdAbsent,true);assert.equal(digest(event),row.adoptedEventSha256);
  assert.equal(digest(original),row.sourceEventSha256);assert.deepEqual(event.sources,original.sources);
  assert.deepEqual(event.eventDate,{value:'2026-06-12',precision:'day'});assert.equal(event.status,'confirmed');assert.equal(event.reviewStatus,'ready');
  assert.deepEqual(event.memberIds,[]);assert.deepEqual(event.relatedEventIds,[]);
  assert.equal(event.groupId,docs.get(row.slug).groupId);assert.equal(event.releaseKey,`${row.slug}:iconic-by-mistake`);
  assert.deepEqual(event.workIds,row.workIdentityProof.map(w=>w.recordId));
  for(const work of row.workIdentityProof){assert.equal(work.song,'ICONIC BY MISTAKE');assert.ok(work.groupIds.includes(event.groupId));}
 }
 assert.deepEqual(events.get('e-illit-iconic-by-mistake').workIds,['rec28ldfRTrKBN']);
 assert.deepEqual(events.get('e-katseye-iconic-by-mistake').workIds,[]);
});

test('Dark Arts exact date is independently corroborated without rewriting its accepted candidate',()=>{
 const proof=read(supplement.dateEvidence.proof);assert.equal(hash(fs.readFileSync(path.join(root,supplement.dateEvidence.proof))),supplement.dateEvidence.sha256);
 assert.equal(proof.url,'https://wmg.jp/aespa/discography/32159');assert.equal(proof.exactOriginalExcerpt,'2025.07.15 配信／5021732866875');
 assert.deepEqual(events.get('e-aespa-dark-arts-release').eventDate,proof.supportedEventDate);
 assert.equal(supplement.dateEvidence.canonicalEventUnchangedFromBatchF,true);
});
