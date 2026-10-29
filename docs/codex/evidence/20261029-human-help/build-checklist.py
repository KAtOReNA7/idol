"""Build a read-only, per-group human-help view of the frozen v201 queues."""
import csv
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
DOCS = ROOT / 'docs/codex'
KINDS = {
    'person': '成员参与待证',
    'timeline': '生效日期待证',
    'statistics_wins': '一位总数待证',
    'statistics_sales': '销量待证',
    'sales_reconciliation': '销量差额核对',
    'photo_quality': '照片提质／同套证据',
}
CSV_HEADERS = [
    '团体', '问题类别', '作品或项目', '版本', '缺少的信息', '可提供的帮助',
    '站内/资料链接', '原视频', '我的补充', '补充来源', '时间点或截止日',
]


def require_unfilled_csv(path):
    """Refuse regeneration if it could erase an answer or unreadable input."""
    if not path.exists():
        return
    try:
        with path.open(encoding='utf-8-sig', newline='') as handle:
            reader = csv.reader(handle, strict=True)
            if next(reader, None) != CSV_HEADERS:
                raise ValueError(f'{path}: CSV表头不匹配；已停止生成，未改写任何产物。')
            for row in reader:
                if len(row) != len(CSV_HEADERS):
                    raise ValueError(f'{path}: 第{reader.line_num}行列数不匹配；已停止生成，未改写任何产物。')
                if any(row[-3:]):
                    raise ValueError(f'{path}: 第{reader.line_num}行含人工补充；请先核查并保留原文件，未改写任何产物。')
    except (csv.Error, UnicodeError) as error:
        raise ValueError(f'{path}: CSV无法安全读取；已停止生成，未改写任何产物。') from error


def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8'))


def cell(value):
    return str(value or '').replace('|', '\\|').replace('\n', '<br>')


