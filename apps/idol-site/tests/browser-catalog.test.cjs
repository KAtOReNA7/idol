const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
class AppError extends Error{constructor(code,message,status){super(message);Object.assign(this,{code,status});}}
const modules=new Map();
function load(file){
 file=path.resolve(file);
 if(modules.has(file))return modules.get(file);
 const out={};modules.set(file,out);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Response,Error,TypeError,SyntaxError})(name=>{
  if(name==='./feishu')return {AppError};
  if(name==='@/app/chatgpt-auth')return {};
  return load(path.resolve(path.dirname(file),name)+'.ts');
 },out);
 return out;
}
const {projectBrowserCatalog,requestedBrowserCatalog,withoutStageCandidates}=load('lib/idol/browser-catalog.ts'),{personalMvPhoto,memberWorks,memberWorkSummary}=load('lib/idol/member-works.ts');
const plain=x=>JSON.parse(JSON.stringify(x));
const workRequest=load('lib/idol/work-catalog-request.ts');
const workExports={};
const workCode=ts.transpileModule(fs.readFileSync('lib/idol/work-catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext('(function(require,exports){'+workCode+'})')(name=>require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name),workExports);
test('ifeye presents its announced agency while preserving the source and newer edits',()=>{
 const catalog=sample([]);
 const former={id:'rec28ldfRTiCGa',name:'ifeye',company:'Hi-Hat Entertainment',officialUrl:''};
 catalog.groups=[former];
 const [updated]=projectBrowserCatalog(catalog).groups;
 assert.equal(updated.company,'초록뱀뮤직');
 assert.equal(updated.officialUrl,'https://artist.mnetplus.world/main/stg/ifeye');
 assert.equal(former.company,'Hi-Hat Entertainment');
 catalog.groups=[{...former,company:'Newer agency',officialUrl:'https://example.org/artist'}];
 assert.strictEqual(projectBrowserCatalog(catalog).groups,catalog.groups);
});
const row=(id='r',extra={})=>({id,name:'member / song',memberIds:['m'],workIds:['w'],score:0,stylingScore:null,memory:'A memory',note:'A note',verification:'原有状态',source:'https://example.org/credit',recognition:'本MV截图 · 媒体逐人具名',photo:{table:'ratings',recordId:id,index:0,fieldId:'photo',kind:'本 MV 认人图'},...extra});
const sample=(rows=[row()])=>({mode:'live',capturedAt:'source time',loadedAt:'load time',warning:null,cache:{source:'live',refreshRecommended:false},groups:[{id:'g'}],members:[{id:'m',note:'my note',favorite:0}],works:[{id:'w',score:0,stageScore:null,note:'song note',watched:'已观看',stage:{videoId:'abcdefghijk',scoreBinding:{videoId:'abcdefghijk',initialScore:null,initializedAt:'2026-10-11T00:00:00Z'}}}],ratings:rows,counts:{groups:1,members:1,works:1,ratings:rows.length,ratedWorks:1,scoreSum:0}});
test('browser response omits only unused rating evidence, preserving every user value and link',()=>{const d=sample(),before=JSON.stringify(d),v=projectBrowserCatalog(d);assert.equal(JSON.stringify(d),before);assert.notStrictEqual(v,d);assert.notStrictEqual(v.ratings,d.ratings);assert.notStrictEqual(v.ratings[0],d.ratings[0]);for(const k of ['groups','members','works','counts','cache'])assert.strictEqual(v[k],d[k]);assert.equal(v.capturedAt,d.capturedAt);assert.equal(v.loadedAt,d.loadedAt);const {source,recognition,...expected}=d.ratings[0];assert.deepEqual(plain(v.ratings[0]),{...expected,personalPhotoEligible:true});assert.ok(!('source' in v.ratings[0]));assert.ok(!('recognition' in v.ratings[0]));assert.equal(d.ratings[0].recognition,recognition);});
test('same personal image and aggregate decisions for legacy text and slim response',()=>{const rows=[row('a'),row('b',{score:8,stylingScore:9}),row('c',{recognition:'本MV全员拼图'}),row('d',{recognition:'档案照'}),row('e',{recognition:'资料不明'}),row('f',{photo:null}),row('g',{memberIds:['m','n']}),row('h',{workIds:['w','other']})],d=sample(rows),v=projectBrowserCatalog(d);for(let i=0;i<rows.length;i++)assert.deepEqual(plain(personalMvPhoto(v.ratings[i],'m','w')),plain(personalMvPhoto(rows[i],'m','w')));assert.deepEqual(plain(memberWorks(v,'m')),plain(memberWorks(d,'m')));assert.deepEqual(plain(memberWorkSummary(memberWorks(v,'m'))),plain(memberWorkSummary(memberWorks(d,'m'))));});
test('native provenance still resolves historical pending text through the existing rule',()=>{const r=row('r',{recognition:'旧待补文本',photo:{table:'ratings',recordId:'r',index:0,kind:'本 MV 截图',nativeIdentity:{memberId:'m',workId:'w',videoId:'abcdefghijk'}}}),v=projectBrowserCatalog(sample([r]));assert.equal(v.ratings[0].personalPhotoEligible,true);assert.deepEqual(plain(personalMvPhoto(v.ratings[0],'m','w')),r.photo);});
test('new decisions never bypass exact rating/member/work/attachment relations',()=>{const v=projectBrowserCatalog(sample()).ratings[0];for(const extra of [{memberIds:['x']},{memberIds:['m','x']},{workIds:['other']},{workIds:['w','other']},{photo:{...v.photo,recordId:'another'}},{photo:{...v.photo,table:'members'}},{photo:null}])assert.equal(personalMvPhoto({...v,...extra},'m','w'),null);});
test('false and malformed new flags are fail-closed, while old evidence remains supported',()=>{const r=row();for(const flag of [false,undefined,null,1,'true',{}])assert.equal(personalMvPhoto({...r,personalPhotoEligible:flag},'m','w'),null);assert.ok(personalMvPhoto(r,'m','w'));assert.equal(personalMvPhoto({...r,recognition:undefined},'m','w'),null);assert.equal(personalMvPhoto({...r,recognition:123},'m','w'),null);});
test('projection recomputes evidence and cannot inherit an injected transport decision',()=>{const r=row('r',{recognition:'档案照',personalPhotoEligible:true});assert.equal(projectBrowserCatalog(sample([r])).ratings[0].personalPhotoEligible,false);});
test('artist scoping/order and null/zero semantics remain exactly as input',()=>{const d={...sample([row('a'),row('b',{score:null,stylingScore:0})]),scope:{type:'artist',groupId:'g'}},v=projectBrowserCatalog(d);assert.strictEqual(v.scope,d.scope);assert.deepEqual(v.ratings.map(r=>r.id),['a','b']);assert.equal(v.ratings[0].score,0);assert.equal(v.ratings[0].stylingScore,null);assert.equal(v.ratings[1].score,null);assert.equal(v.ratings[1].stylingScore,0);});
test('reduction is only after owner/source fencing and artist selection, never in writes or backup',async()=>{
 const h=routeHarness();
 await h.read('?artist=ive&shape=display-v1');
 assert.deepEqual(h.model.projectedAfter,[['auth','native:owner:false','native-fence','artist:ive']]);
 h.model.drift=true;
 const rejected=await h.read('?shape=display-v1',{Prefer:'omit-stage-candidates'});
 assert.equal(rejected.status,409);
 assert.equal(h.model.projectedAfter.length,1);
 for(const p of ['app/api/export/route.ts','lib/idol/native-save.ts','lib/idol/native-reader.ts','lib/idol/photo-maintenance.ts']){
  assert.doesNotMatch(fs.readFileSync(p,'utf8'),/projectBrowserCatalog|omit-stage-candidates/);
 }
 assert.doesNotMatch(fs.readFileSync('lib/idol/browser-catalog.ts','utf8'),/fetch\(|INSERT |UPDATE |DELETE |localStorage|sessionStorage/);
});

test('response shape is explicit, versioned and rejects unknown or ambiguous requests',()=>{assert.equal(requestedBrowserCatalog(new URLSearchParams()),false);assert.equal(requestedBrowserCatalog(new URLSearchParams('shape=display-v1')),true);for(const p of ['shape=','shape=v2','shape=full','shape=display-v1&shape=display-v1','shape=display-v1&shape=other'])assert.throws(()=>requestedBrowserCatalog(new URLSearchParams(p)),e=>e.status===400);});
function routeHarness(onCall){
 const model={data:sample(),publicData:{public:true,ratings:[]},publicReads:[],projectedAfter:[],calls:[],errors:[],info:[],native:true,deny:false,drift:false};
 const record=label=>{model.calls.push(label);onCall?.(label);};
 const stubs={
  '@/lib/idol/feishu':{AppError},
  '@/lib/idol/personal-mv-ratings':{personalMvRatingsForOwner:async()=>{onCall?.('member-ratings');return model.personal;}},
  '@/lib/idol/public-access':{ownerForRequest:async()=>{record('auth');return model.deny?null:{userId:'owner'};}},
  '@/lib/idol/public-reader':{publicQuery:request=>{record('public-query');return new URL(request.url).searchParams;},readPublicCatalog:async(artist,workId)=>{model.publicReads.push({artist,workId});record('public:'+artist);const work=workExports.findDetailWork(model.publicData,workId);return work?workExports.projectWorkCatalog(model.publicData,work):model.publicData;}},
  '@/lib/idol/work-catalog':workExports,'@/lib/idol/work-catalog-request':workRequest,
  '@/lib/idol/browser-catalog':{projectBrowserCatalog:data=>{model.projectedAfter.push([...model.calls]);return projectBrowserCatalog(data);},requestedBrowserCatalog,withoutStageCandidates},
  '@/lib/idol/artist-catalog':{requestedArtist:p=>p.get('artist'),projectArtistCatalog:(d,artist)=>{record('artist:'+artist);return {...d,scope:{type:'artist',groupId:artist}};}},
  '@/lib/idol/native-storage':{assertSourceUnchanged:async(u,state)=>{assert.equal(u,'owner');assert.equal(state.epoch,6);record('fallback-fence');if(model.drift)throw new AppError('STORAGE_CHANGING','changed',409);}},
  '@/lib/idol/native-reader':{withNativeCatalog:async(u,force,read)=>{
   record('native:'+u+':'+force);
   if(!model.native)return {native:false,state:{epoch:6}};
   const value=await read(model.data,{mode:'native',epoch:6});
   record('native-fence');
   if(model.drift)throw new AppError('STORAGE_CHANGING','changed',409);
   return {native:true,value};
  }},
  '@/lib/idol/durable-catalog':{getReadableCatalog:async(u,force)=>{record('fallback:'+force);return model.data;}},
  '@/lib/idol/http':load('lib/idol/http.ts'),
 };
 const console={error:(...args)=>model.errors.push(args),info:(...args)=>model.info.push(args)};
 const out={},js=ts.transpileModule(fs.readFileSync('app/api/catalog/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,Error,TypeError,SyntaxError,DOMException,setTimeout,clearTimeout,console})(n=>{const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(n);if(timelineModule!==undefined)return timelineModule;assert.ok(n in stubs,n);return stubs[n];},out);
 return {model,read:(p,headers,signal)=>out.GET(new Request('https://example.org/api/catalog'+p,{headers,signal}))};
}

const disconnected=()=>new Error('D1_ERROR: Network connection lost.');
function failingRoute(step,...errors){
 return routeHarness(label=>{
  if(label===step&&errors.length)throw errors.shift();
 });
}

test('terminal catalog failures expose a fixed phase and class to the invocation log and preserve the response',async()=>{
 const privateText='private-marker@example.test/signed?score=8.5';
 const headers={Cookie:'session='+privateText,Authorization:'Bearer '+privateText,'X-Request-ID':privateText};
 const cases=[
  ['auth','identity','unknown',Object.assign(new Error(privateText),{name:privateText})],
  ['native:owner:false','native-read','d1',new Error('D1_ERROR: '+privateText)],
  ['native:owner:false','native-read','capacity',new Error('D1_ERROR',{cause:new Error('overloaded '+privateText)})],
  ['member-ratings','member-ratings','type',new TypeError(privateText)],
  ['native-fence','native-read','data',new SyntaxError(privateText)],
  ['public:hearts2hearts','public-read','sqlite-or-query',new Error('SQLITE_ERROR: '+privateText)],
  ['fallback:false','legacy-read','upstream',new AppError('FEISHU_1001',privateText,502)],
  ['fallback-fence','source-fence','storage-state',new AppError('STORAGE_NOT_READY',privateText,503)],
  ['artist:hearts2hearts','project','application',new AppError(privateText,privateText,502)],
 ];
 for(const [step,phase,kind,error] of cases){
  let failedCalls=0;
  const h=routeHarness(label=>{if(label===step){failedCalls++;throw error;}});
  h.model.deny=step.startsWith('public:');
  h.model.native=!step.startsWith('fallback');
  const res=await h.read('?artist=hearts2hearts&shape=display-v1&secret='+encodeURIComponent(privateText),headers);
  const status=error instanceof AppError?error.status:502;
  assert.equal(res.status,status,step);
  assert.equal(res.headers.get('Cache-Control'),'private, no-store');
  assert.equal(res.headers.get('Server-Timing'),null);
  assert.equal((await res.json()).error,error instanceof AppError?error.code:'REQUEST_FAILED');
  assert.equal(failedCalls,1,step);
  assert.deepEqual(h.model.info,[]);
  assert.equal(h.model.errors.length,1,step);
  const [args]=h.model.errors;
  assert.equal(args.length,1);
  assert.deepEqual(JSON.parse(args[0]),{event:'idol_catalog_read_failed',phase,kind,status,retried:false,cancelled:false});
 }
});

test('only the terminal 5xx produces a failure event, with the failing attempt’s own phase',async()=>{
 const url='?artist=hearts2hearts&shape=display-v1';
 const native='native:owner:false';
 let reads=0;
 const h=routeHarness(step=>{
  if(step===native&&++reads===2)throw new Error('D1_ERROR: unclassified');
  if(step==='member-ratings')throw disconnected();
 });
 assert.equal((await h.read(url)).status,502);
 assert.equal(reads,2);
 assert.deepEqual(h.model.errors.map(([event])=>JSON.parse(event)),[
  {event:'idol_catalog_read_failed',phase:'native-read',kind:'d1',status:502,retried:true,cancelled:false},
 ]);
 assert.deepEqual(h.model.info.map(([event])=>JSON.parse(event)),[
  {event:'idol_catalog_read_retry',outcome:'failed',attempts:2},
 ]);
 const recovered=failingRoute(native,disconnected());
 assert.equal((await recovered.read(url)).headers.get('Server-Timing'),'catalog-retry');
 assert.equal((await recovered.read(url)).status,200);
 assert.equal((await recovered.read('?shape=invalid')).status,400);
 assert.deepEqual(recovered.model.errors,[]);
 assert.deepEqual(recovered.model.info.map(([event])=>JSON.parse(event)),[
  {event:'idol_catalog_read_retry',outcome:'recovered',attempts:2},
 ]);
 assert.equal(recovered.model.calls.filter(step=>step===native).length,3);
});

test('ordinary artist, work and library GETs recover one interrupted read with the original scope and identity',async t=>{
 const workId='recRetryWork';
 const cases=[
  {artist:'aespa',guest:false,error:disconnected()},
  {artist:'illit',guest:true,error:Object.assign(new Error('temporary read failure'),{retryable:true})},
  {detail:true,guest:false,error:new Error('D1_ERROR',{cause:new TypeError('Network connection lost.')})},
  {detail:true,guest:true,error:disconnected()},
  {guest:false,error:disconnected()},
  {artist:'izna',guest:false,legacyShape:true,error:disconnected()},
 ];
 for(const {artist,detail,guest,legacyShape,error} of cases){
  const name=(guest?'visitor':'owner')+' / '+(artist??(detail?'work':'library'))+(legacyShape?' / original shape':'');
  await t.test(name,async()=>{
   const params=new URLSearchParams();
   if(artist)params.set('artist',artist);
   if(!legacyShape)params.set('shape','display-v1');
   const headers=detail?workRequest.workCatalogHeaders(workId):undefined;
   const step=guest?'public:'+(artist??null):'native:owner:false';
   const healthy=routeHarness(),recovered=failingRoute(step,error);
   for(const {model} of [healthy,recovered]){
    model.deny=guest;
    model.data.works[0]={...model.data.works[0],id:workId,groupIds:['g']};
    model.data.members[0].groupIds=['g'];
    model.data.ratings[0].workIds=[workId];
    model.personal={writable:true,entries:[{workId,memberId:'m',score:0,stylingScore:null}]};
    model.publicData={groups:[{id:'g'}],members:[{id:'m',groupIds:['g']}],works:[{id:workId,groupIds:['g'],score:null}],ratings:[],counts:{}};
   }
   const query='?'+params;
   const baseline=await healthy.read(query,headers),r=await recovered.read(query,headers);
   assert.equal(baseline.status,200,query);
   assert.equal(r.status,200,query);
   const data=await r.json();
   assert.deepEqual(data,await baseline.json(),query);
   assert.equal(r.headers.get('Cache-Control'),'private, no-store');
   assert.equal(r.headers.get('Preference-Applied'),baseline.headers.get('Preference-Applied'));
   assert.doesNotMatch(baseline.headers.get('Server-Timing')??'',/catalog-retry/);
   assert.ok((r.headers.get('Server-Timing')??'').split(',').some(metric=>metric.trim()==='catalog-retry'));
   if(detail)assert.deepEqual(data.scope,{type:'work',workId});
   if(guest){
    assert.equal(data.personalMvRatings,undefined);
    const scope={artist:artist??null,workId:detail?workId:null};
    assert.deepEqual(recovered.model.publicReads,[scope,scope]);
   }else if(!legacyShape){
    assert.equal(data.personalMvRatings.entries[0].score,0);
   }
   const expected=[...healthy.model.calls];
   assert.equal(expected.filter(label=>label===step).length,1,query);
   expected.splice(expected.indexOf(step),0,step);
   assert.deepEqual(recovered.model.calls,expected,query);
  });
 }
});

test('a second failed read returns its own error and exposes no partial catalog',async()=>{
 for(const {guest,second,status,code} of [
  {guest:false,second:disconnected(),status:502,code:'REQUEST_FAILED'},
  {guest:true,second:new AppError('STORAGE_CHANGING','changed',409),status:409,code:'STORAGE_CHANGING'},
 ]){
  const step=guest?'public:stayc':'native:owner:false';
  const h=failingRoute(step,disconnected(),second);
  h.model.deny=guest;
  const response=await h.read('?artist=stayc&shape=display-v1');
  assert.equal(response.status,status);
  assert.doesNotMatch(response.headers.get('Server-Timing')??'',/catalog-retry/);
  const body=await response.json();
  assert.equal(body.error,code);
  assert.equal('ratings' in body,false);
  assert.deepEqual(h.model.calls,guest?['auth','public-query',step,step]:['auth',step,step]);
 }
});

test('business errors, overload, invalid data and opt-out signals return after one native read',async()=>{
 const business=new AppError('UPSTREAM_UNAVAILABLE','Network connection lost.',502);
 for(const error of [
  business,
  new AppError('OWNER_ONLY','owner',403),
  new AppError('NATIVE_DATA_MISSING','missing',503),
  new Error('D1_ERROR: no such table: synthetic'),
  new TypeError('Cannot read properties of undefined'),
  new SyntaxError('Invalid JSON'),
  Object.assign(disconnected(),{retryable:false}),
  Object.assign(disconnected(),{retryable:true,overloaded:true}),
  Object.assign(new Error('D1_ERROR',{cause:Object.assign(disconnected(),{overloaded:true})}),{retryable:true}),
  new Error('D1 DB is overloaded. Requests queued for too long.'),
 ]){
  const step='native:owner:false',h=failingRoute(step,error);
  const response=await h.read('?artist=izna&shape=display-v1');
  assert.equal(response.status,error instanceof AppError?error.status:502,error.message);
  assert.equal((await response.json()).error,error instanceof AppError?error.code:'REQUEST_FAILED',error.message);
  assert.deepEqual(h.model.calls,['auth',step],error.message);
 }
});

test('auth, explicit refresh, the durable fallback and aborted navigation never repeat a failed operation',async()=>{
 const url='?artist=babymonster&shape=display-v1';
 for(const {step,query,legacy,expected} of [
  {step:'auth',query:url,expected:['auth']},
  {step:'native:owner:true',query:url+'&refresh=1',expected:['auth','native:owner:true']},
  {step:'native:owner:true',query:url+'&refresh=background',expected:['auth','native:owner:true']},
  {step:'fallback:false',query:url,legacy:true,expected:['auth','native:owner:false','fallback:false']},
  {step:'fallback-fence',query:url,legacy:true,expected:['auth','native:owner:false','fallback:false','fallback-fence']},
 ]){
  const h=failingRoute(step,disconnected());
  h.model.native=!legacy;
  const response=await h.read(query);
  assert.equal(response.status,502,step);
  assert.doesNotMatch(response.headers.get('Server-Timing')??'',/catalog-retry/);
  assert.deepEqual(h.model.calls,expected,step);
 }
 const controller=new AbortController(),step='native:owner:false';
 const h=routeHarness(label=>{
  if(label===step){controller.abort();throw disconnected();}
 });
 const response=await h.read(url,undefined,controller.signal);
 assert.ok(!response.ok);
 assert.deepEqual(h.model.calls,['auth',step]);
});

test('work detail keeps direct versions, original group members, collaborators and the exact owner score scope',async()=>{
 const workId='recFocus',versionId='recVersion',otherId='recOther';
 const group='recHome',away='recAway';
 for(const guest of [false,true]){
  const h=routeHarness(),catalog=sample();
  const focus={...catalog.works[0],id:workId,groupIds:[group],url:'https://youtu.be/abcdefghijk',
   versionDisplay:{tags:[],links:[{workId:versionId,title:'Version',labels:[],categories:['版本']}] }};
  catalog.works=[focus,{...focus,id:versionId,groupIds:[away],versionDisplay:undefined},{...focus,id:otherId,versionDisplay:undefined}];
  catalog.groups=[{id:group},{id:away}];
  catalog.members=[{id:'recMember',groupIds:[group]},{id:'recFormer',groupIds:[],formerGroupIds:[group]},
   {id:'recGuest',groupIds:[away]},{id:'recUnrelated',groupIds:[away]}];
  catalog.ratings=[row('recRelevant',{workIds:[workId],memberIds:['recGuest']}),row('recUnrelated',{workIds:[otherId],memberIds:['recMember']})];
  Object.assign(catalog.counts,{groups:2,members:4,works:3,ratings:2});
  const personal={scope:'synthetic',writable:true,entries:[{workId,memberId:'recFormer',videoId:'abcdefghijk',score:0,stylingScore:null,revision:1},
   {workId:otherId,memberId:'recMember',videoId:'abcdefghijk',score:8,stylingScore:null,revision:1}]};
  h.model.deny=guest;h.model.data=h.model.publicData=catalog;h.model.personal=personal;
  const response=await h.read('?shape=display-v1',workRequest.workCatalogHeaders(workId));
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Preference-Applied'),'omit-stage-candidates, work-detail='+workId);
  const value=await response.json();
  assert.deepEqual(value.scope,{type:'work',workId});
  assert.deepEqual(value.works.map(w=>w.id),[workId,versionId]);
  assert.deepEqual(value.works[0].versionDisplay,focus.versionDisplay);
  assert.deepEqual(value.members.map(m=>m.id),['recMember','recFormer','recGuest']);
  assert.deepEqual(value.ratings.map(r=>r.id),['recRelevant']);
  assert.equal(value.ratings[0].score,0);
  assert.deepEqual(value.groups,catalog.groups);
  assert.equal(value.counts.works,2);assert.equal(value.counts.ratings,1);
  if(guest)assert.equal(value.personalMvRatings,undefined);
  else assert.deepEqual(value.personalMvRatings,{...personal,entries:[personal.entries[0]]});
  const missing=await h.read('?shape=display-v1',workRequest.workCatalogHeaders('recMissing'));
  assert.equal(missing.headers.get('Preference-Applied'),'omit-stage-candidates');
  const full=await (await h.read('?shape=display-v1',workRequest.workCatalogHeaders(null))).json();
  assert.equal(full.scope,undefined);assert.equal(full.works.length,3);assert.equal(full.counts.works,3);
  assert.deepEqual(await missing.json(),full);
  assert.equal(workExports.findDetailWork({...catalog,works:[focus,focus]},workId),null);
  const artist=await (await h.read('?shape=display-v1&artist=ive',workRequest.workCatalogHeaders(workId))).json();
  assert.notEqual(artist.scope?.type,'work');
  if(!guest)assert.equal((await (await h.read('',workRequest.workCatalogHeaders(workId))).json()).scope,undefined);
 }
 for(const bad of ['work-detail=bad','work-detail=recA, work-detail=recB','work-detail=recA?other','work-detail='+('a'.repeat(90))]){
  assert.equal(workRequest.preferredDetailWork(bad),null);
 }
 const longest='rec'+'a'.repeat(80);
 assert.equal(workRequest.preferredDetailWork(workRequest.workCatalogHeaders(longest).Prefer),longest);
 assert.equal(workRequest.workCatalogHeaders(longest+'a').Prefer,'omit-stage-candidates');
 const unavailable=routeHarness();unavailable.model.deny=true;
 unavailable.model.publicData={...sample(),works:[],counts:{works:0}};
 const publicOnly=await unavailable.read('?shape=display-v1',workRequest.workCatalogHeaders(workId));
 assert.deepEqual(await publicOnly.json(),unavailable.model.publicData);
 assert.deepEqual(unavailable.model.calls,['auth','public-query','public:null']);
 const limited={scope:{type:'work',workId}};
 assert.equal(workRequest.catalogCoversRoute(limited,workId),true);
 assert.equal(workRequest.catalogCoversRoute(limited,versionId),false);
 assert.equal(workRequest.catalogCoversRoute(limited,null),false);
 assert.equal(workRequest.catalogCoversRoute({},null),true);
});
test('only opted-in library and artist views omit comparison rows and preserve every other value',async()=>{
 for(const guest of [true,false]){
  const h=routeHarness(),catalog=sample();
  const stage=catalog.works[0].stage;
  Object.assign(stage,{candidateCount:1,candidates:[{videoId:'candidate'}],higherCandidate:{url:'https://youtu.be/other'},previousSources:[{videoId:'old'}]});
  catalog.works.push({id:'no-stage',stage:null,stageScore:0,watched:'已观看'});
  h.model.deny=guest;
  if(guest)h.model.publicData=catalog;else h.model.data=catalog;
  const before=JSON.stringify(catalog);
  for(const query of ['?shape=display-v1','?artist=ive&shape=display-v1']){
   const full=await (await h.read(query)).json();
   const response=await h.read(query,{Prefer:'other, omit-stage-candidates'});
   assert.equal(response.status,200);
   assert.equal(response.headers.get('Preference-Applied'),'omit-stage-candidates');
   assert.equal(response.headers.get('Vary'),'Prefer');
   assert.equal(response.headers.get('Cache-Control'),'private, no-store');
   assert.deepEqual(full.works[0].stage.candidates,stage.candidates);
   delete full.works[0].stage.candidates;
   assert.deepEqual(await response.json(),full);
   assert.equal(JSON.stringify(catalog),before);
  }
  if(!guest)assert.deepEqual((await (await h.read('',{Prefer:'omit-stage-candidates'})).json()).works[0].stage.candidates,stage.candidates);
 }
});
test('old tab requests still receive full evidence, new and old response photo outcomes agree',async()=>{const h=routeHarness(),old=await h.read(''),slim=await h.read('?shape=display-v1');assert.equal(old.headers.get('Cache-Control'),'private, no-store');const a=await old.json(),b=await slim.json();assert.equal(a.ratings[0].recognition,h.model.data.ratings[0].recognition);assert.equal(a.ratings[0].source,h.model.data.ratings[0].source);assert.equal('personalPhotoEligible' in a.ratings[0],false);assert.equal('recognition' in b.ratings[0],false);assert.equal(b.ratings[0].personalPhotoEligible,true);assert.deepEqual(plain(personalMvPhoto(a.ratings[0],'m','w')),plain(personalMvPhoto(b.ratings[0],'m','w')));});
test('artist and refresh combinations keep their original scopes, force flags and source fences',async()=>{for(const shape of ['', '&shape=display-v1'])for(const refresh of ['1','background']){const h=routeHarness(),r=await h.read('?artist=ive&refresh='+refresh+shape),d=await r.json();assert.equal(d.scope.groupId,'ive');assert.deepEqual(h.model.calls,['auth','native:owner:true','native-fence','artist:ive']);assert.equal('recognition' in d.ratings[0],!shape);assert.equal(d.ratings[0].score,0);}const h=routeHarness();h.model.native=false;await h.read('?shape=display-v1&refresh=background');assert.deepEqual(h.model.calls,['auth','native:owner:true','fallback:true','fallback-fence']);h.model.drift=true;assert.equal((await h.read('?shape=display-v1')).status,409);});
test('visitors use only the public reader; invalid shape and changed owner source never expose owner data',async()=>{const guest=routeHarness();guest.model.deny=true;const publicResponse=await guest.read('?artist=ive&shape=display-v1');assert.equal(publicResponse.status,200);assert.deepEqual(await publicResponse.json(),{public:true,ratings:[]});assert.deepEqual(guest.model.calls,['auth','public-query','public:ive']);for(const kind of ['shape','source']){const h=routeHarness();h.model.drift=kind==='source';const r=await h.read('?shape='+(kind==='shape'?'unknown':'display-v1'));assert.equal(r.status,kind==='shape'?400:409);assert.equal('ratings' in await r.json(),false);if(kind==='shape')assert.deepEqual(h.model.calls,['auth']);}const invalidGuest=routeHarness();invalidGuest.model.deny=true;const denied=await invalidGuest.read('?shape=unknown');assert.equal(denied.status,400);assert.equal('ratings' in await denied.json(),false);assert.deepEqual(invalidGuest.model.calls,['auth','public-query']);});
test('every current catalog consumer explicitly opts in; old servers can still return the full shape', () => {
 const pages = ['app/page.tsx', 'app/manage/page.tsx'];
 const artists = ['artist-sample', 'illit-artist', 'expanded-artist', 'ive-artist'];
 for (const file of pages) {
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /shape=display-v1/, file);
  assert.match(source, /CatalogView as Catalog/, file);
 }
 for (const name of artists) {
  const source = fs.readFileSync('components/' + name + '.tsx', 'utf8');
  assert.match(source, /await readArtistCatalog\(/, name);
  assert.match(source, /CatalogView as Catalog/, name);
 }
 const reader = fs.readFileSync('lib/idol/catalog-read-deadline.ts', 'utf8');
 assert.match(reader, /new URLSearchParams\(\{artist, shape: 'display-v1'\}\)/);
 assert.match(reader, /fetch\('\/api\/catalog\?' \+ query, \{cache: 'no-store', signal: requestSignal, headers: artistCatalogHeaders\}\)/);
 assert.match(reader, /artistCatalogHeaders = \{Prefer: 'omit-stage-candidates'\}/);
 const home = fs.readFileSync('app/page.tsx', 'utf8');
 assert.match(home, /shape=display-v1'\+\(force&&canEdit\?'&refresh=1':''\)/);
 assert.match(home, /shape=display-v1&refresh=background/);
});
