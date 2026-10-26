import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {buildSync} from 'esbuild';
import vm from 'node:vm';
import {readReviewUrl} from '../lib/idol/udtt-native/model.mjs';
const require=createRequire(import.meta.url),root=path.resolve('.');
function load(file){const result=buildSync({entryPoints:[file],bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'}),module={exports:{}};vm.runInThisContext('(function(require,module,exports){'+result.outputFiles[0].text+'\n})')(require,module,module.exports);return module.exports;}
const posters=JSON.parse(fs.readFileSync('data/newjeans-video-posters.json'));
const {approvedVideoPoster}=load('lib/idol/approved-video-poster.ts');
test('17 additional NewJeans previews retain publisher bytes and exact work/video/view identity',()=>{
 assert.equal(posters.entries.length,17);
 assert.equal(new Set(posters.entries.map(x=>x.workId)).size,17);
 for(const p of posters.entries){
  const bytes=fs.readFileSync(path.join(root,'public',p.src));
  assert.equal(bytes.length,p.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);
  assert.deepEqual(p.intrinsicSize,{width:1280,height:720});
  assert.equal(approvedVideoPoster(p.workId,p.videoId,'mv')?.src,p.src);
  assert.equal(approvedVideoPoster(p.workId,'wrong-video','mv'),null);
  assert.notEqual(approvedVideoPoster('another-work',p.videoId,'mv')?.src,p.src);
  assert.notEqual(approvedVideoPoster(p.workId,p.videoId,'stage')?.src,p.src);
 }
});
test('UDTT supports canonical, directory and index entry URLs without accepting foreign or sibling paths',()=>{
 for(const suffix of ['', '/', '/index.html'])assert.equal(readReviewUrl('/artists/udtt'+suffix+'?section=members')?.page,'members');
 for(const url of ['https://foreign.test/artists/udtt','/artists/udtt-other','/artists/udtt/member','/artists/udtt//','/artists/udtt/../billlie'])assert.equal(readReviewUrl(url),null);
});
test('Lu Yuting biography uses a dated interview without inventing a precise joining date or changing stable ID',()=>{
 const data=JSON.parse(fs.readFileSync('data/member-careers/periods.json'));
 const rows=data.periods.filter(p=>p.memberId==='recvxAPQCF66Sl'&&p.groupId==='rec28ldfRTiDPs');
 assert.equal(rows.length,1);assert.equal(rows[0].periodId,'period:rec28ldfRTiDPs:recvxAPQCF66Sl:group_membership:2025-04-29:main');
 assert.equal(rows[0].startDate,null);assert.equal(rows[0].startDateBasis,null);
 assert.equal(rows[0].events[0].date,'2025-05-08');assert.match(rows[0].events[0].label,/精确入团日未公开/);
 const runtime=JSON.parse(fs.readFileSync('data/runtime/member-careers/periods.json'));
 const row=runtime.periods.find(p=>p.periodId===rows[0].periodId);
 assert.deepEqual(runtime.eventSets[row.eventSet].events,rows[0].events);
});

test('new supplement photos keep original bytes and historical VVUP identity cannot cross groups',()=>{
 for(const slug of ['vvup','saymyname','fromis9','itzy'])for(const p of JSON.parse(fs.readFileSync('data/'+slug+'-review-supplements.json')).assets){const b=fs.readFileSync('public'+p.url);assert.equal(b.length,p.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),p.sha256);}
 const {vvupMemberPortrait}=load('lib/idol/vvup-photos.ts');const m={id:'recvxAPQCFN2Tn',stageName:'Hyunny',groupIds:[],formerGroupIds:['rec28ldfRTiD8K']};const route='/artists/vvup?section=members&member='+m.id+'&roster=history';
 assert.match(vvupMemberPortrait(m,route).label,/历史/);assert.equal(vvupMemberPortrait(m,'/artists/fromis9'),null);assert.equal(vvupMemberPortrait({...m,id:'wrong'},route),null);assert.equal(vvupMemberPortrait({...m,stageName:'other'},route),null);assert.equal(vvupMemberPortrait({...m,formerGroupIds:[]},route),null);
});
