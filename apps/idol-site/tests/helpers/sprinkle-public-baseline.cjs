const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-sprinkle-human/sprinkle-public-adoption.json');
const hash=data=>createHash('sha256').update(JSON.stringify(data,null,2)+'\n').digest('hex');
function beforeSprinkle(name,current){
 const change=receipt.collections[name];assert.ok(change,'reviewed public collection');
 assert.equal(hash(current),change.afterSha256,'complete reviewed post-Sprinkle collection');
 const before=structuredClone(current);
 assert.deepEqual(before.records.pop(),name==='public-work-credits.json'?receipt.addedCredit:receipt.addedRecognition,'exact appended public row');
 assert.equal(hash(before),change.beforeSha256,'complete original public collection');
 return before;
}
module.exports={beforeSprinkle};
