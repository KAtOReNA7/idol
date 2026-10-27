'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),registry=require('../data/artist-timeline-registry.json'),snapshot=require('../data/snapshot.json').tables;
const output=esbuild.buildSync({stdin:{contents:"export {ArtistTimeline} from './components/artist-timeline'; export {validateTimeline} from './lib/idol/timeline/validate'; export {F} from './lib/idol/fields'; export {asIds} from './lib/idol/values';",resolveDir:root,sourcefile:'category-resolution-test.tsx'},write:false,bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
const bundle=new Module(path.join(root,'category-resolution-test.cjs'),module);bundle.paths=module.paths;bundle._compile(output.outputFiles[0].text,bundle.id);const {ArtistTimeline,validateTimeline,F,asIds}=bundle.exports;
const context={groups:registry,members:snapshot.members.records.map(r=>({id:r.recordId,groupIds:[...new Set([...asIds(r.fields[F.members.groups]),...asIds(r.fields[F.members.formerGroups])])]})),works:snapshot.works.records.map(r=>({id:r.recordId,groupIds:asIds(r.fields[F.works.groups])}))};
const corrections=require('../evidence/category-resolution-20261027/timeline-corrections.json');
for(const slug of ['ifeye','genblue','rocketpunch'])test(`${slug}: fixed promotions validate and render with announcement/plan boundaries`,()=>{
 const doc=JSON.parse(fs.readFileSync(path.join(root,'data/artist-timelines',slug+'.json'))),before=JSON.stringify(doc),result=validateTimeline(doc,context);
 assert.equal(result.ok,true,JSON.stringify(result.issues));
 const html=renderToStaticMarkup(React.createElement(ArtistTimeline,{input:doc,context}));
 const ids=[...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual([...ids].sort(),doc.events.filter(e=>e.reviewStatus==='ready').map(e=>e.id).sort());
 for(const c of corrections.corrections.filter(c=>c.slug===slug)){
  assert.ok(ids.includes(c.eventId));
  const node=html.slice(html.indexOf(`data-timeline-event-id="${c.eventId}"`)).split('</article>')[0];
  if(slug==='ifeye'&&c.after.eventType==='resume'){assert.match(node,/计划/);assert.match(node,/2026-06-15/);assert.equal(c.after.plannedDate.value,'2026-07-01');assert.equal(c.after.eventDate,null);}
  if(slug==='rocketpunch'){assert.match(node,/公布|公开|宣布/);assert.match(node,/2026-08-06/);assert.equal(c.after.eventDate,null);}
  if(slug==='genblue'){assert.match(node,/数字发行/);assert.match(node,new RegExp(c.after.eventDate.value));}
 }
 assert.equal(JSON.stringify(doc),before,'rendering must never mutate data');
});
test('all seven unresolved holds retain exact baseline objects and remain hidden',()=>{
 const ledger=require('../HANDOFF/batch-f/integration-ledger.json');const {digest}=require('./helpers/timeline-correction-chain.cjs');
 const held=[];let ready=0,total=0;
 for(const g of registry){const d=JSON.parse(fs.readFileSync(path.join(root,'data/artist-timelines',g.slug+'.json')));total+=d.events.length;ready+=d.events.filter(e=>e.reviewStatus==='ready').length;for(const e of d.events.filter(e=>e.reviewStatus==='hold')){held.push(e.id);assert.equal(digest(e),ledger.events.find(r=>r.eventId===e.id).adoptedEventSha256);}}
 assert.equal(total,623);assert.equal(ready,616);assert.equal(held.length,7);assert.equal(new Set(held).size,7);
});
