"""Reproduce the read-only gap ledger from allowlisted evidence; never write app data.

Run from any directory with Python 3.10+; no network or third-party packages required.
The input is a structural projection, not a personal-data backup/import payload.
"""
import collections
import hashlib
import json
import pathlib
import re
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/codex/evidence/20261027-current-gap-classification'
DATA = ROOT / 'apps/idol-site/data'


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def video(url):
    parsed = urlparse(url or '')
    return parsed.path.strip('/') if parsed.netloc == 'youtu.be' else parse_qs(parsed.query).get('v', [''])[0]


def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')


catalog = read(OUT / 'catalog-audit-projection.json')
media = read(DATA / 'mv-public-media.json')
audit = read(ROOT / 'docs/codex/mv-identity-asset-audit-20261025.json')
metadata = {r['workId']: r for r in read(OUT / 'video-metadata-recheck.json')['records']}
native_checks = read(OUT / 'live-native-photo-check.json')['records']
groups = {g['id']: g['name'] for g in catalog['groups']}
works = {w['id']: w for w in catalog['works']}
members = {m['id']: m for m in catalog['members']}
named = {k: w for k, w in works.items() if not w['placeholder']}
duplicates = {key: [i for i, n in collections.Counter(r['id'] for r in catalog[key]).items() if n > 1]
              for key in ('groups', 'members', 'works')}
tuples = []
native = set()
empty_rows = 0
orphans = []
for row in catalog['relations']:
    if not row['workIds'] and not row['memberIds']:
        empty_rows += 1
    elif not row['workIds'] or not row['memberIds']:
        orphans.append({'kind': 'one-sided-relation', **row})
    for wid in row['workIds']:
        for mid in row['memberIds']:
            if wid not in works or mid not in members:
                orphans.append({'kind': 'unknown-relation-reference', 'workId': wid, 'memberId': mid})
            else:
                tuples.append((wid, mid))
                if row['nativePhotoPresent']:
                    native.add((wid, mid))
for kind, entities in [('work', works), ('member', members)]:
    for entity in entities.values():
        for gid in entity['groupIds'] + entity.get('formerGroupIds', []):
            if gid not in groups:
                orphans.append({'kind': kind + '-unknown-group', 'id': entity['id'], 'groupId': gid})
public = {(p['workId'], p['memberId']) for p in media['portraits']
          if p['workId'] in works and p['videoId'] == video(works[p['workId']]['url'])}
relation_set = set(tuples)
native_only = relation_set - public
assert native_only == {(r['workId'], r['memberId']) for r in native_checks}
assert all(r['httpStatus'] == 200 and r['matchesCandidateBytes'] and r['candidateOriginalVerified'] for r in native_checks)
missing = relation_set - public - native
bound = {w for w, _ in relation_set}
unbound = {k: w for k, w in named.items() if k not in bound}
assert set(metadata) == set(unbound) and all(r['status'] == 'read' for r in metadata.values())
credits = {r['workId']: r for r in read(DATA / 'public-work-credits.json')['records']}
no_members = {r['workId']: r for r in read(DATA / 'mv-member-appearance.json')['entries']
              if r['status'] == 'confirmed-no-members' and r['videoId'] == video(works[r['workId']]['url'])}

CATEGORIES = {
    'no_members': ('已证无成员真人', '不补成员图；保留精确视频无成员规则，仅MV评分。', '原证据与workId/videoId同时匹配；不得扩大到其他版本。'),
    'limited_credits': ('已有有限公开署名', '沿现有具名来源核查实际出镜；为已核实人物找官方或可靠民间同套图。', '录音/分队与MV出演分开；新增公开资料不得创建私人评分关系。'),
    'project_scope': ('更名／分队范围', '核对GIRLSET与VCHA历史、MADEIN S分队的当期官方名单及具名幕后。', '区分项目和时期；保留原ID，不把旧全团名单移植。'),
    'alternate_version': ('语言／混音／其他版本', '从本videoId核查画面和幕后，再找对应版本人物与同套图。', '同歌不同版不能共用未经验证的出镜名单；动画版本另行核验。'),
    'screen_collaboration': ('影视／广告／合作', '先区分歌唱署名、演员和团员真人；查制作方演职表及具名幕后。', '歌手署名不证明真人出演；不能按OST标签自动关闭评分。'),
    'performance': ('表演／现场', '查该视频演出字幕、官方具名现场/幕后，核对实际阵容。', '以本视频实际成员为准；不拿原MV名单或其他时期全员代替。'),
    'special_visual': ('歌词／视觉／特别短片', '先检查是否真人、混合影像或纯动画，再走具名图或无真人证据路线。', '仅标签不够；无真人须独立证据，缺图不得关闭评分。'),
    'standard_mv': ('常规MV待人物证据', '优先具名官方拍摄专题；再查可追溯民间同套图，MV具名帧作为后备。', '证实姓名/系列/版本；清晰自然且保留原件，不猜脸、不AI补脸。'),
}
collaborations = {'rec28ldfRTrGou', 'rec28ldfRTrGwK', 'recvxyH5pzoaOZ',
                  'recvxyHuKMBHQA', 'recvxyOz5XFVzt', 'recvxyOz5Xr917',
                  'recvxyOz5XQZhy', 'recvxyOz5XmFwB', 'recvxyOz5XsgVc', 'recvxyOz5X6G1q'}
