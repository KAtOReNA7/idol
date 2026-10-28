import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {beforePostV200Statistics, beforeFollowupStatistics} from './helpers/post-v200-statistics.cjs';
const currentData=JSON.parse(fs.readFileSync('data/group-statistics-completion-evidence.json','utf8'));
const data=beforeFollowupStatistics(currentData);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const read=p=>JSON.parse(fs.readFileSync('../../docs/codex/evidence/20261028-post-v200/statistics/'+p,'utf8'));
test('only two reviewed sales objects and scoped summary counts change from v200',()=>{
 const old=beforePostV200Statistics(currentData);
 const expected=JSON.parse(fs.readFileSync('../../docs/codex/evidence/20261028-v200/statistics/user-x-observations.json','utf8'));
 assert.equal(hash(old),expected.proposedAfterDataSha256Canonical);
 assert.deepEqual(data.summary,{...old.summary,salesObserved:45,salesFallbackZero:6,salesLowerBoundsAdded:13});
 assert.equal(Object.values(data.groups).flatMap(g=>[...g.social,g.sales,g.wins]).filter(v=>v.observedValue===null).length,9);
});
test('Geenius is exactly one official Retail day, with unavailable cumulative history retained',()=>{
 const s=data.groups.geenius.sales,capture=read('geenius-retail-observations.json').find(r=>r.parameters.yyyymmdd==='20260518');
 const r=capture.selectedRows.find(r=>r.Barcode==='8800331307821');
 assert.equal(s.observedValue,Number(r.rowSum));assert.equal(s.observedValue,217);
 assert.equal(Number(r.KSum)+Number(r.ESum),217);
 assert.equal(s.evidence.previousRecord.observedValue,null);
 assert.equal(s.evidence.dayRows.length,1);assert.equal(s.evidence.coverageComplete,false);
 assert.match(s.scope,/不是Circle Album.*不是全团/);
});
test('four weekly additions are disjoint from each other and same-variant covered month intervals',()=>{
 const q=read('triples-weekly-proposal.json'),s=data.groups.triples.sales,e=s.evidence;
 assert.equal(e.monthRows.length,36);assert.equal(e.annualReplacements.length,2);
 assert.equal(e.weeklyAdditions.reduce((n,r)=>n+r.sales,0),5847);
 assert.equal(e.monthRows.reduce((n,r)=>n+r.sales,0)+e.annualReplacements.reduce((n,r)=>n+r.delta,0)+5847,s.observedValue);
 assert.equal(s.observedValue,2098086);assert.equal(e.sourceDifferenceReview.aggregateTotal-s.observedValue,360703);
 const periods=[];
 for(const review of q.overlapReview)for(const interval of review.newIntervals){
  const [start,end]=interval.split('/');assert.ok(start<=end);
  for(const r of review.existingSameVersionMonthRows){assert.notEqual(start.slice(0,7),`${r.year}-${String(r.month).padStart(2,'0')}`);assert.notEqual(end.slice(0,7),`${r.year}-${String(r.month).padStart(2,'0')}`);}
  for(const p of periods.filter(p=>p.id===review.albumId))assert.ok(end<p.start||start>p.end);
  periods.push({id:review.albumId,start,end});
 }
 assert.equal(periods.length,4);assert.ok(e.weeklyAdditions.every(r=>r.metricField==='Album_CNT'));
});
test('rendered Retail card cannot claim total album sales; source details expose scope and actual day',async()=>{
 const bundle=await build({entryPoints:['lib/idol/group-information.mjs'],bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
 const {renderGroupInformation}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 const html=renderGroupInformation('geenius',{});
 assert.match(html,/>已核零售销量</);assert.match(html,/<strong>217<em>张<\/em><\/strong>/);
 assert.match(html,/已核单日零售下界/);assert.match(html,/统计日 2026-05-18/);
 assert.doesNotMatch(html,/<span>唱片累计销量<\/span>/);assert.match(html,/不是全团、全渠道或全球完整累计/);
 assert.match(html,/circlechart.kr\/page_chart\/retail.circle/);
});
