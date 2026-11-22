const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test'),ts=require('typescript');
const source=require('./helpers/catalog-view-source.cjs')();
const prefix=source.slice(source.indexOf('export default function App(){'),source.indexOf(' function currentLabel(){')).replace('export default function App(){','function App(){');
const response=source.split('\n').find(s=>s.startsWith('async function readResponse('));
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
// Execute the actual App loading prefix, not a copied implementation. Rendering,
// browser reconciliation, and Editor are intentionally outside this synthetic harness.
const code=compile(response+'\n'+prefix+'return {load,data};}\nexports.App=App;');
const workRequest=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/lib/idol/work-catalog-request');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function harness(initial={}){
 const states=[],requests=[],effects=[],refs=[],callbacks=[],timers=new Map();
 const detailModule=deferred(),detailModuleLoads=[];
 const view={routeReady:true,work:null,sequence:undefined,canEdit:true,...initial};
 let cursor=0,refIndex=0,callbackIndex=0,effectIndex=0,pending=[],unmounted=false,writesAfterUnmount=0,now=0,next=0,api;
 const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((value,i)=>Object.is(value,b[i]));
 const timer={setTimeout:(f,ms)=>{const id=++next;timers.set(id,{f,due:now+ms,ms});return id;},clearTimeout:id=>timers.delete(id)};
 const helper={};vm.runInNewContext(compile(fs.readFileSync('lib/idol/catalog-read-deadline.ts','utf8')),{exports:helper,AbortController,DOMException,...timer});
 const exports={};
 vm.runInNewContext(code,{exports,...workRequest,useCanEdit:()=>view.canEdit,catalogReadWithDeadline:helper.catalogReadWithDeadline,AbortController,
  URLSearchParams,window:{location:new URL('https://site.invalid/')},
  loadWorkDetailModule:()=>{detailModuleLoads.push(view.work);return detailModule.promise;},
  useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return [states[i],n=>{states[i]=n;if(unmounted)writesAfterUnmount++;}];},
  useRef:v=>{const i=refIndex++;return refs[i]??(refs[i]={current:v});},
  useCallback:(fn,deps)=>{const i=callbackIndex++;if(!equal(callbacks[i]?.deps,deps))callbacks[i]={fn,deps};return callbacks[i].fn;},
  useEffect:(fn,deps)=>{const i=effectIndex++;if(!equal(effects[i]?.deps,deps)){const prior=effects[i];effects[i]={fn,deps};pending.push(()=>{prior?.cleanup?.();effects[i].cleanup=fn();});}},
  useCatalogGroupViews:()=>({phase:'idle',value:null}),useBrowseJourney:()=>({routeReady:view.routeReady,route:{work:view.work},filters:{},sequence:view.sequence}),requestMessage:e=>String(e),...timer,
  fetch:(url,options)=>{const d=deferred();requests.push({...d,url,options});if(url==='/api/status')d.resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>({source:'feishu'})});return d.promise;}
 });
 function render(patch={}){Object.assign(view,patch);cursor=refIndex=callbackIndex=effectIndex=0;pending=[];api=exports.App();for(const run of pending)run();return api;}
 render();
 return {states,requests,timers,detailModule,detailModuleLoads,render,load:(...args)=>api.load(...args),unmount(){unmounted=true;for(const e of effects)e.cleanup?.();},replay(){for(const e of effects)e.cleanup?.();for(const e of effects)e.cleanup=e.fn();},writes:()=>writesAfterUnmount,
 catalog:()=>requests.filter(r=>r.url.startsWith('/api/catalog')),
 async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.f();}await tick();},
 reply(r,d){r.resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>d});}};
}
const cached=()=>({mode:'live',groups:[],members:[],works:[{id:'work',score:0,note:'保留备注',watched:'已观看'}],ratings:[],cache:{refreshRecommended:true}});

