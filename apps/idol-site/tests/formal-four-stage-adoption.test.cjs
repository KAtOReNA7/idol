const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite');
const root=path.resolve(__dirname,'..'),read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const {beforePostV200Stages,beforePostV200StageStatuses}=require('./helpers/post-v200-stages.cjs');
const evidence=read('../../docs/codex/evidence/20261027-category-resolution/stages/formal-four-adoption.json'),videos=beforePostV200Stages(read('data/stage-videos.json')),statuses=beforePostV200StageStatuses(read('data/stages/status.json'));
const practice=read('../../docs/codex/evidence/20261028-stage-fill/adoption.json'),ownerBaseline=read('../../docs/codex/evidence/20261028-stage-fill/owner-baseline.json');
const replacements=read('../../docs/codex/evidence/20261028-continuous/stage-replacement-adoption.json');
const restoreHeyGabbyReviewBaseline=require('./helpers/heygabby-review-baseline.cjs');
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(sort(v))).digest('hex');
function harness(){
 // This historical cohort exercises production helpers/save code with exactly
 // restored source metadata; the later complete after objects are checked above.
 const readHistoricalJson=file=>file===path.join(root,'data/stage-videos.json')?structuredClone(videos):file===path.join(root,'data/stages/status.json')?structuredClone(statuses):JSON.parse(fs.readFileSync(file,'utf8'));
 const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync(path.join(root,'drizzle')).filter(f=>f.endsWith('.sql')))sql.exec(fs.readFileSync(path.join(root,'drizzle',file),'utf8'));
 const db={prepare(query){let args=[];return{bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)??null},async all(){return{results:sql.prepare(query).all(...args)}},async run(){return{meta:sql.prepare(query).run(...args),results:[]}}}},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results}catch(error){sql.exec('ROLLBACK');throw error}}};
 const modules=new Map(),stubs={'cloudflare:workers':{env:{DB:db}},'server-only':{}};
 function load(file){file=path.resolve(root,file);if(modules.has(file))return modules.get(file);const output={};modules.set(file,output);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;const requireLocal=name=>{if(name in stubs)return stubs[name];if(name.startsWith('.')||name.startsWith('@/')){let target=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);if(target.endsWith('.json'))return readHistoricalJson(target);if(!path.extname(target))target+='.ts';return load(target)}return require(name)};vm.runInNewContext('(function(require,exports){'+code+'})',{crypto:globalThis.crypto,TextEncoder,TextDecoder,URL,Response,Request,Uint8Array,DataView,Blob,Date,Map,Set,AbortSignal,CompressionStream,DecompressionStream,btoa,atob,fetch(){throw Error('Network forbidden in synthetic save test')}})(requireLocal,output);return output;}
 const native=load('lib/idol/native-save.ts'),{F}=load('lib/idol/fields.ts');let requestUser='synthetic-owner';
 stubs['@/lib/idol/save']={saveRecord:native.saveNativeRecord};
 const {AppError}=load('lib/idol/feishu.ts');
 stubs['@/lib/idol/http']={requireUser:async()=>({userId:requestUser}),sameOrigin(request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new AppError('ORIGIN_REJECTED','synthetic',403)},json:(data,status=200)=>Response.json(data,{status}),failure:error=>Response.json({error:error.code??'FAILED'},{status:error.status??502})};
 const route=load('app/api/save/route.ts');
 async function init(recordId){const f=F.works,fields=[{field_id:f.score,field_name:'MV分数',type:2},{field_id:f.stageScore,field_name:'舞台分数',type:2},{field_id:f.note,field_name:'点评',type:1},{field_id:f.watched,field_name:'观看状态',type:3,property:{options:[{name:'已观看'}]}}],raw={[f.score]:7.25,[f.stageScore]:null,[f.note]:'synthetic note, never production',[f.watched]:'已观看'},revision=await native.nativeRevision('synthetic-snapshot','works',recordId,1,raw);sql.prepare("INSERT OR IGNORE INTO idol_storage_control VALUES ('main','synthetic-owner','native',1,'synthetic-snapshot',NULL,1)").run();sql.prepare('INSERT OR IGNORE INTO idol_native_fields VALUES (?,?,?,?)').run('synthetic-snapshot:works','synthetic-snapshot','works',JSON.stringify(fields));sql.prepare('INSERT INTO idol_native_records (key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES (?,?,?,?,?,?,?,?)').run('synthetic-snapshot:works:'+recordId,'synthetic-snapshot','works',recordId,JSON.stringify(raw),revision,1,1);return{raw,revision,f};}
 return{sql,load,init,user(value){requestUser=value},post(input,origin='https://synthetic.test'){return route.POST(new Request('https://synthetic.test/api/save',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(input)}))}};
}
test('four earlier adoptions and eleven practices preserve all prior source objects and supplementary evidence',()=>{
 assert.equal(Object.keys(videos).length,493);assert.equal(Object.keys(evidence.preservation.stageRows).length,478);
 const historicalVideos=structuredClone(videos),historicalStatuses=structuredClone(statuses.works);
 assert.equal(replacements.items.length,8);
 for(const item of replacements.items){
  assert.equal(sha(videos[item.recordId]),item.afterSha256,item.recordId);
  assert.equal(sha(statuses.works[item.recordId]),item.afterStatusSha256,item.recordId);
  historicalVideos[item.recordId]=structuredClone(item.before);historicalStatuses[item.recordId]=structuredClone(item.beforeStatus);
 }
 assert.equal(sha(historicalVideos),replacements.preservation.stageCanonicalBefore);
 assert.equal(Object.keys(ownerBaseline.stageRowsSha256).length,482);
 for(const[id,hash]of Object.entries(ownerBaseline.stageRowsSha256))assert.equal(sha(historicalVideos[id]),hash,id);
 for(const[id,hash]of Object.entries(evidence.preservation.stageRows))assert.equal(sha(historicalVideos[id]),hash,id);
 const ids=new Set([...evidence.items,...practice.items].map(i=>i.recordId));assert.equal(ids.size,15);
 for(const[id,hash]of Object.entries(evidence.preservation.statusRows))if(!ids.has(id))assert.equal(sha(historicalStatuses[id]),hash,id);
 const current=restoreHeyGabbyReviewBaseline(read('data/stages/supplements.json')),delta=read('../../docs/codex/evidence/20261028-continuation/editorial-corrections.json');
 const viewing=read('../../docs/codex/evidence/20261028-continuous/stage-viewing-adoption.json');
 assert.equal(viewing.adopted.length,8);
 for(const[id,hash]of Object.entries(viewing.oldRows))assert.equal(sha(current.works[id]),hash,id);
 for(const item of viewing.adopted){
  assert.equal(Object.hasOwn(viewing.oldRows,item.workId),false);
  const row=current.works[item.workId];assert.deepEqual(Object.keys(row),['alternatives']);assert.equal(row.alternatives.length,1);
  assert.equal(sha(row.alternatives[0]),item.sha256,item.workId);delete current.works[item.workId];
 }
 assert.deepEqual(current.reviewedInputFiles,['alternatives-reviewed.json','watch-leads-reviewed.json','20261028-continuous/stage-replacements-normalized.json']);
 current.reviewedInputFiles=current.reviewedInputFiles.slice(0,-1);
 for(const row of Object.values(current.works)){row.alternatives=row.alternatives.filter(a=>a.sourceId!==delta.newViewOnlyCandidate.sourceId);for(const a of [...row.alternatives,...(row.watchLeads??[])])delete a.selection;}
 for(const c of delta.corrections){const row=current.works[c.workId];const i=row.alternatives.findIndex(a=>a.sourceId===c.sourceId);assert.deepEqual(row.alternatives[i],c.after);row.alternatives[i]=c.before;}
 current.updatedAt=delta.baselineUpdatedAt;assert.equal(sha(JSON.stringify(current,null,2)+'\n'),evidence.preservation.supplementsFileSha256);
});

