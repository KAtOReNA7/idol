"""Independently reread two official periods, then extend only the disjoint lower bound."""
import copy,datetime,hashlib,json,re,urllib.parse,urllib.request
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def overlaps(a,b):return a[0]<=b[1] and b[0]<=a[1]
def interval(row):
 m=re.search(r'(\d{4})\.(\d{2})\.(\d{2})~(\d{4})\.(\d{2})\.(\d{2})',row['dateRange']);assert m
 a=m.groups();return ('-'.join(a[:3]),'-'.join(a[3:]))
def main():
 p=APP/'data/group-statistics-completion-evidence.json';proposal=load(HERE/'triples-reconciliation-new.json')
 assert sha(p)==proposal['applicationSha256'], 'Unexpected statistics preimage'
 data=load(p);sales=data['groups']['triples']['sales'];before=copy.deepcopy(sales);e=sales['evidence']
 assert len(e['weeklyAdditions'])==11 and sales['observedValue']==2110833
 observed=[]
 for candidate in proposal['candidates']:
  html=urllib.request.urlopen(candidate['sourceUrl'],timeout=25).read()
  assert b'/data/api/chart/album' in html
  response=urllib.request.urlopen(urllib.request.Request(candidate['endpoint'],data=urllib.parse.urlencode(candidate['parameters']).encode()),timeout=25)
  raw=response.read();rows=json.loads(raw)['List'];rows=list(rows.values()) if isinstance(rows,dict) else rows
  row=next(r for r in rows if r['seq_aoa']==candidate['albumId'])
  assert int(row['Album_CNT'])==candidate['sales'] and row['ALBUM_NAME']==candidate['album'] and row['ARTIST_NAME']==candidate['artist']
  labels=re.findall(r'<option[^>]*value=["\'](\d{6})["\'][^>]*>(.*?)</option>',html.decode(),re.S)
  assert candidate['dateRange'] in [re.sub('<[^>]+>','',label).strip() for key,label in labels if key==str(candidate['year'])+str(candidate['week']).zfill(2)]
  newrange=(candidate['interval']['start'],candidate['interval']['end'])
  assert newrange[1]<='2026-06-30'
  for old in e['weeklyAdditions']:
   if old['albumId']==candidate['albumId']:assert not overlaps(newrange,interval(old))
  indices=[i for i,r in enumerate(e['monthRows']) if r['album']==candidate['sameVersionIdentity']['sourceMonthRow']['album']]
  assert indices==[candidate['sameVersionIdentity']['sourceMonthRowIndex']], 'Review all same-version month rows'
  for i in indices:
   old=e['monthRows'][i];start=datetime.date(old['year'],old['month'],1);end=(datetime.date(old['year']+1,1,1) if old['month']==12 else datetime.date(old['year'],old['month']+1,1))-datetime.timedelta(days=1)
   assert not overlaps(newrange,(start.isoformat(),end.isoformat()))
  observed.append({'sourceUrl':candidate['sourceUrl'],'http':response.status,'pageSha256':hashlib.sha256(html).hexdigest(),'responseSha256':hashlib.sha256(raw).hexdigest(),'period':candidate['dateRange'],'row':row})
 write(HERE/'triples-independent-readback.json',observed)
 for candidate,capture in zip(proposal['candidates'],observed):
  new={k:candidate[k] for k in ['year','week','dateRange','album','artist','albumId','sales','metricField','rank','sourceUrl','checkedAt','responseSha256','pageSha256']}
  assert not any((r['year'],r['week'],r['albumId'])==(new['year'],new['week'],new['albumId']) for r in e['weeklyAdditions'])
  e['weeklyAdditions'].append(new)
  e['weeklyOverlapReview'].append({'albumId':new['albumId'],'album':new['album'],'newIntervals':[candidate['interval']['start']+'/'+candidate['interval']['end']],
   'existingSameVersionMonthRows':[{'rowIndex':candidate['sameVersionIdentity']['sourceMonthRowIndex'],**candidate['sameVersionIdentity']['sourceMonthRow']}],
   'existingSameVersionWeekIntervals':[ '/'.join(interval(r)) for r in before['evidence']['weeklyAdditions'] if r['albumId']==new['albumId']],
   'overlap':False,'separateVersionExclusion':'Cosmo editions and cumulative Total_CNT excluded; existing annual replacements cover different editions.'})
  sales['sources'].append({'url':new['sourceUrl'],'title':f"Circle Album Chart · {new['year']}-W{new['week']:02} · {new['album']}",'kind':'official-weekly-chart','checkedAt':new['checkedAt']})
 total=e['monthlyRecomputedSum']+sum(r['delta'] for r in e['annualReplacements'])+sum(r['sales'] for r in e['weeklyAdditions'])
 assert total==2113229 and len(e['weeklyAdditions'])==13
 sales.update(observedValue=total,displayValue=total,rawDisplay='2,113,229+')
 assert '11条' in sales['scope'];sales['scope']=sales['scope'].replace('11条','13条')
 sales['sourceTitle']=sales['sourceTitle'].replace('11条','13条')
 sales['notes'].append('2026-10-29追加同版本未覆盖周：Performante标准版2024-W48为1,162，Beyond Beauty标准版2026-W02为1,234，共2,396；与同版月行、既有周及Cosmo年覆盖不重复。已核下界2,113,229，旧汇总差额345,560仍未解释，统计截止仍2026-06；上方数字为历史核对记录。')
 e['recomputedSum']=total
 review=e['sourceDifferenceReview'];review.update(reconciledSum=total,remainingDifference=2458789-total,weeklyContribution=sum(r['sales'] for r in e['weeklyAdditions']),reason='Two annual replacements and thirteen non-overlapping official Album week rows are verified; aggregate difference345560 remains unresolved. No Total_CNT, Retail, Hanteo or Japan contribution.')
 write(p,data)
 guardp=APP/'scripts/udtt-private-build-assets-manifest.json';guard=load(guardp);guard_before=copy.deepcopy(guard['runtimeGuards']['data/group-statistics-completion-evidence.json']);oldguardsha=sha(guardp)
 assert guard_before['sha256']==proposal['applicationSha256']
 guard_after={'bytes':p.stat().st_size,'sha256':sha(p)};guard['runtimeGuards']['data/group-statistics-completion-evidence.json']=guard_after;write(guardp,guard)
 write(HERE/'triples-adoption.json',{'change':'triples.sales','beforeFileSha256':proposal['applicationSha256'],'afterFileSha256':sha(p),'expectedBefore':before,'after':copy.deepcopy(sales),'addedContribution':2396,
  'guardChange':{'file':'scripts/udtt-private-build-assets-manifest.json','beforeFileSha256':oldguardsha,'afterFileSha256':sha(guardp),'expectedBefore':guard_before,'after':guard_after},
  'oldMonthRowsPreserved':True,'oldAnnualAnd11WeeksPreserved':True,'summaryAndUnknownFieldsPreserved':True,'privateWrites':0,'deployments':0})
if __name__=='__main__':main()
