#!/usr/bin/env python3
"""Verify a complete private archive, decode every image, and restore an isolated SQLite file.
Run: python3 scripts/archive/verify_restore.py /absolute/backup-directory
Never extracts arbitrary paths or contacts Feishu. Does not modify the live Site.
"""
import gzip,hashlib,json,pathlib,re,sqlite3,sys,time
from PIL import Image, ImageSequence
root=pathlib.Path(sys.argv[1]).resolve()
manifest=json.loads((root/'manifest.json').read_text())
assert manifest['formatVersion']=='idol.full-backup.v1'
# Manifest keys are the fixed ASCII schema; sort order matches server stable JSON.
manifest_body={k:v for k,v in manifest.items() if k!='manifestHash'}
canonical=json.dumps(manifest_body,ensure_ascii=False,sort_keys=True,separators=(',',':'))
assert hashlib.sha256(canonical.encode()).hexdigest()==manifest['manifestHash'], 'Manifest hash mismatch.'
pilot='--pilot' in sys.argv[2:]
assert manifest.get('complete') is True or pilot, 'Partial pilot archives require explicit --pilot and are not complete backups.'
def safe_path(name):
    assert name=='data.json.gz' or re.fullmatch(r'photos/[0-9a-f]{64}',name),name
    p=(root/name).resolve();assert root in p.parents;return p
def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()
meta=manifest['data'];p=safe_path(meta['path']);assert p.stat().st_size==meta['byteLength'];assert digest(p)==meta['sha256'];data=json.loads(gzip.decompress(p.read_bytes()))
assert data['formatVersion']=='idol.native-archive.v1';assert set(data['tables'])=={'groups','members','works','ratings'}
# Reuse only a prior successful complete decode whose exact report SHA is supplied
# by the operator from that independently verified run. Current bytes are always
# hashed again. Single-frame proof is conservative: other cases decode anew.
reuse={}; reuse_report_sha=None; reuse_manifest_hash=None
if '--reuse-images-from' in sys.argv:
    assert '--prior-report-sha256' in sys.argv, 'An independently verified report hash is required.'
    prev=pathlib.Path(sys.argv[sys.argv.index('--reuse-images-from')+1]).resolve()
    expected=sys.argv[sys.argv.index('--prior-report-sha256')+1];assert re.fullmatch(r'[a-f0-9]{64}',expected)
    rb=(prev/'restore-report.json').read_bytes();assert hashlib.sha256(rb).hexdigest()==expected, 'Prior restore report changed.'
    report=json.loads(rb);pm=json.loads((prev/'manifest.json').read_text())
    body={k:v for k,v in pm.items() if k!='manifestHash'}
    assert hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()==pm['manifestHash']
    unique={x['sha256']:x['byteLength'] for x in pm['photos']}
    assert report['formatVersion']=='idol.restore-report.v1' and report['completeBackup'] is True and report['photoFailures']==0 and report['fieldMismatches']==0 and report['sqliteIntegrity']=='ok' and report['sourceNetworkUsed'] is False
    assert report['archiveId']==pm['id'] and report['manifestHash']==pm['manifestHash'] and report['dataSha256']==pm['data']['sha256'] and report['missingPhotoTokens']==0
    assert pm['complete'] is True and report['photoTokens']==len(pm['photos']) and report['photoReferences']==len(pm['references']) and report['photoBytes']==sum(x['byteLength'] for x in pm['photos'])
    assert report['decodedUniqueImages']==len(unique) and all(unique[x['sha256']]==x['byteLength'] for x in pm['photos'])
    if report['decodedFrames']==len(unique):reuse=unique
    reuse_report_sha=expected;reuse_manifest_hash=pm['manifestHash']
reused=set();freshly_decoded=set()
assets={}; decoded={}; image_bytes=0
for photo in manifest['photos']:
    token=photo['fileToken'];assert token not in assets;assets[token]=photo
    path=safe_path(photo['path']);assert path.stat().st_size==photo['byteLength'];assert digest(path)==photo['sha256']
    if photo['sha256'] not in decoded and reuse.get(photo['sha256'])==photo['byteLength']:
        decoded[photo['sha256']]={'frames':1};reused.add(photo['sha256'])
    if photo['sha256'] not in decoded:
        freshly_decoded.add(photo['sha256'])
        with Image.open(path) as img: img.verify()
        with Image.open(path) as img:
            frames=0
            for frame in ImageSequence.Iterator(img):
                frame.load();assert frame.width>0 and frame.height>0
                frames+=1
            assert frames>0
            decoded[photo['sha256']]={'width':img.width,'height':img.height,'format':img.format,'frames':frames}
    image_bytes+=photo['byteLength']