rows = []
for wid, work in unbound.items():
    meta = metadata[wid]
    title = meta['title'].lower()
    flags = []
    if re.search(r'remix|english ver|japanese ver|japan edition|korean ver|acoustic ver|other world ver|minive ver', title):
        flags.append('alternate_version')
    if wid in collaborations:
        flags.append('screen_collaboration')
    if re.search(r'performance|live clip', title):
        flags.append('performance')
    if re.search(r'lyric|visual|film|special video|special clip|music story|b-side drop|promotion video', title):
        flags.append('special_visual')
    category = ('no_members' if wid in no_members else 'limited_credits' if wid in credits
                else 'project_scope' if 'girlset' in title or 'madein s -' in title
                else next(iter(flags), 'standard_mv'))
    label, remedy, acceptance = CATEGORIES[category]
    rows.append({'workId': wid, 'song': work['song'], 'groups': [groups[g] for g in work['groupIds']],
                 'videoId': video(work['url']), 'url': work['url'], 'officialTitle': meta['title'],
                 'author': meta['author'], 'primaryCategory': category, 'categoryLabel': label,
                 'secondaryFlags': flags, 'researchDepth': 'exact-oembed-title-and-author; not full playback',
                 'sourceUrl': meta['sourceUrl'], 'existingCredit': credits.get(wid),
                 'noMemberEvidence': no_members.get(wid), 'nextAction': remedy, 'acceptance': acceptance})
counts = dict(collections.Counter(r['primaryCategory'] for r in rows))
assert len(rows) == len({r['workId'] for r in rows}) == 131 == sum(counts.values())
save('unbound-work-remedies.json', {'scope': 'Mutually exclusive primary routes; secondary flags overlap. Routes are not completed research.', 'counts': counts, 'records': rows})

stats = read(DATA / 'group-statistics-completion-evidence.json')
previous = read(ROOT / 'docs/codex/evidence/20261027-statistics-relations/statistics-review.json')
unknown = [dict(r) for r in previous['records'] if r['status'] == 'unknown']
runtime_unknown = set()
for slug, group in stats['groups'].items():
    runtime_unknown.update((slug, row['platform']) for row in group['social'] if row.get('accountExists') and row.get('observedValue') is None)
    runtime_unknown.update((slug, field) for field in ('sales', 'wins') if group[field].get('observedValue') is None)
assert {(r['group'], r['metric']) for r in unknown} == runtime_unknown
remedies = {
    'x': '先确认账号身份；读原主页或带观测日期的同账号统计，推荐卡/搜索摘要不采用。仍不可得则保留未知状态和用户要求的显示0。',
    'sales': '建立实体发行清单，以Circle/Hanteo可读原表按发行/市场/周期去重汇总；只有局部证据时明确下限，不当全球总量。',
    'wins': '按节目/日期/歌曲逐项核对官方获奖记录；排名榜缺席或单首歌曲0不证明全团0。',
}
for row in unknown:
    row['nextAction'] = remedies[row['metric']]
assert len(unknown) == 17
save('statistics-remedies.json', {'unknownCount': len(unknown), 'unknown': unknown,
      'sourceConflictsSeparateFromUnknown': stats['summary']['unresolvedSourceDifferences'],
      'freshness': 'Retain observedAt and public rounding. Existing nonzero values are historical observations, not live counters.'})

