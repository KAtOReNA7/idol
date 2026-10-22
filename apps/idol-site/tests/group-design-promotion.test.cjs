/* eslint-disable @typescript-eslint/no-require-imports */
// Synthetic SSR and executable route/guard tests. No network, writes or browser QA.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const root = path.resolve(process.env.DESIGN_REVIEW_SOURCE_ROOT || path.resolve(__dirname, '..'));
const overlay = path.resolve(process.env.DESIGN_REVIEW_OVERLAY_ROOT || root);
const file = name => fs.existsSync(path.join(overlay, name)) ? path.join(overlay, name) : path.join(root, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const fixtureFile = file('tests/design-review-isolation.test.cjs');
const fixtureRequire = createRequire(path.join(root, 'tests/design-review-isolation.test.cjs'));
// Reuse the existing read-only fixture/loader rather than maintain another copy.
let fixture = read('tests/design-review-isolation.test.cjs').split("for(const group of ['unis','kep1er']) {")[0];
const needle = "  const component=()=>load(`components/design-review/${group}-design-review.tsx`).default;";
assert.equal(fixture.split(needle).length, 2, 'existing fixture entry-point seam');
fixture = fixture.replace(needle, `  const page=()=>load(\`app/artists/\${group}/page.tsx\`).default();
  const component=()=>state.productionPage ? page().type : load(\`components/design-review/\${group}-design-review.tsx\`).default;
  const props=()=>state.productionPage ? page().props : {content:json(\`data/\${group}-artist.json\`)};`);
fixture = fixture.replaceAll('{content:json(`data/${group}-artist.json`)}', 'props()');
// Do not replace the fallback object in the new props helper itself.
fixture = fixture.replace('const props=()=>state.productionPage ? page().props : props();', 'const props=()=>state.productionPage ? page().props : {content:json(`data/${group}-artist.json`)};');
const scope = {module:{exports:{}},require:fixtureRequire,__dirname:path.join(root,'tests'),process,console,URL,URLSearchParams,AbortController,DOMException,Event,setTimeout,clearTimeout,setInterval,clearInterval};
vm.runInNewContext(fixture+'\nmodule.exports={renderer,scene,links,nodes,label};', scope, {filename:fixtureFile});
const {renderer,scene,links,nodes,label} = scope.module.exports;
const official = (group,data,url=`/artists/${group}`,state={}) => renderer(group,data,url,{...state,productionPage:true});
const click = (capture,predicate) => {const node=nodes(capture.tree(),item=>item.type==='button'&&predicate(item))[0];assert.ok(node,'button is rendered');node.props.onClick();return capture.navigation.at(-1);};

for (const group of ['unis','kep1er']) {
  test(`${group}: actual official entry point renders the exact shared design for every primary section`,()=>{
    const data=scene(group),before=JSON.stringify(data);
    for (const suffix of ['', '?section=members', '?section=works', '?section=updates', '?section=records', '?section=members&member='+data.members[0].id]) {
      const production=official(group,data,`/artists/${group}${suffix}`).render();
      const preview=renderer(group,data,`/design-review/${group}${suffix}`).render();
      assert.equal(production,preview,suffix||'home');
      assert.match(production,new RegExp(`${group==='unis'?'unis':'kep1er'}-figma`));
      assert.doesNotMatch(production,/design-review-label|candidate-artist|未发布/);
    }
    assert.equal(JSON.stringify(data),before);
    const page=official(group,data).load(`app/artists/${group}/page.tsx`).default();
    assert.equal(page.props.basePath,`/artists/${group}`);
  });
  test(`${group}: official buttons stay canonical and preserve filters, reset, member and home destinations`,()=>{
    const data=scene(group),base=`/artists/${group}`;
    for (const [text,section] of [['成员','members'],[group==='unis'?'发行与影像':'作品与影像','works'],['时间轴','updates']]) {
      const capture=official(group,data,base,{captureTree:true});
      assert.equal(click(capture,node=>label(node)===(group==='unis'?(section==='works'?'发行与影像作品':text+text):text)),`${base}?section=${section}`);
    }
    const home=official(group,data,base+'?section=works&q=x&queue=unrated&format=stage',{captureTree:true});
    assert.equal(click(home,node=>node.props['aria-label']===(group==='unis'?'UNIS 首页':'Kep1er 首页')),base);
    const member=official(group,data,base+'?section=members',{captureTree:true});
    assert.equal(click(member,node=>node.props['data-artist-member-trigger']===data.members[0].id),`${base}?section=members&member=${data.members[0].id}`);
    const empty=official(group,data,base+'?section=works&format=stage&queue=unrated&q=no_match',{captureTree:true});
    assert.equal(click(empty,node=>label(node)==='清除搜索与筛选'),base+'?section=works');
    const filtered=official(group,data,base+'?section=works&queue=rewatch&q=hello',{captureTree:true});
    assert.equal(click(filtered,node=>label(node)==='舞台'),base+'?section=works&queue=rewatch&q=hello&format=stage');
    const searched=official(group,data,base+'?section=works&format=mv',{captureTree:true});
    const search=nodes(searched.tree(),node=>node.type==='input'&&node.props.type==='search')[0];
    search.props.onChange({target:{value:'中文 & +'}});
    assert.equal(searched.navigation.at(-1),base+'?section=works&q=%E4%B8%AD%E6%96%87+%26+%2B&format=mv');
  });
  test(`${group}: canonical playback/edit URLs retain private zero/null fields and never leak them into query parameters`,()=>{
    const data=scene(group),person=data.members[0],work=data.works[0];
    work.score=0;work.stageScore=9.5;work.watched='已观看';work.note='private work note';
    data.ratings=[{id:'recRatingFixture',memberIds:[person.id],workIds:[work.id],score:0,stylingScore:null,photo:null,note:'private member note',memory:'private memory'}];
    const before=JSON.stringify(data),safe=official(group,data).load('lib/idol/artist-navigation.ts').safeArtistReturn;
    for (const suffix of ['?section=works&format=mv','?section=works&format=stage','?section=members&member='+person.id]) {
      const html=official(group,data,`/artists/${group}${suffix}`).render();
      const targets=links(html).filter(url=>url.searchParams.has('work')||url.searchParams.has('member'));
      assert.ok(targets.length);
      for (const url of targets) {
        assert.equal(url.pathname,'/');
        assert.equal(url.searchParams.get('returnTo'),`/artists/${group}${suffix}`);
        assert.ok(safe(url.searchParams.get('returnTo')));
        assert.doesNotMatch(url.href,/score|note|memory|watched|private/);
        if (url.searchParams.has('work') && suffix.includes('format=')) assert.equal(url.searchParams.get('video'),suffix.includes('format=stage')?'stage':null);
      }
      if (suffix.includes('member=')) assert.match(html,/表现 0\.0 · 造型 未评分/);
    }
    assert.equal(JSON.stringify(data),before);
    for (const invalid of [`/design-review/${group}`,`https://evil.invalid/artists/${group}`,`/artists/${group}?score=9`,`/artists/${group}?section=works&section=members`,`/artists/${group}?q=${'x'.repeat(201)}`,`/artists/${group}#fragment`]) assert.equal(safe(invalid),null,invalid);
  });
  test(`${group}: actual production and preview pages retain their distinct timeline provider boundaries`,()=>{
    assert.match(read('app/artists/layout.tsx'),/<ArtistTimelineProduction>\{children\}<\/ArtistTimelineProduction>/);
    assert.match(read('app/design-review/layout.tsx'),/<DesignReviewTimelineProvider>\{children\}<\/DesignReviewTimelineProvider>/);
    assert.doesNotMatch(read(`app/artists/${group}/page.tsx`),/DesignReviewTimelineProvider|design-review\/layout|candidate/);
    const html=official(group,scene(group),`/artists/${group}?section=updates`).render();
    assert.equal((html.match(/class="artist-timeline"/g)||[]).length,1);
  });
}

test('Kep1er official current and former rosters, readers and editor returns preserve affiliation',()=>{
  const data=scene('kep1er'),base='/artists/kep1er';
  const html=official('kep1er',data,base+'?section=members&roster=history').render();
  assert.deepEqual([...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(match=>match[1]),Array.from(data.members.slice(6),member=>member.id));
  const capture=official('kep1er',data,base+'?section=members',{captureTree:true});
  assert.equal(click(capture,node=>label(node)==='曾经同行'),base+'?section=members&roster=history');
  const former=official('kep1er',data,base+'?section=members&roster=history',{captureTree:true});
  assert.equal(click(former,node=>node.props['data-artist-member-trigger']==='rec28ldbniBgam'),base+'?section=members&member=rec28ldbniBgam&roster=history');
  const reader=official('kep1er',data,former.navigation.at(-1)).render();
  assert.match(reader,/档案当前所属：MADEIN/);
  const edit=links(reader).find(url=>url.searchParams.get('member')==='rec28ldbniBgam');
  assert.equal(edit.searchParams.get('returnTo'),former.navigation.at(-1));
});

test('UNIS all ten editorial releases stay in their route family without expanding editor return allowlists',()=>{
  const data=scene('unis'),load=official('unis',data).load;
  const helper=load('lib/idol/design-review/unis-presentation.ts'),adapter=load('lib/idol/design-review/artist-route.ts'),safe=load('lib/idol/artist-navigation.ts').safeArtistReturn;
  const releases=load('lib/idol/unis-editorial.ts').unisEditorialReleases;
  assert.equal(releases.length,10);
  for (const base of ['/artists/unis','/design-review/unis']) {
    for (const release of releases) {
      const target=helper.unisRouteUrl(adapter.reviewArtistRoute(base+'?section=works'),release.releaseKey,base);
      assert.ok(target.startsWith(base+'?section=works&release='));
      const html=(base.startsWith('/artists')?official:renderer)('unis',data,target).render();
      assert.ok(html.includes(release.title.replaceAll('&','&amp;')));
      assert.equal(safe(target),null,'release keys remain outside the editor allowlist');
      assert.equal(adapter.productionReturn(target),'/artists/unis?section=works');
      for (const link of links(html).filter(url=>url.searchParams.has('work'))) assert.equal(link.searchParams.get('returnTo'),'/artists/unis?section=works');
    }
  }
  const capture=official('unis',data,'/artists/unis?section=works',{captureTree:true});
  assert.equal(click(capture,node=>node.props['data-release-key']==='unis-swicy'),'/artists/unis?section=works&release=unis-swicy');
  for (const suffix of ['?section=works&release=bogus','?section=works&release=unis-swicy&release=unis-swicy']) assert.match(official('unis',data,'/artists/unis'+suffix).render(),/未找到这张发行/);
});

test('shared path adapter preserves canonical timeline query grammar and never remaps another group',()=>{
  const load=official('unis',scene('unis')).load,adapter=load('lib/idol/design-review/artist-route.ts');
  const suffix='?section=updates&timelineType=release&timelineImportance=all&timelineOrder=earliest';
  for (const group of ['unis','kep1er']) {
    const canonical='/artists/'+group,preview='/design-review/'+group;
    const route=adapter.reviewArtistRoute(preview+suffix);
    assert.equal(adapter.artistExperienceRouteUrl(route,canonical),canonical+suffix);
    assert.equal(adapter.artistExperienceRouteUrl(route,preview),preview+suffix);
  }
  assert.equal(adapter.toProductionArtistUrl('/artists/aespa?section=works'),'/artists/aespa?section=works');
  assert.equal(adapter.toDesignReviewUrl('/artists/aespa?section=works'),'/artists/aespa?section=works');
});

function productionHarness(group) {
  const filename=path.join(root,'tests/timeline-production-guard.test.cjs');
  let source=read('tests/timeline-production-guard.test.cjs').split("test('production dirty cancel")[0];
  source=source.replace('const group=registry[0],location=',`const group=registry.find(row=>row.slug===${JSON.stringify(group)}),location=`);
  const scope={module:{exports:{}},require:createRequire(filename),process,console,URL,URLSearchParams};
  vm.runInNewContext(source+'\nmodule.exports={harness,request};',scope,{filename});
  return scope.module.exports;
}
for (const group of ['unis','kep1er']) test(`${group}: actual production timeline guards protect modal, uncertain-save, dirty and stale departures`,()=>{
  const {harness,request}=productionHarness(group),h=harness(),value=h.render();
  assert.equal(h.group.path,'/artists/'+group);
  let captures=0;const capture=()=>{captures++;return true;};
  h.gates.modal=true;value.navigate(request(h),capture);assert.equal(h.calls.length,0);
  h.gates.modal=false;h.gates.uncertain=true;value.navigate(request(h),capture);assert.equal(h.calls.at(-1)[0],'alert');
  h.gates.uncertain=false;h.gates.dirty=true;h.setConfirm(false);value.navigate(request(h),capture);assert.equal(captures,0);
  h.setConfirm(true);value.navigate(request(h),capture);assert.equal(captures,1);assert.equal(h.calls.at(-1)[0],'assign');
  const target=new URL(h.calls.at(-1)[1],'https://test.invalid');assert.equal(target.searchParams.get('returnTo'),h.group.path+'?section=updates');
  const count=h.calls.length;h.location.pathname='/artists/aespa';value.navigate(request(h),capture);assert.equal(h.calls.length,count);assert.equal(captures,1);
});

test('member biographies have one shared renderer and public release labels stay editorial',()=>{
  const unis=read('components/design-review/unis-design-review.tsx');
  assert.doesNotMatch(unis,/\{person\.profile\s*&&\s*<p>\{person\.profile\}<\/p>\}/);
  assert.match(unis,/<MemberCareerFacts member=\{person\}\/>/);
  const kep1er=read('components/design-review/kep1er-design-review.tsx');
  assert.match(kep1er,/查看全部发行 · \{kep1erEditorialReleases\.length\} 张/);
  assert.doesNotMatch(kep1er,/查看全部已核发行/);
});