test('initial route hydration, related version navigation and full library keep the right data',async()=>{
 const h=harness({routeReady:false});await tick();assert.equal(h.catalog().length,0);assert.deepEqual(h.detailModuleLoads,[]);
 h.render({routeReady:true,work:'recOne'});await tick();
 assert.deepEqual(h.detailModuleLoads,['recOne']);
 assert.equal(h.catalog().length,1);
 h.detailModule.reject(Error('early module request failed'));
 const focus={...cached(),scope:{type:'work',workId:'recOne'},cache:{}};
 const full={...cached(),cache:{}};
 assert.equal(h.catalog()[0].options.headers.Prefer,'omit-stage-candidates, work-detail=recOne');
 h.reply(h.catalog()[0],focus);await tick();assert.equal(h.render().data,focus);
 const saved=h.load(true);await tick();
 assert.ok(h.catalog()[1].url.endsWith('refresh=1'));
 assert.equal(h.catalog()[1].options.headers.Prefer,'omit-stage-candidates, work-detail=recOne');
 h.reply(h.catalog()[1],focus);await saved;
 assert.equal(h.render({work:'recVersion'}).data,null);await tick();
 const version=h.catalog()[2];assert.equal(version.options.headers.Prefer,'omit-stage-candidates, work-detail=recVersion');
 assert.equal(h.render({work:'recOne'}).data,focus);
 assert.ok(version.options.signal.aborted);
 h.reply(version,{...focus,scope:{type:'work',workId:'recVersion'}});await tick();assert.equal(h.render().data,focus);
 assert.equal(h.render({work:null}).data,null);await tick();
 assert.equal(h.catalog()[3].options.headers.Prefer,'omit-stage-candidates');
 h.reply(h.catalog()[3],full);await tick();assert.equal(h.render().data,full);
 assert.equal(h.render({work:'recVersion'}).data,full);await tick();assert.equal(h.catalog().length,4);
 assert.deepEqual(h.detailModuleLoads,['recOne','recVersion']);
 h.unmount();
});
test('restored watch queues and full responses from legacy servers keep every library link available',async()=>{
 for(const sequence of [{ids:['recOne','recNext']},undefined]){
  const h=harness({work:'recOne',sequence});await tick();
  assert.deepEqual(h.detailModuleLoads,sequence?[]:['recOne']);
  assert.equal(h.catalog()[0].options.headers.Prefer,sequence?'omit-stage-candidates':'omit-stage-candidates, work-detail=recOne');
  const full={...cached(),cache:{}};h.reply(h.catalog()[0],full);await tick();
  assert.equal(h.render({work:'recNext'}).data,full);
  h.render({work:null,sequence:undefined});await tick();
  assert.equal(h.catalog().length,1);h.unmount();
 }
});
test('a deleted target can return the full library and mismatched scoped replies stay out of the detail',async()=>{
 const h=harness({work:'recDeleted'});await tick();
 h.reply(h.catalog()[0],{...cached(),scope:{type:'work',workId:'recOther'},cache:{}});
 await tick();assert.equal(h.render().data,null);assert.match(h.states[1],/重新载入/);
 const retry=h.load();await tick();
 const library={...cached(),counts:{works:1},cache:{}};
 h.reply(h.catalog()[1],library);await retry;
 assert.equal(h.render().data,library);
 assert.equal(h.render({work:null}).data.counts.works,1);
 await tick();assert.equal(h.catalog().length,2);h.unmount();
});

