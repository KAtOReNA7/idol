"""Prepare a reviewed non-overlap proposal; does not write application data."""
import copy,datetime,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site/data/group-statistics-completion-evidence.json'
data=json.loads(APP.read_text(encoding='utf-8'))['groups']['triples']['sales']
assert data['observedValue']==2110833
evidence=data['evidence']
assert len(evidence['monthRows'])==36 and len(evidence['weeklyAdditions'])==11 and len(evidence['annualReplacements'])==2
observations=json.loads((HERE/'triples-new-period-readback.json').read_text(encoding='utf-8'))
proposals=[];excluded=[]
specs=[(2024,48,'78104',1162,'2024-11-24','2024-11-30',21),
       (2026,2,'81284',1234,'2026-01-04','2026-01-10',8)]
for year,week,album_id,units,start,end,month_index in specs:
    observed=next(r for r in observations if r['year']==year and r['week']==week)
    row=next(r for r in observed['selectedRows'] if r['seq_aoa']==album_id)
    assert int(row['Album_CNT'])==units
    assert row['ARTIST_NAME']=='tripleS (트리플에스)' and '(Cosmo)' not in row['ALBUM_NAME']
    existing=[r for r in evidence['weeklyAdditions'] if r['albumId']==album_id]
    assert len(existing)==1 and existing[0]['album']==row['ALBUM_NAME']
    assert not any(r['year']==year and r['week']==week and r['albumId']==album_id for r in evidence['weeklyAdditions'])
    month=evidence['monthRows'][month_index]
    assert datetime.date(month['year'],month['month'],1)<datetime.date.fromisoformat(start)
    assert (month['year'],month['month'])!=(year,datetime.date.fromisoformat(start).month)
    proposals.append({'year':year,'week':week,'dateRange':observed['periodLabels'][0],
       'interval':{'start':start,'end':end},'albumId':album_id,'album':row['ALBUM_NAME'],'artist':row['ARTIST_NAME'],
       'sales':units,'metricField':'Album_CNT','rank':int(row['SERVICE_RANKING']),
       'sourceUrl':observed['sourceUrl'],'endpoint':observed['endpoint'],'parameters':observed['parameters'],
       'checkedAt':observed['checkedAt'],'responseSha256':observed['responseSha256'],'pageSha256':observed['pageSha256'],
       'sameVersionIdentity':{'currentExactAlbumIdAndTitleMatch':copy.deepcopy(existing[0]),
          'sourceMonthRowIndex':month_index,'sourceMonthRow':copy.deepcopy(month),
          'separateCosmoVersionExcluded':True},
       'overlapReview':{'all36MonthRowsRead':True,'all11ExistingWeeksRead':True,'bothAnnualReplacementsRead':True,
          'sameVersionCoveredMonthOutsideNewWeek':True,
          'sameVersionExistingWeekOutsideNewWeek':True,
          'annualReplacementIsDifferentEdition':True,
          'cutoffUnchanged':'2026-06',
          'withinExistingCutoff':True,'noTotalCntContribution':True},
       'proposedContribution':units})
for year,week,album_id,reason in [(2024,48,'78113','Already covered by the adopted 2024 Performante Cosmo annual total289224; adding its week would double count.'),
                                 (2026,2,'81285','Already covered by the original 2026-01 Beyond Beauty Cosmo month row6660; adding its week would double count.')]:
    observed=next(r for r in observations if r['year']==year and r['week']==week)
    row=next(r for r in observed['selectedRows'] if r['seq_aoa']==album_id)
    excluded.append({'year':year,'week':week,'albumId':album_id,'album':row['ALBUM_NAME'],'sales':int(row['Album_CNT']),
                     'contribution':0,'reason':reason,'sourceUrl':observed['sourceUrl']})
added=sum(r['sales'] for r in proposals)
old=evidence['recomputedSum'];aggregate=2458789
assert added==2396 and old+added==2113229 and aggregate-old-added==345560
result={'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'status':'eligible_for_parent_independent_review_not_applied',
  'baselineCommit':'ec9efbc590673b8bbb98e6c98db303303a3b8aa0',
  'applicationPath':APP.relative_to(ROOT).as_posix(),'applicationSha256':hashlib.sha256(APP.read_bytes()).hexdigest(),
  'baselineSalesObjectSha256':hashlib.sha256(json.dumps(data,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
  'metric':'Circle Album Chart period Album_CNT; no Total_CNT, Retail, Hanteo or Oricon/Japan',
  'baseline':{'observedValue':old,'monthRows':36,'monthlySum':evidence['monthlyRecomputedSum'],
      'annualReplacements':2,'annualNet':sum(r['delta'] for r in evidence['annualReplacements']),
      'weeklyAdditionRows':11,'weeklySum':sum(r['sales'] for r in evidence['weeklyAdditions']),
      'savedAggregate':aggregate,'remainingDifference':aggregate-old,'asOf':data['asOf']},
  'candidates':proposals,'excludedCoveredRows':excluded,
  'observationsFile':'docs/codex/evidence/20261029-next-followup/triples-new-period-readback.json',
  'searchAndPriorQueryReview':{
      'exactAggregateQueries':['"tripleS" "2,458,789"','"tripleS" "2458789"'],
      'aggregateQueryOutcome':'No new directly attributable original row breakdown surfaced in this bounded index search; no claim the total never existed.',
      'aggregateProvenance':'Current retained source is Soridata TripleS artist page, sourceDate2026-06, checked2026-10-25; original aggregate2458789 lacks an independently recoverable full constituent breakdown in the reviewed retained records. No failed Soridata route reopened.',
      'priorKnownAnnualReadbacks':'2022 and2023 annual requests in statistics-dates-circle-annual.json returned100 rows with no selected tripleS; those old requests were not repeated.',
      'skippedPeriod':next(r for r in observations if r['status']=='skipped_prior_query'),
      'newNoTargetPeriod':{'year':2024,'week':47,'rowsRead':100,'contribution':0,'meaning':'No selected row in this top100 read is not proof of actual zero.'},
      'existing11WeekTuplePreserved':[[r['year'],r['week'],r['albumId'],r['sales']] for r in evidence['weeklyAdditions']]},
  'proposal':{'newWeeklyRows':2,'newWeeklyContribution':added,'weeklyRowsAfterAdoption':13,
      'newLowerBound':old+added,'remainingDifference':aggregate-old-added,
      'formula':'2087073 + 5166 + 18594 + 2396 = 2113229',
      'lowerBoundOnly':True,'originalAggregateFullyExplained':False,
      'asOfUnchanged':'2026-06','oldMonthAndAnnualAndWeekRowsPreserved':True},
  'limits':['This closes no full reconciliation fact: the347956 reference gap would shrink by2396, leaving345560 unexplained.',
      'Only two disjoint standard-edition period counts are proposed; contemporaneous Cosmo rows and Total_CNT are excluded.',
      'Source body periods and native API values are freshly read; this is not a private export or personal record operation.',
      'An official source may later revise historical counts/returns; current readback date and full-response hashes are retained.'],
  'applicationWrites':0,'privateReadsOrWrites':0,'deployments':0}
(HERE/'triples-reconciliation-new.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result['proposal']))
