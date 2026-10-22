/* eslint-disable @typescript-eslint/no-require-imports */
// Real canonical lazy-loader and shared render/identity code, with deterministic provider hooks.
// No browser geometry, hosted auth, or user-record mutations are claimed by these tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const root = path.resolve(process.env.DESIGN_REVIEW_SOURCE_ROOT || path.resolve(__dirname, '..'));
const overlay = path.resolve(process.env.DESIGN_REVIEW_OVERLAY_ROOT || root);
const req = createRequire(path.join(root, 'package.json'));
const ts = req('typescript'), React = req('react');
const {renderToStaticMarkup} = req('react-dom/server');
const file = relative => fs.existsSync(path.join(overlay, relative)) ? path.join(overlay, relative) : path.join(root, relative);
const read = relative => fs.readFileSync(file(relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const plain = value => JSON.parse(JSON.stringify(value));
const registry = json('data/artist-timeline-registry.json');
function loader({react = React, globals = {}, overrides = {}} = {}) {
  const cache = new Map();
  function load(relative) {
    relative = path.normalize(relative);
    if (relative.endsWith('.css')) return {};
    if (cache.has(relative)) return cache.get(relative);
    if (relative.endsWith('.json')) {const value = {default:json(relative)}; cache.set(relative,value); return value;}
    const exports = {}; cache.set(relative, exports);
    const code = ts.transpileModule(read(relative), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext('(function(require,exports){' + code + '\n})', {URL,URLSearchParams,Date,AbortController,DOMException,Event,setTimeout,clearTimeout,setInterval,clearInterval,...globals}, {filename:relative})(name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === 'react') return react;
      if (name.startsWith('@/') || name.startsWith('.')) {
        const target = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(relative), name);
        const match = ['', '.ts', '.tsx', '.mjs'].map(ext => target + ext).find(candidate => fs.existsSync(file(candidate)) && fs.statSync(file(candidate)).isFile());
        assert.ok(match, `Missing ${name} from ${relative}`);
        return load(match);
      }
      return req(name);
    }, exports);
    return exports;
  }
  return load;
}
function harness(slug = 'unis') {
  const location = {pathname:`/design-review/${slug}`,search:'?section=updates',reload:() => calls.push('reload')};
  const states = [], effects = [], calls = [], imports = [], timers = new Map();
  const gates = {dirty:false,uncertain:false,modal:false};
  let cursor = 0, timerId = 0, confirm = true;
  const realLoad = loader()('lib/idol/timeline/production.ts').loadArtistTimeline;
  let loadTimeline = realLoad;
  const mockReact = {...React,useState(initial) {const index = cursor++; if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial; return [states[index],next => states[index] = typeof next === 'function' ? next(states[index]) : next];},useEffect:fn => effects.push(fn),useMemo:fn => fn(),useCallback:fn => fn};
  const globals = {location,window:{location,alert:() => calls.push('alert'),confirm:() => {calls.push('confirm'); return confirm;}},document:{querySelector:selector => (selector.includes('data-navigation-blocked') && gates.uncertain) || (selector.includes('data-dirty') && gates.dirty) || (selector.includes('aria-modal') && gates.modal) ? {} : null},setTimeout(fn,ms) {const id = ++timerId; timers.set(id,{fn,ms});return id;},clearTimeout:id => timers.delete(id)};
  const component = loader({react:mockReact,globals,overrides:{'next/navigation':{usePathname:() => location.pathname},'@/lib/idol/timeline/production':{loadArtistTimeline:(slug) => {imports.push(slug);return loadTimeline(slug);}}}})('components/design-review/timeline-provider.tsx').DesignReviewTimelineProvider;
  return {location,effects,calls,imports,timers,gates,setConfirm:value => confirm = value,setLoad:fn => loadTimeline = fn,render() {cursor = 0;effects.length = 0;return component({children:null}).props.value;}};
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function catalog(slug) {
  const fixture = json('tests/fixtures/candidate37.synthetic.json');
  const group = registry.find(row => row.slug === slug), seed = fixture.works.find(row => row.groupIds.includes(group.groupId));
  const works = json('data/stages/inventory.json').works.filter(row => row.groupIds.includes(group.groupId)).map(row => ({...seed,id:row.recordId,name:row.name,song:row.song,groupIds:row.groupIds,url:row.mv.url,videoType:row.mv.videoType,releaseDate:row.mv.releaseDate || '',stage:null,score:0,stageScore:null,watched:'已观看',note:'private fixture remains unchanged',stageSupplement:null}));
  return {...fixture,mode:'live',groups:fixture.groups.filter(row => row.id === group.groupId),members:fixture.members.filter(row => row.groupIds.includes(group.groupId)),works,ratings:[]};
}
function render(slug, options, data = catalog(slug), route = `?section=updates`) {
  const load = loader({overrides:{'@/components/use-artist-scroll':{useArtistScroll:() => () => {}}}});
  const Host = load('components/artist-timeline-host.tsx').ArtistTimelineHostProvider;
  const Page = load(`components/design-review/${slug}-design-review.tsx`).default;
  return {load,html:renderToStaticMarkup(React.createElement(Host,{value:{...options,catalog:data,loading:false,serverRoute:`/design-review/${slug}${route}`}},React.createElement(Page,{content:json(`data/${slug}-artist.json`)})))};
}

test('both review pages receive the provider from their actual shared layout', () => {
  const layout = loader({overrides:{'@/components/design-review/timeline-provider':{DesignReviewTimelineProvider:'review-timeline-provider'}}})('app/design-review/layout.tsx').default;
  const tree = layout({children:React.createElement('p',null,'review child')});
  assert.equal(tree.props.children[0].type,'review-timeline-provider');
  assert.equal(tree.props.children[0].props.children.props.children,'review child');
  for (const slug of ['unis','kep1er']) assert.match(read(`app/design-review/${slug}/page.tsx`),new RegExp(`components/design-review/${slug}-design-review`));
});
for (const slug of ['unis','kep1er']) {
  test(`${slug}: initial pending state cannot claim empty; real lazy loader renders exact canonical ready events`, async () => {
    const h = harness(slug), initial = h.render();
    assert.equal(initial.input,null); assert.equal(initial.timelineLoading,true); assert.equal(initial.navigate,undefined);
    assert.match(render(slug,initial).html,/正在读取时间轴/);
    assert.doesNotMatch(render(slug,initial).html,/事件正在整理/);
    h.effects[0](); await settle();
    const value = h.render(), canonical = json(`data/artist-timelines/${slug}.json`), data = catalog(slug), before = JSON.stringify(data);
    assert.deepEqual(h.imports,[slug]); assert.deepEqual(plain(value.input),canonical);
    assert.equal(value.timelineLoading,false); assert.equal(value.timelineError,'');
    const {load,html} = render(slug,value,data);
    const expected = load('lib/idol/timeline/model.ts').selectChronologicalTimeline(canonical.events).map(row => row.id);
    assert.deepEqual([...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(match => match[1]),plain(expected));
    assert.ok(expected.length > 0); assert.doesNotMatch(html,/事件正在整理/);
    assert.equal(JSON.stringify(data),before);
    // Review has no sanctioned timeline return capture; no misleading inert buttons are added.
    assert.doesNotMatch(html,/data-timeline-event-trigger=/);
    assert.equal(load('lib/idol/artist-navigation.ts').safeArtistReturn(`/design-review/${slug}?section=updates`),null);
    assert.equal(load('lib/idol/timeline/return-state.ts').timelineReturnFilters(`/design-review/${slug}?section=updates`),null);
  });
  test(`${slug}: incomplete identities preserve canonical events without fabricating target authority`, async () => {
    const h = harness(slug);h.render();h.effects[0]();await settle();
    const data = {...catalog(slug),members:[],works:[]}, {load,html} = render(slug,h.render(),data);
    const input = json(`data/artist-timelines/${slug}.json`);
    assert.equal((html.match(/data-timeline-event-id=/g) || []).length,load('lib/idol/timeline/model.ts').selectChronologicalTimeline(input.events).length);
    assert.doesNotMatch(html,/data-timeline-event-trigger=/);
  });
}
test('unknown review route never loads another group', () => {
  const h = harness('not-a-group'); const v = h.render();h.effects[0]();
  assert.deepEqual(h.imports,[]);assert.equal(v.input,null);assert.equal(v.timelineLoading,false);
});
test('deadline can re-observe the same import and stale completion cannot overwrite a new route', async () => {
  const h = harness();let resolve;
  const pending = new Promise(done => resolve = done);h.setLoad(() => pending);
  h.render();const cleanup = h.effects[0]();assert.equal([...h.timers.values()][0].ms,15000);
  [...h.timers.values()][0].fn();let v = h.render();assert.equal(v.timelineRetryLabel,'继续等待');assert.equal(v.input,null);
  v.onTimelineRetry();cleanup();h.render();const cleanupAgain = h.effects[0]();
  resolve({input:{marker:'same pending result'}});await settle();assert.equal(h.render().input.marker,'same pending result');assert.deepEqual(h.calls,[]);
  cleanupAgain();
  const stale = harness();let finish;stale.setLoad(() => new Promise(done => finish = done));stale.render();const stop = stale.effects[0]();stop();stale.location.pathname = '/design-review/kep1er';stale.render();finish({input:{marker:'old group'}});await settle();
  assert.equal(stale.render().input,null);assert.equal(stale.render().timelineLoading,true);
});
test('module failure reports recovery and reload honors live modal, uncertain-save, dirty, and stale-route guards', async () => {
  const h = harness();h.setLoad(() => Promise.reject(Error('module unavailable')));h.render();h.effects[0]();await settle();
  const v = h.render();assert.equal(v.timelineRetryLabel,'重新加载页面');assert.deepEqual(h.calls,[]);assert.match(render('unis',v).html,/时间轴模块未能加载/);
  h.gates.modal = true;v.onTimelineRetry();assert.deepEqual(h.calls,[]);h.gates.modal = false;
  h.gates.uncertain = true;v.onTimelineRetry();assert.deepEqual(h.calls,['alert']);h.gates.uncertain = false;
  h.gates.dirty = true;h.setConfirm(false);v.onTimelineRetry();assert.deepEqual(h.calls,['alert','confirm']);
  h.setConfirm(true);v.onTimelineRetry();assert.deepEqual(h.calls.slice(-2),['confirm','reload']);
  h.location.pathname = '/design-review/kep1er';const before = [...h.calls];v.onTimelineRetry();assert.deepEqual(h.calls,before);
});
test('GimmeSummer uses only the existing exact work/event/release cover relationship', () => {
  const data = catalog('unis'), before = JSON.stringify(data), {load,html} = render('unis',{},data,'?section=works');
  const helpers = load('lib/idol/design-review/unis-presentation.ts');
  const work = data.works.find(row => row.id === 'recvxIZLpETQNx');assert.ok(work);
  const release = helpers.unisWorkRelease(work);assert.equal(release.releaseKey,'unis:gimmesummer-jp-prerelease');assert.equal(release.canonicalEventId,'e-unis-gimmesummer-jp-prerelease');assert.equal(release.cover,null);
  const cover = helpers.unisReleaseCover(release);assert.equal(cover.role,'release-cover');assert.equal(cover.memberId,null);assert.equal(cover.canonicalEventId,release.canonicalEventId);assert.ok(release.workIds.includes(work.id));
  const article = html.match(/<article class="uf-work-row" data-work-id="recvxIZLpETQNx">[\s\S]*?<\/article>/)?.[0];assert.ok(article);assert.ok(article.includes(cover.image));assert.match(article,/· 发行封面/);assert.doesNotMatch(article,/发行封面暂缺/);
  assert.equal(helpers.unisWorkRelease({...work,groupIds:['recOther']}),null);
  assert.equal(helpers.unisWorkRelease({...work,id:'recUnknown',song:work.song}),null);
  assert.equal(helpers.unisReleaseCover({...release,canonicalEventId:'e-wrong'}),null);
  assert.equal(JSON.stringify(data),before);
});
