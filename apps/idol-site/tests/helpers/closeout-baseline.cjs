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
const currentCopyGuard={
  "sha256": "23de9915639d22cf15ba0e107fb8602840b5a531b8e03de28c5218ad3b02c2f0",
  "pins": {
    "lib/idol/udtt-native/presentation.mjs": {
      "bytes": 16450,
      "sha256": "0b765e59743b2db1c2629e352664c770497cddd102e7799b5f08a28d967bd4c4"
    },
    "lib/idol/timeline/reported-records.mjs": {
      "bytes": 2828,
      "sha256": "7e4d5e8c15d8083189df10fef622d192ed29e4091cdd350f370f4f291a764321"
    },
    "lib/idol/group-information.mjs": {
      "bytes": 9342,
      "sha256": "59ba1ef9ca1cf2fa73b61c049b262eea92259b786da837d22ef35e7ea794431e"
    }
  }
};
function beforeCloseoutGuard(current){
 if(hash(current)===currentCopyGuard.sha256){
  const restored=structuredClone(current);
  for(const [file,pin] of Object.entries(currentCopyGuard.pins)){
   assert.deepEqual(restored.runtimeGuards[file],pin);
   restored.runtimeGuards[file]=structuredClone(guard.after.runtimeGuards[file]);
  }
  assert.equal(hash(restored),guard.afterSha256,'complete closeout guard');
  current=restored;
 }
 if(hash(current)===guard.beforeSha256)return structuredClone(current);
 assert.equal(hash(current),guard.afterSha256,'complete closeout guard');assert.deepEqual(current,guard.after);
 const old=structuredClone(current);
 assert.deepEqual(guard.changedPins,['lib/idol/timeline/reported-records.mjs','lib/idol/group-information.mjs']);
 for(const p of guard.changedPins)old.runtimeGuards[p]=structuredClone(guard.before.runtimeGuards[p]);
 assert.deepEqual(old,guard.before);assert.equal(hash(old),guard.beforeSha256);return old;
}
module.exports={beforeCloseoutPublic,beforeCloseoutGuard};
