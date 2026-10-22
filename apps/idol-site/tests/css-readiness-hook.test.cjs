// Production TypeScript hooks executed with a deterministic hook/DOM model.
// This is not a real React DOM test; css-readiness-browser.mjs covers that layer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(file, requireFn, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(`(function(require,exports){${code}})`, { URL, URLSearchParams, crypto: require('node:crypto').webcrypto, ...globals })(requireFn, exports);
  return exports;
}
const navigation = { safeArtistReturn: value => typeof value === 'string' && value.startsWith('/') ? value : null };
const rotation = compile('lib/idol/home-rotation.ts', () => ({}));
const insightState = compile('lib/idol/personal-insights/view-state.ts', () => ({}));
const pure = compile('lib/idol/journey.ts', name => name.includes('personal-insights/view-state') ? insightState : name.includes('artist-navigation') ? navigation : rotation);
function entry(url, position, y, extra = {}) {
  return { ...pure.newEntry(url, position), scrollY: y, ...extra };
}
function harness({ entries = [entry('/?view=works', 0, 860)], index = 0, stylesheet = route => route.work ? `/test/${route.work}.css` : undefined, initiallyReady = false, contentReady = true } = {}) {
  let reloads=0;
  let current, dataReady = initiallyReady, dirty = false, blocked = false, allow = true, height = 4000, stateDirty = false, api;
  const frames = new Map(), timers = new Map(), listeners = new Map(), observers = [], links = [], writes = [], scrolls = [];
  let nextFrame = 0, nextTimer = 0;
  const on = (key, fn) => { if (!listeners.has(key)) listeners.set(key, new Set()); listeners.get(key).add(fn); };
  const off = (key, fn) => listeners.get(key)?.delete(fn);
  const fire = (key, event = {}) => { for (const fn of [...(listeners.get(key) ?? [])]) fn(event); };
  const stack = entries.map(value => ({ url: `https://readiness.test${pure.routeUrl(value.route)}`, state: { idolBrowse: structuredClone(value) } }));
  const location = { get href() { return stack[index].url; }, get pathname() { return new URL(this.href).pathname; }, get search() { return new URL(this.href).search; } };
  const history = {
    scrollRestoration: 'auto', get state() { return stack[index].state; }, get length() { return stack.length; },
    replaceState(state, _, url) { stack[index] = { state: structuredClone(state), url: new URL(url, location.href).href }; writes.push(structuredClone(state.idolBrowse)); },
    pushState(state, _, url) { const next = new URL(url, location.href).href; stack.splice(index + 1); stack.push({ state: structuredClone(state), url: next }); index++; },
    go(delta) { if (index + delta < 0 || index + delta >= stack.length) return; index += delta; fire('popstate'); },
  };
  class Element {
    constructor(id, top = 0) { this.dataset = { browseAnchor: id }; this.top = top; }
    getBoundingClientRect() { return { top: this.top - window.scrollY, bottom: this.top - window.scrollY + 40 }; }
    closest(selector) { if (selector.includes('data-browse-content')) return content; if (selector.includes('inert') || selector.includes('role=dialog')) return api?.displayReady ? null : content; return this; }
    focus() { document.activeElement = this; }
    matches() { return false; }
  }
  const content = new Element('content'), anchor = new Element('work-X', 878), memberTrigger = new Element('member-trigger', 0);
  memberTrigger.dataset.memberWorkTrigger = 'recW';
  const window = {
    innerHeight: 800, scrollY: 0, location: { assign() {},reload(){reloads++;} }, confirm: () => allow, alert() {},
    scrollTo({ top }) { this.scrollY = Math.min(top, Math.max(0, height - this.innerHeight)); scrolls.push(this.scrollY); },
    addEventListener: on, removeEventListener: off,
  };
  const fonts = { ready: { then(fn) { on('font-ready', fn); } }, addEventListener: (key, fn) => on('font:' + key, fn), removeEventListener: (key, fn) => off('font:' + key, fn) };
  const document = {
    body: {}, fonts, activeElement: null, referrer: '',
    head: { appendChild(link) { links.push(link); } },
    createElement(tag) { assert.equal(tag, 'link'); const events = new Map(); return { removed: false, addEventListener: (key, fn) => events.set(key, fn), removeEventListener: key => events.delete(key), remove() { this.removed = true; }, fire(key) { events.get(key)?.(); } }; },
    addEventListener: (key, fn) => on('document:' + key, fn), removeEventListener: (key, fn) => off('document:' + key, fn),
    querySelector(selector) { if (selector === 'main') return content; if (selector.includes('data-navigation-blocked')) return blocked ? content : null; if (selector.includes('data-dirty')) return dirty ? content : null; return null; },
    querySelectorAll(selector) { if (selector === '[data-member-work-trigger]') return [memberTrigger]; return selector.includes('data-browse-anchor') ? [anchor] : []; },
  };
  const React = {
    useRef(value) { const i = current.i++; return current.hooks[i] ?? (current.hooks[i] = { current: value }); },
    useState(value) { const i = current.i++, runner = current; if (!runner.hooks[i]) { const slot = { value: typeof value === 'function' ? value() : value }; slot.set = next => { const v = typeof next === 'function' ? next(slot.value) : next; if (!Object.is(slot.value, v)) { slot.value = v; stateDirty = true; } }; runner.hooks[i] = slot; } return [runner.hooks[i].value, runner.hooks[i].set]; },
    useCallback(fn, deps) { const i = current.i++, old = current.hooks[i]; if (!old || !deps.every((v, j) => Object.is(v, old.deps[j]))) current.hooks[i] = { deps, value: fn }; return current.hooks[i].value; },
  };
  function effect(fn, deps, layout) { const i = current.i++, runner = current, old = runner.hooks[i]; if (!old || !deps.every((v, j) => Object.is(v, old.deps[j]))) { const slot = { deps, cleanup: old?.cleanup }; runner.hooks[i] = slot; runner[layout ? 'layouts' : 'effects'].push(() => { slot.cleanup?.(); slot.cleanup = fn(); }); } }
  React.useEffect = (fn, deps) => effect(fn, deps, false);
  React.useLayoutEffect = (fn, deps) => effect(fn, deps, true);
  const globals = {
    window, history, location, document, Element, performance: { getEntriesByType: () => [{ type: 'back_forward' }] },
    ResizeObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() { this.active = true; } disconnect() { this.active = false; } },
    requestAnimationFrame: fn => { frames.set(++nextFrame, fn); return nextFrame; }, cancelAnimationFrame: id => frames.delete(id),
    addEventListener: on, removeEventListener: off,
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout: id => timers.delete(id),
  };
  const styles = compile('components/use-experience-styles.ts', () => React, globals);
  const focus = compile('components/use-member-work-focus.ts', () => React, globals);
  const journey = compile('components/use-browse-journey.ts', name => name === 'react' ? React : name.includes('personal-insights/view-state') ? insightState : name.includes('use-experience-styles') ? styles : name.includes('use-member-work-focus') ? focus : name.includes('artist-navigation') ? navigation : name.includes('home-rotation') ? rotation : pure, globals);
  const {resolveRestoreTarget}=require('./helpers/library-browser-dependency-loader.cjs').libraryBrowserDependency('@/components/library-browser');
  let mountedRequest;
  const runner = { hooks: [], i: 0, layouts: [], effects: [] };
  function render() { let turns = 0; do { stateDirty = false; current = runner; runner.i = 0; runner.layouts = []; runner.effects = []; api = journey.useBrowseJourney(dataReady, stylesheet,()=>contentReady); for (const fn of [...runner.layouts, ...runner.effects]) fn();
    // Model the real list's ready/mounted acknowledgement, not the readiness
    // decision itself. Keep deferred data, module and stylesheet gates intact.
    const target=api.libraryRestoreTarget;
    if(dataReady&&contentReady&&api.styleReady&&target&&target.requestKey!==mountedRequest){
      mountedRequest=target.requestKey;
      api.libraryRestoreMounted(resolveRestoreTarget(['X'],api.filters.pageSize??24,target));
    }
    assert.ok(++turns < 30, 'hook render should settle'); } while (stateDirty); return api; }
  function flush() { render(); for (let i = 0; i < 4; i++) { const jobs = [...frames.values()]; frames.clear(); jobs.forEach(fn => fn()); render(); } return api; }
  flush(); dataReady = true; flush();
  return {
    get api() { return render(); }, get reloads(){return reloads;}, history, location, links, stack, writes, scrolls, window, document, anchor, content, timers, flush,
    setHeight(value) { height = value; }, setContentReady(value) { contentReady=value;return flush(); }, setDataReady(value) { dataReady = value; return flush(); },
    setGuard(isDirty, isBlocked = false, approve = true) { dirty = isDirty; blocked = isBlocked; allow = approve; },
    load(i = links.length - 1) { links[i].fire('load'); return flush(); }, error(i = links.length - 1) { links[i].fire('error'); return flush(); },
    timeout() { for (const [key, fn] of [...timers]) { timers.delete(key); fn(); } return flush(); },
    resize(top = anchor.top) { anchor.top = top; for (const observer of observers) if (observer.active) observer.fn(); return flush(); },
    font(top = anchor.top) { anchor.top = top; fire('font:loadingdone'); return flush(); },
    userScroll(y, inContent = true) { fire('pointerdown', { target: inContent ? content : { closest: selector => selector.includes('data-style-status') ? content : null } }); window.scrollY = y; fire('scroll'); return flush(); },
    unmount() { for (const slot of runner.hooks) slot?.cleanup?.(); },
  };
}

