"""Read-only before/after verification. Never applies files or invokes a build."""
from pathlib import Path
import argparse,hashlib,json
p=argparse.ArgumentParser();p.add_argument('--target',required=True);a=p.parse_args();target=Path(a.target).resolve();root=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((root/'OVERLAY-SHA256.json').read_text());rows=[]
for x in manifest['files']:
 source=root/'overlay'/x['path'];dest=target/x['path']
 if sha(source)!=x['afterSHA256'] or source.stat().st_size!=x['afterBytes']:raise SystemExit('Overlay changed: '+x['path'])
 current=sha(dest) if dest.is_file() else None
 if current not in [x['beforeSHA256'],x['afterSHA256']]:raise SystemExit('Target conflict, review instead of overwrite: '+x['path'])
 rows.append({'path':x['path'],'state':'already-identical' if current==x['afterSHA256'] else 'ready'})
print(json.dumps({'target':str(target),'mode':'read-only','passed':len(rows),'files':rows},ensure_ascii=False,indent=2))
