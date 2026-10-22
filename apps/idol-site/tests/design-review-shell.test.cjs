/* eslint-disable @typescript-eslint/no-require-imports */
// Component and hook contract checks; actual browser geometry is checked separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');

const root = path.resolve(process.env.DESIGN_REVIEW_SOURCE_ROOT || path.resolve(__dirname, '..'));
const overlay = path.resolve(process.env.DESIGN_REVIEW_OVERLAY_ROOT || root);
const req = createRequire(path.join(root, 'package.json'));
const React = req('react');
const ts = req('typescript');
const {renderToStaticMarkup} = req('react-dom/server');
const relative = 'components/design-review/review-shell.tsx';
const source = fs.readFileSync(path.join(overlay, relative), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
}).outputText;
const groups = [
  ['unis', 'UNIS'],
  ['kep1er', 'Kep1er'],
  ['triples-v2', 'tripleS · 候选 v2'],
  ['rescene-v1', 'RESCENE · 候选 v1'],
  ['purplekiss-v1', 'PURPLE KISS · 候选 v1'],
  ['sol15/udtt', 'UDTT · 未验收候选'],
  ['sol15/vcha', 'VCHA · 未验收候选'],
];
const sections = [['overview', '首页'], ['members', '成员'], ['works', '作品'], ['updates', '时间轴']];
const widths = [320, 390, 1440, 2560];

