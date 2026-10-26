// Isolated component hook-model tests. This is not DOM/browser QA.
// Run: node manage-flow.test.cjs /absolute/path/to/idol-studio-site [evidence-directory]
// All fetches, navigation, native input validity, and timers are mocked.
// This script never modifies the target repository or accesses the network.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const root = path.resolve(process.argv[2] || process.cwd());
const evidenceDir = process.argv[3] ? path.resolve(process.argv[3]) : null;
if (evidenceDir && (evidenceDir === root || evidenceDir.startsWith(root + path.sep))) {
  throw new Error('Evidence output must be outside the target repository.');
}
const ts = createRequire(path.join(root, 'package.json'))('typescript');
const source = fs.readFileSync(path.join(root, 'app/manage/page.tsx'), 'utf8');
const sourceHash = crypto.createHash('sha256').update(source).digest('hex');
const code = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
const text = n => Array.isArray(n) ? n.map(text).join('') : n && typeof n === 'object'
  ? text(n.props?.children) : n == null || typeof n === 'boolean' ? '' : String(n);
const walk = n => Array.isArray(n) ? n.flatMap(walk) : n && typeof n === 'object'
  ? [n, ...walk(n.props?.children)] : [];
const response = (data, status = 200) => ({
  ok: status < 400, status,
  headers: { get: () => 'application/json' },
  json: async () => structuredClone(data),
});
const base = {
  ready: true, recordId: 'recA', revision: 'a'.repeat(64), name: 'Member A',
  values: { cnName: '原名', country: ['legacy country'], birthDate: '2000-01-01', role: ['legacy role'], status: 'legacy status' },
  options: { country: ['current country'], role: ['current role'], status: ['current status'] },
};
const catalog = {
  groups: [{ id: 'g', name: 'Group' }],
  members: [
    { id: 'recA', name: 'Member A', stageName: 'Member A', cnName: '原名', groupIds: ['g'] },
    { id: 'recB', name: 'Member B', stageName: 'Member B', cnName: '', groupIds: ['g'] },
  ],
};

function createApp() {
  let current, timerId = 0;
  const timers = new Map(), requests = [], queue = [], events = new Map(), confirms = [];
  const ui = { dateValid: true, validityReports: 0, dateFocusCalls: 0, confirm: true };
  const jsx = (type, props, key) => ({ type, props: props || {}, key });
  class Runner {
    constructor(fn) { this.fn = fn; this.hooks = []; }
    render() {
      this.i = 0; this.effects = []; current = this; this.tree = this.fn();
      // Approximate React's ref attachment before passive effects. Native behavior
      // is intentionally controlled by the test, never claimed as browser-tested.
      for (const n of walk(this.tree)) {
        if (n.type === 'input' && n.props.ref) {
          n.props.ref.current = {
            checkValidity: () => ui.dateValid,
            reportValidity() { ui.validityReports++; return ui.dateValid; },
            focus() { if (!n.props.disabled) ui.dateFocusCalls++; },
          };
        }
      }
      for (const effect of this.effects) effect();
      return this.tree;
    }
  }
  const React = {
    useState(initial) {
      const r = current, i = r.i++;
      if (!r.hooks[i]) {
        const slot = { value: typeof initial === 'function' ? initial() : initial };
        slot.set = value => { slot.value = typeof value === 'function' ? value(slot.value) : value; };
        r.hooks[i] = slot;
      }
      return [r.hooks[i].value, r.hooks[i].set];
    },
    useRef(value) { const r = current, i = r.i++; return r.hooks[i] || (r.hooks[i] = { current: value }); },
    useMemo(fn, deps) {
      const r = current, i = r.i++, old = r.hooks[i];
      if (!old || !sameDeps(old.deps, deps)) r.hooks[i] = { deps, value: fn() };
      return r.hooks[i].value;
    },
    useEffect(fn, deps) {
      const r = current, i = r.i++, old = r.hooks[i];
      if (!old || !sameDeps(old.deps, deps)) {
        const slot = { deps, cleanup: old?.cleanup }; r.hooks[i] = slot;
        r.effects.push(() => { slot.cleanup?.(); slot.cleanup = fn(); });
      }
    },
  };
  const window = {
    location: { search: '' },
    confirm(message) { confirms.push(message); return ui.confirm; },
    addEventListener(name, fn) { events.set(name, fn); },
    removeEventListener(name, fn) { if (events.get(name) === fn) events.delete(name); },
  };
  const fetch = async (url, options = {}) => {
    requests.push({ url, ...options });
    if (url === '/api/catalog?shape=display-v1') return response(catalog);
    const next = queue.shift();
    if (!next) throw new Error('Unexpected mock request: ' + url);
    return typeof next === 'function' ? next(url, options) : next;
  };
  const exports = {};
  vm.runInNewContext('(function(require,exports){' + code + '})', {
    window, fetch, crypto, URLSearchParams, Date, AbortController,
    setTimeout(fn, ms) { timers.set(++timerId, { fn, ms }); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  })(name => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key });
    if (name === './manage.css') return {};
    throw new Error('Disallowed module: ' + name);
  }, exports);
  const runner = new Runner(exports.default);
  const render = () => runner.render();
  const settle = async () => {
    for (let i = 0; i < 4; i++) { render(); await new Promise(setImmediate); }
    render();
  };
  const find = predicate => walk(runner.tree).find(predicate);
  const button = label => find(n => n.type === 'button' && text(n) === label);
  const field = () => find(n => n.type === 'input' && n.props.maxLength === 200);
  const click = label => {
    const n = button(label); assert.ok(n, 'Missing button: ' + label);
    assert.ok(!n.props.disabled, 'Disabled button: ' + label);
    return n.props.onClick();
  };
  const posts = () => requests.filter(r => r.method === 'POST');
  async function selectReady() { queue.push(response(base)); await settle(); click('Member AGroup'); await settle(); }
  async function editName() { field().props.onChange({ target: { value: '我的修改' } }); await settle(); }
  async function timeoutSave() {
    queue.push((url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('mock aborted')));
    }));
    const saving = click('保存成员资料'); await settle();
    const timer = [...timers.values()].find(t => t.ms === 30000);
    assert.ok(timer, 'Save timeout timer must exist'); timer.fn();
    await saving; await settle();
  }
  return {
    runner, queue, requests, timers, events, confirms, ui, render, settle,
    find, button, field, click, posts, selectReady, editName, timeoutSave,
    get allText() { return text(runner.tree); },
  };
}

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