for(const phase of ['fetch','json'])test('initial '+phase+' timeout releases loading and allows recovery',async()=>{
 const h=harness();await tick();const r=h.catalog()[0];let body;
 if(phase==='json'){body=deferred();r.resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick();}
 assert.equal([...h.timers.values()][0].ms,30000);await h.advance(29999);assert.equal(h.states[2],true);await h.advance(1);
 assert.equal(h.states[0],null);assert.equal(h.states[2],false);assert.match(h.states[1],/重新载入/);assert.ok(r.options.signal.aborted);
 const p=h.load();await tick();const d={...cached(),cache:{}};h.reply(h.catalog()[1],d);await p;assert.equal(h.states[0],d);assert.equal(h.states[1],'');assert.equal(h.timers.size,0);
 (body??r).reject(Error('late reject'));await tick();assert.equal(h.states[0],d);h.unmount();
});
test('background has a fresh deadline; timeout keeps exact cached values and reenables updating',async()=>{
 const h=harness();await tick();await h.advance(25000);const d=cached(),before=JSON.stringify(d);h.reply(h.catalog()[0],d);await tick();
 assert.equal(h.states[2],false);assert.equal(h.states[3],true);await h.advance(5000);assert.equal(h.states[3],true);await h.advance(25000);
 assert.equal(h.states[0],d);assert.equal(JSON.stringify(d),before);assert.equal(h.states[3],false);assert.match(h.states[1],/内容更新.*更新内容/);
 const p=h.load(true);await tick();const fresh={...d,cache:{},fresh:true};h.reply(h.catalog()[2],fresh);await p;assert.equal(h.states[0],fresh);assert.equal(h.states[1],'');h.unmount();
});
test('force read JSON timeout keeps saved-content context without reporting save failure',async()=>{
 const h=harness();await tick();const d={...cached(),cache:{}};h.reply(h.catalog()[0],d);await tick();const p=h.load(true);await tick();const r=h.catalog()[1],body=deferred();
 r.resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick();await h.advance(30000);await p;
 assert.equal(h.states[0],d);assert.equal(h.states[3],false);assert.match(h.states[1],/内容更新/);assert.doesNotMatch(h.states[1],/保存失败/);body.reject(Error('late'));await tick();h.unmount();
});
test('post-save force read cancels background and late old success cannot overwrite',async()=>{
 const h=harness();await tick();h.reply(h.catalog()[0],cached());await tick();const old=h.catalog()[1],p=h.load(true);await tick();assert.ok(old.options.signal.aborted);
 const newest={...cached(),cache:{},saved:true};h.reply(h.catalog()[2],newest);await p;h.reply(old,{old:true});await tick();
 assert.equal(h.states[0],newest);assert.equal(h.states[1],'');assert.equal(h.states[3],false);h.unmount();
});
test('rapid force reads preserve newest pending state and ignore earlier rejects',async()=>{
 const h=harness();await tick();const a=h.load(true);await tick();const b=h.load(true);await tick();
 h.catalog()[0].reject(Error('old'));h.catalog()[1].reject(Error('older force'));await tick();assert.equal(h.states[3],true);assert.equal(h.states[1],'');
 const d={...cached(),cache:{}};h.reply(h.catalog()[2],d);await Promise.all([a,b]);assert.equal(h.states[0],d);assert.equal(h.states[3],false);h.unmount();
});
test('unmount cancels read, prevents background, and makes late onSaved refresh inert',async()=>{
 const h=harness();await tick();const old=h.catalog()[0];h.unmount();h.reply(old,cached());await tick();await h.load(true);
 assert.ok(old.options.signal.aborted);assert.equal(h.catalog().length,1);assert.equal(h.writes(),0);assert.equal(h.timers.size,0);
});
test('unmount during background ignores late JSON failure',async()=>{
 const h=harness();await tick();h.reply(h.catalog()[0],cached());await tick();const body=deferred(),r=h.catalog()[1];
 r.resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick();h.unmount();body.reject(Error('late'));await tick();
 assert.equal(h.writes(),0);assert.ok(r.options.signal.aborted);assert.equal(h.timers.size,0);
});
test('immediate unmount and Strict Mode replay do not start abandoned reads',async()=>{
 const h=harness();h.unmount();await tick();assert.equal(h.catalog().length,0);assert.equal(h.writes(),0);
 const s=harness();s.replay();await tick();assert.equal(s.catalog().length,1);const d={...cached(),cache:{}};s.reply(s.catalog()[0],d);await tick();assert.equal(s.states[0],d);s.unmount();
});
test('status remains independent, no-store URLs and read-only methods remain exact',async()=>{
 const h=harness();await tick();const status=h.requests.find(r=>r.url==='/api/status');assert.ok(status.options.signal instanceof AbortSignal);await tick();assert.equal(h.states[4],false);
 h.reply(h.catalog()[0],cached());await tick();const p=h.load(true);await tick();h.reply(h.catalog()[2],{...cached(),cache:{}});await p;
 assert.deepEqual(h.catalog().map(r=>r.url),['/api/catalog?shape=display-v1','/api/catalog?shape=display-v1&refresh=background','/api/catalog?shape=display-v1&refresh=1']);
 assert.ok(h.catalog().every(r=>r.options.headers.Prefer==='omit-stage-candidates'));
 assert.equal(status.options.headers?.Prefer,undefined);
 assert.ok(h.requests.every(r=>r.options.cache==='no-store'&&!r.options.method&&!r.options.body));h.unmount();
});
test('HTTP failure preserves old data and original error mapping',async()=>{
 const h=harness();await tick();const d={...cached(),cache:{}};h.reply(h.catalog()[0],d);await tick();const p=h.load(true);await tick();
 h.catalog()[1].resolve({ok:false,headers:{get:()=> 'application/json'},json:async()=>({error:'TEST_FAILURE'})});await p;
 assert.equal(h.states[0],d);assert.equal(h.states[1],'TEST_FAILURE');assert.equal(h.states[3],false);h.unmount();
});
test('catalog reads stay independent of editor writes and retain the native status and refresh controls',()=>{
 const status=source.split('\n').find(s=>s.includes("fetch('/api/status'"));
 assert.doesNotMatch(prefix,/\/api\/(save|records|export)\b/);
 assert.ok(status.includes("setCanManage(!!s&&typeof s==='object'&&'source' in s&&s.source==='native')"));
 assert.match(source,/onSaved=\{\(\)=>load\(true\)\}/);
 assert.match(source,/disabled=\{refreshing\}/);assert.match(source,/仍可浏览已有内容/);
});
