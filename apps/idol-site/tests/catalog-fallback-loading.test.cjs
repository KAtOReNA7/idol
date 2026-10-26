const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');

const root=path.resolve(__dirname,'..');
const fallbackPath=path.join(root,'data/snapshot.json');
const compressedPath=path.join(root,'data/snapshot-fallback.generated.ts');
const loaderPath=path.join(root,'lib/idol/snapshot-fallback.ts');
const warning='飞书连接待完成。当前为只读迁移快照，评分保存尚未开放。';
const plain=value=>JSON.parse(JSON.stringify(value));
const emptyTables=()=>Object.fromEntries(['groups','members','works','ratings'].map(key=>[key,{records:[]}]));

function harness({configured=false,allowFallback=false}={}){
 const state={fallbackReads:0,loaderReads:0,liveReads:0,nativeReads:0,failLive:false,tables:emptyTables()};
 const modules=new Map();
 class AppError extends Error{constructor(code,message,status){super(message);this.code=code;this.status=status;}}
 class Clock extends Date{constructor(...args){super(...(args.length?args:['2026-10-19T00:00:00.000Z']));}static now(){return Date.parse('2026-10-19T00:00:00.000Z');}}
 const db={prepare(sql){return {bind(){return this;},async first(){
  if(sql.includes('catalog_generation'))return {owner_id:'owner',mode:'native',epoch:1,active_snapshot:'native-fixture',catalog_generation:1};
  if(sql.includes('SELECT captured_at'))return {captured_at:'2026-10-18T00:00:00Z'};
  throw Error('Unexpected native query: '+sql);
 }}}};
 const stubs={
  'server-only':{},
  'cloudflare:workers':{env:{}},
  './feishu':{configured:()=>configured,AppError},
  './live':{liveTables:async()=>{state.liveReads++;if(state.failLive)throw Error('Synthetic live read failure');return state.tables;}},
  './native-storage':{nativeDb:()=>db,nativeTables:async()=>{state.nativeReads++;return state.tables;}},
  './native-format':{},
  './verified-version-display':{withVerifiedVersionDisplay:value=>value},
  './group-milestones':{withGroupMilestones:value=>value},
  './social-facts':{withSocialFacts:async value=>value},
 };
 function load(file){
  file=path.resolve(root,file);
  if(modules.has(file))return modules.get(file);
  assert.notEqual(file,fallbackPath,'The runtime must not import the raw JSON snapshot');
  if(file===loaderPath){state.loaderReads++;assert.ok(allowFallback,'The fallback loader must stay outside native/live paths');}
  if(file===compressedPath){
   state.fallbackReads++;
   assert.ok(allowFallback,'The fallback snapshot must not load on a native/live path');
  }
  if(file.endsWith('.json')){
   const value=JSON.parse(fs.readFileSync(file,'utf8'));
   modules.set(file,value);
   return value;
  }
  const exports={};modules.set(file,exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const requireLocal=name=>{
   if(Object.hasOwn(stubs,name))return stubs[name];
   let target=name.startsWith('@/')?path.join(root,name.slice(2)):name.startsWith('.')?path.resolve(path.dirname(file),name):null;
   assert.ok(target,'Unexpected module: '+name);
   if(!fs.existsSync(target)&&fs.existsSync(target+'.ts'))target+='.ts';
   return load(target);
  };
  vm.runInNewContext(`(function(require,exports){${code}\n})`,{
   Date:Clock,URL,URLSearchParams,Map,Set,Response,Blob,DecompressionStream,atob,Uint8Array,TextDecoder,crypto:require('node:crypto').webcrypto,console:{info(){}},
   fetch:()=>{throw Error('Real network disabled');},
  },{filename:file})(requireLocal,exports);
  return exports;
 }
 return {state,load};
}

test('importing catalog and directly projecting supplied tables never loads the fallback',()=>{
 const {state,load}=harness();
 const {projectCatalog}=load('lib/idol/catalog.ts');
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
 for(const mode of ['live','snapshot']){
  const projected=projectCatalog(state.tables,mode,'supplied-capture');
  assert.equal(projected.mode,mode);
  assert.equal(projected.capturedAt,'supplied-capture');
 }
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
 assert.equal(state.liveReads,0);
});

test('native-reader imports and uses the real projector without loading the fallback',async()=>{
 const {state,load}=harness();
 const {readNativeCatalog}=load('lib/idol/native-reader.ts');
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
 const first=await readNativeCatalog('owner');
 assert.equal(first.mode,'live');
 assert.equal(first.cache.source,'live');
 assert.equal(await readNativeCatalog('owner'),first);
 await readNativeCatalog('owner',true);
 assert.equal(state.nativeReads,2);
 assert.equal(state.liveReads,0);
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
});

test('configured live reads, cache hits, refreshes and failures never load the fallback',async()=>{
 const {state,load}=harness({configured:true});
 const {getCatalogSnapshot}=load('lib/idol/catalog.ts');
 const first=await getCatalogSnapshot();
 assert.equal(first.tables,state.tables);
 assert.equal(first.catalog.mode,'live');
 assert.equal(first.catalog.warning,null);
 assert.equal(await getCatalogSnapshot(),first);
 await getCatalogSnapshot(true);
 state.failLive=true;
 await assert.rejects(getCatalogSnapshot(true),/Synthetic live read failure/);
 assert.equal(state.liveReads,3);
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
});

test('unconfigured reads load the unchanged fallback only on demand and preserve its exact projection',async()=>{
 const {state,load}=harness({allowFallback:true});
 const api=load('lib/idol/catalog.ts');
 assert.equal(state.fallbackReads,0);
 assert.equal(state.loaderReads,0);
 const source=JSON.parse(fs.readFileSync(fallbackPath,'utf8'));
 const first=await api.getCatalogSnapshot();
 assert.equal(state.fallbackReads,1);
 assert.equal(state.loaderReads,1);
 assert.deepEqual(plain(first.tables),source.tables);
 assert.equal(first.capturedAt,source.capturedAt);
 assert.deepEqual(plain(first.catalog),plain(api.projectCatalog(source.tables,'snapshot',source.capturedAt,warning)));
 assert.equal(first.catalog.mode,'snapshot');
 assert.equal(first.catalog.warning,warning);
 assert.deepEqual(plain(first.catalog.counts),{groups:51,members:338,works:614,ratings:2828,ratedWorks:83,scoreSum:692.5});
 const forced=await api.getCatalogSnapshot(true);
 assert.equal(forced.tables,first.tables);
 assert.deepEqual(plain(forced.catalog),plain(first.catalog));
 assert.equal(state.fallbackReads,1);
 assert.equal(state.loaderReads,1);
 assert.equal(state.liveReads,0);
 assert.equal(state.nativeReads,0);
});
