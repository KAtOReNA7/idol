"""Bounded public-only Circle readback; no application or frozen evidence writes."""
import datetime
import hashlib
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
APPLICATION = ROOT / 'apps/idol-site/data/group-statistics-completion-evidence.json'
OUTPUT = HERE / 'statistics-research.json'
TARGETS = [(2023, 48), (2023, 52), (2024, 4), (2024, 49),
           (2024, 50), (2025, 7), (2025, 27), (2026, 5)]


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def main():
    raw_application = APPLICATION.read_bytes()
    groups = json.loads(raw_application)['groups']
    sale = groups['triples']['sales']
    assert sale['observedValue'] == 2113229
    assert sale['asOf'] == '2026-06'
    assert len(sale['evidence']['weeklyAdditions']) == 13
    if OUTPUT.exists():
        raise SystemExit('Preserve existing research output; do not repeat or overwrite this run.')
    known = {}
    for path in (ROOT / 'docs/codex/evidence').rglob('*.json'):
        if path.parent == HERE:
            continue
        if not any(key in str(path).lower() for key in ['statistic', 'circle', 'triples']):
            continue
        try:
            doc = json.loads(path.read_text(encoding='utf-8'))
        except (ValueError, UnicodeError):
            continue
        for value in strings(doc):
            if not value.startswith('https://circlechart.kr/page_chart/album.circle?'):
                continue
            query = urllib.parse.parse_qs(urllib.parse.urlparse(value).query)
            if query.get('termGbn') != ['week']:
                continue
            try:
                key = (int(query['hitYear'][0]), int(query['targetTime'][0]))
            except (ValueError, KeyError):
                continue
            known.setdefault(key, set()).add(path.relative_to(ROOT).as_posix())
    result = {
        'schemaVersion': 1,
        'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'baselineCommit': '553448da',
        'baselinePath': APPLICATION.relative_to(ROOT).as_posix(),
        'baselineFileSha256': hashlib.sha256(raw_application).hexdigest(),
        'baseline': {
            'observedValue': sale['observedValue'], 'asOf': sale['asOf'],
            'monthRows': len(sale['evidence']['monthRows']),
            'annualReplacements': len(sale['evidence']['annualReplacements']),
            'weeklyAdditions': len(sale['evidence']['weeklyAdditions']),
            'retainedReferenceAggregate': 2458789, 'unexplainedDifference': 345560,
            'existingWeeklyIdentityTuples': [[x['year'], x['week'], x['albumId'], x['sales']]
                                            for x in sale['evidence']['weeklyAdditions']]
        },
        'unknownFieldInventory': [
            {'key': slug + '.' + metric, 'observedValue': None,
             'displayValue': value['displayValue'], 'status': value['status']}
            for slug, group in groups.items() for metric, value in group.items()
            if isinstance(value, dict) and value.get('observedValue', 'missing') is None
        ],
        'method': 'Eight unqueried adjacent Circle Album weeks; only same-edition disjoint Album_CNT may contribute. No Total_CNT, Retail, Hanteo, Japan or future cutoff contributions.',
        'circleReadbacks': [], 'proposals': [],
        'applicationWrites': 0, 'privateReadsOrWrites': 0, 'deployments': 0
    }
    for year, week in TARGETS:
        record = {'year': year, 'week': week,
                  'priorQueryFiles': sorted(known.get((year, week), []))}
        if record['priorQueryFiles']:
            record['status'] = 'skipped_prior_query'
            result['circleReadbacks'].append(record)
            continue
        params = {'nationGbn': 'T', 'termGbn': 'week', 'hitYear': str(year),
                  'targetTime': f'{week:02}', 'yearTime': '3'}
        page = 'https://circlechart.kr/page_chart/album.circle?' + urllib.parse.urlencode(params)
        params['curUrl'] = page.removeprefix('https://')
        record.update(sourceUrl=page, endpoint='https://circlechart.kr/data/api/chart/album',
                      parameters=params, checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
        try:
            html = urllib.request.urlopen(page, timeout=20).read()
            assert b'/data/api/chart/album' in html
            request = urllib.request.Request(record['endpoint'], data=urllib.parse.urlencode(params).encode())
            response = urllib.request.urlopen(request, timeout=20)
            raw = response.read()
            rows = json.loads(raw).get('List', [])
            if isinstance(rows, dict):
                rows = list(rows.values())
            labels = re.findall(r'<option[^>]*value=["\'](\d{6})["\'][^>]*>(.*?)</option>', html.decode(), re.S)
            record.update(status='read', httpStatus=response.status,
                          pageSha256=hashlib.sha256(html).hexdigest(), responseSha256=hashlib.sha256(raw).hexdigest(),
                          rowCount=len(rows),
                          periodLabels=[re.sub('<[^>]+>', '', label).strip()
                                        for value, label in labels if value == f'{year}{week:02}'],
                          selectedRows=[row for row in rows if 'triples' in str(row).lower()])
        except Exception as error:
            record.update(status='failed', error=str(error))
        result['circleReadbacks'].append(record)
        OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(record, ensure_ascii=True), flush=True)
        if any(code in record.get('error', '') for code in ['403', '429', '412']):
            break
    assert APPLICATION.read_bytes() == raw_application
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
