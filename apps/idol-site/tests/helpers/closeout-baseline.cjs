const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261101-closeout/public-adoption.json');
const guard=require('../../../../docs/codex/evidence/20261101-closeout/guard-adoption.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x,null,2)+'\n').digest('hex');
function beforeCloseoutPublic(name,current){
 const c=receipt.collections[name];
 if(hash(current)===c.beforeSha256)return structuredClone(current);
 assert.equal(hash(current),c.afterSha256,'complete reviewed closeout public collection');
 const old=structuredClone(current);
 assert.deepEqual(old.records.pop(),name==='public-work-credits.json'?receipt.addedCredit:receipt.addedRecognition);
 assert.equal(hash(old),c.beforeSha256,'complete closeout preimage');return old;
}
function beforeCloseoutGuard(current){
 if(hash(current)===guard.beforeSha256)return structuredClone(current);
 assert.equal(hash(current),guard.afterSha256,'complete closeout guard');assert.deepEqual(current,guard.after);
 const old=structuredClone(current);
 assert.deepEqual(guard.changedPins,['lib/idol/timeline/reported-records.mjs','lib/idol/group-information.mjs']);
 for(const p of guard.changedPins)old.runtimeGuards[p]=structuredClone(guard.before.runtimeGuards[p]);
 assert.deepEqual(old,guard.before);assert.equal(hash(old),guard.beforeSha256);return old;
}
module.exports={beforeCloseoutPublic,beforeCloseoutGuard};
