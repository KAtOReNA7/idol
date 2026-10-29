const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-group-followup/heygabby-review-update.json');
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
const hash=value=>createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');

// Historical cohorts predate this authorized research-only update. Verify the
// complete current target before restoring its exact preimage in a clone.
module.exports=function restoreHeyGabbyReviewBaseline(source){
 const current=source.works[receipt.workId];
 assert.deepEqual(current.searchReview,receipt.afterSearchReview,'current Hey Gabby review must match the recorded update');
 assert.deepEqual(Object.fromEntries(Object.entries(current).filter(([key])=>key!=='searchReview')),receipt.preservedTargetFields,'only the target searchReview may change');
 assert.equal(hash(current),receipt.afterWorkSha256,'complete current Hey Gabby row');
 const historical=structuredClone(source);
 historical.works[receipt.workId].searchReview=structuredClone(receipt.beforeSearchReview);
 assert.equal(hash(historical.works[receipt.workId]),receipt.beforeWorkSha256,'complete historical Hey Gabby row');
 return historical;
};
