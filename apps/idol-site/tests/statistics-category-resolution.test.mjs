import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const data=read('data/group-statistics-completion-evidence.json');
const evidenceRoot='../../docs/codex/evidence/20261027-category-resolution/statistics/';
const changes=read(evidenceRoot+'changes.json');
const review=read(evidenceRoot+'review.json');

test('fromis_9 monthly update adds two distinct rows without changing old rows',()=>{
 const change=changes.changes.find(c=>c.key==='fromis9.sales');
 const row=data.groups.fromis9.sales;
 assert.deepEqual(row.evidence.monthRows.slice(2),change.before.evidence.monthRows);
 assert.equal(row.evidence.monthRows.length,39);
 assert.equal(new Set(row.evidence.monthRows.map(r=>[r.year,r.month,r.album].join('/'))).size,39);
 assert.equal(row.evidence.monthRows.reduce((n,r)=>n+r.sales,0),row.observedValue);
 assert.equal(row.observedValue-change.before.observedValue,115009);
 assert.equal(row.observedValue,1151613);
 assert.equal(row.asOf,'2026-07');assert.equal(row.lowerBound,true);
 assert.equal(row.evidence.sourceDifferenceReview.aggregateTotal-row.observedValue,463);
 assert.ok(data.summary.unresolvedSourceDifferences.includes('fromis9.sales'));
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

test('17 unresolved metrics retain null evidence; 22 reviewed topics are unique and complete',()=>{
 const actual=[];
 for(const [slug,g]of Object.entries(data.groups)){
  for(const a of g.social)if(a.observedValue===null)actual.push(slug+'.'+a.platform);
  for(const m of ['sales','wins'])if(g[m].observedValue===null){actual.push(slug+'.'+m);assert.equal(g[m].displayValue,0);assert.equal(g[m].status,'unavailable');}
 }
 assert.equal(actual.length,17);
 assert.deepEqual(actual.sort(),review.unknown.map(r=>r.key).sort());
 assert.ok(review.unknown.every(r=>r.applied===false&&r.status==='open-evidence-required'));
 assert.equal(new Set([...review.unknown,...review.sourceDifferences].map(r=>r.key)).size,22);
 assert.deepEqual(data.summary.unresolvedSourceDifferences,['triples.sales','fromis9.sales']);
});
