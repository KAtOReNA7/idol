import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

p = OUT / 'followup-candidates.json'
report = read(p)
queue_path = ROOT / report['input']['path']
queue = read(queue_path)
inventory_path = ROOT / 'apps/idol-site/data/stages/inventory.json'
inventory = {r['recordId']: r for r in read(inventory_path)['works']}
queries = read(OUT / 'followup-query-ledger.json')
by_query = {r['id']: r for r in queries['queries']}
by_work = {}
for key in ('records', 'legacyReplacementsRemaining'):
    for i, row in enumerate(queue[key]):
        by_work[row['workId']] = (key, i, row)

for row in report['records']:
    key, index, old = by_work[row['workId']]
    row['queue'] = 'new_gap' if key == 'records' else 'legacy_replacement'
    row['inputPointer'] = '/' + key + '/' + str(index)
    row['priorExclusion'] = {k: old.get(k) for k in ('category', 'sourceCategory', 'reason')}
    original = inventory[row['workId']]
    row['inventoryReference'] = {
        'path': str(inventory_path.relative_to(ROOT)).replace('\\', '/'),
        'workId': original['recordId'], 'groupIds': original['groupIds'],
        'versionLabel': original['version'], 'originalMV': original['mv'],
    }
    for video in row['candidateVideos']:
        video['url'] = 'https://www.youtube.com/watch?v=' + video['videoId']
        video['directYouTubeRequestedThisPass'] = False
        video['adopted'] = False
    row['eligibleForBinding'] = False
    if row['workId'] == 'recvxyHuKMDKAR':
        row['sources'] = [
            {'url': 'https://sports.khan.co.kr/en/article/202608040927007', 'access': 'Search索引', 'summary': '报道Lollapalooza合作演出，场合仍属音乐节；并非独立制作表演。'},
            {'url': 'https://riffmagazine.com/reviews/aespa-20261006/', 'access': 'Search索引', 'summary': 'Oakland演出报道属于SYNK COMPLæXITY巡演，不能当普通节目或练习室。'},
        ]
report['inventorySha256'] = sha(inventory_path)
write(p, report)

checks = [
    ('input_queue_hash_matches', sha(queue_path) == report['input']['sha256']),
    ('input_counts_109_and_11', len(queue['records']) == 109 and len(queue['legacyReplacementsRemaining']) == 11),
    ('nine_unique_work_ids', len(report['records']) == len({r['workId'] for r in report['records']}) == 9),
    ('eight_new_one_legacy', sum(r['queue'] == 'new_gap' for r in report['records']) == 8 and sum(r['queue'] == 'legacy_replacement' for r in report['records']) == 1),
    ('all_work_ids_in_public_inventory', all(r['workId'] in inventory for r in report['records'])),
    ('all_query_ids_resolve_to_correct_work', all(q in by_query and by_query[q]['workId'] == r['workId'] for r in report['records'] for q in r['queryIds'])),
    ('all_27_queries_covered_once', sorted(q for r in report['records'] for q in r['queryIds']) == sorted(by_query) and len(by_query) == 27),
    ('five_queries_returned_empty', sum(q['emptySearchResults'] for q in by_query.values()) == 5),
    ('raw_hash_matches', sha(ROOT / report['raw']['path']) == report['raw']['sha256']),
    ('public_html_hashes_match', all(sha(ROOT / r['htmlEvidence']['path']) == r['htmlEvidence']['sha256'] for r in report['records'] if 'htmlEvidence' in r)),
    ('exact_video_ids_have_valid_shape', all(re.fullmatch('[A-Za-z0-9_-]{11}', v['videoId']) for r in report['records'] for v in r['candidateVideos'])),
    ('zero_eligible_or_adopted', not any(r['eligibleForBinding'] or any(v['adopted'] for v in r['candidateVideos']) for r in report['records'])),
    ('original_mv_urls_preserved_as_inventory_reference', all(r['inventoryReference']['originalMV'] == inventory[r['workId']]['mv'] for r in report['records'])),
    ('all_records_have_version_completeness_performer_type_and_next_condition', all(all(r.get(k) for k in ('versionAssessment','completenessAssessment','performerAssessment','typeAssessment','nextCondition','priorExclusion')) for r in report['records'])),
]
validation = {
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'checks': [{'name': name, 'passed': passed} for name, passed in checks],
    'passed': sum(passed for _, passed in checks), 'failed': sum(not passed for _, passed in checks),
    'outputs': {str(x.relative_to(ROOT)).replace('\\','/'): sha(x) for x in (p, OUT / 'followup-query-ledger.json')},
    'scopeAttestation': 'Research-only subagent: did not access owner exports or user Chrome, did not directly request YouTube, did not modify application/bindings/private data or perform Git/deploy actions. These are declared action boundaries, not a full repository preservation test.',
}
write(OUT / 'followup-validation.json', validation)
print(json.dumps({'records':len(report['records']), 'queries':len(by_query), 'eligible':0, 'passed':validation['passed'], 'failed':validation['failed'], 'outputs':validation['outputs']}, ensure_ascii=False))
assert validation['failed'] == 0
