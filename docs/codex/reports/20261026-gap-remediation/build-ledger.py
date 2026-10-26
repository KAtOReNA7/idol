"""Rebuild the frozen 871-row issue/solution ledger; Python standard library only.

Run from any directory. This joins saved evidence, not a new web research run.
One primary issue per original tuple; secondary issues are non-additive.
"""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
DOCS = ROOT / 'docs/codex'
def read(p):
    return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
def key(r):
    return r['workId'], r['videoId'], r['memberId']

CATEGORIES = [
    ('research_incomplete', '检索或来源正文待补'),
    ('source_access', '选定来源访问受阻'),
    ('insufficient_pixels', '有效像素不足或未验'),
    ('not_mv_shoot', '非目标 MV 拍摄素材'),
    ('identity_unproven', '逐图成员归属未证实'),
    ('wrong_version', '视频或语言版本不符'),
    ('obscured_composition', '清晰度或构图不合格'),
    ('provenance_mismatch', '原文件版本与校验记录不一致'),
]
LABELS = dict(CATEGORIES)
H_MAP = {
    'portrait_crop_pixel_loss': 'insufficient_pixels',
    'frame_native_resolution_unverified': 'insufficient_pixels',
    'exact_mv_named_source_missing': 'research_incomplete',
    'candidate_ready_for_integration': 'research_incomplete',
    'face_too_small_or_occluded': 'obscured_composition',
    'member_frame_attribution_missing': 'identity_unproven',
    'caption_to_frame_mapping_unverified': 'identity_unproven',
    'wrong_shoot_type': 'not_mv_shoot',
    'language_version_provenance_missing': 'wrong_version',
}
INVENTORY_MAP = {
    'individual_work_research_incomplete': 'research_incomplete',
    'known_named_member_profile_target_chapter_review_pending': 'research_incomplete',
    'existing_exact_video_source_target_member_review_pending': 'research_incomplete',
    'official_archive_title_lead_body_pending': 'research_incomplete',
    'known_download_http_403': 'source_access',
    'known_named_chapter_image_absent_or_ambiguous': 'identity_unproven',
    'known_original_quality_below_gate': 'insufficient_pixels',
    'known_original_sha_mismatch': 'provenance_mismatch',
    'obscured_composition': 'obscured_composition',
    'official_mv_behind_source_named_still_pending': 'identity_unproven',
    'official_mv_making_found_named_frame_review_pending': 'identity_unproven',
    'press_group_photo_individual_mapping_unverified': 'identity_unproven',
    'public_source_body_found_image_mapping_pending': 'identity_unproven',
    'target_member_cameo_source_needed': 'identity_unproven',
    'different_mv_version_specific_source_needed': 'wrong_version',
    'campaign_version_mismatch': 'wrong_version',
    'bounded_search_hits_concept_not_mv_verified': 'not_mv_shoot',
}
CRITERIA = [
    '保持既有 workId / videoId / memberId / ratingId，不推定出镜或增删评分关系。',
    '来源逐图具名，或原视频的明确具名字幕能唯一指向该画面人物；不凭脸、服装或站位猜身份。',
    '确认目标视频版本，或证明是该 MV 的具名拍摄现场；不以概念照、封套、广告、舞台或其他语言版本代替。',
    '记录原文件或原生视频帧的来源、尺寸、SHA256；保留原字节，禁止生成、插值放大或修复面孔细节。',
    '实际 3:4 裁切至少 540×720 源像素，脸部可辨、构图完整；不能只看原图标称尺寸。',
    '通过候选导入校验、实际显示和原图流程；缺图期间保持成员评分入口。',
]
GENERIC_STEPS = {
    'research_incomplete': '先读下列成员资料页中的目标歌曲章节或同视频已采用来源的正文，按逐图图注定位目标成员；没有图片时执行列出的精确成员检索，再查官方 MV 幕后。',
    'source_access': '停止重复请求被拒绝的选定来源；从列出的官方艺人档案、公开 MV 幕后或独立具名转载寻找同一作品素材。仅新公开来源正常可读时下载，不能绕过登录、403/406 或 TLS 校验。',
    'insufficient_pixels': '寻找同 MV 具名原文件或原生高清视频帧，先测实际 3:4 有效宽再下载批量图；原图过小则更换镜头，不能放大或补细节。',
    'not_mv_shoot': '排除已找到的封套、概念或宣传图；改查明确写明目标 MV 拍摄现场的正文或官方 making，再逐图核对姓名及版本。',
    'identity_unproven': '从原页面图注、官方成员自发原帖或原视频具名字幕建立一对一图像归属；多人镜头中仅出现一个姓名不足以采用，改找具名近景。',
    'wrong_version': '并列核查目标及同名其他视频的 ID、官方标题、语言和剪辑；用来源明确版本说明或可追溯镜头时间与背景构图对应后才采用。',
    'obscured_composition': '换同 MV 中睁眼、无遮挡、头部完整且细节清楚的具名近景；检查实际裁切，不能靠锐化或生成处理充当高清。',
    'provenance_mismatch': '保留旧审批哈希和文件记录；重新读取当前发布者的具名原图，作为新版本从来源到质量完整审核，生成新 SHA 后另建候选。',
}

