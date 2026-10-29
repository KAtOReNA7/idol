import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {build} from 'esbuild';
import restoreHeyGabbyReviewBaseline from './helpers/heygabby-review-baseline.cjs';
import {beforePostV200Stages,beforePostV200StageStatuses} from './helpers/post-v200-stages.cjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(sort(v))).digest('hex');
const receipt=read('../../docs/codex/evidence/20261028-continuous/stage-viewing-adoption.json');
const data=read('data/stages/supplements.json');
async function moduleFrom(entry){const result=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',alias:{'@':'./'}});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}
const {validStageAlternative,stageSupplementForWork}=await moduleFrom('lib/idol/supplements.ts');
const {stageSourceKey,stageHasValidBinding}=await moduleFrom('lib/idol/stage-source.ts');

test('eight historical viewing alternatives retain read-only semantics after formal adoption',()=>{
 assert.equal(receipt.adopted.length,8);
 assert.equal(new Set(receipt.adopted.map(r=>r.workId)).size,8);
 for(const row of receipt.adopted){
  const items=stageSupplementForWork(row.workId).alternatives.filter(a=>a.sourceId===row.videoId);
  assert.equal(items.length,1);const a=items[0];
  assert.equal(hash(a),row.sha256);assert.equal(validStageAlternative(a),true);
  assert.equal(a.scorePolicy,'view_only');assert.equal('scoreBinding' in a,false);
  assert.equal(stageSourceKey({...a,videoId:a.sourceId}),null);
  assert.equal(stageHasValidBinding({...a,videoId:a.sourceId}),false);
  assert.equal(a.selection.occasion,row.occasion);assert.equal(a.version.match,'exact');
  assert.match(a.kind,/未完整/);assert.match(a.version.evidence.note,/未完整播放或逐句/);
 }
 assert.equal(receipt.adopted.filter(a=>a.occasion==='music_program').length,2);
 assert.equal(receipt.adopted.filter(a=>a.occasion==='practice_room').length,6);
});

test('prior supplements and non-target sources stay unchanged; eight adopted sources retain full history',()=>{
 const adoption=read('../../docs/codex/evidence/20261028-continuous/stage-replacement-adoption.json');
 const beforeStages=beforePostV200Stages(read('data/stage-videos.json'));
 const beforeStatuses=beforePostV200StageStatuses(read('data/stages/status.json'));
 for(const row of adoption.items){
  assert.equal(hash(beforeStages[row.recordId]),row.afterSha256);
  beforeStages[row.recordId]=structuredClone(row.before);
  beforeStatuses.works[row.recordId]=structuredClone(row.beforeStatus);
 }
 Object.assign(beforeStatuses,adoption.preservation.statusMetadataBefore);
 const reconstruct={'data/stage-videos.json':beforeStages,'data/stages/status.json':beforeStatuses};
 const historicalSupplements=restoreHeyGabbyReviewBaseline(data);
 for(const [id,expected] of Object.entries(receipt.oldRows))assert.equal(hash(historicalSupplements.works[id]),expected,id);
 for(const [file,expected] of Object.entries(receipt.protectedFiles)){
  const bytes=reconstruct[file]?Buffer.from(JSON.stringify(reconstruct[file],null,2)+'\n'):fs.readFileSync(file);
  assert.equal(hash(bytes),expected,file+' historical cohort with authorized replacements restored');
 }
 const stages=beforePostV200Stages(read('data/stage-videos.json'));assert.equal(Object.keys(stages).length,493);
 for(const row of receipt.adopted){
  assert.equal(hash(beforeStages[row.workId]),row.retainedSourceSha256);
  assert.equal(stages[row.workId].videoId,row.videoId);
  assert.equal(stageHasValidBinding(stages[row.workId]),true);
 }
 assert.equal(receipt.scoreBindingsChanged,0);assert.equal(receipt.privateWrites,0);
});

test('the existing player uses the selected source and hides duplicate viewing links',()=>{
 const page=fs.readFileSync('app/page.tsx','utf8');
 const section=page.slice(page.indexOf('function StageSupplements('),page.indexOf('function PageTitle('));
 assert.match(section,/仅供观看，不用于本条舞台评分/);
 assert.match(section,/href=\{a.url\}/);assert.doesNotMatch(section,/RecordEditor|stageVideoId=|iframe|setStage/);
 assert.match(section,/stageMatchesAlternative\(work.stage!,a\)/,'a subsequently adopted exact source is hidden from duplicate alternatives');
});
