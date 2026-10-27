"""Reconcile the original policy-routing ledger with the final selected originals."""
from pathlib import Path
from collections import Counter
import hashlib,json
root=Path(__file__).resolve().parents[4]
folder=Path(__file__).parent
audit_path=root/'docs/codex/mv-identity-asset-audit-20261025.json'
data=audit_path.read_bytes();audit=json.loads(data)
old=root/'docs/codex/reports/20261027-gap-704-classification/policy-reroute.json'
routes=json.loads(old.read_text(encoding='utf8'))
key=lambda r: (r['workId'],r['videoId'],r['memberId'])
selected={key(r):r for r in audit['identityImages']}
assert len(selected)==len(audit['identityImages'])==2828
assert audit['summary']['missingRelationshipImages']==0
assert len(routes['entries'])==len({key(r) for r in routes['entries']})==704
entries=[]
for before in routes['entries']:
    after=selected[key(before)]
    assert after.get('ratingId',after.get('id','').split(':')[0])==before['ratingId']
    entries.append({**before,'status':'resolved_selected_original',
      'selected':{k:after[k] for k in ['src','sha256','width','height','qualityTier','evidenceLevel','label']},
      'sourcePageUrl':after.get('sourcePageUrl'),'sourceImageUrl':after.get('sourceImageUrl'),
      'photoSet':after.get('photoSet')})
summary=[]
for route,count in routes['routeCounts'].items():
    rows=[r for r in entries if r['newRoute']==route]
    assert len(rows)==count
    summary.append({'route':route,'originalMissing':count,'resolved':len(rows),'remaining':0,
      'evidenceLevels':dict(Counter(r['selected']['evidenceLevel'] for r in rows))})
result={'checkedAt':'2026-10-27','scope':'Original 704 existing relationship tuples; historical cause ledger is preserved. Image completion does not prove exact MV costume or create new member relationships.',
 'sourceRouteLedger':str(old.relative_to(root)).replace('\\','/'),
 'sourceRouteSha256':hashlib.sha256(old.read_bytes()).hexdigest(),
 'currentAuditSha256':hashlib.sha256(data).hexdigest(),
 'originalMissing':704,'resolved':704,'remaining':0,'routeSummary':summary,'entries':entries}
(folder/'route-resolution.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'originalMissing':704,'resolved':704,'remaining':0,'routes':summary}))
