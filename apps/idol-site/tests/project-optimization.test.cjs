const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const ts=require('typescript');
const load=require('./helpers/public-artist-loader.cjs');

test('published program notes appear only for the four reviewed work, group and MV combinations',()=>{
 const {applyStageResearchFollowups}=load('lib/idol/stage-research-followups.ts');
 const {validStageResearchNote}=load('lib/idol/stage-public-research.ts');
 const {records}=require('../data/stages/research-followups-20261121.json');
 const inventory=require('../data/stages/inventory.json').works;
 const stages=require('../data/stage-videos.json');
 assert.equal(new Set(records.map(row=>row.workId)).size,4);
 for(const row of records){
  const target=inventory.find(work=>work.recordId===row.workId);
  assert.ok(target.groupIds.includes(row.groupId));
  assert.equal(target.mv.videoId,row.videoId);
  assert.equal(stages[row.workId],undefined);
  assert.ok(validStageResearchNote(row.note));
  const work={id:row.workId,groupIds:target.groupIds,url:target.mv.url,stage:null,stageScore:0,score:0};
  const visible=applyStageResearchFollowups(work);
  assert.deepEqual(visible,{...work,stageSupplement:{alternatives:[],researchNote:row.note}});
  assert.equal(applyStageResearchFollowups(visible),visible);
  for(const patch of [{id:'other'},{groupIds:[]},{url:''},{stage:{videoId:row.videoId}}]){
   const different={...work,...patch};
   assert.equal(applyStageResearchFollowups(different),different);
  }
 }
});

test('CRUSH artwork belongs only to the reviewed P2 and retains its original bytes',()=>{
 const {approvedStagePoster}=load('lib/idol/approved-video-poster.ts');
 const [poster]=require('../data/stage-crush-poster-20261121.json').entries;
 const stage=require('../data/stage-videos.json')[poster.workId];
 const exact=approvedStagePoster(poster.workId,stage);
 assert.equal(exact.src,poster.src);
 const original=fs.readFileSync(path.resolve('../../docs/codex/evidence/20261101-feasibility-audit/crush-p2-first-frame.jpg'));
 const image=fs.readFileSync(path.join('public',poster.src));
 assert.deepEqual(image,original);
 assert.equal(createHash('sha256').update(image).digest('hex'),poster.sha256);
 for(const variant of [{...stage,bilibili:{cid:'25859329666',page:1}},{...stage,clip:{startSeconds:10,endSeconds:50}},stage.previousSources.at(-1)]){
  assert.notEqual(approvedStagePoster(poster.workId,variant)?.src,poster.src);
 }
 assert.equal(approvedStagePoster('recOther',stage),null);
});

test('QWER artwork retains the reviewed 14-second frame for only video one',()=>{
 const {approvedStagePoster}=load('lib/idol/approved-video-poster.ts');
 const [frame]=require('../data/stage-qwer-poster-20261121.json').entries;
 const stage=require('../data/stage-videos.json')[frame.workId];
 const image=fs.readFileSync(path.join('public',frame.src));
 assert.equal(image.length,frame.byteLength);
 assert.equal(createHash('sha256').update(image).digest('hex'),frame.sha256);
 assert.equal(frame.sourceKey,stage.scoreBinding.sourceKey);
 assert.equal(frame.frameSeconds,14);
 assert.deepEqual(approvedStagePoster(frame.workId,stage),{
  src:frame.src,label:frame.label,fit:'contain',intrinsicSize:{width:1920,height:1080},
 });
 assert.equal(approvedStagePoster(frame.workId,{...stage,xMedia:{videoIndex:2}}),null);
});

test('owner preflight targets use the migration primary key; journal remains complete',()=>{
 const db=new DatabaseSync(':memory:');
 try {
  for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()) db.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
  const source=fs.readFileSync('lib/idol/stage-owner-preflight.ts','utf8');
  const query=source.match(/db\.prepare\(`(SELECT record_id,fields_json FROM idol_native_records[^`]+)`\)/)[1]
    .replace(/\$\{ids\.map\(.*?\.join\(','\)\}/,'?');
  const plan=db.prepare('EXPLAIN QUERY PLAN '+query).all('sample','sample:works:recOne');
  assert.ok(plan.some(row=>row.detail.includes('SEARCH')&&row.detail.includes('key=?')));
  assert.match(source,/SELECT record_id,table_key,status FROM idol_saves WHERE user_id=\? ORDER BY created_at,id/);
 }finally{db.close();}
});

test('public photo authorization reuses its index and invalidates on every storage boundary',async()=>{
 const state={owner_id:'one',active_snapshot:'snapshot',mode:'native',epoch:1};
 let generation=1,reads=0,visible=true,onObject=null;
 const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13]);
 const hash=createHash('sha256').update(bytes).digest('hex');
 const photo={table:'members',recordId:'recPhoto',index:0};
 const errors=class extends Error{constructor(code,message,status){super(message);this.code=code;this.status=status;}};
 const modules={
  'server-only':{},
  'cloudflare:workers':{env:{BUCKET:{async get(){onObject?.();return {body:bytes,size:bytes.length};}}}},
  './feishu':{AppError:errors},
  './fields':{F:{members:{photo:'memberPhoto'},ratings:{photo:'ratingPhoto'}}},
  './native-format':{bytesHash:async value=>createHash('sha256').update(value).digest('hex')},
  './image-integrity':{MAX_IMAGE_BYTES:1000,boundedBytes:async r=>new Uint8Array(await r.arrayBuffer()),imageHeader:()=>({mime:'image/png'})},
  './native-storage':{storageControl:async()=>({...state}),sourceStamp:c=>JSON.stringify([c.active_snapshot,c.mode,c.epoch]),
   nativeRow:async()=>({fields_json:JSON.stringify({memberPhoto:[{file_token:'sample'}]})}),
   nativeDb:()=>({prepare:q=>({bind:()=>({first:async()=>q.includes('generation')?{generation}:{object_key:'sample',sha256:hash,content_type:'image/png',byte_length:bytes.length}})})})},
  './native-reader':{readNativeCatalog:async()=>{reads++;return {groups:[],members:visible?[{id:'recPhoto',photo}]:[],ratings:[]};}},
  './artist-catalog':{projectArtistCatalog:value=>value},'./browser-catalog':{projectBrowserCatalog:value=>value},
  './public-catalog':{projectPublicCatalog:value=>value}
 };
 const source=fs.readFileSync('lib/idol/public-reader.ts','utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const api={};
 vm.runInNewContext('(function(require,exports){'+code+'})',{URL,Response,Uint8Array})(name=>{assert.ok(Object.hasOwn(modules,name));return modules[name];},api);
 const read=()=>api.readPublicMedia(new Request('https://local.test/api/media?table=members&record=recPhoto&index=0'));
 assert.equal((await read()).status,200);
 assert.equal((await read()).status,200);
 assert.equal(reads,1);
 for (const change of [()=>generation++,()=>state.epoch++,()=>state.active_snapshot='next',()=>state.owner_id='two',()=>state.mode='frozen']) {
  change();const before=reads;await read();assert.equal(reads,before+1);
 }
 onObject=()=>generation++;
 await assert.rejects(read(),{code:'STORAGE_CHANGING'});
 visible=false;onObject=null;
 await assert.rejects(read(),{code:'MISSING_MEDIA'});
});