function load(react, ResizeObserver) {
  const exports = {};
  vm.runInNewContext('(function(require,exports){' + code + '\n})', {ResizeObserver}, {filename: relative})(name => {
    if (name === 'react') return react;
    if (name.endsWith('.css')) return {};
    return req(name);
  }, exports);
  return exports.default;
}
function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(node => nodes(node, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  return tree && typeof tree === 'object' ? text(tree.props?.children) : tree == null ? '' : String(tree);
}
function harness() {
  const slots = [], effects = [], observers = [];
  let index = 0;
  const Component = load({
    ...React,
    useState(initial) {
      const slot = index++;
      if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
      return [slots[slot], value => {slots[slot] = typeof value === 'function' ? value(slots[slot]) : value;}];
    },
    useRef(initial) {
      const slot = index++;
      if (!(slot in slots)) slots[slot] = {current: initial};
      return slots[slot];
    },
    useEffect(effect) {
      const slot = index++;
      if (!(slot in slots)) {slots[slot] = true; effects.push(effect);}
    },
  }, class {
    constructor(callback) {this.callback = callback; this.disconnected = false; observers.push(this);}
    observe(element) {this.element = element;}
    disconnect() {this.disconnected = true;}
  });
  const render = () => {index = 0; return Component();};
  const one = predicate => {
    const result = nodes(render(), predicate);
    assert.equal(result.length, 1);
    return result[0];
  };
  const select = (label, value) => {
    const wrapper = one(node => node.type === 'label' && text(node).startsWith(label));
    nodes(wrapper, node => node.type === 'select')[0].props.onChange({target: {value}});
  };
  const button = label => one(node => node.type === 'button' && text(node) === label);
  return {
    render, one, select, button, effects, observers,
    frame: () => one(node => node.type === 'iframe'),
    fit: checked => one(node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({target: {checked}}),
    mount(width) {
      const host = one(node => node.props.className === 'design-review-frame-host');
      host.props.ref.current = {clientWidth: width};
      const cleanup = effects[0]();
      return {element: host.props.ref.current, cleanup};
    },
  };
}

test('default preview and all accessible controls are preserved in server markup', () => {
  const html = renderToStaticMarkup(React.createElement(load(React)));
  assert.match(html, /<option value="unis" selected="">UNIS<\/option>/);
  assert.match(html, /<option value="overview" selected="">首页<\/option>/);
  assert.match(html, /title="UNIS 首页 390px 设计审阅" src="\/design-review\/unis" width="390" height="1000"/);
  assert.match(html, /type="checkbox" checked=""/);
  assert.match(html, /<label>团体<select/);
  assert.match(html, /<label>页面<select/);
  assert.match(html, /<legend>布局宽度<\/legend>/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /候选预览不代表正式页面已切换/);
  assert.doesNotMatch(html, /正式团体页面使用相同设计/);
  const options = nodes(harness().render(), node => node.type === 'option').map(node => [node.props.value, text(node)]);
  assert.deepEqual(options, [...groups, ...sections]);
  for (const [group] of groups) assert.ok(fs.existsSync(path.join(root, 'app/design-review', group, 'page.tsx')));
});

test('all seven previews and four sections use only the exact same-origin route', () => {
  const h = harness();
  for (const [group, name] of groups) for (const [section, label] of sections) {
    h.select('团体', group);
    h.select('页面', section);
    const expected = group === 'sol15/udtt' ? '/design-review/sol15/udtt' + ({overview:'',members:'#/udtt/members',works:'#/udtt/works',updates:'#/udtt/timeline'})[section] : group === 'sol15/vcha' ? '/design-review/sol15/vcha' + ({overview:'',members:'#/vcha/members',works:'#/vcha/works',updates:'#/vcha/timeline'})[section] : '/design-review/' + group + (section === 'overview' ? '' : '?section=' + section);
    const frame = h.frame();
    assert.equal(frame.props.src, expected);
    assert.equal(frame.props.title, `${name} ${label} 390px 设计审阅`);
    const link = h.one(node => node.type === 'a');
    assert.equal(link.props.href, expected);
    assert.equal(link.props.target, '_blank');
    assert.equal(link.props.rel, 'noopener noreferrer');
  }
  assert.equal(h.select('团体', 'unis'), undefined);
  h.select('页面', 'overview');
  assert.equal(h.frame().props.src, '/design-review/unis');
});

test('invalid selection values cannot create unbounded iframe paths or query strings', () => {
  const h = harness();
  h.select('团体', 'triples-v2');
  h.select('页面', 'members');
  const before = h.frame();
  for (const invalid of ['', '../', 'https://example.invalid', '//example.invalid', 'rescene', 'triples-v2?section=works', 'sol15/other', 'sol15/udtt?section=works', 'sol15/udtt#/foreign']) {
    h.select('团体', invalid);
    assert.equal(h.frame().props.src, before.props.src);
    assert.equal(h.frame().key, before.key);
  }
  for (const invalid of ['', 'records', 'works&member=unexpected', '../', 'updates#external']) {
    h.select('页面', invalid);
    assert.equal(h.frame().props.src, before.props.src);
    assert.equal(h.frame().key, before.key);
  }
});

test('all viewport widths retain true iframe dimensions while fit only scales the outer display', () => {
  const h = harness(), {cleanup} = h.mount(640);
  for (const [group] of groups) {
    h.select('团体', group);
    const key = h.frame().key;
    for (const width of widths) {
      h.button(`${width}px`).props.onClick();
      assert.equal(h.button(`${width}px`).props['aria-pressed'], true);
      for (const fit of [true, false]) {
        h.fit(fit);
        const frame = h.frame(), scale = fit ? Math.min(1, 640 / width) : 1;
        assert.equal(frame.props.width, width);
        assert.equal(frame.props.height, 1000);
        assert.equal(frame.props.style.width, width);
        assert.equal(frame.props.style.height, 1000);
        assert.equal(frame.props.style.maxWidth, 'none');
        assert.equal(frame.props.style.transform, `scale(${scale})`);
        assert.equal(frame.key, key, 'width and fit changes must not reload the iframe');
        const space = h.one(node => node.props.className === 'design-review-frame-space');
        assert.equal(space.props.style.width, width * scale);
        assert.equal(space.props.style.height, 1000 * scale);
      }
    }
  }
  cleanup();
});

test('reload can repeat while preserving the selected candidate, section, width, and fit', () => {
  const h = harness();
  h.select('团体', 'purplekiss-v1');
  h.select('页面', 'updates');
  h.button('2560px').props.onClick();
  h.fit(false);
  const source = h.frame().props.src;
  for (let revision = 1; revision <= 3; revision++) {
    h.button('重新载入').props.onClick();
    const frame = h.frame();
    assert.equal(frame.key, `purplekiss-v1:updates:${revision}`);
    assert.equal(frame.props.src, source);
    assert.equal(frame.props.width, 2560);
    assert.equal(frame.props.style.transform, 'scale(1)');
  }
});

test('host measurement responds to resize and disconnects when the shell is removed', () => {
  const h = harness(), {element, cleanup} = h.mount(640);
  h.button('1440px').props.onClick();
  assert.equal(h.observers.length, 1);
  assert.equal(h.observers[0].element, element);
  assert.equal(h.frame().props.style.transform, `scale(${640 / 1440})`);
  element.clientWidth = 720;
  h.observers[0].callback();
  assert.equal(h.frame().props.style.transform, 'scale(0.5)');
  assert.equal(h.frame().props.width, 1440);
  cleanup();
  assert.equal(h.observers[0].disconnected, true);
});
