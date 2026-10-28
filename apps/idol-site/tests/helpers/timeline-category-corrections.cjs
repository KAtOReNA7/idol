'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const BUNDLE='evidence/category-resolution-20261027/timeline-corrections.json';
const PIN='1159db653a3ead4c44c5ef1eb5286d611ff9bddc4137c7b047876b82cb15e673';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const digest=v=>hash(JSON.stringify(stable(v)));
const ids=[
 'e-rocketpunch-suyun-contract-announcement',
 'e-ifeye-sasha-hiatus-announcement',
 'e-ifeye-sasha-resume-announcement',
 'e-genblue-swing-dance-single',
 'e-genblue-oh-chinese-single',
];
function validateCategoryCorrections({events,ledger,readBytes}){
 const bytes=readBytes(BUNDLE);assert.equal(hash(bytes),PIN,'only the fixed, reviewed five-event correction bundle is accepted');
 const bundle=JSON.parse(bytes);assert.equal(bundle.schemaVersion,1);assert.equal(bundle.correctionId,'timeline-category-resolution-20261027');
 assert.deepEqual(bundle.corrections.map(c=>c.eventId),ids);
 const historical=new Map(events);
 for(const c of bundle.corrections){
  assert.equal(digest(c.before),c.beforeSha256);assert.equal(digest(c.after),c.afterSha256);
  assert.equal(c.beforeSha256,ledger.events.find(r=>r.eventId===c.eventId)?.adoptedEventSha256);
  assert.deepEqual(events.get(c.eventId),c.after,'current event must equal exact recorded after');
  assert.deepEqual(Object.keys(c.before).sort(),Object.keys(c.after).sort());
  assert.deepEqual(Object.keys(c.before).filter(k=>digest(c.before[k])!==digest(c.after[k])).sort(),c.allowedFields);
  for(const k of ['id','groupId','eventType','memberIds','workIds','releaseKey','relatedEventIds'])assert.deepEqual(c.before[k],c.after[k],`protected ${k}`);
  assert.equal(c.before.reviewStatus,'hold');assert.equal(c.after.reviewStatus,'ready');assert.deepEqual(c.after.holdReasons,[]);
  assert.deepEqual(c.after.sources.slice(0,c.before.sources.length),c.before.sources,'original source trail remains unchanged');
  assert.equal(c.after.sources.length,c.before.sources.length+c.evidence.length);
  for(const proofRef of c.evidence){
   const proofBytes=readBytes(proofRef.path);assert.equal(hash(proofBytes),proofRef.sha256);const proof=JSON.parse(proofBytes);
   const source=c.after.sources.find(s=>s.evidenceRef===proofRef.path);assert.ok(source);assert.equal(source.url,proof.url);assert.equal(source.checkedAt,'2026-10-27');
   assert.ok(proof.readMethod&&proof.paraphrase);
   if(c.slug==='ifeye'){
    assert.equal(c.after.status,'announced');assert.equal(c.after.eventDate,null);
    assert.equal(source.sourcePublishedAt.value,proof.publishedAt.slice(0,10));assert.match(proof.sourceHtmlSha256,/^[0-9a-f]{64}$/);
   }
   if(c.slug==='genblue'){
    assert.equal(c.after.status,'confirmed');assert.equal(proof.previewVerification.httpStatus,200);
    assert.equal(proof.previewVerification.contentType,'audio/x-m4p');assert.ok(proof.previewVerification.bytes>1000000);
    assert.equal(proof.records.length,2);assert.ok(proof.records.every(r=>r.artistName==='GENBLUE'&&r.releaseDate.startsWith(c.after.eventDate.value)));
    assert.ok(proof.records[1].previewUrl.startsWith('https://audio-ssl.itunes.apple.com/'));
   }
  }
  if(c.slug==='rocketpunch'){assert.equal(c.after.eventDate,null);assert.equal(c.after.status,'announced');assert.deepEqual(c.after.announcementDate,{value:'2026-08-06',precision:'day'});}
  historical.set(c.eventId,c.before);
 }
 assert.deepEqual(bundle.documents.map(d=>d.slug).sort(),['genblue','ifeye','rocketpunch']);
 for(const d of bundle.documents){
  const raw=readBytes(d.path);assert.equal(hash(raw),d.afterDocumentSha256);const doc=JSON.parse(raw);
  assert.deepEqual(doc.gaps,d.afterGaps);
  doc.events=doc.events.map(e=>historical.get(e.id));doc.gaps=d.beforeGaps;
  assert.equal(hash(JSON.stringify(doc,null,2)+'\n'),d.beforeDocumentSha256,'restoring only exact corrections and gaps must reproduce original file');
  assert.deepEqual(d.beforeGaps,ledger.groups.find(g=>g.slug===d.slug).adoptedGaps);
 }
 return {historical,bundle};
}
module.exports={validateCategoryCorrections,BUNDLE,PIN};
