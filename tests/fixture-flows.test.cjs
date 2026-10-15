const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path');
const cache={};function load(name){if(cache[name])return cache[name];const result={};cache[name]=result;const code=ts.transpileModule(fs.readFileSync('lib/idol/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(exports,require){'+code+'})',{crypto:require('node:crypto').webcrypto,URL,URLSearchParams})(result,s=>load(path.basename(s)));return result;}
const data=JSON.parse(fs.readFileSync('fixtures/catalog.json'));const {resolveHomeRotation,shuffleHomePool}=load('home-rotation');const {memberWorks,memberWorkSummary}=load('member-works');const {groupCollection}=load('group-detail');
test('fixture relations resolve and no real member/work record leaks',()=>{assert.equal(data.groups.length,6);assert.equal(data.members.length,12);assert.equal(data.works.length,18);for(const w of data.works){assert.ok(w.id.startsWith('recDemo'));assert.ok(data.groups.some(g=>w.groupIds.includes(g.id)));}for(const r of data.ratings){assert.ok(data.members.some(m=>r.memberIds.includes(m.id)));assert.ok(data.works.some(w=>r.workIds.includes(w.id)));}});
test('home shuffle changes the selected batch when candidates exist',()=>{const first=resolveHomeRotation(data);for(const pool of ['tonight','rewatch','photos']){const next=resolveHomeRotation(data,shuffleHomePool(first.rotation,pool,123));assert.notDeepEqual(next.selected[pool].map(x=>x.id),first.selected[pool].map(x=>x.id),pool);}});
test('group totals include score zero but exclude unscored works',()=>{const g=groupCollection(data,data.groups[0]);assert.equal(g.mv.count,2);assert.equal(g.mv.mean,4.5);assert.equal(g.stage.count,0);assert.equal(g.stage.mean,null);});
test('personal score ignores MV score and preserves zero vs unscored',()=>{const s=memberWorkSummary(memberWorks(data,'recDemo0Member0'));assert.equal(s.performanceCount,2);assert.equal(s.performanceMean,4);assert.equal(s.stylingMean,3);assert.equal(s.composite,3.5);});
test('stage fixture remains separate and cannot inherit MV zero rating',()=>{const w=data.works[0];assert.equal(w.score,0);assert.equal(w.stageScore,null);assert.ok(w.stage);assert.equal(w.stage.scoreBinding.initialScore,null);});
test('resolved home shuffle is ready to persist once and leaves other pools unchanged',()=>{
 const initial=resolveHomeRotation(data);
 for(const pool of ['tonight','rewatch','photos']){
  let current=initial;
  for(let i=0;i<20;i++){
   const next=resolveHomeRotation(data,shuffleHomePool(current.rotation,pool,100+i));
   assert.notDeepEqual(next.selected[pool].map(x=>x.id),current.selected[pool].map(x=>x.id));
   assert.deepEqual(resolveHomeRotation(data,next.rotation).rotation,next.rotation,'persisted batch needs no follow-up normalization');
   for(const other of ['tonight','rewatch','photos'].filter(k=>k!==pool))assert.deepEqual(next.rotation[other],current.rotation[other],other);
   assert.ok(next.rotation[pool].previous.length<=18);
   assert.equal(new Set(next.rotation[pool].ids).size,next.rotation[pool].ids.length);
   current=next;
  }
 }
});
test('home batches handle sparse and changed synthetic catalogs without stale cards',()=>{
 const initial=resolveHomeRotation(data);
 const sparse={...data,works:[data.works[1]],members:[]};
 const next=resolveHomeRotation(sparse,initial.rotation);
 assert.deepEqual(Array.from(next.selected.tonight,w=>w.id),[data.works[1].id]);
 assert.equal(next.selected.rewatch.length,0);
 assert.equal(next.selected.photos.length,0);
 const empty=resolveHomeRotation({...data,works:[],members:[]},next.rotation);
 assert.ok(Object.values(empty.selected).every(batch=>batch.length===0));
});
