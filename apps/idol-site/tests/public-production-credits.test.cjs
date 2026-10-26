const test=require('node:test'),assert=require('node:assert/strict');
const {publicProductionForWork}=require('./helpers/public-artist-loader.cjs')('lib/idol/public-production-credits.ts');
const work={id:'rec28ldfRTrMp2',groupIds:['rec28ldfRTiCdf'],url:'https://www.youtube.com/watch?v=52IyDIMyejQ',score:0,note:'personal'};
test('director portfolio credits attach only to the reviewed work and exact catalog video',()=>{
 const before=JSON.stringify(work),row=publicProductionForWork(work);assert.equal(row.credits.length,3);assert.equal(row.sourceUrl,'https://www.christianhaahs.com/video1/v/lek');assert.equal(JSON.stringify(work),before);
 for(const change of [{id:'other'},{groupIds:['other']},{url:'https://youtube.com/watch?v=abcdefghijk'},{placeholder:true}])assert.equal(publicProductionForWork({...work,...change}),null);
 assert.ok(!JSON.stringify(row).includes('personal'));
});
