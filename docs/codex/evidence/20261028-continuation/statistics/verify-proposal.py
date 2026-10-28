"""Offline checks of the frozen proposal; no application or network writes."""
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]

def read(name):
    return json.loads((HERE / name).read_text('utf-8'))

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')

d = read('triples-sales-proposal.json')
r = read('recomputation.json')
s = read('source-evidence.json')
b, a = d['expectedBefore'], d['proposedAfter']
rows = b['evidence']['monthRows']
assert sha256(canonical(b)).hexdigest() == d['expectedBeforeSha256Canonical']
assert sha256(canonical(a)).hexdigest() == d['proposedAfterSha256Canonical']
assert len(rows) == 36
assert sum(row['sales'] for row in rows) == 2087073
assert rows == a['evidence']['monthRows']
assert b['evidence']['previousEvidence'] == a['evidence']['previousEvidence']
assert all(b[k] == a[k] for k in ['status','unit','title','asOf','sourceUrl','sourceTitle','lowerBound'])
indices = []
for rep in a['evidence']['annualReplacements']:
    indices += [row['rowIndex'] for row in rep['replacedMonthlyRows']]
    assert all({k:v for k,v in row.items() if k != 'rowIndex'} == rows[row['rowIndex']] for row in rep['replacedMonthlyRows'])
    assert rep['monthlySum'] == sum(row['sales'] for row in rep['replacedMonthlyRows'])
    assert rep['delta'] == rep['annual'] - rep['monthlySum']
assert sorted(indices) == [9,10,11,12,20] and len(indices) == len(set(indices))
assert sum(rep['delta'] for rep in a['evidence']['annualReplacements']) == 5166
assert a['observedValue'] == a['displayValue'] == a['evidence']['recomputedSum'] == 2092239
assert a['evidence']['monthlyRecomputedSum'] == 2087073
assert a['evidence']['sourceDifferenceReview']['remainingDifference'] == 2458789 - 2092239 == 366550
assert a['evidence']['sourceDifferenceReview']['status'] == 'partially-resolved'
assert r['retainedRowCount'] == 31 and r['retainedRowSum'] + r['annualReplacementSum'] == 2092239
assert len(s['captures']) == 8 and all(x['httpStatus'] == 200 and x['exactRelevantRows'] for x in s['captures'])
assert s['restrictions']['soridataRequests'] == 0
target = ROOT / d['targetFile']
current_bytes = target.read_bytes()
current = json.loads(current_bytes)['groups']['triples']['sales']
result = {'status':'passed','expectedBeforeMatchesCurrent':current == b,
          'currentAlreadyEqualsProposedAfter':current == a,
          'frozenFileSha256':d['expectedFileSha256'],'currentFileSha256':sha256(current_bytes).hexdigest(),
          'monthlyRows':36,'replacementRows':5,'unchangedContributions':31,'netDelta':5166,
          'proposedObservedValue':2092239,'remainingDifference':366550,
          'applicationDataModified':False,'networkRequests':0}
(HERE / 'offline-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