test('initial load interrupted by tabs recovers and fences the late response', async () => {
  const a = createApp(); let resolve;
  a.queue.push(() => new Promise(r => { resolve = r; }));
  await a.settle(); a.click('Member AGroup'); await a.settle();
  a.click('资料备份'); await a.settle();
  a.queue.push(response(base)); a.click('成员资料'); await a.settle();
  assert.equal(a.field().props.value, '原名');
  resolve(response({ ...base, values: { ...base.values, cnName: '过期响应' } }));
  await a.settle(); assert.equal(a.field().props.value, '原名');
});

test('paused refresh retains draft and cancellation leaves an independent recovery path', async () => {
  const a = createApp(); await a.selectReady(); await a.editName();
  a.queue.push(response({ error: 'STORAGE_CHANGING', message: '资料正在整理' }, 409));
  await a.click('保存成员资料'); await a.settle();
  a.queue.push(response({ ready: false })); await a.click('刷新资料并保留输入'); await a.settle();
  assert.equal(a.field().props.value, '我的修改'); assert.equal(a.field().props.disabled, true);
  a.click('取消修改'); await a.settle();
  assert.equal(a.field().props.value, '原名'); assert.equal(a.field().props.disabled, true);
  assert.ok(a.button('重新打开资料'));
  a.queue.push(response(base)); await a.click('重新打开资料'); await a.settle();
  assert.equal(a.field().props.disabled, false);
});

test('confirmed discard prevents late refresh from resurrecting the draft', async () => {
  const a = createApp(); await a.selectReady(); await a.editName(); let resolve;
  a.queue.push(response({ error: 'EDIT_CONFLICT', message: '冲突' }, 409));
  await a.click('保存成员资料'); await a.settle();
  a.queue.push(() => new Promise(r => { resolve = r; }));
  const loading = a.click('刷新资料并保留输入'); await a.settle();
  a.click('资料备份'); await a.settle();
  resolve(response({ ...base, revision: 'b'.repeat(64), values: { ...base.values, cnName: '其他修改' } }));
  await loading; await a.settle();
  a.queue.push(response(base)); a.click('成员资料'); await a.settle();
  assert.equal(a.field().props.value, '原名'); assert.doesNotMatch(a.allText, /有未保存修改/);
});

test('same-member selection preserves a healthy dirty draft without reloading', async () => {
  const a = createApp(); await a.selectReady(); await a.editName();
  const before = a.requests.length; a.click('Member AGroup'); await a.settle();
  assert.equal(a.requests.length, before); assert.equal(a.field().props.value, '我的修改');
});

test('timeout and source-transition retries preserve the exact operation until success', async () => {
  const a = createApp(); await a.selectReady(); await a.editName(); await a.timeoutSave();
  assert.equal(a.field().props.value, '我的修改'); assert.equal(a.field().props.disabled, true);
  assert.ok(a.button('核对上次保存'));
  a.queue.push(response({ error: 'STORAGE_CHANGING', message: '资料正在整理' }, 409));
  await a.click('核对上次保存'); await a.settle();
  assert.equal(a.field().props.disabled, true); assert.ok(a.button('核对上次保存'));
  a.queue.push(response({ saved: true, verified: true, revision: 'b'.repeat(64), values: { ...base.values, cnName: '我的修改' } }));
  await a.click('核对上次保存'); await a.settle();
  const posts = a.posts(); assert.equal(posts.length, 3);
  assert.equal(posts[0].body, posts[1].body); assert.equal(posts[0].body, posts[2].body);
  assert.equal(a.field().props.disabled, false); assert.match(a.allText, /已保存/);
});

