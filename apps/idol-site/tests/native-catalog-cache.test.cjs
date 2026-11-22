const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
async function until(fn){for(let n=0;n<200;n++){if(fn())return;await new Promise(resolve=>setImmediate(resolve));}throw Error('Expected asynchronous checkpoint not reached');}
function setup(){
 const model={mode:'native',epoch:6,snapshot:'snap',generation:103,hasState:true,value:1,reads:0,projects:0,calls:[],gates:[],fail:false,owner:'owner',now:Date.now(),logs:[]};
 class AppError extends Error{constructor(code,message,status=503){super(message);this.code=code;this.status=status;}}
 const activeNative=async user=>{if(user!==model.owner)throw new AppError('OWNER_ONLY','owner',403);if(model.mode==='feishu')return null;return {owner_id:user,mode:model.mode,epoch:model.epoch,active_snapshot:model.snapshot};};
 const db={prepare(sql){const statement={bind(){return statement;},async first(){if(sql.includes('catalog_generation'))return {owner_id:model.owner,mode:model.mode,epoch:model.epoch,active_snapshot:model.snapshot,catalog_generation:model.hasState?model.generation:null};if(sql.includes('SELECT captured_at'))return {captured_at:'2026-10-14T00:00:00Z'};throw Error(sql);}};return statement;}};
 const nativeTables=async(snapshot,onFailure)=>{const value=model.value,gate=model.gates.shift();model.reads++;model.calls.push(value);if(gate)await gate.promise;if(model.fail){onFailure?.('table-rows');throw Error('projection read failed');}return {value};};
 const sourceStamp=control=>JSON.stringify([control.mode,control.epoch,control.active_snapshot]);
 const stubs={'./verified-version-display':{withVerifiedVersionDisplay:x=>x},'cloudflare:workers':{env:{}},'./feishu':{AppError},'./native-storage':{activeNative,nativeDb:()=>db,nativeTables,sourceStamp},'./native-format':{},'./live':{},'./fields':{F:{}},'./group-milestones':{withGroupMilestones:x=>x},'./social-facts':{withSocialFacts:async x=>{if(model.socialError)throw model.socialError;return x;}},'./catalog':{projectCatalog:tables=>{model.projects++;if(model.projectError)throw model.projectError;return {marker:tables.value,capturedAt:'capture-'+tables.value,loadedAt:'load-'+tables.value,groups:[],members:[],works:[],ratings:[]};}}};
 class Clock extends Date{static now(){return model.now;}}
 const out={},code=ts.transpileModule(fs.readFileSync('lib/idol/native-reader.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})',{Date:Clock,Response,Map,JSON,console:{info:x=>model.logs.push(JSON.parse(x))}})(n=>{const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(n);if(timelineModule!==undefined)return timelineModule;assert.ok(n in stubs,n);return stubs[n];},out);
 return {model,read:out.readNativeCatalog,readWith:out.withNativeCatalog};
}
test('native catalog same-owner same-generation reads reuse projection; force is fresh',async()=>{const {read,model:m}=setup();assert.equal((await read('owner')).marker,1);assert.equal((await read('owner')).marker,1);assert.equal(m.reads,1);assert.equal(m.projects,1);assert.equal(m.logs.at(-1).result,'hit');await read('owner',true);assert.equal(m.reads,2);assert.equal(m.logs.at(-1).result,'miss');});
test('concurrent reads within one request coalesce and release the pending operation after failure',async()=>{
 const {read,model:m}=setup(),gate=deferred(),request=new Request('https://example.org/api/catalog');
 m.gates.push(gate);
 const a=read('owner',false,request),b=read('owner',false,request);
 await until(()=>m.reads===1);
 gate.resolve();
 assert.equal((await a).marker,1);
 assert.equal((await b).marker,1);
 assert.equal(m.reads,1);
 m.generation++;
 m.fail=true;
 await assert.rejects(read('owner',false,request),/failed/);
 m.fail=false;m.value=2;
 assert.equal((await read('owner',false,request)).marker,2);
 assert.equal(m.reads,3);
});
test('one pending cold request cannot block a different request or evict its completed projection',async()=>{
 const {read,model}=setup(),gate=deferred();
 const first=new Request('https://example.org/api/catalog'),next=new Request(first.url);
 model.gates.push(gate);
 const failed=assert.rejects(read('owner',false,first),/request ended/);
 await until(()=>model.reads===1);
 const completed=await read('owner',false,next);
 assert.equal(model.reads,2);
 gate.reject(Error('request ended'));
 await failed;
 assert.strictEqual(await read('owner'),completed);
 assert.equal(model.reads,2);
});
test('committed save or facts generation change misses immediately even if POST acknowledgement was lost',async()=>{const {read,model:m}=setup();await read('owner');m.generation++;m.value=2;assert.equal((await read('owner')).marker,2);await read('owner');assert.equal(m.reads,2);});
test('save during old read causes bounded re-read, never publishes old generation',async()=>{const {read,model:m}=setup(),old=deferred();m.gates.push(old);const a=read('owner');await until(()=>m.reads===1);m.generation++;m.value=2;assert.equal((await read('owner')).marker,2);old.resolve();assert.equal((await a).marker,2);assert.equal((await read('owner')).marker,2);assert.equal(m.reads,2);});
test('force replaces even same-key pending and late old promise joins the new result',async()=>{const {read,model:m}=setup(),old=deferred(),fresh=deferred();m.gates.push(old,fresh);const a=read('owner');await until(()=>m.reads===1);m.value=2;const b=read('owner',true);await until(()=>m.reads===2);fresh.resolve();assert.equal((await b).marker,2);old.resolve();assert.equal((await a).marker,2);assert.equal((await read('owner')).marker,2);assert.equal(m.reads,2);});
test('late failed old force entry cannot delete a newer completed cache entry',async()=>{const {read,model:m}=setup(),old=deferred();m.gates.push(old);const a=read('owner');await until(()=>m.reads===1);m.value=2;assert.equal((await read('owner',true)).marker,2);old.reject(Error('old failed'));await assert.rejects(a,/old failed/);assert.equal((await read('owner')).marker,2);assert.equal(m.reads,2);});
test('source mode, epoch and snapshot transitions never reuse old native values',async()=>{const {read,model:m}=setup();await read('owner');for(const change of [()=>m.mode='frozen',()=>m.epoch++,()=>m.snapshot='new']){change();m.value++;assert.equal((await read('owner')).marker,m.value);}assert.equal(m.reads,4);m.mode='feishu';assert.equal(await read('owner'),null);m.mode='native';await read('owner');assert.equal(m.reads,5);});
test('missing generation and wrong owner fail closed before cache hit',async()=>{const {read,model:m}=setup();await read('owner');m.hasState=false;await assert.rejects(read('owner'),e=>e.code==='NATIVE_DATA_MISSING');m.hasState=true;await assert.rejects(read('stranger'),e=>e.code==='OWNER_ONLY');assert.equal(m.reads,1);});
test('TTL is bounded and a new bundle starts with no prior projection',async()=>{const {read,model:m}=setup();await read('owner');m.now+=5*60*1000+1;await read('owner');assert.equal(m.reads,2);const other=setup();await other.read('owner');assert.equal(other.model.reads,1);});
test('read drift beyond one recovery exits rather than looping or returning a partial catalog',async()=>{const {read,model:m}=setup(),first=deferred(),second=deferred();m.gates.push(first,second);const a=read('owner');await until(()=>m.reads===1);m.generation++;first.resolve();await until(()=>m.reads===2);m.generation++;second.resolve();await assert.rejects(a,e=>e.code==='CATALOG_SUPERSEDED'||e.code==='STORAGE_CHANGING');assert.equal(m.reads,2);});
test('a generation update or same-generation force replacement during a private read retries against the fresh projection',async()=>{
 for(const change of ['generation','force']){
  const {read,readWith,model}=setup(),gate=deferred(),seen=[];
  await read('owner');
  const pending=readWith('owner',false,async (catalog,control)=>{
   seen.push(catalog.marker);
   const score=seen.length===1?8:0;
   if(seen.length===1)await gate.promise;
   return {marker:catalog.marker,snapshot:control.active_snapshot,score};
  });
  await until(()=>seen.length===1);
  model.value=2;
  if(change==='generation')model.generation++;
  else await read('owner',true);
  gate.resolve();
  assert.deepEqual((await pending).value,{marker:2,snapshot:'snap',score:0});
  assert.deepEqual(seen,[1,2]);
  assert.equal(model.reads,2);
 }
});
test('source or owner changes during a private read reject its result before publication',async()=>{
 for(const [field,next,code] of [['mode','frozen','STORAGE_CHANGING'],['mode','feishu','STORAGE_CHANGING'],
  ['epoch',7,'STORAGE_CHANGING'],['snapshot','replacement','STORAGE_CHANGING'],['owner','other','OWNER_ONLY']]){
  const {readWith,model}=setup();
  await assert.rejects(readWith('owner',false,()=>{model[field]=next;return 'previous owner data';}),e=>e.code===code);
  const fresh=await readWith(model.owner,false,(_,control)=>control);
  if(model.mode==='feishu')assert.equal(fresh.state.mode,'feishu');
  else assert.equal(fresh.value.active_snapshot,model.snapshot);
 }
});
test('a failed private read preserves the shared projection and repeated private-read drift has a bounded retry',async()=>{
 const {read,readWith,model}=setup();
 const original=await read('owner');
 await assert.rejects(readWith('owner',false,()=>{throw Error('private read failed');}),/private read failed/);
 assert.strictEqual(await read('owner'),original);
 assert.equal(model.projects,1);
 let attempts=0;
 await assert.rejects(readWith('owner',false,()=>{attempts++;model.generation++;return 0;}),e=>e.code==='STORAGE_CHANGING');
 assert.equal(attempts,2);
 assert.equal(model.projects,2);
});
test('readers within one request keep separate traces and observe the same failed cold operation',async()=>{
 const {readWith,model}=setup(),gate=deferred(),first={},second={};
 const request=new Request('https://example.org/api/catalog');
 model.gates.push(gate);
 model.fail=true;
 const requests=Promise.allSettled([
  readWith('owner',false,catalog=>catalog,first,request),
  readWith('owner',false,catalog=>catalog,second,request),
 ]);
 await until(()=>first.cache==='miss'&&second.cache==='joined');
 gate.resolve();
 const results=await requests;
 assert.equal(model.reads,1);
 assert.equal(results[0].status,'rejected');
 assert.equal(results[1].reason,results[0].reason);
 assert.deepEqual(first,{step:'table-rows',cache:'miss'});
 assert.deepEqual(second,{step:'table-rows',cache:'joined'});
 model.fail=false;
 const recovery={};
 assert.equal((await readWith('owner',false,catalog=>catalog.marker,recovery)).value,1);
 assert.deepEqual(recovery,{step:'response-generation',cache:'miss'});
});
test('catalog projection and social enrichment preserve their original errors and precise cold step',async()=>{
 for(const [property,step] of [['projectError','catalog-project'],['socialError','social-facts']]){
  const {readWith,model}=setup(),trace={},injected=Error('opaque fixture');
  model[property]=injected;
  await assert.rejects(readWith('owner',false,catalog=>catalog,trace),error=>error===injected);
  assert.deepEqual(trace,{step,cache:'miss'});
 }
});
test('no shared browser cache, data writes, or private content are added to native cache diagnostics',()=>{
 const source=fs.readFileSync('lib/idol/native-reader.ts','utf8').split('export async function readNativeDetail')[0];
 assert.doesNotMatch(source,/localStorage|sessionStorage|INSERT |UPDATE |DELETE /);
 assert.match(source,/MAX_NATIVE_OWNERS=4/);
 assert.match(source,/event:'idol_native_catalog',result,elapsedMs/);
 const route=fs.readFileSync('app/api/catalog/route.ts','utf8');
 assert.match(route,/await ownerForRequest\(\)/);
 assert.match(route,/withNativeCatalog\(user\.userId,\s*force,/);
 assert.match(fs.readFileSync('lib/idol/http.ts','utf8'),/'Cache-Control':\s*'private, no-store'/);
});