refs=[];record_ids=set();field_count=0;protected_count=0
protected={'fld3SVWhWc','fld1yLzS5g','fld6bHl8sq','fld38CJY2U','fld641ausT','fld4yOdHT5','fld3QKrpLN','fld7E8yx1a','fld49NJY1j','fld1L5cSac','fld3y0fn7i'}
restored=root/'restore-verification.sqlite'
assert not restored.exists(), 'Choose a fresh backup directory or remove only your previous local verification database.'
con=sqlite3.connect(restored)
con.executescript('CREATE TABLE records(table_key TEXT, record_id TEXT PRIMARY KEY, fields_json TEXT, source_order INTEGER NOT NULL);CREATE TABLE fields(table_key TEXT PRIMARY KEY, fields_json TEXT);CREATE TABLE saves(id TEXT PRIMARY KEY,row_json TEXT);CREATE TABLE assets(file_token TEXT PRIMARY KEY,row_json TEXT);CREATE TABLE metadata(key TEXT PRIMARY KEY,value_json TEXT);')
for table,part in data['tables'].items():
    fields={f['field_id']:f for f in part['fields']};assert len(fields)==len(part['fields'])
    con.execute('INSERT INTO fields VALUES (?,?)',(table,json.dumps(part['fields'],ensure_ascii=False)))
    for source_order,record in enumerate(part['records']):
        rid=record['recordId'];assert re.fullmatch(r'rec[A-Za-z0-9]+',rid) and rid not in record_ids;record_ids.add(rid)
        assert set(record['fields'])<=set(fields)
        con.execute('INSERT INTO records VALUES (?,?,?,?)',(table,rid,json.dumps(record['fields'],ensure_ascii=False),source_order))
        field_count+=len(record['fields']);protected_count+=len(set(record['fields'])&protected)
        for fid,f in fields.items():
            if f['type']==17:
                for idx,a in enumerate(record['fields'].get(fid) or []):
                    assert (pilot and not manifest.get('complete')) or a['file_token'] in assets
                    refs.append((table,rid,fid,idx,a['file_token']))
for row in data['journal']:con.execute('INSERT INTO saves VALUES (?,?)',(row['id'],json.dumps(row,ensure_ascii=False)))
for token,photo in assets.items():con.execute('INSERT INTO assets VALUES (?,?)',(token,json.dumps(photo,ensure_ascii=False)))
for k,v in data['siteMetadata'].items():con.execute('INSERT INTO metadata VALUES (?,?)',(k,json.dumps(v,ensure_ascii=False)))
con.commit()
assert set(refs)=={(r['table'],r['recordId'],r['fieldId'],r['index'],r['fileToken']) for r in manifest['references']}
assert set(assets)<={x[4] for x in refs}
if not pilot or manifest.get('complete'): assert {x[4] for x in refs}==set(assets)
# Re-read restored rows, never merely compare totals.
for table,part in data['tables'].items():
    assert json.loads(con.execute('SELECT fields_json FROM fields WHERE table_key=?',(table,)).fetchone()[0])==part['fields']
    for row in part['records']:assert json.loads(con.execute('SELECT fields_json FROM records WHERE table_key=? AND record_id=?',(table,row['recordId'])).fetchone()[0])==row['fields']
    ordered=[{'recordId':rid,'fields':json.loads(fields)} for rid,fields in con.execute('SELECT record_id,fields_json FROM records WHERE table_key=? ORDER BY source_order,record_id',(table,))]
    assert ordered==part['records'], 'Restored record order mismatch.'
for row in data['journal']:assert json.loads(con.execute('SELECT row_json FROM saves WHERE id=?',(row['id'],)).fetchone()[0])==row
for k,v in data['siteMetadata'].items():assert json.loads(con.execute('SELECT value_json FROM metadata WHERE key=?',(k,)).fetchone()[0])==v
assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok';con.close()
report={'formatVersion':'idol.pilot-restore-report.v1' if pilot else 'idol.restore-report.v1','completeBackup':manifest.get('complete') is True and {x[4] for x in refs}==set(assets),'missingPhotoTokens':len({x[4] for x in refs}-set(assets)),'archiveId':manifest['id'],'manifestHash':manifest['manifestHash'],'dataSha256':meta['sha256'],'restoredRecords':len(record_ids),'fieldValues':field_count,'protectedValues':protected_count,'journalRows':len(data['journal']),'photoTokens':len(assets),'decodedUniqueImages':len(decoded),'decodedFrames':sum(x['frames'] for x in decoded.values()),'photoReferences':len(refs),'photoBytes':image_bytes,'fieldMismatches':0,'photoFailures':0,'sqliteIntegrity':'ok','sourceNetworkUsed':False,'verifiedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
evidence={'formatVersion':'idol.image-restore-evidence.v1','manifestHash':manifest['manifestHash'],'priorReportSha256':reuse_report_sha,'priorManifestHash':reuse_manifest_hash,'currentPhotoBytesHashed':True,'reusedDecodedUniqueImages':len(reused),'freshlyDecodedUniqueImages':len(freshly_decoded),'evidenceBySha256':{sha:{'frames':value['frames'],'method':'prior-complete-decode-and-current-sha256' if sha in reused else 'current-decode-and-sha256'} for sha,value in decoded.items()}}
(root/'image-restore-evidence.json').write_text(json.dumps(evidence,indent=2)+'\n')
(root/'restore-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
