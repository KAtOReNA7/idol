const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const source=fs.readFileSync('components/candidate/loona-design.tsx','utf8');
const effect=source.slice(source.indexOf('  useEffect(() => {\n    if (options.catalog !== undefined) return;'),source.indexOf('\n  const collection'));
assert.ok(effect.startsWith('  useEffect('),'extract the actual catalog effect');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const catalog=()=>({groups:[],members:[],works:[{id:'recTestWork',score:0,note:'synthetic only'}],ratings:[]});
function harness(slug='meovv'){
 let state={data:null,error:'',loading:true},writes=0,setup,cleanup,now=0,next=0;const requests=[],timers=new Map(),exports={};
 const globals={AbortController,DOMException,Error,setTimeout:(f,ms)=>{timers.set(++next,{f,ms,due:now+ms});return next},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(compile(fs.readFileSync('lib/idol/catalog-read-deadline.ts','utf8')),{exports,...globals});
 vm.runInNewContext(compile(effect),{...globals,content:{slug},options:{},catalogReadWithDeadline:exports.catalogReadWithDeadline,useEffect:f=>{setup=f;cleanup=f()},setState:v=>{state=v;writes++},fetch:(url,options)=>{const d=deferred();requests.push({...d,url,options});return d.promise;}});
 return {requests,timers,state:()=>state,writes:()=>writes,unmount:()=>cleanup(),replay(){cleanup();cleanup=setup()},reply(index,data){requests[index].resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>data})},async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.f()}await tick()}};
}
for(const phase of ['fetch','json'])test('independent LOONA '+phase+' hangs end after 30 seconds; late completion cannot replace error',async()=>{
 const h=harness();await tick();let body;
 assert.equal([...h.timers.values()][0].ms,30000);
 if(phase==='json'){body=deferred();h.requests[0].resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick()}
 await h.advance(29999);assert.equal(h.state().loading,true);await h.advance(1);
 assert.equal(h.state().loading,false);assert.equal(h.state().data,null);assert.match(h.state().error,/读取用时较长/);assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.timers.size,0);
 const after=h.state();if(body)body.resolve(catalog());else h.reply(0,catalog());await tick();assert.equal(h.state(),after);h.unmount();
});
test('independent LOONA reload recovery obtains intact catalog and clears deadline',async()=>{
 const old=harness();await tick();await old.advance(30000);old.unmount();
 assert.ok(source.includes('options.onRetry ? options.onRetry() : window.location.reload()'));
 const fresh=harness('idle');await tick();const data=catalog();fresh.reply(0,data);await tick();assert.equal(fresh.state().data,data);assert.equal(fresh.state().data.works[0].score,0);assert.equal(fresh.state().error,'');assert.equal(fresh.state().loading,false);assert.equal(fresh.timers.size,0);
 assert.equal(fresh.requests[0].url,'/api/catalog?artist=loona&shape=display-v1');assert.equal(fresh.requests[0].options.cache,'no-store');assert.equal(fresh.requests[0].options.method,undefined);assert.equal(fresh.requests[0].options.body,undefined);fresh.unmount();
});
for(const phase of ['fetch','json'])test('independent LOONA unmount during '+phase+' consumes late rejection without writes',async()=>{
 const h=harness();await tick();let body;if(phase==='json'){body=deferred();h.requests[0].resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick()}
 h.unmount();(body??h.requests[0]).reject(Error('late'));await tick();assert.equal(h.writes(),0);assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.timers.size,0);
});
test('independent LOONA immediate cleanup and Strict replay start only surviving GET',async()=>{
 const abandoned=harness();abandoned.unmount();await tick();assert.equal(abandoned.requests.length,0);assert.equal(abandoned.writes(),0);
 const h=harness();h.replay();await tick();assert.equal(h.requests.length,1);const data=catalog();h.reply(0,data);await tick();assert.equal(h.state().data,data);assert.equal(h.writes(),1);h.unmount();
});
test('independent LOONA replay rejects an older success after replacement succeeds',async()=>{
 const h=harness();await tick();h.replay();await tick();assert.ok(h.requests[0].options.signal.aborted);const latest=catalog();h.reply(1,latest);await tick();h.reply(0,catalog());await tick();assert.equal(h.state().data,latest);assert.equal(h.writes(),1);h.unmount();
});
test('independent LOONA HTTP, content type, malformed body and shape failures exit loading',async()=>{
 for(const failure of ['http','html','json','shape']){const h=harness();await tick();h.requests[0].resolve({ok:failure!=='http',headers:{get:()=>failure==='html'?'text/html':'application/json'},json:async()=>{if(failure==='json')throw Error('bad json');return {}}});await tick();assert.equal(h.state().loading,false,failure);assert.equal(h.state().data,null);assert.ok(h.state().error);assert.equal(h.timers.size,0);h.unmount()}
});
