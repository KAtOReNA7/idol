const test=require('node:test');
const assert=require('node:assert/strict');
const {harness}=require('./helpers/personal-mv-ratings.cjs');

test('owner can record the two officially credited guests only for their exact collaboration video',async()=>{
 const h=harness();
 const {workId,videoId,groupId,memberIds}=require('../data/public-work-credits.json').records.find(row=>row.workId==='rec28ldfRTrLNM');
 const work={id:workId,url:'https://youtu.be/'+videoId,groupIds:[groupId],song:'Synthetic collaboration',ratingIds:[]};
 const addWork=w=>h.seed('works',w.id,{fldhBWXBZE:w.url,fld2wy1cqw:{recordIds:w.groupIds}});
 addWork(work);h.catalog.works.push(work);
 for(const id of memberIds){
  h.seed('members',id,{fldf1alCIu:[{record_ids:['recOtherGroup']}]});
  h.catalog.members.push({id,groupIds:[],formerGroupIds:['recOtherGroup']});
  const input=await h.request({workId,videoId,memberId:id,stylingScore:8});
  const result=await h.api.savePersonalMvRating('owner',input);
  assert.equal(result.score,0);assert.equal(result.stylingScore,8);
 }
 const saved=await h.read();
 assert.deepEqual(saved.entries.map(e=>e.memberId).sort(),memberIds.toSorted());
 const data={...h.catalog,works:[work],personalMvRatings:saved};
 const stats=h.api.summarizeMembers(h.api.prepareCatalog(data));
 assert.deepEqual(stats.rows.map(r=>r.memberId).sort(),memberIds.toSorted());
 assert.equal(h.api.projectPublicCatalog(data).personalMvRatings,undefined);
 const wrong={...work,id:'recDifferentWork'};addWork(wrong);
 for(const input of [
  {memberId:h.member.id,workId,videoId},
  {memberId:memberIds[0],workId:wrong.id,videoId},
  {memberId:memberIds[0],workId,videoId:'wrongVideo1'},
 ])await assert.rejects(h.api.savePersonalMvRating('owner',await h.request(input)),err=>['INVALID_MEMBER','MV_SOURCE_CHANGED'].includes(err.code));
 h.catalog.works=[{...work,groupIds:['recUnrelatedGroup']}];assert.deepEqual((await h.read()).entries,[]);
});
