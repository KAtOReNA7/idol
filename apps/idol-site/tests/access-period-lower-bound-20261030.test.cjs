'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {beforeAccessStatistics,beforeAccessGuard,receipt,guard:guardReceipt,sha}=require('./helpers/access-period-statistics-baseline.cjs');
const current=require('../data/group-statistics-completion-evidence.json'),manifest=require('../scripts/udtt-private-build-assets-manifest.json');
const research=require('../../../docs/codex/evidence/20261030-access-period-lower-bound/research.json');
const root=path.resolve(__dirname,'..'),sales=current.groups.triples.sales,e=sales.evidence,period=e.releasePeriodLowerBoundReplacements[0];
const bytesSha=bytes=>createHash('sha256').update(bytes).digest('hex'),sum=(rows,key)=>rows.reduce((n,row)=>n+row[key],0);

test('ACCESS restores complete statistics and manifest preimages, rejects unrelated edits and leaves every older SHA boundary intact',()=>{
 const before=beforeAccessStatistics(current);assert.equal(sha(before),receipt.beforeFileSha256);assert.deepEqual(before.groups.triples.sales,receipt.change.before);assert.deepEqual(beforeAccessStatistics(before),before);
 const oldManifest=beforeAccessGuard(manifest);assert.equal(sha(oldManifest),guardReceipt.beforeFileSha256);assert.deepEqual(beforeAccessGuard(oldManifest),oldManifest);
 for(const edit of [d=>d.groups.ive.sales.observedValue++,d=>d.groups.triples.sales.evidence.releasePeriodLowerBoundReplacements[0].netDelta++]){const changed=structuredClone(current);edit(changed);assert.throws(()=>beforeAccessStatistics(changed),/complete ACCESS statistics after-file/);}
 const changed=structuredClone(manifest);changed.runtimeGuards['data/timeline-reported-records.json'].sha256='0'.repeat(64);assert.throws(()=>beforeAccessGuard(changed),/complete ACCESS guard after-file/);
 assert.equal(sha(require('./helpers/priority-statistics-baseline.cjs').beforePriorityStatistics(current)),require('../../../docs/codex/evidence/20261030-priority-crosscheck/statistics-adoption.json').beforeFileSha256);
});

test('five exact Circle standard-edition Album_CNT rows establish a disjoint lower bound without inventing the missing Top100 week',()=>{
 assert.equal(e.releasePeriodLowerBoundReplacements.length,1);assert.equal(period.albumId,'70531');assert.equal(period.metricField,'Album_CNT');
 assert.deepEqual(period.newBasis.rows.map(row=>[row.year,row.week,row.sales]),[[2022,46,16992],[2022,47,4827],[2022,49,2009],[2022,50,1364],[2022,51,871]]);
 assert.equal(research.officialPeriodReads.length,5);let priorEnd='';
 for(const row of period.newBasis.rows){
  const capture=research.officialPeriodReads.find(c=>c.week===row.week);assert.ok(capture);assert.equal(capture.rowCount,100);assert.equal(capture.parameters.termGbn,'week');assert.equal(capture.parameters.nationGbn,'T');assert.equal(capture.parameters.hitYear,'2022');assert.equal(Number(capture.parameters.targetTime),row.week);assert.equal(capture.selectedRows.length,1);
  const raw=capture.selectedRows[0];assert.equal(raw.seq_aoa,'70531');assert.equal(raw.ARTIST_NAME,row.artist);assert.equal(raw.ALBUM_NAME,row.album);assert.equal(row.sales,Number(raw.Album_CNT));assert.notEqual(row.sales,Number(raw.Total_CNT));assert.equal(row.rank,Number(raw.SERVICE_RANKING));assert.equal(row.metricField,'Album_CNT');assert.equal(row.sourceUrl,capture.sourceUrl);assert.equal(row.responseSha256,capture.responseSha256);assert.equal(row.pageSha256,capture.pageSha256);assert.match(row.responseSha256,/^[a-f0-9]{64}$/);assert.ok(capture.periodLabels.includes(row.dateRange));
  const bounds=row.dateRange.match(/\d{4}\.\d{2}\.\d{2}/g).map(x=>x.replaceAll('.','-'));assert.ok(priorEnd<bounds[0]);assert.ok(bounds[1]<'2026-07-01');priorEnd=bounds[1];
 }
 const missing=research.overlapReview.find(row=>row.term==='week'&&row.time==='48');assert.equal(missing.rowCount,100);assert.deepEqual(missing.selectedRows,[]);assert.equal(period.newBasis.rows.some(row=>row.week===48),false);assert.equal(period.newBasis.missingWeek48IsZero,false);assert.equal(period.newBasis.fullPeriodCoverageClaimed,false);
});

