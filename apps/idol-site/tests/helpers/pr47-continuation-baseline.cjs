const assert=require('node:assert/strict');
const receipt=require('../../../../docs/codex/evidence/20261029-pr47-continuation/supplement-preservation.json');
const metadata=source=>Object.fromEntries(Object.entries(source).filter(([key])=>key!=='works'));

// Verify every changed current row and its metadata before restoring the exact
// PR47 preimage in a test clone. Existing historical cohort hashes stay intact.
module.exports=function restorePr47ContinuationBaseline(source){
 assert.deepEqual(metadata(source),receipt.afterMetadata,'complete current supplement metadata');
 const historical=structuredClone(source);
 for(const change of receipt.changes){
  assert.deepEqual(source.works[change.workId],change.after,'complete current research row '+change.workId);
  if(change.before===null)delete historical.works[change.workId];
  else historical.works[change.workId]=structuredClone(change.before);
 }
 for(const key of Object.keys(historical))if(key!=='works')delete historical[key];
 Object.assign(historical,structuredClone(receipt.beforeMetadata));
 return historical;
};
