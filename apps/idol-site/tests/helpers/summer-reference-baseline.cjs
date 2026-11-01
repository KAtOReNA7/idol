const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-next-followup/summer-reference-adoption.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x,null,2)+'\n').digest('hex');
function beforeSummerReference(file,current){
 const proof=receipt.collections.find(c=>c.file===file);assert.ok(proof);
 const out=structuredClone(current);assert.equal(hash(out),proof.afterFileSha256,'complete current SUMMER collection');
 assert.equal(out.records.length,106);assert.deepEqual(out.records.pop(),proof.addedRecord);
 assert.equal(hash(out),proof.beforeFileSha256,'complete previous 105 records and metadata');return out;
}
module.exports={beforeSummerReference,receipt};
