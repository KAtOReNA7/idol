"""Apply only the reviewed, public evidence delta; never touch private relations."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
DATA = ROOT / 'apps/idol-site/data'


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')


def main():
    credit_path = DATA / 'public-work-credits.json'
    recognition_path = DATA / 'public-work-recognition.json'
    generic_path = DATA / 'public-group-recognition.json'
    supplement_path = DATA / 'stages/supplements.json'
    paths = [credit_path, recognition_path, generic_path, supplement_path]
    before_hashes = {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
    credits, recognition, generic, supplements = map(load, paths)
    work_id = 'recvxIZy3525BF'
    assert not any(r['workId'] == work_id for r in credits['records']), 'Already adopted; do not repeat'
    assert len(credits['records']) == 104 and len(recognition['records']) == 104
    group = next(g for g in generic['groups'] if g['groupName'] == 'HITGS')
    before_group = copy.deepcopy(group)
    names = ['Seojin', 'Seohee', 'Hyerin', 'Iyoo']
    selected = [next(p for p in group['portraits'] if p['name'] == name) for name in names]
    page7 = 'https://kanstarpress.com/?p=204530&page=7'
    page8 = 'https://kanstarpress.com/?p=204530&page=8'
    note = '2026年8月31日「韓スタ！」采访中，Seohee、Seojin、Hyerin、Iyoo分别自述《Gulliver!》录音经历；Iyoo另提到Seojin与Seohee拍摄争执场景。这里仅列已具名自述的4人，不推定VV的录音参与，也不把录音资料当完整MV出镜名单；不新增成员评分关系。'
    credit = {
        'workId': work_id, 'groupId': group['groupId'], 'videoId': 'IM-N8trjDzk',
        'memberIds': [p['memberId'] for p in selected], 'kind': 'reported_participation',
        'label': '成员自述录音／拍摄参与参考', 'note': note,
        'sourceUrl': page7, 'sourceTitle': '韓スタ！HITGS专访：Gulliver!录音经历与拍摄情节',
        'supportingUrls': ['https://kanstarpress.com/?p=204530&page=6', page8],
        'checkedAt': '2026-10-29',
        'evidence': 'Named first-person recording accounts on page7; exact Gulliver! question on preceding page6; page8 embeds IM-N8trjDzk and names two filming subjects. Not a complete cast, inferred full lineup or private rating relation. docs/codex/evidence/20261029-pr47-v202-followup/hitgs-adoption.json',
    }
    credits['records'].append(credit)
    portraits = []
    for p in selected:
        row = copy.deepcopy(p)
        row.pop('participationStatus')
        row['label'] = '同系列校服照片 · 认人参考'
        row['note'] = '复用已审完整原图，仅帮助辨认采访具名参与者；不推定本MV全部出镜人物、照片拍摄日或具体造型。'
        portraits.append(row)
    recognition['records'].append({'workId': work_id, 'videoId': 'IM-N8trjDzk', 'groupId': group['groupId'], 'portraits': portraits})
    group['collectionConsistency'] = 'documented_named_press_collection'
    group['collectionSourceUrl'] = 'https://kanstarpress.com/?p=204530'
    group['collectionNote'] = '采用2026年8月31日「韓スタ！」同篇采访逐名刊载的5人同系列校服照片，版面配图与既有原件构图对应；沿用完整原图。具体拍摄日期未确认，不代表本作参与、全部MV出镜或照片与本作同期。'
    # Keep all original image paths, bytes, crops, names and attribution intact.
    assert group['portraits'] == before_group['portraits']

    note_changes = []
    summaries = {
        'recvxyH5pzoMAf': ('东京电视台《Premium MelodiX!》2023年5月1日官方回顾确认STAYC《Teddy Bear》日语版；同期NanteJapan节目报道链接到B站转载入口BV1bo4y1x7LV。当前允许非官方转载，仍待核具体分P／CID、完整首尾、实际日语音轨及成员范围，尚未采用为本条舞台。', [
            {'label': '东京电视台：2023-05-01 日语版节目回顾', 'url': 'https://www.tv-tokyo.co.jp/melodix_premium/backnumber/202305.html'},
            {'label': 'NanteJapan：同期节目报道与转载链接', 'url': 'https://nantejapan.com/akb48-fantastics-and-more-perform-on-premium-melodix-for-may-1/'},
            {'label': 'B站：节目转载入口（分P及完整性待核）', 'url': 'https://www.bilibili.com/video/BV1bo4y1x7LV/'},
        ]),
        'rec28ldfRTrOnV': ('TBS《PLAYLIST》2025年11月25日官方回顾列出tripleS ∞!演出《Password》，并已定位题为251126 Password @PLAYLIST的B站转载入口。官方和非官方转载均可核查；当前页面读取受限，尚未核实分P／CID、完整首尾、实际音轨及八人分队范围，尚未采用为本条舞台。', None),
    }
    for work, (summary, sources) in summaries.items():
        review = supplements['works'][work]['searchReview']
        previous = copy.deepcopy(review)
        # Preserve the already reviewed exact TBS source, rather than invent a URL.
        if work == 'rec28ldfRTrOnV':
            sources = copy.deepcopy(previous['publicNote']['sources'])
            sources.append({'label': 'B站：Password @PLAYLIST转载线索（媒体身份及完整性待核）', 'url': 'https://www.bilibili.com/video/BV1bhU8BWEso/'})
        review['summary'] = summary
        review['publicNote'] = {'summary': summary, 'sources': sources}
        review['scope'] = copy.deepcopy(sources)
        review['limitations'] = ['允许官方、非官方转载及第三方上传；仍须核实精确媒体身份、完整范围、语种／编配与参与者。当前仅资料说明，不建立评分绑定。']
        note_changes.append({'workId': work, 'expectedBefore': previous, 'after': copy.deepcopy(review)})

    adoption = {
        'checkedDate': '2026-10-29', 'baseline': '14dfedbdd07f4ac511490d706afd385379be6a0d',
        'scope': 'Bounded new public interview credit, same-collection provenance and current-policy research notes; no private relation or formal stage changes.',
        'beforeFileSha256': before_hashes,
        'genericGroupChange': {'groupId': group['groupId'], 'expectedBefore': before_group, 'after': copy.deepcopy(group)},
        'creditAdded': credit, 'recognitionAdded': recognition['records'][-1], 'researchNoteChanges': note_changes,
        'counts': {'newCreditWorks': 1, 'newNamedReferenceSlots': 4, 'totalCreditWorks': 105, 'totalNamedReferenceSlots': 541, 'genericActiveWorks': 21, 'genericActiveSlots': 102, 'existingOriginalsAdded': 0, 'photoSeriesEvidenceItemsClosed': 1, 'fullPersonCastItemsClosed': 0, 'formalStageChanges': 0, 'privateWrites': 0},
        'remaining': 'Gulliver! has four named recording participants and two reported filming subjects. VV recording and a complete exact-video cast remain unverified. Keep the 24-person fact queue and annotate this bounded progress. MADEIN source-resolution limitation remains.',
        'sameCollectionEvidence': {'publisher': '韓スタ！', 'publishedDate': '2026-08-31', 'captions': {'VV': '?p=204530&page=2', 'Seojin': '?p=204530&page=3', 'Seohee': '?p=204530&page=4', 'Iyoo': '?p=204530&page=5', 'Hyerin': '?p=204530&page=6'}, 'review': 'The five individually captioned school-uniform images in the same interview correspond to the existing square-cropped source photos by the same full-frame poses, clothing and background objects. No facial identification or claim of an exact shoot date. Original files remain byte-identical.'},
    }
    for p, value in zip(paths, [credits, recognition, generic, supplements]):
        write(p, value)
    write(HERE / 'hitgs-adoption.json', adoption)
    print(json.dumps(adoption['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
