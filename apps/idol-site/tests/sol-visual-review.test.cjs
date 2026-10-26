const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {load,syntheticCatalog}=require('./helpers/sol-review-loader.cjs');
const model=load('lib/idol/design-review/sol-review-model.ts');
const host=load('components/design-review/sol-visual-review.tsx');
const bridge=load('lib/idol/public-artist-bridge.ts');
const navigation=load('lib/idol/artist-navigation.ts');
const rows=['rescene','purplekiss'];
const timelines=Object.fromEntries(rows.map(slug=>[slug,JSON.parse(fs.readFileSync(`data/artist-timelines/${slug}.json`))]));
const catalogs=Object.fromEntries(rows.map(slug=>[slug,syntheticCatalog(slug)]));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
freeze(catalogs);freeze(timelines);
const render=(slug,fields={},catalog=catalogs[slug],timeline=timelines[slug])=>renderToStaticMarkup(React.createElement(host.default,{slug,catalogOverride:catalog,timelineOverride:timeline,serverRoute:model.solReviewHref(slug,fields)}));
const hrefs=html=>[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
for(const slug of rows){
 const expected=slug==='rescene'?{members:5,releases:6,videos:10,events:12}:{members:7,releases:13,videos:13,events:17};
 test(`${slug}: five independent views are readonly, scoped and linked through canonical routes`,()=>{
  const before=JSON.stringify({catalog:catalogs[slug],timeline:timelines[slug]});
  for(const fields of [{},{section:'members'},{section:'members',member:catalogs[slug].members[0].id},{section:'works'},{section:'updates'}]){
   const html=render(slug,fields);
   assert.match(html,new RegExp(`${slug}-visual-review`));assert.match(html,/data-visual-acceptance="pending"/);assert.match(html,/data-figma-acceptance="not-accepted"/);
   assert.doesNotMatch(html,/PRIVATE_\w+_SENTINEL|9\.87654|1\.23456|<iframe|<script|data-dirty|data-navigation-blocked/);
   for(const href of hrefs(html).filter(x=>x.startsWith('/design-review/')))assert.ok(model.canonicalSolReviewUrl(slug,href),href);
  }
  assert.equal(JSON.stringify({catalog:catalogs[slug],timeline:timelines[slug]}),before);
 });
 test(`${slug}: all member identities and release/media details render without fabricated IDs`,()=>{
  const data=model.solReviewData(slug,catalogs[slug]);assert.equal(data.members.length,expected.members);assert.equal(data.works.filter(x=>x.kind==='release').length,expected.releases);assert.equal(data.works.filter(x=>x.kind==='mv').length,expected.videos);
  for(const member of data.members){const html=render(slug,{section:'members',member:member.id});assert.ok(html.includes(member.stageName));assert.ok(html.includes(member.name));assert.ok(hrefs(html).some(h=>h.includes('section=members')));}
  for(const work of data.works){const html=render(slug,model.solWorkFields(work));assert.match(html,/id="work-dialog-title"/);assert.ok(html.includes(work.title.replaceAll('&','&amp;')));assert.equal(work.releaseId,null);assert.equal(work.actionable,work.kind==='mv');if(work.kind==='release'){assert.equal(work.workId,null);assert.equal(work.videoId,null);}}
  if(slug==='purplekiss'){const jieun=data.members.find(m=>m.key==='jieun');assert.ok(jieun.historical);assert.ok(jieun.period.includes('2022'));assert.equal(data.members.filter(m=>m.historical).length,1);}
 });
 test(`${slug}: canonical timeline retains every ready event and excludes held records`,()=>{
  const result=model.solReviewTimeline(slug,timelines[slug],catalogs[slug]);assert.equal(result.events.length,expected.events);
  const html=render(slug,{section:'updates'});
  for(const event of result.events){assert.ok(html.includes(event.id),event.id);assert.ok(html.includes(event.title.replaceAll('&','&amp;')),event.title);for(const source of event.sources)assert.ok(html.includes(source.url.replaceAll('&','&amp;')),source.url);}
  const held=structuredClone(timelines[slug]);held.events[0].reviewStatus='hold';held.events[0].holdReasons=['test held'];assert.equal(model.solReviewTimeline(slug,held,catalogs[slug]).events.length,expected.events-1);
  assert.equal(model.solReviewTimeline(slug,{...timelines[slug],schemaVersion:2},catalogs[slug]).events.length,0);
  assert.equal(model.solReviewTimeline(slug,timelines[slug],{...catalogs[slug],works:[]}).events.length,expected.events);
 });
 test(`${slug}: route sanitizer isolates previews and keeps sort out of production`,()=>{
  const path=model.SOL_REVIEW_PATHS[slug];
  for(const url of ['https://evil.test'+path,'//evil.test'+path,path+'#x',path+'?q=x&q=y',path+'?unknown=x',path+'?section=members&member=recWrong',path+'?section=works&release=pretend',path+'?section=members&sort=oldest',path+'?section=works&sort=bad',path+'?section=works&sort=oldest&sort=newest',path+'/../'+slug+'-v1'])assert.equal(model.canonicalSolReviewUrl(slug,url),null,url);
  const sorted=model.solReviewHref(slug,{section:'works',format:'mv',sort:'oldest',q:'x'});assert.ok(sorted);assert.equal(model.readSolReviewRoute(slug,sorted).sort,'oldest');assert.ok(!model.canonicalSolReviewUrl(slug,sorted).includes('sort='));assert.equal(navigation.safeArtistReturn(sorted),null);
  for(const work of model.solPublicSource(slug).works)assert.ok(model.canonicalSolReviewUrl(slug,model.solReviewHref(slug,model.solWorkFields(work))));
 });
 test(`${slug}: missing, duplicate, foreign or mismatched live tuples cannot enable record actions`,()=>{
  const catalog=catalogs[slug],source=model.solPublicSource(slug);assert.equal(model.solReviewData(slug,null).members.length,0);
  assert.equal(model.solReviewData(slug,{...catalog,scope:{type:'artist',groupId:'recWrong'}}).works.length,0);
  assert.equal(model.solReviewData(slug,{...catalog,members:[...catalog.members,catalog.members[0]]}).members.length,expected.members-1);
  for(const broken of [{...catalog,works:[]},{...catalog,works:[...catalog.works,{...catalog.works[0],id:'duplicate'}]},{...catalog,works:catalog.works.map((w,i)=>i? w:{...w,url:'https://www.youtube.com/watch?v=aaaaaaaaaaa'})}])assert.equal(model.solReviewData(slug,broken).works.find(w=>w.key===source.works.find(w=>w.kind==='mv').key).actionable,false);
  for(const work of model.solReviewData(slug,catalog).works.filter(w=>w.kind==='mv')){
   const current=model.canonicalSolReviewUrl(slug,model.solReviewHref(slug,model.solWorkFields(work)));
   const args={slug,kind:work.kind,key:work.key,action:'records',workId:work.workId,videoId:work.videoId,returnTo:current,currentArtistUrl:current};
   assert.ok(bridge.publicMediaActionHref(args,catalog));assert.equal(bridge.publicMediaActionHref({...args,videoId:'wrong'},catalog),null);assert.equal(bridge.publicMediaActionHref({...args,workId:'wrong'},catalog),null);assert.equal(bridge.publicMediaActionHref({...args,currentArtistUrl:'/artists/triples'},catalog),null);
  }
 });
 test(`${slug}: direct and successive detail returns reveal the selected category and clear incompatible queries`,()=>{
  const works=model.solPublicSource(slug).works,mv=works.find(w=>w.kind==='mv'),release=works.find(w=>w.kind==='release'),url=w=>model.solReviewHref(slug,model.solWorkFields(w));
  const direct=model.solReviewReturnPlan(slug,url(mv),null);assert.equal(new URL(direct.href,'https://site.invalid').searchParams.get('format'),'mv');assert.equal(direct.parentEntry,false);
  const list=model.solReviewHref(slug,{section:'works',q:release.title,sort:'oldest'});
  const first=model.solReviewNavigationPlan(slug,list,url(release),null,url(release));assert.equal(first.method,'pushState');assert.equal(first.opener.parentEntry,true);
  const retained=model.solReviewReturnPlan(slug,url(release),first.opener);assert.deepEqual(retained,first.opener);
  const second=model.solReviewNavigationPlan(slug,url(release),url(mv),first.opener,url(mv));assert.equal(second.method,'replaceState');const returned=model.solReviewReturnPlan(slug,url(mv),second.opener);assert.equal(returned.parentEntry,false);assert.equal(new URL(returned.href,'https://site.invalid').searchParams.get('format'),'mv');assert.equal(new URL(returned.href,'https://site.invalid').searchParams.get('q'),null);
  const left=model.solReviewNavigationPlan(slug,url(mv),model.solReviewHref(slug),second.opener);assert.equal(left.opener,null);
 });
}
test('host save, dirty and foreign-modal guards remain authoritative',()=>{
 let ask=0,alerts=0;const own={};const root=(modals=[],pending=false,dirty=false)=>({querySelectorAll:()=>modals,querySelector:s=>s.includes('navigation-blocked')?pending?{}:null:dirty?{}:null});
 const confirm=()=>{ask++;return false;},alert=()=>alerts++;
 assert.equal(host.solReviewMayLeave(root(),null,confirm,alert),true);assert.equal(host.solReviewMayLeave(root([own]),own,confirm,alert),true);assert.equal(host.solReviewMayLeave(root([{}]),own,confirm,alert),false);assert.equal(host.solReviewMayLeave(root([],true,true),own,confirm,alert),false);assert.equal(alerts,1);assert.equal(ask,0);assert.equal(host.solReviewMayLeave(root([],false,true),own,confirm,alert),false);assert.equal(ask,1);assert.equal(host.solReviewMayLeave(root([],false,true),own,()=>true,alert),true);
});
test('integration never mutates storage, injects prototype HTML or installs new production editor routes',()=>{
 for(const name of ['components/design-review/sol-visual-review.tsx','components/design-review/rescene-visual-views.tsx','components/design-review/purplekiss-visual-views.tsx','lib/idol/design-review/sol-review-model.ts']){
  const text=fs.readFileSync(name,'utf8');assert.doesNotMatch(text,/snapshot\.json|dangerouslySetInnerHTML|<iframe|<script|localStorage|sessionStorage|method:\s*['"](?:POST|PUT|PATCH|DELETE)|\/api\/(?:save|record|write)/,name);
 }
 const text=fs.readFileSync('components/design-review/sol-visual-review.tsx','utf8');assert.match(text,/publicMediaActionHref/);assert.match(text,/publicMemberActionHref/);assert.match(text,/currentUrl\(\)!==url/);assert.match(text,/controller\.abort\(\)/);assert.match(text,/clearTimeout\(timer\)/);assert.match(text,/removeEventListener/);assert.match(text,/if\(node.open\)node.close\(\)/);
});
