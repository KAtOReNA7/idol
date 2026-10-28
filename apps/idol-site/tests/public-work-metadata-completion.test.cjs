const test=require('node:test'),assert=require('node:assert/strict');
const {applyReviewedWorkMetadata:apply}=require('./helpers/public-artist-loader.cjs')('lib/idol/reviewed-work-metadata.ts');
const evidence=require('../data/public-work-metadata-completion.json');
test('reviewed metadata fills exact-video empty fields without carrying personal values or mutating input',()=>{
 assert.equal(evidence.records.length,26);
 assert.deepEqual(evidence.records.reduce((counts,r)=>{for(const key of Object.keys(r.values))counts[key]=(counts[key]||0)+1;return counts;},{}),{releaseDate:23,officialTitle:2,channel:5});
 for(const row of evidence.records){
  const input={id:row.workId,groupIds:[row.groupId],song:'test',url:`https://www.youtube.com/watch?v=${row.videoId}`,releaseDate:'',officialTitle:'',channel:'',score:0,note:'private-canary',watched:'已观看'};
  const frozen=structuredClone(input),result=apply(input);
  assert.deepEqual(input,frozen);assert.deepEqual(result,{...input,...row.values});
  for(const mismatch of [{id:'unrelated'},{groupIds:['other']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{placeholder:true}])assert.deepEqual(apply({...input,...mismatch}),{...input,...mismatch});
  const edited={...input,releaseDate:'2000-01-01',officialTitle:'owner-title',channel:'owner-channel'};assert.deepEqual(apply(edited),edited);
 }
});
test('publication timestamps are converted to Korea calendar days; uploader timezone is not assumed to be the release day',()=>{
 for(const row of evidence.records.filter(r=>r.values.releaseDate)){
  const source=row.sources.find(s=>s.kind==='exact_video_publish_timestamp');assert.ok(source);
  assert.equal(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(source.publishTimestamp)),row.values.releaseDate);
 }
 const yoyo=evidence.records.find(r=>r.videoId==='uDYy2UyO1X4');assert.equal(yoyo.values.releaseDate,'2024-02-29');
});
