// Isolated review probes. Only synthetic in-memory SQLite/R2/Feishu stubs are used.
// Run from idol-studio-site root. No repository or production writes.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('tests/archive-transfer.test.cjs');
let prefix=fs.readFileSync(file,'utf8').split("test('missing bucket stops")[0];
prefix=prefix.replace('return {sql,objects,tables,approved,api:',"return {db,bucket,cutover:load('lib/idol/cutover.ts'),sql,objects,tables,approved,api:");
if(!prefix.includes('cutover:load'))throw Error('Harness extraction failed');
prefix=prefix.replace("const stubs=new Map([","const stubs=new Map([['./catalog',{invalidateCatalog(){}}],");
const probe=String.raw`
const reviewedSourceHash=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'lib/idol/cutover.ts'))).digest('hex');
function fullReport(h,m){return {formatVersion:'idol.restore-report.v1',completeBackup:true,missingPhotoTokens:0,archiveId:m.id,manifestHash:m.manifestHash,dataSha256:m.data.sha256,restoredRecords:Object.values(h.tables).reduce((n,t)=>n+t.records.length,0),journalRows:0,fieldValues:Object.values(h.tables).reduce((n,t)=>n+t.records.reduce((a,r)=>a+Object.keys(r.fields).length,0),0),protectedValues:0,photoReferences:m.references.length,photoTokens:m.photos.length,photoBytes:m.photos.reduce((n,p)=>n+p.byteLength,0),decodedUniqueImages:new Set(m.photos.map(p=>p.sha256)).size,decodedFrames:new Set(m.photos.map(p=>p.sha256)).size,fieldMismatches:0,photoFailures:0,sqliteIntegrity:'ok',sourceNetworkUsed:false,verifiedAt:new Date().toISOString()};}
async function checked(h,id){for(let n=0;n<60;n++){const s=await h.cutover.prepareCutoverStep('owner',id);if(s.readiness?.phase==='checked'&&s.readiness.report.ready)return s;}throw Error('readiness did not converge');}
async function captured(h,id){for(let n=0;n<60;n++){const s=await h.cutover.captureCutover('owner',id);if(s.status==='cutover-importing')return s;}throw Error('capture did not converge');}
async function activated(h,id,sealHash){for(let n=0;n<60;n++){const s=await h.cutover.activateCutover('owner',id,sealHash);if(s.mode==='native')return s;}throw Error('activation did not converge');}
async function fixture(){const h=harness({photoCount:1});h.bucket.list=async({prefix=''})=>({objects:[...h.objects].filter(([key])=>key.startsWith(prefix)).map(([key,b])=>({key,size:b.length})),truncated:false});const runId=crypto.randomUUID(),id=crypto.randomUUID();await completePilot(h,runId);const bm=await h.backup.backupManifest('owner',runId);await h.cutover.prepareCutover('owner',runId,id,fullReport(h,bm));let s;do{s=await h.cutover.prepareCutoverStep('owner',id)}while(s.status!=='cutover-ready');await checked(h,id);await h.cutover.freezeCutover('owner',id);return{h,id,runId};}
async function imported(){const x=await fixture();await captured(x.h,x.id);let s;do{s=await x.h.cutover.importCutoverStep('owner',x.id)}while(s.status!=='cutover-imported');return x;}
async function sealed(){const x=await imported(),m=await x.h.cutover.finalBackupManifest('owner',x.id),r=await x.h.cutover.sealCutover('owner',x.id,fullReport(x.h,m));return{...x,sealHash:r.sealHash};}
(async()=>{
 const outputs=[];
 {
  const {h,id,sealHash}=await sealed();const before=h.sql.prepare('SELECT epoch FROM idol_storage_control').get().epoch;
  const result=await activated(h,id,sealHash),again=await h.cutover.activateCutover('owner',id,sealHash);
  assert.equal(result.mode,'native');assert.equal(result.activeSnapshot,id);assert.equal(result.epoch,before+1);assert.equal(again.epoch,result.epoch);
  await assert.rejects(h.cutover.resumeFeishu('owner',id),e=>e.code==='MIGRATION_CHANGED');
  await assert.rejects(h.cutover.cutoverStatus('other',id),e=>e.code==='OWNER_ONLY');
  outputs.push({probe:'full-happy-path-repeat-and-no-active-rollback',mode:result.mode,epoch:result.epoch});
 }
 {
  const {h,id,sealHash}=await sealed();h.sql.prepare("UPDATE idol_native_records SET fields_json='{}' WHERE snapshot_id=?").run(id);
  await assert.rejects(activated(h,id,sealHash),e=>e.code==='SHADOW_MISMATCH');
  assert.equal(h.sql.prepare('SELECT mode FROM idol_storage_control').get().mode,'frozen');
  outputs.push({probe:'changed-final-fields-block-activation',blocked:true});
 }

 {
  const {h,id,sealHash}=await sealed();
  h.sql.prepare('DELETE FROM idol_native_media WHERE snapshot_id=?').run(id);
  let result,error;try{result=await activated(h,id,sealHash)}catch(e){error=e.code||e.message}
  outputs.push({probe:'deleted-sealed-media',activated:result?.mode==='native',error,remainingTargetMedia:h.sql.prepare('SELECT count(*) n FROM idol_native_media WHERE snapshot_id=?').get(id).n});
 }
 {
  const {h,id,sealHash}=await sealed();
  h.sql.prepare('UPDATE idol_native_media SET sha256=?,object_key=? WHERE snapshot_id=?').run('0'.repeat(64),'photos/'+'0'.repeat(64),id);
  let result,error;try{result=await activated(h,id,sealHash)}catch(e){error=e.code||e.message}
  outputs.push({probe:'changed-sealed-media-mapping',activated:result?.mode==='native',error,referencedObjectExists:h.objects.has('photos/'+'0'.repeat(64))});
 }
 {
  const {h,id,runId}=await fixture();
  h.tables.members.records[0].fields.fldPhoto[0].file_token='newPhotoToken';
  let captureError,resumeError;try{await captured(h,id)}catch(e){captureError=e.code||e.message}
  try{await h.cutover.resumeFeishu('owner',id)}catch(e){resumeError=e.code||e.message}
  outputs.push({probe:'no-write-new-photo-rejection',captureError,resumeError,mode:h.sql.prepare('SELECT mode FROM idol_storage_control').get().mode,heldLocks:h.sql.prepare('SELECT count(*) n FROM idol_archive_step_locks WHERE id=?').get(runId).n});
 }
 {
  const {h,id}=await imported(),m=await h.cutover.finalBackupManifest('owner',id),r=fullReport(h,m);delete r.decodedFrames;
  let result,error;try{result=await h.cutover.sealCutover('owner',id,r)}catch(e){error=e.code||e.message}
  outputs.push({probe:'missing-full-frame-evidence',sealed:result?.status==='cutover-sealed',error});
 }
 {
  const {h,id}=await imported(),m=await h.cutover.finalBackupManifest('owner',id),r=fullReport(h,m);r.unvalidatedExtra='x'.repeat(30000001);
  let result,error;try{result=await h.cutover.sealCutover('owner',id,r)}catch(e){error=e.code||e.message}
  const metaBytes=h.sql.prepare('SELECT length(CAST(manifest_json AS BLOB)) n FROM idol_native_snapshots WHERE id=?').get(id).n;
  outputs.push({probe:'unbounded-seal-report',sealed:result?.status==='cutover-sealed',error,metadataBytes:metaBytes,exceedsWholeNonPhotoReserve:metaBytes>30000000});
 }

 {
  const {h,id,sealHash}=await sealed();
  const originalPrepare=h.db.prepare;let pauseNext=true,entered,release;
  const waiting=new Promise(r=>entered=r),gate=new Promise(r=>release=r);
  h.db.prepare=q=>{const stmt=originalPrepare(q);if(q.startsWith('INSERT OR IGNORE INTO idol_archive_step_locks')){const originalRun=stmt.run;stmt.run=async()=>{if(pauseNext){pauseNext=false;entered();await gate;}return originalRun();};}return stmt;};
  const delayed=h.cutover.activateCutover('owner',id,sealHash);await waiting;
  await h.cutover.resumeFeishu('owner',id);
  h.tables.works.records[0].fields.fldText='new synthetic source delta after abort';
  await h.cutover.restartCutover('owner',id,crypto.randomUUID());
  let s;do{s=await h.cutover.prepareCutoverStep('owner',id)}while(s.status!=='cutover-ready');
  await checked(h,id);await h.cutover.freezeCutover('owner',id);await captured(h,id);
  do{s=await h.cutover.importCutoverStep('owner',id)}while(s.status!=='cutover-imported');
  const m=await h.cutover.finalBackupManifest('owner',id),newSeal=await h.cutover.sealCutover('owner',id,fullReport(h,m));
  release();let result,error;try{result=await delayed}catch(e){error=e.code||e.message}
  outputs.push({probe:'old-seal-request-crosses-restart',oldAndNewSealDiffer:sealHash!==newSeal.sealHash,activatedWithOldSeal:result?.mode==='native',error,epoch:h.sql.prepare('SELECT epoch FROM idol_storage_control').get().epoch});
 }

 {
  const h=harness({photoCount:1});h.bucket.list=async({prefix=''})=>({objects:[...h.objects].filter(([key])=>key.startsWith(prefix)).map(([key,b])=>({key,size:b.length})),truncated:false});
  const runId=crypto.randomUUID(),firstId=crypto.randomUUID(),secondId=crypto.randomUUID();await completePilot(h,runId);const manifest=await h.backup.backupManifest('owner',runId),report=fullReport(h,manifest);
  const originalPrepare=h.db.prepare,originalBatch=h.db.batch;let deferred,inject=true;
  h.db.prepare=q=>{const stmt=originalPrepare(q);stmt._q=q;return stmt;};
  h.db.batch=async stmts=>{if(inject&&stmts.some(s=>s._q?.startsWith('INSERT INTO idol_native_snapshots(id,'))){inject=false;deferred=stmts;throw Error('Synthetic unknown D1 response before delayed commit');}return originalBatch(stmts);};
  let firstError;try{await h.cutover.prepareCutover('owner',runId,firstId,report)}catch(e){firstError=e.code||e.message}
  const locksAfterUnknown=h.sql.prepare('SELECT count(*) n FROM idol_archive_step_locks').get().n;
  let secondError;try{await h.cutover.prepareCutover('owner',runId,secondId,report)}catch(e){secondError=e.code||e.message}
  await originalBatch(deferred);
  outputs.push({probe:'unknown-prepare-commit-unique-shadow',firstError,secondError,locksAfterUnknown,cutoverCandidates:h.sql.prepare("SELECT count(*) n FROM idol_native_snapshots WHERE status LIKE 'cutover-%'").get().n});
 }
 {
  const {h,id}=await fixture();
  h.tables.works.records[0].fields.fldText=require('node:crypto').randomBytes(250000).toString('base64');
  const d1=await h.budget.archiveD1Bytes(),existing=[...h.objects].filter(([k])=>k.startsWith('archives/')).reduce((n,[k,b])=>n+b.length,0);
  // Virtual pre-existing archive bytes affect only list/accounting; not downloaded.
  h.objects.set('archives/virtual-budget-fixture',{length:50000000-d1-existing-8000000});
  const originalPut=h.bucket.put,pending=[];
  h.bucket.put=async(key,bytes,options)=>{if(key.includes('/cutover/')){pending.push({key,bytes:Uint8Array.from(bytes)});throw Error('Synthetic unknown R2 response before late object appears');}return originalPut(key,bytes,options);};
  let firstError,secondError;try{await captured(h,id)}catch(e){firstError=e.code||e.message}
  await h.cutover.resumeFeishu('owner',id);let restartError;try{await h.cutover.restartCutover('owner',id,crypto.randomUUID())}catch(e){restartError=e.code||e.message}
  if(!restartError){let s;do{s=await h.cutover.prepareCutoverStep('owner',id)}while(s.status!=='cutover-ready');await checked(h,id);await h.cutover.freezeCutover('owner',id);try{await captured(h,id)}catch(e){secondError=e.code||e.message}}
  for(const p of pending)if(!h.objects.has(p.key))h.objects.set(p.key,p.bytes);
  const actualOther=(await h.budget.archiveD1Bytes())+[...h.objects].filter(([k])=>k.startsWith('archives/')).reduce((n,[k,b])=>n+b.length,0);
  outputs.push({probe:'unknown-r2-cross-epoch-budget',firstError,secondError,restartError,mode:h.sql.prepare('SELECT mode FROM idol_storage_control').get().mode,lateObjects:pending.length,differentKeys:new Set(pending.map(p=>p.key)).size,actualOtherBytes:actualOther,exceedsReserve:actualOther>50000000});
 }
 console.log(JSON.stringify({syntheticOnly:true,productionWrites:0,reviewedSourceHash,outputs},null,2));
 const byName=Object.fromEntries(outputs.map(x=>[x.probe,x]));
 assert.equal(byName['deleted-sealed-media'].activated,false);assert.equal(byName['changed-sealed-media-mapping'].activated,false);
 assert.equal(byName['no-write-new-photo-rejection'].mode,'feishu');assert.equal(byName['no-write-new-photo-rejection'].heldLocks,0);
 assert.equal(byName['missing-full-frame-evidence'].sealed,false);assert.equal(byName['unbounded-seal-report'].sealed,false);
 assert.equal(byName['old-seal-request-crosses-restart'].activatedWithOldSeal,false);
 assert.equal(byName['unknown-prepare-commit-unique-shadow'].locksAfterUnknown,1);assert.equal(byName['unknown-prepare-commit-unique-shadow'].cutoverCandidates,1);
 assert.equal(byName['unknown-r2-cross-epoch-budget'].restartError,'MIGRATION_BUSY');assert.equal(byName['unknown-r2-cross-epoch-budget'].mode,'feishu');assert.equal(byName['unknown-r2-cross-epoch-budget'].exceedsReserve,false);
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'lib/idol/cutover.ts'))).digest('hex'),reviewedSourceHash,'Source changed during probes; rerun for one reviewed version');
})().catch(e=>{console.error(e);process.exitCode=1});`;
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(prefix+probe,file);
