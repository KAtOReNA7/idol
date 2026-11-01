const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/password-formal-adoption.json');
const stayc=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/stayc-formal-adoption.json');
const bytes=v=>JSON.stringify(v,null,2)+'\n';
const hash=v=>createHash('sha256').update(v).digest('hex');
function beforePassword(kind,current){
 // Nested historical callers may supply this exact already-restored collection.
 // Accept only the complete reviewed preimage SHA, never a partial row match.
 if(hash(bytes(current))===receipt[kind].beforeFileSha256)return structuredClone(current);
 current=beforeStayc(kind,current);
 const proof=receipt[kind],out=structuredClone(current),id=receipt.workId;
 if(kind==='stageVideos'){
  if(!out[id]){assert.equal(hash(bytes(out)),proof.beforeFileSha256,'complete current formal stageVideos object');return out;}
  assert.equal(hash(bytes(out)),proof.afterFileSha256,'full post-Password source collection');
  assert.deepEqual(out[id],proof.afterRow);delete out[id];
 }else{
  if(hash(bytes(out))===proof.beforeFileSha256)return out;
  assert.equal(hash(bytes(out)),proof.afterFileSha256,'full post-Password research collection');
  assert.deepEqual(out.works[id],proof.afterRow);assert.equal(out.updatedAt,proof.afterUpdatedAt);
  out.works[id]=structuredClone(proof.beforeRow);out.updatedAt=proof.beforeUpdatedAt;
 }
 assert.equal(hash(bytes(out)),proof.beforeFileSha256,'complete v202 pre-Password bytes');return out;
}
function beforeStayc(kind,current){
 current=require('./qwer-formal-baseline.cjs').beforeQwer(kind,current);
 const proof=stayc[kind],out=structuredClone(current),id=stayc.workId;
 if(kind==='stageVideos'){
  if(!out[id])return out;
  assert.deepEqual(out[id],proof.afterRow);assert.equal(hash(bytes(out)),proof.afterFileSha256,'complete post-STAYC sources');delete out[id];
 }else{
  if(hash(bytes(out))!==proof.afterFileSha256&&JSON.stringify(out.works[id])===JSON.stringify(proof.beforeRow))return out;
  assert.equal(hash(bytes(out)),proof.afterFileSha256,'complete post-STAYC statuses');assert.deepEqual(out.works[id],proof.afterRow);
  out.works[id]=structuredClone(proof.beforeRow);out.updatedAt=proof.beforeUpdatedAt;
 }
 assert.equal(hash(bytes(out)),proof.beforeFileSha256);return out;
}
function beforePasswordBytes(relative,current){
 const kind=['stageVideos','stageStatuses'].find(k=>receipt[k].path==='apps/idol-site/'+relative);
 if(!kind)return current;
 return Buffer.from(bytes(beforePassword(kind,JSON.parse(current.toString('utf8')))));
}
module.exports={beforePassword,beforePasswordBytes,beforeStayc,receipt,stayc};
