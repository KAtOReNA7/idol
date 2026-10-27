"""Create a current, internally consistent ledger while preserving Y history."""
from pathlib import Path
from collections import Counter
import json,hashlib,csv
out=Path(__file__).parent;root=out.resolve().parents[3];old=out.parent/'20261027-gap-y'
audit_bytes=(root/'docs/codex/mv-identity-asset-audit-20261025.json').read_bytes();audit=json.loads(audit_bytes)
ledger=json.loads((old/'ledger.json').read_text(encoding='utf8'))
key=lambda r:(r['workId'],r['videoId'],r['memberId'])
selected={key(r):r for r in audit['identityImages']}
assert len(ledger['entries'])==len({key(r) for r in ledger['entries']})==871
assert all(r['status']=='resolved' and key(r) in selected for r in ledger['entries'])
open_rows=[r for r in ledger['entries'] if r['status']=='open']
assert not open_rows and not audit['summary']['missingRelationshipImages'] and not audit['summary']['cardOnlyImages']
ledger.update(checkedAt='2026-10-27',currentAuditSha256=hashlib.sha256(audit_bytes).hexdigest(),previousLedger='docs/codex/reports/20261027-gap-y/ledger.json')
ledger['summary'].update(resolved=871,remaining=0,openWorks=len({r['workId'] for r in open_rows}),openGroups=len({r['group'] for r in open_rows}),openByCategory=dict(Counter(r['primaryCategory'] for r in open_rows)))
ledger['currentQuality']={'replaced':43,'remainingCardOnly':0,'report':'docs/codex/identity-completion-report-20261027.md'}
ledger['release']={'status':'publication_pending','baseVersion':190,'url':'https://idol-lens-private.wuke40758.chatgpt.site/','candidateContains':'Q–Y missing-image completion, Z quality replacement, 26 group member-gallery integration','reason':'GitHub synchronization and fresh formal source/package verification in progress. Old P archive must not be deployed.'}
(out/'ledger.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');writer.writeheader();writer.writerows(ledger['entries'])
html=(old/'ledger.html').read_text(encoding='utf8');tag='<script id="data" type="application/json">';start=html.index(tag)+len(tag);end=html.index('</script>',start)
html=html[:start]+json.dumps(ledger,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+html[end:]
html=html.replace('Y 批候选','补图与提质完成候选')
(out/'ledger.html').write_text(html,encoding='utf8',newline='\n')
start=html.index(tag)+len(tag)
assert json.loads(html[start:html.index('</script>',start)])==ledger
print(json.dumps({'rows':871,'resolved':871,'remaining':0,'openWorks':0,'openGroups':0,'qualityRemaining':0,'auditSha256':ledger['currentAuditSha256']}))
