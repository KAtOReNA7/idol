"""Reconcile N against the frozen M ledger; do not overwrite previous batches."""
from pathlib import Path
import json, hashlib, subprocess, csv
from collections import Counter
root=Path(__file__).resolve().parents[4];out=Path(__file__).resolve().parent
def read(f):return json.loads(f.read_text(encoding='utf8'))
def write(f,d):f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def key(r):return (r['workId'],r['videoId'],r['memberId'])
auditPath=root/'docs/codex/mv-identity-asset-audit-20261025.json';a=read(auditPath)
baseline='c15995737b58c67a25edff2da5ebbdc7b1cd2c93';old=json.loads(subprocess.check_output(['git','show',baseline+':docs/codex/mv-identity-asset-audit-20261025.json'],cwd=root))
delta=[r for f in sorted(out.glob('*-reviewed-delta.json')) for r in read(f)['identityImages']];new={key(r):r for r in delta};selected={key(r):r for r in a['identityImages']}
assert len(new)==len(delta) and len(delta)>0 and all(selected[key(r)]==r for r in old['identityImages'])
assert a['covers']==old['covers'] and a['summary']['missingRelationshipImages']==707-len(delta)
for w0,w1 in zip(old['workCoverage'],a['workCoverage']):
 assert {k:v for k,v in w0.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}=={k:v for k,v in w1.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}
 assert w1['publicIdentityCount']-w0['publicIdentityCount']==sum(r['workId']==w0['workId'] and r['videoId']==w0['videoId'] for r in delta)
for r in delta:
 f=root/'apps/idol-site/public'/r['src'].lstrip('/');b=f.read_bytes();assert len(b)==r['byteLength'] and hashlib.sha256(b).hexdigest()==r['sha256']
 c=r['sourceCrop'];assert c['width']*4==c['height']*3 and c['width']>=540
ledger=read(out.parent/'20261026-gap-m/ledger.json');ledger['checkedAt']='2026-10-27';ledger['currentAuditSha256']=hashlib.sha256(auditPath.read_bytes()).hexdigest();ledger['previousLedger']='docs/codex/reports/20261026-gap-m/ledger.json';ledger['release']={'status':'pending','baseVersion':190,'url':'https://idol-lens-private.wuke40758.chatgpt.site/'}
if (out/'native-evidence.json').exists():
 n=read(out/'native-evidence.json')
 if (n.get('deployment') or {}).get('status')=='succeeded':ledger['release']={'status':'succeeded','version':n['version']['version_number'],'url':n['url'],'sourceCommit':n['source']['commit_sha'],'deploymentId':n['deployment']['id']}
 elif n.get('status')=='blocked_archive_upload':ledger['release'].update(status='blocked_archive_upload',candidateSourceCommit=n['source']['commit_sha'],reason='文件blob上传300秒超时；无新版本或部署ID，正式站仍v190。')
for row in ledger['entries']:
 if key(row) not in new:continue
 r=new[key(row)];assert row['status']=='open';row.update(status='resolved',previousPrimaryCategory=row['primaryCategory'],previousProblemEvidence=row['problemEvidence'],primaryCategory='resolved',secondaryCategories=[],validationStage='N批已导入；发布状态见release字段',problemEvidence='具名来源、精确MV版本、完整原件及实际3:4已逐项复核；详见本条resolution。',steps=['保留完整原件、具名证据与裁切元数据；源画面限制在逐条qualityNotes披露。'],researchEvidence='docs/codex/reports/20261027-gap-n/',resolution={k:r[k] for k in ['src','sha256','label','evidenceLevel','sourcePageUrl','qualityNotes']},sources=[{'url':r['sourcePageUrl'],'label':'已采用官方MV幕后来源','depth':r['identityEvidence']}],detailedProblem='resolved_by_N_reviewed_named_exact_mv_source')
for row in ledger['entries']:
 if key(row) in new and row['memberId']=='rec28ldbniB70B' and row['videoId']=='1VqxWNwgf5Q':
  row.update(problemEvidence='官方具名MV预告帖有两张图片；旧流程只取到裁切额头的首图，本次核验第二张3001×2000完整原图并补入。',detailedProblem='resolved_official_multi_image_post_later_photo_not_enumerated',steps=['读取官方帖完整图片列表，不以首图失败推定整帖无可用图。','第二张原图字节/SHA和1140×1520显示裁切已核验；正式发布受blob上传超时阻塞。'])
  row['resolution'].update(sourcePhotoIndex=2,sourcePhotoCount=2)
openkeys={key(r) for r in ledger['entries'] if r['status']=='open'};actual={(w['workId'],w['videoId'],m['memberId']) for w in a['workCoverage'] for m in w['missingIdentityRelationships']};assert len(ledger['entries'])==871 and openkeys==actual
ledger['summary'].update(resolved=164+len(delta),remaining=707-len(delta),newSinceJ=161+len(delta),byCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'])),openByCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'] if r['status']=='open')))
write(out/'ledger.json',ledger)
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');writer.writeheader();writer.writerows(ledger['entries'])
write(out/'integration-verification.json',{'status':'passed','batch':'N','baselineCommit':baseline,'addedBindings':len(delta),'beforeMissing':707,'afterMissing':707-len(delta),'oldBindingsUnchanged':2121,'oldCoversUnchanged':628,'existingRelationshipsAndPoliciesUnchanged':True,'originalBytes':sum(r['byteLength'] for r in delta),'originals':[{k:r[k] for k in ['workId','videoId','memberId','src','sha256','byteLength','width','height','sourceCrop']} for r in delta],'ledgerRows':871,'ledgerOpenSetEqualsAudit':True,'summary':a['summary']})
print(json.dumps({'new':len(delta),'remaining':707-len(delta),'totalBindings':2121+len(delta),'originalBytes':sum(r['byteLength'] for r in delta)}))

# Keep the proven filter/search/export UI, replacing its frozen embedded data only.
html=(out.parent/'20261026-gap-m/ledger.html').read_text(encoding='utf-8')
start=html.index('<script id="data" type="application/json">')+len('<script id="data" type="application/json">');end=html.index('</script>',start)
html=html[:start]+json.dumps(ledger,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+html[end:]
html=html.replace('2026-10-26 · 当前补图进度','2026-10-27 · 当前补图进度')
(out/'ledger.html').write_text(html,encoding='utf-8',newline='\n')

html=(out/'ledger.html').read_text(encoding='utf-8')
old="'本表已补齐项已导入本地，正式发布尚待完成；当前正式站另见发布报告。'"
new="(release.status==='blocked_archive_upload'?'N批新增1条已导入仓库，但文件上传超时，正式站仍v190；A–M批保持已上线。':'本表新增项已导入仓库，正式发布尚待完成；当前正式站另见发布报告。')"
assert old in html
html=html.replace(old,new)
(out/'ledger.html').write_text(html,encoding='utf-8',newline='\n')
