"""Reconcile M against the frozen L ledger; do not overwrite previous batches."""
from pathlib import Path
import json, hashlib, subprocess, csv
from collections import Counter
root=Path(__file__).resolve().parents[4];out=Path(__file__).resolve().parent
def read(f):return json.loads(f.read_text(encoding='utf8'))
def write(f,d):f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def key(r):return (r['workId'],r['videoId'],r['memberId'])
auditPath=root/'docs/codex/mv-identity-asset-audit-20261025.json';a=read(auditPath)
baseline='279a1e9f598b2f75ab205e4b0896ebd4f12669ec';old=json.loads(subprocess.check_output(['git','show',baseline+':docs/codex/mv-identity-asset-audit-20261025.json'],cwd=root))
delta=[r for n in ['butterflies','pretty','rude'] for r in read(out/(n+'-reviewed-delta.json'))['identityImages']];new={key(r):r for r in delta};selected={key(r):r for r in a['identityImages']}
assert len(new)==24 and all(selected[key(r)]==r for r in old['identityImages'])
assert a['covers']==old['covers'] and a['summary']['missingRelationshipImages']==707
for w0,w1 in zip(old['workCoverage'],a['workCoverage']):
 assert {k:v for k,v in w0.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}=={k:v for k,v in w1.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}
 assert w1['publicIdentityCount']-w0['publicIdentityCount']==sum(r['workId']==w0['workId'] and r['videoId']==w0['videoId'] for r in delta)
for r in delta:
 f=root/'apps/idol-site/public'/r['src'].lstrip('/');b=f.read_bytes();assert len(b)==r['byteLength'] and hashlib.sha256(b).hexdigest()==r['sha256']
 c=r['sourceCrop'];assert c['width']*4==c['height']*3 and c['width']>=540
ledger=read(out.parent/'20261026-gap-l/ledger.json');ledger['currentAuditSha256']=hashlib.sha256(auditPath.read_bytes()).hexdigest();ledger['previousLedger']='docs/codex/reports/20261026-gap-l/ledger.json';ledger['release']={'status':'pending','baseVersion':189,'url':'https://idol-lens-private.wuke40758.chatgpt.site/'}
if (out/'native-evidence.json').exists():
 n=read(out/'native-evidence.json')
 if n['deployment']['status']=='succeeded':ledger['release']={'status':'succeeded','version':n['version']['version_number'],'url':n['url'],'sourceCommit':n['source']['commit_sha'],'deploymentId':n['deployment']['id']}
for row in ledger['entries']:
 if key(row) not in new:continue
 r=new[key(row)];assert row['status']=='open';row.update(status='resolved',previousPrimaryCategory=row['primaryCategory'],previousProblemEvidence=row['problemEvidence'],primaryCategory='resolved',secondaryCategories=[],validationStage='M批已导入；发布状态见release字段',problemEvidence='官方具名MV拍摄原生帧；画内标签/直接指认人工字幕、主体语境及实际3:4已复核。',steps=['保留完整原生PNG、来源与裁切元数据；源画面限制在逐条qualityNotes披露。'],researchEvidence='docs/codex/reports/20261026-gap-m/',resolution={k:r[k] for k in ['src','sha256','label','evidenceLevel','sourcePageUrl','qualityNotes']},sources=[{'url':r['sourcePageUrl'],'label':'已采用官方MV幕后来源','depth':r['identityEvidence']}],detailedProblem='resolved_by_M_named_native_frame')
openkeys={key(r) for r in ledger['entries'] if r['status']=='open'};actual={(w['workId'],w['videoId'],m['memberId']) for w in a['workCoverage'] for m in w['missingIdentityRelationships']};assert len(ledger['entries'])==871 and openkeys==actual
ledger['summary'].update(resolved=164,remaining=707,newSinceJ=161,byCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'])),openByCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'] if r['status']=='open')))
write(out/'ledger.json',ledger)
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(ledger['entries'])
write(out/'integration-verification.json',{'status':'passed','batch':'M','baselineCommit':baseline,'addedBindings':24,'beforeMissing':731,'afterMissing':707,'oldBindingsUnchanged':2097,'oldCoversUnchanged':628,'existingRelationshipsAndPoliciesUnchanged':True,'originalBytes':sum(r['byteLength'] for r in delta),'originals':[{k:r[k] for k in ['workId','videoId','memberId','src','sha256','byteLength','width','height','sourceCrop']} for r in delta],'ledgerRows':871,'ledgerOpenSetEqualsAudit':True,'summary':a['summary']})
print(json.dumps({'new':24,'remaining':707,'totalBindings':2121,'originalBytes':sum(r['byteLength'] for r in delta)}))
