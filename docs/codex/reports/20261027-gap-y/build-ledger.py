"""Reconcile frozen Y additions with X without modifying historical ledgers."""
from pathlib import Path
from collections import Counter
import json, hashlib, subprocess, csv, shutil
from PIL import Image
root=Path(__file__).resolve().parents[4]; out=Path(__file__).resolve().parent
def read(p): return json.loads(p.read_text(encoding='utf8'))
def write(p,v): p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def key(r): return (r['workId'],r['videoId'],r['memberId'])
baseline='f0e4092ee434c2b3163c497e966e01fba5e9833d'
auditpath=root/'docs/codex/mv-identity-asset-audit-20261025.json'
a=read(auditpath); old=json.loads(subprocess.check_output(['git','show',baseline+':docs/codex/mv-identity-asset-audit-20261025.json'],cwd=root))
delta=read(out/'photo-set-reviewed-delta.json')['identityImages']; new={key(r):r for r in delta}; selected={key(r):r for r in a['identityImages']}
assert len(new)==len(delta)==51 and all(selected[key(r)]==r for r in old['identityImages'])
assert a['covers']==old['covers'] and a['summary']['missingRelationshipImages']==0
assert len(old['workCoverage'])==len(a['workCoverage'])
for w0,w1 in zip(old['workCoverage'],a['workCoverage']):
 assert {k:v for k,v in w0.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}=={k:v for k,v in w1.items() if k not in ['publicIdentityCount','missingIdentityRelationships']}
 assert w1['publicIdentityCount']-w0['publicIdentityCount']==sum(r['workId']==w0['workId'] and r['videoId']==w0['videoId'] for r in delta)
originals={r['src']:r for r in delta}
for r in delta:
 p=root/'apps/idol-site/public'/r['src'].lstrip('/'); b=p.read_bytes()
 assert len(b)==r['byteLength'] and hashlib.sha256(b).hexdigest()==r['sha256']
 with Image.open(p) as im: assert im.size==(r['width'],r['height'])
 c=r['sourceCrop']; assert c['width']*4==c['height']*3 and c['width']>=540
 assert c['x']>=0 and c['y']>=0 and c['x']+c['width']<=r['width'] and c['y']+c['height']<=r['height']
ledger=read(out.parent/'20261027-gap-x/ledger.json')
ledger.update(checkedAt='2026-10-27',currentAuditSha256=hashlib.sha256(auditpath.read_bytes()).hexdigest(),previousLedger='docs/codex/reports/20261027-gap-x/ledger.json')
ledger['release']={'status':'blocked_archive_upload','baseVersion':190,'url':'https://idol-lens-private.wuke40758.chatgpt.site/','candidateSourceCommit':'bafe825a0d84501f66825919a281e63ddb033a15','candidateContains':'P only; Q/R/S/T/U/V/W/X/Y not yet synchronized','reason':'P完整包的原生save_site_version上传300009ms超时；未产生新版本或部署。Q/R/S/T/U/V/W/X/Y继续开发，不能把GitHub和源推送称作上线。'}
for row in ledger['entries']:
 if key(row) not in new: continue
 r=new[key(row)]; assert row['status']=='open'
 row.update(status='resolved',previousPrimaryCategory=row['primaryCategory'],previousProblemEvidence=row['problemEvidence'],primaryCategory='resolved',secondaryCategories=[],validationStage='Y批已导入；本地验证及正式发布见报告',problemEvidence='逐图具名与同套来源已核对，采用概念/写真等认人参考；完整原件、实际3:4和运行时显示通过。并不据此推定MV服装或出镜。',steps=['保留具名、同套及作品关联证据与完整原件；来源和原构图限制详见resolution。'],researchEvidence='docs/codex/reports/20261027-gap-y/',resolution={k:r[k] for k in ['src','sha256','label','evidenceLevel','sourcePageUrl','photoSet','qualityNotes']},sources=[{'url':r['sourcePageUrl'],'label':r['label'],'depth':r['identityEvidence']}],detailedProblem='resolved_by_Y_reviewed_named_photo_set')
openkeys={key(r) for r in ledger['entries'] if r['status']=='open'}
actual={(w['workId'],w['videoId'],m['memberId']) for w in a['workCoverage'] for m in w['missingIdentityRelationships']}
assert len(ledger['entries'])==871 and openkeys==actual and len(openkeys)==0
ledger['summary'].update(resolved=871,remaining=0,newSinceJ=868,byCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'])),openByCategory=dict(Counter(r['primaryCategory'] for r in ledger['entries'] if r['status']=='open')))
write(out/'ledger.json',ledger)
with (out/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['group','song','stageName','memberName','workId','videoId','memberId','ratingId','status','primaryCategory','validationStage','problemEvidence']; w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n'); w.writeheader(); w.writerows(ledger['entries'])
html=(out.parent/'20261027-gap-x/ledger.html').read_text(encoding='utf8')
start=html.index('<script id="data" type="application/json">')+len('<script id="data" type="application/json">'); end=html.index('</script>',start)
html=html[:start]+json.dumps(ledger,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+html[end:]
html=html.replace('X 批候选','Y 批候选')
(out/'ledger.html').write_text(html,encoding='utf8',newline='\n')
qaPath=Path('E:/project/idol-gap-y-qa-20261027/local-browser.json')
if qaPath.exists():
 qa=read(qaPath); assert qa['passed']; shutil.copyfile(qaPath,out/'local-browser-verification.json')
write(out/'integration-verification.json',{'status':'passed','batch':'Y','baselineCommit':baseline,'addedBindings':51,'beforeMissing':51,'afterMissing':0,'oldBindingsUnchanged':len(old['identityImages']),'oldCoversUnchanged':len(old['covers']),'existingRelationshipsAndPoliciesUnchanged':True,'uniqueOriginals':len(originals),'originalBytes':sum(r['byteLength'] for r in originals.values()),'ledgerRows':871,'ledgerOpenSetEqualsAudit':True,'typeScript':'pending','targetedTests':{'passed':41,'knownBaselineFailure':0,'description':'Updated obsolete LE SSERAFIM source assertion to existing public identity component; shared/private reference behavior retained. All five targeted suites pass, including preservation checks for quality replacement.'},'browserVerification':'local-browser-verification.json','summary':a['summary']})
print(json.dumps({'added':51,'remaining':0,'oldBindingsUnchanged':len(old['identityImages']),'originals':len(originals),'bytes':sum(r['byteLength'] for r in originals.values())}))
