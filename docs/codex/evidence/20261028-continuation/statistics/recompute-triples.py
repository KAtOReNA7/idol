"""Read-only source audit. Writes evidence beside this script, never application data."""
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re

import requests
from bs4 import BeautifulSoup

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[4]
BASELINE = ROOT / 'apps/idol-site/data/group-statistics-completion-evidence.json'
CHECKED = '2026-10-28'

def digest(b):
    return sha256(b).hexdigest()

def dump(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')

SOURCE_SPECS = [
    ('performante-annual-2024', 'https://www.ptt.cc/bbs/KoreanPop/M.1736512580.A.BEF.html', '2025-01-10', '2024', ['289,224']),
    ('performante-month-2024-10', 'https://www.ptt.cc/bbs/KoreanPop/M.1730996662.A.A38.html', '2024-11-07', '2024-10', ['286,809', '41,362']),
    ('assemble24-month-2025-01', 'https://www.ptt.cc/bbs/KoreanPop/M.1738853569.A.FCB.html', '2025-02-06', '2025-01', ['9,888']),
    ('assemble25-month-2025-05', 'https://www.ptt.cc/bbs/KoreanPop/M.1749743919.A.6DE.html', '2025-06-12', '2025-05', ['351,416', '42,124']),
    ('assemble25-month-2025-08', 'https://www.ptt.cc/bbs/KoreanPop/M.1758213746.A.F94.html', '2025-09-19', '2025-08', ['15,134']),
    ('assemble25-month-2025-09', 'https://www.ptt.cc/bbs/KoreanPop/M.1760535210.A.F46.html', '2025-10-15', '2025-09', ['15,127']),
    ('assemble25-month-2025-11', 'https://www.ptt.cc/bbs/KoreanPop/M.1766068117.A.F25.html', '2025-12-18', '2025-11', ['22,316']),
    ('cosmo-annual-2025', 'https://www.soompi.com/article/1812104wpp/circle', '2026-01-14', '2025', ['406,744', '310,273']),
]

def capture_sources():
    records = []
    for sid, url, published, period, needles in SOURCE_SPECS:
        assert 'soridata' not in url.lower()
        response = requests.get(url, timeout=35)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        if 'ptt.cc/' in url:
            body = soup.find(id='main-content')
            assert body is not None
            lines = body.get_text('', strip=False).splitlines()
            rows = [re.sub(r'\s+', ' ', line).strip() for line in lines
                    if 'tripleS' in line and any(n in line for n in needles)]
        else:
            rows = [li.get_text(' ', strip=True) for li in soup.select('li')
                    if 'tripleS' in li.get_text() and any(n in li.get_text() for n in needles)]
        assert all(any(n in row for row in rows) for n in needles), (sid, rows)
        # Retain only the necessary chart rows, never the entire copyrighted article,
        # commenter text, posting IPs, cookies or response headers.
        records.append({
            'id': sid, 'url': url, 'finalUrl': response.url,
            'publishedAt': published, 'chartPeriod': period,
            'checkedAt': datetime.now(timezone.utc).isoformat(),
            'sourceType': 'third-party-chart-transcription' if 'ptt.cc/' in url else 'third-party-chart-report',
            'access': 'full-page-read-via-public-https', 'httpStatus': response.status_code,
            'responseBytes': len(response.content), 'responseSha256': digest(response.content),
            'exactRelevantRows': rows, 'retention': 'minimal relevant chart rows only; no full article stored',
            'independence': 'Reproduces Circle chart; not an independent measurement of sales.'
        })
    return records

def main():
    original_bytes = BASELINE.read_bytes()
    doc = json.loads(original_bytes)
    before = deepcopy(doc['groups']['triples']['sales'])
    rows = before['evidence']['monthRows']
    assert len(rows) == 36
    monthly_sum = sum(row['sales'] for row in rows)
    assert monthly_sum == before['observedValue'] == before['displayValue'] == 2087073
    assert before['evidence']['recomputedSum'] == monthly_sum
    assert all(isinstance(r['sales'], int) and r['sales'] >= 0 for r in rows)
    assert all(f"{r['year']:04}-{r['month']:02}" <= CHECKED[:7] for r in rows)
    keys = [(r['year'], r['month'], r['album']) for r in rows]
    assert len(set(keys)) == len(keys)
    captures = capture_sources()
    by_id = {r['id']: r for r in captures}
    replacements = []
    definitions = [
        (2024, 'Visionary Vision <Performante> (Cosmo)', 289224, 81, [20],
         ['performante-month-2024-10'], 'performante-annual-2024',
         'https://circlechart.kr/page_chart/album.circle?hitYear=2024&nationGbn=T&targetTime=2024&termGbn=year&yearTime=3'),
        (2025, '<ASSEMBLE25> (Cosmo)', 406744, 57, [9, 10, 11, 12],
         ['assemble25-month-2025-11', 'assemble25-month-2025-09', 'assemble25-month-2025-08', 'assemble25-month-2025-05'],
         'cosmo-annual-2025',
         'https://circlechart.kr/page_chart/album.circle?hitYear=2025&nationGbn=T&targetTime=2025&termGbn=year&yearTime=3'),
    ]
    expected_rows = {
        20: {'year': 2024, 'month': 10, 'sales': 286809, 'album': 'Visionary Vision (Cosmo)'},
        9: {'year': 2025, 'month': 11, 'sales': 22316, 'album': '(Cosmo)'},
        10: {'year': 2025, 'month': 9, 'sales': 15127, 'album': '(Cosmo)'},
        11: {'year': 2025, 'month': 8, 'sales': 15134, 'album': '(Cosmo)'},
        12: {'year': 2025, 'month': 5, 'sales': 351416, 'album': '(Cosmo)'},
    }
    for year, album, annual, rank, indices, source_ids, annual_id, primary in definitions:
        for i in indices:
            assert rows[i] == expected_rows[i]
        selected = [{'rowIndex': i, **rows[i]} for i in indices]
        row_sum = sum(r['sales'] for r in selected)
        mappings = []
        for i, source_id in zip(indices, source_ids):
            source = by_id[source_id]
            exact = next(r for r in source['exactRelevantRows'] if f"{rows[i]['sales']:,}" in r and '(Cosmo)' in r)
            mappings.append({'rowIndex': i, 'expectedBefore': rows[i], 'resolvedAlbum': album,
                             'sourceId': source_id, 'sourceUrl': source['url'], 'exactSourceRow': exact,
                             'matchBasis': 'same artist, chart year/month, exact sales number, full album title and Cosmo version'})
        replacements.append({
            'year': year, 'album': album, 'annual': annual, 'rank': rank,
            'primary': primary, 'readable': by_id[annual_id]['url'],
            'replacedMonthlyRows': selected, 'monthlySum': row_sum, 'delta': annual - row_sum,
            'titleMappings': mappings,
            'sourceAccess': {'primary': ('search-index-only; direct annual-chart open returned shell' if year == 2024 else '2025 annual URL not read directly; dated Soompi annual report supplies the year total. Official November search index separately corroborates title/value; its direct open returned shell.'),
                             'readable': 'full-page-read; dated third-party Circle chart reproduction/report',
                             'monthly': 'full-page-read; dated PTT reproductions of the exact month charts'},
            'annualSourceId': annual_id,
            'method': 'replace same-year same-version covered monthly rows with annual total; never add annual total to those rows',
        })
    indices = [x['rowIndex'] for rep in replacements for x in rep['replacedMonthlyRows']]
    assert len(indices) == len(set(indices)) == 5
    net_delta = sum(rep['delta'] for rep in replacements)
    assert [r['delta'] for r in replacements] == [2415, 2751]
    reconciled = monthly_sum + net_delta
    retained_sum = sum(row['sales'] for i, row in enumerate(rows) if i not in indices)
    assert retained_sum + sum(rep['annual'] for rep in replacements) == reconciled == 2092239
    aggregate = 2458789  # Stored comparison only. Soridata is intentionally not requested.
    residual = aggregate - reconciled
    assert residual == 366550
    after = deepcopy(before)
    after.update(observedValue=reconciled, displayValue=reconciled, rawDisplay=f'{reconciled:,}+', checkedAt=CHECKED,
                 scope='tripleS及该来源归入tripleS的子团韩国Circle公开月榜36行，加2024年Performante Cosmo与2025年ASSEMBLE25 Cosmo同年同版年榜替换修正；截至2026-06的来源覆盖下界，不是全球完整累计。')
    after['notes'][-1] = '历史基线（2026-10-25）：' + before['notes'][-1]
    after['notes'] += [
        '2026-10-28逐版复算：2024年Performante Cosmo年榜289,224替换同年月和286,809（+2,415）；2025年ASSEMBLE25 Cosmo年榜406,744替换同年月和403,993（+2,751），净修正+5,166，累计2,092,239。36条原月行保留，不把年榜重复相加。',
        '5/8/9/11月的ASSEMBLE25完整标题、Cosmo版本及各月数量已由可读具名月榜转录核对；2025年1月9,888为ASSEMBLE24 Cosmo，保持独立。Performante标准版、ASSEMBLE25标准/WITHVUU及Beyond Beauty跨年记录均未并入这两项年榜。',
        '与已保存的艺人汇总2,458,789仍差366,550，来源差异继续开放。该汇总本轮未重新访问；不得将局部修正写成全团累计已完整闭合，也不混加日本、Hanteo或Retail。',
        '年榜及月榜依据可读第三方Circle转录/报道；2024年榜与2025年11月有官方搜索索引交叉核对。官方直读仅返回页面框架，不宣称完整官方榜已读取。'
    ]
    for source in captures:
        after['sources'].append({'url': source['url'], 'title': source['id'] + ' · Circle榜单具名转录/报道',
                                 'sourceDate': source['chartPeriod'], 'checkedAt': CHECKED, 'kind': 'third-party-public',
                                 'access': 'full-page-read', 'sha256': source['responseSha256']})
    after['sources'] += [
        {'url': definitions[0][-1], 'title': 'Performante Cosmo · Circle 2024年榜官方索引', 'sourceDate': '2024', 'checkedAt': CHECKED, 'kind': 'primary-chart', 'access': 'search-index-only'},
        {'url': 'https://circlechart.kr/page_chart/album.circle?hitYear=2025&nationGbn=T&targetTime=11&termGbn=month&yearTime=3', 'title': 'ASSEMBLE25 Cosmo · Circle 2025年11月官方索引', 'sourceDate': '2025-11', 'checkedAt': CHECKED, 'kind': 'primary-chart', 'access': 'search-index-only'},
    ]
    after['evidence'].update(recomputedSum=reconciled, monthlyRecomputedSum=monthly_sum, annualReplacements=replacements,
        sourceDifferenceReview={'checkedAt': CHECKED, 'status': 'partially-resolved', 'monthlySum': monthly_sum,
                               'annualNetAdjustment': net_delta, 'reconciledSum': reconciled,
                               'aggregateTotal': aggregate, 'remainingDifference': residual,
                               'aggregateAccess': 'previously stored observation only; not fetched in this audit',
                               'reason': 'Two disjoint same-year Cosmo annual replacements are verified; artist aggregate remains unexplained by 366550. No assumption about missing subunits, Japan or alternate counting systems is accepted.'})
    assert after['evidence']['monthRows'] == before['evidence']['monthRows']
    assert after['evidence']['previousEvidence'] == before['evidence']['previousEvidence']
    base_sha = digest(original_bytes)
    source_evidence = {'schemaVersion': 1, 'checkedAt': CHECKED, 'scope': 'Five replacement monthly rows, two annual totals and exact exclusion of January ASSEMBLE24; arithmetic/structure checks on all 36 saved rows. Not a fresh source read of all 36 monthly rows.',
                       'captures': captures,
                       'officialAccess': {'2024Annual': 'search-index-only; direct open returned chart shell', '2025November': 'search-index-only; direct open returned chart shell',
                                          'mismatchedUrlExcluded': 'Official search results with targetTime=2023 or 2024 but content headed 2025 were not used as annual authority. 2025 annual is from the dated Soompi report.'},
                       'restrictions': {'soridataRequests': 0, 'captchaBypass': False, 'futurePeriodsUsed': False, 'applicationDataModified': False}}
    dump('source-evidence.json', source_evidence)
    by_year = defaultdict(int)
    for row in rows:
        by_year[row['year']] += row['sales']
    recompute = {'schemaVersion': 1, 'checkedAt': CHECKED, 'baselineFile': str(BASELINE.relative_to(ROOT)).replace('\\', '/'),
                 'baselineFileSha256': base_sha, 'baselineContext': 'Parent fast-forwarded PR44 HEAD 4f2a57bd before this read.',
                 'monthRows': [{'rowIndex': i, **row} for i, row in enumerate(rows)],
                 'rowCount': len(rows), 'uniqueYearMonthStoredTitleCount': len(set(keys)),
                 'yearSums': dict(sorted(by_year.items())), 'monthlySum': monthly_sum,
                 'titleQuality': {'emptyStoredTitleRows': [i for i,r in enumerate(rows) if not r['album']],
                                  'parenthesesOnlyStoredTitleRows': [i for i,r in enumerate(rows) if r['album'].startswith('(')]},
                 'annualReplacements': replacements, 'replacedRowIndices': sorted(indices), 'retainedRowCount': len(rows)-len(indices),
                 'retainedRowSum': retained_sum, 'annualReplacementSum': sum(r['annual'] for r in replacements),
                 'netDelta': net_delta, 'proposedObservedValue': reconciled, 'storedAggregateComparison': aggregate,
                 'remainingDifference': residual, 'differenceStatus': 'open',
                 'assemble25CumulativeCrossCheck': {'may': 351416, 'august': 369301, 'september': 384428, 'november': 406744,
                    'mayPlusAugustMonthly': 366550, 'uncoveredNetBeforeAugust': 2751,
                    'augustPlusSeptemberMonthly': 384428, 'septemberPlusNovemberMonthly': 406744,
                    'interpretation': 'Cumulative chain independently corroborates the replacement arithmetic; it does not identify which omitted month or revision produced the net 2751.'},
                 'excludedRows': [{'rowIndex': 16, 'expectedBefore': rows[16], 'resolvedAlbum': '<ASSEMBLE24> (Cosmo)',
                                   'reason': 'Different release; exact January 2025 dated chart names ASSEMBLE24.', 'sourceId': 'assemble24-month-2025-01'},
                                  {'rowIndices': [13,14,21], 'reason': 'Separate standard/WITHVUU versions; retain unchanged.'},
                                  {'rowIndices': [3,4,5,6,7,8], 'reason': 'Beyond Beauty release and cross-year rows remain independent; 2025 Cosmo 36746+273527=310273, 2026 Cosmo 16587+14476+6660=37723; no replacement delta applied.'}],
                 'applied': False, 'applicationDataModified': False,
                 'checks': {'raw36RowsPreserved': True, 'previousEvidencePreserved': True, 'disjointReplacementRows': True,
                            'noAnnualMonthlyDoubleCount': True, 'allRowPeriodsOnOrBeforeAuditDate': True,
                            'protectedUnselected31RowsRetainedOnce': True}}
    dump('recomputation.json', recompute)
    delta = {'schemaVersion': 1, 'checkedAt': CHECKED, 'status': 'reviewed-proposal-not-applied',
             'targetFile': str(BASELINE.relative_to(ROOT)).replace('\\', '/'), 'expectedFileSha256': base_sha,
             'path': ['groups','triples','sales'], 'expectedBeforeSha256Canonical': digest(canonical(before)),
             'expectedBefore': before, 'proposedAfter': after,
             'proposedAfterSha256Canonical': digest(canonical(after)),
             'expectedObservedValue': 2087073, 'proposedObservedValue': 2092239, 'netDelta': 5166,
             'integrationRule': 'Apply only if the complete expectedBefore object is equal. Whole-file SHA is context and must be reviewed if unrelated parallel changes alter it. Preserve all other groups and fields. This script does not apply the proposal.',
             'evidenceFiles': ['source-evidence.json','recomputation.json','official-index-check.json'],
             'limitations': ['Residual 366550 remains open.', '2025 annual read is a dated secondary report, not a complete direct official chart read.', 'No Soridata request; stored comparison is not a refreshed observation.', 'All 36 saved rows were recomputed, but only the targeted rows were freshly source-verified.']}
    dump('triples-sales-proposal.json', delta)
    assert BASELINE.read_bytes() == original_bytes
    print(json.dumps({'sourcesCaptured': len(captures), 'monthlyRows': len(rows), 'before': monthly_sum, 'netDelta': net_delta, 'proposedAfter': reconciled, 'remainingDifference': residual, 'baselineFileSha256': base_sha, 'applicationDataModified': False}, ensure_ascii=False))

if __name__ == '__main__':
    main()
