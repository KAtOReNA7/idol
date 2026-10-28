import datetime,hashlib,json,pathlib,time,urllib.parse,urllib.request
out=pathlib.Path('docs/codex/evidence/20261028-post-v200/statistics');endpoint='https://circlechart.kr/data/api/chart/album'
obs=[]
periods=[(2022,w) for w in [50,51,52,53]]+[(2023,w) for w in [10,11,12,36,37,38,45,46,47]]
for year,week in periods:
 params={'nationGbn':'T','termGbn':'week','hitYear':str(year),'targetTime':str(week).zfill(2),'yearTime':'3'}
 page='https://circlechart.kr/page_chart/album.circle?'+urllib.parse.urlencode(params);params['curUrl']=page.removeprefix('https://')
 item={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'year':year,'week':week,'sourceUrl':page,'endpoint':endpoint,'parameters':params}
 try:
  p=urllib.request.urlopen(page,timeout=20).read();assert b'/data/api/chart/album' in p
  res=urllib.request.urlopen(urllib.request.Request(endpoint,data=urllib.parse.urlencode(params).encode()),timeout=20);raw=res.read();payload=json.loads(raw);rows=payload.get('List',[]);rows=list(rows.values()) if isinstance(rows,dict) else rows
  selected=[r for r in rows if 'triples' in str(r).lower()]
  item.update(httpStatus=res.status,pageSha256=hashlib.sha256(p).hexdigest(),responseSha256=hashlib.sha256(raw).hexdigest(),rowCount=len(rows),selectedRows=selected)
 except Exception as e:
  item['error']=str(e);obs.append(item)
  if '403' in str(e) or '429' in str(e):break
  continue
 obs.append(item);print(year,week,[(r.get('Album'),r.get('Album_CNT')) for r in selected],flush=True)
 (out/'triples-nonoverlap-weeks.json').write_text(json.dumps(obs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');time.sleep(.4)
(out/'triples-nonoverlap-weeks.json').write_text(json.dumps(obs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
