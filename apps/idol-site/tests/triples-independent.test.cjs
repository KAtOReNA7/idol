/* Actual component SSR and captured handlers; synthetic private values never leave the test. */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react'), jsx = require('react/jsx-runtime');
const {renderToStaticMarkup} = require('react-dom/server');
const content = JSON.parse(fs.readFileSync('data/triples-artist.json'));
const publicMembers = JSON.parse(fs.readFileSync('tests/fixtures/triples-public-identities.json'));
const baseline = JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json'));
const releaseEvidence = JSON.parse(fs.readFileSync('data/triples/release-evidence.json'));
const curated = JSON.parse(fs.readFileSync('data/triples/curated-release-evidence.json')).entries[0];
const timeline = JSON.parse(fs.readFileSync('data/artist-timelines/triples.json'));
function scene() {
  const memberSeed = baseline.members.find(m => m.groupIds.includes(content.groupId));
  const workSeed = baseline.works.find(w => w.groupIds.includes(content.groupId));
  return {...baseline, members: publicMembers.map(m => ({...memberSeed,...m})), ratings: [],
    works: [...releaseEvidence.entries.map(e => ({...workSeed,id:e.workId,url:e.url,song:e.song,officialTitle:e.officialTitle,groupIds:[content.groupId]})),
      {...workSeed,id:curated.workId,url:curated.videoUrl,song:curated.workTitle,officialTitle:curated.officialTitle,groupIds:[content.groupId]},
      {...workSeed,id:'recExtraWork',song:'Full catalog only',groupIds:[content.groupId]}]};
}
function renderer(data, url = '/artists/triples', options = {}) {
  const cache = new Map(), elements = [], navigations = [];
  const history = {state:{artistScroll:{path:url,y:321}},pushState(state,unused,to){this.state=state;navigations.push(to);},replaceState(state,unused,to){this.state=state;navigations.push(to);}};
  const hooks = {...React,useEffect:()=>{},useLayoutEffect:()=>{},useSyncExternalStore:()=>url,
    useState:initial=>[initial,()=>{}]};
  const track = original => (type,props,...rest) => {elements.push({type,props});return original(type,props,...rest);};
  function load(file) {
    file=path.resolve(file);if(cache.has(file))return cache.get(file);
    if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};
    const out={};cache.set(file,out);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout,Event,
      requestAnimationFrame:fn=>{fn();return 1;},window:{history,dispatchEvent:()=>{}},document:{getElementById:()=>({focus:()=>{},scrollIntoView:()=>{}})}})(name=>{
      if(name==='react')return hooks;
      if(name==='react/jsx-runtime')return {...jsx,jsx:track(jsx.jsx),jsxs:track(jsx.jsxs)};
      if(name==='@/components/use-artist-scroll')return {useArtistScroll:()=>()=>{}};
      if(name==='@/components/photo-lightbox')return {PhotoLightbox:()=>null};
      if(name==='@/components/artist-timeline-host')return {useArtistTimelineHostOptions:()=>({catalog:data,input:timeline,...options}),ArtistTimelineHost:()=>React.createElement('section',{'data-timeline-host':content.groupId})};
      const image=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(image!==undefined)return image;
      const dep=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(dep!==undefined)return dep;
      if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');
      if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');
      if(name.endsWith('.css'))return {};
      if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>target+ext).find(p=>fs.existsSync(p))??target);}
      return require(name);
    },out);return out;
  }
  const module=load('components/candidate/triples-design.tsx');
  return {html:renderToStaticMarkup(React.createElement(module.default,{content})),module,elements,navigations,load};
}
const ids = html => [...html.matchAll(/data-roster-member-id="([^"]+)"/g)].map(m=>m[1]);
const releaseKeys = html => [...html.matchAll(/data-release-key="([^"]+)"/g)].map(m=>m[1]);
const urls = html => [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}

