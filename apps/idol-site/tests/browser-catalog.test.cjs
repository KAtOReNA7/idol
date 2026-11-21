const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
class AppError extends Error{constructor(code,message,status){super(message);Object.assign(this,{code,status});}}
const modules=new Map();function load(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);const out={};modules.set(file,out);const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams})((n)=>n==='./feishu'?{AppError}:load(path.resolve(path.dirname(file),n)+'.ts'),out);return out;}
const {projectBrowserCatalog,requestedBrowserCatalog,withoutStageCandidates}=load('lib/idol/browser-catalog.ts'),{personalMvPhoto,memberWorks,memberWorkSummary}=load('lib/idol/member-works.ts');
const plain=x=>JSON.parse(JSON.stringify(x));
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
 assert.deepEqual(h.model.projectedAfter,[['auth','control:owner','native:false','fence','artist:ive']]);
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
function routeHarness(){
 const model={data:sample(),publicData:{public:true,ratings:[]},projectedAfter:[],calls:[],native:true,deny:false,drift:false};
 const stubs={
  '@/lib/idol/personal-mv-ratings':{personalMvRatingsForOwner:async()=>model.personal},
  '@/lib/idol/public-access':{ownerForRequest:async()=>{model.calls.push('auth');return model.deny?null:{userId:'owner'};}},
  '@/lib/idol/public-reader':{publicQuery:request=>{model.calls.push('public-query');return new URL(request.url).searchParams;},readPublicCatalog:async artist=>{model.calls.push('public:'+artist);return model.publicData;}},
  '@/lib/idol/browser-catalog':{projectBrowserCatalog:data=>{model.projectedAfter.push([...model.calls]);return projectBrowserCatalog(data);},requestedBrowserCatalog,withoutStageCandidates},
  '@/lib/idol/artist-catalog':{requestedArtist:p=>p.get('artist'),projectArtistCatalog:(d,artist)=>{model.calls.push('artist:'+artist);return {...d,scope:{type:'artist',groupId:artist}};}},
  '@/lib/idol/native-storage':{ownControl:async u=>{model.calls.push('control:'+u);return {epoch:6};},assertSourceUnchanged:async()=>{model.calls.push('fence');if(model.drift)throw new AppError('STORAGE_CHANGING','changed',409);}},
  '@/lib/idol/native-reader':{readNativeCatalog:async(u,force)=>{model.calls.push('native:'+force);return model.native?model.data:null;}},
  '@/lib/idol/durable-catalog':{getReadableCatalog:async(u,force)=>{model.calls.push('fallback:'+force);return model.data;}},
  '@/lib/idol/http':{requireUser:async()=>{model.calls.push('auth');if(model.deny)throw new AppError('OWNER_ONLY','owner',403);return {userId:'owner'};},json:d=>new Response(JSON.stringify(d),{headers:{'Cache-Control':'private, no-store'}}),failure:e=>new Response(JSON.stringify({error:e.code}),{status:e.status??500})},
 };
 const out={},js=ts.transpileModule(fs.readFileSync('app/api/catalog/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL})(n=>{const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(n);if(timelineModule!==undefined)return timelineModule;assert.ok(n in stubs,n);return stubs[n];},out);
 return {model,read:(p,headers)=>out.GET(new Request('https://example.org/api/catalog'+p,{headers}))};
}
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
test('artist and refresh combinations keep their original scopes, force flags and source fences',async()=>{for(const shape of ['', '&shape=display-v1'])for(const refresh of ['1','background']){const h=routeHarness(),r=await h.read('?artist=ive&refresh='+refresh+shape),d=await r.json();assert.equal(d.scope.groupId,'ive');assert.deepEqual(h.model.calls,['auth','control:owner','native:true','fence','artist:ive']);assert.equal('recognition' in d.ratings[0],!shape);assert.equal(d.ratings[0].score,0);}const h=routeHarness();h.model.native=false;await h.read('?shape=display-v1&refresh=background');assert.deepEqual(h.model.calls,['auth','control:owner','native:true','fallback:true','fence']);});
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
