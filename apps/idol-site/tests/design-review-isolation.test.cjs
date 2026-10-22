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
