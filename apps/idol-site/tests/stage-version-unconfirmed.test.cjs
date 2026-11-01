const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {workId,groupId,fallback,normalize,merge,validate}=require('./helpers/stage-fallback-fixture.cjs');
const load=require('./helpers/public-artist-loader.cjs');
const source=load('lib/idol/stage-source.ts'),{projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const {StageSameSongFallback}=load('components/stage-same-song-fallback.tsx'),{stageKindLabel}=load('lib/idol/stage-display.ts');
function candidate(){
 const c=structuredClone(fallback({completeness:'full',version:'unconfirmed',languageVersionEvidence:{basis:'Synthetic same-song and group evidence; recording-version equivalence remains unconfirmed.'}}));
 c.sameSongFallback.differences=['本视频为同曲全团表演，具体录音版本未核。'];return c;
}
function batch(c=candidate()){const r=normalize(c);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function inserted(){const r=merge(batch());assert.equal(r.status,0,r.stderr);return r.videos[workId];}

test('explicit unconfirmed recording versions normalize without asserting exact or different versions',()=>{
 const b=batch(),s=b.items[0].selected;assert.equal(s.versionMatch,false);assert.equal(s.sameSongFallback.version,'unconfirmed');
 assert.match(s.label,/同曲后备 · 版本未核/);assert.doesNotMatch(s.label,/不同版本|精确匹配/);assert.match(s.verificationNote,/具体录音版本未核/);
});

test('recording-version uncertainty requires a visible disclosure and does not relax identity, performer or occasion evidence',()=>{
 for(const edit of [c=>c.sameSongFallback.differences=['Unspecified difference'],c=>c.sameSongFallback.sameSong=false,c=>c.sameSongFallback.originalPerformerScope='solo',c=>c.versionMatch=true,c=>c.sameSongFallback.evidence.urls=[],c=>c.selection.occasion='other_event']){
  const c=candidate();edit(c);assert.notEqual(normalize(c).status,0);
 }
});

test('runtime and actual notice preserve unknown recording state through anonymous projection',()=>{
 const stage=inserted();assert(source.stageHasValidBinding(stage));stage.sameSongFallback.reason='PRIVATE_REASON';stage.sameSongFallback.evidence.note='PRIVATE_EVIDENCE';
 const work={id:workId,groupIds:[groupId],stage};const before=structuredClone(work),projected=projectPublicCatalog({works:[work],members:[],ratings:[],groups:[],counts:{}}).works[0];
 assert(source.stageHasValidBinding(projected.stage));assert.equal(projected.stage.sameSongFallback.version,'unconfirmed');assert.doesNotMatch(JSON.stringify(projected),/PRIVATE/);
 const html=renderToStaticMarkup(React.createElement(StageSameSongFallback,{stage:projected.stage}));assert.match(html,/同曲后备 · 版本未核/);assert.match(html,/具体录音版本未核/);assert.match(html,/是否使用同一录音尚未核实/);assert.doesNotMatch(html,/不同版本|精确匹配/);
 assert.match(stageKindLabel(stage.kind),/版本未核/);assert.doesNotMatch(stageKindLabel(stage.kind),/不同版本/);assert.deepEqual(work,before);
 const hidden={...projected.stage,sameSongFallback:{...projected.stage.sameSongFallback,differences:['No unknown-recording disclosure']}};assert.equal(source.validSameSongFallback(hidden),false);
});

test('complete validator accepts the disclosed unknown state and rejects missing disclosure or false exact matching',()=>{
 const stage=inserted();const good=validate(stage);assert.equal(good.status,0,good.stderr);
 for(const edit of [s=>s.sameSongFallback.differences=['No recording-version disclosure'],s=>s.versionMatch=true,s=>s.sameSongFallback.version='exact',s=>s.sameSongFallback.sameSong=false])assert.notEqual(validate(stage,edit).status,0);
});

test('unknown-version fallback keeps new-slot score, log, freshness and published preimage guards',()=>{
 const b=batch();
 for(const options of [{score:0},{score:8},{journal:[{record_id:workId,table_key:'works',status:'done'}]}]){const held=merge(b,options);assert.equal(held.status,0,held.stderr);assert(held.before.equals(held.after));}
 for(const options of [{capturedAt:new Date(Date.now()-901000).toISOString()},{published:{[workId]:{videoId:'published11'}}},{previous:inserted()}]){const r=merge(b,options);assert.notEqual(r.status,0);assert(r.before.equals(r.after));assert.equal(r.artifact,false);}
});
