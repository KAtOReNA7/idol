const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const original=fs.readFileSync('tests/cutover.test.cjs','utf8');
const setup=original.slice(original.indexOf('const probe=String.raw`')+'const probe=String.raw`'.length,original.indexOf('(async()=>{'));
const file=path.resolve('tests/archive-transfer.test.cjs');
let prefix=fs.readFileSync(file,'utf8').split("test('missing bucket stops")[0];
prefix=prefix.replace('return {sql,objects,tables,approved,api:',"return {db,bucket,cutover:load('lib/idol/cutover.ts'),sql,objects,tables,approved,api:").replace("const stubs=new Map([","const stubs=new Map([['./catalog',{invalidateCatalog(){}}],");
const probe=String.raw`
 test('sealed active backup remains byte-equivalent after a new native photo is attached',async()=>{
 const {h,id,sealHash}=await sealed();await activated(h,id,sealHash);const before=await h.cutover.finalBackupManifest('owner',id);
 h.sql.prepare("INSERT INTO idol_native_media VALUES (?,?,?,'complete',?,?,4,'image/jpeg',NULL,1)").run(id+':newPhoto',id,'newPhoto','photos/'+'a'.repeat(64),'a'.repeat(64));
 const after=await h.cutover.finalBackupManifest('owner',id);assert.equal(JSON.stringify(after),JSON.stringify(before));
 h.sql.prepare('DELETE FROM idol_native_media WHERE snapshot_id=? AND file_token=?').run(id,before.photos[0].fileToken);
 await assert.rejects(h.cutover.finalBackupManifest('owner',id),e=>e.code==='BACKUP_INCOMPLETE');
 });
 test('extra media remains a blocker before active cutover, no weakened pre-activation guard',async()=>{
 const {h,id}=await imported();h.sql.prepare("INSERT INTO idol_native_media VALUES (?,?,?,'complete',?,?,4,'image/jpeg',NULL,1)").run(id+':extra',id,'extra','photos/'+'b'.repeat(64),'b'.repeat(64));
 await assert.rejects(h.cutover.finalBackupManifest('owner',id),e=>e.code==='BACKUP_INCOMPLETE');
 });`;
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(prefix+setup+probe,file);
