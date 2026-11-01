import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {beforeFollowupStatistics, beforeGroupAdvanceStatistics} from './helpers/post-v200-statistics.cjs';

const data=JSON.parse(fs.readFileSync('data/group-statistics-completion-evidence.json','utf8'));
const historicalData=beforeGroupAdvanceStatistics(data);
const read=name=>JSON.parse(fs.readFileSync('../../docs/codex/evidence/20261028-post-v200/statistics/'+name,'utf8'));

test('only three evidenced sales records and summary counts change; unknowns stay unknown',()=>{
 const old=beforeFollowupStatistics(data);
 const a=structuredClone(data),b=structuredClone(old);
 for(const slug of ['triples','vvup','udtt']){delete a.groups[slug].sales;delete b.groups[slug].sales;}
 delete a.summary;delete b.summary;assert.deepEqual(a,b);
 assert.deepEqual(data.summary,{...old.summary,salesObserved:47,salesFallbackZero:4,salesLowerBoundsAdded:15});
 assert.equal(Object.values(data.groups).flatMap(g=>[...g.social,g.sales,g.wins]).filter(v=>v.observedValue===null).length,7);
 for(const slug of ['vvup','udtt']){assert.equal(data.groups[slug].sales.evidence.previousRecord.observedValue,null);assert.equal(data.groups[slug].sales.evidence.coverageComplete,false);}
});

test('eight tripleS weeks use exact period counts and cannot add overlapping source variants',()=>{
 const s=historicalData.groups.triples.sales,e=s.evidence,old=beforeFollowupStatistics(data).groups.triples.sales.evidence;
 assert.deepEqual(e.monthRows,old.monthRows);assert.deepEqual(e.annualReplacements,old.annualReplacements);
 assert.deepEqual(e.weeklyAdditions.slice(0,4),old.weeklyAdditions);
 const observations=read('triples-followup-observations.json'),newRows=e.weeklyAdditions.slice(4);
 assert.equal(newRows.length,4);assert.equal(newRows.reduce((n,r)=>n+r.sales,0),10068);
 for(const row of newRows){
  const source=observations.find(r=>r.term==='week'&&r.year===row.year&&r.period===row.week);
  const original=source.selectedRows.find(r=>r.seq_aoa===row.albumId);
  assert.equal(row.sales,Number(original.Album_CNT));assert.equal(row.album,original.ALBUM_NAME);
  assert.equal(row.metricField,'Album_CNT');assert(source.periodLabels.some(p=>p.label===row.dateRange));
 }
 const intervals=[];
 for(const review of e.weeklyOverlapReview)for(const span of review.newIntervals){
  const [start,end]=span.split('/');assert(start<=end);
  for(const row of review.existingSameVersionMonthRows){
   const month=`${row.year}-${String(row.month).padStart(2,'0')}`;
   assert.notEqual(start.slice(0,7),month);assert.notEqual(end.slice(0,7),month);
  }
  for(const other of intervals.filter(r=>r.id===review.albumId))assert(end<other.start||start>other.end);
  intervals.push({id:review.albumId,start,end});
 }
 assert.equal(intervals.length,8);
 assert.equal(e.weeklyAdditions.reduce((n,r)=>n+r.sales,0),15915);
 assert.equal(e.monthRows.reduce((n,r)=>n+r.sales,0)+e.annualReplacements.reduce((n,r)=>n+r.delta,0)+15915,2108154);
 assert.equal(s.observedValue,2108154);assert.equal(s.rawDisplay,'2,108,154+');
 assert.equal(e.sourceDifferenceReview.aggregateTotal-s.observedValue,350635);
 assert.equal(e.sourceDifferenceReview.remainingDifference,350635);
});

test('VVUP Album and UDTT Retail remain separate, scoped numeric observations',()=>{
 const v=data.groups.vvup.sales,u=data.groups.udtt.sales;
 assert.equal(v.evidence.chart,'Circle Album Chart');assert.equal(v.evidence.metricField,'Album_CNT');
 assert.equal(v.observedValue,1787);assert.equal(v.evidence.weekRows.length,1);
 assert.equal(v.evidence.periodStart,'2024-04-21');assert.equal(v.evidence.periodEnd,'2024-04-27');
 assert.equal(v.evidence.crossCheckOnly[0].sales,846);assert.equal(v.evidence.crossCheckOnly[0].contributesToAdoptedValue,false);
 assert.equal(u.evidence.chart,'Circle Retail Album Chart');assert.equal(u.observedValue,103);
 assert.equal(new Set(u.evidence.dayRows.map(r=>r.date+'|'+r.barcode)).size,2);
 assert.equal(u.evidence.dayRows.reduce((n,r)=>n+Number(r.rawRow.rowSum),0),103);
 assert(u.evidence.dayRows.every(r=>r.sales===Number(r.rawRow.KSum)+Number(r.rawRow.ESum)));
 assert.equal(u.evidence.periodType,'selected_days');
});

test('cards show the actual week or selected days, without claiming complete cumulative coverage',async()=>{
 const bundle=await build({entryPoints:['lib/idol/group-information.mjs'],bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
 const {renderGroupInformation}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 const v=renderGroupInformation('vvup',{}),u=renderGroupInformation('udtt',{}),g=renderGroupInformation('geenius',{});
 assert.match(v,/>已核专辑销量</);assert.match(v,/>1,787<em>张/);assert.match(v,/统计周 2024-04-21—2024-04-27/);
 assert.doesNotMatch(v,/>唱片累计销量</);assert.doesNotMatch(v,/统计日 2024-04-27/);
 assert.match(u,/>已核零售销量</);assert.match(u,/>103<em>张/);assert.match(u,/统计日 2025-05-01、2026-07-10/);
 assert.match(u,/不是两个日期之间连续累计/);assert.doesNotMatch(u,/>唱片累计销量</);
 assert.match(g,/统计日 2026-05-18/);assert.match(g,/>217<em>张/);
});
