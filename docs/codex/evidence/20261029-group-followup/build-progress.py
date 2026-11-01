"""Join classified evidence without rewriting human inputs or frozen v201 queues."""
import collections
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).parent
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,v):p.write_bytes((json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
aliases={'新增舞台缺口':'stage_new','stage-new':'stage_new','旧来源待替换':'stage_replacement','stage-replacement':'stage_replacement'}
def group(name):return 'VCHA / GIRLSET' if name in ['VCHA／GIRLSET','VCHA/GIRLSET','VCHA','GIRLSET'] else name
def key(g,row):
 kind=aliases.get(row['kind'],row['kind'])
 return (group(g),kind,row.get('stableId',row.get('workId',row.get('key',row.get('eventId',group(g)+':'+kind)))))
expected={}
for name in ['stage-checklist.json','other-checklist.json']:
 for g in read(ROOT/'docs/codex/evidence/20261029-human-help'/name)['groups']:
  for row in g['items']:
   k=key(g['name'],row);assert k not in expected;expected[k]=row
actual={}
for name in ['groups-baby-itzy.json','groups-ive-purple.json','groups-qwer-young.json','groups-root.json']:
 for row in read(OUT/name)['items']:
  k=key(row['group'],row);assert k not in actual,k
  assert row.get('checks') and row.get('remainingReason'),k
  actual[k]=(name,row)
assert set(expected)==set(actual),dict(missing=list(set(expected)-set(actual)),extra=list(set(actual)-set(expected)))
assert len(expected)==161 and len({k[0] for k in expected})==45
records=[]
for k in sorted(expected,key=lambda x:(x[0].casefold(),x[1],x[2])):
 name,row=actual[k]
 partial=k[0]=='MADEIN' and k[1]=='person' and k[2]=='rec28ldfRTrPi9'
 records.append(dict(group=k[0],kind=k[1],stableId=k[2],song=row.get('song'),
  researchFile=name,status='partially_addressed_release_cover_only' if partial else 'open',
  remainingReason='四人具名发行封套参考已接入，精确MV出镜/逐人录音仍未核；不是完整事实关闭。' if partial else row['remainingReason']))
counts=dict(collections.Counter(x['kind'] for x in records))
assert counts==dict(stage_new=109,stage_replacement=11,person=24,statistics_wins=3,statistics_sales=4,sales_reconciliation=1,timeline=7,photo_quality=2),counts
write(OUT/'progress.json',dict(schemaVersion=1,checkedAt='2026-10-29',scope='161分类项全部有记录；有界检索与旧证复核不等于全网穷尽，部分项目仅复核已知限制。',
 counts=counts,groupsWithItems=45,groupsWithoutCurrentItems=['ADYA','BADVILLAIN','Billlie','Cherry Bullet','EVERGLOW','RESCENE'],
 fullFactClosures=0,unresolvedItems=161,partiallyAddressedItems=1,unaddressedItems=160,allItemsRetained=161,
 unresolvedNote='部分补强项仍属于161个未解决事实分类项；没有减少原队列。',
 developmentActions=[
  dict(group='MADEIN',workId='rec28ldfRTrPi9',action='四人具名发行封套参考接入；MV出镜/逐人录音仍待核',evidence='adoption.json'),
  dict(group='NMIXX',workId='recvxyOz5Xo5fW',action='依据现政策重开官方Performance候选，原MV/加工重传排除保留；未绑定舞台',evidence='heygabby-review-update.json'),
  dict(group='ILLIT',workId='rec28ldfRTrKy2',relatedWorkId='rec28ldfRTrKtW',action='用户已决定另行整理完整歌曲版；复用已有完整原曲，明确短/完整版本导航，不重复导入舞台或转移评分',evidence='illit-full-version.json')
 ],records=records))
write(OUT/'coverage-validation.json',dict(result='PASS',expectedItems=161,actualItems=161,duplicateKeys=0,missingKeys=0,extraKeys=0,groups=45,counts=counts,
 note='分类覆盖校验，不等于事实已补齐或所有条目取得新证据；六团无当前任务不代表新验收。',humanInputsRewritten=False,frozenQueuesRewritten=False))
print('PASS: 161/161 classified keys, 45 groups; zero missing/duplicate/extra; 161 unresolved including 1 partial; 0 complete closures.')
