import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createKatseyeReviewCatalog as create} from '../review/katseye/catalog.mjs';
import {createReadOnlyReviewFetch} from '../review/katseye/read-only-fetch.mjs';
const design=JSON.parse(fs.readFileSync(new URL('../data/katseye-review-editorial.json',import.meta.url)));
const poison='PRIVATE_MUST_NOT_ENTER_PUBLIC_REVIEW';
function fixture(){return {members:design.members.map(m=>({id:m.id,groupIds:[design.group.id],note:poison,favorite:9})),works:design.works.map(w=>({id:w.id,url:w.url,videoType:w.videoType,groupIds:w.groupIds,note:poison,score:7.1,stageScore:8.2,watched:poison,stage:w.stage?{...w.stage,title:poison,scoreBinding:{videoId:w.stage.videoId,initializedAt:'2026-01-02T00:00:00Z',initialScore:null,private:poison}}:null})),ratings:[{id:'recSaved',memberIds:[design.members[0].id],workIds:[design.works[0].id],score:9,note:poison,photo:{fileToken:poison}}]};}
test('review strips personal data while retaining exact native identities and collaboration scope',()=>{
 const actual=fixture(),catalog=create(design,actual);assert.ok(!JSON.stringify(catalog).includes(poison));assert.equal(catalog.members.length,6);assert.equal(catalog.works.length,9);assert.equal(catalog.works.filter(w=>w.stage).length,8);
 assert.ok(catalog.works.every(w=>w.score===null&&w.stageScore===null&&w.note===''&&w.watched===''));assert.equal(catalog.ratings[0].id,'recSaved');assert.equal(catalog.ratings[0].photo,null);assert.deepEqual(catalog.works.map(w=>w.groupIds),design.works.map(w=>w.groupIds));
});
test('mismatched identity and duplicate relationships fail closed',()=>{
 for(const mutate of [a=>a.works[0].url+='wrong',a=>a.works[0].stage.videoId='wrong',a=>a.members.push(a.members[0]),a=>a.works.push(a.works[0]),a=>a.ratings.push({...a.ratings[0],id:'recDuplicate'})]){const a=fixture();mutate(a);assert.throws(()=>create(design,a),/identity|Ambiguous/);}
});
test('absent score bindings and missing relationships remain absent',()=>{
 const a=fixture();a.ratings=[];a.works[0].stage.scoreBinding=null;const c=create(design,a);assert.deepEqual(c.ratings,[]);assert.equal(c.works[0].stage.scoreBinding,null);
});
test('unrelated or multi-member relationships cannot enter this review',()=>{
 const a=fixture();a.ratings.push({id:'recOther',memberIds:['recUnknown'],workIds:[design.works[0].id]},{id:'recMulti',memberIds:design.members.slice(0,2).map(m=>m.id),workIds:[design.works[0].id]});assert.equal(create(design,a).ratings.length,1);
});
test('read-only boundary rejects writes, external requests and raw records',async()=>{
 const request=createReadOnlyReviewFetch(create(design,fixture()),'https://review.invalid');
 for(const [url,init,status] of [['/api/catalog?artist=katseye&shape=display-v1',undefined,200],['/api/save',{method:'POST',body:'{}'},405],['/api/records',undefined,404],['/api/catalog?artist=spia&shape=display-v1',undefined,400],['https://example.com/api/catalog?shape=display-v1',undefined,403]])assert.equal((await request(url,init)).status,status);
});
test('static entry supplies the reviewed timeline that the production layout normally injects',()=>{
 const source=fs.readFileSync(new URL('../review/katseye/entry.tsx',import.meta.url),'utf8');
 const timeline=JSON.parse(fs.readFileSync(new URL('../data/artist-timelines/katseye.json',import.meta.url)));
 assert.match(source,/import timeline from '..\/..\/data\/artist-timelines\/katseye.json'/);assert.match(source,/input:timeline/);
 assert.equal(timeline.groupId,design.group.id);assert.equal(timeline.events.length,14);
 assert.ok(timeline.events.some(e=>e.id==='e-katseye-dream-academy-formation'));
});
