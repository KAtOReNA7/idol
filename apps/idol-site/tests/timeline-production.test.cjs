'use strict';
// Actual production renderer, canonical events and existing projection. No test
// content alias, network or writes. Snapshot access is reduced to public identities.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const esbuild=require('esbuild'),React=require('react');
const {markup,tree,find,text,hasClass,reported,eventId,mountAstra}=require('./helpers/timeline-production-renderers.cjs');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-production-'));
const registry=require('../data/artist-timeline-registry.json'),hashes=require('./fixtures/timeline/canonical-sha256.json'),accepted=require('./fixtures/timeline/batch-f-expected-events.json');
esbuild.buildSync({stdin:{contents:[...registry.map((g,i)=>`import Page${i} from './app/artists/${g.slug}/page';`),`export const routes={${registry.map((g,i)=>JSON.stringify(g.slug)+':Page'+i).join(',')}};`,"export {ArtistTimelineHost,ArtistTimelineHostProvider} from './components/artist-timeline-host';","export {projectArtistCatalog} from './lib/idol/artist-catalog';","export {prepareTimelinePresentation} from './lib/idol/timeline/presentation';","export {selectChronologicalTimeline} from './lib/idol/timeline/model';","export {loadArtistTimeline} from './lib/idol/timeline/production';","export {asIds,asText} from './lib/idol/values';","export {F} from './lib/idol/fields';","export {createAstraRuntime} from './lib/idol/izna-runtime/runtime.mjs';","export {createIznaModule} from './lib/idol/izna-runtime/izna.mjs';","export {createIfeyeModule} from './lib/idol/ifeye-runtime/ifeye.mjs';","export {prepareIznaDisplayData} from './lib/idol/izna-native';","export {prepareIfeyeDisplayData} from './lib/idol/ifeye-native';","export {artistUrl as astraArtistUrl,validRoute as validAstraRoute} from './lib/idol/izna-runtime/model.mjs';","export {render as renderUdtt,artist as udttArtist} from './lib/idol/udtt-native/presentation.mjs';","export {helpers as udttHelpers,readReviewUrl as udttRoute,reviewTarget as udttTarget} from './lib/idol/udtt-native/model.mjs';","export {billlieEventReleases} from './lib/idol/billlie-public-context';","export {wooahTimelineRelease,wooahTimelineMedia} from './lib/idol/wooah-timeline';"].join('\n'),resolveDir:root,sourcefile:'production-proof.ts'},bundle:true,outfile:path.join(dir,'bundle.cjs'),platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},alias:{'cloudflare:workers':path.join(root,'tests/fixtures/timeline/cloudflare-unavailable.cjs')},logLevel:'silent'});
const Module=require('node:module'),bundlePath=path.join(dir,'bundle.cjs'),bundle=new Module(bundlePath,module);bundle.filename=bundlePath;bundle.paths=module.paths;bundle._compile(fs.readFileSync(bundlePath,'utf8'),bundlePath);const product=bundle.exports;
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/snapshot.json'),'utf8')).tables;
const {asIds,asText,F}=product;
const catalog={mode:'snapshot',groups:registry.map(g=>({id:g.groupId,name:g.name})),members:raw.members.records.map(({recordId,fields:v})=>({id:recordId,name:asText(v[F.members.name]),stageName:asText(v[F.members.stageName]),cnName:asText(v[F.members.cnName]),groupIds:asIds(v[F.members.groups]),formerGroupIds:asIds(v[F.members.formerGroups]),favorite:null,role:'',status:'',birthDate:'',country:'',note:'',profile:'',photo:null})),works:raw.works.records.map(({recordId,fields:v})=>({id:recordId,song:asText(v[F.works.song]),name:asText(v[F.works.name]),groupIds:asIds(v[F.works.groups]),score:null,stageScore:null,watched:'',note:'',releaseDate:'',url:'',videoType:'',version:'',stage:null,stageSupplement:null})),ratings:raw.ratings.records.map(({recordId,fields:v})=>({id:recordId,memberIds:asIds(v[F.ratings.members]),workIds:asIds(v[F.ratings.works]),score:null,stylingScore:null,note:'',memory:'',photo:null})),counts:{}};
const before=JSON.stringify(catalog);
const categoryCorrections=require('../evidence/category-resolution-20261027/timeline-corrections.json');
const continuousEvidence=require('../../../docs/codex/evidence/20261028-continuous/evidence-upgrade-proposal-c.json');
const reportRecords=require('../data/timeline-reported-records.json').records;
const {beforePriorityTimelineBytes,receipt:priorityDates}=require('./helpers/priority-date-baseline.cjs');
// Reviewed native pages have their own event/edition identities. Freeze their
// complete source documents rather than infer acceptance from current output.
const nativeContracts={
 izna:['izna-editorial','c2b822fb7b2bc94fa3186c5fa50ecd5ef5d3a11d83baec38c57473f932a89094','signal-timeline',3],
 ifeye:['ifeye-editorial','8e718f356b2ce7f3fa1d9d5f932223b2a27bb0793c7a0930e35c0979f1a48ca6','chronicle',2],
 genblue:['genblue-bluecut','e6ef04e6dbd613f5edd8d0fb6bd0bef4514792ce45bf238aad576ade6112203e','gb-timeline',2],
 youngposse:['youngposse-native-design','2ecb7335e9e1a8a91a5b7be4ca4091eac7fbe196cee16e74e09006696280235a','single-timeline',3],
 bewave:['bewave-native-design','74c4ee6befead68e9e333d148cb6772f572d57587a9104f70a0fa8dd3a9acf4f','single-timeline',3],
 candyshop:['candyshop-native-design','81ecd77b12ac3edb8ff1d3ad695815d1c096a04574fcc2eb077a873a77e56a81','cs-timeline','releases'],
 oddyouth:['oddyouth-native-design','935658f2295968eef438c1dc2c4aebeca31a0973f8c54262c1d6cc975f9e21b8','oy-timeline'],
 adya:['adya-native-design','2f9de56adb17e1dbc3d7f1fc22aa04ab263a46371b799421a0ad84e114511804','idol-adya-timeline'],
 geenius:['geenius-native-design','e2794598df8bcaf6319288f888afeddcdce603b177c601bcba218ec564267d4d','idol-geenius-timeline'],
 tracer:['tracer-native-design','2fd0445ecfb635250b10a991176d3464682f03327d4f6b4686df73f9c45fb233','tr-timeline'],
 witchx:['witchx-native-design','b4aafda265ca28f35ad1f918208bc33d4dd67505af626b8d56a9624a11f279be','wk-timeline'],
 spia:['spia-native-design','b82bd3dc6756ae450695640554d07b0eaa3f57ec842d160126b5037d4e9c2915','sp-timeline'],
};
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function beforeContinuousSourceUpgrade(slug,bytes){
 bytes=beforePriorityTimelineBytes(slug,bytes);
 const change=continuousEvidence.timelines.find(row=>row.slug===slug);
 if(!change)return bytes;
 assert.equal(sha(bytes),change.proposedAfterFileSha256,'complete reviewed source upgrade '+slug);
 const historical=Buffer.from(change.expectedBeforeText,'utf8');
 assert.equal(sha(historical),change.expectedBeforeFileSha256,'exact source-upgrade preimage '+slug);
 return historical;
}
const ordered=events=>[...events].sort((a,b)=>(a.date??'9999').localeCompare(b.date??'9999'));
function reportAssertions(dom,group,held,{shown=true,native=false}={}){
 const expected=shown?reportRecords.filter(r=>r.slug===group.slug&&(native||r.eventDate===null)):[];
 const nodes=find(dom,n=>Object.hasOwn(n.attrs,'data-reported-record'));
 assert.deepEqual(nodes.map(n=>n.attrs['data-reported-record']).sort(),expected.map(r=>r.eventId).sort(),'report overlays are an exact, separate set');
 for(const row of expected){
  const node=nodes.find(n=>n.attrs['data-reported-record']===row.eventId);
  assert.ok(reported(node));assert.ok(text(node).includes(row.boundary));
  if(row.eventDate===null){assert.equal(held.find(e=>e.id===row.eventId)?.eventDate,null,'unresolved reporting never promotes a canonical hold');assert.match(text(node),/生效日期未确认/);}
  else{const change=priorityDates.changes.find(c=>c.eventId===row.eventId);assert.ok(change,'only reviewed resolved records');assert.deepEqual(row.eventDate,change.after.eventDate);assert.equal(held.some(e=>e.id===row.eventId),false);}
  if(row.recordDate)assert.ok(text(node).includes(row.recordDate));else assert.match(text(node),/记录日期未确认/);
  const sources=find(node,n=>n.tag==='a'&&n.attrs.href?.startsWith('https://'));
  assert.deepEqual(sources.map(n=>n.attrs.href),row.sources.map(s=>s.url));
  for(const a of sources){assert.equal(a.attrs.target,'_blank');assert.match(a.attrs.rel,/noopener/);}
 }
}
function sharedAssertions(dom,group,ready,held,expected,{navigation=true,releaseTargets={}}={}){
 const axes=find(dom,n=>n.tag==='section'&&hasClass(n,'artist-timeline'));
 assert.equal(axes.length,1,'one actual timeline axis');const axis=axes[0];
 const events=find(axis,n=>Object.hasOwn(n.attrs,'data-timeline-event-id')&&!reported(n));
 const ids=events.map(eventId);assert.deepEqual(ids,expected,'exact accepted chronological event sequence');assert.equal(new Set(ids).size,ids.length);
 for(const item of held)assert.ok(!ids.includes(item.id),'hold must not enter confirmed event axis');
 assert.equal(find(axis,n=>hasClass(n,'at-list')&&!reported(n)).length,ready.length?1:0);
 assert.doesNotMatch(text(axis),/来源与核验|范围说明|支持范围|重要事件|条待核资料|成员档案|作品档案|evidence\/E|B\/C\/D|E01|E02|沿用D原文|继承字段/);
 assert.equal(find(axis,n=>['at-filters','at-background','at-sources','at-related','at-gaps','at-badges'].some(c=>hasClass(n,c))).length,0);
 if(navigation)for(const event of ready){
  const node=events.find(n=>eventId(n)===event.id);assert.ok(node);
  const controls=find(node,n=>n.tag==='button'&&Object.hasOwn(n.attrs,'data-timeline-target-id'));
  const actual=controls.map(n=>[n.attrs['data-timeline-target-kind'],n.attrs['data-timeline-target-id']]);
  assert.deepEqual(actual,[...(releaseTargets[event.id]?[['release',releaseTargets[event.id]]]:[]),...event.memberIds.map(id=>['member',id]),...event.workIds.map(id=>['work',id])],'all exact scoped member/work references stay navigable');
  for(const button of controls){assert.equal(button.attrs['data-timeline-event-trigger'],event.id);assert.ok(text(button).trim());assert.ok(!Object.hasOwn(button.attrs,'disabled'));}
 }
 reportAssertions(dom,group,held);
 return axis;
}
function headingAssertion(dom,expected=1){
 const headings=find(dom,n=>/^h[1-6]$/.test(n.tag)&&/^(?:大事时间轴|团体时间轴|时间轴|时间线|历程|HISTORY|TIMELINE|CHRONOLOGY \/ 时间轴|Timeline \/ 时间轴|从 2025 开始|OUR DAYS|Through the years|THE\s*STORY)$/i.test(text(n).trim()));
 assert.equal(headings.length,expected,'visible timeline heading(s) in the approved language/typography: '+JSON.stringify(find(dom,n=>/^h[1-6]$/.test(n.tag)).map(text)));
}
function nativeAssertions(dom,group,contract,data,home,held,{genblueFiltered=false}={}){
 const axes=find(dom,n=>hasClass(n,contract[2])&&!reported(n));assert.equal(axes.length,1,'one native event list');
 const nodes=axes[0].children.filter(n=>typeof n!=='string');
 let expected=ordered(data.events).filter(e=>group.slug!=='candyshop'||e.id!=='e-candyshop-yuina-hiatus-report');
 if(genblueFiltered)expected=expected.filter(e=>e.eventType==='release'&&e.importance==='major').reverse();
 if(home&&typeof contract[3]==='number')expected=expected.slice(0,contract[3]);
 if(home&&contract[3]==='releases')expected=expected.filter(e=>e.releaseKey);
 assert.deepEqual(nodes.map(eventId),expected.map(e=>e.id),'native presentation IDs/order and deliberate overview subset');
 for(const event of expected){
  const node=nodes.find(n=>eventId(n)===event.id),links=find(node,n=>n.tag==='a');
  const title=data.publicContent?.events?.[event.id]?.title??event.title;
  assert.ok(text(node).includes(title),`native title ${event.id}`);
  for(const hold of held)assert.notEqual(event.id,hold.id,'held fact must only occur in reporting overlay');
  const destinations=links.filter(n=>!n.attrs.href.startsWith('https://')).map(n=>{
   if(['izna','ifeye'].includes(group.slug)){
    assert.equal(product.validAstraRoute(data,n.attrs.href),true,'native hash must be bounded to the actual group/entity');
    const target=product.astraArtistUrl(data,n.attrs.href);assert.ok(target);return new URL(target,'https://test.invalid');
   }
   const target=new URL(n.attrs.href,'https://test.invalid');assert.equal(target.pathname,group.path);return target;
  });
  if(event.releaseKey&&data.releases.some(r=>r.key===event.releaseKey))assert.ok(destinations.some(u=>u.searchParams.get('release')===event.releaseKey),'exact native release remains reachable');
  else assert.ok(!destinations.some(u=>u.searchParams.has('release')),'unbound edition must not acquire a guessed release link');
  if(event.mediaKey)assert.ok(destinations.some(u=>u.searchParams.get('media')===event.mediaKey),'exact native video remains reachable');
  for(const id of event.memberIds??[])assert.ok(destinations.some(u=>u.searchParams.get('member')===id),'exact linked member remains reachable');
  if(['izna','ifeye'].includes(group.slug))for(const id of event.workIds??[])for(const w of data.works.filter(w=>w.id===id))assert.ok(destinations.some(u=>u.searchParams.get('media')===w.key),'all exact video variants remain reachable');
  for(const link of links.filter(n=>n.attrs.href.startsWith('https://'))){assert.ok([event.sourceUrl].includes(link.attrs.href),'source belongs to this event');assert.match(link.attrs.rel,/noopener/);}
 }
 reportAssertions(dom,group,held,{shown:!(home&&['bewave','candyshop'].includes(group.slug)),native:true});headingAssertion(dom);
}
for(const group of registry)test(`${group.slug}: canonical hashes, ready/hold isolation and actual production renderer contract`,async()=>{
 const file=group.slug+'.json',bytes=fs.readFileSync(path.join(root,'data/artist-timelines',file));
 if(group.slug==='triples'){
  const correction=require('../HANDOFF/timeline-corrections/triples-assemble24.json');
  const {validateCorrectionChain,hash}=require('./helpers/timeline-correction-chain.cjs');
  const events=new Map(registry.flatMap(g=>JSON.parse(beforeContinuousSourceUpgrade(g.slug,fs.readFileSync(path.join(root,`data/artist-timelines/${g.slug}.json`)))).events.map(e=>[e.id,e])));
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
 }else assert.equal(sha(beforeContinuousSourceUpgrade(group.slug,bytes)),hashes[file]);
 const input=JSON.parse(bytes),loaded=await product.loadArtistTimeline(group.slug);
 assert.deepEqual(loaded.input,input);assert.deepEqual(Object.keys(loaded),['input'],'retired display/background files are not loaded');
 const scoped=product.projectArtistCatalog(catalog,group.groupId);
 const presentation=product.prepareTimelinePresentation(input,scoped,registry);
 assert.equal(presentation.strictAudit.ok,true,JSON.stringify(presentation.issues));
 const provider=(serverRoute,child)=>React.createElement(product.ArtistTimelineHostProvider,{value:{catalog:scoped,input,hideLegacyBackground:true,loading:false,navigate(){},serverRoute}},child);
 const renderRoute=serverRoute=>markup(provider(serverRoute,React.createElement(product.routes[group.slug],{searchParams:Promise.resolve(Object.fromEntries(new URL(serverRoute,'https://test.invalid').searchParams))})));
 const ready=input.events.filter(e=>e.reviewStatus==='ready'),held=input.events.filter(e=>e.reviewStatus==='hold');
 const baselineGroup=accepted.groups[group.slug],riseId='e-madein-rise-release-carrier-hold';
 const promoted=group.slug==='madein'?riseId:group.slug==='idle'?'e-idle-cube-renewal':group.slug==='newjeans'?'e-newjeans-attention-mv':null;
 const promotedIds=[...(promoted?[promoted]:[]),...categoryCorrections.corrections.filter(c=>c.slug===group.slug).map(c=>c.eventId),...priorityDates.changes.filter(c=>c.slug===group.slug).map(c=>c.eventId)];
 const acceptedGroup={...baselineGroup,ready:[...baselineGroup.ready,...promotedIds].sort(),hold:baselineGroup.hold.filter(id=>!promotedIds.includes(id))};
 assert.equal(input.groupId,acceptedGroup.groupId);
 assert.deepEqual(ready.map(e=>e.id).sort(),acceptedGroup.ready,'canonical ready IDs must equal the independently recorded accepted set');
 assert.deepEqual(held.map(e=>e.id).sort(),acceptedGroup.hold,'held IDs must remain the exact accepted set');
 const expected=product.selectChronologicalTimeline(input.events).map(e=>e.id);
 // Independently exercise the complete canonical host for all 51 groups, even
 // where the approved page uses a native/major-event timeline instead.
 for(const query of ['?section=updates','?section=updates&timelineType=release&timelineImportance=major&timelineOrder=recent','?section=overview']){
  const dom=tree(await markup(provider(group.path+query,React.createElement(product.ArtistTimelineHost,{groupId:group.groupId,catalog:scoped,showTitle:true}))));
  const axis=sharedAssertions(dom,group,ready,held,expected);headingAssertion(dom);
  if(group.slug==='spia'){assert.deepEqual(expected,['e-spia-formal-debut-candidate','e-spia-deeeep-candidate']);assert.match(text(axis),/Daddy’s Little Girl/);assert.match(text(axis),/Deeeep/);assert.doesNotMatch(text(axis),/事件正在整理/);}
  if(group.slug==='adya'){assert.ok(find(axis,n=>n.tag==='button').some(n=>text(n)==='书媛'));assert.doesNotMatch(text(axis),/书媛 · Seowon/);assert.match(text(axis),/日期待确认/);}
  if(group.slug==='lesserafim'){assert.equal(expected.length,25);assert.match(text(axis),/公布宫胁咲良、金采源签约SOURCE MUSIC/);assert.match(text(axis),/发行第四张迷你专辑《CRAZY》/);assert.doesNotMatch(text(axis),/《CRAZY》数字发行|金佳蓝/);assert.match(text(axis),/金佳览暂停活动/);assert.match(text(axis),/宣布金佳览离团并解约/);}
 }
 const contract=nativeContracts[group.slug];let nativeData;
 if(contract){const bytes=fs.readFileSync(path.join(root,'data',contract[0]+'.json'));assert.equal(sha(bytes),contract[1],'native event/edition identities and reviewed data are frozen');nativeData=JSON.parse(bytes);}
 const actualQueries=['?section=updates','?section=overview'];
 // Shared hosts intentionally ignore retired filter parameters; GENBLUE has
 // its own still-supported filter contract. Effect hosts use bounded routes.
 if(!contract&&group.slug!=='udtt'||group.slug==='genblue')actualQueries.push('?section=updates&timelineType=release&timelineImportance=major&timelineOrder=recent');
 for(const query of actualQueries){
  const route=group.path+query,home=query.includes('overview');let dom=tree(await renderRoute(route));
  if(group.slug==='wooah'&&query.includes('timelineType=')){
   assert.match(text(dom),/这个页面地址暂不可用/,'WOOAH rejects unsupported legacy filters instead of guessing a route');
   assert.equal(find(dom,n=>hasClass(n,'artist-timeline')).length,0);
   assert.ok(find(dom,n=>n.tag==='a'&&n.attrs.href===group.path&&text(n).includes('返回首页')).length);continue;
  }
  if(['izna','ifeye','udtt'].includes(group.slug)){
   assert.equal(find(dom,n=>n.attrs[`data-${group.slug}-native-host`]==='true').length,1,'effect-mounted route has its real SSR host');
   assert.ok(find(dom,n=>n.attrs.role==='status').some(n=>/正在/.test(text(n))),'SSR exposes the actual loading state, not invented timeline HTML');
   assert.equal(find(dom,n=>Object.hasOwn(n.attrs,'data-timeline-event-id')).length,0);
   if(group.slug==='udtt'){
    const nativeRoute=product.udttRoute(route);assert.ok(nativeRoute);
    dom=tree(product.renderUdtt({route:nativeRoute,helpers:product.udttHelpers,catalog:scoped,canEdit:false}));
    const axes=find(dom,n=>hasClass(n,'ud-timeline')&&!reported(n));assert.equal(axes.length,1);
    const nodes=axes[0].children.filter(n=>typeof n!=='string'),resolvedReports=reportRecords.filter(r=>r.slug==='udtt'&&r.eventDate!==null);assert.equal(nodes.length+resolvedReports.length,ready.length);
    if(!home){assert.deepEqual(nodes.map(eventId),['e-udtt-retry-prerelease-candidate','e-udtt-school-rush-debut-candidate','e-udtt-kwave-ambassador','e-udtt-viper-digital-release']);assert.deepEqual(nodes.map(eventId).sort(),expected.filter(id=>!resolvedReports.some(r=>r.eventId===id)).toSorted(),'native announcement-date order preserves its frozen IDs; promoted report is checked separately');for(const n of nodes)for(const a of find(n,x=>x.tag==='a'&&x.attrs.href.startsWith('#/'))){assert.ok(product.udttTarget(a.attrs.href),'native release target is an exact allowed UDTT entity');const trail=JSON.parse(new URL(a.attrs.href.slice(1),'https://test.invalid').searchParams.get('udttTrail'));assert.equal(trail.at(-1).event,eventId(n),'release return retains the originating stable event');}}
    else for(const event of product.udttArtist.timeline)assert.ok(text(axes[0]).includes(event.title??event.summary),'overview contains every native timeline summary');
    reportAssertions(dom,group,held,{shown:!home,native:true});if(!home)assert.deepEqual([...nodes.map(eventId),...resolvedReports.map(r=>r.eventId)].sort(),ready.map(e=>e.id).sort(),'native frozen axis and reviewed resolved overlay cover each ready event once');headingAssertion(dom);continue;
   }
   const display=group.slug==='izna'?product.prepareIznaDisplayData(scoped):product.prepareIfeyeDisplayData(scoped);
   assert.deepEqual(display.events,nativeData.events,'catalog projection cannot rewrite accepted events');
   dom=tree(mountAstra(product,group.slug,display,route));
  }
  if(contract){nativeAssertions(dom,group,contract,nativeData,home,held,{genblueFiltered:group.slug==='genblue'&&query.includes('timelineType=')});continue;}
  if(home&&['unis','loona'].includes(group.slug)){
   // These approved home designs expose a bounded teaser and a full-axis
   // navigation button. The complete updates route is checked separately.
   assert.equal(find(dom,n=>hasClass(n,'artist-timeline')).length,0);
   const teaser=find(dom,n=>hasClass(n,group.slug==='unis'?'uf-timeline-teaser':'ln-home-history'));assert.equal(teaser.length,1);
   if(group.slug==='unis'){assert.equal(find(teaser[0],n=>n.tag==='time')[0].attrs.datetime,'2024-01-17');assert.ok(text(teaser[0]).includes('《Universe Ticket》最终八人成团'));}
   else{const ids=['e-loona-monthly-member-reveal-project','e-loona-complete-group-debut','e-loona-xx-kr-repackage'];assert.deepEqual(find(teaser[0],n=>n.tag==='time').map(n=>n.attrs.datetime),ids.map(id=>ready.find(e=>e.id===id).eventDate.value));assert.match(text(teaser[0]),/逐月成员企划启动/);assert.match(text(teaser[0]),/十二人完整体出道/);assert.match(text(teaser[0]),/\[X X\] · Butterfly/);}
   assert.equal(find(teaser[0],n=>n.tag==='button'&&/查看时间轴|浏览完整时间轴/.test(text(n))).length,1);continue;
  }
  if(group.slug==='wooah'&&!home){
   // WOOAH's approved editorial page deliberately renders major events only.
   const major=product.selectChronologicalTimeline(ready).filter(e=>e.importance==='major');assert.equal(major.length,12);
   const axis=sharedAssertions(dom,group,major,held,major.map(e=>e.id),{navigation:false});
   for(const event of major){const release=product.wooahTimelineRelease(event.id),media=product.wooahTimelineMedia(event.id);const node=find(axis,n=>eventId(n)===event.id)[0];const buttons=find(node,n=>n.tag==='button');const target=release??media;assert.equal(buttons.length,target?1:0);if(target){assert.equal(buttons[0].attrs['data-timeline-target-id'],target.key);assert.equal(buttons[0].attrs['data-timeline-target-kind'],release?'release':'media');assert.equal(buttons[0].attrs['data-timeline-event-trigger'],event.id);}}
  }else sharedAssertions(dom,group,ready,held,expected,{releaseTargets:group.slug==='billlie'?product.billlieEventReleases:{}});
  // These home pages also retain a separate approved navigation door.
  const doorClass={katseye:'ke-timeline-entry',hearts2hearts:'h2h-history-entry'}[group.slug];
  if(home&&doorClass){const door=find(dom,n=>hasClass(n,doorClass));assert.equal(door.length,1);assert.ok(find(door[0],n=>n.tag==='button'&&/浏览时间轴|完整历程/.test(text(n))).length===1);}
  headingAssertion(dom,home&&doorClass?2:1);
 }
 assert.equal(JSON.stringify(catalog),before);
});
test('all 51 canonical groups retain 621 accepted events, two isolated holds and immutable public fixture',()=>{
 const documents=registry.map(g=>JSON.parse(fs.readFileSync(path.join(root,'data/artist-timelines',g.slug+'.json'))));
 const events=documents.flatMap(d=>d.events);
 assert.equal(registry.length,51);assert.equal(events.filter(e=>e.reviewStatus==='ready').length,621);assert.equal(events.filter(e=>e.reviewStatus==='hold').length,2);
 assert.deepEqual(Object.keys(accepted.groups).sort(),registry.map(g=>g.slug).sort());
 assert.deepEqual(reportRecords.filter(r=>r.eventDate===null).map(r=>r.eventId).sort(),events.filter(e=>e.reviewStatus==='hold').map(e=>e.id).sort());
 assert.equal(JSON.stringify(catalog),before);
});
test.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
