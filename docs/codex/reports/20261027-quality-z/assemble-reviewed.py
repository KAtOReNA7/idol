"""Assemble the 43 reviewed quality replacements; originals are copied unchanged."""
from pathlib import Path
import sys,json,hashlib,shutil,re
from PIL import Image
root=Path(__file__).resolve().parents[4];folder=Path(__file__).parent
audit_bytes=(root/'docs/codex/mv-identity-asset-audit-20261025.json').read_bytes();audit=json.loads(audit_bytes)
base=hashlib.sha256(audit_bytes).hexdigest()
prior=json.loads((folder/'reviewed-existing31-delta.json').read_text(encoding='utf8'))
assert base==prior['baseAuditSha256'],'Frozen audit changed'
extra=json.loads(Path(sys.argv[1]).read_text(encoding='utf8'))
assert len(prior['replacements'])==31 and len(extra['replacements'])==12
rows=prior['replacements']+extra['replacements'];key=lambda r:(r['workId'],r['videoId'],r['memberId'])
assert len({key(r['after']) for r in rows})==43
assert {key(r['after']) for r in rows}=={key(r) for r in audit['identityImages'] if r.get('qualityTier')=='card_only'}
originals=[]
for item in rows:
    row=item['after'];before=item['expectedBefore'];review=item['review']
    assert review['approved'] and review['actual3By4Reviewed'] and review['reason']
    assert before==next(r for r in audit['identityImages'] if key(r)==key(row))
    local=row.pop('localOriginalPath',None)
    if local:
        p=Path(local);b=p.read_bytes();digest=hashlib.sha256(b).hexdigest()
        assert digest==row['sha256'] and len(b)==row['byteLength']
        im=Image.open(p);assert im.size==(row['width'],row['height'])
        group=re.sub('[^a-z0-9]+','-',row.get('group','member').lower()).strip('-')
        ext={'JPEG':'.jpg','PNG':'.png','WEBP':'.webp'}[im.format]
        row['src']='/artist/mv-identity-batch-z-20261027/identities/'+group+'-'+digest[:14]+ext
        dest=root/'apps/idol-site/public'/row['src'].lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
        if dest.exists():assert dest.read_bytes()==b
        else:shutil.copyfile(p,dest)
        originals.append({'path':dest.relative_to(root).as_posix(),'sha256':digest,'bytes':len(b),'sourceImageUrl':row['sourceImageUrl']})
    row['operation']='replace_card_only'
delta={'schemaVersion':1,'batch':'Z','checkedAt':'2026-10-27','baseAuditSha256':base,'replacements':rows}
(folder/'quality-reviewed-delta.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(folder/'new-originals.json').write_text(json.dumps(originals,indent=2)+'\n',encoding='utf8')
print(json.dumps({'replacements':len(rows),'newOriginals':len(originals),'originalBytes':sum(r['bytes'] for r in originals),'baseAuditSha256':base}))
