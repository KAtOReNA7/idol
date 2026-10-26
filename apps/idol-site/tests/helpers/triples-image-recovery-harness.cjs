/* Executes the real tripleS view, image generations, provider and recovery
 * controls with deterministic hook/history/dialog ports. Not React DOM or a
 * browser: native inert/focus behavior below is only an explicit test model. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const esbuild = require('esbuild');
const {syntheticCatalog} = require('./triples-review-loader.cjs');
const root = path.resolve(__dirname, '../..');
let compiled;
function source() {
  if (!compiled) compiled = esbuild.buildSync({
    entryPoints: [path.join(root, 'components/design-review/triples-visual-review.tsx')],
    absWorkingDir: root, bundle: true, write: false, platform: 'node', format: 'cjs',
    jsx: 'automatic', external: ['react', 'react/*'], loader: {'.css': 'empty'}, logLevel: 'silent',
  }).outputFiles[0].text;
  return compiled;
}
const equal = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
const walk = node => Array.isArray(node) ? node.flatMap(walk) : !node || typeof node !== 'object' ? [] : [node, ...walk(node.props?.children)];
function harness({initial = '/design-review/triples-v2?section=works&format=mv'} = {}) {
  let current, contexts = new Map(), dirty = false, now = 1000, uid = 0, nextTimer = 0;
  let layouts = [], effects = [], microtasks = [], tree, position = 0;
  const fibers = new Map(), nodes = new Map(), timers = new Map(), frames = new Map(), listeners = new Map();
  const stack = [{url: initial, state: {}}], modalStack = [], requests = [], assigns = [], focusAttempts = [];
  const catalog = syntheticCatalog(), timeline = JSON.parse(fs.readFileSync(path.join(root, 'data/artist-timelines/triples.json')));
  function matches(node, selector) {
    if (selector === 'main' || selector === '[role="main"]') return node.tagName === 'MAIN';
    if (selector === 'dialog') return node.tagName === 'DIALOG';
    if (selector === 'dialog[open]') return node.tagName === 'DIALOG' && node.open;
    if (selector === '[aria-modal="true"]') return node.props['aria-modal'] === 'true';
    if (selector === '.triples-visual-review a[href]') return node.tagName === 'A' && !!node.props.href;
    return ['a', 'button', 'summary', 'label'].includes(selector) && node.tagName.toLowerCase() === selector;
  }
  const document = {
    activeElement: null, body: {style: {overflow: ''}},
    querySelectorAll(selector) {
      return [...nodes.values()].map(entry => entry.dom).filter(node => selector.split(',').some(part => matches(node, part.trim())));
    },
    querySelector(selector) {return this.querySelectorAll(selector)[0] ?? null;},
    getElementById(id) {return [...nodes.values()].find(entry => entry.dom.props.id === id)?.dom ?? null;},
  };
  const window = {
    scrollY: 320, confirm: () => true, alert() {}, scrollTo() {},
    addEventListener(type, callback) {if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback);},
    removeEventListener(type, callback) {listeners.get(type)?.delete(callback);},
    dispatchEvent(event) {for (const callback of [...listeners.get(event.type) ?? []]) callback(event);},
  };
  document.addEventListener = (type, callback) => window.addEventListener('document:' + type, callback);
  document.removeEventListener = (type, callback) => window.removeEventListener('document:' + type, callback);
  const location = {
    get pathname() {return new URL(stack[position].url, 'https://site.invalid').pathname;},
    get search() {return new URL(stack[position].url, 'https://site.invalid').search;},
    get hash() {return new URL(stack[position].url, 'https://site.invalid').hash;},
    get href() {return stack[position].url;},
    assign(url) {assigns.push(url);}, reload() {assigns.push('reload');},
  };
  const history = {
    get state() {return stack[position].state;},
    replaceState(state, _, url) {stack[position] = {url, state};},
    pushState(state, _, url) {stack.splice(position + 1); stack.push({url, state}); position++;},
    back() {if (position) {position--; window.dispatchEvent({type: 'popstate'});}},
    forward() {if (position < stack.length - 1) {position++; window.dispatchEvent({type: 'popstate'});}},
  };
  const slot = initialize => {const index = current.cursor++; return current.hooks[index] ?? (current.hooks[index] = initialize());};
  const effect = (callback, dependencies, queue) => {
    const state = slot(() => ({}));
    if (!equal(state.dependencies, dependencies)) {state.dependencies = dependencies; queue.push(() => {state.cleanup?.(); state.cleanup = callback();});}
  };
  const React = {
    createElement(type, props, ...children) {return {type, key: props?.key, props: {...props, ...(children.length ? {children: children.length === 1 ? children[0] : children} : {})}};},
    useState(initialValue) {
      const state = slot(() => ({value: typeof initialValue === 'function' ? initialValue() : initialValue}));
      return [state.value, value => {const next = typeof value === 'function' ? value(state.value) : value; if (!Object.is(next, state.value)) {state.value = next; dirty = true;}}];
    },
    useRef: value => slot(() => ({current: value})),
    useMemo(callback, dependencies) {
      const state = slot(() => ({}));
      if (!equal(state.dependencies, dependencies)) {state.dependencies = dependencies; state.value = callback();}
      return state.value;
    },
    useCallback(callback, dependencies) {return React.useMemo(() => callback, dependencies);},
    useId: () => slot(() => ({id: `triples-image-test-${++uid}`})).id,
    useEffect: (callback, dependencies) => effect(callback, dependencies, effects),
    useLayoutEffect: (callback, dependencies) => effect(callback, dependencies, layouts),
    useSyncExternalStore(subscribe, getSnapshot) {React.useEffect(() => subscribe(() => {dirty = true;}), [subscribe]); return getSnapshot();},
    createContext(value) {const context = {value}; context.Provider = {context}; return context;},
    useContext: context => contexts.has(context) ? contexts.get(context) : context.value,
    isValidElement: node => !!node && typeof node === 'object' && 'type' in node,
    cloneElement: (node, extra) => ({...node, props: {...node.props, ...extra}}),
  };
  const jsx = (type, props, key) => ({type, props: props ?? {}, key});
  const modulePort = {exports: {}};
  class Clock extends Date {static now() {return now;}}
  vm.runInNewContext('(function(require,module,exports){' + source() + '})', {
    Date: Clock, URL, URLSearchParams, AbortController, DOMException, window, document, history, location,
    Event: class Event {constructor(type) {this.type = type;}},
    ResizeObserver: class ResizeObserver {observe() {} disconnect() {}},
    addEventListener: window.addEventListener.bind(window), removeEventListener: window.removeEventListener.bind(window),
    queueMicrotask: callback => microtasks.push(callback),
    setTimeout: (callback, ms) => {const id = ++nextTimer; timers.set(id, {callback, due: now + ms}); return id;},
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => {const id = ++nextTimer; frames.set(id, callback); return id;},
    cancelAnimationFrame: id => frames.delete(id),
    fetch: (...args) => {requests.push(args); throw Error('No API reads or writes are expected with catalog/timeline overrides');},
  })(name => name === 'react' ? React : name === 'react/jsx-runtime' ? {jsx, jsxs: jsx, Fragment: 'fragment'} : require(name), modulePort, modulePort.exports);
  function visit(node, key = 'root', parent = null) {
    if (Array.isArray(node)) return node.map((child, index) => visit(child, key + '.' + (child?.key ?? index), parent));
    if (!node || typeof node !== 'object') return node;
    const id = key + ':' + String(node.key ?? '');
    if (node.type?.context) {
      const previous = contexts; contexts = new Map(contexts); contexts.set(node.type.context, node.props.value);
      const result = visit(node.props.children, id + '.provider', parent); contexts = previous; return result;
    }
    if (typeof node.type === 'function') {
      let fiber = fibers.get(id);
      if (!fiber || fiber.type !== node.type) {fiber?.hooks.forEach(hook => hook.cleanup?.()); fiber = {type: node.type, hooks: [], cursor: 0}; fibers.set(id, fiber);}
      fiber.seen = true; fiber.cursor = 0;
      const previous = current; current = fiber; const rendered = node.type(node.props); current = previous;
      return visit(rendered, id + '.render', parent);
    }
    if (node.type === 'fragment') return visit(node.props.children, id + '.fragment', parent);
    let saved = nodes.get(id);
    if (!saved || saved.type !== node.type) {
      const attributes = new Map();
      const dom = {
        ownerDocument: document, isConnected: true, tagName: String(node.type).toUpperCase(), complete: false, naturalWidth: 0, open: false,
        getBoundingClientRect: () => ({width: 400, height: 600, left: 0, top: 0, right: 400, bottom: 600}),
        hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
        getAttribute(name) {return this.props[name] ?? null;}, scrollIntoView() {},
        contains(target) {for (let ancestor = target; ancestor; ancestor = ancestor.parent) if (ancestor === this) return true; return false;},
        closest(selector) {for (let ancestor = this; ancestor; ancestor = ancestor.parent) if (selector.split(',').some(part => matches(ancestor, part.trim()))) return ancestor; return null;},
        focus() {
          const top = modalStack.at(-1);
          focusAttempts.push({node: this, accepted: this.isConnected && (!top || top.contains(this))});
          if (this.isConnected && (!top || top.contains(this))) document.activeElement = this;
        },
        showModal() {this.open = true; modalStack.push(this); this.focus();},
        close() {this.open = false; const index = modalStack.indexOf(this); if (index >= 0) modalStack.splice(index, 1);},
      };
      saved = {type: node.type, dom}; nodes.set(id, saved);
    }
    saved.seen = true; saved.dom.parent = parent; saved.dom.isConnected = true; saved.dom.props = node.props;
    const ref = node.props.ref;
    if (ref) {saved.ref = ref; if (typeof ref === 'function') ref(saved.dom); else ref.current = saved.dom;}
    const props = {...node.props};
    for (const event of ['onError', 'onLoad', 'onClick', 'onCancel', 'onPointerDown', 'onKeyDown']) if (props[event]) {
      const callback = props[event];
      props[event] = (supplied = {}) => {
        if (event === 'onClick' && saved.dom.isConnected) saved.dom.focus();
        return callback({currentTarget: saved.dom, target: saved.dom, button: 0, preventDefault() {}, stopPropagation() {}, ...supplied});
      };
    }
    return {...node, dom: saved.dom, props: {...props, children: visit(node.props.children, id + '.children', saved.dom)}};
  }
  function render() {
    let passes = 0;
    do {
      dirty = false; layouts = []; effects = [];
      for (const fiber of fibers.values()) fiber.seen = false;
      for (const node of nodes.values()) node.seen = false;
      tree = visit(jsx(modulePort.exports.default, {catalogOverride: catalog, timelineOverride: timeline, serverRoute: initial}));
      for (const [key, fiber] of fibers) if (!fiber.seen) {fiber.hooks.forEach(hook => hook.cleanup?.()); fibers.delete(key);}
      for (const [key, node] of nodes) if (!node.seen) {node.dom.isConnected = false; if (node.ref?.current === node.dom) node.ref.current = null; nodes.delete(key);}
      for (const callback of [...layouts, ...effects]) callback();
      while (microtasks.length) microtasks.shift()();
      for (const [id, callback] of [...frames]) {frames.delete(id); callback();}
      if (++passes > 30) throw Error('tripleS test hook loop');
    } while (dirty);
    return tree;
  }
  return {
    render, catalog, timeline, document, history, location, modalStack, requests, assigns, focusAttempts,
    get tree() {return tree;}, get listenerCount() {return [...listeners.values()].reduce((sum, set) => sum + set.size, 0);},
    all: predicate => walk(tree).filter(predicate),
    find: predicate => walk(tree).find(predicate),
    advance(ms) {now += ms; for (const [id, timer] of timers) if (timer.due <= now) {timers.delete(id); timer.callback();} render();},
    unmount() {
      for (const fiber of fibers.values()) fiber.hooks.forEach(hook => hook.cleanup?.());
      for (const node of nodes.values()) node.dom.isConnected = false;
      fibers.clear(); nodes.clear();
    },
  };
}
module.exports = {harness, walk};