def source(url, label, depth):
    return {'url': url, 'label': label, 'depth': depth}
def unique_sources(items):
    seen, out = set(), []
    for item in items:
        if not item.get('url', '').startswith('https://'):
            continue
        token = item['url'], item.get('depth', '')
        if token not in seen:
            seen.add(token)
            out.append(item)
    return out

def build():
    baseline = read(DOCS / 'mv-gap-871-baseline-20261026.json')
    h, i, inv = [read(HERE / ('evidence-' + tag + '.json')) for tag in ['h', 'i', 'inventory']]
    audit = read(DOCS / 'mv-identity-asset-audit-20261025.json')
    admitted = read(DOCS / 'mv-batch-j-20261026.json')['identityImages']
    lily = read(HERE / 'lily-source-markup-resolution.json')
    rows = {}

    def add(raw, category, bucket, evidence, steps, sources, stage, criteria=None, secondary=None):
        k = key(raw)
        assert k not in rows, ('Duplicate tuple', k)
        rows[k] = dict(
            **{f: raw[f] for f in ['ratingId', 'memberId', 'memberName', 'workId', 'videoId', 'song', 'group']},
            stageName=raw.get('catalogStageName', raw.get('stageName', '')),
            primaryCategory=category, sourcePrimaryProblem=raw.get('primaryBlocker', raw.get('primaryProblem')),
            secondaryCategories=[s for s in (secondary or []) if s in LABELS and s != category],
            secondaryDetails=raw.get('secondaryBlockers', raw.get('secondaryProblems', [])),
            status='open', validationStage=stage, problemEvidence=evidence,
            steps=steps, acceptanceCriteria=criteria or CRITERIA,
            sources=unique_sources([source('https://www.youtube.com/watch?v=' + raw['videoId'], '目录中的精确目标视频', '已核对目录身份；本身不是具名照片证据')] + sources),
            evidenceFile='evidence-' + bucket + '.json',
        )

    for r in h['solutions']:
        cat = H_MAP[r['primaryBlocker']]
        add(r, cat, 'h', r['previousFinding'], [p['action'] for p in r['plans']],
            [source(s['url'], '已登记来源', s.get('verifiedScope', s['verification'])) for s in r['verifiedSources']],
            '具体候选已审，条件尚未满足', r['adoptionConditions'])

    for r in i['tupleSolutions']:
        cat = r['primaryBlocker']
        if cat == 'research_incomplete' and 'source_access' in r['secondaryBlockers']:
            cat = 'source_access'
        ev = r['specificFindingZh']
        if cat == 'source_access':
            ev += ' 此分类只指选定 Melon 正文请求受阻，其他来源研究仍未完成，不代表全网无图。'
        add(r, cat, 'i', ev, r['solutionStepsZh'],
            [source(s['url'], s['kind'], s['validation']) for s in r['factEvidence']],
            '选定正文受阻，独立来源待查' if cat == 'source_access' else '具体候选或版本问题已审',
            r['acceptanceCriteriaZh'], r['secondaryBlockers'])

    for w in inv['works']:
        for t in w['missingTuples']:
            r = dict(t, group=w['group'], song=w['song'])
            cat = INVENTORY_MAP[r['primaryProblem']]
            src = [source(s['url'], s.get('kind', '检索入口'), s.get('depth', '线索待查')) for s in w['concreteVerificationEntrypoints']]
            src += [source(s['url'], '该成员资料页：需定位目标章节', s.get('depth', '定位入口，目标章节未逐条验证')) for s in t['profileChapterLocators']]
            src += [source(s['sourcePageUrl'], '同一视频其他成员已采用来源：仅作定位', s['depth']) for s in w['existingSameVideoApprovedSources']]
            src += [source(s['url'], '本轮针对性查询', s.get('result', '已读正文')) for s in w.get('liveCheck', {}).get('sources', []) if s.get('url')]
            evidence = LABELS[cat] + '；' + {
                'known_named_member_profile_target_chapter_review_pending': '已找到该成员资料页入口，目标歌曲章节尚未完成逐图审核。',
                'existing_exact_video_source_target_member_review_pending': '同一精确视频已有其他成员获准图片，当前成员仍须独立查图注和原图，不能复制他人图片。',
                'individual_work_research_incomplete': '已完成关系、旧候选和本地文件索引核对，尚未完成这条关系的来源正文研究。',
                'official_archive_title_lead_body_pending': '官方档案标题存在候选线索，正文和目标成员图片尚未验证。',
            }.get(r['primaryProblem'], '具体旧候选及本轮限定检索记录保存在证据文件中，尚无通过全部采用条件的图片。')
            extra = t.get('currentSpecificSolution') or w.get('liveCheck', {}).get('specificSolution')
            if extra:
                evidence += ' ' + (extra if isinstance(extra, str) else json.dumps(extra, ensure_ascii=False))
            steps = [f"固定 {w['group']}《{w['song']}》 / {w['videoId']} / {r['stageName'] or r['memberName']}，不沿用当前团体阵容推断。", GENERIC_STEPS[cat]]
            if t['profileChapterLocators']:
                steps.append('优先逐个读取下面列出的成员资料页，检查歌曲标题与图片节点的实际先后位置、图注和原文件地址；不能只按父级标题批量配章。')
            if w['existingSameVideoApprovedSources']:
                steps.append('同视频已通过来源只提供页面/章节定位；逐一核实本条成员是否也有具名、有效尺寸的独立图片。')
            steps.append('具体检索词：' + '；'.join(t['memberSearchQueries']))
            steps.append('通过全部采用条件后进入 reviewed candidate → dry run → apply → 实际页面/原图验证；否则保留具体失败原因和新来源入口。')
            add(r, cat, 'inventory', evidence, steps, src, '目录与入口已核，目标正文待逐条查' if cat == 'research_incomplete' else '具体问题已登记，补图条件未满足')

    l = rows[key(lily)]
    l.update(problemEvidence=lily['newFinding'] + lily['remainingProblem'],
             steps=[lily['remediation'], GENERIC_STEPS['obscured_composition']],
             validationStage='网页章节误判已修正，原图质量未过',
             partialResolution='章节与图片的归属误判已纠正；不计为补图。')
    l['sources'].append(source(lily['sourceImageUrl'], '本轮实际取回并查看的原图', '1914×915；闭眼、头顶出框；未采用'))

    for r in admitted:
        row = rows[key(r)]
        row.update(status='resolved', validationStage='新原图已审并导入候选', stageName=r['catalogStageName'])
        row['resolution'] = dict(src=r['src'], sha256=r['sha256'], bytes=r['byteLength'], width=r['width'], height=r['height'], evidenceLevel=r['evidenceLevel'], batch='J', published=False)
        row['problemEvidence'] += ' 本轮已通过新的具名原图解决，旧问题记录保留供追溯。'
        row['steps'] = ['已完成：重新读取发布者正文和逐图姓名，确认同 MV 拍摄现场与唯一版本。',
                        '已完成：原文件尺寸、SHA256、实际 3:4 构图复核，使用 J 批 dry run / apply 导入既有关系。',
                        '已完成：新原图已随实现提交；发布候选尚未上线，正式线上仍为 v11。']
        row['sources'] += [source(r['sourcePageUrl'], '本轮通过的官方具名 MV 拍摄专题', '实际读取正文及图注；不是独立逐帧认证'), source(r['sourceImageUrl'], '本轮通过的原文件', '实际读取、尺寸/SHA/裁切审核')]
        if r.get('provenanceResolution'):
            row['steps'][0] += ' 旧审批哈希不覆盖；当前发布者文件以新 SHA 独立复核。'
        row['sources'] = unique_sources(row['sources'])

    frozen = {key(r): r for r in baseline['rows']}
    assert len(frozen) == 871 and set(rows) == set(frozen)
    for k, row in rows.items():
        assert row['ratingId'] == frozen[k]['ratingId']
        assert row['memberName'] == frozen[k]['memberName']
        assert row['group'] in frozen[k]['groups']
        assert row['steps'] and row['sources'] and row['acceptanceCriteria'] and row['problemEvidence']
    adopted = {key(r) for r in audit['identityImages']}
    resolved = {k for k, r in rows.items() if r['status'] == 'resolved'}
    assert set(frozen) & adopted == resolved == {key(r) for r in admitted}
    assert len(resolved) == 3 and len(rows) - len(resolved) == audit['summary']['missingRelationshipImages'] == 868
    current_missing = {(w['workId'], w['videoId'], r['memberId']) for w in audit['workCoverage'] for r in w['missingIdentityRelationships']}
    assert current_missing == set(frozen) - resolved, 'Current missing set differs from the open ledger'
    for tag, data in [('h', h), ('i', i), ('inventory', inv)]:
        assert data['baseAuditSha256'] == baseline['sourceAuditSha256'], tag
    entries = sorted(rows.values(), key=lambda r: (r['group'], r['song'], r['videoId'], r['stageName'], r['memberId']))
    summary = dict(frozen=871, resolved=3, remaining=868, works=len({r['workId'] for r in entries}), groups=len({r['group'] for r in entries}),
        byCategory=dict(Counter(r['primaryCategory'] for r in entries)),
        openByCategory=dict(Counter(r['primaryCategory'] for r in entries if r['status'] == 'open')),
        byEvidenceBucket=dict(Counter(r['evidenceFile'] for r in entries)),
        selectedMelonBlockedTuples=sum(r.get('selectedSourceAccessScope') == 'one_selected_melon_body_only' for r in i['tupleSolutions']))
    assert summary['works'] == 196 and summary['groups'] == 45
    assert sum(summary['byCategory'].values()) == 871
    report = dict(schemaVersion=1, checkedAt='2026-10-26', baselineCommit=baseline['sourceCommit'], baselineAuditSha256=baseline['sourceAuditSha256'],
        implementationCommit='4cba985af060284122ef46541df4ea9c1ade4e0c', categories=[dict(id=k, label=v) for k, v in CATEGORIES], summary=summary,
        rules=['871 是冻结关系数；一行一个精确作品/视频/成员关系，不是图片文件数。', '每条仅一个主要问题；次要问题可重叠，不能相加。',
               '研究未完成表示尚未取得通过门槛的证据，不等于全网无图。', '仅选定来源的 403/406 记访问受阻；其他来源仍可正常研究。',
               '原分工证据文件保持研究截止时状态；本总表和 J 回执记载随后实际导入。', '分类完整不等于逐条完整互联网研究或全部补图完成。'], entries=entries)
    write(HERE / 'ledger.json', report)
    columns = ['group', 'song', 'videoId', 'memberName', 'stageName', 'primaryCategory', 'sourcePrimaryProblem', 'status', 'validationStage', 'problemEvidence', 'steps', 'acceptanceCriteria', 'sources', 'workId', 'memberId', 'ratingId', 'evidenceFile']
    with (HERE / 'ledger.csv').open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns, lineterminator='\n')
        writer.writeheader()
        for row in entries:
            writer.writerow({c: json.dumps(row[c], ensure_ascii=False) if isinstance(row[c], (list, dict)) else row[c] for c in columns})
    checks = {
        'frozen871ExactTupleCoverage': True, 'duplicateTuples': 0, 'unexpectedTuples': 0,
        'missingSolutions': 0, 'idsAndNamesMatchFrozenBaseline': True, 'sourceFreezeMatchesAllThreeEvidenceBuckets': True,
        'allRowsHaveStepsSourcesAndAcceptanceConditions': True, 'onePrimaryCategoryPerTuple': True,
        'resolvedEqualsJDeltaAndCurrentAuditIntersection': True, 'remainingEqualsCurrentAudit': True,
        'openTupleSetExactlyMatchesCurrentAudit': True,
        'primaryCountsSum871': True, 'works196Groups45': True,
    }
    write(HERE / 'validation.json', dict(status='passed', checks=checks, summary=summary,
        ledgerSha256=hashlib.sha256((HERE / 'ledger.json').read_bytes()).hexdigest(),
        sourceHashes={p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.glob('evidence-*.json')}))
    print(json.dumps(dict(status='passed', **summary), ensure_ascii=False, indent=2))
    return report

if __name__ == '__main__':
    build()
