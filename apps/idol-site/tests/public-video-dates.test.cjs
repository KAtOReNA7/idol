const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {applyReviewedWorkMetadata:apply}=require('./helpers/public-artist-loader.cjs')('lib/idol/reviewed-work-metadata.ts');
const source=JSON.parse(fs.readFileSync('data/public-video-date-evidence.json','utf8'));
test('20 exact official video publication dates fill only empty public display fields',()=>{
 assert.equal(source.changes.length,20);
 for(const row of source.changes){
  const work={id:row.id,groupIds:[row.groupId],url:row.url,releaseDate:'',score:0,note:'private-canary',watched:'已观看'},before=JSON.stringify(work),out=apply(work);
  assert.equal(out.releaseDate,row.proposedDate);assert.deepEqual({...out,releaseDate:''},work);assert.equal(JSON.stringify(work),before);
  for(const change of [{url:'https://youtube.com/watch?v=abcdefghijk'},{groupIds:['foreign']},{id:'foreign'},{placeholder:true}])assert.equal(apply({...work,...change}).releaseDate,'');
  assert.equal(apply({...work,releaseDate:'2000-01-01'}).releaseDate,'2000-01-01');
  assert.equal(new Intl.DateTimeFormat('en-CA',{timeZone:source.dateTimezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(row.sourcePublishTimestamp)),row.proposedDate);
  const editorial=JSON.parse(fs.readFileSync('data/'+row.file,'utf8'));assert.equal(editorial.works.find(w=>w.id===row.id).date,row.proposedDate);
 }
});
test('existing owner-confirmed HURRICANE exact-version repair remains intact',()=>{
 const work={id:'rec28ldfRTrEng',groupIds:['rec28ldfRTiD0h'],song:'HURRICANE',url:'',releaseDate:'',score:0};const fixed=apply(work);assert.equal(fixed.url,'https://www.youtube.com/watch?v=00tUzCOPI6g');assert.equal(fixed.score,0);assert.equal(apply({...work,url:'https://example.com/other'}).url,'https://example.com/other');
});
