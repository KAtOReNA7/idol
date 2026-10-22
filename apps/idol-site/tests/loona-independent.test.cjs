/* Real component SSR with public identity metadata and synthetic private values. */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react'), jsx = require('react/jsx-runtime');
const {renderToStaticMarkup} = require('react-dom/server');
const content = JSON.parse(fs.readFileSync('data/loona-artist.json'));
const publicMembers = JSON.parse(fs.readFileSync('tests/fixtures/loona-public-identities.json'));
const publicWorks = JSON.parse(fs.readFileSync('tests/fixtures/loona-public-works.json'));
const baseline = JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json'));
const timeline = JSON.parse(fs.readFileSync('data/artist-timelines/loona.json'));
function scene() {
 const memberSeed=baseline.members.find(m=>m.groupIds.includes(content.groupId));
 const workSeed=baseline.works.find(w=>w.groupIds.includes(content.groupId));
 return {...baseline,members:publicMembers.map(m=>({...memberSeed,...m})),ratings:[],works:publicWorks.map(w=>({...workSeed,...w,score:0,groupIds:[content.groupId]}))};
}
function renderer(data, url = '/artists/loona', options = {}) {
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
      requestAnimationFrame:fn=>{fn();return 1;},window:{history,location:new URL(url,'https://site.invalid'),dispatchEvent:()=>{}},document:{getElementById:()=>({focus:()=>{},scrollIntoView:()=>{}})}})(name=>{
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
  const module=load('components/candidate/loona-design.tsx');
  return {html:renderToStaticMarkup(React.createElement(module.default,{content})),module,elements,navigations,load};
}
const urls = html => [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
const memberIds = html => [...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(m=>m[1]);
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
test('independent historical default exposes 12 existing identities, preserves current 11 and source records',()=>{
 const data=scene(),before=JSON.stringify(data);freeze(data);const r=renderer(data);
 assert.equal(data.members.filter(m=>m.groupIds.includes(content.groupId)).length,11);
 assert.deepEqual(memberIds(r.html),publicMembers.map(m=>m.id));
 assert.equal(JSON.stringify(data),before);
 assert.match(r.html,/历史成员 · 12 人/);assert.match(r.html,/历史十二人名册/);
 for(const m of publicMembers)assert.ok(r.html.includes(m.cnName),m.stageName);
 assert.match(r.html,/approved-home\/hero.jpg/);assert.doesNotMatch(r.html,/batch-b-20261016\/.*original|ca-ordinal|loona-orbit/);
 for(const unit of ['unit-13.jpg','unit-oec.jpg','unit-yyxy.jpg'])assert.ok(r.html.includes(unit));
 assert.equal((r.html.match(/ln-home-history-grid/g)||[]).length,1);
});
test('CHUU works in both direct and historical deep links with precise portrait identity and original profile URL',()=>{
 for(const suffix of ['', '&roster=history']){
  const url='/artists/loona?section=members&member=recvxyICzHTm4b'+suffix,r=renderer(scene(),url);
  assert.match(r.html,/金智雨/);assert.match(r.html,/approved-home\/chuu.jpg/);assert.match(r.html,/历史成员 · 曾属本团/);
  const profile=urls(r.html).find(href=>href.includes('member=recvxyICzHTm4b'));
  assert.equal(new URL(profile,'https://site.invalid').searchParams.get('returnTo'),url);
 }
 const data=scene();data.members.find(m=>m.id==='recvxyICzHTm4b').stageName='WRONG';
 assert.doesNotMatch(renderer(data,'/artists/loona?member=recvxyICzHTm4b').html,/approved-home\/chuu.jpg/);
 for(const id of ['recUnknown','recForeign'])assert.match(renderer(scene(),'/artists/loona?member='+id).html,/这个成员不在本团档案中/);
});
test('member click preserves section, queue, search, format and explicit historical scope',()=>{
 const url='/artists/loona?section=members&queue=tonight&q=test&format=mv&roster=history',r=renderer(scene(),url);
 const button=r.elements.find(e=>e.type==='button'&&e.props['data-artist-member-trigger']==='recvxyICzHTm4b');button.props.onClick();
 const result=new URL(r.navigations.at(-1),'https://site.invalid');
 for(const [key,value]of new URL(url,'https://site.invalid').searchParams)assert.equal(result.searchParams.get(key),value);
 assert.equal(result.searchParams.get('member'),'recvxyICzHTm4b');
});
test('source exact return query survives shared routeUrl and readRoute; unsupported query remains rejected',()=>{
 const r=renderer(scene()),nav=r.load('lib/idol/artist-navigation.ts'),journey=r.load('lib/idol/journey.ts');
 for(const url of ['/artists/loona','/artists/loona?roster=history','/artists/loona?format=mv&section=overview&queue=all&roster=history&q=Hi%20High']){
  assert.equal(nav.safeArtistReturn(url),url);assert.equal(r.module.loonaReturnUrl(url),url);
  const dest=journey.routeUrl({nav:'works',work:publicWorks[0].id,member:null,video:'mv',artistReturn:url});
  assert.equal(new URL(dest,'https://site.invalid').searchParams.get('returnTo'),url);
  assert.equal(journey.readRoute(dest).artistReturn,url);
 }
 for(const bad of ['/artists/loona?roster=current','/artists/loona?roster=history&roster=history','/artists/loona?reader=recX','/artists/loona?unknown=true','https://evil.example/artists/loona','/artists/loona#x','/artists/loona?%72oster=history&roster=history','/artists/loona?%71=x&q=y','/artists/loona?%6eote=secret','/artists/loona?q='+ 'x'.repeat(201),'/artists/loona?member=bad','/artists/loona?format=bad'])assert.equal(nav.safeArtistReturn(bad),null);
});
test('full ten-work catalog remains independently reachable with exact work IDs, zero score and MV/stage links',()=>{
 for(const section of ['works','records']){
  const r=renderer(scene(),'/artists/loona?section='+section);
  assert.equal((r.html.match(/data-work-id=/g)||[]).length,10);
  for(const work of publicWorks){assert.ok(r.html.includes(`data-work-id="${work.id}"`));assert.ok(urls(r.html).some(href=>href.includes('work='+work.id)));}
  assert.match(r.html,/<b>0.0<\/b>/);
 }
 const d=scene();d.works[0].stage={videoId:'validstage1'};const r=renderer(d,'/artists/loona?section=works');assert.ok(urls(r.html).some(href=>href.includes('video=stage')));
});
test('curation requires exact stable ID, original video and title; no index/title collision fallback',()=>{
 const d=scene();d.works.reverse();const r=renderer(d);
 assert.equal((r.html.match(/data-release-key=/g)||[]).length,4);assert.equal((r.html.match(/data-home-video-id=/g)||[]).length,4);
 const curate=r.load('lib/idol/loona-curation.ts').loonaSelectedWorks;
 for(const field of ['id','url','song','groupIds']){const copy=scene().works;const w=copy.find(w=>w.id==='recvxyOz5X7Pt4');w[field]=field==='groupIds'?[]:'wrong';assert.ok(!curate(copy).some(e=>e.id==='recvxyOz5X7Pt4'));}
 const copy=scene().works;copy.push({...copy.find(w=>w.id==='recvxyOz5X7Pt4')});assert.ok(!curate(copy).some(e=>e.id==='recvxyOz5X7Pt4'));
});
test('full timeline appears once only in updates; home uses a single preview and existing behavior stays read-only',()=>{
 for(const section of ['overview','updates','members','works','records']){
  const r=renderer(scene(),'/artists/loona?section='+section);assert.equal((r.html.match(/data-timeline-host=/g)||[]).length,section==='updates'?1:0);
 }
 const s=fs.readFileSync('components/candidate/loona-design.tsx','utf8');
 assert.doesNotMatch(s,/method:\s*['"](?:POST|PATCH|PUT|DELETE)|api\/(save|records)|CandidateArtistExperience|CandidateComposition/);
 assert.match(s,/memberWorks\(state.data, m.id\)/);assert.match(s,/PhotoLightbox/);assert.match(s,/仅自己可见/);
});
test('four originals retain audited bytes and all existing eleven portrait bindings remain exact',()=>{
 const crypto=require('node:crypto'),audit=JSON.parse(fs.readFileSync('research/loona-independent/asset-audit.json'));
 assert.equal(audit.length,4);for(const a of audit)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(a.path)).digest('hex'),a.sha256);
 const {execFileSync}=require('node:child_process'),before=JSON.parse(execFileSync('git',['show','b7614d413a7a52af19f27fa3538f47d7922f894f:data/loona-artist.json'],{encoding:'utf8'}));
 for(const [id,portrait] of Object.entries(before.portraits))assert.deepEqual(content.portraits[id],portrait);
 assert.equal(Object.keys(content.portraits).length,11);assert.deepEqual(content.hero,before.hero);const extra=renderer(scene()).load('lib/idol/loona-curation.ts').loonaHistoricalPortraits;assert.deepEqual(Object.keys(extra),['recvxyICzHTm4b']);assert.equal(extra.recvxyICzHTm4b.stageName,'CHUU');
});

test('work rows preserve watched, explicitly unwatched and unmarked states without inventing queue membership',()=>{
 for(const score of [0,null])for(const [watched,label] of [['已观看','已看'],['未观看','未看'],['','未标记'],['other','未标记']]){
  const data=scene();data.works=data.works.slice(0,1).map(work=>({...work,watched,score}));const before=JSON.stringify(data);
  const html=renderer(data,'/artists/loona?section=works').html;assert.ok(html.includes('<span>'+label+'</span>'));assert.ok(html.includes('<b>'+(score===null?'未评分':'0.0')+'</b>'));assert.equal(JSON.stringify(data),before);
 }
});

test('public LOONA copy contains musical facts without implementation or audit disclaimers',()=>{
 const forbidden=['历史阅读范围','含曾属成员 · 不代表当前活动阵容','作品入口保留现有版本与档案日期','音源发行节点请见时间轴','音乐发行和 MV 日期分别记录','人物、分队与作品，保留在各自的历史语境里','这里以历史名册与完整体作品为入口','各阶段保留自己的名字'];
 for(const section of ['overview','members','works','updates','records']){const html=renderer(scene(),'/artists/loona?section='+section).html;for(const text of forbidden)assert.ok(!html.includes(text),section+': '+text);}
 const html=renderer(scene()).html;assert.match(html,/LUMINOUS/);assert.match(html,/2022-09-28/);assert.match(html,/日本实体单曲发行/);assert.match(html,/十二人完整体出道/);assert.match(html,/逐月成员企划启动/);assert.match(html,/历史成员 · 12 人/);
});

test('reviewed static photos reserve exact native and fallback geometry before image decode',()=>{
 const r=renderer(scene()),dims=r.load('lib/idol/loona-curation.ts').loonaImageDimensions;
 const audit=JSON.parse(fs.readFileSync('research/loona-independent/asset-audit.json'));
 for(const row of audit){const src=('/'+row.path.replace(/^public\//,'')).replace('/independent-v2/','/approved-home/');assert.equal(dims(src).width,row.width);assert.equal(dims(src).height,row.height);}
 const expected=[['/artist/loona/approved-home/unit-13.jpg',1000,684],['/artist/loona/approved-home/unit-oec.jpg',1000,667],['/artist/loona/approved-home/unit-yyxy.jpg',1000,695],['/artist/loona/approved-home/hero.jpg',1576,1051],['/artist/loona/approved-home/luminous.png',500,500]];
 for(const [src,width,height] of expected){
  const tag=[...r.html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes('src="'+src+'"'));
  assert.ok(tag,src);assert.ok(tag.includes(`width="${width}"`));assert.ok(tag.includes(`height="${height}"`));assert.ok(tag.includes(`aspect-ratio:${width} / ${height}`));assert.ok(tag.includes('object-fit:contain'));
  const image=r.elements.find(e=>e.type?.name==='ReliableImage'&&e.props.src===src);assert.ok(image);assert.equal(image.props.fallbackStyle.aspectRatio,`${width} / ${height}`);assert.equal(image.props.fallbackStyle.width,'100%');assert.equal(image.props.fallbackStyle.minHeight,0);
 }
 const chuu=renderer(scene(),'/artists/loona?member=recvxyICzHTm4b'),tag=[...chuu.html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes('/approved-home/chuu.jpg'));
 assert.ok(tag.includes('width="800"'));assert.ok(tag.includes('height="1200"'));assert.ok(tag.includes('aspect-ratio:800 / 1200'));
});
test('static geometry lookup fails closed for changed sources and never sizes runtime personal MV photos',()=>{
 const r=renderer(scene()),dims=r.load('lib/idol/loona-curation.ts').loonaImageDimensions;
 for(const src of [undefined,null,'','/api/media?table=ratings&record=recAny&index=0','/api/media?table=members&record=recvxyICzHTm4b&index=0',content.hero.image+'?changed=1','https://example.com/unit-13.jpg',Object.values(content.portraits)[0].image])assert.equal(dims(src),undefined);
 const source=fs.readFileSync('components/candidate/loona-design.tsx','utf8');const look=source.split('<Picture src={media(item.photo)}')[1].split('/>')[0];assert.doesNotMatch(look,/width=|height=|loonaImageDimensions/);
});

 test('approved home assets, release identities and MV dates remain separate',()=>{
 const r=renderer(scene()),home=r.load('lib/idol/loona-home.ts');
 const releases=home.loonaHomeReleases(scene().works),videos=home.loonaHomeVideos(scene().works);
 assert.equal(releases.length,4);assert.equal(videos.length,4);
 assert.equal(releases[3].date,'2022-09-28');assert.equal(releases[3].work.releaseDate,'2022-09-17');
 assert.deepEqual(Array.from(releases,e=>e.work.id),['recvxyOz5X7G95','recvxyOz5X09bu','recvxyOz5X4k6N','recvxyOz5XueI9']);
 assert.deepEqual(Array.from(videos,e=>e.work.id),['recvxyOz5X7G95','recvxyOz5XKztg','recvxyOz5XLBUV','recvxyOz5XL5xq']);
 const wrong=scene().works.map(w=>({...w,id:w.id.toUpperCase()}));assert.ok(home.loonaHomeReleases(wrong).every(e=>!e.work));assert.ok(home.loonaHomeVideos(wrong).every(e=>!e.work));
 for(const m of scene().members){assert.ok(home.loonaHomePortrait(m));assert.equal(home.loonaHomePortrait({...m,stageName:'WRONG'}),undefined);}
 const images=[...r.html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)].map(m=>m[1]);assert.equal(images.length,28);
 for(const src of images){assert.ok(src.startsWith('/artist/loona/approved-home/'));assert.ok(fs.statSync('public'+src).size>0);}
 for(const file of ['logo-loona.png','logo-unit-13.png','logo-unit-oec.png','logo-unit-yyxy.png'])assert.ok(images.some(src=>src.endsWith(file)));
 const css=fs.readFileSync('app/artists/loona/loona-artist.css','utf8');assert.match(css,/ln-home-roster\{display:grid;grid-template-columns:repeat\(6/);assert.match(css,/ln-home-roster\{grid-template-columns:repeat\(2/);
});

test('approved inner directory and member pages use identity-bound portraits and responsive page chrome',()=>{
 const directory=renderer(scene(),'/artists/loona?section=members');
 assert.equal((directory.html.match(/class="ln-inner-person"/g)||[]).length,12);
 assert.deepEqual(memberIds(directory.html),publicMembers.map(m=>m.id));
 assert.match(directory.html,/ln-approved-inner/);assert.match(directory.html,/logo-unit-oec.png/);
 for(const member of publicMembers){
  const r=renderer(scene(),'/artists/loona?section=members&member='+member.id);
  assert.match(r.html,/loona-member-works/);assert.match(r.html,/ln-inner-adjacent/);
  assert.ok(r.html.includes(member.cnName));
 }
 const css=fs.readFileSync('app/artists/loona/loona-inner.css','utf8');
 assert.match(css,/ln-inner-portrait img\{[^}]*object-fit:cover!important/);
 assert.match(css,/ln-inner-roster\{grid-template-columns:repeat\(2/);
});

test('inner library distinguishes album covers from MV previews without writing catalog data',()=>{
 const data=scene(),before=JSON.stringify(data),r=renderer(data,'/artists/loona?section=works');
 assert.match(r.html,/ln-inner-work-art is-cover/);assert.match(r.html,/MV 预览/);
 assert.match(r.html,/loona-inner-releases/);assert.equal(JSON.stringify(data),before);
 const images=[...r.html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
 for(const src of images.filter(src=>src.startsWith('/artist/loona/approved-home/')))assert.ok(fs.statSync('public'+src).size>0);
});

test('loona approved member looks retain private primary and qualified reference without promoting legacy',()=>{
 const d=scene();d.mode='live';const m=d.members[0];const w={...(d.works[0]||{}),id:'recLookWork',name:'Synthetic look',song:'Synthetic look',groupIds:m.groupIds,url:'https://www.youtube.com/watch?v=abcdefghijk',score:0,stageScore:null,stage:null};d.works.push(w);
 const r={id:'recLookRating',memberIds:[m.id],workIds:[w.id],score:0,stylingScore:null,photo:{table:'ratings',recordId:'recLookRating',fieldId:'photos',index:4,sourceKind:'mv_look_photo',approvedLookIdentity:{sameLook:true,memberId:m.id,workId:w.id,videoId:'abcdefghijk'}}};
 r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};d.ratings.push(r);
 const url='/artists/loona?section=members&member='+m.id,before=JSON.stringify(d),html=renderer(d,url).html;
 assert.match(html,/mv-look-native/);assert.match(html,/本MV同造型照片/);assert.match(html,/原MV截图/);assert.match(html,/record=recLookRating&amp;index=4/);assert.doesNotMatch(html,/<img[^>]+record=recLookRating[^>]+index=0/);assert.equal(JSON.stringify(d),before);
 r.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(renderer(d,url).html,/原MV截图/);
 r.photo.sourceKind='mv_still';r.photo.kind='本 MV 截图';r.photo.nativeIdentity={memberId:m.id,workId:w.id};const legacy=renderer(d,url).html;assert.match(legacy,/record=recLookRating&amp;index=4/);assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
 r.photo=null;assert.doesNotMatch(renderer(d,url).html,/record=recLookRating|原MV截图/);
});
