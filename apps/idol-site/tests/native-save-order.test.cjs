'use strict';
// Actual save functions, synthetic rows, in-memory SQLite only. No production actions.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const repo=path.resolve(__dirname,'..');
const file=path.join(repo,'tests/native-storage.test.cjs');
const prefix=fs.readFileSync(file,'utf8').split("test('native save changes")[0];
const probe=String.raw`
(async()=>{
 const h=harness(),input=await h.init(),api=h.load('lib/idol/native-storage.ts');const outputs=[];
 h.sql.prepare("UPDATE idol_native_records SET source_order=40 WHERE record_id='recTEST'").run();
 for(const table of ['groups','ratings'])h.sql.prepare('INSERT INTO idol_native_fields VALUES (?,?,?,?)').run('snap:'+table,'snap',table,'[]');
 const F=h.load('lib/idol/fields.ts').F.members,memberFields=[{field_id:F.cnName,field_name:'中文姓名',type:1},{field_id:F.country,field_name:'国籍/地区',type:4,property:{options:[{name:'韩国'},{name:'日本'}]}},{field_id:F.role,field_name:'团内定位',type:4,property:{options:[{name:'主唱'},{name:'舞者'}]}},{field_id:F.birthDate,field_name:'出生日期',type:5},{field_id:F.status,field_name:'活动状态',type:3,property:{options:[{name:'在团'},{name:'暂停活动'}]}}];
 h.sql.prepare('INSERT INTO idol_native_fields VALUES (?,?,?,?)').run('snap:members','snap','members',JSON.stringify(memberFields));
 for(const [id,ordinal]of [['recZZZ',39],['recAAA',41]])h.sql.prepare("INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at,source_order) SELECT ?,'snap','works',?,fields_json,revision,version,updated_at,? FROM idol_native_records WHERE record_id='recTEST'").run('snap:works:'+id,id,ordinal);
 const before=(await api.nativeTables('snap')).works.records.map(r=>r.recordId);assert.equal(JSON.stringify(before),JSON.stringify(['recZZZ','recTEST','recAAA']));
 const saved=await h.save('owner',input);await h.save('owner',input);assert.equal(h.sql.prepare("SELECT source_order FROM idol_native_records WHERE record_id='recTEST'").get().source_order,40);assert.equal(JSON.stringify((await api.nativeTables('snap')).works.records.map(r=>r.recordId)),JSON.stringify(before));
 await h.save('owner',{...input,revision:saved.revision,operationId:crypto.randomUUID(),values:{score:null}});assert.equal(h.sql.prepare("SELECT source_order FROM idol_native_records WHERE record_id='recTEST'").get().source_order,40);assert.equal(JSON.stringify((await api.nativeTables('snap')).works.records.map(r=>r.recordId)),JSON.stringify(before));outputs.push({probe:'ordinary-native-score-save-retry-and-null-save-preserve-ordinal-and-list-order',pass:true});
 const raw={[F.cnName]:'',[F.country]:['日本'],[F.role]:[],[F.birthDate]:null,[F.status]:'在团',[F.favorite]:0,[F.note]:'synthetic-only',[F.photo]:[]},rev=await h.load('lib/idol/native-save.ts').nativeRevision('snap','members','recMember',1,raw);
 h.sql.prepare('INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at,source_order) VALUES (?,?,?,?,?,?,?,?,?)').run('snap:members:recMember','snap','members','recMember',JSON.stringify(raw),rev,1,1,25);
 const facts=h.load('lib/idol/member-facts.ts'),i={recordId:'recMember',revision:rev,operationId:crypto.randomUUID(),values:{cnName:'本地合成测试',country:['日本','韩国']}},one=await facts.saveMemberFacts('owner',i),two=await facts.saveMemberFacts('owner',i);assert.deepEqual(one,two);const row=h.sql.prepare("SELECT source_order,fields_json FROM idol_native_records WHERE record_id='recMember'").get();assert.equal(row.source_order,25);const fields=JSON.parse(row.fields_json);assert.equal(fields[F.favorite],0);assert.equal(fields[F.note],raw[F.note]);outputs.push({probe:'member-fact-save-and-retry-preserve-ordinal-and-private-values',pass:true});
 const result={syntheticOnly:true,productionWrites:0,status:'PASS',outputs};console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});`;
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(prefix+probe,file);
