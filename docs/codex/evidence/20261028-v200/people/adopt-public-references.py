"""One-time append of independently reviewed public references; no private writes."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
APP = ROOT / 'apps/idol-site'
OUT = Path(__file__).parent
def read(path):
    return json.loads(path.read_text(encoding='utf-8'))
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def write(path, value, line_ending='\n'):
    text=json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    path.write_bytes(text.replace('\n',line_ending).encode('utf-8'))

assert (OUT/'independent-structure-review.json').exists()
assert (OUT/'independent-source-review.json').exists()
assert (OUT/'independent-batch2-review.json').exists()
research = read(OUT/'research.json')
guards = {name:digest(APP/'data'/name) for name in ['mv-public-media.json','mv-member-appearance.json']}
receipts = {}
for stem, baseline_key in [('public-work-credits','baselineCreditsSha256'),('public-work-recognition','baselineRecognitionSha256')]:
    target=APP/'data'/f'{stem}.json'
    assert digest(target)==research[baseline_key], f'Unexpected baseline change: {stem}'
    original_bytes=target.read_bytes()
    line_ending='\r\n' if b'\r\n' in original_bytes else '\n'
    original=read(target)
    assert len(original['records'])==80
    delta=read(OUT/f'{stem}.delta.json')['records']+read(OUT/f'{stem}.batch2.delta.json')['records']
    assert len(delta)==11
    ids={r['workId'] for r in original['records']}
    assert not ids.intersection(r['workId'] for r in delta)
    result={**original,'records':original['records']+delta}
    assert result['records'][:80]==original['records']
    write(target,result,line_ending)
    receipts[stem]={'beforeFileSha256':research[baseline_key],'afterFileSha256':digest(target),'beforeWorks':80,'afterWorks':91}
for name,old in guards.items(): assert digest(APP/'data'/name)==old
credits=read(APP/'data/public-work-credits.json')['records']
recognition=read(APP/'data/public-work-recognition.json')['records']
absence=read(APP/'data/mv-member-appearance.json')['entries']
slots=sum(len(r['portraits']) for r in recognition)
unique=len({p['src'] for r in recognition for p in r['portraits']})
union={r['workId'] for r in credits+absence}
write(OUT/'adoption.json',{'schemaVersion':1,'adoptedAt':datetime.now(timezone.utc).isoformat(),'status':'locally_adopted_not_yet_deployed',
    'batch1Works':10,'batch1Slots':39,'batch2Works':1,'batch2Slots':5,'publicCreditWorks':len(credits),
    'publicRecognitionSlots':slots,'uniqueExistingOriginalFiles':unique,'originalNoPrivateRelationUniverse':131,
    'creditAbsenceUnion':len(union),'remainingPersonWorks':131-len(union),'files':receipts,
    'preservation':{'old80CreditObjects':'exactly_unchanged','old80RecognitionObjects':'exactly_unchanged','privateWrites':0,
                    'privateRelationsAdded':0,'newImageFiles':0,'absenceRulesChanged':0,'existingMvManifestChanged':False},
    'protectedFileHashes':guards,'fullPlaybackVerified':False,'individualVisualVerification':False,
    'independentReviews':['independent-structure-review.json','independent-source-review.json','independent-batch2-review.json']})
print(json.dumps({'works':len(credits),'slots':slots,'uniqueOriginals':unique,'remainingPersonWorks':131-len(union)}))