test('production hook: cold candidate Back retains and restores saved list scroll 860', () => {
  const saved = entry('/?view=works', 0, 860, { anchor: { id: 'work-X', offset: 18 }, libraryFocus: 'work-X' });
  const h = harness({ entries: [saved] });
  assert.equal(h.window.scrollY, 860);
  h.api.navigate({ work: 'recA' }, '作品库'); h.flush();
  assert.equal(h.api.stylePhase, 'loading'); assert.equal(h.api.displayReady, false);
  h.setHeight(800); h.userScroll(0, false);
  h.setHeight(4000); h.api.back({ nav: 'works', work: null, member: null, video: 'mv' }); h.flush();
  assert.equal(h.api.route.work, null); assert.equal(h.window.scrollY, 860);
  assert.equal(h.history.state.idolBrowse.scrollY, 860); assert.equal(h.history.state.idolBrowse.anchor.offset, 18);
  assert.equal(h.document.activeElement, h.anchor);
});

test('production hook: Forward cold error and retry never replace saved candidate scroll 430', () => {
  const list = entry('/?view=works', 0, 860);
  const candidate = entry('/?view=works&work=recA', 1, 430, { from: { position: 0, label: '作品库' } });
  const h = harness({ entries: [list, candidate] });
  h.history.go(1); h.flush(); assert.equal(h.api.stylePhase, 'loading');
  h.setHeight(800); h.userScroll(0, false); assert.equal(h.history.state.idolBrowse.scrollY, 430);
  h.error(); assert.equal(h.api.stylePhase, 'error'); assert.equal(h.history.state.idolBrowse.scrollY, 430);
  h.api.retryStyles(); h.flush(); assert.equal(h.api.stylePhase, 'loading'); assert.equal(h.links.length, 2);
  h.load(0); assert.equal(h.api.stylePhase, 'loading', 'stale first load must not settle retry');
  h.setHeight(4000); h.load(1); assert.equal(h.api.stylePhase, 'ready'); assert.equal(h.window.scrollY, 430);
  assert.equal(h.history.state.idolBrowse.scrollY, 430);
});

