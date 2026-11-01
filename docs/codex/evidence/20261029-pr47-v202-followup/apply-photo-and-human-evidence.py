"""One-shot reviewed public-only delta. Keeps every previous original and binding."""
import copy
import hashlib
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
APP = ROOT / 'apps/idol-site'

def load(p):
    return json.loads(p.read_text(encoding='utf-8'))

def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    gpath = APP / 'data/public-group-recognition.json'
    spath = APP / 'data/stages/supplements.json'
    data, supplements = load(gpath), load(spath)
    group = next(g for g in data['groups'] if g['groupName'] == 'MADEIN')
    assert group['portraits'][0]['width'] == 569, 'Already applied or unexpected source'
    before = copy.deepcopy(group)
    rows = load(HERE / 'madein-jj-photo-readback.json')
    incoming = Path('C:/Users/61919/AppData/Local/Temp/idol-madein-jj-e36k1qze')
    assets = []
    for p in group['portraits']:
        row = next(r for r in rows if r['name'].lower() == p['name'].lower())
        source = incoming / (row['name']+'.jpg')
        assert sha(source) == row['sha256'] and source.stat().st_size == row['bytes']
        destination = APP / 'public/artist/madein-jj-20250314' / (row['name'].lower()+'.jpg')
        assert not destination.exists()
        assets.append({'path': '/'+destination.relative_to(APP / 'public').as_posix(),
                       'bytes': row['bytes'], 'sha256': row['sha256'], 'mime': 'image/jpeg',
                       'delivery': 'local', 'sourceUrl': row['url']})
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        p.update(src=assets[-1]['path'], width=683, height=1024,
                 sourceCrop={'x': 0, 'y': 0, 'width': 681, 'height': 908},
                 sha256=row['sha256'], objectPosition='50% 0%',
                 sourceUrl='https://jj-jj.net/lifestyle/177106/', sourceImageUrl=row['url'],
                 photoSetId='madein-jj-interview-20250314',
                 photoSetTitle='JJ 2025-03-14 MADEIN named interview portraits')
    group.update(collectionConsistency='documented_named_press_collection',
                 collectionSourceUrl='https://jj-jj.net/lifestyle/177106/',
                 collectionNote='采用JJ于2025年3月14日同篇采访逐名刊载的6人写真，原页面文件均为683×1024；统一3:4展示裁切，点开保留完整原件。未核实本作参与或同期妆造。旧569×854资料图及其来源完整保留，PUNG!既有4人发行参考继续使用原图。')
    photo_receipt = {'checkedDate': '2026-10-29', 'sourceUrl': group['collectionSourceUrl'],
        'publicationDate': '2025-03-14', 'photographer': '花村克彦',
        'sourceLocators': 'Article member-introduction images immediately precede MASHIRO, MiU, SUHYE, YESEO, SERINA and NAGOMI captions; photography credit appears after interview.',
        'review': 'Six originals visually inspected as one editorial collection; faces clear, natural poses, no added borders or upscaling. Framing varies across members. These are the available page files, not claimed maximum-resolution camera originals.',
        'expectedBefore': before, 'after': copy.deepcopy(group), 'assets': assets,
        'preservation': {'priorOriginalsRemoved': 0, 'pungReferenceChanges': 0,
                         'privateRelationChanges': 0, 'formalStageChanges': 0,
                         'existingProductionAssetManifestChanges': 0},
        'deliveryNote': 'Six additional public originals are copied locally by the normal build, outside the unchanged old 5996-row delivery inventory. All six build outputs must pass byte checks before future publication.'}
    write(gpath, data)
    photo_receipt['afterGenericFileSha256'] = sha(gpath)
    write(HERE / 'madein-photo-adoption.json', photo_receipt)
    update_human(supplements, spath)

def update_human(supplements, spath):
    work_id = 'rec28ldfRTrOnV'
    review = supplements['works'][work_id]['searchReview']
    before_review = copy.deepcopy(review)
    summary = 'TBS节目回顾确认tripleS ∞!《Password》参加PLAYLIST；B站非官方转载BV1bhU8BWEso的完整首尾、原日／英混合版本及8人分队全员参与，已由用户看片确认。代理未独立完整播放，精确CID／分P及新鲜owner空分、完整保存日志和线上原绑定仍待核对，尚未采用为本条舞台。'
    review['summary'] = summary
    review['publicNote']['summary'] = summary
    review['limitations'] = ['用户看片确认内容范围，不能当作代理独立完整播放或官方逐人署名。尚缺精确CID／分P与正式采用前的owner保护核对；没有建立评分绑定。']
    for source in review['scope'] + review['publicNote']['sources']:
        if 'BV1bhU8BWEso' in source['url']:
            source['label'] = 'B站：Password @PLAYLIST转载（用户已确认完整／版本／8人，CID待核）'
    write(spath, supplements)
    write(HERE / 'password-user-confirmation.json', {
        'checkedDate': '2026-10-29', 'workId': work_id,
        'url': 'https://www.bilibili.com/video/BV1bhU8BWEso/',
        'evidenceType': 'user_playback_observation',
        'userStatement': '1.开始到结束完整、对应原日／英混合版本，8人全；2.没有',
        'confirmed': {'completeStartToEnd': True, 'originalJapaneseEnglishMixedVersion': True, 'eightUnitMembers': True},
        'notIndependentlyVerified': ['agent_full_playback', 'cid', 'page', 'fresh_owner_empty_score', 'complete_save_log', 'online_original_binding'],
        'browserObservation': {'title': '251126 tripleS ∞! Password @PLAYLIST', 'visibleDuration': '02:54', 'uploader': 'tripleS_能量站', 'agentPlaybackComplete': False},
        'browserBlock': 'Existing IAB tab2 timed out twice on reconnection; no additional HTTP retry after 412; no old Chrome authorization reused.',
        'formalStageChanged': False, 'privateWrites': 0,
        'expectedBefore': before_review, 'after': copy.deepcopy(review),
        'afterSupplementsSha256': sha(spath),
        'ifeye': {'targetVideoId': 'ecQSl-6NSTA', 'behindVideoId': 'PfAtoVDW-rI',
                  'userObservation': '没有', 'meaning': 'User found no requested director/member-role credit in this behind-the-scenes entry; not proof no such participation occurred.',
                  'adoption': 'none; keep factual role unresolved'}})

if __name__ == '__main__':
    import sys
    if '--human-only' in sys.argv:
        assert not (HERE / 'password-user-confirmation.json').exists(), 'Already recorded'
        p = APP / 'data/stages/supplements.json'
        update_human(load(p), p)
    else:
        main()