def main():
    require_unfilled_csv(DOCS / 'human-help-by-group-20261029.csv')
    stages, others = read('stage-checklist.json'), read('other-checklist.json')
    groups = {}
    for source in (stages, others):
        for group in source['groups']:
            name = group['name']
            if name in ('VCHA', 'GIRLSET', 'VCHA/GIRLSET', 'VCHA / GIRLSET'):
                name = 'VCHA／GIRLSET'
            groups.setdefault(name, []).extend(group['items'])
    groups = dict(sorted(groups.items(), key=lambda pair: pair[0].casefold()))
    rows = [dict(group=name, **item) for name, items in groups.items() for item in items]
    raw_stages = json.loads((DOCS / 'evidence/20261028-post-v200/remaining-stage-ledger.json').read_text(encoding='utf-8'))
    raw_others = json.loads((DOCS / 'evidence/20261028-post-v200/remaining-person-statistics.json').read_text(encoding='utf-8'))
    stage_rows = [row for row in rows if row['kind'] in ('新增舞台缺口', '旧来源待替换')]
    assert len(stage_rows) == 120
    assert Counter(row['workId'] for row in stage_rows) == Counter(
        [row['workId'] for row in raw_stages['records']] +
        [row['recordId'] for row in raw_stages['legacyReplacementsRemaining']]
    )
    assert sum(row['kind'] == '新增舞台缺口' for row in rows) == 109
    assert sum(row['kind'] == '旧来源待替换' for row in rows) == 11
    assert len(raw_others['remainingPersonWorks']) == 24
    assert len(raw_others['unknownMetrics']) == 7
    assert len(raw_others['effectiveDateHolds']) == 7
    assert Counter(row['workId'] for row in rows if row['kind'] == 'person') == Counter(row['workId'] for row in raw_others['remainingPersonWorks'])
    assert Counter(row['key'] for row in rows if row['kind'] in ('statistics_wins', 'statistics_sales')) == Counter(row['key'] for row in raw_others['unknownMetrics'])
    assert Counter(row['eventId'] for row in rows if row['kind'] == 'timeline') == Counter(row['eventId'] for row in raw_others['effectiveDateHolds'])
    event_titles = {row['eventId']: row['title'] for row in raw_others['effectiveDateHolds']}
    for items in groups.values():
        for item in items:
            item['kindLabel'] = KINDS.get(item['kind'], item['kind'])
            item['displayTitle'] = item.get('song') or event_titles.get(item.get('eventId')) or item.get('title') or item['kindLabel']
    names_without_queue = ['ADYA', 'BADVILLAIN', 'Billlie', 'Cherry Bullet', 'EVERGLOW', 'RESCENE']
    assert len(groups) == 45, list(groups)

    text = [
        '# 按团体的人工补充清单（2026-10-29，v201）',
        '',
        '这份表只整理当前已发布 v201 后保留的待补队列，不重复索取已经解决的内容。45 个团体有待办，另外 6 团未进入这批待补队列。舞台按精确作品／版本记录统计，同一首歌可有多个版本；不同问题也可能落在同一作品上，不能把各类数量相加当作缺歌总数。',
        '',
        '当前：109 项新增舞台来源、11 项旧来源替换、24 作品逐名参与证据、7 项未知统计、7 项实际生效日期，以及 tripleS 的 350,635 张汇总差额。HITGS 同套证据和 MADEIN 原图分辨率限制另外列出。既有成员关系认人图缺口与旧低清缺口均为 0；24 待证作品已经有通用认人参考，缺的是本作参与证据。',
        '',
        '## 你可以怎样补充',
        '',
        '- 舞台：发视频链接即可；记得节目名称、播出日期或全曲章节时可一起写。优先电视台常规打歌，其次完整官方练习室（同条件固定机位优先），再其次完整官方制作表演。保留同曲、语种、编配和完整范围；合作曲成员版可以作为后备，但要注明客串差异。',
        '- 人物：发“作品／版本＋成员姓名＋时间点”，或具名幕后、封套、录音署名。目视出镜、录音参与、创作和导演是不同事实，会分别记录；不要求你写研究报告。',
        '- 统计：数字＋截止日期＋来源；销量请保留 Circle Album／Retail／Hanteo 等原口径。未知显示为 0 不等于事实已证为零，不需要凭印象证明从未获奖。',
        '- 日期：若手头有公司／本人原公告，提供链接或完整截图即可；报道已展示，缺的是实际生效日期。',
        '- 图片：官方或民间均可，提供完整同套图集与逐张姓名，清晰、能认人即可。',
        '',
        '只补你熟悉的部分。混音可能没有独立舞台，长期统计也可能没有公开完整数据；没有线索可以继续保留待新证据。已有评分和绑定不会因为收到候选链接就直接改动。',
        '',
        '## 最适合先人工核对的项目',
        '',
        '| 团体 | 具体任务 | 入口 |',
        '| --- | --- | --- |',
        '| KATSEYE | 《Gnarly》练习室与原MV是否消音、换词或删段；指出时间点。 | [练习室](https://www.youtube.com/watch?v=xrm7PP1mbtI)／[原MV](https://www.youtube.com/watch?v=R2-yomhYAj4) |',
        '| izna | 在约491秒的官方合集里定位《BEEP》日版的完整起止章节，确认语种和场合。 | [Costume视频](https://www.youtube.com/watch?v=Qfez0Db9Iqc) |',
        '| PURPLE KISS | 《DOREMI》英文录音幕后中，具名成员字幕／时间点。 | [英语录音幕后](https://www.youtube.com/watch?v=TGbfk7AEIzk) |',
        '| ifeye | 《loverfory》原说明是否署名RAHEE导演；也可提供具名出镜时间点，角色分开记录。 | [目标视频](https://www.youtube.com/watch?v=ecQSl-6NSTA) |',
        '| MADEIN | 《PUNG!》当期实际参与名单；另求同套更高清具名图。 | [目标MV](https://www.youtube.com/watch?v=aer_X9NmhTc) |',
        '| HITGS | 完整5人、逐张具名的同套图集。现有图可认人，但同次拍摄未独立证实。 | [CHARIZZMA整理](https://kpopofficial.com/hitgs-single-album-charizzma-comeback-updates/) |',
        '| ITZY | 《Voltage》需要更完整来源：现Special Dance Clip约160秒，发行约221秒，差约61秒。 | [现短版](https://www.youtube.com/watch?v=5uQuUCW-9aI) |',
        '| ILLIT | 《It’s Me》原记录是约60秒Performance；确认是否本就要保留这个短版范围。完整节目约149秒，不能直接当同范围替换。 | [原Performance](https://www.youtube.com/watch?v=el7A_SI7sxs)／[Music Bank](https://www.youtube.com/watch?v=F1ISRhRo3Vc) |',
        '',
        '## 分团总览',
        '',
        '| 团体 | 新舞台缺口 | 旧源替换 | 其他问题 |',
        '| --- | ---: | ---: | --- |',
    ]
    for name, items in groups.items():
        counts = Counter(item['kind'] for item in items)
        other = '；'.join(f'{KINDS.get(kind, kind)} {count}' for kind, count in counts.items() if kind not in ('新增舞台缺口', '旧来源待替换')) or '—'
        text.append(f"| {name} | {counts['新增舞台缺口']} | {counts['旧来源待替换']} | {other} |")
    text.extend([
        '',
        '未进入当前队列：' + '、'.join(names_without_queue) + '。这表示当前清单没有对应待办，不等于本轮重新全量验过每个细节。',
        '',
        '## 逐团详细待办',
        '',
    ])
    for name, items in groups.items():
        text.extend([f'### {name}', '', '| 类别 | 作品／版本或事件 | 目前缺什么 | 你能补充什么 |', '| --- | --- | --- | --- |'])
        for item in items:
            label = item['displayTitle']
            version = item.get('version')
            if version and version not in ('原版', '原作品未另标版本'):
                label += f'（{version}）'
            if item.get('link'):
                label = f"[{cell(label)}]({item['link']})"
            else:
                label = cell(label)
            if item.get('originalVideoUrl'):
                label += f" · [原视频]({item['originalVideoUrl']})"
            if item.get('candidateLink'):
                label += f" · [待核资料]({item['candidateLink']})"
            text.append(f"| {cell(item['kindLabel'])} | {label} | {cell(item['problem'])} | {cell(item['help'])} |")
        text.append('')
    text.extend([
        '## 补充格式', '',
        '可以直接在聊天中回复，不必填写所有团体：', '',
        '```text',
        '团体：',
        '歌曲／版本或统计项目：',
        '链接／截图：',
        '我的补充：',
        '相关时间点／统计截止日（知道再填）：',
        '```', '',
        'VVUP 的 1,787、UDTT 的 103、Geenius 的 217 已有对应统计周期的来源，但只是不完整下界。若恰有更完整的逐专辑销量表，可以补强；它们不再算“完全未取得数字”。个人页统一排版仍是独立待决定事项。', '',
        '## 范围与追溯', '',
        '- 来源：[舞台冻结队列](evidence/20261028-post-v200/remaining-stage-ledger.json)、[人物／统计／日期冻结队列](evidence/20261028-post-v200/remaining-person-statistics.json)。',
        '- 当前上线状态：[v201发布回执](evidence/20261028-post-v200/release-publication.json)。冻结队列内历史local-only状态不代表当前未上线。',
        '- 对照数据：[按团舞台清单](evidence/20261029-human-help/stage-checklist.json)、[按团其他问题](evidence/20261029-human-help/other-checklist.json)。',
        '- 本轮只生成说明与可填写CSV，没有改应用、私人记录或再次部署。',
    ])
    report = DOCS / 'human-help-by-group-20261029.md'
    report.write_text('\n'.join(text) + '\n', encoding='utf-8', newline='\n')
    csv_path = DOCS / 'human-help-by-group-20261029.csv'
    with csv_path.open('w', encoding='utf-8-sig', newline='') as handle:
        writer = csv.writer(handle, lineterminator='\n')
        writer.writerow(CSV_HEADERS)
        for row in rows:
            kind_label = KINDS.get(row['kind'], row['kind'])
            title = row.get('song') or event_titles.get(row.get('eventId')) or row.get('title') or kind_label
            writer.writerow([row['group'], kind_label, title, row.get('version', ''), row['problem'], row['help'], row.get('link', ''), row.get('originalVideoUrl') or row.get('candidateLink', ''), '', '', ''])
    result = {'groupsWithItems': len(groups), 'groupsWithoutCurrentItems': names_without_queue, 'itemsByKind': dict(Counter(row['kind'] for row in rows)), 'stageWorkIdExactSetMatches': True, 'report': report.relative_to(ROOT).as_posix(), 'csv': csv_path.relative_to(ROOT).as_posix(), 'applicationChanged': False, 'deployed': False}
    (HERE / 'validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