test('production hook: A-B-A ignores late B completion and uses one A request', () => {
  const h = harness(); h.api.navigate({ work: 'recA' }, 'list'); h.flush();
  h.api.navigate({ work: 'recB' }, 'A'); h.flush(); h.history.go(-1); h.flush();
  assert.equal(h.api.route.work, 'recA'); assert.equal(h.links.length, 2);
  h.load(1); assert.equal(h.api.stylePhase, 'loading'); h.load(0); assert.equal(h.api.stylePhase, 'ready');
  h.history.go(1); h.flush(); assert.equal(h.api.stylePhase, 'ready'); assert.equal(h.links.length, 2);
});

test('production hook: delayed fonts and resize reapply immutable anchor until content takeover', () => {
  const h = harness({ entries: [entry('/?view=works', 0, 860, { anchor: { id: 'work-X', offset: 18 } })] });
  assert.equal(h.window.scrollY, 860); h.font(998); assert.equal(h.window.scrollY, 980);
  assert.equal(h.history.state.idolBrowse.scrollY, 860, 'restoration must not capture its own geometry');
  h.userScroll(0, false); h.resize(1118); assert.equal(h.window.scrollY, 1100, 'style status interactions must not cancel restoration');
  h.userScroll(1000); const writes = h.writes.length; h.font(1238); h.resize(1358);
  assert.equal(h.window.scrollY, 1000); assert.equal(h.history.state.idolBrowse.scrollY, 1000); assert.equal(h.writes.length, writes);
});

