const test=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
const {root,workId,now,evidence,base,normalize,merge}=require('./helpers/stage-fallback-fixture.cjs');
const originalVideos=fs.readFileSync(path.join(root,'data/stage-videos.json'));
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,sorted(value[k])])):value;
const digest=value=>createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');
function previous(){return {platform:'youtube',sourceClass:'official',completeness:'full',videoId:'oldstudio12',url:'https://www.youtube.com/watch?v=oldstudio12',title:'Synthetic recording-session live',channel:'Synthetic studio',kind:'studio_live',checkedAt:now,likes:{value:900,display:'900',precision:'exact'},scoreBinding:{videoId:'oldstudio12',sourceKey:'oldstudio12',initializedAt:now,initialScore:null}};}
function replacement(old=previous(),occasion='studio_live'){
 const result=normalize(base());assert.equal(result.status,0,result.stderr);const batch=JSON.parse(result.stdout),item=batch.items[0],selected=item.selected;
 selected.likes=null;selected.likesDisplay=null;selected.likesPrecision='unknown';item.candidates[0].likes={value:null,display:null,precision:'unknown'};
 const ev={note:'Exact official recording-session source and music-program source reviewed; new likes unknown, no numerical ranking claimed.',urls:[old.url,selected.url]};
 item.selectionDecision={method:'manual_evidence',selectedSourceKey:selected.videoId,comparedSourceKeys:[selected.videoId],reason:'One reviewed music-program candidate; no comparable new likes.',evidence:ev};
 item.replacementDecision={method:'manual_evidence',selectedSourceKey:selected.videoId,comparedSourceKeys:[old.videoId,selected.videoId],reason:'Reviewed excluded studio-live occasion replaced by a music-program source under the existing owner safeguards.',evidence:ev};
 item.previousOccasionReview={previousVideoId:old.videoId,previousSha256:digest(old),occasion,evidence:{note:'Exact historical source is a recording-session live, not a choreographed produced performance.',urls:[old.url]}};
 return batch;
}
function unchanged(result){for(const [name,before] of Object.entries(result.beforeFiles))assert(before.equals(result.afterFiles[name]),name);}
function heldUnchanged(result){
 for(const [name,before] of Object.entries(result.beforeFiles)){
  if(name!=='data/stages/status.json'){assert(before.equals(result.afterFiles[name]),name);continue;}
  const old=JSON.parse(before),current=JSON.parse(result.afterFiles[name]);assert(Number.isFinite(Date.parse(current.updatedAt)));
  delete old.updatedAt;delete current.updatedAt;assert.deepEqual(current,old,'held states unchanged except batch bookkeeping timestamp');
 }
}

test('explicit studio-live source types cannot be relabeled as new produced or music-program performances',()=>{
 for(const type of ['studio_live','studio_live_session'])for(const field of ['type','kind','performanceType']){
  const candidate=base({type:'produced_dance_performance',kind:'Official choreographed performance',selection:{occasion:'produced_performance',evidence},[field]:type});
  const result=normalize(candidate);assert.notEqual(result.status,0);assert.match(result.stderr,/Structured performance type conflicts/);
 }
 assert.equal(normalize(base({type:'produced_dance_performance',selection:{occasion:'produced_performance',evidence}})).status,0);
});

test('exact truthful studio-live reviews allow an empty unsaved source to move to a music program while retaining the old source',()=>{
 for(const occasion of ['studio_live','studio_live_session']){
  const old=previous(),result=merge(replacement(old,occasion),{previous:old});assert.equal(result.status,0,result.stderr);
  const stage=result.videos[workId];assert.equal(stage.videoId,'fallsource1');assert.equal(stage.scoreBinding.initialScore,null);
  const historical=stage.previousSources.at(-1);assert.equal(historical.preference,'excluded_historical_occasion');assert.deepEqual(historical.previousOccasionReview.previousSha256,digest(old));
  for(const [key,value] of Object.entries(old))assert.deepEqual(historical[key],value,key);
  for(const name of ['data/stages/inventory.json','fresh.json'])assert(result.beforeFiles[name].equals(result.afterFiles[name]),name);
 }
});

test('unknown or mismatched historical reviews do not authorize a source replacement',()=>{
 const old=previous();
 const noReview=replacement(old);delete noReview.items[0].previousOccasionReview;const held=merge(noReview,{previous:old});assert.equal(held.status,0,held.stderr);heldUnchanged(held);
 for(const edit of [r=>r.previousSha256='0'.repeat(64),r=>r.previousVideoId='anotherOld1',r=>r.occasion='unconfirmed',r=>r.evidence.note='',r=>r.evidence.urls=['https://example.org/unrelated']]){
  const batch=replacement(old);edit(batch.items[0].previousOccasionReview);const result=merge(batch,{previous:old});assert.notEqual(result.status,0);unchanged(result);assert.equal(result.artifact,false);
 }
 const altered={...old,title:'Changed historical source'};const result=merge(replacement(old),{previous:altered});assert.notEqual(result.status,0);unchanged(result);
});

test('rated, saved, stale-journal and published-preimage protections remain strict for studio-live replacements',()=>{
 const old=previous(),batch=replacement(old);
 for(const options of [{score:0},{score:8},{journal:[{record_id:workId,table_key:'works',status:'done'}]},{journal:[{record_id:workId,table_key:'works',status:'pending'}]}]){
  const held=merge(batch,{previous:old,...options});assert.equal(held.status,0,held.stderr);heldUnchanged(held);
 }
 for(const options of [{capturedAt:new Date(Date.now()-301000).toISOString()},{published:{[workId]:{...old,title:'Different published object'}}}]){
  const result=merge(batch,{previous:old,...options});assert.notEqual(result.status,0);unchanged(result);assert.equal(result.artifact,false);
 }
});

test.after(()=>assert(fs.readFileSync(path.join(root,'data/stage-videos.json')).equals(originalVideos),'real stage source objects remain byte-exact'));
