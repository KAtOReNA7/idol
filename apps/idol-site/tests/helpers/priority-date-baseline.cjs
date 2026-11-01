'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-priority-crosscheck/date-adoption.json');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const bytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
// Independent complete preimages. Appending evidence never relaxes old audits.
const pins={
 candyshop:'f51ca75ee0faa1d8332163c846a176b7953b07dfa1b413d5858b5ef707040fb8',
 atheart:'82dab6b7057818a60acb933f57617877eced2a664b0a64206f9a38a5c3bac853',
 udtt:'f2fc3be3ed849ce23e8dfea4da27607e1f20b4699efc027cd1a23b7efcd311e3',
 geenius:'537016f582305ff38612ede157b2d1ff75b18ad39a2947284c37f718c1220a23',
 bewave:'3ea86955021317aadf87bb6c8d569d9852b365a16500d323b2cf8c090b2b916d',
};
function beforePriorityTimelineBytes(slug,current){
 const document=receipt.documents.find(d=>d.slug===slug);if(!document)return current;
 assert.equal(document.beforeSha256,pins[slug],'reviewed priority date preimage pin');
 assert.equal(hash(current),document.afterSha256,'complete reviewed priority date document '+slug);
 const old=JSON.parse(current);
 for(const change of receipt.changes.filter(c=>c.slug===slug)){
  const i=old.events.findIndex(e=>e.id===change.eventId);assert.ok(i>=0);
  assert.deepEqual(old.events[i],change.after,'exact reviewed promoted event '+change.eventId);
  for(const field of ['id','groupId','eventType','memberIds','workIds','releaseKey','relatedEventIds'])assert.deepEqual(change.after[field],change.before[field],'unchanged event identity '+field);
  old.events[i]=structuredClone(change.before);
 }
 assert.deepEqual(old.gaps,document.afterGaps,'exact reviewed after gaps');old.gaps=structuredClone(document.beforeGaps);
 const restored=bytes(old);assert.equal(hash(restored),document.beforeSha256,'complete priority date preimage '+slug);return restored;
}
function beforePriorityReportedRecords(current){
 const document=receipt.reportDocument;
 assert.equal(document.beforeSha256,'0480b00a3fa71b7307dff00c1438a0f7367d25d20115faafb85ad02bbf7a9973','reviewed reported-record preimage pin');
 assert.equal(hash(bytes(current)),document.afterSha256,'complete reviewed priority reporting document');
 const old=structuredClone(current);
 for(const change of receipt.changes){
  const i=old.records.findIndex(r=>r.eventId===change.eventId);assert.ok(i>=0);
  assert.deepEqual(old.records[i],change.reportAfter,'exact reviewed reporting row '+change.eventId);
  old.records[i]=structuredClone(change.reportBefore);
 }
 assert.equal(typeof document.expectedBeforeText,'string','byte-exact original reporting text is recorded');
 assert.equal(hash(document.expectedBeforeText),document.beforeSha256,'complete original reporting text preimage');
 assert.deepEqual(old,JSON.parse(document.expectedBeforeText),'restoring only reviewed rows reproduces original reporting object');return old;
}
function beforePriorityAndContinuousTimelineBytes(slug,current){
 const prior=beforePriorityTimelineBytes(slug,current),upgrade=require('../../../../docs/codex/evidence/20261028-continuous/evidence-upgrade-proposal-c.json').timelines.find(r=>r.slug===slug);
 if(!upgrade)return prior;
 assert.equal(hash(prior),upgrade.proposedAfterFileSha256,'complete prior reviewed source upgrade '+slug);
 const restored=Buffer.from(upgrade.expectedBeforeText,'utf8');assert.equal(hash(restored),upgrade.expectedBeforeFileSha256,'complete prior source-upgrade preimage '+slug);return restored;
}
function beforePriorityRead(read){return name=>{
 const found=name.replaceAll('\\','/').match(/(?:^|\/)data\/artist-timelines\/([^/]+)\.json$/);
 const raw=read(name);return found?beforePriorityAndContinuousTimelineBytes(found[1],raw):raw;
};}
module.exports={beforePriorityTimelineBytes,beforePriorityAndContinuousTimelineBytes,beforePriorityReportedRecords,beforePriorityRead,receipt};