test('production hook: error/timeout retry retains dirty and pending-save guards', () => {
  const h = harness({ entries: [entry('/?view=works&work=recA', 0, 430)] });
  h.timeout(); assert.equal(h.api.stylePhase, 'error'); h.setGuard(true, false, false);
  assert.equal(h.api.navigate({ work: null }, 'back'), false); h.setGuard(false, true);
  assert.equal(h.api.navigate({ work: null }, 'back'), false);
  h.api.retryStyles(); h.flush(); h.load(); assert.equal(h.api.stylePhase, 'ready');
  assert.equal(h.api.navigate({ work: null }, 'back'), false); h.setGuard(false, false);
  assert.equal(h.api.navigate({ work: null }, 'back'), true); h.flush(); assert.equal(h.api.stylePhase, 'not-required');
});

test('production hook: unmount cancels late restoration callbacks and releases listeners', () => {
  const h = harness(); const before = h.scrolls.length; h.unmount(); h.font(1400); h.resize(1500);
  assert.equal(h.scrolls.length, before); assert.equal(h.history.scrollRestoration, 'auto');
});

test('production hook: saved entry restores when data is ready from first mount', () => {
  const h = harness({ initiallyReady: true });
  assert.equal(h.window.scrollY, 860);
});

// The module gate is independent of CSS visibility and prevents incomplete DOM
// from consuming saved geometry or focus before the lazy route has mounted.
test('production hook: deferred module waits before scroll/focus restoration and capture', () => {
 const saved=entry('/?view=works',0,860,{anchor:{id:'work-X',offset:18},libraryFocus:'work-X'});
 const h=harness({entries:[saved],contentReady:false});
 assert.equal(h.api.styleReady,true);assert.equal(h.api.displayReady,false);
 assert.equal(h.scrolls.length,0);assert.equal(h.document.activeElement,null);
 h.setHeight(800);h.userScroll(0,false);assert.equal(h.history.state.idolBrowse.scrollY,860);
 h.setHeight(4000);h.setContentReady(true);
 assert.equal(h.api.displayReady,true);assert.equal(h.window.scrollY,860);assert.equal(h.document.activeElement,h.anchor);
 assert.equal(h.history.state.idolBrowse.scrollY,860);
});
test('production hook: both module and CSS must settle; pending module does not weaken leave guards', () => {
 const h=harness({entries:[entry('/?view=works&work=recModule',0,430)],contentReady:false});
 h.load();assert.equal(h.api.styleReady,true);assert.equal(h.api.displayReady,false);assert.equal(h.scrolls.length,0);
 h.setGuard(true,false,false);assert.equal(h.api.navigate({work:null},'back'),false);
 h.setGuard(false,true);assert.equal(h.api.navigate({work:null},'back'),false);
 h.setContentReady(true);assert.equal(h.window.scrollY,430);
 assert.equal(h.api.navigate({work:null},'back'),false);
});

test('production hook: explicit reload preserves URL/history and honors dirty/uncertain guards',()=>{
 const saved=entry('/?view=groups',0,660,{groupIndexFocus:'group-recSaved'});const h=harness({entries:[saved],contentReady:false});
 const href=h.location.href,before=JSON.stringify(h.history.state);
 assert.equal(h.reloads,0);h.setGuard(true,false,false);assert.equal(h.api.reloadPage(),false);assert.equal(h.reloads,0);assert.equal(JSON.stringify(h.history.state),before);
 h.setGuard(false,true);assert.equal(h.api.reloadPage(),false);assert.equal(h.reloads,0);
 h.setGuard(true,false,true);assert.equal(h.api.reloadPage(),true);assert.equal(h.reloads,1);assert.equal(h.location.href,href);assert.equal(JSON.stringify(h.history.state),before);
});