test('the entire standard ACCESS contribution takes max of two lower bounds, adds only154 and keeps the Cosmo edition independent',()=>{
 assert.deepEqual(period.previousBasis.coveredMonthRows.map(row=>row.index),[35]);assert.deepEqual(period.previousBasis.coveredExistingWeekRows.map(row=>row.index),[0,1]);
 for(const row of period.previousBasis.coveredMonthRows)assert.deepEqual(e.monthRows[row.index],row.expectedBefore);
 for(const row of period.previousBasis.coveredExistingWeekRows)assert.deepEqual(e.weeklyAdditions[row.index],row.expectedBefore);
 const old=period.previousBasis.coveredMonthRows.reduce((n,row)=>n+row.expectedBefore.sales,0)+period.previousBasis.coveredExistingWeekRows.reduce((n,row)=>n+row.expectedBefore.sales,0),fresh=sum(period.newBasis.rows,'sales');assert.equal(old,25909);assert.equal(fresh,26063);assert.equal(period.previousBasis.contribution,old);assert.equal(period.newBasis.contribution,fresh);assert.equal(period.selectedContribution,Math.max(old,fresh));assert.equal(period.netDelta,period.selectedContribution-old);assert.equal(period.netDelta,154);
 const crossing=period.newBasis.rows.find(row=>row.week===49);assert.equal(crossing.dateRange,'2022.11.27~2022.12.03 (49)');assert.notEqual(period.selectedContribution,old+crossing.sales);assert.ok(sum(period.newBasis.rows.filter(row=>row.week===46||row.week===47),'sales')<e.monthRows[35].sales);assert.equal(e.weeklyAdditions.some(row=>row.albumId==='70531'&&row.year===2022&&row.week===49),false);
 const cosmo=research.cosmoIndependentRead.selectedRows[0];assert.equal(cosmo.seq_aoa,'78987');assert.equal(Number(cosmo.Album_CNT),6883);assert.notEqual(cosmo.seq_aoa,period.albumId);assert.equal(period.preservedCosmo.rowIndex,15);assert.equal(e.monthRows[15].sales,6883);assert.match(e.monthRows[15].album,/Cosmo/);assert.deepEqual(e.monthRows[15],receipt.change.before.evidence.monthRows[15]);
 const coveredMonths=new Set(e.releaseCumulativeReplacements.flatMap(row=>row.coversMonthRows.map(item=>item.index))),coveredWeeks=new Set(e.releaseCumulativeReplacements.flatMap(row=>row.coversExistingWeeklyRows.map(item=>item.index)));for(const row of period.previousBasis.coveredMonthRows)assert.equal(coveredMonths.has(row.index),false);for(const row of period.previousBasis.coveredExistingWeekRows)assert.equal(coveredWeeks.has(row.index),false);
 assert.equal(sum(e.monthRows,'sales')+sum(e.annualReplacements,'delta')+sum(e.weeklyAdditions,'sales')+sum(e.releaseCumulativeReplacements,'netDelta')+period.netDelta,2118570);
 assert.equal(receipt.netAdded,154);assert.equal(receipt.oldContribution,25909);assert.equal(receipt.newContribution,26063);
});

test('original36 months,13 weeks,two annual and two cumulative replacements, cutoff, unknown metrics and validated527 sources remain intact',()=>{
 const before=receipt.change.before,wholeBefore=beforeAccessStatistics(current);
 for(const [key,count] of [['monthRows',36],['weeklyAdditions',13],['annualReplacements',2],['releaseCumulativeReplacements',2]]){assert.equal(e[key].length,count);assert.deepEqual(e[key],before.evidence[key]);}
 for(const [slug,group] of Object.entries(current.groups))if(slug!=='triples')assert.deepEqual(group,wholeBefore.groups[slug]);
 for(const slug of ['spia','tracer','vcha','witchx'])assert.equal(current.groups[slug].sales.observedValue,null);
 assert.equal(sales.asOf,'2026-06');assert.equal(sales.asOf,before.asOf);assert.equal(sales.lowerBound,true);assert.equal(e.sourceDifferenceReview.aggregateTotal,2458789);assert.equal(e.sourceDifferenceReview.remainingDifference,340219);assert.equal(e.sourceDifferenceReview.status,'partially-resolved');assert.equal(e.sourceDifferenceReview.aggregateTotal-sales.observedValue,340219);assert.equal(e.sourceDifferenceReview.periodLowerBoundReplacementNet,154);assert.equal(e.sourceDifferenceReview.releaseCumulativeReplacementNet,5187);
 const stageBytes=fs.readFileSync(path.join(root,'data/stage-videos.json')),stageReceipt=require('../../../docs/codex/evidence/20261030-same-song-adoption/adoption.json');assert.equal(Object.keys(JSON.parse(stageBytes)).length,527);assert.equal(bytesSha(stageBytes),stageReceipt.after['data/stage-videos.json'].sha256);assert.equal(receipt.stageSourcesUnchanged,527);assert.equal(receipt.privateWrites,0);assert.equal(receipt.deployments,0);
});

test('the single current runtime pin and public card expose2118570 with340219 still unresolved and preserve personal input',()=>{
 const bytes=fs.readFileSync(path.join(root,'data/group-statistics-completion-evidence.json'));assert.equal(bytesSha(bytes),receipt.afterFileSha256);assert.deepEqual(manifest.runtimeGuards['data/group-statistics-completion-evidence.json'],{bytes:bytes.length,sha256:bytesSha(bytes)});assert.deepEqual(guardReceipt.changedPins,['data/group-statistics-completion-evidence.json']);
 const now=structuredClone(manifest),prior=structuredClone(guardReceipt.before);delete now.runtimeGuards['data/group-statistics-completion-evidence.json'];delete prior.runtimeGuards['data/group-statistics-completion-evidence.json'];assert.deepEqual(now,prior);
 const api=load('lib/idol/group-information.mjs'),input={note:'PRIVATE_ACCESS_CANARY',watched:true,average:9},before=structuredClone(input),model=api.groupInformationModel('triples',input),html=api.renderGroupInformation('triples',input);assert.equal(model.sales.observedValue,2118570);assert.equal(model.sales.observedValue,receipt.lowerBound);assert.equal(model.sales.lowerBound,true);assert.match(html,/<strong>2,118,570<em>张<\/em><\/strong>/);assert.match(html,/340,219/);assert.match(html,/来源差异继续开放/);assert.match(html,/不是全球完整累计/);assert.doesNotMatch(html,/PRIVATE_ACCESS_CANARY|<input|<form/);assert.deepEqual(input,before);
});
