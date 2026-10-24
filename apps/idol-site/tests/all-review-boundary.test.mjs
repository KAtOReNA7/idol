import test from 'node:test';
import assert from 'node:assert/strict';
import {clearReviewPersonalValues} from '../review/all/catalog.mjs';
import {createReviewFetch} from '../review/all/read-only-fetch.mjs';

test('review clears personal values at every supported record while preserving identity and relationships',()=>{
 const marker='private-canary';
 const source={groups:[{id:'g',note:marker,average:9,ratedCount:1,memberIds:['m']}],members:[{id:'m',groupIds:['g'],note:marker,favorite:9,photo:{recordId:'m'}}],works:[{id:'w',groupIds:['g'],ratingIds:['r'],note:marker,score:9,stageScore:8,watched:marker,stage:{scoreBinding:{videoId:'video',initialScore:7}}}],ratings:[{id:'r',memberIds:['m'],workIds:['w'],name:marker,note:marker,memory:marker,score:8,stylingScore:7,photo:{recordId:'r'},referencePhoto:{recordId:'r'},personalPhotoEligible:true}],counts:{ratedWorks:1,scoreSum:9}};
 const before=JSON.stringify(source),result=clearReviewPersonalValues(source);
 assert.equal(JSON.stringify(source),before);assert.ok(!JSON.stringify(result).includes(marker));
 assert.deepEqual(result.groups[0].memberIds,['m']);assert.deepEqual(result.works[0].ratingIds,['r']);assert.deepEqual(result.ratings[0].workIds,['w']);
 assert.equal(result.members[0].photo,null);assert.equal(result.ratings[0].referencePhoto,null);assert.equal(result.works[0].stage.scoreBinding.initialScore,null);assert.equal(result.counts.scoreSum,0);
});

test('review reads only exact public catalog scopes and blocks writes, unrelated APIs and foreign origins',async()=>{
 const catalog={groups:[{id:'g'}]},read=createReviewFetch({all:catalog,udtt:catalog},'https://review.test');
 for(const url of ['/api/catalog?shape=display-v1','/api/catalog?artist=udtt&shape=display-v1'])assert.deepEqual(await (await read(url)).json(),catalog);
 for(const url of ['/api/catalog','/api/catalog?shape=raw','/api/catalog?shape=display-v1&shape=display-v1','/api/catalog?shape=display-v1&artist=udtt&artist=udtt','/api/catalog?shape=display-v1&token=secret'])assert.equal((await read(url)).status,400);
 for(const url of ['/api/save','/api/export','/api/catalog?shape=display-v1&artist=unknown','/api/catalog?shape=display-v1&artist=__proto__'])assert.equal((await read(url)).status,404);
 for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await read('/api/catalog?shape=display-v1',{method})).status,405);
 assert.equal((await read(new Request('https://review.test/api/save',{method:'POST'}))).status,405);
 assert.equal((await read('https://foreign.test/api/catalog?shape=display-v1')).status,403);
});

test('UDTT review portrait transport only accepts the exact independently verified member request',async()=>{
 const calls=[],read=createReviewFetch({},'https://review.test',{viewer:{entries:[]},nativePortrait:'/review-all/udtt/lu-historical.jpg',readAsset:async url=>{calls.push(url);return new Response(new Uint8Array([1,2,3]));}});
 const result=await read('/api/media?table=members&record=recvxAPQCF66Sl&index=0');assert.equal(result.status,200);assert.equal(result.headers.get('Content-Type'),'image/jpeg');assert.deepEqual(calls,['/review-all/udtt/lu-historical.jpg']);
 for(const url of ['/api/media?table=members&record=other&index=0','/api/media?table=ratings&record=recvxAPQCF66Sl&index=0','/api/media?table=members&record=recvxAPQCF66Sl&index=1','/api/editorial-assets/viewer?token=x'])assert.equal((await read(url)).status,404);
 assert.equal(calls.length,1);
});
