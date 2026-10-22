const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { AsyncLocalStorage } = require('node:async_hooks');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root,'lib/idol/feishu.ts'),'utf8');
const contexts = new AsyncLocalStorage();
const flush = () => new Promise(resolve => setImmediate(resolve));
function observe(promise) {
  const state = {status:'pending'};
  promise.then(value => {state.status='fulfilled';state.value=value;}, error => {state.status='rejected';state.error=error.message;});
  return state;
}
class Clock {
  now = 1000;
  timers = [];
  events = [];
  setTimeout = (callback, delay) => {
    const timer = {owner:contexts.getStore(), due:this.now+delay, callback};
    this.timers.push(timer);
    this.events.push({event:'timer',owner:timer.owner,at:this.now,due:timer.due});
    return timer;
  };
  sleep = delay => new Promise(resolve => this.setTimeout(resolve, delay));
  drop(owner) {
    const count = this.timers.filter(timer => timer.owner === owner).length;
    this.timers = this.timers.filter(timer => timer.owner !== owner);
    this.events.push({event:'drop-unsettled-timers',owner,at:this.now,count});
    return count;
  }
  async advance(to, {late=false}={}) {
    assert.ok(to >= this.now);
    if (late) this.now = to;
    let fired=0;
    for (;;) {
      this.timers.sort((a,b) => a.due-b.due);
      const timer=this.timers[0];
      if (!timer || timer.due>to) break;
      this.timers.shift();
      this.now=Math.max(this.now,timer.due);
      contexts.run(timer.owner, timer.callback);
      await flush();
      assert.ok(++fired<10000,'model must not spin');
    }
    this.now=to;
    await flush();
  }
  async fireEarly(owner, at) {
    const index=this.timers.findIndex(timer => timer.owner === owner);
    assert.ok(index>=0);
    const [timer]=this.timers.splice(index,1);
    assert.ok(at<timer.due);
    this.now=at;
    contexts.run(timer.owner,timer.callback);
    await flush();
  }
}
function runtime(clock,customFetch) {
  const starts=[],signals=[],exports={};
  const fetch=(url, options)=>{
    if(url.endsWith('/tenant_access_token/internal'))return Promise.resolve({ok:true,status:200,json:async()=>({code:0,tenant_access_token:'synthetic-token',expire:3600})});
    starts.push({owner:contexts.getStore(),at:clock.now,path:new URL(url).pathname,method:options.method});
    return customFetch?customFetch(url,options):Promise.resolve({ok:true,status:200,json:async()=>({code:0,data:{ok:true}})});
  };
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext('(function(require,exports){'+code+'})',{
    Date:{now:()=>clock.now},setTimeout:clock.setTimeout,fetch,URL,Response,
    AbortSignal:{timeout:ms=>{signals.push({owner:contexts.getStore(),at:clock.now,ms});return {synthetic:true};}},
  })(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;assert.equal(name,'cloudflare:workers');return {env:{FEISHU_APP_ID:'synthetic-app',FEISHU_APP_SECRET:'synthetic-secret'}};},exports);
  const call=(name,method='GET')=>contexts.run(name,()=>exports.api('/'+name,undefined,method));
  const media=name=>contexts.run(name,()=>exports.mediaBytes(name));
  return {starts,signals,call,media};
}

