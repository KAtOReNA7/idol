const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const data=require('../data/group-statistics-completion-evidence.json');
const {beforeNextFollowupStatistics,receipt}=require('./helpers/next-followup-statistics.cjs');
const proof=require('../../../docs/codex/evidence/20261029-next-followup/triples-independent-readback.json');
const sum=(a,k)=>a.reduce((n,r)=>n+r[k],0),sha=x=>createHash('sha256').update(x).digest('hex');
test('two disjoint Album_CNT weeks extend only the verified lower bound and preserve all other statistics',()=>{
 const before=beforeNextFollowupStatistics(data),sales=data.groups.triples.sales,old=before.groups.triples.sales,e=sales.evidence;
 assert.equal(sales.observedValue,2113229);assert.equal(sales.displayValue,2113229);assert.equal(sales.asOf,'2026-06');assert.equal(sales.lowerBound,true);
 assert.equal(e.weeklyAdditions.length,13);assert.deepEqual(e.weeklyAdditions.slice(0,11),old.evidence.weeklyAdditions);
 assert.deepEqual(e.weeklyAdditions.slice(11).map(r=>[r.albumId,r.year,r.week,r.sales]),[['78104',2024,48,1162],['81284',2026,2,1234]]);
 assert.equal(sum(e.weeklyAdditions.slice(11),'sales'),2396);assert.equal(sum(e.monthRows,'sales')+sum(e.annualReplacements,'delta')+sum(e.weeklyAdditions,'sales'),2113229);
 assert.equal(e.sourceDifferenceReview.remainingDifference,345560);assert.equal(e.sourceDifferenceReview.status,'partially-resolved');
 for(const k of ['monthRows','annualReplacements'])assert.deepEqual(e[k],old.evidence[k]);
 const a=structuredClone(data),b=structuredClone(before);delete a.groups.triples.sales;delete b.groups.triples.sales;assert.deepEqual(a,b);
 const unknown=Object.values(data.groups).flatMap(g=>[...g.social,g.sales,g.wins]).filter(v=>v.observedValue===null);assert.equal(unknown.length,7);
 for(const row of e.weeklyAdditions.slice(11)){
  const capture=proof.find(r=>r.sourceUrl===row.sourceUrl);assert.equal(capture.http,200);assert.equal(row.sales,Number(capture.row.Album_CNT));assert.notEqual(row.sales,Number(capture.row.Total_CNT));
  assert.equal(row.albumId,capture.row.seq_aoa);assert.equal(row.album,capture.row.ALBUM_NAME);
  const interval=s=>s.match(/\d{4}\.\d{2}\.\d{2}/g).map(s=>s.replaceAll('.','-')),current=interval(row.dateRange);
  const overlap=(x,y)=>x[0]<=y[1]&&y[0]<=x[1];
  for(const r of e.weeklyAdditions.filter(r=>r!==row&&r.albumId===row.albumId))assert.equal(overlap(current,interval(r.dateRange)),false);
  for(const r of e.monthRows.filter(r=>r.album===row.album)){const m=`${r.year}-${String(r.month).padStart(2,'0')}`;assert.equal(overlap(current,[m+'-01',m+'-'+new Date(Date.UTC(r.year,r.month,0)).getUTCDate()]),false);}
  assert.ok(!e.officialAnnualReadback20261028.observations.some(r=>r.albumId===row.albumId));
 }
});
test('the runtime guard pins the exact new statistics bytes and every other protected entry is unchanged',()=>{
 const guard=require('../scripts/udtt-private-build-assets-manifest.json'),r=guard.runtimeGuards['data/group-statistics-completion-evidence.json'];
 const file=fs.readFileSync(path.join(__dirname,'../data/group-statistics-completion-evidence.json'));assert.deepEqual(r,{bytes:file.length,sha256:sha(file)});assert.deepEqual(r,receipt.guardChange.after);
 const prior=JSON.parse(require('node:child_process').execFileSync('git',['show','ec9efbc590673b8bbb98e6c98db303303a3b8aa0:apps/idol-site/scripts/udtt-private-build-assets-manifest.json'],{cwd:path.join(__dirname,'..'),encoding:'utf8'}));
 const restored=structuredClone(guard);restored.runtimeGuards['data/group-statistics-completion-evidence.json']=receipt.guardChange.expectedBefore;assert.deepEqual(restored,prior);
});
