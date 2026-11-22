import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as wait} from 'node:timers/promises';
import {checkPriorityMvPlayback} from './priority-mv-playback.mjs';

const id='rec28ldfRTrzPI';
const address='https://player.vimeo.com/video/930729644?autoplay=1&muted=1&dnt=1&playsinline=1&quality=4k';
function video(time) {
  return {muted:true,volume:1,paused:false,ended:false,seeking:false,readyState:4,
    videoWidth:3840,videoHeight:2160,currentTime:time};
}

function playbackTab({counts=[1],read,src=address}) {
  let url='about:blank',clicked=false,poll=0,reads=0,reading=false;
  const trace={cleanups:0,leftDuringRead:false,bodies:0,limits:[]};
  const frame={
    count:async()=>clicked?counts[Math.min(poll++,counts.length-1)]:0,first(){return this;},
    evaluate:async()=>src,
  };
  const play={first(){return this;},waitFor:async()=>{},count:async()=>1,click:async()=>{
    clicked=true;
    const canonical=new URL(url);
    canonical.searchParams.delete('video');
    url=canonical.href;
  }};
  const tab={
    goto:async next=>{
      url=next;
      if(next==='about:blank'){trace.cleanups++;trace.leftDuringRead=reading;}
    },
    url:async()=>url,
    playwright:{
      getByRole:()=>play,
      locator(selector){
        if(selector.endsWith(' h1'))return {first(){return this;},evaluate:async()=>'Magnetic'};
        if(selector.endsWith('[role="status"]'))return {count:async()=>0};
        return frame;
      },
      frameLocator(selector){
        assert.ok(selector.includes(JSON.stringify(src)));
        trace.bodies++;
        return {locator:()=>({
          first(){return this;},
          async evaluate(fn,arg,{timeoutMs}){
            trace.limits.push(timeoutMs);reading=true;
            try{
              const state=await read(reads++);
              const body={ownerDocument:{},innerText:state.text??'',
                querySelectorAll:selector=>selector==='video'?state.videos:[]};
              return fn(body,arg);
            } finally {reading=false;}
          },
        })};
      },
    },
  };
  return {tab,trace};
}

test('a remounted muted player uses its active video and the canonical default MV route',async()=>{
  const times=[8,0.4,0.7];
  const {tab,trace}=playbackTab({counts:[1,0,1,1,1],read:i=>({videos:[
    {...video(16),paused:true,muted:false,error:{code:3}},video(times[i]),
  ]})});
  const {rows:[row]}=await checkPriorityMvPlayback(tab,{ids:[id],timeoutMs:1800});
  assert.equal(row.status,'playing');
  assert.equal(row.samePage,true);
  assert.deepEqual(row.samples.map(({time,w,h})=>[time,w,h]),[[0.4,3840,2160],[0.7,3840,2160]]);
  assert.equal(row.kbps,null);
  assert.equal(trace.bodies,3);
  assert.equal(trace.limits[0],500);
  assert.equal(trace.cleanups,1);
});

test('a deadline never navigates away during an outstanding media read',async()=>{
  const {tab,trace}=playbackTab({read:async()=>{await wait(500);return {videos:[]};}});
  const {rows:[row]}=await checkPriorityMvPlayback(tab,{ids:[id],timeoutMs:550});
  assert.equal(row.status,'no-confirmed-progress');
  assert.deepEqual(row.samples,[]);
  assert.equal(trace.cleanups,1);
  assert.equal(trace.leftDuringRead,false);
});

test('the sampler preserves upstream errors and rejects an unapproved iframe before reading it',async()=>{
  const message="We couldn't verify the security of your connection.";
  const upstream=playbackTab({read:()=>({text:message,videos:[]})});
  const {rows:[restricted]}=await checkPriorityMvPlayback(upstream.tab,{ids:[id],timeoutMs:800});
  assert.equal(restricted.status,'provider-error');
  assert.equal(restricted.providerError,'provider-connection-restricted');
  const other=playbackTab({src:'https://player.bilibili.com/player.html',read:()=>assert.fail('unexpected frame read')});
  const {rows:[wrong]}=await checkPriorityMvPlayback(other.tab,{ids:[id],timeoutMs:800});
  assert.equal(wrong.status,'unexpected-player-or-mute');
  assert.equal(other.trace.bodies,0);
});
