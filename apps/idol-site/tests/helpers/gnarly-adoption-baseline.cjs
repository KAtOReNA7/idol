const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261101-gnarly-adoption/adoption.json');
const paths={stageVideos:'data/stage-videos.json',stageStatuses:'data/stages/status.json'};
const hash=value=>createHash('sha256').update(JSON.stringify(value,null,2)+'\n').digest('hex');
function beforeGnarly(kind,current){
 const p=paths[kind];assert.ok(p);const out=structuredClone(current);
 if(hash(out)===receipt.before[p].sha256)return out;
 assert.equal(hash(out),receipt.after[p].sha256,'complete reviewed post-Gnarly collection');
 if(kind==='stageVideos'){
  assert.deepEqual(out[receipt.workId],receipt.newSource);out[receipt.workId]=structuredClone(receipt.previousSource);
 }else{
  assert.deepEqual(out.works[receipt.workId],receipt.statusChange.after);
  assert.equal(out.updatedAt,receipt.statusChange.afterUpdatedAt);
  out.works[receipt.workId]=structuredClone(receipt.statusChange.before);out.updatedAt=receipt.statusChange.beforeUpdatedAt;
 }
 assert.equal(hash(out),receipt.before[p].sha256,'complete pre-Gnarly collection, other rows immutable');return out;
}
module.exports={beforeGnarly,receipt,hash};
