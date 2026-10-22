const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const script=path.resolve('scripts/archive/verify_restore.py');
test('offline restoration preserves actual source ordering, zero values, and journal in isolated SQLite',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'idol-offline-restore-'));
 try{
  const fixture=String.raw`
import pathlib,json,gzip,hashlib,sys
p=pathlib.Path(sys.argv[1]);tables={}
for name in ['groups','members','works','ratings']:
 tables[name]={'fields':[{'field_id':'fld38CJY2U','field_name':'MV分数','type':2}],'records':[]}
tables['works']['records']=[{'recordId':rid,'fields':{'fld38CJY2U':value}} for rid,value in [('recz',0),('reca',None),('recm',9)]]
d={'formatVersion':'idol.native-archive.v1','tables':tables,'journal':[{'id':'synthetic-save','status':'done','source':'test'}],'siteMetadata':{'stageVideos':{},'source':'synthetic'}}
b=gzip.compress(json.dumps(d,ensure_ascii=False).encode());(p/'data.json.gz').write_bytes(b)
m={'formatVersion':'idol.full-backup.v1','id':'synthetic-archive','complete':True,'data':{'path':'data.json.gz','byteLength':len(b),'sha256':hashlib.sha256(b).hexdigest()},'photos':[],'references':[]}
m['manifestHash']=hashlib.sha256(json.dumps(m,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest();(p/'manifest.json').write_text(json.dumps(m,ensure_ascii=False))
`;
  cp.execFileSync('python3',['-c',fixture,dir]);
  const report=JSON.parse(cp.execFileSync('python3',[script,dir],{encoding:'utf8'}));
  assert.equal(report.completeBackup,true);assert.equal(report.restoredRecords,3);assert.equal(report.protectedValues,3);assert.equal(report.journalRows,1);assert.equal(report.fieldMismatches,0);
  const restored=JSON.parse(cp.execFileSync('python3',['-c',"import sqlite3,json,sys; c=sqlite3.connect(sys.argv[1]); print(json.dumps(c.execute('SELECT record_id,fields_json,source_order FROM records ORDER BY source_order').fetchall()))",path.join(dir,'restore-verification.sqlite')],{encoding:'utf8'}));
  assert.deepEqual(restored.map(r=>r[0]),['recz','reca','recm']);assert.deepEqual(restored.map(r=>r[2]),[0,1,2]);assert.equal(JSON.parse(restored[0][1]).fld38CJY2U,0);assert.equal(JSON.parse(restored[1][1]).fld38CJY2U,null);
  const again=cp.spawnSync('python3',[script,dir],{encoding:'utf8'});assert.notEqual(again.status,0);assert.match(again.stderr,/fresh backup directory/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
