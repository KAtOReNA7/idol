"""Freeze reviewed candidate files, preserve original bytes, and prepare one import."""
from pathlib import Path
from PIL import Image
from collections import Counter
import json,hashlib,re,shutil,sys
repo=Path(__file__).resolve().parents[4];out=Path(__file__).parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
auditPath=repo/'docs/codex/mv-identity-asset-audit-20261025.json';audit=read(auditPath)
rows=[];inputs=[];paths={};keys=set();rejected=[];corrections=[]
for arg in sys.argv[1:]:
 f=Path(arg).resolve();blob=f.read_bytes();inputs.append({'path':f.relative_to(repo).as_posix(),'sha256':hashlib.sha256(blob).hexdigest()})
 for item in json.loads(blob)['identityImages']:
  if item['sha256']=='09d7011d5b8d0c1ef393d0360f814c274e0634b26fefe1e033946535386e15f7':
   rejected.append({'workId':item['workId'],'videoId':item['videoId'],'memberId':item['memberId'],'sha256':item['sha256'],'reason':'Prop obscures mouth; a named alternative from the same OMG set replaces it.'});continue
  r=dict(item);key=tuple(r[k] for k in ['workId','videoId','memberId']);assert key not in keys;keys.add(key)
  local=Path(r.pop('localOriginalPath'));b=local.read_bytes();sha=hashlib.sha256(b).hexdigest();im=Image.open(local)
  assert sha==r['sha256'] and len(b)==r['byteLength']
  if im.size!=(r['width'],r['height']):
   assert f.parent.name=='large' and (r['width'],r['height'])==(r['sourceCrop']['width'],r['sourceCrop']['height']) and im.size==(r['sourceWidth'],r['sourceHeight'])
   corrections.append({'workId':r['workId'],'videoId':r['videoId'],'memberId':r['memberId'],'before':[r['width'],r['height']],'after':list(im.size),'reason':'Candidate width/height held crop dimensions; original bytes and sourceWidth/sourceHeight verified. Correct only original dimension metadata.'})
   r['width'],r['height']=im.size
  c=r['sourceCrop'];assert c['width']*4==c['height']*3 and c['width']>=540 and c['x']>=0 and c['y']>=0 and c['x']+c['width']<=r['width'] and c['y']+c['height']<=r['height']
  if r.get('photoSet',{}).get('id')=='aespa-lemonade-wda-exclusive-202605':
   r.update(kind='portrait_photo',label='同系列写真 · 认人参考');r['selectionReview']={**r['selectionReview'],'priority':1,'reason':'The publisher names this release series Exclusive Photo, without an explicit concept or jacket designation; retain the truthful portrait label.'}
  slug=re.sub('[^a-z0-9]+','-',r['group'].lower()).strip('-');ext={'JPEG':'jpg','PNG':'png','WEBP':'webp'}[im.format]
  src=paths.setdefault(sha,f'/artist/mv-identity-batch-q-20261027/identities/{slug}-{sha[:14]}.{ext}')
  dest=repo/'apps/idol-site/public'/src.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==b
  else:shutil.copyfile(local,dest)
  r['src']=src;rows.append(r)
unique={r['src']:r for r in rows}
delta={'schemaVersion':1,'baseAuditSha256':hashlib.sha256(auditPath.read_bytes()).hexdigest(),'summary':{'addedBindings':len(rows),'uniqueOriginals':len(unique),'originalBytes':sum(r['byteLength'] for r in unique.values()),'actual3By4ContactSheetsReviewed':len(inputs)},'identityImages':rows}
(out/'photo-set-reviewed-delta.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(out/'frozen-inputs.json').write_text(json.dumps({'checkedAt':'2026-10-27','inputs':inputs,'summary':delta['summary'],'byGroup':dict(Counter(r['group'] for r in rows)),'rejectedCandidates':rejected,'dimensionMetadataCorrections':corrections},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(delta['summary']))
