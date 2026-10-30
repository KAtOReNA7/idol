'use strict';
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-same-song-adoption/adoption.json');
const coreTargetIds=['rec28ldfRTrIkV','rec28ldfRTrNcl','rec28ldfRTrNsK','rec28ldfRTrOTb','recvxyHuKMCSdB','recvxyHuKMLz7L','recvxyHuKMiDs4','recvxyHuKMisqR','recvxyHuKMlAhN','recvxyHuKMlNfX','recvxyHuKMxwnW','recvxyHuKMyy5i','recvxyOz5X3Fd8','recvxyOz5X7zV3','recvxyOz5XKzE5','recvxyOz5XQMJt','recvxyOz5Xa1EK','recvxyOz5XmMQe','recvxyOz5XnOv7'];
const targetIds=Object.keys(receipt.addedSourceRows),replacementIds=Object.keys(receipt.replacementRows||{});
const paths={stageVideos:'data/stage-videos.json',stageStatuses:'data/stages/status.json'};
const pinned={
 stageVideos:{before:'d4e3cc9ad2c99361e0ebd5976e31088ff7b24a7e4f9d35c4161dbe5695db3337'},
 stageStatuses:{before:'b395013c5165add522514b7217b01d090fb9bd0c6fb708aee5b791f8fb37f7c3'},
};
const bytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const hash=value=>createHash('sha256').update(bytes(value)).digest('hex');
function hasSameSongAdoption(kind,current){
 assert.ok(paths[kind],'known stage adoption document kind');
 return targetIds.some(id=>kind==='stageVideos'?Object.hasOwn(current,id):current.works?.[id]?.status==='verified');
}
function beforeSameSongAdoption(kind,current){
 assert.ok(paths[kind],'known stage adoption document kind');
 const path=paths[kind],before=receipt.before[path],after=receipt.after[path],out=structuredClone(current);
 assert.equal(before.sha256,pinned[kind].before);assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.equal(hash(before.object),pinned[kind].before,'complete reviewed pre-same-song receipt');assert.equal(bytes(before.object).length,before.bytes);
 assert.ok(coreTargetIds.every(id=>targetIds.includes(id)),'all nineteen original reviewed adoptions retained');
 assert.equal(new Set([...targetIds,...replacementIds]).size,targetIds.length+replacementIds.length,'new slots and replacements are disjoint');
 if(hash(out)===pinned[kind].before){assert.deepEqual(out,before.object);return out;}
 assert.equal(hash(out),after.sha256,'complete post-same-song source/status collection');assert.equal(bytes(out).length,after.bytes);
 for(const id of [...targetIds,...replacementIds]){
  if(kind==='stageVideos'){
   if(targetIds.includes(id)){assert.equal(Object.hasOwn(before.object,id),false);assert.deepEqual(out[id],receipt.addedSourceRows[id]);delete out[id];}
   else{const change=receipt.replacementRows[id];assert.deepEqual(before.object[id],change.before);assert.deepEqual(out[id],change.after);out[id]=structuredClone(change.before);}
  }else{
   const change=receipt.changedStatusRows?.[id];
   if(change){assert.deepEqual(change.before,before.object.works[id]);assert.deepEqual(out.works[id],change.after);}
   assert.equal(out.works[id].status,'verified');assert.ok(out.works[id].reason?.trim());assert.match(out.works[id].checkedAt,/^\d{4}-\d{2}-\d{2}T/);
   out.works[id]=structuredClone(before.object.works[id]);
  }
 }
 if(kind==='stageStatuses')out.updatedAt=before.object.updatedAt;
 assert.deepEqual(out,before.object,'only the exact reviewed additions, replacements and status timestamp changed');
 assert.equal(hash(out),pinned[kind].before,'complete pre-same-song source/status collection');return out;
}
module.exports={beforeSameSongAdoption,hasSameSongAdoption,coreTargetIds,targetIds,replacementIds,receipt,hash};
