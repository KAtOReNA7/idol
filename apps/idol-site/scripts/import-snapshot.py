import json,gzip,base64,hashlib
from pathlib import Path
p=Path('/workspace/shared/outputs/idol-migration-20261011'); out=Path('data');out.mkdir(exist_ok=True)
schema=json.load(open(p/'schema.json')); tables={k:json.load(open(p/'tables'/f'{k}.json')) for k in ('groups','members','works','ratings')}
compact={'capturedAt':schema['sourceSnapshotAt'],'tables':{k:{'tableId':v['tableId'],'records':[{'recordId':r['recordId'],'fields':{fid:c['value'] for fid,c in r['fields'].items()}} for r in v['records'].values()]} for k,v in tables.items()}}
(out/'snapshot.json').write_text(json.dumps(compact,ensure_ascii=False,separators=(',',':')))
full={'formatVersion':'idol.backup.v1','mode':'snapshot','capturedAt':schema['sourceSnapshotAt'],'readOnly':True,'schema':schema,'tables':tables,'derived':json.load(open(p/'derived/captured.json'))}
raw=json.dumps(full,ensure_ascii=False,separators=(',',':')).encode(); zipped=gzip.compress(raw,mtime=0)
(out/'backup.ts').write_text('export const snapshotBackupBase64 = '+json.dumps(base64.b64encode(zipped).decode())+';\nexport const snapshotBackupSha256 = '+json.dumps(hashlib.sha256(zipped).hexdigest())+';\n')
(out/'snapshot-import.json').write_text(json.dumps({'capturedAt':schema['sourceSnapshotAt'],'counts':{k:len(v['records']) for k,v in tables.items()},'backupGzipSha256':hashlib.sha256(zipped).hexdigest(),'backupJsonBytes':len(raw),'backupGzipBytes':len(zipped)},indent=2))
print((out/'snapshot-import.json').read_text())
