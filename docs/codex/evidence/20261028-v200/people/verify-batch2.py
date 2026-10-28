"""Independent Tick-Tack documentary scope and original-reference checks."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from PIL import Image

HERE = Path(__file__).parent
ROOT = HERE.parents[4]
APP = ROOT / 'apps/idol-site'
def read(p):
    return json.loads(p.read_text(encoding='utf-8'))
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

credits = read(HERE/'public-work-credits.batch2.delta.json')['records']
references = read(HERE/'public-work-recognition.batch2.delta.json')['records']
assert len(credits) == len(references) == 1
c, r = credits[0], references[0]
assert c['workId'] == r['workId'] == 'rec28ldfRTrJVj'
assert c['videoId'] == r['videoId'] == '1yMzV0NdB9g'
assert c['groupId'] == r['groupId'] == 'rec28ldfRTiBON'
snapshot = read(APP/'data/snapshot.json')['tables']
works = {r['recordId']: r['fields'] for r in snapshot['works']['records']}
members = {r['recordId']: r['fields'] for r in snapshot['members']['records']}
fields = works[c['workId']]
assert parse_qs(urlsplit(fields['fld1bEQ9rf'].splitlines()[0]).query)['v'][0] == c['videoId']
assert fields['fld2wy1cqw'][0]['recordId'] == c['groupId']
expected = ['YUNAH','MINJU','MOKA','WONHEE','IROHA']
assert [members[mid]['fld1jPwSAP'].upper() for mid in c['memberIds']] == expected
assert [p['memberId'] for p in r['portraits']] == c['memberIds']
base = read(APP/'data/public-work-recognition.json')['records']
assert next(row for row in base if row['workId'] == c['workId']) == r
assert next(row for row in read(APP/'data/public-work-credits.json')['records'] if row['workId'] == c['workId']) == c
old = next(row for row in base if row['workId'] == 'rec28ldfRTrK1S')
assert len(old['portraits']) == 5
records=[]
for p, q, name in zip(r['portraits'], old['portraits'], expected):
    context={'workId','videoId','label','note'}
    assert {k:v for k,v in p.items() if k not in context} == {k:v for k,v in q.items() if k not in context}
    assert any(g['recordId']==c['groupId'] for g in members[p['memberId']]['fld6bhQOdO'])
    path=APP/'public'/p['src'].lstrip('/')
    subprocess.run(['git','ls-files','--error-unmatch',str(path.relative_to(ROOT))],cwd=ROOT,check=True,capture_output=True)
    assert sha(path)==p['sha256']
    with Image.open(path) as im:
        assert im.size==(p['width'],p['height'])
    crop=p['sourceCrop']
    assert crop['width']*4==crop['height']*3
    assert 0<=crop['x']<=p['width']-crop['width'] and 0<=crop['y']<=p['height']-crop['height']
    assert p['workAssociation']=='recognition_reference' and '不证明本视频出镜' in p['note']
    records.append(dict(memberId=p['memberId'],name=name,src=p['src'],sha256=p['sha256'],bytes=path.stat().st_size))
assert len({p['photoSetId'] for p in r['portraits']})==1
assert '未独立完整播放或逐人核验全片' in c['note']
result=dict(reviewer='x_stats_v200',checkedAt=datetime.now(timezone.utc).isoformat(),status='passed_adopted_scoped_public_evidence_only',
    workId=c['workId'],videoId=c['videoId'],groupId=c['groupId'],slots=5,newOriginals=0,
    deltaSha256={name:sha(HERE/name) for name in ['public-work-credits.batch2.delta.json','public-work-recognition.batch2.delta.json']},
    sources=[dict(url='https://sports.khan.co.kr/article/202411180842003',method='independent-search-tool-public-page-body-read',
                 finding='The 2024-11-18 original report names five members in the 11-17 performance-MV release; supports scoped documentary participation.'),
             dict(url='https://www.billboard-japan.com/d_news/detail/143658/2',method='independent-search-tool-public-page-body-read',
                 finding='The explicitly labelled performance MV has direct exact link 1yMzV0NdB9g, avoiding the ordinary-MV variant.')],
    records=records,noPrivateFieldsOrRelations=True,fullPlayback=False,individualVisualVerification=False,
    originalReferenceTupleReuseVerified=True,adoptedRecordsExactlyEqualFrozenDeltas=True,
    allShaDimensionsCropsAndTrackedFilesVerified=True)
(HERE/'independent-batch2-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(dict(status='passed',works=1,slots=5)))