holds = []
narrative_gaps = []
for path in sorted((DATA / 'artist-timelines').glob('*.json')):
    timeline = read(path)
    for event in timeline.get('events', []):
        if event.get('reviewStatus') != 'hold':
            continue
        slug = path.stem
        category = ('product_scope' if slug == 'geenius' else 'identity_and_effective_date' if slug == 'udtt'
                    else 'release_date' if slug == 'genblue' else 'primary_announcement')
        remedy = {'product_scope': '核公司原发行公告；QR器乐预公开与完整人声专辑分开，零售日不能替代实际发行原文。',
                  'identity_and_effective_date': '寻找公司/本人原始人事公告，区分临时参与、正式加入和生效日期。',
                  'release_date': '查实际上线的官方发行正文/发行商目录，并区分语言版本、预告日与发行日。',
                  'primary_announcement': '恢复公司/本人原公告正文和刊载日期；将公告、计划、实际生效日分别记录。'}[category]
        holds.append({'group': slug, 'eventId': event['id'], 'title': event['title'],
                      'category': category, 'holdReasons': event['holdReasons'], 'sources': event['sources'],
                      'nextAction': remedy, 'newEvidenceStatus': 'primary-recovered-limited-announcement-ready-for-review' if slug == 'rocketpunch' else 'unresolved'})
    narrative_gaps.extend({'group': path.stem, 'note': note, 'status': 'retained-editorial-note-not-freshly-revalidated'} for note in timeline.get('gaps', []))
assert len(holds) == 12
save('timeline-remedies.json', {'activeHoldCount': len(holds), 'records': holds,
      'retainedNarrativeNotes': narrative_gaps, 'note': 'Narrative notes overlap and include historical/optional research; do not count as additional current defects.'})

stage_remedies = {
    'not_found': '查官方团体频道及KBS/MBC/SBS/Mnet同曲现场；未找到不等于不存在，先复核旧2026-10-11研究。',
    'version_mismatch': '按语言、混音、合作者和表演形式锁定准确版本；无同版时保留空缺，不迁移旧评分到别版。',
    'blocked': '检查原频道可公开观看的替代上传/电视台原版；区分地区、下架与嵌入限制，不绕过访问控制。',
}
stage_rows = [{'workId': w['id'], 'song': w['song'], 'url': w['url'], 'groupIds': w['groupIds'],
               'status': w['stageResearch']['status'], 'previousCheckedAt': w['stageResearch'].get('checkedAt'),
               'nextAction': stage_remedies[w['stageResearch']['status']], 'freshStageSearchPerformed': False}
              for w in named.values() if not w['stagePresent']]
save('stage-remedies.json', {'scope': 'Existing runtime stage backlog; not a fresh search or 127 broken MV images.',
      'counts': dict(collections.Counter(r['status'] for r in stage_rows)), 'records': stage_rows})
metadata_rows = [{'workId': w['id'], 'song': w['song'], 'url': w['url'],
                  'missingFields': [k for k in ('releaseDate', 'officialTitle', 'channel') if not w.get(k)],
                  'nextAction': '标题/频道读精确视频oEmbed；日期查官方发布timestamp或发行公告，先分清视频日和专辑日，按现有时区政策填写。'}
                 for w in named.values() if any(not w.get(k) for k in ('releaseDate', 'officialTitle', 'channel'))]
save('metadata-remedies.json', {'scope': 'Current display-v1 feed after applyReviewedWorkMetadata; fields may overlap on one work.', 'records': metadata_rows})

