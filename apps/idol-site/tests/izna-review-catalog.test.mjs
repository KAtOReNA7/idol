import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createIznaReviewCatalog} from '../review/izna/catalog.mjs';

const design=JSON.parse(fs.readFileSync(new URL('../data/izna-editorial.json',import.meta.url)));
const poison='PRIVATE_DATA_MUST_NEVER_ENTER_REVIEW';
function fixture(){
  const members=design.members.map(member=>({id:member.id,groupIds:member.relationship==='former'?[]:[design.group.id],formerGroupIds:member.relationship==='former'?[design.group.id]:[],note:poison,photo:{fileToken:poison},favorite:7.3}));
  const works=design.works.filter(video=>video.type==='MV').map(video=>{
    const stage=design.works.find(row=>row.type==='STAGE'&&row.parentWorkId===video.id);
    return {id:video.id,url:video.url,videoType:video.videoType,groupIds:[design.group.id],score:9.7,stageScore:8.6,note:poison,watched:poison,source:poison,stage:stage?{videoId:stage.videoId,url:stage.url,kind:stage.videoType,title:poison,scoreBinding:{videoId:stage.videoId,initializedAt:'2026-01-02T00:00:00Z',initialScore:null,privateExtra:poison},privateExtra:poison}:null};
  });
  const ratings=design.works.filter(video=>video.type==='MV'&&video.participantEvidence?.status==='verified_named_mv_participants').flatMap(video=>video.memberIds.map((id,index)=>({id:'recSynthetic'+video.id+index,memberIds:[id],workIds:[video.id],score:9.4,stylingScore:9.2,note:poison,memory:poison,recognition:poison,source:poison,verification:poison,photo:{fileToken:poison},referencePhoto:{fileToken:poison},privateExtra:poison})));
  return {members,works,ratings,privateExtra:poison};
}

test('public catalog removes private fields while retaining exact stable MV/stage and relation identity',()=>{
  const actual=fixture(),catalog=createIznaReviewCatalog(design,actual);
  assert.ok(!JSON.stringify(catalog).includes(poison));
  assert.equal(catalog.groups.length,1);assert.equal(catalog.members.length,7);assert.equal(catalog.works.length,9);assert.equal(catalog.ratings.length,12);
  assert.equal(catalog.counts.ratedWorks,0);assert.equal(catalog.counts.scoreSum,0);
  assert.ok(catalog.members.every(member=>member.favorite===null&&member.note===''&&member.photo===null));
  assert.ok(catalog.works.every(work=>work.score===null&&work.stageScore===null&&work.note===''&&work.watched===''));
  assert.ok(catalog.ratings.every(row=>row.score===null&&row.stylingScore===null&&row.note===''&&row.memory===''&&row.photo===null&&row.referencePhoto===null&&row.personalPhotoEligible===false));
  assert.deepEqual(catalog.ratings.map(row=>row.id),actual.ratings.map(row=>row.id));
  const mamma=catalog.works.find(work=>work.id==='rec28ldfRTrNwO');
  assert.equal(mamma.url,'https://www.youtube.com/watch?v=2fyFx2u5fbU');
  assert.equal(mamma.stage.videoId,'miV6819bnkc');
  assert.notEqual(new URL(mamma.url).searchParams.get('v'),mamma.stage.videoId);
  assert.deepEqual(mamma.stage.scoreBinding,{videoId:'miV6819bnkc',initializedAt:'2026-01-02T00:00:00Z',initialScore:null});
  const sass=catalog.works.find(work=>work.id==='rec28ldfRTrNBu');
  assert.equal(new URL(sass.url).searchParams.get('v'),sass.stage.videoId,'same-video two-slot case retains the original identities');
});

test('source mismatches and ambiguous saved relationships fail closed; absent stage bindings stay absent',()=>{
  let actual=fixture();actual.works[0].url='https://www.youtube.com/watch?v=WRONG_VIDEO';
  assert.throws(()=>createIznaReviewCatalog(design,actual),/work identity/);
  actual=fixture();actual.works[0].videoType='舞台';
  assert.throws(()=>createIznaReviewCatalog(design,actual),/work identity/);
  actual=fixture();actual.works[0].stage.videoId='wrongStage1';
  assert.throws(()=>createIznaReviewCatalog(design,actual),/stage video identity/);
  actual=fixture();actual.works[0].stage.kind='MV';
  assert.throws(()=>createIznaReviewCatalog(design,actual),/stage video identity/);
  actual=fixture();actual.members.push({...actual.members[0]});
  assert.throws(()=>createIznaReviewCatalog(design,actual),/member identity/);
  actual=fixture();actual.ratings.push({...actual.ratings[0],id:'recDuplicate'});
  assert.throws(()=>createIznaReviewCatalog(design,actual),/Ambiguous saved review/);
  actual=fixture();actual.works[0].stage.scoreBinding=null;
  assert.equal(createIznaReviewCatalog(design,actual).works[0].stage.scoreBinding,null);
});

test('unrelated groups, multi-object rows and unverified video participant claims never become synthetic relations',()=>{
  const actual=fixture();
  actual.ratings.push({id:'recUnrelated',memberIds:['recOther'],workIds:['recUnknown'],note:poison});
  actual.ratings.push({id:'recMultiMember',memberIds:design.members.slice(0,2).map(member=>member.id),workIds:['rec28ldfRTrNwO'],note:poison});
  const catalog=createIznaReviewCatalog(design,actual);
  assert.equal(catalog.ratings.length,12);
  assert.ok(catalog.ratings.every(row=>row.memberIds.length===1&&row.workIds.length===1));
});
