const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const esbuild = require('esbuild');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const list = '/artists/adya?section=updates';
const release = '/artists/adya?section=works&release=adya';
const sourceRow = '[data-artist-timeline] > li[id]';
const code = file => esbuild.transformSync(fs.readFileSync(file, 'utf8'), {loader:'ts', format:'cjs', target:'es2022'}).code;
const modules = {
  './native-timeline-link-focus': code('components/native-timeline-link-focus.ts'),
  '../lib/idol/timeline/history-state': code('lib/idol/timeline/history-state.ts'),
  scroll: code('components/use-artist-scroll.ts'),
};

function browserHistory(tabStorage = new Map()) {
  const tree = parse('<main id="artist-content"><ol data-artist-timeline><li id="first">'
    + '<a href="'+release+'">封面</a><a href="'+release+'">查看发行</a>'
    + '<a href="https://source.invalid">来源</a></li></ol><a href="'+release+'">目录卡</a></main>');
  const [cover, text, publisher, catalogue] = tree.querySelectorAll('a');
  const row = tree.querySelector('li');
  const main = tree.querySelector('main');
  row.matches = selector => row.closest(selector) === row;
  const frames = new Map(), listeners = new Map(), windowListeners = new Map(), refs = [];
  let seq = 0, nextRef = 0, navigationType = 'navigate', effects = [], cleanups = [];
  const body = {};
  const location = {pathname:'', search:'', href:''};
  const history = {state:null, replaceState(value) { this.state = value; }};
  const document = {
    body, activeElement:body, modal:null,
    getElementById: id => [row, main].find(node => node.id === id),
    querySelector: selector => selector.includes('aria-modal') ? document.modal : null,
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
  };
  const window = {scrollY:325, scrollTo({top}) { this.scrollY = top; }};
  for (const link of [cover, text, publisher, catalogue]) {
    link.isConnected = true;
    link.getClientRects = () => [{}];
    link.focus = options => {
      assert.equal(options.preventScroll, true);
      document.activeElement = link;
    };
  }
  const react = {
    useCallback: fn => fn, useEffect() {}, useLayoutEffect: fn => effects.push(fn),
    useRef(value) { const index = nextRef++; return refs[index] ??= {current:value}; },
  };
  const globals = {
    history, location, window, document, URL, crypto:require('node:crypto').webcrypto,
    sessionStorage:{getItem:key=>tabStorage.get(key) ?? null, setItem:(key,value)=>tabStorage.set(key,value), removeItem:key=>tabStorage.delete(key)},
    addEventListener(name, callback) {
      if (!windowListeners.has(name)) windowListeners.set(name,new Set());
      windowListeners.get(name).add(callback);
    },
    removeEventListener(name, callback) { windowListeners.get(name)?.delete(callback); },
    requestAnimationFrame: fn => { frames.set(++seq, fn); return seq; }, cancelAnimationFrame: id => frames.delete(id),
    performance:{getEntriesByType: () => [{type:navigationType}]}, ResizeObserver:class {observe() {} disconnect() {}},
  };
  const cache = new Map([
    ['react', react], ['./use-member-work-focus',{useMemberWorkFocus() {}}],
    ['./use-artist-roster-return',{useArtistRosterReturn() {}}],
  ]);
  function load(name) {
    if (!cache.has(name)) {
      const mod = {exports:{}};
      vm.runInNewContext('(function(module,exports,require){'+modules[name]+'})',globals)(mod,mod.exports,load);
      cache.set(name, mod.exports);
    }
    return cache.get(name);
  }
  function render(path, state = {}) {
    cleanups.forEach(clean => clean?.());
    const url = new URL(path, 'https://site.invalid');
    Object.assign(location,{href:url.href, pathname:url.pathname, search:url.search});
    history.state = state;
    nextRef = 0;
    effects = [];
    const navigate = load('scroll').useArtistScroll(true, path);
    cleanups = effects.map(effect => effect());
    return navigate;
  }
  function open(link, detail = 1) {
    const navigate = render(list, {kept:true});
    navigate({currentTarget:link, button:0, detail});
    const origin = history.state;
    const next = load('../lib/idol/timeline/history-state').newArtistHistoryState(origin, release);
    render(release, next);
    assert.equal(history.state.artistTimelineLink, undefined);
    assert.equal(history.state.kept, true);
    assert.equal(origin.artistScroll.y, 325);
    return origin;
  }
  function flush() { for (const [id, callback] of [...frames]) { if (frames.delete(id)) callback(); } }
  const focus = load('./native-timeline-link-focus');
  return {history, document, body, main, cover, text, catalogue, publisher, render, open, flush,
    connectSharedWork:focus.trackTimelineWorkDocument, recordLeaving:focus.recordLeavingTimelineDetail,
    emitWindow:name => windowListeners.get(name)?.forEach(fn => fn({type:name})),
    emit: name => listeners.get(name)?.forEach(fn => fn()), setNavigationType: value => { navigationType = value; }};
}

