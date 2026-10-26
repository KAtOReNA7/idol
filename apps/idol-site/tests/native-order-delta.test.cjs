'use strict';
// Supplementary order regression probes use only synthetic in-memory SQLite and R2 objects.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const repo=path.resolve(__dirname,'..');
const file=path.join(repo,'tests/archive-transfer.test.cjs');
let prefix=fs.readFileSync(file,'utf8').split("test('missing bucket stops")[0];
prefix=prefix.replace('return {sql,objects,tables,approved,api:',"return {db,bucket,load,cutover:load('lib/idol/cutover.ts'),storage:load('lib/idol/native-storage.ts'),sql,objects,tables,approved,api:");
prefix=prefix.replace("const stubs=new Map([","const stubs=new Map([['./catalog',{invalidateCatalog(){}}],");
const probe=String.raw`
const sourceHash=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'lib/idol/cutover.ts'))).digest('hex');
const jsonEq=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
function report(h,m){return {formatVersion:'idol.restore-report.v1',completeBackup:true,missingPhotoTokens:0,archiveId:m.id,manifestHash:m.manifestHash,dataSha256:m.data.sha256,restoredRecords:Object.values(h.tables).reduce((n,t)=>n+t.records.length,0),journalRows:0,fieldValues:Object.values(h.tables).reduce((n,t)=>n+t.records.reduce((a,r)=>a+Object.keys(r.fields).length,0),0),protectedValues:0,photoReferences:m.references.length,photoTokens:m.photos.length,photoBytes:m.photos.reduce((n,p)=>n+p.byteLength,0),decodedUniqueImages:new Set(m.photos.map(p=>p.sha256)).size,decodedFrames:new Set(m.photos.map(p=>p.sha256)).size,fieldMismatches:0,photoFailures:0,sqliteIntegrity:'ok',sourceNetworkUsed:false,verifiedAt:new Date().toISOString()};}
async function checked(h,id){for(let n=0;n<60;n++){const s=await h.cutover.prepareCutoverStep('owner',id);if(s.readiness?.phase==='checked'&&s.readiness.report.ready)return s;}throw Error('readiness did not converge');}
async function captured(h,id){for(let n=0;n<60;n++){const s=await h.cutover.captureCutover('owner',id);if(s.status==='cutover-importing')return s;}throw Error('capture did not converge');}
async function activated(h,id,sealHash){for(let n=0;n<60;n++){const s=await h.cutover.activateCutover('owner',id,sealHash);if(s.mode==='native')return s;}throw Error('activation did not converge');}
async function fixture(){const h=harness({photoCount:1});h.tables.works.records=Array.from({length:131},(_,i)=>({recordId:'recWork'+String(130-i).padStart(3,'0'),fields:{fldPhoto:null,fldText:'synthetic unchanged '+i}}));h.bucket.list=async({prefix=''})=>({objects:[...h.objects].filter(([key])=>key.startsWith(prefix)).map(([key,b])=>({key,size:b.length})),truncated:false});const runId=crypto.randomUUID(),id=crypto.randomUUID();await completePilot(h,runId);const bm=await h.backup.backupManifest('owner',runId);await h.cutover.prepareCutover('owner',runId,id,report(h,bm));let s,steps=0;do{s=await h.cutover.prepareCutoverStep('owner',id);if(++steps>100)throw Error('prepare did not converge')}while(s.status!=='cutover-ready');return{h,id,runId,steps};}
(async()=>{
 const outputs=[];
 {
  const {h,id,steps}=await fixture(),restored=await h.storage.nativeTables(id);jsonEq(restored,h.tables);let incorrect=0;for(const [table,t]of Object.entries(h.tables)){const rows=h.sql.prepare('SELECT record_id,source_order FROM idol_native_records WHERE snapshot_id=? AND table_key=? ORDER BY source_order').all(id,table);for(let i=0;i<rows.length;i++)incorrect+=rows[i].source_order!==i||rows[i].record_id!==t.records[i].recordId;}assert.equal(incorrect,0);outputs.push({probe:'prepare-import-persists-source-ordinals',pass:true,recordCount:134,steps,incorrectOrdinals:incorrect});
  // Change source ordering only, with all raw fields exactly unchanged.
  const priorFields=new Map(h.tables.works.records.map(r=>[r.recordId,JSON.stringify(r.fields)]));h.tables.works.records=[...h.tables.works.records.slice(65),...h.tables.works.records.slice(0,65)];await checked(h,id);await h.cutover.freezeCutover('owner',id);await captured(h,id);let s,deltaSteps=0;do{s=await h.cutover.importCutoverStep('owner',id);if(++deltaSteps>100)throw Error('import did not converge')}while(s.status!=='cutover-imported');const final=await h.storage.nativeTables(id);jsonEq(final,h.tables);assert.equal(final.works.records.every(r=>priorFields.get(r.recordId)===JSON.stringify(r.fields)),true);assert.ok(deltaSteps>=3);outputs.push({probe:'frozen-order-only-delta-spans-batches-and-preserves-fields',pass:true,changedPositions:131,steps:deltaSteps,positionMismatches:0,rawFieldMismatches:0});
  const manifest=await h.cutover.finalBackupManifest('owner',id),sealed=await h.cutover.sealCutover('owner',id,report(h,manifest)),active=await activated(h,id,sealed.sealHash);assert.equal(active.mode,'native');jsonEq(await h.storage.nativeTables(id),h.tables);outputs.push({probe:'ordered-shadow-survives-seal-and-activation',pass:true});
 }
 {
  const {h,id}=await fixture();await checked(h,id);await h.cutover.freezeCutover('owner',id);await captured(h,id);let s;do{s=await h.cutover.importCutoverStep('owner',id)}while(s.status!=='cutover-imported');
  h.sql.prepare("UPDATE idol_native_records SET source_order=CASE source_order WHEN 0 THEN 1 WHEN 1 THEN 0 ELSE source_order END WHERE snapshot_id=? AND table_key='works'").run(id);
  const manifest=await h.cutover.finalBackupManifest('owner',id);await assert.rejects(h.cutover.sealCutover('owner',id,report(h,manifest)),e=>e.code==='SHADOW_MISMATCH');outputs.push({probe:'order-only-shadow-corruption-rejects-seal',pass:true,error:'SHADOW_MISMATCH'});
 }
 {
  const {h,id}=await fixture();await checked(h,id);await h.cutover.freezeCutover('owner',id);await captured(h,id);let s;do{s=await h.cutover.importCutoverStep('owner',id)}while(s.status!=='cutover-imported');
  const manifest=await h.cutover.finalBackupManifest('owner',id),sealed=await h.cutover.sealCutover('owner',id,report(h,manifest));
  const fieldsBefore=h.sql.prepare("SELECT record_id,fields_json FROM idol_native_records WHERE snapshot_id=? ORDER BY record_id").all(id);
  h.sql.prepare("UPDATE idol_native_records SET source_order=CASE source_order WHEN 0 THEN 1 WHEN 1 THEN 0 ELSE source_order END WHERE snapshot_id=? AND table_key='works'").run(id);
  jsonEq(fieldsBefore,h.sql.prepare("SELECT record_id,fields_json FROM idol_native_records WHERE snapshot_id=? ORDER BY record_id").all(id));
  await assert.rejects(activated(h,id,sealed.sealHash),e=>e.code==='SHADOW_MISMATCH');assert.equal(h.sql.prepare('SELECT mode FROM idol_storage_control').get().mode,'frozen');outputs.push({probe:'post-seal-order-only-corruption-rejects-activation',pass:true,error:'SHADOW_MISMATCH',fieldsUnchanged:true,remainedFrozen:true});
 }
 const finalHash=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'lib/idol/cutover.ts'))).digest('hex');assert.equal(finalHash,sourceHash,'Code changed during review');
 const result={syntheticOnly:true,productionWrites:0,status:'PASS',reviewedCutoverHash:sourceHash,outputs};console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});`;
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(prefix+probe,file);
