const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const source=fs.readFileSync('app/page.tsx','utf8'),effect=source.split('\n').find(s=>s.includes("fetch('/api/status'")),response=source.split('\n').find(s=>s.startsWith('async function readResponse('));
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness(){
 let value=false,writes=0,cleanup,now=0,next=0;const requests=[],timers=new Map(),exports={};
 const globals={AbortController,DOMException,setTimeout:(f,ms)=>{timers.set(++next,{f,ms,due:now+ms});return next},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(compile(fs.readFileSync('lib/idol/catalog-read-deadline.ts','utf8')),{exports,...globals});
 vm.runInNewContext(compile(response+'\n'+effect),{...globals,catalogReadWithDeadline:exports.catalogReadWithDeadline,useEffect:f=>{cleanup=f()},setCanManage:v=>{value=v;writes++},fetch:(url,options)=>{const d=deferred();requests.push({...d,url,options});return d.promise;}});
 return {requests,timers,value:()=>value,writes:()=>writes,unmount:()=>cleanup(),reply(data){requests[0].resolve({ok:true,headers:{get:()=> 'application/json'},json:async()=>data})},async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.f()}await tick()}};
}
test('pending status keeps the management entry hidden; native success restores existing visibility',async()=>{
 const h=harness();await tick();assert.equal(h.value(),false);assert.equal(h.writes(),0);assert.equal([...h.timers.values()][0].ms,30000);
 await h.advance(29999);assert.equal(h.value(),false);h.reply({source:'native'});await tick();assert.equal(h.value(),true);assert.equal(h.writes(),1);assert.equal(h.timers.size,0);
 assert.equal(h.requests[0].url,'/api/status');assert.equal(h.requests[0].options.cache,'no-store');assert.equal(h.requests[0].options.method,undefined);h.unmount();
});
for(const phase of ['fetch','json'])test(phase+' timeout is silent and late native success cannot enable entry',async()=>{
 const h=harness();await tick();let body;
 if(phase==='json'){body=deferred();h.requests[0].resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick();}
 await h.advance(30000);assert.equal(h.value(),false);assert.equal(h.writes(),0);assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.timers.size,0);
 if(body)body.resolve({source:'native'});else h.reply({source:'native'});await tick();assert.equal(h.value(),false);assert.equal(h.writes(),0);
});
test('unmount cancels silently, consumes late rejection and never changes entry visibility',async()=>{
 const h=harness();await tick();h.unmount();h.requests[0].reject(Error('late failure'));await tick();assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.writes(),0);assert.equal(h.timers.size,0);
});
test('immediate unmount suppresses the queued GET',async()=>{
 const h=harness();h.unmount();await tick();assert.equal(h.requests.length,0);assert.equal(h.writes(),0);assert.equal(h.timers.size,0);
});
test('exact native-source interpretation is unchanged; unrelated admin flags never grant visibility',async()=>{
 for(const [payload,expected] of [[{source:'native'},true],[{source:'native',mode:'read-only',writesPaused:true},true],[{source:'feishu',configured:true},false],[{isAdmin:true,role:'admin'},false],[{source:'NATIVE'},false],[{source:true},false],[null,false],[[],false],['native',false]]){
  const h=harness();await tick();h.reply(payload);await tick();assert.equal(h.value(),expected,JSON.stringify(payload));assert.equal(h.writes(),1);h.unmount();
 }
});
test('network, content-type and JSON failures remain silent and default-deny',async()=>{
 for(const failure of ['network','html','json']){
  const h=harness();await tick();
  if(failure==='network')h.requests[0].reject(Error('offline'));
  else h.requests[0].resolve({ok:false,headers:{get:()=>failure==='html'?'text/html':'application/json'},json:async()=>{throw Error('malformed')}});
  await tick();assert.equal(h.value(),false);assert.equal(h.writes(),0);assert.equal(h.timers.size,0);
 }
});
test('fresh page entry may recover after a previous page timed out',async()=>{
 const old=harness();await tick();await old.advance(30000);old.unmount();
 const fresh=harness();await tick();fresh.reply({source:'native'});await tick();assert.equal(old.value(),false);assert.equal(fresh.value(),true);fresh.unmount();
});
test('native response arriving after unmount cannot reveal management UI',async()=>{
 const h=harness();await tick();h.unmount();h.reply({source:'native'});await tick();assert.equal(h.value(),false);assert.equal(h.writes(),0);assert.equal(h.timers.size,0);
});
