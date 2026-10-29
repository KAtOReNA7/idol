const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/hitgs-adoption.json');
const madein=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/madein-photo-adoption.json');
const human=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/password-user-confirmation.json');
const formal=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/password-formal-adoption.json');
const stayc=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/stayc-formal-adoption.json');

function beforeV202Generic(current){
 const change=receipt.genericGroupChange;
 const out=structuredClone(current),index=out.groups.findIndex(g=>g.groupId===change.groupId);
 const mi=out.groups.findIndex(g=>g.groupId===madein.after.groupId);
 if(!isDeepStrictEqual(out.groups[mi],madein.expectedBefore)){
  assert.deepEqual(out.groups[mi],madein.after,'complete reviewed MADEIN photos and metadata');
  out.groups[mi]=structuredClone(madein.expectedBefore);
 }
 assert.ok(index>=0,'reviewed HITGS group exists');
 if(isDeepStrictEqual(out.groups[index],change.expectedBefore))return out;
 assert.deepEqual(out.groups[index],change.after,'complete reviewed HITGS collection metadata');
 out.groups[index]=structuredClone(change.expectedBefore);
 return out;
}

function beforeV202Supplements(current){
 const changes=receipt.researchNoteChanges;
 assert.deepEqual(changes.map(c=>c.workId).sort(),['recvxyH5pzoMAf','rec28ldfRTrOnV'].sort());
 const out=structuredClone(current);
 if(isDeepStrictEqual(out.works[stayc.workId]?.searchReview,stayc.supplementChange.after))out.works[stayc.workId].searchReview=structuredClone(stayc.supplementChange.expectedBefore);
 if(isDeepStrictEqual(out.works[human.workId]?.searchReview,formal.supplementChange.after))out.works[human.workId].searchReview=structuredClone(formal.supplementChange.expectedBefore);
 if(isDeepStrictEqual(out.works[human.workId]?.searchReview,human.after))out.works[human.workId].searchReview=structuredClone(human.expectedBefore);
 if(changes.every(c=>isDeepStrictEqual(out.works[c.workId]?.searchReview,c.expectedBefore)))return out;
 for(const change of changes){
  assert.deepEqual(out.works[change.workId].searchReview,change.after,'complete reviewed current-policy note '+change.workId);
  out.works[change.workId].searchReview=structuredClone(change.expectedBefore);
 }
 return out;
}

function beforeV202SupplementsBytes(current){
 const text=Buffer.isBuffer(current)?current.toString('utf8'):current;
 const data=JSON.parse(text);
 assert.equal(text,JSON.stringify(data,null,2)+'\n','complete current supplements bytes retain canonical format');
 return Buffer.from(JSON.stringify(beforeV202Supplements(data),null,2)+'\n');
}

function beforeMadeinWorkPhotos(file,current){
 const out=structuredClone(current),change=madein.workChanges.find(c=>c.file===file);
 assert.ok(change,'known MADEIN work collection');
 const i=out.records.findIndex(r=>r.workId===change.workId);assert.ok(i>=0);
 if(isDeepStrictEqual(out.records[i],change.expectedBefore))return out;
 assert.deepEqual(out.records[i],change.after,'complete reviewed MADEIN work photo source change');
 out.records[i]=structuredClone(change.expectedBefore);return out;
}
function beforeV202Checklist(current){
 const proof=require('../../../../docs/codex/evidence/20261029-pr47-v202-followup/human-checklist-v202-prefix.json');
 const hash=s=>createHash('sha256').update(s).digest('hex'),text=current.toString('utf8');
 assert.equal(hash(text),proof.afterFileSha256,'complete pre-existing v202 checklist notice and body');
 assert.equal(text.slice(proof.insertionOffset,proof.insertionOffset+proof.insertedText.length),proof.insertedText);
 const out=text.slice(0,proof.insertionOffset)+text.slice(proof.insertionOffset+proof.insertedText.length);
 assert.equal(hash(out),proof.beforeFileSha256);return Buffer.from(out);
}
module.exports={beforeV202Generic,beforeV202Supplements,beforeV202SupplementsBytes,beforeMadeinWorkPhotos,beforeV202Checklist,receipt};
