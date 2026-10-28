"""Offline verification of evidence proposals; never mutates application data."""
import datetime
import json
import pathlib
import re

BASE = pathlib.Path(__file__).resolve().parent
ROOT = BASE.parents[4]

def read(name):
    return json.loads((BASE / name).read_text(encoding='utf-8'))

checks = []
def verify(name, condition):
    if not condition:
        raise AssertionError(name)
    checks.append(name)

for path in BASE.glob('*.json'):
    json.loads(path.read_text(encoding='utf-8'))
research = read('research.json')
items = research['items']
verify('18 distinct research items', len(items) == 18 == len({i['key'] for i in items}))
verify('10 statistics and 7 date holds', sum(i['category'].startswith('unknown_') for i in items) == 10 and sum(i['category'] == 'effective_date' for i in items) == 7)
verify('no canonical date closure', research['summary']['dateHoldsClosed'] == 0)
geenius = read('geenius-retail-proposal.json')
grow = read('geenius-retail-observations.json')[0]['selectedRows'][0]
verify('Geenius row identity', grow['Artist'] == 'Geenius' and grow['Barcode'] == '8800331307821')
verify('Geenius Retail period arithmetic', int(grow['rowSum']) == int(grow['KSum']) + int(grow['ESum']) == geenius['replacement']['observedValue'] == 217)
verify('Geenius full old record preserved', geenius['replacement']['evidence']['previousRecord'] == geenius['expectedBefore'])
verify('Geenius scoped label and incomplete coverage', '零售' in geenius['replacement']['title'] and geenius['replacement']['evidence']['coverageComplete'] is False)
p = read('triples-weekly-proposal.json')
raw = read('triples-nonoverlap-weeks.json')
raw_rows = {(o['year'], o['week'], r['seq_aoa']): r for o in raw for r in o.get('selectedRows', [])}
ranges = {i['chartWeek']: i['range'] for o in read('triples-week-date-ranges.json') for i in o.get('dateRangeOptions', [])}
verify('4 unique weekly contributions', len(p['weeklyRows']) == len({(r['year'],r['week'],r['albumId']) for r in p['weeklyRows']}) == 4)
for row in p['weeklyRows']:
    key=(row['year'],row['week'],row['albumId'])
    origin=raw_rows[key]
    verify('exact original Album_CNT '+str(key), int(origin['Album_CNT']) == row['sales'] and origin['ALBUM_NAME'] == row['album'])
    verify('official week selector '+str(key), row['dateRange'] == ranges[f"{row['year']}{row['week']:02}"])
    dates=re.findall(r'\d{4}\.\d{2}\.\d{2}',row['dateRange'])
    first,last=[datetime.date.fromisoformat(d.replace('.','-')) for d in dates]
    verify('7 day inclusive interval '+str(key), (last-first).days==6)
    proof=next(v for v in p['overlapReview'] if v['albumId']==row['albumId'])
    for month in proof['existingSameVersionMonthRows']:
        mfirst=datetime.date(month['year'],month['month'],1)
        mlast=(datetime.date(month['year']+1,1,1) if month['month']==12 else datetime.date(month['year'],month['month']+1,1))-datetime.timedelta(days=1)
        verify('no same-version month overlap '+str(key)+' '+str(month['rowIndex']), last<mfirst or first>mlast)
verify('weekly sum and full arithmetic', sum(r['sales'] for r in p['weeklyRows'])==p['additiveWeeklyContribution']==5847 and p['baseValue']+5847==p['proposedValue']==2098086)
verify('remaining discrepancy stays open', p['savedAggregateComparison']-p['proposedValue']==p['proposedRemainingDifference']==360703)
app=json.loads((ROOT/'apps/idol-site/data/group-statistics-completion-evidence.json').read_text(encoding='utf-8'))
months=app['groups']['triples']['sales']['evidence']['monthRows']
verify('original 36 months retained and sum consistent',len(months)==36 and sum(i['sales'] for i in months)==2087073)
verify('monthly annual weekly arithmetic',2087073+5166+5847==p['proposedValue'])
for proof in p['overlapReview']:
    for row in proof['existingSameVersionMonthRows']:
        source=months[row['rowIndex']]
        verify('original month mapping '+str(row['rowIndex']),all(source[k]==row[k] for k in ['year','month','sales']))
verify('UDTT counter not proposed as adopted',read('udtt-merchant-candidate-hold.json')['adoptionRecommended'] is False)
result={'passed':len(checks),'failed':0,'checks':checks,'scope':'Offline evidence consistency only; no application tests or deployment validation claimed.'}
(BASE/'evidence-validation.json').write_bytes((json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'passed':len(checks),'failed':0}))
