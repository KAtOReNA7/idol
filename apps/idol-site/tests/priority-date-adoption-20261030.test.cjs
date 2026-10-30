'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {beforePriorityTimelineBytes,beforePriorityReportedRecords,receipt}=require('./helpers/priority-date-baseline.cjs');
const built=require('esbuild').buildSync({stdin:{contents:"export {ArtistTimeline} from './components/artist-timeline';export {TimelineReportedRecords} from './components/timeline-reported-records';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
const componentModule=new (require('node:module'))(__filename,module);componentModule.filename=__filename;componentModule.paths=module.paths;componentModule._compile(built.outputFiles[0].text,__filename);
const {ArtistTimeline,TimelineReportedRecords}=componentModule.exports;
const {tree,find}=require('./helpers/timeline-production-renderers.cjs');
const {F}=load('lib/idol/fields.ts'),{asIds}=load('lib/idol/values.ts');
const root=path.resolve(__dirname,'..'),registry=require('../data/artist-timeline-registry.json'),snapshot=require('../data/snapshot.json').tables;
const report=require('../data/timeline-reported-records.json');
const context={groups:registry,members:snapshot.members.records.map(r=>({id:r.recordId,groupIds:[...new Set([...asIds(r.fields[F.members.groups]),...asIds(r.fields[F.members.formerGroups])])]})),works:snapshot.works.records.map(r=>({id:r.recordId,groupIds:asIds(r.fields[F.works.groups])}))};
const doc=slug=>JSON.parse(fs.readFileSync(path.join(root,'data/artist-timelines',slug+'.json')));
const expected={
 'e-candyshop-yuina-hiatus-announcement':{value:'2024-05-09',precision:'day'},
 'e-atheart-aurora-hiatus-observed':{value:'2025-07',precision:'month'},
 'e-udtt-sena-predebut-departure-candidate':{value:'2025-03-26',precision:'day'},
 'e-geenius-spoiler-book-instrumental':{value:'2026-01-15',precision:'day'},
 'e-bewave-six-member-phase-end-announcement':{value:'2025-10-31',precision:'day'},
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');

test('five reviewed promotions restore complete previous documents and report bytes; unrelated edits fail closed',()=>{
 assert.deepEqual(receipt.changes.map(c=>c.eventId).sort(),Object.keys(expected).sort());
 for(const d of receipt.documents){
  const bytes=fs.readFileSync(path.join(root,'data/artist-timelines',d.slug+'.json'));
  assert.equal(hash(beforePriorityTimelineBytes(d.slug,bytes)),d.beforeSha256);
  const tampered=JSON.parse(bytes);tampered.events.find(e=>e.id!==receipt.changes.find(c=>c.slug===d.slug).eventId).summary+=' changed';
  assert.throws(()=>beforePriorityTimelineBytes(d.slug,Buffer.from(JSON.stringify(tampered,null,2)+'\n')),/complete reviewed priority date/);
 }
 const old=beforePriorityReportedRecords(report);assert.deepEqual(old,JSON.parse(receipt.reportDocument.expectedBeforeText));assert.equal(hash(receipt.reportDocument.expectedBeforeText),receipt.reportDocument.beforeSha256);
 const wrong=structuredClone(report);wrong.records[0].summary+=' changed';assert.throws(()=>beforePriorityReportedRecords(wrong),/complete reviewed priority reporting/);
});

test('dates retain exact approved precision and every existing relationship identity; only two original holds remain',()=>{
 for(const c of receipt.changes){
  const current=doc(c.slug).events.find(e=>e.id===c.eventId);assert.deepEqual(current,c.after);assert.deepEqual(current.eventDate,expected[c.eventId]);
  assert.equal(current.reviewStatus,'ready');assert.equal(current.status,'confirmed');assert.deepEqual(current.holdReasons,[]);
  for(const field of ['id','groupId','eventType','memberIds','workIds','releaseKey','relatedEventIds'])assert.deepEqual(current[field],c.before[field]);
  assert.ok(c.before.sources.every(s=>current.sources.some(n=>JSON.stringify(n)===JSON.stringify(s))),'original source objects retained');
 }
 const events=registry.flatMap(g=>doc(g.slug).events);assert.equal(events.length,623);assert.equal(events.filter(e=>e.reviewStatus==='ready').length,621);
 assert.deepEqual(events.filter(e=>e.reviewStatus==='hold').map(e=>e.id).sort(),['e-atheart-aurora-second-hiatus-announcement','e-udtt-jessica-provisional-join-candidate']);
 for(const [slug,id] of [['atheart','e-atheart-aurora-second-hiatus-announcement'],['udtt','e-udtt-jessica-provisional-join-candidate']]){
  const current=doc(slug).events.find(e=>e.id===id),old=JSON.parse(beforePriorityTimelineBytes(slug,Buffer.from(JSON.stringify(doc(slug),null,2)+'\n'))).events.find(e=>e.id===id);
  assert.deepEqual(current,old);assert.equal(current.eventDate,null);
 }
 assert.equal(receipt.privateWrites,0);assert.equal(receipt.relationshipEdits,0);
 for(const [file,sha] of Object.entries({
  'data/snapshot.json':'dedbfb37f19a55d9cc1916ddb0a0ae21e537843343956731fe4089ade6606547',
  'lib/idol/native-save.ts':'6952167d3f95970ffe6371af32993edd01c65227276d9b25b4f08656e1a7fef9',
  'lib/idol/save.ts':'497adc25957399615f0fe9fdcb5b2ef052097220e044e5ac8526ac8e73756887',
 }))assert.equal(hash(fs.readFileSync(path.join(root,file))),sha,'unchanged personal fields, IDs, relations and owner write checks '+file);
});

test('actual shared rendering displays each promoted fact once with month precision and keeps unresolved facts on separate reporting cards',()=>{
 for(const d of receipt.documents){
  const input=doc(d.slug),before=structuredClone(input),html=renderToStaticMarkup(React.createElement(ArtistTimeline,{input,context}));
  for(const c of receipt.changes.filter(c=>c.slug===d.slug)){
   assert.equal((html.match(new RegExp('data-timeline-event-id="'+c.eventId+'"','g'))||[]).length,1);
   assert.ok(find(tree(html),n=>n.tag==='time'&&n.attrs.datetime===c.after.eventDate.value).length);assert.equal(html.includes('data-reported-record="'+c.eventId+'"'),false);
  }
  for(const held of input.events.filter(e=>e.reviewStatus==='hold')){
   assert.ok(html.includes('data-reported-record="'+held.id+'"'));assert.equal((html.match(new RegExp('data-timeline-event-id="'+held.id+'"','g'))||[]).length,1);
  }
  if(d.slug==='atheart'){assert.ok(html.includes('2025 年 7 月'));assert.equal(find(tree(html),n=>n.tag==='time'&&n.attrs.datetime==='2025-07-01').length,0);}
  assert.deepEqual(input,before);
 }
});

test('native approved reporting variants retain the new dates, exact original aliases and safe sources without adding editable fields',()=>{
 for(const [slug,variant] of [['bewave','bewave'],['candyshop','candyshop'],['geenius','geenius']]){
  const c=receipt.changes.find(c=>c.slug===slug),before=structuredClone(report);
  const html=renderToStaticMarkup(React.createElement(TimelineReportedRecords,{slug,groupId:c.after.groupId,variant}));
  assert.ok(html.includes('data-reported-record="'+c.eventId+'"'));assert.ok(find(tree(html),n=>n.tag==='time'&&n.attrs.datetime===c.after.eventDate.value).length);
  assert.match(html,/相关动态/);assert.doesNotMatch(html,/<input|<textarea|<form|生效日期未确认|营销号/);
  for(const id of c.reportBefore.legacyNativeIds)assert.ok(html.includes('id="'+id+'"'));
  for(const s of c.reportAfter.sources)assert.ok(html.includes(s.url.replaceAll('&','&amp;')));
  assert.deepEqual(report,before);
 }
 const c=receipt.changes.find(c=>c.slug==='udtt'),{render,helpers}=(()=>{const p=load('lib/idol/udtt-native/presentation.mjs'),m=load('lib/idol/udtt-native/model.mjs');return {render:p.render,helpers:m.helpers};})();
 const html=render({route:{page:'timeline',key:null,query:new URLSearchParams()},helpers,catalog:null,canEdit:false});
 assert.ok(html.includes(c.eventId));assert.ok(html.includes(c.after.eventDate.value));assert.doesNotMatch(html,/<input|<textarea|<form/);
});
