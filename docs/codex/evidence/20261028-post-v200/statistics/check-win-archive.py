"""Inspect a bounded public six-show archive; absence is not an asserted true zero."""
from collections import Counter
import datetime
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request
from bs4 import BeautifulSoup

out = Path(__file__).resolve().parent / 'win-archive-followup.json'
origin = 'https://kpopwins.info'
url = origin + '/wins'
seen = set()
pages, rows = [], []
for index in range(12):
    if url in seen:
        break
    seen.add(url)
    record = {'url': url, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        raw = urllib.request.urlopen(url, timeout=20).read()
        page = BeautifulSoup(raw, 'html.parser')
        parsed = []
        for article in page.select('article'):
            date, artist, song, show = (article.select_one(selector) for selector in
                                       ['time[datetime]', 'a[href^="/artists/"]',
                                        'a[href^="/songs/"]', 'a[href^="/wins?show="]'])
            if all(v is not None for v in [date, artist, song, show]):
                parsed.append({'date': date['datetime'], 'artist': artist.get_text(' ', strip=True),
                               'song': song.get_text(' ', strip=True), 'show': show.get_text(' ', strip=True),
                               'artistUrl': origin + artist['href']})
        record.update(sha256=hashlib.sha256(raw).hexdigest(), bytes=len(raw), rows=len(parsed),
                      earliest=min((r['date'] for r in parsed), default=None),
                      latest=max((r['date'] for r in parsed), default=None))
        pages.append(record)
        rows.extend(parsed)
        links = [a['href'] for a in page.select('a[href]') if '?page=' in a['href']]
        next_links = [href for href in links if int(urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get('page', ['0'])[0]) == index + 2]
        print(json.dumps(record), flush=True)
        if not parsed or record['earliest'] < '2023-01-01' or not next_links:
            break
        url = urllib.parse.urljoin(origin, next_links[0])
    except Exception as error:
        record['error'] = str(error)
        pages.append(record)
        break
selected = [r for r in rows if r['date'] >= '2023-01-01']
aliases = ['genblue', 'gen blue', 'tracer', 'vcha', 'girlset', '幻藍小熊', '트레이서', '비춰']
matches = [r for r in selected if any(a in r['artist'].casefold() for a in aliases)]
result = {'schemaVersion': 1, 'source': origin + '/wins', 'sourceDescription': origin + '/about',
          'sourceKind': 'fan-maintained Wikipedia-derived reviewed archive',
          'rangeRequested': '2023-01-01 through latest published row', 'pages': pages,
          'recordCount': len(selected), 'showCounts': dict(Counter(r['show'] for r in selected)),
          'dateRange': [min((r['date'] for r in selected), default=None), max((r['date'] for r in selected), default=None)],
          'aliasesSearched': aliases, 'matchingRows': matches, 'rows': selected,
          'adoptedNumericMetrics': 0,
          'limits': ['This reads published archive rows, not each broadcaster episode and cancellation record.',
                     'No archive match does not prove no win in missing episodes or after the latest date.',
                     'GENBLUE, TRACER and VCHA/GIRLSET unknown metrics remain unresolved.']}
out.write_bytes((json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
print(json.dumps({'records': len(selected), 'shows': result['showCounts'], 'matches': len(matches)}))
