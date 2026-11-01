const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,workId,merge}=require('./helpers/stage-fallback-fixture.cjs');
const prepared=require('../../../docs/codex/evidence/20261101-crush-preparation/ive-crush-prepared-20261101.json');
const previous=require('../../../docs/codex/evidence/20261101-crush-preparation/previous-source.json');
const original=fs.readFileSync(path.join(root,'data/stage-videos.json'));
function fixture(){const batch=structuredClone(prepared);batch.items[0].recordId=workId;return batch;}
test('prepared CRUSH P2 passes existing strict cross-platform replacement with complete old history retained',()=>{
 const result=merge(fixture(),{previous});assert.equal(result.status,0,result.stderr);
 const s=result.videos[workId];assert.equal(s.scoreBinding.sourceKey,'bilibili:BV1JctKeyEgw:cid:25864110751:p:2');assert.equal(s.sourceClass,'reupload');assert.equal(s.clip,undefined);
 assert.equal(s.selection.occasion,'music_program');assert.equal(s.scoreBinding.initialScore,null);assert.equal(s.previousSources.at(-1).videoId,'crGAr4NQRa4');
 for(const [k,v] of Object.entries(previous))if(k!=='previousSources')assert.deepEqual(s.previousSources.at(-1)[k],v);
});
test('CRUSH preparation cannot migrate rated, saved, expired or mismatched part identities',()=>{
 for(const options of [{score:0},{score:9},{journal:[{record_id:workId,table_key:'works',status:'done'}]}]){
  const result=merge(fixture(),{previous,...options});assert.equal(result.status,0,result.stderr);assert.deepEqual(result.videos[workId],previous);
 }
 const stale=merge(fixture(),{previous,capturedAt:new Date(Date.now()-301000).toISOString()});assert.notEqual(stale.status,0);assert.deepEqual(stale.before,stale.after);
 const batch=fixture();batch.items[0].selected.bilibili.page=1;
 const wrong=merge(batch,{previous});assert.notEqual(wrong.status,0);assert.deepEqual(wrong.before,wrong.after);
});
test.after(()=>assert.deepEqual(fs.readFileSync(path.join(root,'data/stage-videos.json')),original,'synthetic preparation never adopts into the actual application'));
