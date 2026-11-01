const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
function harness({afterBatch}={}){
 const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE idol_storage_control(id,owner_id,mode,epoch,active_snapshot);INSERT INTO idol_storage_control VALUES('main','owner','native',6,'snapshot');
 CREATE TABLE idol_native_fields(snapshot_id,table_key,fields_json);INSERT INTO idol_native_fields VALUES('snapshot','works','[{"field_id":"fld641ausT"}]');
 CREATE TABLE idol_native_records(snapshot_id,table_key,record_id,fields_json);
 CREATE TABLE idol_saves(user_id,record_id,table_key,status,created_at,id,payload);`);
 const insert=sql.prepare('INSERT INTO idol_native_records VALUES(?,?,?,?)');for(const [id,value] of [['recEmpty',null],['recZero',0],['recRated',9],['recBlank',' ']])insert.run('snapshot','works',id,JSON.stringify({fld641ausT:value,privateNote:'NEVER_EXPORT_ME'}));
 sql.prepare('INSERT INTO idol_saves VALUES(?,?,?,?,?,?,?)').run('owner','recZero','works','unknown',0,'save1','SECRET_PAYLOAD');
 sql.prepare('INSERT INTO idol_saves VALUES(?,?,?,?,?,?,?)').run('owner','recOther','works','done',1,'save2','UNRELATED_PRIVATE');
 const queries=[],sources={recEmpty:{videoId:'source12345'},recZero:{videoId:'zeroVideo12'}};
 const db={prepare(q){queries.push(q);let args=[];return{bind(...a){args=a;return this},async first(){return sql.prepare(q).get(...args)??null},async run(){return{success:true,results:sql.prepare(q).all(...args)}}}},async batch(items){sql.exec('BEGIN');try{const result=[];for(const item of items)result.push(await item.run());sql.exec('COMMIT');afterBatch?.(sql,result);return result;}catch(e){if(sql.isTransaction)sql.exec('ROLLBACK');throw e;}}};
 class AppError extends Error{constructor(code,message,status){super(message);this.code=code;this.status=status;}}
 const mods=new Map();function load(file){if(mods.has(file))return mods.get(file);const e={};mods.set(file,e);const code=ts.transpileModule(fs.readFileSync(path.join(root,'lib/idol',file+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(`(function(require,exports){${code}})`,{crypto,TextEncoder,btoa,Uint8Array,Date})(n=>n==='cloudflare:workers'?{env:{DB:db}}:n==='./feishu'?{AppError}:n==='./native-format'?{}:n==='./stage'?{stageSourceMetadata:sources}:load(n.slice(2)),e);return e;}
 return{sql,queries,sources,call:load('stage-owner-preflight').stageOwnerPreflight};
}
const decode=e=>{const b=Buffer.from(e.payloadBase64,'base64');assert.equal(b.length,e.byteLength);assert.equal(createHash('sha256').update(b).digest('hex'),e.sha256);return JSON.parse(b);};
test('live owner preflight checks a batch atomically and exposes neither private values nor unrelated logs',async()=>{
 const h=harness(),before=h.sql.prepare('SELECT total_changes() n').get().n;
 const e=await h.call('owner',['recEmpty','recZero','recRated','recBlank']),p=decode(e);
 assert.deepEqual(p.works.map(r=>r.scoreEmpty),[true,false,false,true]);assert.equal(p.journalCheck.totalRows,2);assert.equal(p.journalCheck.matches.length,1);assert.equal(p.journalCheck.matches[0].status,'unknown');assert.equal(p.stageVideos.recRated,null);
 assert.doesNotMatch(JSON.stringify(p),/NEVER_EXPORT|SECRET_PAYLOAD|UNRELATED_PRIVATE|recOther|privateNote/);assert.equal(h.sql.prepare('SELECT total_changes() n').get().n,before);
 assert.ok(h.queries.every(q=>q.startsWith('SELECT')));assert.ok(Date.now()-Date.parse(p.capturedAt)<5000);h.sql.close();
});
test('wrong owner, invalid scope, unknown record, absent score schema and frozen storage fail closed',async()=>{
 const h=harness();await assert.rejects(h.call('other',['recEmpty']),e=>e.code==='OWNER_ONLY');
 for(const ids of [[],['recEmpty','recEmpty'],['bad'],['recEmpty',null],Array.from({length:6},(_,i)=>'rec'+i)])await assert.rejects(h.call('owner',ids),e=>e.code==='INVALID_WORK_IDS');
 await assert.rejects(h.call('owner',['recAbsent']),e=>e.code==='PREFLIGHT_MISSING_WORK');
 h.sql.exec("UPDATE idol_native_fields SET fields_json='[]'");await assert.rejects(h.call('owner',['recEmpty']),e=>e.code==='PREFLIGHT_SCHEMA');
 h.sql.exec("UPDATE idol_storage_control SET mode='frozen'");await assert.rejects(h.call('owner',['recEmpty']),e=>e.code==='NATIVE_REQUIRED');h.sql.close();
});
test('oversized results are rejected rather than silently truncated',async()=>{const h=harness();h.sources.recEmpty={title:'x'.repeat(20000)};await assert.rejects(h.call('owner',['recEmpty']),e=>e.code==='PREFLIGHT_TOO_LARGE');h.sql.close();});
test('storage changes during reading and incomplete DB responses cannot issue a preflight',async()=>{
 const changed=harness({afterBatch:sql=>sql.exec('UPDATE idol_storage_control SET epoch=epoch+1')});await assert.rejects(changed.call('owner',['recEmpty']),e=>e.code==='STORAGE_CHANGING');changed.sql.close();
 const failed=harness({afterBatch:(_sql,result)=>{result[3].success=false}});await assert.rejects(failed.call('owner',['recEmpty']),e=>e.code==='PREFLIGHT_INCOMPLETE');failed.sql.close();
});
test('the actual MCP registry exposes the read-only tool and rejects extra input before dispatch',async()=>{
 const e={},calls=[],code=ts.transpileModule(fs.readFileSync(path.join(root,'lib/idol/site-tools.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 class AppError extends Error{constructor(code,message){super(message);this.code=code;}}
 vm.runInNewContext(`(function(require,exports){${code}})`,{})(name=>name==='./feishu'?{AppError}:name==='./stage-owner-preflight'?{stageOwnerPreflight:async(...args)=>{calls.push(args);return{ok:true}}}:{},e);
 const tool=e.siteTools.find(t=>t.name==='idol_stage_owner_preflight');assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.inputSchema.properties.workIds.maxItems,5);
 await e.callSiteTool('owner',tool.name,{workIds:['recEmpty']});assert.equal(calls.length,1);assert.equal(calls[0][0],'owner');
 await assert.rejects(e.callSiteTool('owner',tool.name,{workIds:['recEmpty'],userId:'other'}),err=>err.code==='INVALID_TOOL_INPUT');assert.equal(calls.length,1);
});

const {workId,merge,base}=require('./helpers/stage-fallback-fixture.cjs');
const prepared=require('../../../docs/codex/evidence/20261101-crush-preparation/ive-crush-prepared-20261101.json'),previous=require('../../../docs/codex/evidence/20261101-crush-preparation/previous-source.json');
function batch(){const b=structuredClone(prepared);b.items[0].recordId=workId;return b;}
function envelope(fresh,edit=()=>{},editEnvelope=()=>{}){
 const ids=fresh.tables.works.records.map(w=>w.recordId),p={formatVersion:'idol.stage-owner-preflight.v1',source:'native',capturedAt:fresh.capturedAt,complete:true,workIds:ids,
 works:fresh.tables.works.records.map(w=>({recordId:w.recordId,scoreEmpty:w.fields.fld641ausT==null||(typeof w.fields.fld641ausT==='string'&&!w.fields.fld641ausT.trim())})),
 journalCheck:{complete:true,totalRows:fresh.journal.length,matches:fresh.journal.filter(r=>ids.includes(r.record_id))},stageVideos:Object.fromEntries(ids.map(id=>[id,fresh.siteMetadata.stageVideos[id]??null]))};edit(p);
 const bytes=Buffer.from(JSON.stringify(p)),e={formatVersion:'idol.stage-preflight-envelope.v1',byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),payloadBase64:bytes.toString('base64')};editEnvelope(e);return e;
}
test('guarded importer accepts scoped owner evidence while retaining zero-score and all-status journal protection',()=>{
 const empty=merge(batch(),{previous,transformExport:envelope});assert.equal(empty.status,0,empty.stderr);assert.equal(empty.videos[workId].bilibili.page,2);
 for(const options of [{score:0},{score:9},{journal:[{record_id:workId,table_key:'works',status:'unknown'}]}]){const r=merge(batch(),{previous,...options,transformExport:envelope});assert.equal(r.status,0,r.stderr);assert.deepEqual(r.videos[workId],previous);}
});
test('one owner preflight covers multiple prepared works; an invalid later target cannot partially adopt the first',()=>{
 const b=batch(),s=base();b.items.push({recordId:'recSecond',status:'verified',selected:s,selectedVideoId:s.videoId,candidates:[s],reason:'Synthetic complete same-version candidate',checkedAt:s.checkedAt});
 const options={previous,additionalWorks:[{recordId:'recSecond',song:'Other Song'}],transformExport:envelope};
 const result=merge(b,options);assert.equal(result.status,0,result.stderr);assert.equal(result.videos[workId].bilibili.page,2);assert.equal(result.videos.recSecond.videoId,s.videoId);
 const invalid=structuredClone(b);invalid.items[1].selectedVideoId='wrongVideo1';const rejected=merge(invalid,options);assert.notEqual(rejected.status,0);assert.deepEqual(rejected.beforeFiles,rejected.afterFiles);
});
test('expired, incomplete, corrupted and wrong-source preflights cannot change any files',()=>{
 const mutations=[p=>{p.complete=false},p=>{p.workIds=['recWrong']},p=>{p.works=[]},p=>{p.works[0].scoreEmpty='true'},p=>{p.journalCheck.complete=false},p=>{delete p.stageVideos[workId]},p=>{p.stageVideos[workId]={videoId:'WRONG'}},p=>{p.capturedAt=new Date(Date.now()-301000).toISOString()}];
 for(const edit of mutations){const r=merge(batch(),{previous,transformExport:f=>envelope(f,edit)});assert.notEqual(r.status,0);assert.deepEqual(r.beforeFiles,r.afterFiles);}
 const corrupt=merge(batch(),{previous,transformExport:f=>envelope(f,()=>{},e=>{e.sha256='0'.repeat(64)})});assert.notEqual(corrupt.status,0);assert.deepEqual(corrupt.beforeFiles,corrupt.afterFiles);
});