test('eleven documented practices have exact empty-score bindings, original posters and public verification limits',()=>{
 const h=harness(),stage=h.load('lib/idol/stage.ts'),source=h.load('lib/idol/stage-source.ts'),lookup=h.load('lib/idol/approved-video-poster.ts').approvedVideoPoster,project=h.load('lib/idol/public-catalog.ts').projectPublicCatalog;
 assert.equal(practice.items.length,11);
 for(const item of practice.items){
  const s=stage.stageForWork(item.recordId);assert.equal(sha(s),item.sourceSha256);assert.equal(s.selection.occasion,'practice_room');assert.equal(source.stageHasValidBinding(s),true);assert.equal(source.stageSourceKey(s),item.videoId);assert.equal(s.scoreBinding.initializedAt,practice.ownerPreimageAt);assert.equal(item.fullPlaybackVerified,false);assert.match(s.verificationNote,/未完整播放/);assert.match(s.verificationNote,/练习室不代表现场人声/);assert.equal(statuses.works[item.recordId].status,'verified');
  const p=project({groups:[],members:[],ratings:[],works:[{id:item.recordId,stage:s}],counts:{}});assert.equal(p.works[0].stage.verificationNote,s.verificationNote);assert.equal(p.works[0].stage.sourceUrl,'');
  const poster=practice.posterEvidence.find(x=>x.workId===item.recordId),bytes=fs.readFileSync(path.join(root,'public',poster.src));assert.equal(sha(bytes),poster.sha256);assert.equal(bytes.length,poster.byteLength);assert.equal(lookup(item.recordId,item.videoId,'stage').src,poster.src);assert.equal(lookup(item.recordId,'wrongsource','stage'),null);assert.notEqual(lookup(item.recordId,item.videoId,'mv')?.src,poster.src);
 }
 h.sql.close();
});
test('precise bindings are accepted by actual stage helpers; public notes disclose documentary scope and no playback claim',()=>{
 const h=harness(),stage=h.load('lib/idol/stage.ts'),source=h.load('lib/idol/stage-source.ts'),project=h.load('lib/idol/public-catalog.ts').projectPublicCatalog;
 for(const item of evidence.items){const s=stage.stageForWork(item.recordId);assert.equal(source.stageHasValidBinding(s),true);assert.equal(source.stageSourceKey(s),item.videoId);assert.equal(s.scoreBinding.initializedAt,'2026-10-27T15:23:43Z');assert.match(s.verificationNote,/未完整播放/);assert.equal(item.fullPlaybackVerified,false);assert.equal(statuses.works[item.recordId].status,'verified');const p=project({groups:[],members:[],ratings:[],works:[{id:item.recordId,stage:s}],counts:{}});assert.equal(p.works[0].stage.verificationNote,s.verificationNote);assert.equal(p.works[0].stage.typeNote,'');assert.equal(p.works[0].stage.sourceUrl,'');}
 h.sql.close();
});
test('four exact official poster originals preserve SHA and are only returned for the correct work/video/stage tuple',()=>{
 const h=harness(),lookup=h.load('lib/idol/approved-video-poster.ts').approvedVideoPoster;
 for(const p of evidence.posterEvidence){const bytes=fs.readFileSync(path.join(root,'public',p.src));assert.equal(sha(bytes),p.sha256);assert.equal(bytes.length,p.byteLength);assert.deepEqual(p.intrinsicSize,{width:1280,height:720});const selected=lookup(p.workId,p.videoId,'stage');assert.equal(selected.src,p.src);assert.equal(selected.fit,'contain');assert.equal(lookup('recWrongWork',p.videoId,'stage'),null);assert.equal(lookup(p.workId,'abcdefghijk','stage'),null);assert.equal(lookup(p.workId,p.videoId,'mv'),null);}
 h.sql.close();
});
test('only a duplicate of the selected whole-video stage is hidden from other viewing choices; archived research and clips remain available',()=>{
 const source=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),tree=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TSX),fn=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='StageSupplements');
 const output={},jsx=(type,props)=>({type,props:props??{}}),runtime={jsx,jsxs:jsx,Fragment:'fragment'};
 const code=ts.transpileModule(fn.getText(tree)+'\nexport {StageSupplements};',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})',{performanceLabel:()=>'',performerLabel:()=>'',alternativeViewingNote:()=>'',selectionNote:()=>'',platformLabel:{youtube:'YouTube'},ArrowUpRight:'arrow',formatStageTime:String})(()=>runtime,output);
 function links(node){if(!node||typeof node!=='object')return[];return[...(node.type==='a'?[node.props.href]:[]),...[node.props?.children].flat(Infinity).flatMap(links)]}
 const supplements=read('data/stages/supplements.json');
 for(const item of evidence.items){const original=supplements.works[item.recordId],work={stage:videos[item.recordId],stageSupplement:original},before=JSON.stringify(original);assert.ok(!links(output.StageSupplements({work})).includes(item.url));assert.ok(links(output.StageSupplements({work:{...work,stage:{...work.stage,clip:{}}}})).includes(item.url));assert.equal(JSON.stringify(original),before);}
});
test('actual native save schema and POST route accept all fifteen audited new bindings in isolated memory, preserve other fields and reject mismatches',async()=>{
 const h=harness();
 for(const item of [...evidence.items,...practice.items]){const{raw,revision,f}=await h.init(item.recordId),input={table:'works',recordId:item.recordId,revision,operationId:crypto.randomUUID(),values:{stageScore:8.5},stageVideoId:item.videoId,stageSourceKey:item.videoId};
  for(const invalid of [{...input,stageVideoId:'abcdefghijk'},{...input,stageSourceKey:'wrong'},{...input,values:{stageScore:11}}]){const response=await h.post(invalid);assert.notEqual(response.status,200);assert.ok(['STAGE_SOURCE_CHANGED','INVALID_SCORE'].includes((await response.json()).error));}
  h.user('synthetic-other');assert.equal((await h.post(input)).status,403);h.user('synthetic-owner');assert.equal((await h.post(input,'https://wrong.test')).status,403);
  const response=await h.post(input);assert.equal(response.status,200);const result=await response.json();assert.equal(result.verified,true);assert.equal(result.stageSource.videoId,item.videoId);assert.equal(result.stageSource.sourceKey,item.videoId);assert.equal(result.values.stageScore,8.5);
  assert.deepEqual(await(await h.post(input)).json(),result,'idempotent retry');const after=JSON.parse(h.sql.prepare('SELECT fields_json FROM idol_native_records WHERE record_id=?').get(item.recordId).fields_json);for(const key of Object.keys(raw))assert.deepEqual(after[key],key===f.stageScore?8.5:raw[key]);
 }
 assert.equal(h.sql.prepare('SELECT count(*) AS n FROM idol_saves').get().n,15);h.sql.close();
});
