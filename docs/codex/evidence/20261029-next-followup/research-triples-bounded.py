"""Four new chart-period candidates; read-only, with a prior-query skip guard."""
import datetime,hashlib,json,re,urllib.parse,urllib.request
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
evidenceRoot=ROOT/'docs/codex/evidence'
application=ROOT/'apps/idol-site/data/group-statistics-completion-evidence.json'
sale=json.loads(application.read_text(encoding='utf-8'))['groups']['triples']['sales']
assert sale['observedValue']==2110833
targets=[(2023,45),(2024,47),(2024,48),(2026,2)]
known={}
def strings(v):
    if isinstance(v,str):yield v
    elif isinstance(v,list):
        for x in v:yield from strings(x)
    elif isinstance(v,dict):
        for x in v.values():yield from strings(x)
for p in evidenceRoot.rglob('*.json'):
    if p.parent==HERE:continue
    if not ('statistic' in str(p).lower() or 'circle' in p.name.lower() or 'triples' in p.name.lower()):continue
    try:data=json.loads(p.read_text(encoding='utf-8'))
    except (ValueError,UnicodeError):continue
    for value in strings(data):
        if not value.startswith('https://circlechart.kr/page_chart/album.circle?'):continue
        q=urllib.parse.parse_qs(urllib.parse.urlparse(value).query)
        if q.get('termGbn')!=['week']:continue
        try:key=(int(q['hitYear'][0]),int(q['targetTime'][0]))
        except (ValueError,KeyError):continue
        known.setdefault(key,set()).add(p.relative_to(ROOT).as_posix())
records=[]
for year,week in targets:
    rec={'year':year,'week':week,'priorQueryFiles':sorted(known.get((year,week),[]))}
    if rec['priorQueryFiles']:
        rec['status']='skipped_prior_query';records.append(rec);continue
    params={'nationGbn':'T','termGbn':'week','hitYear':str(year),'targetTime':f'{week:02}','yearTime':'3'}
    page='https://circlechart.kr/page_chart/album.circle?'+urllib.parse.urlencode(params)
    params['curUrl']=page.removeprefix('https://')
    rec.update(sourceUrl=page,endpoint='https://circlechart.kr/data/api/chart/album',parameters=params,
               checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
    try:
        html=urllib.request.urlopen(page,timeout=20).read()
        assert b'/data/api/chart/album' in html
        response=urllib.request.urlopen(urllib.request.Request(rec['endpoint'],data=urllib.parse.urlencode(params).encode()),timeout=20)
        raw=response.read();data=json.loads(raw);rows=data.get('List',[])
        if isinstance(rows,dict):rows=list(rows.values())
        labels=re.findall(r'<option[^>]*value=["\'](\d{6})["\'][^>]*>(.*?)</option>',html.decode(),re.S)
        rec.update(status='read',httpStatus=response.status,pageSha256=hashlib.sha256(html).hexdigest(),
                   responseSha256=hashlib.sha256(raw).hexdigest(),rowCount=len(rows),
                   periodLabels=[re.sub('<[^>]+>','',label).strip() for value,label in labels if value==f'{year}{week:02}'],
                   selectedRows=[r for r in rows if 'triples' in str(r).lower()])
    except Exception as e:rec.update(status='failed',error=str(e))
    records.append(rec)
    (HERE/'triples-new-period-readback.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(rec,ensure_ascii=True),flush=True)
    if any(code in rec.get('error','') for code in ['403','429','412']):break
(HERE/'triples-new-period-readback.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
