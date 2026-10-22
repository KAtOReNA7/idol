'use strict';
// Public design handoff comparison: preserve reviewed production identities and
// dates. Platform catalog dates and recording lineups are not new event proof.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const input=require('../data/artist-timelines/triples.json');
const {loadTimeline}=require('./timeline-test-loader.cjs');
const {selectChronologicalTimeline}=loadTimeline('model');
const {validateTimeline}=loadTimeline('validate');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'triples-timeline-')),output=path.join(dir,'component.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'../components/artist-timeline.tsx')],bundle:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
fs.symlinkSync(path.join(__dirname,'../node_modules'),path.join(dir,'node_modules'),'dir');
const {ArtistTimeline}=require(output);
test.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
// Minimal renderer registry seam; production identity/source closure is checked
// independently by timeline-batch-f-adoption and timeline-correction-chain.
const context={groups:[{groupId:input.groupId,slug:input.slug}],members:[],works:[...new Set(input.events.flatMap(e=>e.workIds))].map(id=>({id,groupIds:[input.groupId]}))};

test('tripleS retains 24 reviewed releases and eight handoff overlaps use existing identities',()=>{
 assert.equal(validateTimeline(input,context).ok,true);
 assert.equal(input.events.length,24);
 assert.equal(new Set(input.events.map(e=>e.releaseKey)).size,24);
 const overlaps=[
  ['e-triples-aaa-dimension-debut','2022-10-28','rec28ldfRTrBOX'],
  ['e-triples-assemble-ten-member-release','2023-02-13','rec28ldfRTrBTi'],
  ['e-triples-muhan-ep','2023-08-17','rec28ldfRTrC6f'],
  ['e-triples-mujuk-ep','2023-10-11','rec28ldfRTrCaw'],
  ['e-triples-assemble24-complete-phase','2024-05-08','rec28ldfRTrCjG'],
  ['e-triples-performante-unit-album','2024-10-23',null],
  ['e-triples-hatch-japan-debut-single-plan','2024-11-20','rec28ldfRTrCrz'],
  ['e-triples-assemble25-album','2025-05-12',null],
 ];
 for(const [id,date,workId] of overlaps){
  const event=input.events.find(e=>e.id===id);assert.ok(event,id);
  assert.deepEqual(event.eventDate,{value:date,precision:'day'});
  if(workId)assert.ok(event.workIds.includes(workId));
  assert.equal(event.reviewStatus,'ready');assert.equal(event.status,'confirmed');
  assert.ok(event.sources.every(s=>s.evidenceRef));
 }
 assert.ok(input.events.every(e=>e.memberIds.length===0),'recording lineups must not silently become event or MV casts');
 assert.ok(!input.events.some(e=>/Cherry Gene|Touch\+|4study4work4inst/.test(e.title)),'catalog-only candidates remain unpromoted');
});

test('tripleS actual shared renderer is a complete earliest-first read-only axis without audit prose',()=>{
 const before=JSON.stringify(input);
 const html=renderToStaticMarkup(React.createElement(ArtistTimeline,{input,context}));
 const ids=[...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]);
 const ordered=selectChronologicalTimeline(input.events);
 assert.deepEqual(ids,ordered.map(e=>e.id));assert.equal(ids.length,24);
 assert.equal(ordered[0].eventDate.value,'2022-10-28');assert.equal(ordered.at(-1).eventDate.value,'2026-10-16');
 assert.equal((html.match(/class="at-list"/g)||[]).length,1);
 assert.doesNotMatch(html,/L314|实际证据|目录号|原始发行日|未取被拒|不购买|来源与核验|at-sources|at-filters|at-gaps|<input|<select/);
 assert.match(html,/2024-11-20/);assert.doesNotMatch(html,/2024-11-18/,'MV publication must not replace the reviewed CD release date');
 assert.equal(JSON.stringify(input),before);
});
