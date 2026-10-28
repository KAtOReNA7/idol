"""Independent structural check of the reviewed v200 append-only proposals."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from PIL import Image

ROOT = Path(__file__).resolve().parents[5]
APP = ROOT / 'apps/idol-site'
HERE = Path(__file__).parent

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

credits = read(HERE / 'public-work-credits.delta.json')['records']
references = read(HERE / 'public-work-recognition.delta.json')['records']
research = read(HERE / 'research.json')
base_credits_path = APP / 'data/public-work-credits.json'
base_references_path = APP / 'data/public-work-recognition.json'
baseline_ref = '21b12a6f0d49f355ee639ae87bb2b294ba58513f'
def baseline_document(path, expected_sha):
    raw = subprocess.run(['git','show',baseline_ref + ':' + path.relative_to(ROOT).as_posix()],
                         cwd=ROOT,check=True,capture_output=True).stdout
    assert hashlib.sha256(raw).hexdigest() == expected_sha
    return json.loads(raw)
old_credit_document = baseline_document(base_credits_path, research['baselineCreditsSha256'])
old_reference_document = baseline_document(base_references_path, research['baselineRecognitionSha256'])
base_credits = old_credit_document['records']
base_references = old_reference_document['records']
assert len(base_credits) == 80 and sum(len(r['portraits']) for r in base_references) == 444
batch2_credits = read(HERE / 'public-work-credits.batch2.delta.json')['records']
batch2_references = read(HERE / 'public-work-recognition.batch2.delta.json')['records']
expected_credit_document = {**old_credit_document, 'records': base_credits + credits + batch2_credits}
expected_reference_document = {**old_reference_document, 'records': base_references + references + batch2_references}
assert read(base_credits_path) == expected_credit_document
assert read(base_references_path) == expected_reference_document
assert len(expected_credit_document['records']) == 91
assert sum(len(r['portraits']) for r in expected_reference_document['records']) == 488
assert len({r['workId'] for r in expected_credit_document['records']}) == 91
assert len({r['workId'] for r in expected_reference_document['records']}) == 91

queue = {r['workId']: r for r in read(ROOT / 'docs/codex/evidence/20261028-continuous/remaining-person-statistics.json')['remainingPersonWorks']}
snapshot = read(APP / 'data/snapshot.json')['tables']
works = {r['recordId']: r['fields'] for r in snapshot['works']['records']}
members = {r['recordId']: r['fields'] for r in snapshot['members']['records']}
media = read(APP / 'data/mv-public-media.json')['portraits']
old_references = [p for row in base_references for p in row['portraits']]
loona = {r['recordId']: r for r in read(APP / 'docs/artist-evidence/loona.json')['assets'] if r.get('recordId')}
expected = {
    'recvxIYG1FSCws': ['SORA'],
    'rec28ldfRTrN8c': ['HITOMI'],
    'rec28ldfRTrMcf': ['JULIE', 'NATTY', 'BELLE', 'HANEUL'],
    'recvxyOz5XueI9': ['HEEJIN', 'HYUNJIN', 'HASEUL', 'YEOJIN', 'VIVI', 'KIM LIP', 'JINSOUL', 'CHOERRY', 'YVES', 'GOWON', 'OLIVIA HYE'],
    'rec28ldfRTrIZT': ['JIYU', 'LEESOL', 'SUI', 'HAUM', 'KYA'],
    'rec28ldfRTrHhL': ['YEONSU', 'SEOWON', 'SENA', 'CHAEEUN', 'SEUNGCHAE'],
    'rec28ldfRTrNO2': ['MAI', 'BANG JEE MIN', 'KOKO', 'RYU SA RANG', 'CHOI JUNG EUN', 'JEONG SAE BI'],
    'rec28ldfRTrMwG': ['NATTY'],
    'rec28ldfRTrMgm': ['BELLE'],
    'rec28ldfRTrMMV': ['JULIE', 'NATTY', 'BELLE', 'HANEUL'],
}
assert len(credits) == len(references) == len(expected) == 10
assert {r['workId'] for r in credits} == set(expected)
assert {r['workId'] for r in references} == set(expected)
assert not set(expected) & {r['workId'] for r in base_credits}
ref_by_work = {r['workId']: r for r in references}
records = []
unique = set()

for credit in credits:
    wid = credit['workId']
    ref = ref_by_work[wid]
    fields = works[wid]
    for key in ['workId', 'groupId', 'videoId']:
        assert credit[key] == ref[key] == queue[wid][key], (wid, key)
    assert fields['fld2wy1cqw'][0]['recordId'] == credit['groupId']
    video = parse_qs(urlsplit(fields['fld1bEQ9rf'].splitlines()[0]).query)['v'][0]
    assert credit['videoId'] == video
    assert credit['memberIds'] == [p['memberId'] for p in ref['portraits']]
    assert len(set(credit['memberIds'])) == len(credit['memberIds'])
    names = [members[mid]['fld1jPwSAP'].upper() for mid in credit['memberIds']]
    assert names == expected[wid], (wid, names, expected[wid])
    assert all(any(g['recordId'] == credit['groupId'] for g in members[mid]['fld6bhQOdO']) for mid in credit['memberIds'])
    assert set(credit) <= {'workId','kind','memberIds','label','note','sourceUrl','sourceTitle','supportingUrls','videoId','groupId','checkedAt','evidence'}
    assert set(ref) == {'workId','videoId','groupId','portraits'}
    assert '不' in credit['note'] and ('出镜' in credit['note'] or '录音' in credit['note'])
    images = []
    assert len({p['photoSetId'] for p in ref['portraits']}) == 1
    for p, name in zip(ref['portraits'], names):
        mid = p['memberId']
        path = APP / 'public' / p['src'].lstrip('/')
        assert path.is_file()
        subprocess.run(['git','ls-files','--error-unmatch',str(path.relative_to(ROOT))], cwd=ROOT, check=True, capture_output=True)
        assert sha(path) == p['sha256']
        with Image.open(path) as image:
            size = image.size
        assert size == (p['width'], p['height'])
        crop = p['sourceCrop']
        assert all(isinstance(v, int) for v in crop.values())
        assert crop['x'] >= 0 and crop['y'] >= 0
        assert crop['x'] + crop['width'] <= p['width']
        assert crop['y'] + crop['height'] <= p['height']
        assert crop['width'] * 4 == crop['height'] * 3
        assert p['workAssociation'] == 'recognition_reference'
        assert '不证明本视频出镜' in p['note']
        candidates = [q for q in media + old_references if q['memberId'] == mid and q['src'] == p['src']]
        if candidates:
            assert any(q.get('photoSetId') == p['photoSetId'] and (q['width'], q['height']) == size for q in candidates)
        else:
            original = loona[mid]['original']
            assert '/' + original['path'].removeprefix('public/') == p['src']
            assert original['sha256'] == p['sha256']
        unique.add(p['src'])
        images.append(dict(memberId=mid,name=name,src=p['src'],sha256=p['sha256'],bytes=path.stat().st_size,
                           nativeSize=size,crop=crop,photoSetId=p['photoSetId']))
    records.append(dict(workId=wid,videoId=credit['videoId'],groupId=credit['groupId'],song=queue[wid]['song'],
                        memberNames=names,expectedSourceNames=expected[wid],label=credit['label'],
                        photoSets=sorted({p['photoSetId'] for p in ref['portraits']}),images=images))

slots = sum(len(r['images']) for r in records)
assert slots == 39
write(HERE / 'independent-structure-review.json', dict(
    reviewer='x_stats_v200',checkedAt=datetime.now(timezone.utc).isoformat(),status='passed_adopted_scoped_public_evidence_only',
    baselineRef=baseline_ref,
    deltaSha256={name:sha(HERE/name) for name in ['public-work-credits.delta.json','public-work-recognition.delta.json',
                                               'public-work-credits.batch2.delta.json','public-work-recognition.batch2.delta.json']},
    adoptedFileSha256={path.name:sha(path) for path in [base_credits_path,base_references_path]},
    records=records,summary=dict(works=10,slots=slots,uniqueOriginals=len(unique),allExistingTrackedOriginals=True,
        allBytesShaDimensionsAndCropsVerified=True,old80CreditsAnd444SlotsDeepEqualImmutableBaseline=True,
        all11AppendedRecordsExactlyEqualFrozenDeltas=True,otherTopLevelFieldsExactlyUnchanged=True,
        adoptedWorks=91,adoptedSlots=488,
        allExactWorkVideoGroupAndMemberIdsVerified=True,allCropsThreeByFour=True,noPrivateFields=True),
    limits=['No new visual identity inference; existing reviewed identity metadata used.',
            'No full MV playback, individual audio comparison or new private relations.',
            'Release/report/packaging association remains explicitly narrower than individual MV or recording participation.']))
print(json.dumps(dict(status='passed',works=10,slots=slots,uniqueOriginals=len(unique))))
