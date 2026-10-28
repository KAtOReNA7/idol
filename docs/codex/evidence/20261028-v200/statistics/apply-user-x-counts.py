"""Apply only the five user-observed X counts to the v199 statistics data."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
TARGET = ROOT / 'apps/idol-site/data/group-statistics-completion-evidence.json'
OUT = Path(__file__).parent

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode()).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

observations = [
    ('genblue', 'https://x.com/GENBLUE_ten', '3277', 3277, 'user-reported-integer'),
    ('vvup', 'https://x.com/vvup_official', '2.9万', 29000, 'user-reported-rounded'),
    ('vcha', 'https://x.com/GIRLSETofficial', '3.8万', 38000, 'user-reported-rounded'),
    ('everglow', 'https://x.com/everglow_offcl', '1万', 10000, 'user-reported-rounded'),
    ('cherrybullet', 'https://x.com/cherrybullet', '18.5万', 185000, 'user-reported-rounded'),
]
before = json.loads(TARGET.read_text(encoding='utf-8'))
after = copy.deepcopy(before)
changes = []
for slug, url, raw, value, precision in observations:
    row = next(a for a in after['groups'][slug]['social'] if a['platform'] == 'x')
    assert row['url'] == url and row['accountExists'] is True
    assert row['observedValue'] is None, 'Do not import the same observation twice'
    old = copy.deepcopy(row)
    title = 'X · 用户人工观察（2026-10-28，原始显示 ' + raw + '；未独立抓取）'
    row.update(observedValue=value, displayValue=value, status='observed', rawDisplay=raw,
               precision=precision, observedAt='2026-10-28', checkedAt='2026-10-28',
               observedTimezone='Asia/Shanghai', sourceUrl=url, sourceTitle=title)
    row['sources'].append({
        'url': url, 'title': title, 'sourceDate': '2026-10-28', 'checkedAt': '2026-10-28',
        'timezone': 'Asia/Shanghai', 'kind': 'user-provided-observation',
        'rawDisplay': raw, 'precision': precision, 'independentlyFetched': False,
    })
    row['notes'] = [
        '用户于2026-10-28（Asia/Shanghai）人工查看上述X账号并提供人数；不是本轮独立自动抓取或实时计数。',
        '保留用户原文“' + raw + '”；' + ('按用户提供的整数保存。' if precision == 'user-reported-integer'
        else '换算数值仅用于现有万单位显示，不代表平台精确到个位的计数。'),
    ] + [note for note in old['notes'] if 'GIRLSET' in note or '旧公司EVERGLOW' in note]
    changes.append({'key': slug + '.x', 'accountIndex': after['groups'][slug]['social'].index(row),
                    'expectedBefore': old, 'proposedAfter': copy.deepcopy(row),
                    'expectedBeforeSha256Canonical': digest(old),
                    'proposedAfterSha256Canonical': digest(row)})

after['summary']['socialObserved'] = 153
after['summary']['socialFallbackZero'] = 0
assert sum(a['observedValue'] is None for g in after['groups'].values() for a in g['social']) == 0
assert sum(g[k]['observedValue'] is None for g in after['groups'].values() for k in ['sales', 'wins']) == 10
write(OUT / 'user-x-observations.json', {
    'schemaVersion': 1, 'recordedAt': '2026-10-28', 'timezone': 'Asia/Shanghai',
    'baseline': '21b12a6f0d49f355ee639ae87bb2b294ba58513f',
    'source': 'Direct user message in this Codex conversation; the five public X profile links and displayed counts were supplied by the user.',
    'scope': 'User-observed public follower counts only. No independent profile retrieval, private data, stage binding, sales or win changes.',
    'expectedBeforeSummary': before['summary'], 'proposedAfterSummary': after['summary'],
    'expectedBeforeDataSha256Canonical': digest(before),
    'proposedAfterDataSha256Canonical': digest(after),
    'changes': changes,
    'remainingUnknown': {'x': 0, 'sales': 7, 'wins': 3, 'total': 10},
    'unchanged': {'tripleSSales': 2092239, 'tripleSDifference': 366550, 'fromis9Sales': 1152076},
})
write(TARGET, after)
print(json.dumps({'applied': len(changes), 'unknownBefore': 15, 'unknownAfter': 10,
                  'beforeSha256Canonical': digest(before), 'afterSha256Canonical': digest(after)}))
