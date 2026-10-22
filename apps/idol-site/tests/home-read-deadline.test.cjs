const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test'),ts=require('typescript'),crypto=require('node:crypto');
const source=fs.readFileSync('app/page.tsx','utf8');
const prefix=source.slice(source.indexOf('export default function App(){'),source.indexOf(' function currentLabel(){')).replace('export default function App(){','function App(){');
const response=source.split('\n').find(s=>s.startsWith('async function readResponse('));
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
// Execute the actual App loading prefix, not a copied implementation. Rendering,
// browser reconciliation, and Editor are intentionally outside this synthetic harness.
const code=compile(response+'\n'+prefix+'return {load};}\nexports.App=App;');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function harness(){
 const states=[],requests=[],effects=[],timers=new Map();let cursor=0,unmounted=false,writesAfterUnmount=0,now=0,next=0;
 const timer={setTimeout:(f,ms)=>{const id=++next;timers.set(id,{f,due:now+ms,ms});return id;},clearTimeout:id=>timers.delete(id)};
 const helper={};vm.runInNewContext(compile(fs.readFileSync('lib/idol/catalog-read-deadline.ts','utf8')),{exports:helper,AbortController,DOMException,...timer});
 const exports={};
 vm.runInNewContext(code,{exports,catalogReadWithDeadline:helper.catalogReadWithDeadline,AbortController,useState:v=>{const i=cursor++;states[i]=v;return [v,n=>{states[i]=n;if(unmounted)writesAfterUnmount++;}];},useRef:v=>({current:v}),useCallback:f=>f,useEffect:f=>effects.push(f),useCatalogGroupViews:()=>({phase:'idle',value:null}),useBrowseJourney:()=>({route:{},filters:{}}),requestMessage:e=>String(e),...timer,fetch:(url,options)=>{const d=deferred();requests.push({...d,url,options});if(url==='/api/status')d.resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>({source:'feishu'})});return d.promise;}});
 const api=exports.App();let cleanups=effects.map(f=>f());
 return {states,requests,timers,...api,unmount(){unmounted=true;for(const f of cleanups)f?.();},replay(){for(const f of cleanups)f?.();cleanups=effects.map(f=>f());},writes:()=>writesAfterUnmount,
 catalog:()=>requests.filter(r=>r.url.startsWith('/api/catalog')),
 async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.f();}await tick();},
 reply(r,d){r.resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>d});}};
}
const cached=()=>({mode:'live',groups:[],members:[],works:[{id:'work',score:0,note:'保留备注',watched:'已观看'}],ratings:[],cache:{refreshRecommended:true}});

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
 assert.ok(h.requests.every(r=>r.options.cache==='no-store'&&!r.options.method&&!r.options.body));h.unmount();
});
test('HTTP failure preserves old data and original error mapping',async()=>{
 const h=harness();await tick();const d={...cached(),cache:{}};h.reply(h.catalog()[0],d);await tick();const p=h.load(true);await tick();
 h.catalog()[1].resolve({ok:false,headers:{get:()=> 'application/json'},json:async()=>({error:'TEST_FAILURE'})});await p;
 assert.equal(h.states[0],d);assert.equal(h.states[1],'TEST_FAILURE');assert.equal(h.states[3],false);h.unmount();
});
test('Editor implementation is byte-identical and status interpretation remains unchanged',()=>{
 const editor=source.slice(source.indexOf('function Editor('),source.indexOf('export default function App(){'));
 const status=source.split('\n').find(s=>s.includes("fetch('/api/status'"));
 // Published editorial score-input variants were added since this test's original baseline.
 // Read/save/navigation logic was independently compared byte-for-byte with c6ddcaa.
 assert.equal(crypto.createHash('sha256').update(editor).digest('hex'),'5974434e082bf08d00c99d549b29dbabf82676f1da3620b894906a09feafba65');
 assert.ok(status.includes("setCanManage(!!s&&typeof s==='object'&&'source' in s&&s.source==='native')"));
 assert.match(source,/onSaved=\{\(\)=>load\(true\)\}/);
 assert.match(source,/disabled=\{refreshing\}/);assert.match(source,/仍可浏览已有内容/);
});
