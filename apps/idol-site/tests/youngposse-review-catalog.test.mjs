import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createYoungposseReviewCatalog as create} from '../review/youngposse/catalog.mjs';
const design=JSON.parse(fs.readFileSync(new URL('../data/youngposse-review-editorial.json',import.meta.url)));
const poison='PRIVATE_MUST_NOT_ENTER_PUBLIC_REVIEW';
function fixture(){return {members:design.members.map(m=>({id:m.id,groupIds:[design.group.id],note:poison,photo:{fileToken:poison},favorite:9})),works:design.works.map(w=>({id:w.id,url:w.url,videoType:w.videoType,groupIds:[design.group.id],note:poison,score:7.1,stageScore:8.2,watched:poison,stage:w.stage?{...w.stage,title:poison,scoreBinding:{videoId:w.stage.videoId,initializedAt:'2026-01-02T00:00:00Z',initialScore:null,private:poison},private:poison}:null,stageSupplement:{alternatives:w.alternatives.map(a=>({...a,title:poison,sourceEvidence:{note:poison},private:poison}))}})),ratings:design.members.map((m,i)=>({id:'recSaved'+i,memberIds:[m.id],workIds:[design.works[0].id],score:9,stylingScore:8,note:poison,memory:poison,photo:{fileToken:poison},referencePhoto:{fileToken:poison},private:poison}))};}
test('public catalog keeps five members, fourteen distinct primary videos and eight stage bindings with no personal data',()=>{
 const actual=fixture(),catalog=create(design,actual);assert.ok(!JSON.stringify(catalog).includes(poison));assert.equal(catalog.members.length,5);assert.equal(catalog.works.length,14);assert.equal(catalog.works.filter(w=>w.stage?.scoreBinding).length,8);
 const alternatives=catalog.works.flatMap(w=>w.stageSupplement?.alternatives??[]);assert.equal(alternatives.length,2);assert.ok(alternatives.every(a=>a.scorePolicy==='view_only'&&['different','unconfirmed'].includes(a.version.match)&&a.version.differences.length));
 assert.ok(catalog.works.every(w=>w.score===null&&w.stageScore===null&&w.note===''&&w.watched===''));assert.ok(catalog.ratings.every(r=>r.score===null&&r.stylingScore===null&&r.photo===null&&r.referencePhoto===null&&r.personalPhotoEligible===false));assert.deepEqual(catalog.ratings.map(r=>r.id),actual.ratings.map(r=>r.id));
 assert.ok(catalog.works.some(w=>w.videoType==='live clip (MEN CONCERT)'));assert.ok(catalog.works.some(w=>w.videoType==='成员小分队官方MV'));
});
test('mismatched identities, ambiguous relations and altered alternative versions fail closed',()=>{
 for(const mutate of [a=>a.works[0].url+='wrong',a=>a.works[0].stage.videoId='wrongStage1',a=>a.members.push(a.members[0]),a=>a.works.push(a.works[0]),a=>a.ratings.push({...a.ratings[0],id:'recDuplicate'})]){const actual=fixture();mutate(actual);assert.throws(()=>create(design,actual),/identity|Ambiguous/);}
 const actual=fixture();actual.works[0].stage.scoreBinding=null;assert.equal(create(design,actual).works[0].stage.scoreBinding,null);
});
test('unrelated or multi-object relations are excluded without creating missing member/work pairs',()=>{
 const actual=fixture();actual.ratings.push({id:'recOther',memberIds:['recOtherGroup'],workIds:[design.works[0].id]},{id:'recMulti',memberIds:design.members.slice(0,2).map(m=>m.id),workIds:[design.works[0].id]});assert.equal(create(design,actual).ratings.length,5);
});
