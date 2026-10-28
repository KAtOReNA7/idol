import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {beforeUserXObservations} from './helpers/user-x-observations.cjs';
const read=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const data=read('data/group-statistics-completion-evidence.json');
const evidenceRoot='../../docs/codex/evidence/20261027-category-resolution/statistics/';
const changes=read(evidenceRoot+'changes.json');
const review=read(evidenceRoot+'review.json');
const laterSales=read('../../docs/codex/evidence/20261028-stage-fill/statistics-adoption-proposal.json');

test('fromis_9 monthly update adds two distinct rows without changing old rows',()=>{
 const change=changes.changes.find(c=>c.key==='fromis9.sales');
 const row=data.groups.fromis9.sales;
 assert.deepEqual(row.evidence.monthRows.slice(2),change.before.evidence.monthRows);
 assert.equal(row.evidence.monthRows.length,39);
 assert.equal(new Set(row.evidence.monthRows.map(r=>[r.year,r.month,r.album].join('/'))).size,39);
 assert.equal(row.evidence.monthRows.reduce((n,r)=>n+r.sales,0),row.evidence.monthlyRecomputedSum);
 assert.equal(row.evidence.monthlyRecomputedSum-change.before.observedValue,115009);
 assert.equal(row.evidence.monthlyRecomputedSum,1151613);
 assert.equal(row.asOf,'2026-07');assert.equal(row.lowerBound,true);
 assert.deepEqual(row.evidence.previousEvidence,change.before.evidence.previousEvidence);
 assert.equal(row.evidence.sourceDifferenceReview.previousReview.remainingDifference,463);
});

test('fromis_9 annual reconciliation replaces overlapping standard rows while retaining separate editions once',()=>{
 const row=data.groups.fromis9.sales,e=row.evidence;
 const replaced=new Set();let sum=0;
 for(const adjustment of e.annualReplacements){
  let monthly=0;
  for(const {rowIndex,...original} of adjustment.replacedMonthlyRows){
   assert.ok(!replaced.has(rowIndex));replaced.add(rowIndex);
   assert.deepEqual(e.monthRows[rowIndex],original);
   assert.equal(original.year,adjustment.year);assert.equal(original.album,adjustment.album);
   monthly+=original.sales;
  }
  assert.equal(monthly,adjustment.monthlySum);
  assert.equal(adjustment.annual-monthly,adjustment.delta);
  assert.match(adjustment.sourceAccess.primary,/search-index-only/);
  assert.match(adjustment.sourceAccess.readable,/full-page-read/);
  sum+=adjustment.annual;
 }
 sum+=e.monthRows.filter((_,i)=>!replaced.has(i)).reduce((n,r)=>n+r.sales,0);
 assert.equal(replaced.size,5);assert.equal(sum,1152076);
 assert.equal(sum,row.observedValue);assert.equal(sum,row.displayValue);assert.equal(sum,e.recomputedSum);
 assert.equal(sum-e.monthlyRecomputedSum,463);
 assert.deepEqual(e.annualReplacements.map(r=>r.delta),[-347,810]);
 const editions=e.monthRows.filter(r=>['FUN FACTORY (KiT)','from our Memento Box (Weverse)','from our Memento Box (KiT)'].includes(r.album));
 assert.equal(editions.reduce((n,r)=>n+r.sales,0),39999);
 assert.ok(editions.every(r=>!replaced.has(e.monthRows.indexOf(r))));
 assert.equal(e.sourceDifferenceReview.remainingDifference,0);
 assert.equal(e.sourceDifferenceReview.aggregateTotal,sum);
 assert.equal(e.sourceDifferenceReview.status,'resolved-by-yearly-reconciliation');
 assert.match(row.scope,/来源覆盖下界/);assert.match(row.scope,/不是全球完整累计/);
 assert.ok(data.summary.resolvedSourceDifferences.includes('fromis9.sales'));
});

test('award source adjudication preserves accepted totals and explains discrepancies',()=>{
 for(const slug of ['lesserafim','newjeans','ive']){
  const w=data.groups[slug].wins;
  assert.equal(Object.values(w.evidence.songTotals).reduce((a,b)=>a+b,0),w.observedValue);
  assert.equal(w.observedValue,changes.changes.find(c=>c.key===slug+'.wins').before.observedValue);
  assert.ok(!data.summary.unresolvedSourceDifferences.includes(slug+'.wins'));
 }
 const lesserafim=data.groups.lesserafim.wins.evidence.sourceDifferenceReview;
 assert.equal(lesserafim.comparisonTotal-lesserafim.excludedComparisonEntries.length,lesserafim.acceptedTotal);
 assert.ok(lesserafim.excludedComparisonEntries.every(e=>e.artist.includes(' x ')));
 assert.equal(lesserafim.independentlyVerifiedAwards,false);
 const nj=data.groups.newjeans.wins.evidence.sourceDifferenceReview;
 assert.equal(nj.events.length,6);assert.equal(new Set(nj.events.map(e=>e.date+'/'+e.show)).size,6);
 const ive=data.groups.ive.wins.evidence.sourceDifferenceReview;
 assert.equal(ive.acceptedTotal-ive.comparisonTotal,1);
 assert.equal(ive.events.find(e=>e.date==='2026-03-06').song,'BANG BANG');
 assert.ok(ive.events.some(e=>e.date==='2026-03-07'));
});

test('the historical 17 unresolved metrics and 22 reviewed topics remain reconstructable',()=>{
 const historicalData=beforeUserXObservations(data);
 for(const change of laterSales.items){const [slug,field]=change.key.split('.');historicalData.groups[slug][field]=change.expectedBefore;}
 const actual=[];
 for(const [slug,g]of Object.entries(historicalData.groups)){
  for(const a of g.social)if(a.observedValue===null)actual.push(slug+'.'+a.platform);
  for(const m of ['sales','wins'])if(g[m].observedValue===null){actual.push(slug+'.'+m);assert.equal(g[m].displayValue,0);assert.equal(g[m].status,'unavailable');}
 }
 assert.equal(actual.length,17);
 assert.deepEqual(actual.sort(),review.unknown.map(r=>r.key).sort());
 assert.ok(review.unknown.every(r=>r.applied===false&&r.status==='open-evidence-required'));
 assert.equal(new Set([...review.unknown,...review.sourceDifferences].map(r=>r.key)).size,22);
 assert.deepEqual(data.summary.unresolvedSourceDifferences,['triples.sales']);
});
