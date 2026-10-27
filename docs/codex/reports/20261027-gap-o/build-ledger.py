"""Reconcile O against the frozen N ledger; do not overwrite previous batches."""
from pathlib import Path
import json, hashlib, subprocess, csv
from collections import Counter
root=Path(__file__).resolve().parents[4];out=Path(__file__).resolve().parent
def read(f):return json.loads(f.read_text(encoding='utf8'))
def write(f,d):f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def key(r):return (r['workId'],r['videoId'],r['memberId'])
auditPath=root/'docs/codex/mv-identity-asset-audit-20261025.json';a=read(auditPath)
baseline='7a653f10214390ed8500b3c8d51d84cc48b5c5ab';old=json.loads(subprocess.check_output(['git','show',baseline+':docs/codex/mv-identity-asset-audit-20261025.json'],cwd=root))
delta=[r for f in sorted(out.glob('*-reviewed-delta.json')) for r in read(f)['identityImages']];new={key(r):r for r in delta};selected={key(r):r for r in a['identityImages']}
assert len(new)==len(delta) and len(delta)>0 and all(selected[key(r)]==r for r in old['identityImages'])
assert a['covers']==old['covers'] and a['summary']['missingRelationshipImages']==706-len(delta)
for w0,w1 in zip(old['workCoverage'],a['workCoverage']):
 assert {k:v for k,v in w0.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}=={k:v for k,v in w1.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}
 assert w1['publicIdentityCount']-w0['publicIdentityCount']==sum(r['workId']==w0['workId'] and r['videoId']==w0['videoId'] for r in delta)
for r in delta:
 f=root/'apps/idol-site/public'/r['src'].lstrip('/');b=f.read_bytes();assert len(b)==r['byteLength'] and hashlib.sha256(b).hexdigest()==r['sha256']
 c=r['sourceCrop'];assert c['width']*4==c['height']*3 and c['width']>=540
ledger=read(out.parent/'20261027-gap-n/ledger.json');ledger['checkedAt']='2026-10-27';ledger['currentAuditSha256']=hashlib.sha256(auditPath.read_bytes()).hexdigest();ledger['previousLedger']='docs/codex/reports/20261027-gap-n/ledger.json';ledger['release']={'status':'not_attempted_prior_upload_blocker','baseVersion':190,'url':'https://idol-lens-private.wuke40758.chatgpt.site/'}
if (out/'native-evidence.json').exists():
 n=read(out/'native-evidence.json')
 if (n.get('deployment') or {}).get('status')=='succeeded':ledger['release']={'status':'succeeded','version':n['version']['version_number'],'url':n['url'],'sourceCommit':n['source']['commit_sha'],'deploymentId':n['deployment']['id']}
 elif n.get('status')=='blocked_archive_upload':ledger['release'].update(status='blocked_archive_upload',candidateSourceCommit=n['source']['commit_sha'],reason='文件blob上传300秒超时；无新版本或部署ID，正式站仍v190。')
for row in ledger['entries']:
 if key(row) not in new:continue
 r=new[key(row)];assert row['status']=='open';row.update(status='resolved',previousPrimaryCategory=row['primaryCategory'],previousProblemEvidence=row['problemEvidence'],primaryCategory='resolved',secondaryCategories=[],validationStage='O批已导入；发布状态见release字段',problemEvidence='具名来源、精确MV版本、完整原件及实际3:4已逐项复核；详见本条resolution。',steps=['保留完整原件、具名证据与裁切元数据；源画面限制在逐条qualityNotes披露。'],researchEvidence='docs/codex/reports/20261027-gap-o/',resolution={k:r[k] for k in ['src','sha256','label','evidenceLevel','sourcePageUrl','qualityNotes']},sources=[{'url':r['sourcePageUrl'],'label':'已采用官方MV幕后来源','depth':r['identityEvidence']}],detailedProblem='resolved_by_O_reviewed_named_exact_mv_source')
# The official gallery is now fully enumerated; name attribution remains open.
for row in ledger['entries']:
 if row['status']=='open' and row['group']=='ILLIT' and row['song']=='Tick-Tack':
  row.update(previousPrimaryCategory=row['primaryCategory'],primaryCategory='identity_unproven',validationStage='O批官方70图完整读取；待可靠逐人署名',problemEvidence='已取得官方Tick-Tack MV Shoot公开正文及70张原图清单。旧Cherish入口不再作为主要障碍；未选中的成员仍缺可靠逐人具名照片对应，不按顺序或脸赋名。',researchEvidence='docs/codex/reports/20261027-gap-o/research-notes.md',researchExhausted=False)
  row['sources'].insert(0,{'url':'https://weverse.io/illit/media/0-152290796','label':'已完整读取官方70图MV拍摄图集','depth':'完整公开post响应及photos清单在evidence/tick-official-post.json'})
  row['steps']=['在具名成员原帖或可靠档案中寻找同一完整照片；比较整张图片像素及原图SHA，不使用人脸相似度。','MOKA的Pinterest候选与官方58号原图裁切相符，但需补强署名来源；IROHA的具名自拍四图头顶截断/前景遮挡，暂不采用。','新候选仍须核对目标MV、至少540×720有效裁切及实际构图；缺图保留评分。']
openkeys={key(r) for r in ledger['entries'] if r['status']=='open'};actual={(w['workId'],w['videoId'],m['memberId']) for w in a['workCoverage'] for m in w['missingIdentityRelationships']};assert len(ledger['entries'])==871 and openkeys==actual
ledger['summary'].update(resolved=165+len(delta),remaining=706-len(delta),newSinceJ=162+len(delta),byCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'])),openByCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'] if r['status']=='open')))
write(out/'ledger.json',ledger)
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');writer.writeheader();writer.writerows(ledger['entries'])
write(out/'integration-verification.json',{'status':'passed','batch':'O','baselineCommit':baseline,'addedBindings':len(delta),'beforeMissing':706,'afterMissing':706-len(delta),'oldBindingsUnchanged':2122,'oldCoversUnchanged':628,'existingRelationshipsAndPoliciesUnchanged':True,'originalBytes':sum(r['byteLength'] for r in delta),'originals':[{k:r[k] for k in ['workId','videoId','memberId','src','sha256','byteLength','width','height','sourceCrop']} for r in delta],'ledgerRows':871,'ledgerOpenSetEqualsAudit':True,'summary':a['summary']})
print(json.dumps({'new':len(delta),'remaining':706-len(delta),'totalBindings':2122+len(delta),'originalBytes':sum(r['byteLength'] for r in delta)}))

# Keep the proven filter/search/export UI, replacing its frozen embedded data only.
html=(out.parent/'20261027-gap-n/ledger.html').read_text(encoding='utf-8')
start=html.index('<script id="data" type="application/json">')+len('<script id="data" type="application/json">');end=html.index('</script>',start)
html=html[:start]+json.dumps(ledger,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+html[end:]
html=html.replace('2026-10-26 · 当前补图进度','2026-10-27 · 当前补图进度')
(out/'ledger.html').write_text(html,encoding='utf-8',newline='\n')

html=(out/'ledger.html').read_text(encoding='utf-8').replace('N批新增1条已导入仓库，但文件上传超时，正式站仍v190；A–M批保持已上线。','N/O批累计新增3条已导入仓库；正式站仍v190，发布状态另见报告。')
(out/'ledger.html').write_text(html,encoding='utf-8',newline='\n')
