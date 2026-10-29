const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-next-followup/triples-adoption.json');
const sha=x=>createHash('sha256').update(JSON.stringify(x,null,2)+'\n').digest('hex');
function beforeNextFollowupStatistics(current){
 assert.equal(receipt.change,'triples.sales');
 assert.deepEqual(current.groups.triples.sales,receipt.after,'complete group-advance sales object (next followup)');
 assert.equal(sha(current),receipt.afterFileSha256,'complete pre-advance statistics (next followup)');
 const restored=structuredClone(current);
 restored.groups.triples.sales=structuredClone(receipt.expectedBefore);
 assert.equal(sha(restored),receipt.beforeFileSha256,'complete pre-advance statistics');
 return restored;
}
module.exports={beforeNextFollowupStatistics,receipt};
