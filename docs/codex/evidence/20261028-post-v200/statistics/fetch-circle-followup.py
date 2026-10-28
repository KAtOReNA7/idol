import datetime
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request

OUT = pathlib.Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)


def read(url, params=None):
    data = None if params is None else urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data)
    with urllib.request.urlopen(req, timeout=25) as response:
        body = response.read()
        return response.status, body


observations = []
for kind, periods in [('retail', ['202601', '202602', '202603', '202604', '202605', '202606']), ('album', ['202607', '202608', '202609'])]:
    for period in periods:
        if kind == 'retail':
            params = {'termGbn': 'month', 'yyyymmdd': period}
            page = 'https://circlechart.kr/page_chart/retail.circle?' + urllib.parse.urlencode(params)
            endpoint = 'https://circlechart.kr/data/api/chart/retail_list'
        else:
            params = {'nationGbn': 'T', 'termGbn': 'month', 'hitYear': period[:4], 'targetTime': period[4:], 'yearTime': '3'}
            page = 'https://circlechart.kr/page_chart/album.circle?' + urllib.parse.urlencode(params)
            params['curUrl'] = page.removeprefix('https://')
            endpoint = 'https://circlechart.kr/data/api/chart/album'
        item = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'chart': kind, 'period': period, 'url': page, 'endpoint': endpoint, 'parameters': params}
        try:
            status, page_body = read(page)
            item.update(pageHttpStatus=status, pageSha256=hashlib.sha256(page_body).hexdigest())
            assert endpoint.removeprefix('https://circlechart.kr') in page_body.decode('utf-8'), 'endpoint absent from public page'
            status, body = read(endpoint, params)
            payload = json.loads(body)
            rows = payload.get('List', [])
            if isinstance(rows, dict):
                rows = list(rows.values())
            selected = [r for r in rows if any(t in json.dumps(r, ensure_ascii=False).lower() for t in ['geenius', '지니어스', 'udtt', '우당탕탕', 'triples', '트리플에스', 'spia', '수피아', 'tracer', '트레이서', 'witchx', 'w!tchx', '위치스', 'vcha', 'vvup', '비비업'])]
            item.update(httpStatus=status, responseSha256=hashlib.sha256(body).hexdigest(), responseBytes=len(body), resultStatus=payload.get('ResultStatus'), rowCount=len(rows), selectedRows=selected)
        except Exception as exc:
            item.update(error=str(exc))
            observations.append(item)
            if '403' in str(exc) or '429' in str(exc):
                break
            continue
        observations.append(item)
        print(kind, period, len(rows), len(selected), flush=True)
        (OUT / 'circle-followup.json').write_text(json.dumps(observations, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(OUT / 'circle-followup.json').write_text(json.dumps(observations, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
