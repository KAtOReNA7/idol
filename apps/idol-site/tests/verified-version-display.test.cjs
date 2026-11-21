// eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS Node test harness and TypeScript VM loader.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Read the checked-in public-only review fixture.
const reviewed=require('../data/versions/verified-display.json');
function compile(file,dependencies={}){const out={},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{URL,Map,Set,Date,JSON})(n=>{assert.ok(n in dependencies,n);return dependencies[n]},out);return out;}
const {F}=compile('lib/idol/fields.ts'),values=compile('lib/idol/values.ts');
const moduleUnderTest=compile('lib/idol/verified-version-display.ts',{'@/data/versions/verified-display.json':reviewed,'./fields':{F},'./values':values});
const fieldMap={name:F.works.name,song:F.works.song,url:F.works.url,videoType:F.works.videoType,version:F.works.version,releaseDate:F.works.releaseDate,officialTitle:F.works.officialTitle,channel:F.works.channel,channelUrl:'fld6Ab27Zx',performerUnit:'fld2UfUVYO',groupIds:F.works.groups};
function fixture(){const tables={works:{fields:Object.values(fieldMap).map(field_id=>({field_id})),records:reviewed.identities.map(w=>({recordId:w.workId,fields:Object.fromEntries(Object.entries(fieldMap).map(([key,id])=>[id,key==='groupIds'?w.groupIds.map(recordId=>({recordId})):w[key]]))}))}};const catalog={mode:'live',works:reviewed.identities.map(w=>({id:w.workId,name:w.name,song:w.song,url:w.url,groupIds:w.groupIds,version:w.version,score:null,stageScore:null,note:'',watched:'',ratingIds:[],stage:null,placeholder:null})),ratings:[],groups:[],members:[]};return {tables,catalog};}
const project=f=>moduleUnderTest.withVerifiedVersionDisplay(f.catalog,f.tables);
test('every approved directed version link opens with the same work and labels from a scoped detail',()=>{
 const {projectWorkCatalog}=compile('lib/idol/work-catalog.ts',{'./public-work-credits':require('./helpers/timeline-dependency-loader.cjs').timelineDependency('./public-work-credits')});
 const catalog=project(fixture());
 let checked=0;
 for(const work of catalog.works){
  const scoped=projectWorkCatalog(catalog,work);
  assert.strictEqual(scoped.works.find(w=>w.id===work.id),work);
  for(const link of work.versionDisplay?.links??[]){
   const next=scoped.works.find(w=>w.id===link.workId);
   assert.ok(next&&!next.placeholder);
   assert.deepEqual(next,projectWorkCatalog(catalog,next).works.find(w=>w.id===next.id));
   assert.deepEqual(next,catalog.works.find(w=>w.id===next.id));
   checked++;
  }
 }
 assert.equal(checked,72);
});
test('minimal reviewed package: 7 tags, 37 edges / 36 pairs, 71 public identities only',()=>{assert.equal(reviewed.tags.length,7);assert.equal(reviewed.relations.length,37);assert.equal(reviewed.identities.length,71);assert.equal(new Set(reviewed.relations.map(e=>[e.fromWorkId,e.toWorkId].sort().join(':'))).size,36);const f=fixture(),before=JSON.stringify(f),out=project(f);assert.equal(JSON.stringify(f),before);assert.equal(out.works.filter(w=>w.versionDisplay?.tags.length).length,7);assert.equal(out.works.filter(w=>w.versionDisplay?.links.length).length,68);assert.equal(out.works.filter(w=>w.versionDisplay).length,71);assert.doesNotMatch(JSON.stringify(reviewed),/summaryZh|beforePublicHash|holdReason|scoreBinding|toResourceId|candidateId|creditedArtistNames/)});
test('all 12 public identity fields drift independently and fail closed',()=>{const base=reviewed.identities[0];for(const key of moduleUnderTest.versionIdentityFields){const changed={...base,[key]:key==='groupIds'?[]:'changed'};assert.equal(moduleUnderTest.versionIdentityMatches(changed,base),false,key)}const target='rec28ldfRTrDnx';for(const [key,id]of Object.entries(fieldMap)){const f=fixture(),row=f.tables.works.records.find(w=>w.recordId===target);row.fields[id]=key==='groupIds'?[]:'changed';assert.equal(project(f).works.find(w=>w.id===target).versionDisplay,undefined,key)}});
test('no schema, omitted raw cell, snapshot, duplicate row, placeholder hide increment',()=>{for(const mutation of [f=>f.tables.works.fields=[],f=>delete f.tables.works.records.find(w=>w.recordId==='rec28ldfRTrDnx').fields[F.works.version],f=>f.catalog.mode='snapshot',f=>f.tables.works.records.push(f.tables.works.records[0]),f=>f.catalog.works.find(w=>w.id==='rec28ldfRTrDnx').placeholder={reason:'placeholder'}]){const f=fixture();mutation(f);assert.equal(project(f).works.find(w=>w.id==='rec28ldfRTrDnx').versionDisplay,undefined)}});
test('both endpoints must still match; multi-semantic links deduplicate, non-same-song stays distinct',()=>{let f=fixture(),out=project(f),work=out.works.find(w=>w.id==='recvxyOz5X4MBp');const link=work.versionDisplay.links.find(l=>l.workId==='recvxyOz5XVlTp');assert.equal(work.versionDisplay.links.length,1);assert.equal(link.labels.length,2);assert.ok(link.categories.includes('其他版本'));assert.ok(link.categories.includes('系列影像'));f.tables.works.records.find(w=>w.recordId===link.workId).fields[F.works.url]='https://www.youtube.com/watch?v=DIFFERENT00';out=project(f);assert.equal(out.works.find(w=>w.id==='recvxyOz5X4MBp').versionDisplay.links.length,0);for(const link of out.works.find(w=>w.id==='rec28ldfRTrO2v').versionDisplay.links){assert.deepEqual(Array.from(link.categories),['混音关联'])}});
test('private edits irrelevant; display has no URL, playback source, binding or original identity fields',()=>{const f=fixture(),before=project(f);for(const w of f.catalog.works){w.score=8;w.stageScore=9;w.watched='test';w.note='private test';w.stage={videoId:'private-test',scoreBinding:{test:true}}}const out=project(f);assert.equal(JSON.stringify(out.works.map(w=>w.versionDisplay)),JSON.stringify(before.works.map(w=>w.versionDisplay)));for(const w of out.works){assert.equal(w.score,8);assert.equal(w.note,'private test');if(w.versionDisplay){assert.deepEqual(Object.keys(w.versionDisplay).sort(),['links','tags']);for(const link of w.versionDisplay.links)assert.deepEqual(Object.keys(link).sort(),['categories','labels','title','workId']);assert.doesNotMatch(JSON.stringify(w.versionDisplay),/https?:|score|stage|watched|private/);}}});
test('only current native rows may publish verified version labels after a concurrent identity change',async()=>{
 const target='rec28ldfRTrDnx',batches=[fixture(),fixture()];
 batches[1].tables.works.records.find(row=>row.recordId===target).fields[F.works.url]='https://youtu.be/DIFFERENT00';
 const hasLabel=catalog=>Boolean(catalog.works.find(work=>work.id===target).versionDisplay);
 const control={owner_id:'owner',mode:'native',epoch:1,active_snapshot:'review'};
 let generation=0;
 const projections=[],received=[];
 const db={prepare(sql){
  if(sql.includes('FROM idol_storage_control'))return {first:async()=>({...control,catalog_generation:generation})};
  assert.match(sql,/SELECT captured_at FROM idol_native_snapshots/);
  return {bind:(snapshot,owner)=>{assert.equal(snapshot,control.active_snapshot);assert.equal(owner,control.owner_id);return {first:async()=>({captured_at:'2026-11-22'})};}};
 }};
 class AppError extends Error{constructor(code,message,status){super(message);Object.assign(this,{code,status});}}
 const reader=compile('lib/idol/native-reader.ts',{
  'cloudflare:workers':{env:{}},'./native-format':{},'./live':{},'./fields':{F},'./feishu':{AppError},
  './native-storage':{nativeDb:()=>db,sourceStamp:state=>JSON.stringify([state.mode,state.epoch,state.active_snapshot]),
   nativeTables:async snapshot=>{assert.equal(snapshot,control.active_snapshot);return batches[generation].tables;}},
  './catalog':{projectCatalog:(tables,mode)=>{assert.strictEqual(tables,batches[generation].tables);assert.equal(mode,'live');return batches[generation].catalog;}},
  './verified-version-display':moduleUnderTest,'./group-milestones':{withGroupMilestones:catalog=>catalog},
  './social-facts':{withSocialFacts:async catalog=>{
   projections.push(hasLabel(catalog));
   generation=1; // The work changes after projection and before the native entry is published.
   return catalog;
  }},
 });
 const result=await reader.withNativeCatalog('owner',false,catalog=>{received.push(hasLabel(catalog));return catalog;});
 assert.deepEqual(projections,[true,false]);
 assert.deepEqual(received,[false]);
 assert.equal(hasLabel(result.value),false);
 control.mode='feishu';
 assert.equal(await reader.readNativeCatalog('owner'),null);
 assert.deepEqual(projections,[true,false]);
 assert.doesNotMatch(fs.readFileSync('lib/idol/verified-version-display.ts','utf8'),/fetch\(|INSERT |UPDATE |DELETE |scoreBinding|stageSupplement/);
 assert.doesNotMatch(fs.readFileSync('lib/idol/catalog.ts','utf8'),/withVerifiedVersionDisplay/);
});
