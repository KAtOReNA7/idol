const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-next-followup/qwer-formal-adoption.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x,null,2)+'\n').digest('hex');
function beforeQwer(kind,current){
 const out=structuredClone(current),id=receipt.workId,proof=receipt[kind];
 if(kind==='stageVideos'){
  if(!out[id])return out;
  assert.deepEqual(out[id],proof.afterRow,'complete reviewed QWER video');assert.equal(hash(out),proof.afterFileSha256,'complete post-QWER source collection');delete out[id];
 }else{
  if(hash(out)===proof.beforeFileSha256)return out;
  assert.equal(hash(out),proof.afterFileSha256,'complete post-QWER status collection');assert.deepEqual(out.works[id],proof.afterRow);
  out.works[id]=structuredClone(proof.beforeRow);out.updatedAt=proof.beforeUpdatedAt;
 }
 assert.equal(hash(out),proof.beforeFileSha256,'complete pre-QWER collection');return out;
}
function beforeQwerSupplements(current){
 const out=structuredClone(current),proof=receipt.supplementChange;
 assert.equal(hash(out),proof.afterFileSha256,'complete reviewed current-policy supplements (post-QWER)');assert.deepEqual(out.works[receipt.workId].searchReview,proof.after);
 out.works[receipt.workId].searchReview=structuredClone(proof.expectedBefore);assert.equal(hash(out),proof.beforeFileSha256);return out;
}
module.exports={beforeQwer,beforeQwerSupplements,receipt};
