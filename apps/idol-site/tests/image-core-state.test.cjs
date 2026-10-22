'use strict';
// Executes the actual production state helpers, using Node >=24 native TS support.
const test=require('node:test');const assert=require('node:assert/strict');
const image=require('../lib/idol/image-presentation.ts');
const {imageSource,imageInputKey,imageAttemptSource,createImagePresentation,commitImageResult,canRetryImage,retryImagePresentation,activateImageSession,deactivateImageSession,isImageSessionCurrent,IMAGE_RETRY_COOLDOWN_MS}=image;
function freeze(value){return Object.freeze(value);}

test('missing source and real source remain separate, exact original source is retained',()=>{
 for(const value of [null,undefined,'',' ','\t\n']){assert.equal(imageSource(value),null);assert.equal(createImagePresentation(value,'fixture').status,'missing');}
 const url='https://image-fixture.example/signed/photo.png?Signature=A%2BB&expires=2000';
 assert.equal(imageSource(url),url);assert.equal(createImagePresentation(url,'fixture').source,url);
 assert.equal(createImagePresentation(url,'fixture').status,'loading');
 assert.equal(canRetryImage(createImagePresentation(null,'fixture'),0),false);
});
test('one generation has one terminal outcome; late opposite load/error cannot overwrite it',()=>{
 const pending=freeze(createImagePresentation('/fixture-a.png','member:A'));
 const loaded=commitImageResult(pending,pending.generation,'loaded');
 assert.equal(loaded.status,'loaded');assert.equal(pending.status,'loading');
 assert.strictEqual(commitImageResult(loaded,loaded.generation,'error'),loaded);
 const failed=commitImageResult(pending,pending.generation,'error');
 assert.equal(failed.status,'error');assert.strictEqual(commitImageResult(failed,failed.generation,'loaded'),failed);
 assert.strictEqual(commitImageResult(pending,pending.generation+1,'loaded'),pending);
});
test('manual retry is explicit, throttle protected and rejects repeat clicks while loading',()=>{
 let state=commitImageResult(createImagePresentation('/fixture-a.png','member:A'),0,'error');
 const original=freeze(state);assert.equal(canRetryImage(original,1000),true);
 state=retryImagePresentation(original,0,1000);
 assert.equal(state.status,'loading');assert.equal(state.attempt,1);assert.equal(state.generation,1);
 assert.equal(original.attempt,0);assert.strictEqual(retryImagePresentation(state,1,1000),state);
 assert.strictEqual(retryImagePresentation(state,0,5000),state,'stale retry closure cannot affect a new attempt');
 state=commitImageResult(state,1,'error');
 assert.strictEqual(retryImagePresentation(state,1,1000+IMAGE_RETRY_COOLDOWN_MS-1),state);
 assert.strictEqual(retryImagePresentation(state,1,999),state,'a backwards wall clock cannot bypass throttle');
 const next=retryImagePresentation(state,1,1000+IMAGE_RETRY_COOLDOWN_MS);
 assert.equal(next.attempt,2);assert.equal(next.generation,2);assert.equal(next.status,'loading');
 for(const time of [NaN,Infinity,-Infinity])assert.equal(canRetryImage(state,time),false);
});
test('stale events from the previous attempt cannot settle a newer pending image',()=>{
 const failed=commitImageResult(createImagePresentation('/fixture-a.png','member:A'),0,'error');
 const current=retryImagePresentation(failed,0,1000);
 assert.strictEqual(commitImageResult(current,0,'error'),current);
 assert.strictEqual(commitImageResult(current,0,'loaded'),current);
 assert.equal(commitImageResult(current,1,'loaded').status,'loaded');
});
test('source, stable identity and explicit attempt keys isolate equal URLs and A to B to A sessions',()=>{
 const a=imageInputKey('/same.png','member:A',0);const b=imageInputKey('/same.png','member:B',0);
 assert.notEqual(a,b);assert.notEqual(a,imageInputKey('/same.png','member:A',1));
 assert.notEqual(a,imageInputKey('/other.png','member:A',0));
 assert.notEqual(imageInputKey('a|b','c'),imageInputKey('a','b|c'),'keys are structurally delimited');
 const old=createImagePresentation('/same.png','member:A');const next=createImagePresentation('/same.png','member:B');
 const returned=createImagePresentation('/same.png','member:A');
 assert.notStrictEqual(old,returned);assert.equal(next.status,'loading');assert.equal(returned.status,'loading');
 const lease={active:false,epoch:0};const oldEpoch=activateImageSession(lease);deactivateImageSession(lease);
 const newEpoch=activateImageSession(lease);assert.equal(isImageSessionCurrent(lease,oldEpoch),false);assert.equal(isImageSessionCurrent(lease,newEpoch),true);
});
test('cleanup invalidates deferred cache/events and Strict effect replay gets a distinct active lease',()=>{
 const lease={active:false,epoch:0};assert.equal(isImageSessionCurrent(lease,0),false);
 const first=activateImageSession(lease);assert.equal(isImageSessionCurrent(lease,first),true);
 deactivateImageSession(lease);assert.equal(isImageSessionCurrent(lease,first),false);
 const replay=activateImageSession(lease);assert.notEqual(first,replay);assert.equal(isImageSessionCurrent(lease,first),false);assert.equal(isImageSessionCurrent(lease,replay),true);
 deactivateImageSession(lease);assert.equal(isImageSessionCurrent(lease,replay),false);
 // This exercises the actual lease used by React, not a claim of running DOM effects.
});
test('thumbnail and original have independent failure state even when presented together',()=>{
 const thumb=commitImageResult(createImagePresentation('/thumb.png','work:fixture:thumb'),0,'error');
 const full=createImagePresentation('/full.png','work:fixture:full');
 const loadedFull=commitImageResult(full,0,'loaded');
 assert.equal(thumb.status,'error');assert.equal(loadedFull.status,'loaded');assert.equal(full.status,'loading');
 assert.equal(retryImagePresentation(thumb,0,1000).status,'loading');assert.equal(loadedFull.status,'loaded');
});
test('only existing ratings media retry protocol changes URL and preserves identity fields',()=>{
 const original='/api/media?table=ratings&record=recFixtureImageRatingA&index=2&retry=4';
 const next=imageAttemptSource(original,2);const query=new URL(next,'https://fixture.invalid').searchParams;
 assert.equal(query.get('table'),'ratings');assert.equal(query.get('record'),'recFixtureImageRatingA');assert.equal(query.get('index'),'2');assert.equal(query.get('retry'),'6');
 for(const url of ['https://image-fixture.example/signed.png?Signature=A%2BB','https://i.ytimg.com/vi/FixtUrE0001/hqdefault.jpg','/api/media?table=members&record=recFixtureMember&index=0','/fixture.png','/api/media?table=ratings&record=recFixtureRating&index=0&retry=bad','/api/media?table=ratings&table=members&record=recFixtureRating&index=0'])assert.equal(imageAttemptSource(url,2),url,url);
 assert.equal(imageAttemptSource(original,0),original);assert.equal(imageAttemptSource(null,1),null);
});
test('retry key policy consumes activation keys only, leaving lightbox Tab and Escape available',()=>{
 for(const key of ['Enter',' ','Spacebar'])assert.equal(image.isImageRetryActivationKey(key),true);
 for(const key of ['Tab','Escape','ArrowRight',''])assert.equal(image.isImageRetryActivationKey(key),false);
});
test('actual warm-cache classifier distinguishes cold, loaded and failed native-image completion',()=>{
 assert.equal(image.cachedImageResult({complete:false,naturalWidth:0}),null);
 assert.equal(image.cachedImageResult({complete:false,naturalWidth:600}),null);
 assert.equal(image.cachedImageResult({complete:true,naturalWidth:600}),'loaded');
 assert.equal(image.cachedImageResult({complete:true,naturalWidth:0}),'error');
 for(const naturalWidth of [-1,NaN,Infinity])assert.equal(image.cachedImageResult({complete:true,naturalWidth}),null);
 const lease={active:false,epoch:0};const before=activateImageSession(lease);deactivateImageSession(lease);activateImageSession(lease);
 assert.equal(isImageSessionCurrent(lease,before),false,'native cache snapshot from an old mount is not current');
});