old_unbound = {w['workId'] for w in audit['workCoverage'] if w['noExistingRelationships']}
retired_downloads = [r for r in audit['unresolvedDownloads'] if (r['workId'], r['memberId']) in public]
covers = {(c.get('workId'), c['videoId']) for c in media['covers']}
summary = {
    'checkedAt': '2026-10-27', 'catalogCapturedAt': catalog['capturedAt'], 'siteVersion': 192,
    'groups': len(groups), 'members': len(members), 'works': len(works), 'namedWorks': len(named),
    'legacyWorkPlaceholders': len(works) - len(named), 'relationRows': len(catalog['relations']),
    'validRelations': len(tuples), 'legacyEmptyRelationRows': empty_rows,
    'duplicateEntityIds': duplicates, 'duplicateTuples': [list(k) for k, n in collections.Counter(tuples).items() if n > 1],
    'orphanReferences': orphans, 'publicPortraits': len(media['portraits']),
    'exactVideoPublicCoverage': len(public & relation_set), 'nativeOnlyCoverage': len(native_only),
    'nativeOnlyHttpAndShaVerified': len(native_checks), 'missingImageTuples': sorted(missing),
    'nativePortraitCompositionReview': [r for r in native_checks if r['candidateVisualReview'] == 'needs_closer_portrait'],
    'covers': len(covers), 'namedWorkMissingExactCover': [w['id'] for w in named.values() if (w['id'], video(w['url'])) not in covers],
    'frozenUnboundWorks': len(old_unbound), 'liveUnboundWorks': len(unbound),
    'noLongerUnbound': sorted(old_unbound - set(unbound)), 'newlyUnbound': sorted(set(unbound) - old_unbound),
    'unboundCategoryCounts': counts, 'unboundLimitedCredits': len(set(unbound) & set(credits)),
    'unboundWithoutPublicCredits': len(set(unbound) - set(credits)),
    'unboundWithoutCreditsExcludingVerifiedNoMembers': len(set(unbound) - set(credits) - set(no_members)),
    'historicalDownloadFailures': len(audit['unresolvedDownloads']), 'supersededDownloadFailures': len(retired_downloads),
    'unknownStatistics': len(unknown), 'sourceConflicts': len(stats['summary']['unresolvedSourceDifferences']),
    'timelineHolds': len(holds), 'stagePresent': sum(w['stagePresent'] for w in named.values()),
    'stageBacklog': len(stage_rows), 'stageCategories': dict(collections.Counter(r['status'] for r in stage_rows)),
    'metadataWorkCount': len(metadata_rows), 'metadataMissingFields': dict(collections.Counter(k for r in metadata_rows for k in r['missingFields'])),
    'memberMissingFieldCounts': {k: sum(not m[k + 'Present'] for m in members.values()) for k in ('profile', 'birthDate', 'photo', 'officialUrl')},
    'limits': ['Public manifest structural coverage is not a new HTTP/visual check of all 2828 portraits or 628 covers.',
               'Only 12 native-only image routes were freshly HTTP/SHA tested.',
               '131 oEmbed checks verify metadata availability, not whole-video playback/member appearance.',
               '127 stage rows are retained research states, not freshly verified source failures.',
               'Missing optional personal-site URLs and private fields are not incomplete personal records.',
               'Categories overlap across ledgers; do not add their counts into one total.'],
}
assert len(tuples) == 2840 and len(public & relation_set) == 2828 and len(native_only) == 12
assert not missing and not orphans and not summary['duplicateTuples'] and not any(duplicates.values())
assert len(retired_downloads) == len(audit['unresolvedDownloads']) == 127
assert len(stage_rows) == 127 and len(old_unbound) == 133
assert not summary['namedWorkMissingExactCover']
save('summary.json', summary)
inputs = [OUT / 'catalog-audit-projection.json', OUT / 'video-metadata-recheck.json', OUT / 'live-native-photo-check.json',
          DATA / 'mv-public-media.json', DATA / 'public-work-credits.json', DATA / 'group-statistics-completion-evidence.json',
          DATA / 'mv-member-appearance.json', ROOT / 'docs/codex/mv-identity-asset-audit-20261025.json']
inputs += sorted((DATA / 'artist-timelines').glob('*.json'))
inputs += [ROOT / 'docs/codex/evidence/20261027-statistics-relations/statistics-review.json', pathlib.Path(__file__)]
forbidden = {'score', 'stageScore', 'stylingScore', 'note', 'memory', 'watched', 'favorite'}
def check_projection(value):
    if isinstance(value, dict):
        assert not (set(value) & forbidden), 'Do not archive personal fields in the audit projection'
        for item in value.values():
            check_projection(item)
    elif isinstance(value, list):
        for item in value:
            check_projection(item)
check_projection(catalog)
save('verification.json', {'result': 'passed', 'assertions': 'disjoint131, unknown17, holds12, exact-image-coverage2840, nativeHTTP/SHA12, duplicates/orphans0, retiredDownloads127, stages127, namedCoverGaps0',
                         'inputs': [{'path': str(p.relative_to(ROOT)).replace('\\', '/'), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in inputs]})
print(json.dumps(summary, ensure_ascii=True, indent=2))
