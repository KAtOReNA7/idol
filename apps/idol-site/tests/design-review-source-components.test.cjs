/* eslint-disable @typescript-eslint/no-require-imports */
// Synthetic SSR, navigation and byte-integrity checks. Browser geometry is not claimed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {createRequire} = require('node:module');
const root = path.resolve(process.env.DESIGN_REVIEW_SOURCE_ROOT || path.resolve(__dirname, '..'));
const overlay = path.resolve(process.env.DESIGN_REVIEW_OVERLAY_ROOT || root);
const req = createRequire(path.join(root, 'package.json'));
const ts = req('typescript');
const React = req('react');
const {renderToStaticMarkup} = req('react-dom/server');
const file = relative => fs.existsSync(path.join(overlay, relative)) ? path.join(overlay, relative) : path.join(root, relative);
const read = relative => fs.readFileSync(file(relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const hash = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const fixture = json('tests/fixtures/candidate37.synthetic.json');
const identities = [['recvxyICzHSB1r','YUJIN','崔有真'],['recvxyICzHvcNv','XIAOTING','沈小婷'],['recvxyICzHCOwh','CHAEHYUN','金采炫'],['recvxyICzHkiWq','DAYEON','金多娟'],['recvxyICzHOon2','HIKARU','江崎光'],['recvxyICzHvPnL','HUENING BAHIYYIH','休宁巴伊叶'],['rec28ldbniBgam','MASHIRO','坂本舞白'],['rec28ldbniBgvC','YESEO','姜睿序'],['recvxyICzHHBnl','YOUNGEUN','徐永恩']];
function scene(group) {
  const content = json(`data/${group}-artist.json`);
  const member = fixture.members.find(row => row.groupIds.includes(content.groupId));
  const seed = fixture.works.find(row => row.groupIds.includes(content.groupId));
  const names = ['玹洙','娜娜','洁莉','琴子','允夏','艾莉西亚','允娥','瑞院'];
  const members = group === 'unis'
    ? Object.entries(content.portraits).map(([id, image], i) => ({...member, id, stageName: image.stageName, cnName: names[i], groupIds: [content.groupId], photo: null}))
    : identities.map(([id,stageName,cnName], i) => ({...member,id,stageName,cnName,groupIds:i<6?[content.groupId]:i<8?['rec28ldfRTiCzI']:[],formerGroupIds:i<6?[]:[content.groupId],photo:null,profile:'',officialUrl:'',birthDate:'',status:''}));
  const inventory = json('data/stages/inventory.json'), stages = json('data/stage-videos.json');
  const works = inventory.works.filter(row => row.groupIds.includes(content.groupId)).map(row => ({...seed,id:row.recordId,name:row.name,song:row.song,groupIds:row.groupIds,url:row.mv.url,videoType:row.mv.videoType,releaseDate:row.mv.releaseDate||'',stage:stages[row.recordId]||null,score:null,stageScore:null,watched:'',stageSupplement:null}));
  return {...fixture, mode:'live', groups:[...fixture.groups.filter(row => row.id===content.groupId),{...fixture.groups[0],id:'rec28ldfRTiCzI',name:'MADEIN'}],members,works,ratings:[]};
}
function renderer(group, data, url=`/design-review/${group}`, state={}) {
  const cache = new Map(), navigation=[];
  const options = {catalog:data, input:json(`data/artist-timelines/${group}.json`), serverRoute:url, styleReady:true, ...state};
  const mockReact = {...React,useEffect:()=>{},useLayoutEffect:()=>{},...(state.captureTree?{useState:initial=>[typeof initial==='function'?initial():initial,()=>{}],useMemo:fn=>fn(),useSyncExternalStore:(subscribe,snapshot,server)=>server()}: {})};
  const window = {history:{state:{},pushState:(_state,_title,destination)=>navigation.push(destination),replaceState:(_state,_title,destination)=>navigation.push(destination)},dispatchEvent:()=>{},scrollTo:()=>{}};
  function load(relative) {
    relative=path.normalize(relative);
    if(relative.endsWith('.css'))return {};
    if(relative.endsWith('.json'))return {default:json(relative)};
    if(cache.has(relative))return cache.get(relative);
    const exports={};cache.set(relative,exports);
    const code=ts.transpileModule(read(relative),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext('(function(require,exports){'+code+'\n})',{URL,URLSearchParams,Date,AbortController,DOMException,Event,window,document:{getElementById:()=>({scrollIntoView:()=>{}})},setTimeout,clearTimeout,setInterval,clearInterval},{filename:relative})(name=>{
      if(name==='react')return mockReact;
      if(name==='@/components/use-artist-scroll'||name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};
      if(name==='@/components/artist-timeline-host')return {...load('components/artist-timeline-host.tsx'),useArtistTimelineHostOptions:()=>options};
      if(name.startsWith('@/')||name.startsWith('.')){
        const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(relative),name);
        const match=['','.ts','.tsx','.mjs'].map(ext=>target+ext).find(candidate=>fs.existsSync(file(candidate))&&fs.statSync(file(candidate)).isFile());
        if(!match)throw Error(`Missing ${name} from ${relative}`);
        return load(match);
      }
      return req(name);
    },exports);
    return exports;
  }
  const component=()=>load(`components/design-review/${group}-design-review.tsx`).default;
  return {load,navigation,tree:()=>component()({content:json(`data/${group}-artist.json`)}),render:()=>renderToStaticMarkup(React.createElement(load('components/artist-timeline-host.tsx').ArtistTimelineHostProvider,{value:options},React.createElement(component(),{content:json(`data/${group}-artist.json`)})))};
}
function links(html){return [...html.matchAll(/href="([^"]+)"/g)].map(match=>new URL(match[1].replaceAll('&amp;','&'),'https://test.invalid'));}
function nodes(tree,predicate){if(!tree)return [];if(Array.isArray(tree))return tree.flatMap(value=>nodes(value,predicate));if(typeof tree!=='object')return [];return [...(predicate(tree)?[tree]:[]),...nodes(tree.props?.children,predicate)];}
function label(node){if(Array.isArray(node))return node.map(label).join('');if(typeof node==='string'||typeof node==='number')return String(node);return node&&typeof node==='object'?label(node.props?.children):'';}

for(const group of ['unis','kep1er']) {
  test(`${group}: home uses live identities and original images without mutations`,()=>{
    const data=scene(group),before=JSON.stringify(data),html=renderer(group,data).render();
    assert.ok(html.includes(json(`data/${group}-artist.json`).hero.image));
    assert.equal((html.match(/data-artist-member-trigger=/g)||[]).length,group==='unis'?8:6);
    assert.doesNotMatch(html,/candidate-artist|演示保存/);
    assert.equal(JSON.stringify(data),before);
  });
  test(`${group}: aliases retain filters and canonical app playback returns`,()=>{
    const data=scene(group);data.works[0].score=0;
    for(const format of ['mv','stage']){
      const html=renderer(group,data,`/design-review/${group}?section=works&format=${format}`).render();
      const workLinks=links(html).filter(url=>url.searchParams.has('work'));assert.ok(workLinks.length);
      for(const link of workLinks){assert.equal(link.pathname,'/');assert.equal(link.searchParams.get('returnTo'),`/artists/${group}?section=works&format=${format}`);assert.equal(link.searchParams.get('video'),format==='stage'?'stage':null);}
    }
    const empty=renderer(group,data,`/design-review/${group}?section=works&q=UNMATCHED_SYNTHETIC_QUERY`).render();
    assert.match(empty,/没有符合条件的作品/);assert.doesNotMatch(empty,/data-work-id=/);
  });
  test(`${group}: member reader retains zero/null scores and existing edit targets`,()=>{
    const data=scene(group),person=data.members[0],work=data.works[0];
    data.ratings=[{id:'recRatingFixture',memberIds:[person.id],workIds:[work.id],score:0,stylingScore:null,photo:null,note:'unchanged',memory:''}];
    const before=JSON.stringify(data),html=renderer(group,data,`/design-review/${group}?section=members&member=${person.id}`).render();
    assert.match(html,/表现 0\.0 · 造型 未评分/);
    const target=links(html).find(url=>url.searchParams.get('member')===person.id);
    assert.equal(target.pathname,'/');assert.equal(target.searchParams.get('returnTo'),`/artists/${group}?section=members&member=${person.id}`);assert.equal(JSON.stringify(data),before);
  });
  test(`${group}: section buttons and empty reset keep navigation in review routes`,()=>{
    const data=scene(group),home=renderer(group,data,`/design-review/${group}`,{captureTree:true});
    const button=nodes(home.tree(),node=>node.type==='button'&&/^成员(?:成员)?$/.test(label(node)))[0];assert.ok(button);button.props.onClick();
    assert.equal(home.navigation.at(-1),`/design-review/${group}?section=members`);
    const empty=renderer(group,data,`/design-review/${group}?section=works&format=mv&q=not_a_song`,{captureTree:true});
    const reset=nodes(empty.tree(),node=>node.type==='button'&&label(node)==='清除搜索与筛选')[0];assert.ok(reset);reset.props.onClick();
    assert.equal(empty.navigation.at(-1),`/design-review/${group}?section=works`);
  });
  test(`${group}: canonical timeline and failure states remain real`,()=>{
    const html=renderer(group,scene(group),`/design-review/${group}?section=updates`).render();
    assert.equal((html.match(/class="artist-timeline"/g)||[]).length,1);assert.match(html,/返回首页/);
    assert.match(renderer(group,null,`/design-review/${group}`,{loading:true}).render(),/正在打开/);
    assert.match(renderer(group,null,`/design-review/${group}`,{error:'读取测试失败'}).render(),/role="alert"/);
  });
}
test('Kep1er history roster and historical reader survive preview aliases',()=>{
  const data=scene('kep1er'),html=renderer('kep1er',data,'/design-review/kep1er?section=members&roster=history').render();
  assert.deepEqual([...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(match=>match[1]),data.members.slice(6).map(member=>member.id));
  const reader=renderer('kep1er',data,'/design-review/kep1er?section=members&roster=history&member=rec28ldbniBgam').render();
  assert.match(reader,/档案当前所属：MADEIN/);
  const capture=renderer('kep1er',data,'/design-review/kep1er?section=members',{captureTree:true});
  nodes(capture.tree(),node=>node.type==='button'&&label(node)==='曾经同行')[0].props.onClick();
  assert.equal(capture.navigation.at(-1),'/design-review/kep1er?section=members&roster=history');
});
test('UNIS all releases open inside preview and editor returns remain allowlisted',()=>{
  const render=renderer('unis',scene('unis'));
  const helpers=render.load('lib/idol/design-review/unis-presentation.ts');
  const adapter=render.load('lib/idol/design-review/artist-route.ts');
  const safe=render.load('lib/idol/artist-navigation.ts').safeArtistReturn;
  const releases=render.load('lib/idol/unis-editorial.ts').unisEditorialReleases;
  assert.equal(releases.length,10);
  for(const release of releases){
    const target=helpers.unisRouteUrl(adapter.reviewArtistRoute('/design-review/unis?section=works'),release.releaseKey);
    assert.ok(target.startsWith('/design-review/unis?section=works&release='));
    const html=renderer('unis',scene('unis'),target).render();assert.ok(html.includes(release.title.replaceAll('&','&amp;')));
    assert.ok(safe(adapter.productionReturn(target)));
  }
  assert.equal(safe('/design-review/unis'),null);
  assert.equal(safe('/design-review/kep1er'),null);
});
test('shared runtime has no writes or old component imports; official routes opt into canonical paths',()=>{
  for(const group of ['unis','kep1er']){
    const source=read(`components/design-review/${group}-design-review.tsx`);
    assert.doesNotMatch(source,/method:\s*['"](?:POST|PATCH|PUT|DELETE)|localStorage|sessionStorage|CandidateArtistExperience/);
    assert.match(source,new RegExp(`/api/catalog\\?artist=${group}&shape=display-v1`));
    const page=read(`app/artists/${group}/page.tsx`);
    assert.match(page,new RegExp(`components/design-review/${group}-design-review`));
    assert.ok(page.includes(`basePath="/artists/${group}"`));
    assert.doesNotMatch(page,/components\/candidate\//);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),/design-review/);
});
test('review shell offers true fixed viewport widths and same-origin routes only',()=>{
  const source=read('components/design-review/review-shell.tsx');
  assert.match(source,/\[320, 390, 1440, 2560\]/);assert.match(source,/width=\{width\}/);assert.match(source,/maxWidth: 'none'/);
  assert.match(source,/transform: `scale\(\$\{scale\}\)`/);assert.match(source,/const source = '\/design-review\/' \+ group/);
  assert.doesNotMatch(source,/srcDoc|dangerouslySetInnerHTML|https?:\/\/|screenshot|sandbox=/);
  const layout=read('app/design-review/layout.tsx');assert.match(layout,/设计审阅 · 独立预览/);assert.match(read('app/design-review/review-label.css'),/position:fixed/);
});
test('all 341 native SVGs are exact source bytes, not aggregate page substitutes',()=>{
  const records=json('evidence/design-review/native-svg-checksums.json');
  assert.equal(records.length,341);assert.equal(new Set(records.map(row=>row.path)).size,341);
  for(const row of records)assert.equal(hash(file(row.path)),row.sha256,row.path);
});
test('every included and required asset matches overlay manifest and protected files are unchanged',()=>{
  const manifestPath=process.env.DESIGN_REVIEW_MANIFEST;
  if(!manifestPath)return;
  const manifest=JSON.parse(fs.readFileSync(manifestPath));
  assert.equal(manifest.newOnly,true);assert.equal(manifest.nativeSvgCount,341);
  for(const row of manifest.files){assert.equal(row.preimage,null);assert.equal(hash(path.join(overlay,row.path)),row.sha256);assert.equal(fs.existsSync(path.join(root,row.path)),false);}
  for(const row of [...manifest.reuseExisting,...manifest.protectedPreimages])assert.equal(hash(path.join(root,row.path)),row.sha256,row.path);
});


test('approved SWICY retained source resolves only phone/narrow without desktop changes',()=>{
 const html=renderer('unis',scene('unis'),'/design-review/unis?section=works&release=unis-swicy').render();
 assert.doesNotMatch(html,/data-native-assets-pending=|标题暂时无法显示/);
 const images=[...html.matchAll(/<img[^>]*data-retained-source-component="unis-swicy-phone"[^>]*>/g)].map(x=>x[0]);
 assert.equal(images.length,2);
 for(const img of images){assert.match(img,/data-artwork-provenance="retained-authored-source"/);assert.match(img,/width="166\.96799850463867"/);assert.match(img,/height="41\.310001373291016"/);assert.match(img,/left:0\.7560005187988281px;top:13\.392024993896484px/);assert.doesNotMatch(img,/data-native-node=/);}
 for(const id of ['659:19328','659:19329','659:19330','659:19331','659:19332'])assert.equal((html.match(new RegExp('data-native-node="'+id+'"','g'))||[]).length,2);
});
test('review component SVG is the exact approved retained-source artifact',()=>{
 assert.equal(hash(file('public/artist/unis/retained-source-20261019/swicy-phone.svg')),'8dd3b59808cb4f878a5f0a9c07cb03837e188e68cefe9a6dada42b6bb7c1c4bf');
 const retained=json('data/design-review/unis-retained-source-artwork.json');assert.equal(retained.sourceSha256,'3f2ff9aa6496f7ac994983afd89645265ff5a3dc2ed6cb565902a25a984d2215');
 for(const route of ['/design-review/unis','/design-review/unis?section=members','/design-review/unis?section=works','/design-review/unis?section=updates'])assert.doesNotMatch(renderer('unis',scene('unis'),route).render(),/data-retained-source-component=/);
});

test('all approved retained-source assets have exact hashes and separate provenance',()=>{
 const kep=json('components/design-review/kep1er-retained-source-art.json');
 assert.equal(Object.keys(kep.slots).length,77);assert.equal(kep.provenance,'retained-authored-source');assert.equal(kep.nativeExportClaim,false);assert.equal(kep.pixelMatchClaim,false);
 for(const item of Object.values(kep.slots))assert.equal(hash(file('public'+item.src)),item.assetSha256,item.src);
 const unis=json('data/design-review/unis-retained-source-artwork.json');assert.equal(Object.keys(unis.assets).length,1);
 assert.equal(hash(file('public/artist/unis/retained-source-20261019/swicy-phone.svg')),'8dd3b59808cb4f878a5f0a9c07cb03837e188e68cefe9a6dada42b6bb7c1c4bf');
});
test('Kep1er homes, roster, profile headings and timeline resolve only approved source nodes',()=>{
 const cases=[['/design-review/kep1er',['663:7902','663:7028','663:7069']],['/design-review/kep1er?section=members',['663:3544']],['/design-review/kep1er?section=members&member=recvxyICzHvPnL',['663:8667','663:4515']],['/design-review/kep1er?section=updates',['663:5268','663:5340','663:5350','663:5239']]];
 for(const [route,nodes]of cases){const html=renderer('kep1er',scene('kep1er'),route).render();for(const id of nodes){assert.ok(html.includes('data-source-art-node="'+id+'"'),id);assert.ok(!html.includes('data-native-unresolved="'+id+'"'),id);}}
});
test('full canonical timelines retain every event in earliest-first order with one logical axis',()=>{
 for(const group of ['unis','kep1er']){const data=scene(group),before=JSON.stringify(data),html=renderer(group,data,`/design-review/${group}?section=updates`).render();const expected=[...renderer(group,data).load('lib/idol/timeline/model.ts').selectChronologicalTimeline(json(`data/artist-timelines/${group}.json`).events)].map(e=>e.id);const ids=[...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,expected);assert.equal(JSON.stringify(data),before);assert.equal((html.match(/class="artist-timeline"/g)||[]).length,1);}
 const css=read('components/design-review/kep1er-figma-design.css'),helper=read('components/design-review/kep1er-native-art.tsx');
 assert.match(css,/\.kf-timeline-native-axis\{position:absolute;left:-\.5px;top:10px;width:1px;height:calc\(100% - 38px\)/);
 assert.match(helper,/new ResizeObserver\(update\)/);assert.match(helper,/sourceArt\[node\]/);assert.match(helper,/axis==='xy'\?box.height\/asset.height:1/);
 assert.doesNotMatch(helper,/slice\(|filter\(.*event|2549px|height:\s*2549/);
 const line=json('components/design-review/kep1er-retained-source-art.json').slots['663:5239'];assert.equal(line.width,1);assert.equal(line.height,2549);assert.equal(line.nativeBoundingBox.width,0);assert.deepEqual(line.nativePaintOffset,{x:-.5,y:0});
});

function secondaryArtHarness({removePrimitives=[],nativeOverrides={}}={}){
 const helper='components/design-review/kep1er-native-art.tsx',primitives=structuredClone(json('components/design-review/kep1er-retained-source-primitives.json'));
 for(const node of removePrimitives)delete primitives.slots[node];
 const native=structuredClone(json('components/design-review/kep1er-native-assets.json'));
 for(const [node,asset]of Object.entries(nativeOverrides)){native.slots[node]=native.files.length;native.files.push(asset);}
 const exports={};const code=ts.transpileModule(read(helper),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'\n})',{})(name=>name==='react'?{...React,useEffect:()=>{}}:name.endsWith('kep1er-retained-source-primitives.json')?{default:primitives}:name.endsWith('kep1er-native-assets.json')?{default:native}:name.endsWith('.json')?{default:json(path.join(path.dirname(helper),name))}:req(name),exports);
 return {api:exports,render:(name,props)=>renderToStaticMarkup(React.createElement(exports[name],props))};
}
test('secondary profile and both library variants resolve every remaining artwork and primitive',()=>{
 for(const route of ['/design-review/kep1er?section=members&member=recvxyICzHvPnL','/design-review/kep1er?section=works']){
  const data=scene('kep1er'),before=JSON.stringify(data),html=renderer('kep1er',data,route).render();
  assert.doesNotMatch(html,/data-native-unresolved=|标题暂时无法显示/);assert.equal(JSON.stringify(data),before);
 }
 const p=json('components/design-review/kep1er-retained-source-primitives.json');assert.equal(Object.keys(p.slots).length,131);assert.equal(p.nativeExportClaim,false);assert.equal(p.pixelMatchClaim,false);
});
test('profile primary completeness and visible dark-fill contrast are independent',()=>{
 const states=[{remove:['663:4552','663:4553'],complete:false,missing:true},{remove:['663:4553'],complete:false,missing:true},{remove:['663:4552'],complete:false,missing:false},{remove:[],complete:true,missing:false}];
 for(const state of states){const html=secondaryArtHarness({removePrimitives:state.remove}).render('NativeControl',{nodes:{desktop:'663:4551'}});assert.ok(html.includes('data-native-surface-complete="'+state.complete+'"'));assert.equal(html.includes('data-native-fill-missing="true"'),state.missing);}
});
test('library centered strokes normalize paint anchors exactly once and preserve layer order',()=>{
 const html=secondaryArtHarness().render('NativeControl',{nodes:{phone:'663:3842'}});
 const hit=html.indexOf('data-source-primitive-node="663:3843"'),border=html.indexOf('data-source-primitive-node="663:3844"'),arrow=html.indexOf('data-source-art-node="663:3846"');assert.ok(hit>=0&&border>hit&&arrow>border);
 assert.match(html,/data-source-primitive-node="663:3844"[^>]*style="[^"]*left:0;top:0/);
 assert.match(html,/left:-0\.5px;top:-0\.5px;width:129px;height:45px;box-sizing:border-box;border:1px solid #C7C9CE/);
 assert.match(html,/background-color:rgba\(255,255,255,0\.001\)/);assert.doesNotMatch(html,/<button|<a /);
});
test('ordinary source fills, search and divider preserve source dimensions without zero-height division',()=>{
 const h=secondaryArtHarness();
 assert.match(h.render('NativeArt',{node:'663:4618'}),/width:501px;height:51px;box-sizing:border-box;border:1px solid #111214/);
 assert.match(h.render('NativeArt',{node:'663:4620'}),/width:144px;height:44px;background-color:rgba\(17,18,20,1\)/);
 assert.match(h.render('NativeArt',{node:'663:4553'}),/background-color:#111214/);
 const line=h.render('ResponsiveStretch',{nodes:{desktop:'663:4550'}});assert.match(line,/top:0\.5px/);assert.match(line,/top:-0\.5px;width:605\.12px;height:1px/);assert.doesNotMatch(line,/NaN|Infinity/);
});
test('existing native exports retain precedence over approved ordinary source geometry',()=>{
 const html=secondaryArtHarness({nativeOverrides:{'663:4553':{src:'/native-test.svg',width:605.12,height:50,exportNodeId:'native-test',sourceFrameId:'663:4480'}}}).render('NativeArt',{node:'663:4553'});
 assert.match(html,/data-native-node="663:4553"/);assert.doesNotMatch(html,/data-source-primitive-node=/);
});
test('metadata-only secondary slots stay explicitly distinguished from collected native paint',()=>{
 const a=json('components/design-review/kep1er-retained-source-art.json'),p=json('components/design-review/kep1er-retained-source-primitives.json');
 assert.deepEqual(Object.entries(a.slots).filter(([,v])=>v.geometryProvenance==='retained_native_metadata_context').map(([k])=>k).sort(),['663:4041','663:4046','663:4048','663:4601']);
 assert.equal(Object.values(p.slots).filter(v=>v.geometryProvenance==='retained_native_metadata_and_context_only').length,6);
 for(const item of Object.values(a.slots)){const svg=read('public'+item.src);assert.doesNotMatch(svg,/<script|<foreignObject|<text(?:\s|>)|<image(?:\s|>)|(?:href|src)\s*=\s*["'](?:https?:|data:|\/\/)/i);}
});
