import datetime,hashlib,json,pathlib,time,urllib.parse,urllib.request
out=pathlib.Path('docs/codex/evidence/20261028-post-v200/statistics')
base='https://circlechart.kr'
page=base+'/page_chart/retail.circle?termGbn=day&yyyymmdd=20260518'
body=urllib.request.urlopen(page,timeout=20).read()
assert b'/data/api/chart/retail_list' in body
endpoint=base+'/data/api/chart/retail_list'
observations=[]
for period in ['20260115','20260116','20260117','20260118','20260119','20260120','20260121','20260203','20260204','20260205','20260206','20260207','20260517','20260519']:
 params={'termGbn':'day','yyyymmdd':period};item={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parameters':params,'url':base+'/page_chart/retail.circle?'+urllib.parse.urlencode(params),'endpoint':endpoint,'groundedPage':page,'groundedPageSha256':hashlib.sha256(body).hexdigest()}
 try:
  req=urllib.request.Request(endpoint,data=urllib.parse.urlencode(params).encode());res=urllib.request.urlopen(req,timeout=20);raw=res.read();p=json.loads(raw);rows=p.get('List',[]);rows=list(rows.values()) if isinstance(rows,dict) else rows
  selected=[r for r in rows if any(a in str(r).lower() for a in ['geenius','udtt','triples'])]
  item.update(httpStatus=res.status,responseSha256=hashlib.sha256(raw).hexdigest(),rowCount=len(rows),selectedRows=selected)
 except Exception as e:
  item['error']=str(e);observations.append(item)
  if '403' in str(e) or '429' in str(e):break
  continue
 observations.append(item);print(period,[(r['Artist'],r['Album'],r['rowSum']) for r in selected],flush=True)
 (out/'geenius-retail-extra-days.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');time.sleep(.4)
(out/'geenius-retail-extra-days.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