test('conflict refresh keeps intentional changes and confirms overwriting updated values', async () => {
  const a = createApp(); await a.selectReady(); await a.editName();
  a.queue.push(response({ error: 'EDIT_CONFLICT', message: '冲突' }, 409));
  await a.click('保存成员资料'); await a.settle();
  const newer = { ...base, revision: 'b'.repeat(64), values: { ...base.values, cnName: '其他修改', birthDate: '2001-02-03' } };
  a.queue.push(response(newer)); await a.click('刷新资料并保留输入'); await a.settle();
  assert.equal(a.field().props.value, '我的修改');
  assert.equal(a.find(n => n.type === 'input' && n.props.type === 'date').props.value, '2001-02-03');
  assert.match(a.allText, /中文名当前保存为：其他修改/);
  a.queue.push(response({ saved: true, verified: true, revision: 'c'.repeat(64), values: { ...newer.values, cnName: '我的修改' } }));
  await a.click('保存成员资料'); await a.settle();
  assert.ok(a.confirms.some(s => s.includes('确认保留并保存')));
  const payload = JSON.parse(a.posts().at(-1).body);
  assert.equal(payload.revision, 'b'.repeat(64)); assert.deepEqual(payload.values, { cnName: '我的修改' });
});

test('native date validity failure reports an inline error and dispatches no save', async () => {
  const a = createApp(); await a.selectReady(); await a.editName();
  a.ui.dateValid = false;
  await a.click('保存成员资料'); await a.settle();
  assert.equal(a.posts().length, 0); assert.equal(a.ui.validityReports, 1);
  assert.match(a.allText, /请填写有效的完整日期/);
  assert.equal(a.field().props.disabled, false); assert.ok(a.ui.dateFocusCalls > 0);
  // Validating again must create the first operation, rather than replaying an
  // operation that should never have existed during native validation failure.
  a.ui.dateValid = true;
  a.queue.push(response({ saved: true, verified: true, revision: 'b'.repeat(64), values: { ...base.values, cnName: '我的修改' } }));
  await a.click('保存成员资料'); await a.settle(); assert.equal(a.posts().length, 1);
});

test('switching members clears the previous member date error', async () => {
  const a = createApp(); await a.selectReady(); await a.editName();
  a.ui.dateValid = false; await a.click('保存成员资料'); await a.settle();
  assert.match(a.allText, /请填写有效的完整日期/);
  a.ui.dateValid = true;
  a.queue.push(response({ ...base, recordId: 'recB', name: 'Member B', values: { ...base.values, cnName: '另一成员' } }));
  a.click('Member BGroup'); await a.settle();
  assert.equal(a.field().props.value, '另一成员'); assert.doesNotMatch(a.allText, /请填写有效的完整日期/);
  assert.equal(a.posts().length, 0);
});

test('unknown save outcome blocks member, tab, explicit-return and unload navigation', async () => {
  const a = createApp(); await a.selectReady(); await a.editName(); await a.timeoutSave();
  const count = a.requests.length;
  a.click('Member BGroup'); await a.settle();
  assert.equal(a.field().props.value, '我的修改'); assert.equal(a.requests.length, count);
  a.click('资料备份'); await a.settle();
  assert.ok(a.field()); assert.ok(a.button('核对上次保存')); assert.equal(a.requests.length, count);
  assert.equal(a.button('取消修改').props.disabled, true);
  let prevented = 0;
  a.find(n => n.type === 'a' && text(n) === '返回手帐').props.onClick({ preventDefault() { prevented++; } });
  await a.settle(); assert.equal(prevented, 1);
  assert.ok(a.events.get('beforeunload'));
  a.events.get('beforeunload')({ preventDefault() { prevented++; } });
  assert.equal(prevented, 2);
  assert.equal(a.posts().length, 1); assert.equal(a.confirms.length, 0);
});

(async () => {
  const results = [];
  for (const { name, fn } of cases) {
    try { await fn(); results.push({ name, passed: true }); console.log('PASS: ' + name); }
    catch (error) { results.push({ name, passed: false, error: String(error.stack || error) }); console.error('FAIL: ' + name + '\n' + error.stack); }
  }
  const report = {
    recordedAt: new Date().toISOString(), sourcePath: path.join(root, 'app/manage/page.tsx'),
    sourceSha256: sourceHash, total: results.length, passed: results.filter(r => r.passed).length,
    method: 'Actual TSX transpilation executed with a deterministic custom hook runner; all fetches and timers mocked in memory.',
    limitations: ['Not React DOM or browser QA', 'Native input validity is stubbed', 'No screenshots, layout, focus usability or browser Back verification', 'No real network or production writes'],
    results,
  };
  if (evidenceDir) {
    fs.mkdirSync(evidenceDir, { recursive: true });
    fs.writeFileSync(path.join(evidenceDir, 'manage-page.' + sourceHash + '.tsx'), source);
    fs.writeFileSync(path.join(evidenceDir, 'manage-flow-results.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log('\n' + report.passed + '/' + report.total + ' passed; source SHA256 ' + sourceHash);
  console.log('Isolated hook model only. No real DOM, network, repository changes, or production writes.');
  if (report.passed !== report.total) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
