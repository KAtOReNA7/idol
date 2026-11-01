const assert=require('node:assert/strict');
const receipt=require('../../../../docs/codex/evidence/20261028-post-v200/stages-b/adoption.json');
const memberReceipt=require('../../../../docs/codex/evidence/20261028-post-v200/stages-a/member-version-adoption.json');
const {beforeHeyGabbyFormalStages,beforeHeyGabbyFormalStatuses}=require('./heygabby-formal-baseline.cjs');
function beforePostV200Stages(current){
 const out=beforeHeyGabbyFormalStages(current);
 for(const source of [memberReceipt,receipt])for(const row of source.changes){assert.deepEqual(out[row.recordId],row.after);if(row.before)out[row.recordId]=structuredClone(row.before);else delete out[row.recordId];}
 return out;
}
function beforePostV200StageStatuses(current){
 const out=beforeHeyGabbyFormalStatuses(current);
 for(const source of [memberReceipt,receipt]){
  for(const row of source.changes){assert.deepEqual(out.works[row.recordId],row.afterStatus);out.works[row.recordId]=structuredClone(row.beforeStatus);}
  assert.equal(out.updatedAt,source.preservation.currentStatusUpdatedAt);out.updatedAt=source.preservation.oldStatusUpdatedAt;
 }
 return out;
}
module.exports={beforePostV200Stages,beforePostV200StageStatuses};
