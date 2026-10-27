import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {build} from 'esbuild';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=read('data/stages/supplements.json');
const evidence=read('../../docs/codex/evidence/20261027-category-resolution/stages/viewing-supplements-adoption.json');
const sort=(v)=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const hash=(s)=>crypto.createHash('sha256').update(s).digest('hex');
const bundle=await build({entryPoints:['lib/idol/supplements.ts'],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',alias:{'@':'./'}});
const {validStageAlternative,stageSupplementForWork}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));

test('six new public viewing alternatives validate and never acquire score bindings',()=>{
 assert.equal(evidence.adopted.length,6);
 for(const entry of evidence.adopted){
  const items=stageSupplementForWork(entry.workId).alternatives.filter(a=>a.sourceId===entry.videoId);
  assert.equal(items.length,1);const a=items[0];
  assert.equal(validStageAlternative(a),true);assert.equal(a.scorePolicy,'view_only');
  assert.equal('scoreBinding' in a,false);assert.match(a.kind+a.version.evidence.note,/未完整/);
  assert.ok(['unconfirmed','different'].includes(a.version.match));
 }
 const voltage=data.works.recvxyOz5XkyEY.alternatives.find(a=>a.sourceId==='1_sylBku10M');
 assert.equal(voltage.completeness,'excerpt');assert.equal(voltage.durationSeconds,169);assert.equal(voltage.version.match,'different');
 const rock=data.works.recvxDMFHNzJyr.alternatives.find(a=>a.sourceId==='0B0rjBk66t8');
 assert.match(rock.version.differences.join(' '),/歌词与原音源不同/);
});

test('all prior supplement records and formal stage files are preserved',()=>{
 for(const [id,baseline]of Object.entries(evidence.preservation.oldRows)){
  const row=structuredClone(data.works[id]);
  row.alternatives=row.alternatives.slice(0,baseline.alternativeCount);
  if(baseline.hadWatchLeads)row.watchLeads=row.watchLeads.slice(0,baseline.watchLeadCount);else delete row.watchLeads;
  assert.equal(hash(JSON.stringify(sort(row))),baseline.hash,id);
 }
 for(const [file,expected]of Object.entries(evidence.preservation.protectedFiles))assert.equal(hash(fs.readFileSync(file)),expected,file);
});

test('existing Best Friendz uncertainty and ROTY shortened chapter are not duplicated or promoted',()=>{
 const odd=data.works.rec28ldfRTrGY0.alternatives.filter(a=>a.sourceId==='r1H2CzwNETU');
 assert.equal(odd.length,1);assert.equal(odd[0].version.match,'unconfirmed');assert.match(JSON.stringify(odd[0]),/English/);
 const roty=data.works.rec28ldfRTrGj0.alternatives.filter(a=>a.sourceId==='nd9bPkKg3og');
 assert.equal(roty.length,1);assert.equal(roty[0].completeness,'excerpt');assert.equal(roty[0].version.match,'different');
 const retained=evidence.retained.find(r=>r.videoId==='nd9bPkKg3og');
 assert.equal(retained.publisherNextChapterSeconds-retained.leadTimeSeconds,168);
 assert.ok(retained.publisherNextChapterSeconds<retained.wholeVideoSeconds);
 assert.equal(evidence.summary.formalSelectedStages,0);assert.equal(evidence.summary.scoreBindings,0);
});
