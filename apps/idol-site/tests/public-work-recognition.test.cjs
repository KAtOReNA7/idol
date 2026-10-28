const test=require('node:test'),assert=require('node:assert/strict');
const {publicWorkRecognition:read}=require('./helpers/public-artist-loader.cjs')('lib/idol/public-work-recognition.ts');
const source=require('../data/public-work-recognition.json'),credits=require('../data/public-work-credits.json');
test('recognition references are limited to credited members and the exact current work, group and video',()=>{
 for(const row of source.records){
  const work={id:row.workId,groupIds:[row.groupId],url:`https://www.youtube.com/watch?v=${row.videoId}`,score:0,note:'personal',ratingIds:[]};
  const before=structuredClone(work),portraits=read(work),credit=credits.records.find(c=>c.workId===row.workId);
  assert.equal(portraits.length,row.portraits.length);assert(credit);assert.deepEqual(work,before);
  assert.equal(new Set(portraits.map(p=>p.memberId)).size,portraits.length);
  for(const p of portraits){assert(credit.memberIds.includes(p.memberId));assert.equal(p.workAssociation,'recognition_reference');assert.match(p.label,/认人参考/);assert.equal('score' in p,false);assert.equal('ratingId' in p,false);}
  for(const mismatch of [{id:'another-work'},{groupIds:['another-group']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{placeholder:true}])assert.deepEqual(read({...work,...mismatch}),[]);
 }
});
test('recognition crops remain within complete original pixels and support a consistent 3:4 display',()=>{
 for(const row of source.records)for(const p of row.portraits){
  assert(p.width>0&&p.height>0);const c=p.sourceCrop??{x:0,y:0,width:p.width,height:p.height};
  assert(c.x>=0&&c.y>=0&&c.width>0&&c.height>0&&c.x+c.width<=p.width&&c.y+c.height<=p.height);
  assert(Math.min(c.width,c.height*3/4)>=540);
 }
});
