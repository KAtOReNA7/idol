'use strict';
// Actual production renderer, canonical events and existing projection. No test
// content alias, network or writes. Snapshot access is reduced to public identities.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-production-'));
const registry=require('../data/artist-timeline-registry.json'),hashes=require('./fixtures/timeline/canonical-sha256.json'),accepted=require('./fixtures/timeline/batch-f-expected-events.json');
esbuild.buildSync({stdin:{contents:[...registry.map((g,i)=>`import Page${i} from './app/artists/${g.slug}/page';`),`export const routes={${registry.map((g,i)=>JSON.stringify(g.slug)+':Page'+i).join(',')}};`,"export {ArtistTimelineBackground} from './components/artist-timeline-background';","export {ArtistTimelineHost,ArtistTimelineHostProvider} from './components/artist-timeline-host';","export {projectArtistCatalog} from './lib/idol/artist-catalog';","export {prepareTimelinePresentation} from './lib/idol/timeline/presentation';","export {selectChronologicalTimeline} from './lib/idol/timeline/model';","export {loadArtistTimeline} from './lib/idol/timeline/production';","export {asIds,asText} from './lib/idol/values';","export {F} from './lib/idol/fields';"].join('\n'),resolveDir:root,sourcefile:'production-proof.ts'},bundle:true,outfile:path.join(dir,'bundle.cjs'),platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},alias:{'cloudflare:workers':path.join(root,'tests/fixtures/timeline/cloudflare-unavailable.cjs')},logLevel:'silent'});
const Module=require('node:module'),bundlePath=path.join(dir,'bundle.cjs'),bundle=new Module(bundlePath,module);bundle.filename=bundlePath;bundle.paths=module.paths;bundle._compile(fs.readFileSync(bundlePath,'utf8'),bundlePath);const product=bundle.exports;
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/snapshot.json'),'utf8')).tables;
const {asIds,asText,F}=product;
const catalog={mode:'snapshot',groups:registry.map(g=>({id:g.groupId,name:g.name})),members:raw.members.records.map(({recordId,fields:v})=>({id:recordId,name:asText(v[F.members.name]),stageName:asText(v[F.members.stageName]),cnName:asText(v[F.members.cnName]),groupIds:asIds(v[F.members.groups]),formerGroupIds:asIds(v[F.members.formerGroups]),favorite:null,role:'',status:'',birthDate:'',country:'',note:'',profile:'',photo:null})),works:raw.works.records.map(({recordId,fields:v})=>({id:recordId,song:asText(v[F.works.song]),name:asText(v[F.works.name]),groupIds:asIds(v[F.works.groups]),score:null,stageScore:null,watched:'',note:'',releaseDate:'',url:'',videoType:'',version:'',stage:null,stageSupplement:null})),ratings:raw.ratings.records.map(({recordId,fields:v})=>({id:recordId,memberIds:asIds(v[F.ratings.members]),workIds:asIds(v[F.ratings.works]),score:null,stylingScore:null,note:'',memory:'',photo:null})),counts:{}};
const before=JSON.stringify(catalog);
const categoryCorrections=require('../evidence/category-resolution-20261027/timeline-corrections.json');
let totalReady=0,totalHold=0;
for(const group of registry)test(`${group.slug}: canonical byte hash, actual scoped identities and exact ready-only production rendering`,async()=>{
 const file=group.slug+'.json',bytes=fs.readFileSync(path.join(root,'data/artist-timelines',file));
 if(group.slug==='triples'){
  const correction=require('../HANDOFF/timeline-corrections/triples-assemble24.json');
  const {validateCorrectionChain,hash}=require('./helpers/timeline-correction-chain.cjs');
  const events=new Map(registry.flatMap(g=>JSON.parse(fs.readFileSync(path.join(root,`data/artist-timelines/${g.slug}.json`))).events.map(e=>[e.id,e])));
  // This ledger predates the two independently verified official-source corrections.
  // Their exact before/after bytes and identities are checked below and in public-data-completion.
  for(const item of Object.values(require('../../../docs/codex/evidence/20261025-data-completion/timeline-evidence.json')))events.set(item.eventId,item.before);
  validateCorrectionChain({corrections:[correction,require('../evidence/approved-visual-repairs/badvillain-overstep-correction.json'),require('../evidence/approved-visual-repairs/madein-rise-correction.json')],events,ledger:require('../HANDOFF/batch-f/integration-ledger.json'),readBytes:p=>fs.readFileSync(path.join(root,p)),snapshot:{tables:raw}});
  assert.equal(hash(bytes),correction.afterDocumentSha256);
  const historical=JSON.parse(bytes);historical.events=historical.events.map(e=>e.id===correction.eventId?correction.before:e);
  assert.equal(hash(JSON.stringify(historical,null,2)+'\n'),hashes[file],'restoring only the recorded before event must reproduce the unchanged historical file hash');
  assert.equal(correction.beforeDocumentSha256,hashes[file]);
 }else if(['badvillain','madein'].includes(group.slug)){
  const correction=require('../evidence/approved-visual-repairs/'+(group.slug==='madein'?'madein-rise':'badvillain-overstep')+'-correction.json');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),correction.afterDocumentSha256);
  const historical=JSON.parse(bytes);historical.events=historical.events.map(e=>e.id===correction.eventId?correction.before:e);historical.gaps=correction.beforeGaps;
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(historical,null,2)+'\n').digest('hex'),hashes[file]);
  assert.equal(correction.beforeDocumentSha256,hashes[file]);
 }else if(['idle','newjeans'].includes(group.slug)){
  const correction=require('../../../docs/codex/evidence/20261025-data-completion/timeline-evidence.json')[group.slug];
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),correction.afterDocumentSha256);
  const historical=JSON.parse(bytes);historical.events=historical.events.map(e=>e.id===correction.eventId?correction.before:e);historical.gaps=correction.beforeGaps;
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(historical,null,2)+'\n').digest('hex'),hashes[file]);
  assert.equal(correction.beforeDocumentSha256,hashes[file]);
 }else if(categoryCorrections.documents.some(d=>d.slug===group.slug)){
  const d=categoryCorrections.documents.find(d=>d.slug===group.slug);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.afterDocumentSha256);
  const historical=JSON.parse(bytes);historical.events=historical.events.map(e=>categoryCorrections.corrections.find(c=>c.eventId===e.id)?.before??e);historical.gaps=d.beforeGaps;
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(historical,null,2)+'\n').digest('hex'),hashes[file]);assert.equal(d.beforeDocumentSha256,hashes[file]);
 }else assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hashes[file]);
 const input=JSON.parse(bytes),loaded=await product.loadArtistTimeline(group.slug);
 assert.deepEqual(loaded.input,input);assert.deepEqual(Object.keys(loaded),['input'],'retired display/background files are not loaded');
 const scoped=product.projectArtistCatalog(catalog,group.groupId);
 const presentation=product.prepareTimelinePresentation(input,scoped,registry);
 assert.equal(presentation.strictAudit.ok,true,JSON.stringify(presentation.issues));
 const renderRoute=serverRoute=>renderToStaticMarkup(React.createElement(product.ArtistTimelineHostProvider,{value:{catalog:scoped,input,hideLegacyBackground:true,loading:false,navigate(){},serverRoute}},React.createElement(product.routes[group.slug])));
 const ready=input.events.filter(e=>e.reviewStatus==='ready'),held=input.events.filter(e=>e.reviewStatus==='hold');
 const baselineGroup=accepted.groups[group.slug],riseId='e-madein-rise-release-carrier-hold';
 const promoted=group.slug==='madein'?riseId:group.slug==='idle'?'e-idle-cube-renewal':group.slug==='newjeans'?'e-newjeans-attention-mv':null;
 const promotedIds=[...(promoted?[promoted]:[]),...categoryCorrections.corrections.filter(c=>c.slug===group.slug).map(c=>c.eventId)];
 const acceptedGroup={...baselineGroup,ready:[...baselineGroup.ready,...promotedIds].sort(),hold:baselineGroup.hold.filter(id=>!promotedIds.includes(id))};
 assert.equal(input.groupId,acceptedGroup.groupId);
 assert.deepEqual(ready.map(e=>e.id).sort(),acceptedGroup.ready,'canonical ready IDs must equal the independently recorded accepted set');
 assert.deepEqual(held.map(e=>e.id).sort(),acceptedGroup.hold,'held IDs must remain the exact accepted set');
 const expected=product.selectChronologicalTimeline(input.events).map(e=>e.id);
 for(const query of ['?section=updates','?section=updates&timelineType=release&timelineImportance=major&timelineOrder=recent','?section=overview']){
  const html=renderRoute(group.path+query);
  const axis=html.match(/<section class="artist-timeline"[\s\S]*?<\/section>/)[0];
  const ids=[...axis.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...ids].sort(),acceptedGroup.ready,'actual page must render every accepted ready event and no other event');
  assert.deepEqual(ids,expected,'actual page always renders the same complete ascending ready sequence');
  assert.equal(new Set(ids).size,ids.length);for(const item of held)assert.ok(!ids.includes(item.id));
  assert.equal((axis.match(/class="at-list"/g)||[]).length,ready.length?1:0);
  assert.equal((html.match(/<h[1-6][^>]*>大事时间轴<\/h[1-6]>/g)||[]).length,1,'one visible timeline heading');
  assert.doesNotMatch(axis,/at-filters|at-background|at-sources|at-related|at-gaps|at-badges|来源与核验|范围说明|支持范围|重要事件|条待核资料|成员档案|作品档案/);
  assert.doesNotMatch(axis,/evidence\/E|B\/C\/D|E01|E02|沿用D原文|继承字段/);
  if(group.slug==='spia'){assert.deepEqual(ids,['e-spia-formal-debut-candidate','e-spia-deeeep-candidate']);assert.match(axis,/Daddy’s Little Girl/);assert.match(axis,/Deeeep/);assert.doesNotMatch(axis,/事件正在整理/);}
  if(group.slug==='adya'){assert.match(axis,/>书媛<\/button>/);assert.doesNotMatch(axis,/书媛 · Seowon/);assert.match(axis,/日期待确认/);}
  if(group.slug==='kep1er'){
   const former=scoped.members.filter(m=>m.formerGroupIds?.includes(group.groupId)&&!m.groupIds.includes(group.groupId));
   for(const member of former.filter(m=>ready.some(e=>e.memberIds.includes(m.id))))assert.ok(axis.includes(`data-timeline-target-id="${member.id}"`));
  }
  if(group.slug==='lesserafim'){assert.equal(ids.length,25);assert.match(axis,/公布宫胁咲良、金采源签约SOURCE MUSIC/);assert.match(axis,/发行第四张迷你专辑《CRAZY》/);assert.doesNotMatch(axis,/《CRAZY》数字发行|金佳蓝/);assert.match(axis,/金佳览暂停活动/);assert.match(axis,/宣布金佳览离团并解约/);}
 }
 totalReady+=ready.length;totalHold+=held.length;
 assert.equal(JSON.stringify(catalog),before);
});
test.after(()=>{assert.equal(registry.length,51);assert.equal(totalReady,616);assert.equal(totalHold,7);assert.deepEqual(Object.keys(accepted.groups).sort(),registry.map(g=>g.slug).sort());fs.rmSync(dir,{recursive:true,force:true});});
