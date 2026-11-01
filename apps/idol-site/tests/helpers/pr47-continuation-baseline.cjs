const assert=require('node:assert/strict');
const receipt=require('../../../../docs/codex/evidence/20261029-pr47-continuation/supplement-preservation.json');
const position=require('../../../../docs/codex/evidence/20261029-beep-watch-position/adoption.json');
const {beforeHeyGabbyHuman}=require('./heygabby-human-baseline.cjs');
const metadata=source=>Object.fromEntries(Object.entries(source).filter(([key])=>key!=='works'));

// Verify every changed current row and its metadata before restoring the exact
// PR47 preimage in a test clone. Existing historical cohort hashes stay intact.
module.exports=function restorePr47ContinuationBaseline(source){
 source=beforeHeyGabbyHuman(source);
 assert.deepEqual(metadata(source),receipt.afterMetadata,'complete current supplement metadata');
 const historical=structuredClone(source);
 const leads=historical.works[position.workId].watchLeads;
 const index=leads.findIndex(lead=>lead.sourceId===position.sourceId);
 assert.ok(index>=0,'existing BEEP lead retained');
 assert.deepEqual(leads[index],position.afterLead,'complete reviewed BEEP navigation-only update');
 leads[index]=structuredClone(position.beforeLead);
 for(const change of receipt.changes){
  assert.deepEqual(historical.works[change.workId],change.after,'complete current research row '+change.workId);
  if(change.before===null)delete historical.works[change.workId];
  else historical.works[change.workId]=structuredClone(change.before);
 }
 // Retain the original root-key positions: historical byte hashes place works
 // between reviewedInputFiles and the retained research provenance fields.
 for(const key of Object.keys(historical))if(key!=='works'&&!Object.hasOwn(receipt.beforeMetadata,key))delete historical[key];
 Object.assign(historical,structuredClone(receipt.beforeMetadata));
 return historical;
};
