"""Read five bounded official chart leads; never changes application data."""
import datetime
import hashlib
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request

OUT = Path(__file__).resolve().parent / 'triples-followup-observations.json'
ENDPOINT = 'https://circlechart.kr/data/api/chart/album'
PERIODS = [('week', 2023, 51), ('week', 2025, 5), ('week', 2025, 6),
           ('week', 2025, 26), ('month', 2024, 10)]
records = []
for term, year, period in PERIODS:
    params = {'nationGbn': 'T', 'termGbn': term, 'hitYear': str(year),
              'targetTime': f'{period:02}', 'yearTime': '3'}
    page = 'https://circlechart.kr/page_chart/album.circle?' + urllib.parse.urlencode(params)
    params['curUrl'] = page.removeprefix('https://')
    record = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'term': term, 'year': year, 'period': period, 'sourceUrl': page,
              'endpoint': ENDPOINT, 'parameters': params,
              'lead': 'Exact chart-period references in TripleS discography; secondary totals are not adopted.'}
    try:
        html = urllib.request.urlopen(page, timeout=20).read()
        assert b'/data/api/chart/album' in html
        response = urllib.request.urlopen(urllib.request.Request(
            ENDPOINT, data=urllib.parse.urlencode(params).encode()), timeout=20)
        raw = response.read()
        payload = json.loads(raw)
        rows = payload.get('List', [])
        rows = list(rows.values()) if isinstance(rows, dict) else rows
        text = html.decode('utf-8')
        options = re.findall(r'<option[^>]*value=[\"\'](\d{6})[\"\'][^>]*>(.*?)</option>', text, re.S)
        record.update(httpStatus=response.status, pageSha256=hashlib.sha256(html).hexdigest(),
                      responseSha256=hashlib.sha256(raw).hexdigest(), rowCount=len(rows),
                      selectedRows=[r for r in rows if 'triples' in str(r).lower()],
                      periodLabels=[{'value': v, 'label': re.sub('<[^>]+>', '', label).strip()}
                                    for v, label in options if v == f'{year}{period:02}'])
    except Exception as error:
        record['error'] = str(error)
    records.append(record)
    OUT.write_bytes((json.dumps(records, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    print(json.dumps(record, ensure_ascii=False), flush=True)
    if '403' in record.get('error', '') or '429' in record.get('error', ''):
        break