test('a mouse-opened cover and a keyboard-opened text link return to their own control', () => {
  for (const [action, clickDetail] of [['cover',1], ['text',0]]) {
    const h = browserHistory();
    const origin = h.open(h[action], clickDetail);
    assert.equal(origin.artistTimelineLink.index, action === 'cover' ? 0 : 1);
    h.document.activeElement = h.main;
    h.render(list, origin);
    h.flush();
    assert.equal(h.document.activeElement, h[action]);
  }
});

const detailBackCode = esbuild.transformSync(fs.readFileSync('components/native-timeline-detail-back.tsx', 'utf8'),
  {loader:'tsx', format:'cjs', jsx:'automatic', target:'es2022'}).code;
function detailBack(history, onNavigate, backHref) {
  const mod = {exports:{}};
  const load = name => name === 'react' ? {useSyncExternalStore:(_subscribe, read) => read()}
    : name.endsWith('.css') ? {} : require(name);
  vm.runInNewContext('(function(module,exports,require){'+detailBackCode+'})', {history})(mod,mod.exports,load);
  return mod.exports.NativeTimelineDetailBack({subscribe(){}, onNavigate, backHref,
    libraryHref:'/artists/adya?section=works', className:'idol-adya-back', label:'返回发行目录'});
}

test('the timeline detail button goes back to the clicked cover or text, with the full library alongside', () => {
  for (const control of ['cover','text']) {
    const h = browserHistory();
    h.history.length = 2;
    const origin = h.open(h[control], control === 'text' ? 0 : 1);
    let backs = 0, destination;
    h.history.back = () => { backs++; h.render(list, origin); h.flush(); };
    const page = detailBack(h.history, (_event,href) => {destination = href;}, '/artists/adya?section=works&format=release');
    assert.equal(page.type, 'nav');
    const [button, library] = page.props.children;
    assert.equal(button.type, 'button');
    assert.equal(button.props.type, 'button');
    assert.equal(button.props.children.at(-1).trim(), '返回时间轴事件');
    assert.equal(library.type, 'a');
    assert.equal(library.props.children, '进入作品库');
    library.props.onClick({});
    assert.equal(destination, '/artists/adya?section=works');
    assert.equal(backs, 0);
    button.props.onClick();
    assert.equal(backs, 1);
    assert.equal(h.document.activeElement, h[control]);
    assert.equal(h.history.state.artistScroll.y, 325);
  }
});

test('a direct, separately opened or catalogue detail keeps its filtered catalogue and has no event action', () => {
  const h = browserHistory();
  h.open(h.text);
  const marked = h.history.state;
  const {newArtistHistoryState} = require('./helpers/public-artist-loader.cjs')('lib/idol/timeline/history-state.ts');
  const next = newArtistHistoryState(marked, release);
  const backHref = '/artists/adya?section=works&q=Per&format=release';
  for (const history of [{length:3,state:next}, {length:1,state:marked}, {length:1,state:null}]) {
    let destination;
    const link = detailBack(history, (_event,href) => {destination = href;}, backHref);
    assert.equal(link.type, 'a');
    assert.equal(link.props.href, backHref);
    assert.equal(link.props.children.at(-1), '返回发行目录');
    link.props.onClick({});
    assert.equal(destination, backHref);
  }
});

test('user input, another focused control and an open dialog retain control of focus', () => {
  for (const cause of ['pointerdown','keydown','touchstart','wheel','focusin','other-control','modal']) {
    const h = browserHistory();
    const origin = h.open(h.text);
    h.render(list, origin);
    if (cause === 'modal') h.document.modal = {};
    else if (cause === 'other-control') h.document.activeElement = h.catalogue;
    else h.emit(cause);
    h.flush();
    assert.equal(h.document.activeElement, cause === 'other-control' ? h.catalogue : h.body, cause);
  }
});

test('old history, an unrelated destination, a fresh reload and an obsolete link stay unfocused', () => {
  const mark = {path:list, eventId:'first', href:release, index:1};
  for (const [from, state] of [
    [release,{artistScroll:{path:list,y:325}}],
    ['/artists/adya?section=members',{artistTimelineLink:mark}],
    [null,{artistTimelineLink:mark}],
    [release,{artistTimelineLink:{...mark,index:9}}],
    [release,{artistTimelineLink:{...mark,path:'/artists/witchx?section=updates'}}],
  ]) {
    const h = browserHistory();
    if (from) h.render(from);
    h.render(list, state);
    h.flush();
    assert.equal(h.document.activeElement, h.body);
  }
  const restored = browserHistory();
  restored.setNavigationType('back_forward');
  restored.render(list,{artistTimelineLink:mark});
  restored.flush();
  assert.equal(restored.document.activeElement, restored.body);
});

