"""Recompute documented candidates only; never changes application data."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
source = ROOT / 'apps/idol-site/data/group-statistics-completion-evidence.json'
data = json.loads(source.read_text(encoding='utf-8'))
rows = data['groups']['fromis9']['sales']['evidence']['monthRows']
adjustments = [
    dict(year=2019, album='FUN FACTORY', annual=56121,
         primary='https://circlechart.kr/page_chart/album.circle?hitYear=2019&nationGbn=T&targetTime=2019&termGbn=year&yearTime=3',
         readable='https://bestsellingalbums.org/year-end/South_Korea_Top_Albums_2019',
         corroborating='https://kpopmerchandiseguide.com/discography/fromis-9-albums', rank=91),
    dict(year=2022, album='from our Memento Box', annual=158682,
         primary='https://circlechart.co.kr/page_chart/album.circle?hitYear=2022&nationGbn=T&targetTime=2022&termGbn=year&yearTime=3',
         readable='https://bestsellingalbums.org/album/62583', rank=92),
]
for item in adjustments:
    selected = [dict(rowIndex=i, **r) for i, r in enumerate(rows)
                if r['year'] == item['year'] and r['album'] == item['album']]
    item['replacedMonthlyRows'] = selected
    item['monthlySum'] = sum(r['sales'] for r in selected)
    item['delta'] = item['annual'] - item['monthlySum']
    item['sourceAccess'] = {'primary': 'search-index-only; direct-open returned chart shell',
                            'readable': 'full-page-read; secondary chart transcription'}
assert [x['monthlySum'] for x in adjustments] == [56468, 157872]
assert [x['delta'] for x in adjustments] == [-347, 810]
base = sum(r['sales'] for r in rows)
assert base == 1151613 and len(rows) == 39
candidate = base + sum(x['delta'] for x in adjustments)
assert candidate == 1152076
preserved = [r for r in rows if r['album'] in ['FUN FACTORY (KiT)', 'from our Memento Box (Weverse)', 'from our Memento Box (KiT)']]
assert sum(r['sales'] for r in preserved) == 39999

comparison = {
    'fromis9Chukkae': [115009,97615,142651,194535,194231,149702,23000,58135,55251,61257,36748,20480,22279],
    'triplesChukkae': [518253,352610,461413,337203,211609,35162,36144,55229,54857,32946],
    'triplesKoreanSalesAlbums': [32946,54857,55229,37213,34093,211609,337203,461024,379895,519628],
    'triplesKoreanSalesYears': [26063,157447,547232,854088,558585],
}
result = {
    'schemaVersion': 1, 'checkedAt': '2026-10-28', 'applicationDataModified': False,
    'baselineFile': str(source.relative_to(ROOT)),
    'baselineFileSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'fromis9': {'monthlyRows': len(rows), 'monthlySum': base, 'annualReplacements': adjustments,
               'preservedSeparateVersionRows': preserved, 'preservedSeparateVersionSum': 39999,
               'netDelta': 463, 'suggestedObservedValue': candidate, 'aggregateComparison': 1152076,
               'remainingAggregateDifference': 0,
               'recommendation': 'Keep all 39 original monthly rows; apply annual standard-edition replacements as a separate transparent reconciliation. Do not add annual rows to monthly rows. Label Korean Circle source-covered cumulative through July 2026, not global lifetime total.',
               'sourceMethodology': 'https://soridata.com/transparency.html',
               'scopeCaveat': 'Exact arithmetic reconstruction of the two displayed Soridata totals; no claim to independently inspect its private internal database or prove all worldwide sales.'},
    'comparisonTables': {key: {'values': val, 'sum': sum(val)} for key, val in comparison.items()},
    'triples': {'monthlyRows': 36, 'monthlySum': 2087073, 'artistAggregate': 2458789,
                'unresolvedDifference': 371716, 'recommendedRuntimeDelta': 0,
                'annualPerformanteCosmo2024': {'monthly': 286809, 'annualIndexed': 289224, 'delta': 2415},
                'status': 'Still open. A partial annual difference is insufficient; no scope/unit or double-count assumption accepted.'},
    'databaseDownload': {'url': 'https://soridata.com/en/database_download.html',
                         'status': 'Public page read; SQL download requires human CAPTCHA; no bypass attempted.',
                         'documentedFields': 'Artists releases includes sales; full SQL refreshed every six hours.',
                         'possibleUserHelp': 'User may manually download the SQL and provide the file for the two artist sales records.'},
}
(HERE / 'sales-reconciliation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'fromis9': candidate, 'netDelta': 463, 'preservedVersionSum': 39999,
                  'comparisonSums': {k: sum(v) for k,v in comparison.items()}}, ensure_ascii=False))