function spaced(starts){for(let i=1;i<starts.length;i++)assert.ok(starts[i].at-starts[i-1].at>=220,JSON.stringify(starts));}
test('actual gate: discarded caller timer never strands surviving or later requests',async()=>{
 const clock=new Clock(),api=runtime(clock);await api.call('warm');
 const a=observe(api.call('A'));await flush();const b=observe(api.call('B'));await flush();
 assert.equal(clock.drop('A'),1);await clock.advance(1220);const c=observe(api.call('C'));await flush();await clock.advance(1440);
 assert.equal(a.status,'pending');assert.equal(b.status,'fulfilled');assert.equal(c.status,'fulfilled');
 assert.deepEqual(api.starts.map(s=>s.at),[1000,1220,1440]);spaced(api.starts);
 assert.deepEqual(api.signals.filter(s=>s.ms===20000).map(s=>s.owner),['warm','B','C']);
});
test('actual gate: delayed simultaneous timers re-check and keep actual fetch starts spaced',async()=>{
 const clock=new Clock(),api=runtime(clock);await api.call('warm');const jobs=['A','B','C','D'].map(n=>api.call(n));await flush();
 await clock.advance(5000,{late:true});assert.deepEqual(api.starts.map(s=>s.at),[1000,5000]);await clock.advance(5660);await Promise.all(jobs);
 assert.deepEqual(api.starts.map(s=>s.at),[1000,5000,5220,5440,5660]);spaced(api.starts);
});
test('actual gate: early timer cannot start a request too soon',async()=>{
 const clock=new Clock(),api=runtime(clock);await api.call('warm');const a=api.call('A');await flush();await clock.fireEarly('A',1100);
 assert.equal(api.starts.length,1);await clock.advance(1220);await a;spaced(api.starts);
});
test('actual gate: abandoned in-flight fetch does not own future start slots',async()=>{
 const clock=new Clock(),api=runtime(clock,url=>url.endsWith('/hold')?new Promise(()=>{}):Promise.resolve({ok:true,status:200,json:async()=>({code:0,data:{ok:true}})}));
 const a=observe(api.call('hold'));await flush();const b=api.call('B');await flush();await clock.advance(1220);await b;
 assert.equal(a.status,'pending');spaced(api.starts);assert.equal(api.starts.length,2);
});
test('actual gate: GET timeout retries and failing PUT stay isolated from other callers',async()=>{
 const clock=new Clock(),counts=new Map(),api=runtime(clock,async(url)=>{const k=new URL(url).pathname;counts.set(k,(counts.get(k)||0)+1);if(url.endsWith('/timeout')||url.endsWith('/put')){const e=Error('synthetic timed-out upstream');e.name='TimeoutError';throw e;}return {ok:true,status:200,json:async()=>({code:0,data:{ok:true}})};});
 const timeout=observe(api.call('timeout')),put=observe(api.call('put','PUT')),other=observe(api.call('ok'));await flush();await clock.advance(10000);
 assert.equal(timeout.status,'rejected');assert.equal(put.status,'rejected');assert.equal(other.status,'fulfilled');assert.equal(counts.get('/open-apis/timeout'),3);assert.equal(counts.get('/open-apis/put'),1);spaced(api.starts);
 assert.equal(api.signals.filter(s=>s.ms===20000).length,api.starts.length);
});
test('actual gate: media and records share the same start spacing',async()=>{
 const clock=new Clock(),api=runtime(clock,async url=>url.includes('/drive/')?new Response(new Uint8Array([1]),{headers:{'Content-Type':'image/jpeg'}}):{ok:true,status:200,json:async()=>({code:0,data:{ok:true}})});
 const jobs=[api.call('record'),api.media('synthetic-image'),api.call('record2')];await flush();await clock.advance(1440);await Promise.all(jobs);spaced(api.starts);assert.equal(api.signals.filter(s=>s.ms===25000).length,1);
});
test('actual gate: many contenders with discarded timers still progress and stay below five starts per second',async()=>{
 const clock=new Clock(),api=runtime(clock);await api.call('warm');const jobs=Array.from({length:40},(_,i)=>({name:'R'+i,state:observe(api.call('R'+i)),drop:i%7===0}));await flush();for(const j of jobs)if(j.drop)assert.equal(clock.drop(j.name),1);
 await clock.advance(20000,{late:true});await clock.advance(40000);for(const j of jobs)assert.equal(j.state.status,j.drop?'pending':'fulfilled');spaced(api.starts);
 for(const s of api.starts)assert.ok(api.starts.filter(x=>x.at>=s.at&&x.at<s.at+1000).length<=5);
});
