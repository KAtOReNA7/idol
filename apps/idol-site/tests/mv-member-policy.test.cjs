const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
function bundle(entry){const out=esbuild.buildSync({entryPoints:[path.join(root,entry)],bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers'],logLevel:'silent'});const m=new Module(path.join(root,'tests/policy-bundle.cjs'),module);m.filename=path.join(root,'tests/policy-bundle.cjs');m.paths=module.paths;m.require=n=>n==='cloudflare:workers'?{env:{}}:require(n);m._compile(out.outputFiles[0].text,m.filename);return m.exports;}
const {mvMemberAbsence}=bundle('lib/idol/mv-member-appearance.ts');
const {assertMemberScoreAllowed}=bundle('lib/idol/member-score-policy.ts');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/mv-member-appearance.json'),'utf8'));
test('absence requires the exact work and current video; animation labels and missing photos have no authority',()=>{
 for(const r of rows.entries){assert.ok(mvMemberAbsence({id:r.workId,url:'https://www.youtube.com/watch?v='+r.videoId}));assert.equal(mvMemberAbsence({id:'recOther',url:'https://www.youtube.com/watch?v='+r.videoId}),null);assert.equal(mvMemberAbsence({id:r.workId,url:'https://www.youtube.com/watch?v=abcdefghijk'}),null);assert.ok(r.sources.length>=2);}
 for(const r of rows.retainedMemberScoring)assert.equal(mvMemberAbsence({id:r.workId,url:'https://www.youtube.com/watch?v='+r.videoId}),null);
 assert.equal(mvMemberAbsence({id:'recMissing',url:'',videoType:'动画',photo:null,ratingIds:[]}),null);
});
test('score guard uses resolved works and cannot be disabled by a client appearance claim',async()=>{
 const r=rows.entries[0],work={id:r.workId,url:'https://www.youtube.com/watch?v='+r.videoId};let calls=0;const read=async()=>{calls++;return work;};
 for(const values of [{score:5},{stylingScore:4},{score:null},{score:5,memberAppears:true}])await assert.rejects(assertMemberScoreAllowed(values,[r.workId],read),e=>e.code==='MV_HAS_NO_MEMBERS');
 assert.equal(calls,4);await assertMemberScoreAllowed({note:'synthetic'},[r.workId],()=>{throw Error('unneeded read')});
 await assertMemberScoreAllowed({score:5},['recMissing'],async()=>({id:'recMissing',url:'https://www.youtube.com/watch?v=abcdefghijk'}));
});
const file=path.join(root,'tests/native-storage.test.cjs'),prefix=fs.readFileSync(file,'utf8').split("test('native save changes")[0],mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(prefix+'\nmodule.exports=harness;',file);const harness=mod.exports;
test('native save blocks no-member scores before a journal/write while preserving existing ratings and MV scoring',async()=>{
 const h=harness();await h.init();const r=rows.entries[0],F=h.load('lib/idol/fields.ts').F;
 const workRaw={[F.works.url]:'https://www.youtube.com/watch?v='+r.videoId,[F.works.score]:7},workRev=await h.load('lib/idol/native-save.ts').nativeRevision('snap','works',r.workId,1,workRaw);
 h.sql.prepare('INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES (?,?,?,?,?,?,?,?)').run('snap:works:'+r.workId,'snap','works',r.workId,JSON.stringify(workRaw),workRev,1,1);
 const ratingFields=[{field_id:F.ratings.score,field_name:'表现分',type:1},{field_id:F.ratings.stylingScore,field_name:'造型分',type:2},{field_id:F.ratings.works,field_name:'作品',type:18}],raw={[F.ratings.works]:[r.workId],[F.ratings.score]:'8',[F.ratings.stylingScore]:9},rev=await h.load('lib/idol/native-save.ts').nativeRevision('snap','ratings','recSyntheticRating',1,raw);
 h.sql.prepare('INSERT INTO idol_native_fields VALUES (?,?,?,?)').run('snap:ratings','snap','ratings',JSON.stringify(ratingFields));
 h.sql.prepare('INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES (?,?,?,?,?,?,?,?)').run('snap:ratings:recSyntheticRating','snap','ratings','recSyntheticRating',JSON.stringify(raw),rev,1,1);
 await assert.rejects(h.save('owner',{table:'ratings',recordId:'recSyntheticRating',revision:rev,operationId:crypto.randomUUID(),values:{score:4}}),e=>e.code==='MV_HAS_NO_MEMBERS');
 assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM idol_saves').get().n,0);assert.deepEqual(JSON.parse(h.sql.prepare("SELECT fields_json FROM idol_native_records WHERE record_id='recSyntheticRating'").get().fields_json),raw);
 const saved=await h.save('owner',{table:'works',recordId:r.workId,revision:workRev,operationId:crypto.randomUUID(),values:{score:8}});assert.equal(saved.verified,true);
 assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM idol_saves').get().n,1);
});
