"""One-time append of source-scoped release-cover references, never private relations."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
APP = ROOT / 'apps/idol-site'
OUT = Path(__file__).parent
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p, v): p.write_bytes((json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

cpath = APP/'data/public-work-credits.json'
rpath = APP/'data/public-work-recognition.json'
credits, recognition = read(cpath), read(rpath)
assert len(credits['records']) == len(recognition['records']) == 102, 'One-time append: stop after adoption.'
assert sha(cpath) == '40140590b8e352aa4accaf8db2b18c1d14c486e46694d62cd44dd5e4b7cdd2b6'
assert sha(rpath) == '0a32dc70d51ef7156c0bb8023913bd44eb70a907d51edbb247bae36650abb44b'
candidate = read(OUT/'groups-ive-purple-madein-candidate.json')
assert candidate['workId'] == 'rec28ldfRTrPi9'
ids = ['rec28ldbniBgam','rec28ldbniBghr','rec28ldbniBgCI','rec28ldbniBgJR']
names = ['MASHIRO','MiU','SERINA','NAGOMI']
assert candidate['namedMembers'] == names
group = next(g for g in read(APP/'data/public-group-recognition.json')['groups'] if g['groupName']=='MADEIN')
assert group['groupId'] == 'rec28ldfRTiCzI'
credit = dict(workId=candidate['workId'], groupId=group['groupId'], videoId=candidate['videoId'],
    kind='documented_project_lineup', memberIds=ids, label='公开本发行封套参与参考',
    note='CDJapan《Girl Meets Boy》的CD及KiT商品原文逐名列MASHIRO、MiU、SERINA、NAGOMI个人版，同页曲目含《PUNG!》。这里只展示本发行封套人物，不等同本曲逐人录音或本MV出镜确认，也不代表当前成员身份。复用的官方资料照原件为569×854，未放大；更高清同套图仍待补。',
    sourceUrl=candidate['sources'][0]['url'], sourceTitle='CDJapan · Girl Meets Boy具名个人封套与曲目表',
    supportingUrls=[s['url'] for s in candidate['sources'][1:]], checkedAt='2026-10-29',
    evidence='Named personal-cover editions for the release containing PUNG! only; no exact-video cast or recording-role inference. docs/codex/evidence/20261029-group-followup/groups-ive-purple-madein-candidate.json')
portraits=[]
for mid, name in zip(ids, names):
    p=copy.deepcopy(next(p for p in group['portraits'] if p['memberId']==mid))
    assert p['name'] == name
    assert sha(APP/'public'/p['src'].lstrip('/')) == p['sha256']
    assert (p['width'],p['height']) == (569,854)
    p.update(label='既有官方资料照 · 认人参考', note='完整官方资料照原件569×854，仅帮助辨认具名封套人物；不证明本视频出镜、录音或同期造型，未放大图片。')
    portraits.append(p)
row=dict(workId=credit['workId'], videoId=credit['videoId'], groupId=credit['groupId'], portraits=portraits)
protected=['snapshot.json','mv-public-media.json','mv-member-appearance.json','public-group-recognition.json','stages/inventory.json']
baseline=dict(commit='cef1765801ce62739c44308292a680b16e681597',
    originalCreditFileSha256=sha(cpath), originalRecognitionFileSha256=sha(rpath),
    protectedFiles={n:sha(APP/'data'/n) for n in protected})
write(OUT/'application-baseline.json', baseline)
write(OUT/'public-work-credits.delta.json', dict(records=[credit]))
write(OUT/'public-work-recognition.delta.json', dict(records=[row]))
write(cpath, {**credits,'records':credits['records']+[credit]})
write(rpath, {**recognition,'records':recognition['records']+[row]})
for name, digest in baseline['protectedFiles'].items(): assert sha(APP/'data'/name)==digest
write(OUT/'adoption.json', dict(status='local_unpublished', addedCreditWorks=1, addedRecognitionSlots=4,
    publicCreditWorks=103, publicRecognitionSlots=531, genericOnlyWorks=23, activeGenericSlots=113,
    preservedHistoricalGenericWorks=24, exactMvAndAudioScopeStillUnverified=True,
    reusedOriginalFiles=4, newImageFiles=0, privateWrites=0, privateRelationsAdded=0,
    stageBindingsChanged=0, published=False))
print('Added one limited release-cover reference and four unchanged original portraits; no private writes.')
