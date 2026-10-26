import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadOnlyReviewFetch} from '../review/hearts2hearts/read-only-fetch.mjs';

const origin='https://review.invalid';
const catalog={groups:[{id:'rec28ldfRTiBAq'}],ratings:[],warning:'示例资料 · 评分不写入正式手帐'};
const fetch=createReadOnlyReviewFetch(catalog,origin);

test('only explicit hearts2hearts display-catalog GETs return the synthetic fixture', async()=>{
  for(const url of ['/api/catalog?shape=display-v1','/api/catalog?artist=hearts2hearts&shape=display-v1']){
    const response=await fetch(url);assert.equal(response.status,200);assert.deepEqual(await response.json(),catalog);assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
  for(const url of ['/api/catalog','/api/catalog?artist=genblue&shape=display-v1','/api/catalog?shape=display-v1&shape=display-v1','/api/catalog?shape=display-v1&artist=hearts2hearts&artist=hearts2hearts','/api/catalog?shape=display-v1&refresh=1','/api/catalog?shape=display-v1&extra=yes']) assert.equal((await fetch(url)).status,400,url);
});

test('save, identity, image proxy and external requests fail closed, including Request objects',async()=>{
  for(const method of ['POST','PUT','PATCH','DELETE','HEAD','OPTIONS']) assert.equal((await fetch('/api/catalog?shape=display-v1',{method})).status,405,method);
  assert.equal((await fetch(new Request(origin+'/api/save',{method:'POST',body:'{}'}))).status,405);
  for(const url of ['/api/save','/api/status','/api/records?table=works','/api/image?token=example','/auth/session','/api/catalog/']) assert.equal((await fetch(url)).status,404,url);
  assert.equal((await fetch('https://production.invalid/api/catalog?shape=display-v1')).status,403);
  const controller=new AbortController();controller.abort();await assert.rejects(()=>fetch('/api/catalog?shape=display-v1',{signal:controller.signal}),{name:'AbortError'});
});
