const test=require('node:test'),assert=require('node:assert/strict');
const {publicCreditForWork}=require('./helpers/public-artist-loader.cjs')('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=require('./helpers/public-artist-loader.cjs')('lib/idol/public-work-recognition.ts');

test('Almond Chocolate Special Film keeps reported five-person appearance separate from other versions and private relationships',()=>{
 const work={id:'rec28ldfRTrLwE',groupIds:['rec28ldfRTiBON'],url:'https://www.youtube.com/watch?v=qlgEadao-Sk',ratingIds:[],score:0,note:'unchanged-private-note'};
 const before=structuredClone(work),credit=publicCreditForWork(work),photos=publicWorkRecognition(work);
 assert.equal(credit.kind,'documented_mv_participation');
 assert.equal(credit.sourceUrl,'https://tvfan.kyodo.co.jp/music/news-music/1463240');
 assert.deepEqual(new Set(credit.memberIds),new Set(['rec28ldbniB7Nx','rec28ldbniB7Vy','rec28ldbniB82H','rec28ldbniB89P','rec28ldbniB8ho']));
 assert.equal(photos.length,5);
 for(const p of photos){assert(credit.memberIds.includes(p.memberId));assert.equal(p.workAssociation,'recognition_reference');assert.equal(p.photoSetId,'illit-bomb-q-20261027');}
 for(const change of [{id:'another-almond-version'},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{groupIds:['another-group']},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...change}),null);
  assert.deepEqual(publicWorkRecognition({...work,...change}),[]);
 }
 assert.deepEqual(work,before);
});