test('forward from an older copy of the same release cannot impersonate Back from the clicked entry', () => {
  const h = browserHistory();
  const originalDetail = {};
  h.render(release, originalDetail);
  const origin = h.open(h.text);
  const clickedDetail = h.history.state;
  assert.equal(clickedDetail.artistTimelineOrigin, origin.artistTimelineLink.entry);
  h.render(list, origin);
  h.flush();
  assert.equal(h.document.activeElement, h.text);
  h.render(release, originalDetail);
  h.document.activeElement = h.body;
  h.render(list, origin);
  h.flush();
  assert.equal(h.document.activeElement, h.body);
  h.render(release, clickedDetail);
  h.render(list, origin);
  h.flush();
  assert.equal(h.document.activeElement, h.text);
});

test('a new work document and a reloaded native detail identify their own history entry across Back', () => {
  const sharedHref = '/?view=works&work=recExample&returnTo=%2Fartists%2Fadya';
  for (const href of [release, sharedHref]) {
    const storage = new Map(), source = browserHistory(storage);
    source.text.setAttribute('href',href);
    const open = source.render(list); open({currentTarget:source.text});
    const origin = source.history.state;
    const detail = browserHistory(storage);
    detail.render(href, href === release ? {artistTimelineOrigin:origin.artistTimelineLink.entry} : {});
    if (href === release) detail.recordLeaving();
    else detail.connectSharedWork();
    assert.equal(detail.history.state.artistTimelineOrigin, origin.artistTimelineLink.entry);
    detail.emitWindow('pagehide');
    const back = browserHistory(storage);
    back.text.setAttribute('href',href);
    back.setNavigationType('back_forward'); back.render(list,origin); back.flush();
    assert.equal(back.document.activeElement,back.text);
    const forward = browserHistory(storage);
    forward.text.setAttribute('href',href);
    forward.setNavigationType('back_forward'); forward.render(list,origin); forward.flush();
    assert.equal(forward.document.activeElement,forward.body);
  }
});

test('two independent tabs with identical URLs keep separate navigation and focus', () => {
  const a = browserHistory(), b = browserHistory(), first = a.open(a.cover), second = b.open(b.text);
  assert.notEqual(first.artistTimelineLink.entry, second.artistTimelineLink.entry);
  a.render(list,first); a.flush();
  assert.equal(a.document.activeElement, a.cover);
  assert.equal(b.document.activeElement, b.body);
  b.render(list,second); b.flush();
  assert.equal(b.document.activeElement, b.text);
  assert.equal(a.document.activeElement, a.cover);
});

test('leaving via another control clears stale event focus from that history entry only', () => {
  for (const action of ['catalogue','publisher']) {
    const h = browserHistory(), origin = h.open(h.text);
    const navigate = h.render(list, origin);
    navigate({currentTarget:h[action]});
    assert.equal(h.history.state.artistTimelineLink, undefined);
    assert.equal(h.history.state.artistScroll.y, 325);
    assert.equal(h.history.state.kept, true);
  }
});

test('native timelines expose the event and exact detail link in all nine real routes', async () => {
  const workEvents = new Map([
    ['geenius-ily-interactive', 'recvxIZRWKKCeh'],
    ['tracer-performance-365', 'rec28ldfRTrPq2'],
    ['spia-debut', 'rec28ldfRTrPua'],
  ]);
  const observedWorkEvents = new Set();
  for (const slug of ['adya','witchx','geenius','oddyouth','tracer','spia','candyshop','youngposse','bewave']) {
    const page = parse(await renderArtist(registry.find(group => group.slug === slug), {section:'updates'}));
    const events = page.querySelectorAll(sourceRow);
    assert.ok(events.length, slug);
    const links = events.flatMap(event => event.querySelectorAll('a[href]')).filter(link => link.getAttribute('href').startsWith('/'));
    assert.ok(links.length, slug);
    for (const link of links) {
      const eventId = link.closest(sourceRow).id;
      const href = link.getAttribute('href');
      assert.ok(eventId, slug);
      if (href.startsWith('/?')) {
        const correct = new URLSearchParams({view:'works', work:workEvents.get(eventId), returnTo:'/artists/'+slug+'?section=updates'});
        assert.ok(workEvents.has(eventId), eventId);
        assert.equal(href, '/?'+correct, eventId);
        observedWorkEvents.add(eventId);
      } else {
        assert.ok(href.startsWith('/artists/'+slug+'?'), slug);
      }
    }
  }
  assert.deepEqual(observedWorkEvents, new Set(workEvents.keys()));
});
