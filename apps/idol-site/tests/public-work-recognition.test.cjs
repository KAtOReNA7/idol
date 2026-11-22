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

test('SING ! matches six April release portraits to public credits and keeps the interviews behind each portrait',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const {parse}=require('next/dist/compiled/node-html-parser');
 const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
 const {publicRecognitionEdition}=require('./helpers/public-artist-loader.cjs')('lib/idol/public-work-recognition.ts');
 const evidence=require('../../../docs/codex/evidence/20261122-bewave-sing/sources-and-crops.json');
 const groupId='rec28ldfRTiDh1',work={id:evidence.workId,url:'https://www.youtube.com/watch?v='+evidence.performanceVideo.videoId,groupIds:[groupId],ratingIds:[]};
 const members=evidence.members.map(person=>({id:person.memberId,stageName:person.name,groupIds:[groupId]}));
 const data={works:[work],members,ratings:[]},before=structuredClone(data);
 const page=parse(renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){},
  renderScore:member=>React.createElement('button',{'data-test-score':member.id},'个人评分')})));
 const cards=page.querySelectorAll('.public-recognition-grid > li');
 assert.equal(cards.length,6);
 assert.match(page.text,/发行阵容/);
 for(const [index,person] of evidence.members.entries()){
  const binding={workId:work.id,videoId:evidence.performanceVideo.videoId,memberId:person.memberId};
  const edition=publicRecognitionEdition(binding),card=cards[index];
  assert.equal(card.getAttribute('data-photo-member'),person.memberId);
  assert.equal(card.querySelector('.mv-identity-frame img').getAttribute('src'),person.card);
  assert.equal(card.querySelector('.mv-identity-frame + .mv-photo-score button').getAttribute('data-test-score'),person.memberId);
  assert.equal(card.querySelector('figcaption a').getAttribute('href'),person.publisher);
  assert.equal(edition.original,person.original);
  assert.match(card.querySelector('.mv-identity-previous').text,/原认人照/);
  assert.equal(new URL(card.querySelector('.mv-identity-history a').getAttribute('href')).hostname,'www.edaily.co.kr');
  assert.equal(read(work)[index].src,person.retainedPortrait);
  for(const mismatch of [{workId:'another-work'},{memberId:'another-member'},{videoId:evidence.liveClip.videoId}])assert.equal(publicRecognitionEdition({...binding,...mismatch}),null);
 }
 assert.deepEqual(data,before);
});
