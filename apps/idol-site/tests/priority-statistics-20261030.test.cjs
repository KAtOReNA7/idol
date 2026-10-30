const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const current=require('../data/group-statistics-completion-evidence.json');
const {beforePriorityStatistics,beforePriorityGuard,receipt}=require('./helpers/priority-statistics-baseline.cjs');
const base=path.join(__dirname,'../../../docs/codex/evidence/20261030-priority-crosscheck');
const manifest=require(base+'/wins-coverage-manifest.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const load=require('./helpers/public-artist-loader.cjs');

test('only the four reviewed statistics and exact summary change; a changed old value fails the full-file restoration',()=>{
 const before=beforePriorityStatistics(current),restored=structuredClone(current);
 assert.equal(receipt.changes.length,4);
 for(const c of receipt.changes){const [g,k]=c.change.split('.');assert.deepEqual(restored.groups[g][k],c.after);restored.groups[g][k]=structuredClone(c.before);}
 restored.summary=structuredClone(receipt.beforeSummary);assert.deepEqual(restored,before);
 const tampered=structuredClone(current);tampered.groups.ive.sales.observedValue++;
 assert.throws(()=>beforePriorityStatistics(tampered),/complete priority statistics after-file/);
 for(const g of ['spia','tracer','vcha','witchx']){assert.deepEqual(current.groups[g].sales,before.groups[g].sales);assert.equal(current.groups[g].sales.observedValue,null);}
 const unknown=Object.values(current.groups).flatMap(g=>[...g.social,g.sales,g.wins]).filter(r=>r.observedValue===null);assert.equal(unknown.length,4);
});

test('three zero awards have complete thirty-table captures and bounded traditional-program scope, never all awards or GIRLSET',()=>{
 assert.equal(manifest.tables.length,30);assert.equal(new Set(manifest.tables.map(r=>r.year+'/'+r.show)).size,30);
 assert.equal(manifest.tables.reduce((n,r)=>n+r.weeklyRows,0),1488);assert.equal(manifest.coverageEnd,'2026-10-29');
 for(const row of manifest.tables){
  const bytes=fs.readFileSync(path.join(base,row.localCapture));assert.equal(hash(bytes),row.localCaptureSha256);
  const capture=JSON.parse(bytes);assert.equal(hash(capture.chartSectionText),row.chartTextSha256);assert.equal(capture.fullChartSectionRead,true);assert.deepEqual(capture.aliasesMatched,[]);
  for(const alias of capture.aliasesChecked)assert.equal(capture.chartSectionText.toLowerCase().includes(alias.toLowerCase()),false,alias);
 }
 for(const g of ['genblue','tracer','vcha']){const r=current.groups[g].wins;assert.equal(r.observedValue,0);assert.equal(r.status,'observed');assert.equal(r.asOf,'2026-10-29');assert.equal(r.evidence.programs.length,6);assert.equal(r.evidence.winnerMatches,0);}
 assert.deepEqual(current.groups.vcha.wins.evidence.excludedBrands,['GIRLSET']);
 assert.ok(manifest.old930Crosscheck.sourceDependent.includes('Wikipedia-derived'));
});

test('two release cumulative cohorts replace their full old contributions exactly once; monthly, annual and weekly history remain intact',()=>{
 const before=beforePriorityStatistics(current).groups.triples.sales,now=current.groups.triples.sales,e=now.evidence;
 for(const k of ['monthRows','annualReplacements','weeklyAdditions','officialAnnualReadback20261028'])assert.deepEqual(e[k],before.evidence[k]);
 const months=new Set(),weeks=new Set(),annuals=new Set();let delta=0;
 for(const r of e.releaseCumulativeReplacements){let counted=0;
  for(const [field,source,seen,value] of [['coversMonthRows','monthRows',months,'sales'],['coversExistingWeeklyRows','weeklyAdditions',weeks,'sales'],['coversAnnualReplacements','annualReplacements',annuals,'delta']])for(const row of r[field]){assert.equal(seen.has(row.index),false);seen.add(row.index);assert.deepEqual(e[source][row.index],row.expectedBefore);counted+=row.expectedBefore[value];}
  assert.equal(counted,r.beforeContribution.total);assert.equal(r.newCumulativeLowerBound-counted,r.netDelta);assert.ok(r.cumulativeKnownBy<'2026-07-01');delta+=r.netDelta;
 }
 assert.deepEqual(e.releaseCumulativeReplacements.map(r=>r.netDelta),[4329,858]);assert.equal(delta,5187);assert.equal(now.observedValue,before.observedValue+delta);assert.equal(now.observedValue,2118416);
 assert.equal(e.sourceDifferenceReview.remainingDifference,340373);assert.equal(e.sourceDifferenceReview.status,'partially-resolved');assert.equal(now.asOf,'2026-06');assert.equal(now.lowerBound,true);
 assert.equal(e.monthRows.reduce((n,r)=>n+r.sales,0)+e.annualReplacements.reduce((n,r)=>n+r.delta,0)+e.weeklyAdditions.reduce((n,r)=>n+r.sales,0)+delta,now.observedValue);
});

test('public information renders real observed zero normally, without a new secondary-source badge or editable/private fields',()=>{
 const api=load('lib/idol/group-information.mjs');
 for(const slug of ['genblue','tracer','vcha']){const html=api.renderGroupInformation(slug);assert.match(html,/data-stat-status="observed"/);assert.match(html,/0<em>次/);assert.match(html,/2026-10-29/);assert.doesNotMatch(html,/营销号|二手来源|非官方统计|<input|<form/);}
 assert.equal(api.groupInformationModel('triples').sales.observedValue,2118416);
});

test('current exact runtime pins match both changed data files and the complete pre-priority manifest remains recoverable',()=>{
 const guard=require('../scripts/udtt-private-build-assets-manifest.json'),before=beforePriorityGuard(guard),proof=require(base+'/guard-adoption.json');
 assert.deepEqual(proof.changes.map(c=>c.path).sort(),['data/group-statistics-completion-evidence.json','data/timeline-reported-records.json']);
 for(const c of proof.changes){const bytes=fs.readFileSync(path.join(__dirname,'..',c.path));assert.deepEqual(guard.runtimeGuards[c.path],{bytes:bytes.length,sha256:hash(bytes)});assert.deepEqual(before.runtimeGuards[c.path],c.before);}
 const a=structuredClone(guard),b=structuredClone(before);for(const c of proof.changes){delete a.runtimeGuards[c.path];delete b.runtimeGuards[c.path];}assert.deepEqual(a,b);
});
