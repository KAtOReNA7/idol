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
receipt=json.loads((out/'formal-v191-publication.json').read_text(encoding='utf8'))
assert receipt['status']=='published_and_read_back' and receipt['deployment']['status']=='succeeded'
ledger['release']={'status':'published','version':receipt['versionNumber'],'versionId':receipt['versionId'],'sourceCommit':receipt['formalSourceCommit'],'deploymentId':receipt['deployment']['id'],'deploymentStatus':receipt['deployment']['status'],'url':receipt['url'],'contains':'N–Y missing-image completion, Z quality replacement, 26 group member-gallery integration','evidence':'formal-v191-publication.json'}
(out/'ledger.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');writer.writeheader();writer.writerows(ledger['entries'])
html=(old/'ledger.html').read_text(encoding='utf8');tag='<script id="data" type="application/json">';start=html.index(tag)+len(tag);end=html.index('</script>',start)
html=html[:start]+json.dumps(ledger,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+html[end:]
html=html.replace('Y 批候选','补图与提质完成 · 正式v191')
html=html.replace('把“未完成检索”与“候选图未通过审核”分开。每条保留主要问题、并存问题、证据、下一步及采用条件。','原871条缺图已全部补齐并发布至正式v191。逐条保留原始问题、研究过程与采用证据，方便核对与追溯。')
html=html.replace('这里的 871 是本轮开始时的缺图关系数，不是 871 张已找到的图片。43 张既有低清图与 133 个无原成员关系的作品不计入本表。<strong>方案已登记不等于图片已补齐；候选源更新也不等于线上发布。</strong>','原871条既有成员关系已全部有合格认人图，当前剩余0。另43条旧低清已完成替换；133个原无成员关系的作品不计入本表，也未推定全员。<strong>正式v191已成功上线；原始问题分类保留为历史研究记录。</strong>')
html=html.replace('已补入候选','已补齐并上线').replace('候选已补齐','已补齐并上线').replace('证据与下一步','原问题与采用证据')
(out/'ledger.html').write_text(html,encoding='utf8',newline='\n')
start=html.index(tag)+len(tag)
assert json.loads(html[start:html.index('</script>',start)])==ledger
print(json.dumps({'rows':871,'resolved':871,'remaining':0,'openWorks':0,'openGroups':0,'qualityRemaining':0,'auditSha256':ledger['currentAuditSha256']}))
