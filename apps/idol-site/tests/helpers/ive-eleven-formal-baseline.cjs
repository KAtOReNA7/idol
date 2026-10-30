const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-evidence-advance/ive-eleven-adoption.json');
const hash=v=>createHash('sha256').update(JSON.stringify(v,null,2)+'\n').digest('hex');
function beforeIveEleven(kind,current){
 const proof=receipt[kind],id=receipt.workId,out=structuredClone(current),h=hash(out);
 if(h===proof.beforeFileSha256)return out;
 const containsAdoption=kind==='stageVideos'?Object.hasOwn(out,id):JSON.stringify(out.works?.[id])===JSON.stringify(proof.afterRow);
 if(!containsAdoption)return out; // Earlier historical helpers still enforce their own full-file SHA.
 assert.equal(h,proof.afterFileSha256,'complete post-IVE source/status collection');
 if(kind==='stageVideos'){assert.deepEqual(out[id],proof.afterRow);delete out[id];}
 else{assert.deepEqual(out.works[id],proof.afterRow);out.works[id]=structuredClone(proof.beforeRow);out.updatedAt=proof.beforeUpdatedAt;}
 assert.equal(hash(out),proof.beforeFileSha256,'complete pre-IVE source/status collection');return out;
}
module.exports={beforeIveEleven,receipt};
