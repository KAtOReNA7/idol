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
  "sha256": "e0ad44fb8c7c4e0b46b941c44e956cb5b88ce3a092db6fcf65325ae44b47e776",
  "pins": {
    "lib/idol/udtt-native/presentation.mjs": {
      "bytes": 16479,
      "sha256": "cf63cb3f5fb627d42ab013f36667d676bc92c33b933e1c726e4b44854d17e415"
    },
    "lib/idol/timeline/reported-records.mjs": {
      "bytes": 2732,
      "sha256": "9a515461a5906831dcd2cddaa8a070bd26238fd40bbf63928c7da3905321f0ff"
    },
    "lib/idol/group-information.mjs": {
      "bytes": 9342,
      "sha256": "59ba1ef9ca1cf2fa73b61c049b262eea92259b786da837d22ef35e7ea794431e"
    }
  }
};
function beforeCloseoutGuard(current){
 if(hash(current)==='1900aba8bbc5f4cca39f9e496c4a17afb902a63d6e79f68bb01b7f53f8eaf350'){
  const restored=structuredClone(current);
  const priorPins={...guard.after.runtimeGuards,...currentCopyGuard.pins};
  for(const file of ['lib/idol/udtt-native/host.mjs','lib/idol/udtt-native/model.mjs','lib/idol/udtt-native/presentation.mjs','lib/idol/udtt-native/information-identity.mjs','lib/idol/group-information.mjs']){
   restored.runtimeGuards[file]=structuredClone(priorPins[file]);
  }
  delete restored.runtimeGuards['data/artist-home-introductions.json'];
  assert.equal(hash(restored),currentCopyGuard.sha256,'exact guard before direct MV links and group introductions');
  current=restored;
 }
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