test('approved home prioritizes its cover and member directory prioritizes only first visible portrait; closed roster stays lazy',()=>{
  for(const section of ['overview','members']){
    const {html}=renderer(scene(),'/artists/triples?section='+section);
    const images=[...html.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
    assert.equal(images.filter(image=>image.includes('fetchPriority="high"')).length,1);
    const priority=images.find(image=>image.includes('fetchPriority="high"'));
    assert.match(priority,section==='overview'?/group-display.webp/:/s1-seoyeon-display.webp/);
    assert.equal((html.match(/data-person-id=/g)||[]).length,24);
    const dialog=html.slice(html.indexOf('<dialog'));
    const rosterImages=[...dialog.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
    assert.equal(rosterImages.length,24);
    for(const image of rosterImages){assert.match(image,/loading="lazy"/);assert.match(image,/fetchPriority="auto"/);}
    assert.deepEqual(ids(html),publicMembers.map(m=>m.id));
  }
});

test('independent complete group spread, reader and 24 Chinese names survive reversed input without ordinal identities',()=>{
  const data=scene();data.members.reverse();const before=JSON.stringify(data);freeze(data);
  const {html}=renderer(data);assert.equal(JSON.stringify(data),before);
  assert.deepEqual(ids(html),publicMembers.map(m=>m.id));
  assert.match(html,/ts-cover/);assert.match(html,/ts-people-grid/);assert.match(html,/group-display.webp/);
  for(const n of Array.from({length:24},(_,i)=>i+1))assert.ok(html.includes(`data-s-number="${n}"`));
  assert.match(html,/索琳/);assert.doesNotMatch(html,/雪琳|CandidateComposition|ca-ordinal/);
  for(const m of publicMembers)assert.ok(html.includes(m.stageName));
});
test('S24 is a bounded final page and its small neighbor is S23; selection handler uses verified stable ID',()=>{
  const last=publicMembers.at(-1),data=scene(),r=renderer(data,'/artists/triples?reader='+last.id);
  assert.match(r.html,/上一位 \/ S23/);assert.match(r.html,/<button disabled="">最后一页/);
  const first=r.elements.find(e=>e.type==='button'&&e.props['data-s-number']===1);
  first.props.onClick();assert.match(r.navigations.at(-1),new RegExp('reader='+publicMembers[0].id));
  assert.ok(!r.navigations.at(-1).includes('member='));
});
test('unknown and foreign member IDs produce explicit safe states; mismatched stable identity never acquires S',()=>{
  for(const member of ['recUnknown','recForeign'])assert.match(renderer(scene(),'/artists/triples?member='+member).html,/这个成员不在本团档案中/);
  const data=scene();data.members[0].stageName='Wrong Identity';
  const r=renderer(data,'/artists/triples?reader='+data.members[0].id);
  assert.doesNotMatch(r.html,/data-s-number="1"/);assert.ok(ids(r.html).includes(data.members[0].id));
  const trigger=r.elements.find(e=>e.type==='button'&&e.props['data-roster-member-id']===data.members[0].id);
  trigger.props.onClick();assert.match(r.navigations.at(-1),new RegExp('member='+data.members[0].id));
});
test('reader parsers reject cross-path, duplicate and malformed values; return sanitizer is triples-only',()=>{
  const r=renderer(scene()),{triplesReaderRoute,triplesReaderUrl}=r.module;
  const {safeArtistReturn}=r.load('lib/idol/artist-navigation.ts');
  const valid='/artists/triples?section=works&queue=tonight&q=Girls&format=stage&reader='+publicMembers[21].id;
  const route=triplesReaderRoute(valid);assert.equal(route.reader,publicMembers[21].id);
  assert.equal(safeArtistReturn(triplesReaderUrl(route)),triplesReaderUrl(route));
  for(const url of ['/artists/meovv?reader=recTest','/artists/triples?reader=recA&reader=recB','/artists/triples?reader=bad','/artists/triples?reader=recA&unknown=x','https://evil.example/artists/triples?reader=recA'])assert.equal(safeArtistReturn(url),null,url);
  for(const url of ['/artists/meovv?reader=recTest','/artists/triples?reader=recA&reader=recB','/artists/triples?reader=bad'])assert.equal(triplesReaderRoute(url).reader,null,url);
});
test('section navigation and standalone work links preserve current reader, queue, search and format',()=>{
  const last=publicMembers.at(-1),url='/artists/triples?section=works&queue=all&q=Girls&format=mv&reader='+last.id;
  const r=renderer(scene(),url);const links=urls(r.html).filter(x=>x.includes('returnTo='));assert.ok(links.length);
  for(const href of links){const back=new URL(new URL(href,'https://test.invalid').searchParams.get('returnTo'),'https://test.invalid');assert.equal(back.searchParams.get('reader'),last.id);assert.equal(back.searchParams.get('q'),'Girls');assert.equal(back.searchParams.get('format'),'mv');}
  const tab=r.elements.find(e=>e.type==='button'&&e.props.children==='时间轴');tab.props.onClick();
  assert.match(r.navigations.at(-1),/section=updates/);assert.ok(r.navigations.at(-1).includes('reader='+last.id));assert.match(r.navigations.at(-1),/q=Girls/);
});
test('public release catalog stays separate from gated production release links and real records remain accessible',()=>{
  const data=scene();
  for(const options of [{},{timelineLoading:true},{timelineError:'offline'},{input:{invalid:true}}]){
    const html=renderer(data,undefined,options).html;
    assert.equal((html.match(/data-public-release=/g)||[]).length,3);
    assert.deepEqual(releaseKeys(html),[]);
  }
  for(const section of ['works','records']){
    const html=renderer(data,'/artists/triples?section='+section).html;
    for(const work of data.works)assert.ok(html.includes('work='+work.id));
  }
  const recordHtml=renderer(data,'/artists/triples?section=records').html;
  assert.deepEqual(releaseKeys(recordHtml),['triples-aaa-access','triples-assemble24','triples-assemble','triples-lovelution-muhan']);
  data.works.find(w=>w.id===curated.workId).url='https://example.com/drift';
  assert.ok(!releaseKeys(renderer(data,'/artists/triples?section=records').html).includes('triples-assemble24'));
});

test('each active overview/updates has one timeline, never a hidden duplicate; other sections have none',()=>{
  for(const section of ['overview','updates','members','works','records'])assert.equal((renderer(scene(),'/artists/triples?section='+section).html.match(/data-timeline-host=/g)||[]).length,['overview','updates'].includes(section)?1:0);
});
test('search has real readable empty results and roster matches exact S numbers and Chinese names',()=>{
  const r=renderer(scene(),'/artists/triples?section=works&q=NoSuchTrack');assert.match(r.html,/没有符合条件的作品/);
  const rows=r.load('lib/idol/triples-identity.ts').triplesRoster(scene().members);
  const match=r.module.triplesRosterMatches;
  assert.deepEqual(rows.filter(x=>match(x,'S2')).map(x=>x.identity.sNumber),[2]);
  assert.deepEqual(rows.filter(x=>match(x,'索琳')).map(x=>x.identity.sNumber),[22]);
  assert.equal(rows.filter(x=>match(x,'NoSuchMember')).length,0);
});
test('member view retains record links and optional biography; image routes stay verified and source data is unchanged',()=>{
  const data=scene(),m=data.members[21];m.profile='Existing public biography';const before=JSON.stringify(data);freeze(data);
  const html=renderer(data,'/artists/triples?section=members&member='+m.id+'&reader='+m.id).html;
  assert.match(html,/个人档案与记录/);assert.match(html,/Existing public biography/);assert.match(html,/索琳/);assert.equal(JSON.stringify(data),before);
  assert.doesNotMatch(html,/batch-b-original|拍摄日期|未确认|雪琳/);
  const source=fs.readFileSync('components/candidate/triples-design.tsx','utf8');assert.doesNotMatch(source,/method:\s*['"](?:POST|PATCH|PUT|DELETE)|api\/(save|records)|CandidateArtistExperience|CandidateComposition/);
  assert.match(source,/memberWorks\(state.data, m.id\)/);assert.match(source,/newArtistHistoryState\(window.history.state\)/);
});

test('member return preserves its source reader and section, or returns to the default complete people wall',()=>{
  const data=scene(),s22=publicMembers[21],s5=publicMembers[4];
  for(const reader of [null,s5.id]){
    const r=renderer(data,'/artists/triples?section=overview&member='+s22.id+'&q=Girls&format=stage'+(reader?'&reader='+reader:''));
    const button=r.elements.find(e=>e.type==='button'&&Array.isArray(e.props.children)&&e.props.children.includes('返回成员摄影册'));
    assert.ok(button);button.props.onClick();const target=new URL(r.navigations.at(-1),'https://test.invalid');
    assert.equal(target.searchParams.get('reader'),reader);assert.equal(target.searchParams.get('section'),null);
    assert.equal(target.searchParams.get('q'),'Girls');assert.equal(target.searchParams.get('format'),'stage');assert.equal(target.searchParams.get('member'),null);
  }
});


test('release deep links are known-key triples-only and retain search, queue and returnTo',()=>{
  const r=renderer(scene()),{triplesReaderRoute,triplesReaderUrl}=r.module;
  const {safeArtistReturn}=r.load('lib/idol/artist-navigation.ts');
  const url='/artists/triples?section=works&q=Girls&format=mv&release=assemble24';
  const route=triplesReaderRoute(url);assert.equal(route.release,'assemble24');
  assert.equal(safeArtistReturn(triplesReaderUrl(route)),triplesReaderUrl(route));
  for(const url of ['/artists/meovv?release=assemble24','/artists/triples?release=unknown','/artists/triples?release=assemble24&release=assemble','/artists/triples?release=https://evil.example'])assert.equal(safeArtistReturn(url),null);
  const release=renderer(scene(),url);
  assert.match(release.html,/ts-release-sleeve/);assert.match(release.html,/release-assemble24.jpg/);
  const back=release.elements.find(e=>e.type==='button'&&e.props.children==='返回音乐与影像');back.props.onClick();
  assert.ok(!release.navigations.at(-1).includes('release='));assert.match(release.navigations.at(-1),/q=Girls/);
});

test('all 65 approved imagery slots exist and Chinese fallback is identity-bound without mutation',()=>{
  const r=renderer(scene()),helper=r.load('lib/idol/triples-design-catalog.ts');
  const catalog=JSON.parse(fs.readFileSync('data/triples/design-public-catalog.json'));
  assert.equal(catalog.releases.length,22);assert.equal(catalog.musicVideos.length,17);assert.equal(catalog.stages.length,1);
  for(const entry of [...catalog.releases,...catalog.musicVideos,...catalog.stages])assert.ok(fs.statSync('public'+entry.localImage).size>0);
  for(const m of publicMembers){const input={...m,cnName:'',groupIds:[content.groupId]};assert.match(helper.triplesChineseLabel(input),/[\u3400-\u9fff]/);}
  const identity={...publicMembers[0],cnName:'',stageName:'Wrong Identity',groupIds:[content.groupId]};assert.equal(helper.triplesChineseLabel(identity),'Wrong Identity');
  const entry=catalog.musicVideos.find(x=>x.key==='generation'),data=scene();
  const matched=helper.triplesPublicWork(entry,data.works);assert.ok(matched);
  assert.equal(helper.triplesPublicWork({...entry,officialUrl:'https://example.com/wrong'},data.works),null);
  assert.equal(helper.triplesPublicWork({...entry,kind:'stage'},data.works),null);
  assert.equal(helper.triplesPublicWork(entry,[...data.works,{...matched,id:'recDuplicate'}]),null);
  assert.equal(helper.triplesPublicDate({...entry,date:null}),'');
});


test('timeline opening skips undated events and preserves year/month/day precision without inventing a year',()=>{
 const data=scene();freeze(data);
 for(const dates of [[null],[null,{value:'2024-05-08',precision:'day'},{value:'2022',precision:'year'},{value:'2023-02',precision:'month'}]]){
  const input={...timeline,events:dates.map((eventDate,i)=>({...timeline.events[0],id:'e-nullable-fixture-'+i,releaseKey:'nullable-fixture-'+i,relatedEventIds:[],eventDate}))};
  const before=JSON.stringify(input);freeze(input);
  const r=renderer(data,'/artists/triples?section=updates',{input});
  const prepared=r.load('lib/idol/timeline/presentation.ts').prepareTimelinePresentation(input,data,r.load('data/artist-timeline-registry.json').default);
  assert.equal(prepared.state,'ready');assert.equal(prepared.timeline.events.length,dates.length);
  assert.match(r.html,new RegExp('class="ts-timeline-opening"><strong>'+(dates.length===1?'tripleS':'2022')+'</strong>'));
  assert.equal(JSON.stringify(input),before);
 }
});

test('public releases keep unknown dates empty, sort dated releases first, and do not invent null semantics',()=>{
 const r=renderer(scene()),helper=r.load('lib/idol/triples-design-catalog.ts');
 const entries=helper.triplesPublicReleases;
 const unknown=entries.find(entry=>entry.key==='krystal-eyes-touch');
 assert.ok(unknown);assert.equal(unknown.date,null);assert.equal(unknown.dateSemantics,null);
 assert.equal(helper.triplesPublicDate(unknown),'');assert.equal(entries.at(-1).key,unknown.key);
 const dated=Array.from(entries.filter(entry=>entry.date),entry=>entry.date);
 assert.deepEqual(dated,[...dated].sort((a,b)=>b.localeCompare(a)));
 assert.equal(helper.triplesPublicDate({...unknown,date:'2023-06',dateSemantics:null}),'2023-06');
 for(const [dateSemantics,prefix] of [['broadcast_date','播出'],['official_video_publication_date','MV 公开'],['official_japanese_release_date','日本发行'],['platform_release_date','平台发行']]){
  assert.equal(helper.triplesPublicDate({...unknown,date:'2024-05-08',dateSemantics}),prefix+' · 2024-05-08');
 }
 const html=renderer(scene(),'/artists/triples?section=works&release='+unknown.key).html;
 assert.match(html,/ts-release-page/);
 const liner=html.match(/<div class="ts-liner">([\s\S]*?)<\/div>/)?.[1];
 assert.ok(liner);assert.doesNotMatch(liner,/<p>|平台发行 ·|日本发行 ·|MV 公开 ·/);
 assert.match(html,/MV 公开 · 2023-06-22/,'the independently known MV publication date remains visible');
});

test('triples approved member looks retain private primary and qualified reference without promoting legacy',()=>{
 const d=scene();d.mode='live';const m=d.members[0];const w={...(d.works[0]||{}),id:'recLookWork',name:'Synthetic look',song:'Synthetic look',groupIds:m.groupIds,url:'https://www.youtube.com/watch?v=abcdefghijk',score:0,stageScore:null,stage:null};d.works.push(w);
 const r={id:'recLookRating',memberIds:[m.id],workIds:[w.id],score:0,stylingScore:null,photo:{table:'ratings',recordId:'recLookRating',fieldId:'photos',index:4,sourceKind:'mv_look_photo',approvedLookIdentity:{sameLook:true,memberId:m.id,workId:w.id,videoId:'abcdefghijk'}}};
 r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};d.ratings.push(r);
 const url='/artists/triples?section=members&member='+m.id,before=JSON.stringify(d),html=renderer(d,url).html;
 assert.match(html,/mv-look-native/);assert.match(html,/本MV同造型照片/);assert.match(html,/原MV截图/);assert.match(html,/record=recLookRating&amp;index=4/);assert.doesNotMatch(html,/<img[^>]+record=recLookRating[^>]+index=0/);assert.equal(JSON.stringify(d),before);
 r.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(renderer(d,url).html,/原MV截图/);
 r.photo.sourceKind='mv_still';r.photo.kind='本 MV 截图';r.photo.nativeIdentity={memberId:m.id,workId:w.id};const legacy=renderer(d,url).html;assert.match(legacy,/record=recLookRating&amp;index=4/);assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
 r.photo=null;assert.doesNotMatch(renderer(d,url).html,/record=recLookRating|原MV截图/);
});
